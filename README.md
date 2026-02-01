# 🦊 FoxStream

**Stream movies, TV shows, anime, and live sports — all in one app.**

A privacy-respecting streaming platform that runs entirely on your computer. No accounts, no tracking, no ads.

## ✨ Features

- 🎬 **Movies & TV Shows** — Browse and stream from multiple sources
- 🎌 **Anime** — Dedicated anime section with MyAnimeList integration
- 📺 **Live TV** — 850+ channels including sports, news, and entertainment
- 🚫 **No Ads** — Clean, distraction-free viewing experience
- 🔒 **No Tracking** — Your watch history stays on your device
- 💬 **Subtitles** — 29 languages via OpenSubtitles
- 📱 **Chromecast & AirPlay** — Cast to your TV

## 🚀 Quick Start

### Option 1: Desktop App (Recommended)

Download the app for your platform:

| Platform | Download |
|----------|----------|
| Mac (M1/M2/M3) | [FoxStream-arm64.dmg](../../releases) |
| Mac (Intel) | [FoxStream.dmg](../../releases) |
| Windows | Coming soon |

**Requirements:**
- [Node.js](https://nodejs.org/) v18 or higher
- First launch takes a few minutes to set up

### Option 2: Run from Source

```bash
# Clone the repo
git clone https://github.com/lakotafox/Foxstreaming-.git foxstream
cd foxstream

# Install dependencies
npm install

# Start all services
npm run dev
```

Then open [http://localhost:3006](http://localhost:3006)

## 🏗️ How It Works

FoxStream runs three local services:

```
┌─────────────────────────────────────────────────┐
│  FoxStream                                       │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Web UI  │  │  Proxy   │  │  Worker  │      │
│  │  :3006   │  │  :3001   │  │  :8787   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       └─────────────┴─────────────┘             │
└─────────────────────│───────────────────────────┘
                      ▼
              Streaming Sources
```

| Service | Port | What it does |
|---------|------|--------------|
| Web UI | 3006 | The interface you see (Next.js) |
| Proxy | 3001 | Routes streams through your home IP |
| Worker | 8787 | Handles stream authentication |

Everything runs locally — **your IP, your connection, your privacy**.

## 📁 Project Structure

```
foxstream/
├── app/                    # Next.js application
│   ├── (routes)/          # Pages
│   ├── api/               # API endpoints
│   ├── components/        # UI components
│   └── lib/               # Utilities
├── cloudflare-proxy/      # Stream auth worker
├── rpi-proxy/             # Local proxy server
├── electron-app/          # Desktop app
│   ├── main.js           # App entry point
│   └── dist/             # Built apps
└── public/               # Static files
```

## 🎬 Content Sources

FoxStream aggregates from multiple providers:

| Type | Sources |
|------|---------|
| Movies/TV | VidSrc, Videasy, + fallbacks |
| Anime | AnimeKai + MAL metadata |
| Live TV | DLHD, CDN Live, VIPRow |

## 🛠️ Building the Desktop App

```bash
cd electron-app
npm install

# Build for Mac
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux
```

Output files appear in `electron-app/dist/`

## ⚙️ Configuration

Create `.env.local` in the root folder:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_key_here
```

Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api)

## ⚠️ Disclaimer

FoxStream is for **educational and personal use only**.

- We don't host any content
- We don't encourage piracy
- Respect copyright laws in your country
- Use responsibly

## 📄 License

MIT License

---

**Made with 🦊 by the FoxStream team**
