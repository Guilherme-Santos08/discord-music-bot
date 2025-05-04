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
  const guild = interaction.guild;
  const url = interaction.options.get("url", true).value as string;

  if (!guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores.",
      ephemeral: true,
    });
  }

  const member = (await guild.members.fetch(
    interaction.user.id
  )) as GuildMember;

  if (!member.voice.channel) {
    return interaction.reply({
      content: "❌ Você precisa estar conectado a um canal de voz!",
      ephemeral: true,
    });
  }

  if (!ytdl.validateURL(url)) {
    return interaction.reply({
      content: "❌ URL do YouTube inválida!",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const track = await getTrackData(url, interaction.user.username);

  const isFirstTrack = await queueManager.addTrackToQueue(
    guild.id,
    member.voice.channel,
    track
  );

  const embed = trackEmbed(
    interaction,
    track.title,
    track.url,
    track.thumbnail,
    track.duration,
    isFirstTrack ? "🎵 Em reprodução" : "📝 Adicionado à fila",
    track.requestedBy
  );

  await interaction.editReply({
    embeds: [embed],
    components: createPlayerButtons(guild.id),
  });
};

const getTrackData = async (
  url: string,
  requestedBy: string
): Promise<Track> => {
  const info = await ytdl.getInfo(url);
  return {
    url: info.videoDetails.video_url,
    title: info.videoDetails.title,
    duration: formatDuration(info.videoDetails.lengthSeconds),
    thumbnail: info.videoDetails.thumbnails[0].url,
    requestedBy,
  };
};
