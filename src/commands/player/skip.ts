import {
  Client,
  CommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";
import { queueManager } from "@/lib/discord/player/queueManager";

export const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Pula para a próxima música na fila");

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

  if (queue.queue.length === 0) {
    return interaction.reply({
      content: "⚠️ Não há próximas músicas na fila!",
      ephemeral: true,
    });
  }

  // Store current track information before skipping
  const currentTrack = queue.currentTrack;

  // Skip to next track
  queueManager.playNextTrack(guild.id);

  return interaction.reply({
    content: `⏩ Pulou **${currentTrack.title}**! Tocando a próxima música na fila.`,
  });
};
