# Discord Music Bot

Um bot de música para Discord, desenvolvido em TypeScript, que permite tocar músicas do YouTube diretamente em canais de voz. O bot oferece comandos para tocar, pausar, retomar, pular, voltar e visualizar a fila de músicas, além de comandos utilitários como `/ping` para checar a latência.

## Funcionalidades

- Tocar músicas e playlists do YouTube em canais de voz
- Gerenciar fila de reprodução (adicionar, pular, voltar, pausar, retomar)
- Visualizar a fila de músicas com paginação
- Comando de latência para monitorar o desempenho do bot

## Instalação

### Pré-requisitos

- Node.js (recomendado v18+)
- pnpm (ou npm/yarn)
- FFmpeg instalado e disponível no PATH
- Um bot registrado no Discord e o token correspondente

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/discord-music-bot.git
   cd discord-music-bot
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   # ou
   npm install
   # ou
   yarn install
   ```

3. Crie um arquivo `.env` na raiz do projeto e adicione:
   ```env
   DISCORD_TOKEN=seu_token_aqui
   ```

## Variáveis de Ambiente

- `DISCORD_TOKEN`: **Obrigatória**. Token do seu bot do Discord.

## Como usar

### Desenvolvimento

Para rodar em modo desenvolvimento (hot reload com TSX):

```bash
pnpm dev
# ou
npm run dev
# ou
yarn dev
```

### Produção

1. Gere o build:
   ```bash
   pnpm build
   # ou
   npm run build
   # ou
   yarn build
   ```

2. Inicie o bot:
   ```bash
   pnpm start
   # ou
   npm start
   # ou
   yarn start
   ```

## Comandos Disponíveis

### Player

- `/play <url>` — Toca uma música ou playlist do YouTube no canal de voz.
- `/pause` — Pausa a música atual.
- `/resume` — Retoma a música pausada.
- `/skip` — Pula para a próxima música da fila.
- `/prev` — Volta para a música anterior.
- `/queue` — Mostra a fila de músicas, com paginação.

### Utilitários

- `/ping` — Mostra a latência do bot e do Discord.

## Permissões Necessárias

O bot precisa das seguintes permissões no seu servidor Discord:
- Conectar e falar em canais de voz
- Ler e enviar mensagens
- Usar comandos de barra

## Observações Técnicas

- O bot utiliza as bibliotecas `discord.js`, `@discordjs/voice`, `play-dl` e `@distube/ytdl-core` para manipulação de áudio e comandos.
- O FFmpeg é necessário para processar o áudio.
- O gerenciamento da fila e dos comandos é feito de forma modular, facilitando a manutenção e expansão.

## Contribuição

Sinta-se à vontade para abrir issues ou pull requests! 