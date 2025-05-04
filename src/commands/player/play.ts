import {
  Client,
  CommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";

import ytdl from "@distube/ytdl-core";
import { Track } from "@/@types/types";
import { queueManager } from "@/lib/discord/player/queueManager";
import { formatDuration } from "@/lib/utils/format-duration";
import { trackEmbed } from "@/lib/discord/embeds/track-embed";
import { createPlayerButtons } from "@/lib/discord/components/create-button-custom";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Toca uma música no canal de voz")
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("URL do YouTube da música")
      .setRequired(true)
  );

export const execute = async (
  client: Client,
  interaction: CommandInteraction
) => {
  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores.",
      ephemeral: true,
    });
  }

  const member = (await interaction.guild.members.fetch(
    interaction.user.id
  )) as GuildMember;

  if (!member.voice.channel) {
    return interaction.reply({
      content: "❌ Você precisa estar conectado a um canal de voz!",
      ephemeral: true,
    });
  }

  const url = interaction.options.get("url", true).value as string;

  if (!ytdl.validateURL(url)) {
    return interaction.reply({
      content: "❌ URL do YouTube inválida!",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const info = await ytdl.getInfo(url);
  const track: Track = {
    url: info.videoDetails.video_url,
    title: info.videoDetails.title,
    duration: formatDuration(info.videoDetails.lengthSeconds),
    thumbnail: info.videoDetails.thumbnails[0].url,
    requestedBy: interaction.user.username,
  };

  const isFirstTrack = await queueManager.addTrackToQueue(
    interaction.guild.id,
    member.voice.channel,
    track
  );

  const position = isFirstTrack ? "🎵 Em reprodução" : "📝 Adicionado à fila";

  const queueEmbed = trackEmbed(
    interaction,
    track.title,
    track.url,
    track.thumbnail,
    track.duration,
    position,
    track.requestedBy
  );

  await interaction.editReply({
    embeds: [queueEmbed],
    components: createPlayerButtons(interaction.guild.id),
  });
};
