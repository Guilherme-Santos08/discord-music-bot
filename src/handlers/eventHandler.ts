import fs from "fs";
import path from "path";
import type { Client, ClientEvents } from "discord.js";

type HandlerFn = (client: Client, ...args: any[]) => Promise<void> | void;

// Event Handler assumes directory structure as
// src/events/
// ├── ready/
// │   ├── 01-log.ts
// │   └── 02-registerCommands.ts
// └── interactionCreate/
//     └── handleInteraction.ts

export default function registerEvents(client: Client) {
  const eventsRoot = path.join(__dirname, "..", "events");

  // Find sub-folders (one per event name)
  const eventFolders = fs
    .readdirSync(eventsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  for (const folder of eventFolders) {
    const folderPath = path.join(eventsRoot, folder);

    // Cache all handler files to avoid dynamic imports on every event
    const handlers: HandlerFn[] = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => {
        const mod = require(path.join(folderPath, file));
        if (typeof mod.default !== "function") {
          throw new Error(
            `Manipulador de evento "${file}" em "${folder}" não tem exportação padrão`
          );
        }
        return mod.default as HandlerFn;
      });

    console.log(
      `✅ Registrado e cacheado ${handlers.length} manipulador(es) para o evento "${folder}".`
    );

    const listener = (...args: any[]) => {
      void Promise.all(
        handlers.map((fn) =>
          Promise.resolve(fn(client, ...args)).catch((err) =>
            console.error(`[${folder}] erro do manipulador:`, err)
          )
        )
      );
    };

    client.on(folder as keyof ClientEvents, listener);
  }

  console.log(`✅ Total grupos de eventos carregados: ${eventFolders.length}`);
}
