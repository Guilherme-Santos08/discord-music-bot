import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Creates pagination buttons for queue navigation
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @returns An array of ActionRowBuilder with navigation buttons or empty array if only one page
 */
export function createQueueButtons(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [];
  }

  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("queue_prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1),
      new ButtonBuilder()
        .setCustomId("queue_next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages)
    ),
  ];
}
