import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";

export type Track = {
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  requestedBy: string;
};

export type GuildQueue = {
  connection: VoiceConnection;
  player: AudioPlayer;
  voiceChannel: VoiceBasedChannel;
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
};
