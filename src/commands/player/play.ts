import {
  Client,
  CommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";
import { isPlaylistUrl } from "@/lib/utils/is-playlist-url";
import { playSingleTrack } from "@/lib/discord/player/play-single-track";
import { playPlaylist } from "@/lib/discord/player/play-playlist";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Toca uma música no canal de voz")
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("URL do YouTube da música")
      .setRequired(true)
  );

export const execute = async (
  client: Client,
  interaction: CommandInteraction
) => {
  const guild = interaction.guild;
  const url = interaction.options.get("url", true).value as string;

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

  // Verifica se o BOT tem permissão para entrar no canal de voz
  const botMember = guild.members.me;
  const voiceChannel = member.voice.channel;
  if (!botMember || !voiceChannel.permissionsFor(botMember).has("Connect")) {
    return interaction.reply({
      content:
        "❌ O bot não tem permissão ou cargo suficiente para entrar neste canal de voz! Verifique as permissões e cargos do canal.",
      ephemeral: true,
    });
  }

  if (isPlaylistUrl(url)) {
    return playPlaylist(guild, member, url, interaction);
  } else {
    return playSingleTrack(guild, member, url, interaction);
  }
};
