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
  private guildQueues = new Map<string, GuildQueue>();
  private history = new Map<string, Track[]>();

  public getQueue = (guildId: string) => this.guildQueues.get(guildId);

  public isPlaying = (guildId: string) =>
    this.getQueue(guildId)?.isPlaying ?? false;

  public async addTrackToQueue(
    guildId: string,
    voiceChannel: VoiceBasedChannel,
    track: Track
  ): Promise<boolean> {
    let queue = this.guildQueues.get(guildId);
    const isFirstTrack = !queue;

    if (!queue) {
      const connection = await this.connectToVoiceChannel(
        guildId,
        voiceChannel
      );
      const player = createAudioPlayer();

      queue = {
        connection,
        player,
        voiceChannel,
        currentTrack: null,
        queue: [],
        isPlaying: false,
      };

      this.guildQueues.set(guildId, queue);

      // Initialize history for this guild
      if (!this.history.has(guildId)) {
        this.history.set(guildId, []);
      }

      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => this.playNextTrack(guildId));
    }

    queue.queue.push(track);

    if (!queue.isPlaying) this.playNextTrack(guildId);

    return isFirstTrack;
  }

  public playNextTrack(guildId: string) {
    const queue = this.guildQueues.get(guildId);
    if (!queue) return;

    // Add current track to history before playing next
    if (queue.currentTrack) {
      const history = this.history.get(guildId) || [];
      history.push(queue.currentTrack);

      // Keep only the last 10 tracks in history to avoid memory issues
      if (history.length > 10) {
        history.shift();
      }

      this.history.set(guildId, history);
    }

    const nextTrack = queue.queue.shift();

    if (!nextTrack) {
      queue.currentTrack = null;
      queue.isPlaying = false;
      queue.connection.destroy();
      this.guildQueues.delete(guildId);
      this.history.delete(guildId);
      return;
    }

    queue.currentTrack = nextTrack;
    queue.isPlaying = true;

    const resource = createAudioResource(this.createAudioStream(nextTrack));
    queue.player.play(resource);
  }

  public playPreviousTrack(guildId: string): boolean {
    const queue = this.guildQueues.get(guildId);
    const history = this.history.get(guildId);

    if (!queue || !history || history.length === 0) {
      return false;
    }

    // Get the last track from history
    const previousTrack = history.pop();

    // If somehow we don't have a valid track, return false
    if (!previousTrack) {
      return false;
    }

    // Add current track to the front of the queue if it exists
    if (queue.currentTrack) {
      queue.queue.unshift(queue.currentTrack);
    }

    // Set the previous track as current and play it
    queue.currentTrack = previousTrack;
    queue.isPlaying = true;

    const resource = createAudioResource(this.createAudioStream(previousTrack));
    queue.player.play(resource);

    return true;
  }

  public togglePause(guildId: string): boolean {
    const queue = this.guildQueues.get(guildId);
    if (!queue) return false;

    const status = queue.player.state.status;

    if (status === AudioPlayerStatus.Playing) {
      queue.player.pause();
      queue.isPlaying = false;
      return false;
    }

    if (status === AudioPlayerStatus.Paused) {
      queue.player.unpause();
      queue.isPlaying = true;
      return true;
    }

    return queue.isPlaying;
  }

  private async connectToVoiceChannel(
    guildId: string,
    voiceChannel: VoiceBasedChannel
  ) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    return await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
  }

  private createAudioStream(track: Track) {
    return ytdl(track.url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });
  }
}

export const queueManager = new QueueManager();
