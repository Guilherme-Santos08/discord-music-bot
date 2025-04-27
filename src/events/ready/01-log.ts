import { Client } from "discord.js";

const onLogin = (client: Client): void => {
  console.log(`✅ Conectado como ${client.user?.tag}`);
};

export default onLogin;
