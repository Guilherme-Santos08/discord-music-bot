import {
  SlashCommandBuilder,
  CommandInteraction,
  ComponentType,
  Client,
  ButtonInteraction,
} from "discord.js";
import { queueManager } from "@/lib/discord/player/queueManager";
import { generateQueueEmbed } from "@/lib/discord/embeds/generated-queue-embed";
import { createQueueButtons } from "@/lib/discord/components/queue-buttons";

export const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Mostra a fila atual de músicas");

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

  const guildId = interaction.guild.id;
  const queue = queueManager.getQueue(guildId);

  // Add better queue validation
  if (!queue) {
    return interaction.reply({
      content: "📭 A fila está vazia.",
      ephemeral: true,
    });
  }

  // Ensure queue.queue is defined and handle empty queue more explicitly
  if (!Array.isArray(queue.queue)) {
    return interaction.reply({
      content: "❌ Erro ao carregar a fila. Tente novamente.",
      ephemeral: true,
    });
  }

  if (!queue.currentTrack && queue.queue.length === 0) {
    return interaction.reply({
      content: "📭 A fila está vazia.",
      ephemeral: true,
    });
  }

  try {
    let currentPage = 1;
    const { embed, totalPages } = generateQueueEmbed(queue, currentPage);

    const reply = await interaction.reply({
      embeds: [embed],
      components: createQueueButtons(currentPage, totalPages),
      fetchReply: true,
    });

    if (totalPages <= 1) return;

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    collector.on("collect", async (btn: ButtonInteraction) => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({
          content: "❌ Apenas quem usou o comando pode navegar pela fila.",
          ephemeral: true,
        });
      }

      await btn.deferUpdate();
      collector.resetTimer();

      if (btn.customId === "queue_prev") {
        currentPage = Math.max(currentPage - 1, 1);
      }

      if (btn.customId === "queue_next") {
        currentPage = Math.min(currentPage + 1, totalPages);
      }

      const { embed: updatedEmbed } = generateQueueEmbed(queue, currentPage);

      await interaction.editReply({
        embeds: [updatedEmbed],
        components: createQueueButtons(currentPage, totalPages),
      });
    });

    collector.on("end", async () => {
      await interaction.editReply({ components: [] }).catch(() => {});
    });
  } catch (error) {
    console.error("Erro ao exibir fila:", error);
    return interaction.reply({
      content: "❌ Ocorreu um erro ao exibir a fila. Tente novamente.",
      ephemeral: true,
    });
  }
};
