# Kickstart

Kickstart is a personal action tool for starting tasks you keep avoiding. It turns a difficult task into one small first step, then uses a short focus session to help you begin without shame or pressure.

## Features

- Create tasks with a title and first step.
- Select a task from a floating retro game cartridge.
- Start a 5, 15, or 25 minute focus session.
- Pause, resume, reset, or finish a session.
- See remaining time with a pixel-style timer and hourglass indicator.
- Track total focused time with a running character and 60-minute trail.
- Restore an unfinished session after refreshing the page.
- Add an optional reflection after a session.
- Mark a task complete separately from finishing a focus session.
- View, delete, or clear session history.
- Hide, restore, or permanently delete old tasks.
- Use the app privately with local browser storage.

## Technology

- React
- JavaScript
- Vite
- CSS
- localStorage

There is no backend in the current MVP.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Check the code with ESLint
npm test          # Run timer and storage tests
```

## How It Works

1. Create or choose a task.
2. Press **Start Anyway**.
3. Focus on the first small step.
4. Pause, resume, or finish the session whenever needed.
5. Save a reflection if you want to.
6. Mark the whole task complete only when it is actually finished.

Each completed focus session is saved separately from the task. Closing or refreshing the page does not count away time as focused time; an unfinished session is restored in a paused state.

## Data and Privacy

Tasks, sessions, reflections, and unfinished timer checkpoints are stored in the browser using `localStorage`. The current MVP does not use an account, backend, analytics service, or cloud sync. Clearing browser storage will remove locally saved data.

## Project Structure

```text
src/
  components/       React UI components
  hooks/             Reusable React hooks
  utils/             Task, session, timer, and storage helpers
  App.jsx            Main application flow
  App.css            Application styling
  main.jsx           React entry point
tests/               Timer and storage tests
```

## Roadmap

- Add gentle sound and vibration when a session ends.
- Package the responsive app for iOS with Capacitor.
- Add optional Homecoming rewards without distracting from the Start button.
- Consider cloud sync and AI task breakdown after the core experience is stable.
