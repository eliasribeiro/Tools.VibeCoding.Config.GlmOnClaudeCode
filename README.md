# GLM AI Config Tool

[English](/README.md) | [Português (Brasil)](/README.pt-BR.md) | [Español](/README.es.md)

## 📖 Overview
GLM AI Config Tool is a modern Electron app that helps you configure and manage GLM AI models for Claude Code and Crush. It provides a friendly GUI to set up environment variables, provider files, and API keys securely on Windows.

## ✨ Features
- Secure GLM API Key management (Windows Credential Store + encryption)
- One-click Claude Code setup (env vars + .claude/settings.json)
- One-click Crush setup (providers.json update with Coding Plan endpoint)
- Automatic backups and easy restore
- Light/Dark theme, real-time notifications, status indicators

## 🛠 Tech Stack
- Frontend: React 18, Tailwind CSS, Lucide React Icons
- Backend: Electron 22, Node.js
- Storage: Electron Store, Keytar
- Build: Electron Builder
- Routing: React Router DOM

## 📋 Requirements
- Windows 10/11 (x64)
- Node.js 16+ (for development only)
- Valid GLM AI API key
- Claude Code or Crush CLI (depending on what you want to configure)

## 🚀 Installation

- Installer: download “GLM-AI-Config Setup 1.0.0.exe”, run and follow the steps
- ZIP: download “GLM-AI-Config-1.0.0-win.zip”, extract and run “GLM AI Config.exe”

## 🏗 Development
```bash
# Clone
git clone <repository-url>
cd GLM-AI-Config

# Install deps
npm install

# Run
npm run electron-dev         # Electron + React in development

# Useful scripts
npm run dev                  # React dev server
npm start                    # React + Electron together
npm run build                # React build
npm run build-app            # Full Electron build
npm run dist                 # Installers/portable/zip
```

## 📚 Project Structure
```
src/
├─ components/   # Reusable React components
├─ contexts/     # Config and Notification contexts
├─ main/         # Electron main process
├─ pages/        # App pages (API Key, Claude Code, Crush, Settings)
├─ utils/        # Utilities
└─ App.js        # Root component
```

## 📖 How to Use
1) API Key: open “API Key”, paste your GLM key, Save.
2) Claude Code:
   - Step 1: Configure Environment Variables
   - Step 2: Choose model (glm-4.5 / glm-4.5-air), select your repo folder, Create Settings File
3) Crush:
   - Step 1: Run Initial Setup (if needed)
   - Step 2: Choose model and Apply GLM Configuration
4) Settings: switch theme, export backup, clear data, view system info

## 🔧 Technical Settings
- Claude Code env vars (auto-set):
  - ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
  - ANTHROPIC_AUTH_TOKEN=<your-api-key>
- Claude Code settings file:
  - Location: <your-repo>/.claude/settings.json
  - Content:
```json
{
  "env": { "ANTHROPIC_MODEL": "glm-4.5" }
}
```
- Crush providers file:
  - Location: %USERPROFILE%\AppData\Local\crush\providers.json
  - Updates: https://api.z.ai/api/paas/v4 → https://api.z.ai/api/coding/paas/v4
  - Backup created automatically before any change

## 🛡 Security
- API Keys stored securely via Windows Credential Store (Keytar)
- Config stored locally, never transmitted
- Automatic backups before sensitive changes
- Communication restricted to authorized Z.AI endpoints

## 🐛 Troubleshooting
- “API Key not found”: add it in the API Key page
- “Crush CLI not found”: install Crush CLI from Z.AI
- “Failed to set env vars”: run as Administrator or check PowerShell permissions
- “providers.json not found”: run Crush initial setup first
- Dark theme not working: go to Settings → Theme → Dark

## 📄 License
MIT License. See LICENSE.

## 👥 Contributing
1. Fork
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit (git commit -m "feat: add AmazingFeature")
4. Push (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📞 Support
- Open an issue
- Check Z.AI documentation
- Contact the development team

—
GLM AI Config Tool — Simplifying AI setup for developers 🚀