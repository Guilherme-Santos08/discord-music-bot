import { Guild, GuildMember, CommandInteraction } from "discord.js";
import ytdl from "@distube/ytdl-core";
import { queueManager } from "@/lib/discord/player/queueManager";
import { trackEmbed } from "@/lib/discord/embeds/track-embed";
import { createPlayerButtons } from "@/lib/discord/components/create-button-custom";
import { getTrackData } from "./track-data";

export async function playSingleTrack(
  guild: Guild,
  member: GuildMember,
  url: string,
  interaction: CommandInteraction
) {
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
    member.voice.channel!,
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
}
