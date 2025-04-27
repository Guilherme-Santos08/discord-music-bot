import fs from "fs";
import path from "path";
import {
  Client,
  Collection,
  SlashCommandBuilder,
  CommandInteraction,
} from "discord.js";

export interface CommandModule {
  data: SlashCommandBuilder;
  execute: (client: Client, interaction: CommandInteraction) => Promise<void>;
}

export default async function registerCommands(client: Client) {
  client.commands = new Collection<string, CommandModule>();

  // Load & cache every command under src/commands/<group>/*.ts

  const commandsRoot = path.join(__dirname, "..", "..", "commands");
  const groups = fs
    .readdirSync(commandsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  let total = 0;

  for (const group of groups) {
    const groupPath = path.join(commandsRoot, group);
    const files = fs
      .readdirSync(groupPath)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const filePath = path.join(groupPath, file);
      const mod = require(filePath) as Partial<CommandModule>;

      if (!mod.data || typeof mod.execute !== "function") {
        console.warn(
          `[registerCommands] skipping ${group}/${file}: missing data or execute`
        );

        continue;
      }

      client.commands.set(mod.data.name, {
        data: mod.data,
        execute: mod.execute,
      });
      total++;
      console.log(
        `✅ Comando carregado "${mod.data.name}" de ${group}/${file}`
      );
    }
  }

  console.log(`✅ ${total} comando(s) carregado(s) em client.commands`);

  // bulk overwrite to Discord
  if (!client.application) {
    console.warn(
      "client.application está indefinido; você está chamando isso antes de `ready`?"
    );
  } else {
    const payload = client.commands.map((cmd) => cmd.data.toJSON());
    await client.application.commands.set(payload);

    console.log(
      `🚀 ${payload.length} comando(s) de slash carregado(s) no Discord`
    );
  }
}
