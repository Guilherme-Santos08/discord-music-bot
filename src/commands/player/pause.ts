import {
  Client,
  CommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";
import { queueManager } from "@/lib/discord/player/queueManager";

export const data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pausa a música que está tocando atualmente");

export const execute = async (
  client: Client,
  interaction: CommandInteraction
) => {
  const guild = interaction.guild;

  if (!guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores.",
      ephemeral: true,
    });
  }

  const member = (await guild.members.fetch(
    interaction.user.id
  )) as GuildMember;

  if (!member.voice.channel) {
    return interaction.reply({
      content: "❌ Você precisa estar conectado a um canal de voz!",
      ephemeral: true,
    });
  }

  const queue = queueManager.getQueue(guild.id);

  if (!queue || !queue.currentTrack) {
    return interaction.reply({
      content: "❌ Não há nenhuma música tocando no momento!",
      ephemeral: true,
    });
  }

  const isPlaying = queueManager.togglePause(guild.id);

  // Since we're pausing, isPlaying should be false after the toggle
  if (isPlaying) {
    return interaction.reply({
      content: "⚠️ A música já está pausada! Use `/resume` para continuar.",
      ephemeral: true,
    });
  }

  return interaction.reply({
    content: "⏸️ Música pausada!",
  });
};
