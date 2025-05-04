import { EmbedBuilder, APIEmbed } from "discord.js";
import { GuildQueue } from "@/@types/types";
import { truncateText } from "@/lib/utils/truncate-text";

const MAX_TRACKS_PER_PAGE = 10;
const MAX_TITLE_LENGTH = 50;

export const generateQueueEmbed = (
  queue: GuildQueue,
  page: number = 1
): { embed: APIEmbed; totalPages: number } => {
  const currentTrack = queue.currentTrack;
  const tracks = queue.queue;

  const totalPages = Math.ceil(tracks.length / MAX_TRACKS_PER_PAGE) || 1;
  const start = (page - 1) * MAX_TRACKS_PER_PAGE;
  const end = start + MAX_TRACKS_PER_PAGE;
  const tracksOnPage = tracks.slice(start, end);

  const embed = new EmbedBuilder()
    .setTitle("📜 Fila de Músicas")
    .setColor(0x1db954);

  if (currentTrack) {
    embed.addFields({
      name: "🎶 Tocando agora",
      value: `[${truncateText(currentTrack.title, MAX_TITLE_LENGTH)}](${
        currentTrack.url
      }) (por ${currentTrack.requestedBy})`,
    });
  }

  if (tracksOnPage.length > 0) {
    embed.addFields({
      name: "🎧 Próximas",
      value: tracksOnPage
        .map(
          (track, i) =>
            `\`${start + i + 1}.\` [${truncateText(
              track.title,
              MAX_TITLE_LENGTH
            )}](${track.url}) (por ${track.requestedBy})`
        )
        .join("\n"),
    });
  } else {
    embed.addFields({ name: "🎧 Próximas", value: "Nenhuma música na fila." });
  }

  embed.setFooter({
    text: `Página ${page} de ${totalPages}`,
  });

  return { embed: embed.toJSON(), totalPages };
};
