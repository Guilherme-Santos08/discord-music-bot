import { Guild, GuildMember, CommandInteraction } from "discord.js";
import { queueManager } from "@/lib/discord/player/queueManager";
import { getPlaylistTracks } from "@/lib/discord/player/get-playlist-tracks";
import { Track } from "@/@types/types";
import { trackEmbed } from "@/lib/discord/embeds/track-embed";
import { createPlayerButtons } from "@/lib/discord/components/create-button-custom";

export async function playPlaylist(
  guild: Guild,
  member: GuildMember,
  url: string,
  interaction: CommandInteraction
) {
  await interaction.deferReply();

  const tracks = await getPlaylistTracks(url, interaction.user.username);
  if (!tracks.length) {
    return interaction.editReply({
      content: "❌ Não foi possível carregar a playlist ou ela está vazia.",
    });
  }

  let firstTrack: Track | null = null;
  let isFirstTrack = false;
  for (let i = 0; i < tracks.length; i++) {
    const addedFirst = await queueManager.addTrackToQueue(
      guild.id,
      member.voice.channel!,
      tracks[i]
    );
    if (i === 0) {
      firstTrack = tracks[i];
      isFirstTrack = addedFirst;
    }
  }

  const embed = trackEmbed(
    interaction,
    firstTrack!.title,
    firstTrack!.url,
    firstTrack!.thumbnail,
    firstTrack!.duration,
    isFirstTrack ? "🎵 Em reprodução" : "📝 Adicionado à fila",
    firstTrack!.requestedBy
  );

  await interaction.editReply({
    content: `✅ Playlist adicionada: ${tracks.length} músicas!`,
    embeds: [embed],
    components: createPlayerButtons(guild.id),
  });
}
