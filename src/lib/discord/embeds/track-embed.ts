import { truncateText } from "@/lib/utils/truncate-text";
import { CommandInteraction, EmbedBuilder } from "discord.js";

const MAX_TITLE_LENGTH = 50;

export const trackEmbed = (
  interaction: CommandInteraction,
  title: string,
  url: string,
  thumbnail: string,
  duration: string,
  position: string,
  requestedBy: string
) =>
  new EmbedBuilder()
    .setColor("#2b2d31") // tom neutro escuro, similar ao fundo da imagem
    .setTitle(` ${position}`)
    .addFields(
      {
        name: "Música",
        value: `[${truncateText(title, MAX_TITLE_LENGTH)}](${url})`, // insira o link real
      },
      {
        name: "Duração",
        value: duration,
        inline: true,
      },
      {
        name: "Posição na fila",
        value: position,
        inline: true,
      }
    )
    .setThumbnail(thumbnail) // use o nome real se for um buffer
    .setFooter({
      text: `Solicitado por ${requestedBy}`,
      iconURL: interaction.user.displayAvatarURL(),
    });
