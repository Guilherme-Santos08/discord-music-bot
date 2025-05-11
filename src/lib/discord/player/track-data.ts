import ytdl from "@distube/ytdl-core";
import { Track } from "@/@types/types";
import { formatDuration } from "@/lib/utils/format-duration";

export const getTrackData = async (
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
