import {
  Client,
  CommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";
import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioPlayerStatus,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

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

  const voiceChannel = member.voice.channel;
  const url = interaction.options.get("url", true).value as string;

  if (!ytdl.validateURL(url)) {
    return interaction.reply({
      content: "❌ URL do YouTube inválida!",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  connection.subscribe(player);

  const stream = ytdl(url, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  });

  const resource = createAudioResource(stream);

  player.play(resource);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });

  const info = await ytdl.getInfo(url);
  await interaction.editReply({
    content: `🎵 Tocando: **${info.videoDetails.title}** no canal **${voiceChannel.name}**!`,
  });
};
