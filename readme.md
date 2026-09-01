# VoiceShield AI

Real-time voice clone / impersonation detection — landing site + security console, built as plain HTML/CSS/JS with a Python (Flask) backend.

## Structure
```
index.html        Landing page + dashboard app shell (single page, tab-based)
style.css         All styling (dark SOC dashboard theme)
script.js         All interactivity: routing, demo mode, tables, charts, API calls
backend/
  app.py           Flask API: /api/analyze /api/verify /api/risk /api/respond
                    /api/threats /api/speakers /api/analytics /api/health
  requirements.txt
```

## Run the backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Starts on `http://localhost:5000`.

## Run the frontend
Just open `index.html` in a browser, or serve it (recommended, avoids `file://` quirks):
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080`.

The frontend calls the backend at `http://localhost:5000/api` when run locally. If the backend isn't running, the demo (Start Live Analysis, the API tab's "Run Request") falls back to a simulated response so the UI still works standalone — useful for a quick hackathon demo without the backend running.

## What's interactive
- **Start Live Analysis** on the Overview tab, with a scenario picker (Safe / Suspicious / AI Voice Clone / High-Risk) — calls `POST /api/analyze` and updates the metrics, risk score and recommended response live.
- **Approve / Request Verification / Block Action** buttons update the response panel state.
- **Threats tab** — filter by risk level, search by caller/threat type, click a row to open the Call Investigation view.
- **Analytics tab** — Chart.js line/area/donut/bar charts with a date-range switch.
- **API tab** — copy/generate a demo key, and fire a live request against `/api/analyze`.
- **Settings tab** — sliders and toggles (frontend-only state).