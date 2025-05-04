import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const createButtonCustomId = (
  action: "back" | "pause" | "skip",
  guildId: string
) => {
  return `play:${action}:${guildId}`;
};

export const createPlayerButtons = (
  guildId: string,
  isPlaying: boolean = true
) => {
  const pauseButton = new ButtonBuilder()
    .setCustomId(createButtonCustomId("pause", guildId))
    .setLabel(isPlaying ? "⏸️ Pausar" : "▶️ Play")
    .setStyle(ButtonStyle.Secondary);

  const skipButton = new ButtonBuilder()
    .setCustomId(createButtonCustomId("skip", guildId))
    .setLabel("⏩ Skip")
    .setStyle(ButtonStyle.Primary);

  const backButton = new ButtonBuilder()
    .setCustomId(createButtonCustomId("back", guildId))
    .setLabel("⏮ Voltar")
    .setStyle(ButtonStyle.Primary);

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    backButton,
    pauseButton,
    skipButton
  );

  return [actionRow];
};
