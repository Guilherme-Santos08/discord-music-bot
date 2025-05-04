import {
  SlashCommandBuilder,
  Client,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Mostra informações de latência do bot");

export async function execute(client: Client, interaction: CommandInteraction) {
  const sent = await interaction.deferReply();
  await sent.fetch();
  const restLatency = sent.createdTimestamp - interaction.createdTimestamp;

  const wsLatency = Math.round(client.ws.ping);

  const shardId = client.shard?.ids[0] ?? 1;

  const embed = new EmbedBuilder()
    .setColor(0x7289da)
    .setTitle(`Cluster ${shardId}`)
    .setDescription(
      `Latência Discord REST: **${restLatency}** ms\n` +
        `Latência Discord Gateway (WS): **${wsLatency}** ms (Shard ${shardId})\n`
      // `Tempo de resposta do banco de dados: **${dbResponseTime}** ms`
    )
    .setFooter({
      text: `${
        client.user?.username
      } v1.0.0 | /help • ${new Date().toLocaleTimeString("pt-BR")}`,
      iconURL: client.user?.displayAvatarURL(),
    });

  await interaction.editReply({ embeds: [embed] });
}
