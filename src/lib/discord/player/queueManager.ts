import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import { VoiceBasedChannel } from "discord.js";
import { GuildQueue, Track } from "@/@types/types";

class QueueManager {
  private guildQueue: Map<string, GuildQueue>;

  constructor() {
    this.guildQueue = new Map<string, GuildQueue>();
  }

  public getQueue(guildId: string) {
    return this.guildQueue.get(guildId);
  }

  public isPlaying(guildId: string): boolean {
    const queue = this.guildQueue.get(guildId);
    return queue?.isPlaying || false;
  }

  public async addTrackToQueue(
    guildId: string,
    voiceChannel: VoiceBasedChannel,
    track: Track
  ) {
    const existingQueue = this.guildQueue.get(guildId);
    const isFirstTrack = !existingQueue;

    const queue =
      existingQueue ?? (await this.createQueue(guildId, voiceChannel));

    queue.queue.push(track);

    if (!queue.isPlaying) {
      this.playNextTrack(guildId);
    }

    return isFirstTrack;
  }

  public playNextTrack(guildId: string) {
    const queue = this.guildQueue.get(guildId);

    if (!queue) return;

    const nextTrack = queue.queue.shift();
    if (!nextTrack) {
      queue.currentTrack = null;
      return;
    }

    const stream = ytdl(nextTrack.url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    queue.currentTrack = nextTrack;
    queue.isPlaying = true;
    queue.player.play(resource);
  }

  public togglePause(guildId: string): boolean {
    const queue = this.guildQueue.get(guildId);

    if (!queue) return false;

    if (queue.player.state.status === AudioPlayerStatus.Playing) {
      queue.player.pause();
      queue.isPlaying = false;
      return false;
    }

    if (queue.player.state.status === AudioPlayerStatus.Paused) {
      queue.player.unpause();
      queue.isPlaying = true;
      return true;
    }

    return queue.isPlaying;
  }

  private async createQueue(guildId: string, voiceChannel: VoiceBasedChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    const player = this.createAudioPlayer(guildId);

    connection.subscribe(player);

    const queue: GuildQueue = {
      connection,
      player,
      voiceChannel,
      currentTrack: null,
      queue: [],
      isPlaying: false,
    };

    this.guildQueue.set(guildId, queue);

    return queue;
  }

  private createAudioPlayer(guildId: string) {
    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => {
      this.playNextTrack(guildId);
    });

    return player;
  }
}

export const queueManager = new QueueManager();
