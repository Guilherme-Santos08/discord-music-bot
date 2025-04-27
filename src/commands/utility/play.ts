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
import path from "path";
import fs from "fs";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Toca uma música no canal de voz");

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

  await interaction.deferReply();

  try {
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

    const audioFilePath = path.resolve("audio.mp3");

    if (!fs.existsSync(audioFilePath)) {
      return interaction.editReply({
        content: "❌ Arquivo de áudio não encontrado no servidor.",
      });
    }

    const resource = createAudioResource(audioFilePath);

    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.editReply({
      content: `🎵 Tocando áudio: **audio.mp3** no canal **${voiceChannel.name}**!`,
    });
  } catch (error) {
    console.error("Erro ao tentar tocar música:", error);

    return interaction.editReply({
      content:
        "❌ Ocorreu um erro ao tentar tocar a música. Verifique se o bot tem todas as permissões e tente novamente.",
    });
  }
};
