# To‑Do List — HTML · CSS · TypeScript

## Run locally
Open `index.html` in a browser. It loads the compiled `app.js` so it works immediately.

## Edit TypeScript
Edit `app.ts` and compile to JS (optional since `app.js` is already provided). If you have Node and TypeScript:
```bash
npm i -g typescript
tsc app.ts --target ES2020 --module ES2020 --outFile app.js
```
(Or set up a `tsconfig.json` for a bigger project.)

## Features
- Add, edit (double‑click or ✏️), delete
- Toggle complete; filter All / Active / Completed
- Toggle all; clear completed
- LocalStorage persistence
- Accessible and keyboard‑friendly
