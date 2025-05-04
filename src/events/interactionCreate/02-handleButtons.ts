import type { Client, Interaction } from "discord.js";
import { queueManager } from "@/lib/discord/player/queueManager";
import { createPlayerButtons } from "@/lib/discord/components/create-button-custom";

// Handle music player button interactions
export default async function handleButtonInteraction(
  client: Client,
  interaction: Interaction
) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  // Check if this is a player button
  if (!customId.startsWith("play:")) return;

  // Extract action and guildId from customId
  const [prefix, action, guildId] = customId.split(":");

  if (!guildId || guildId !== interaction.guildId) return;

  await interaction.deferUpdate();

  switch (action) {
    case "pause":
      // Toggle pause state
      const isPlaying = queueManager.togglePause(guildId);

      // Update the buttons to reflect the new state
      await interaction.editReply({
        components: createPlayerButtons(guildId, isPlaying),
      });
      break;

    case "skip":
      // Skip to next track
      queueManager.playNextTrack(guildId);
      break;

    case "back":
      // Play the previous track from history
      const success = queueManager.playPreviousTrack(guildId);

      if (!success) {
        await interaction.followUp({
          content: "⚠️ Não há músicas anteriores para reproduzir.",
          ephemeral: true,
        });
      }
      break;

    default:
      break;
  }
}
