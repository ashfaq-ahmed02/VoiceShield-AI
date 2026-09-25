# 🛡️ VoiceShield AI

### AI-Powered Voice Fraud & Deepfake Detection System

VoiceShield AI is a cybersecurity-focused voice intelligence platform designed to detect **AI-generated voices, voice cloning, spoofing attempts, replay attacks, and suspicious caller behavior**.

The system combines voice integrity analysis, speaker verification, synthetic-voice detection, and contextual risk scoring to determine whether a call should be **allowed, verified, blocked, or escalated**.

> Built as an AI-powered security concept for detecting voice-based impersonation and fraud.

---

## 🚨 Problem

With the rapid growth of generative AI, attackers can now create highly realistic synthetic voices and clone a person's voice using a small amount of audio.

This creates risks such as:

* 🎙️ Voice cloning
* 🤖 AI-generated voices
* 🔁 Replay attacks
* 👤 Caller impersonation
* 💳 Social engineering and financial fraud
* 📞 Spoofed phone calls

Traditional caller verification may not be enough to identify these threats.

**VoiceShield AI provides an additional intelligence layer for analyzing the voice and caller context before sensitive actions are authorized.**

---

## 💡 Solution

VoiceShield AI analyzes multiple security signals:

```text
                    Incoming Call
                          │
                          ▼
              ┌──────────────────────┐
              │   VoiceShield AI     │
              └──────────┬───────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   Voice Integrity  Speaker Match  Synthetic Voice
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  Context Analysis
                         │
                         ▼
                   Risk Scoring
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
           ALLOW      VERIFY       BLOCK
                         │
                         ▼
                     ESCALATE
```

---

# ✨ Features

## 🎙️ Voice Analysis

The system evaluates:

* Voice integrity
* Speaker similarity
* Synthetic voice probability
* Caller context risk

These signals are combined into a single **0–100 risk score**.

---

## 🧠 AI Voice Detection

VoiceShield identifies different voice conditions:

| Classification       | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `NORMAL_HUMAN_VOICE` | Voice appears consistent with a normal enrolled speaker |
| `AI_VOICE_DETECTED`  | Synthetic or cloned voice indicators detected           |
| `UNCERTAIN`          | Signals are mixed and require additional verification   |

---

## 🔐 Speaker Verification

The platform maintains enrolled speaker profiles and compares incoming callers against those profiles.

Example:

```json
{
  "speaker_name": "Rajesh Kumar",
  "match_confidence": 92.4,
  "verified": true,
  "status": "VERIFIED"
}
```

---

## ⚠️ Risk Scoring

VoiceShield combines multiple signals into a weighted risk score.

### Risk Levels

```text
0 – 29     → LOW
30 – 59    → MEDIUM
60 – 84    → HIGH
85 – 100   → CRITICAL
```

### Security Recommendations

```text
LOW       → ALLOW

MEDIUM    → REQUEST_VERIFICATION

HIGH      → BLOCK

CRITICAL  → BLOCK_AND_ESCALATE
```

---

## 🛡️ Voice Safety Agent

The Voice Safety Agent converts detection results into an actionable security decision.

Possible decisions:

```text
SAFE
REVIEW
HARMFUL
```

For example:

> Synthetic or cloned voice indicators detected. Block sensitive actions and escalate.

---

## 📊 Threat Intelligence

The dashboard provides threat information including:

* Voice Clone
* Synthetic Voice
* Spoof Attempt
* Replay Attack
* Normal Call

Threat data can be filtered by risk level and search query.

---

## 📈 Security Analytics

The analytics dashboard provides data for:

* Threats over time
* Detection accuracy
* Threat distribution
* Risk distribution
* Calls analyzed
* Threats detected
* Verified speakers
* Active calls

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────┐
│              VoiceShield AI                │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend                                   │
│  ├── HTML                                   │
│  ├── CSS                                    │
│  └── JavaScript                             │
│                                             │
│                 │                           │
│                 ▼                           │
│          REST API Layer                     │
│                                             │
│                 │                           │
│                 ▼                           │
│  Flask Backend                              │
│  ├── Voice Analysis                         │
│  ├── Speaker Verification                   │
│  ├── Risk Engine                            │
│  ├── Threat Intelligence                    │
│  ├── Security Response                      │
│  └── Analytics                              │
│                                             │
│                 │                           │
│                 ▼                           │
│            Docker                           │
│                                             │
│                 │                           │
│                 ▼                           │
│        GitHub Actions CI/CD                 │
│                                             │
│        ┌──────────────┬─────────────┐       │
│        ▼              ▼             ▼       │
│    Backend CI    Docker/GHCR    GitHub Pages│
│                                             │
└─────────────────────────────────────────────┘
```

---

# 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* Flask
* Gunicorn
* REST API

### DevOps

* Docker
* GitHub Actions
* GitHub Container Registry
* GitHub Pages

### Development & Security Concepts

* Voice authentication
* Synthetic voice detection
* Risk scoring
* Threat intelligence
* API security
* Containerization
* CI/CD

---

# 📁 Project Structure

```text
VoiceShield-AI/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── index.html
├── style.css
├── script.js
│
├── _site/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

---

# 🔌 API Endpoints

## Health Check

```http
GET /api/health
```

Returns the current API status.

---

## Analyze Call

```http
POST /api/analyze
```

Analyzes a call and returns:

* Risk score
* Risk level
* Voice integrity
* Speaker match
* Synthetic probability
* Context risk
* Security recommendation
* Voice classification

### Example

```json
{
  "call_id": "VS-12345",
  "scenario": "highrisk"
}
```

Supported demo scenarios:

```text
safe
suspicious
clone
highrisk
```

---

## Speaker Verification

```http
POST /api/verify
```

Verifies a caller against an enrolled speaker profile.

---

## Risk Snapshot

```http
GET /api/risk
```

Returns the current risk-engine state.

---

## Security Response

```http
POST /api/respond
```

Records a security action:

```text
approve
verify
block
```

---

## Threat Intelligence

```http
GET /api/threats
```

Optional filters:

```text
?risk=critical
?q=voice
```

---

## Speaker Profiles

```http
GET /api/speakers
```

Returns enrolled speaker profiles.

---

## Analytics

```http
GET /api/analytics
```

Supports:

```text
24h
7d
30d
90d
```

---

## API Key Generation

```http
POST /api/keys/generate
```

Generates a demo API key for the platform.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/ashfaq-ahmed02/VoiceShield-AI.git
```

```bash
cd VoiceShield-AI
```

---

# 🐍 Run the Backend

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
python app.py
```

The backend will run on:

```text
http://localhost:5000
```

Test it:

```bash
curl http://localhost:5000/api/health
```

---

# 🐳 Run with Docker

From the `backend` directory:

```bash
docker build -t voiceshield-backend .
```

Run the container:

```bash
docker run -p 5000:5000 voiceshield-backend
```

The API will be available at:

```text
http://localhost:5000
```

---

# 🔄 CI/CD Pipeline

VoiceShield AI includes a GitHub Actions workflow.

Every push or pull request to `main` can trigger:

```text
                Git Push
                   │
                   ▼
          ┌─────────────────┐
          │ GitHub Actions  │
          └────────┬────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
 Backend CI              Frontend CI
       │                       │
       ├── Install             ├── JS Check
       ├── Compile             ├── HTML Check
       ├── Lint                └── CSS Check
       ├── Tests
       └── API Smoke Test
       │
       ▼
 Docker Build
       │
       ▼
 GitHub Container Registry
       │
       ▼
 GitHub Pages
```

The backend Docker image is published through **GitHub Container Registry (GHCR)**, while the static frontend is deployed through **GitHub Pages**.

---

# 🧪 Demo Scenarios

VoiceShield provides four demo analysis scenarios.

### Safe

```text
Voice Integrity       → High
Speaker Match         → High
Synthetic Probability → Low
Context Risk          → Low
```

Expected result:

```text
LOW
ALLOW
```

### Suspicious

```text
Voice Integrity       → Moderate
Speaker Match         → Moderate
Synthetic Probability → Moderate
Context Risk          → Moderate
```

Expected result:

```text
MEDIUM
REQUEST_VERIFICATION
```

### Clone

```text
Synthetic Probability → High
Speaker Match         → Low
```

Expected result:

```text
HIGH
BLOCK
```

### High Risk

```text
Synthetic Probability → Very High
Voice Integrity       → Low
Speaker Match         → Low
Context Risk          → High
```

Expected result:

```text
CRITICAL
BLOCK_AND_ESCALATE
```

---

# 🔐 Security Decision Model

VoiceShield calculates the risk score using four major signals:

```text
Risk Score =
    Voice Integrity Risk × 30%
  + Speaker Identity Risk × 25%
  + Synthetic Voice Risk × 30%
  + Context Risk × 15%
```

This produces a normalized score from:

```text
0 → 100
```

Higher score = higher impersonation risk.

---

# ⚠️ Current Implementation

This repository is currently a **functional demonstration/prototype**.

The backend uses structured demo scenarios and simulated detection values rather than a production-trained deepfake detection model.

The in-memory data layer is also intended for demonstration purposes.

For a production implementation, the following components would need to be integrated:

* Real-time audio ingestion
* Real voice embeddings
* Deepfake audio detection model
* Speaker recognition model
* Secure persistent database
* Telephony integration
* Authentication and authorization
* Encrypted audio processing
* Monitoring and logging
* Production threat-intelligence feeds

---

# 🔮 Future Roadmap

* [ ] Real-time call audio analysis
* [ ] Deepfake voice detection model
* [ ] Speaker embedding model
* [ ] Telephony integration
* [ ] Real-time WebSocket monitoring
* [ ] Persistent database
* [ ] Authentication & RBAC
* [ ] Advanced threat intelligence
* [ ] Automated fraud alerts
* [ ] Multi-language voice detection
* [ ] Production cloud deployment
* [ ] Security audit and penetration testing

---

# 🎯 Use Cases

VoiceShield AI can be adapted for:

* 🏦 Banking & financial services
* 📞 Call centers
* 💳 Payment verification
* 🛡️ Cybersecurity operations
* 🏢 Enterprise identity verification
* 👨‍💼 Customer support
* 🚨 Fraud prevention
* 🔐 High-risk transaction verification

---

# 👨‍💻 Author

**Ashfaq Ahmed M**

Computer Science & Engineering Student
DevOps • Cloud • Cybersecurity • AI

GitHub:
https://github.com/ashfaq-ahmed02

---

# 📜 License

This project currently does not specify a license.

If you intend to allow others to reuse or modify the project, consider adding an appropriate open-source license.

---

## ⭐ Project

If you find VoiceShield AI interesting, consider giving the repository a ⭐ on GitHub.

**VoiceShield AI — Detect the voice. Verify the identity. Protect the call.**
