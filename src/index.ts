import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import eventHandler from "./handlers/eventHandler";

dotenv.config();

// Cria  instância do cliente do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

(async () => {
  try {
    eventHandler(client);
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    process.exit(1);
  }
})();
