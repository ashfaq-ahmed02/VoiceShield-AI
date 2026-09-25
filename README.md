# 🛡️ VoiceShield AI

### AI-Powered Voice Fraud & Deepfake Detection

VoiceShield AI is a cybersecurity platform designed to detect **AI-generated voices, voice cloning, spoofing, and suspicious calls**.

## 🚀 Features

* 🎙️ Voice & speaker analysis
* 🤖 AI-generated voice detection
* 🔐 Speaker verification
* ⚠️ Risk scoring
* 🛡️ Threat detection
* 📊 Security analytics
* 🔄 REST API
* 🐳 Docker support
* ⚙️ GitHub Actions CI/CD

## 🏗️ Tech Stack

**Frontend:** HTML, CSS, JavaScript
**Backend:** Python, Flask
**DevOps:** Docker, GitHub Actions, GHCR
**Deployment:** GitHub Pages

## 📁 Structure

```text
VoiceShield-AI/
├── backend/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── index.html
├── style.css
├── script.js
└── .github/workflows/ci-cd.yml
```

## ⚡ Run Locally

```bash
git clone https://github.com/ashfaq-ahmed02/VoiceShield-AI.git
cd VoiceShield-AI/backend

pip install -r requirements.txt
python app.py
```

Backend:

```text
http://localhost:5000
```

## 🔌 API

```text
GET  /api/health
POST /api/analyze
POST /api/verify
GET  /api/risk
GET  /api/threats
GET  /api/analytics
POST /api/respond
```

## ⚠️ Note

This project is currently a **functional prototype** using simulated detection values and demo scenarios. It is not yet a production-trained deepfake detection system.

## 👨‍💻 Author

**Ashfaq Ahmed M**
CSE Student | DevOps • Cloud • Cybersecurity • AI

[GitHub](https://github.com/ashfaq-ahmed02)

> **VoiceShield AI — Detect the voice. Verify the identity. Protect the call.**
