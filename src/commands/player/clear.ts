import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { queueManager } from "@/lib/discord/player/queueManager";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Limpa todas as músicas da fila");

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

  const cleared = queueManager.clearQueue(guild.id);

  if (cleared) {
    await interaction.reply("✅ Fila limpa com sucesso!");
  } else {
    await interaction.reply({
      content: "❌ Não há fila para limpar.",
      ephemeral: true,
    });
  }
};
