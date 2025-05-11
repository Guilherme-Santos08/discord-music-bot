import ytdl from "@distube/ytdl-core";
import { Track } from "@/@types/types";
import { formatDuration } from "../../utils/format-duration";

/**
 * Extrai todas as faixas de uma playlist do YouTube e retorna como array de Track.
 * @param playlistUrl URL da playlist do YouTube
 * @param requestedBy Nome do usuário que solicitou
 */
export async function getPlaylistTracks(
  playlistUrl: string,
  requestedBy: string
): Promise<Track[]> {
  // Extrai o parâmetro 'list' da URL
  const listMatch = playlistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (!listMatch) return [];
  const listId = listMatch[1];

  // Busca a página da playlist
  const res = await fetch(`https://www.youtube.com/playlist?list=${listId}`);
  const html = await res.text();

  // Regex para extrair os videoIds da playlist
  const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  const ids = Array.from(html.matchAll(videoIdRegex)).map((m) => m[1]);
  // Remove duplicatas preservando ordem
  const uniqueIds = [...new Set(ids)];

  // Limita para evitar flood (exemplo: 50 primeiras faixas)
  const limitedIds = uniqueIds.slice(0, 50);

  // Para cada vídeo, busca os dados usando ytdl.getInfo
  const tracks: Track[] = [];
  for (const videoId of limitedIds) {
    try {
      const info = await ytdl.getInfo(
        `https://www.youtube.com/watch?v=${videoId}`
      );
      tracks.push({
        url: info.videoDetails.video_url,
        title: info.videoDetails.title,
        duration: formatDuration(info.videoDetails.lengthSeconds),
        thumbnail: info.videoDetails.thumbnails[0].url,
        requestedBy,
      });
    } catch {
      // Ignora vídeos privados/removidos
      continue;
    }
  }
  return tracks;
}
