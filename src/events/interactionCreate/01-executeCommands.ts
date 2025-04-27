import type { Client, Interaction } from "discord.js";

// Execute slash commands
export default async function handleInteraction(
  client: Client,
  interaction: Interaction
) {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`No command matching "${interaction.commandName}"`);
    return;
  }

  try {
    console.log(`Executing ${interaction.commandName}`);
    await command.execute(client, interaction);
  } catch (err) {
    console.error(`[${interaction.commandName}] execution error:`, err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Ocorreu um erro ao executar este comando!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Ocorreu um erro ao executar este comando!",
        ephemeral: true,
      });
    }
  }
}
