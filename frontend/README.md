# Rabbit Hole — Frontend

Typewriter-themed React frontend for the Rabbit Hole knowledge explorer.

## Stack

- **React 18** + **Vite**
- CSS Modules (zero runtime CSS-in-JS)
- No UI library dependencies

## Project Structure

```
src/
├── api/
│   ├── client.js       # REST calls (checkStatus, clearContext)
│   └── stream.js       # SSE-over-POST fetch reader
├── components/
│   ├── Header          # Logo + tagline
│   ├── Platen          # Paper wrapper (switches Landing ↔ ChatView)
│   ├── Landing         # Initial topic search screen
│   ├── ChatView        # Topic header, message list, ask input
│   ├── Message         # Single chat message bubble
│   ├── RelatedNodes    # "Dig deeper" topic buttons
│   └── StatusBar       # Server status indicator
├── styles/
│   └── global.css      # CSS custom properties + resets
├── App.jsx             # Root — state, handlers, layout
└── main.jsx            # ReactDOM entry point
```

## Getting Started

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:3000` and proxies all `/api/*`
requests to `http://localhost:5000` (your Flask backend).

## API Contract

| Endpoint             | Method | Used by         |
|----------------------|--------|-----------------|
| `/api/status`        | GET    | App mount       |
| `/api/topic`         | POST   | Landing search + node clicks |
| `/api/ask`           | POST   | ChatView ask input |
| `/api/context/clear` | POST   | "New Roll" button |

Both `/api/topic` and `/api/ask` return SSE streams.
See `src/api/stream.js` for the reader implementation.
