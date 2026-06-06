# Gemini CLI Terminal for Home Assistant

Bring the power of Google's **Gemini CLI** directly to your Home Assistant dashboard! 

Gemini CLI Terminal provides an AI-driven, persistent web terminal pre-configured with the Home Assistant MCP (`ha-mcp`) server, giving Gemini native access to your smart home environment.

---

## 🚀 Key Features

* **Google Gemini CLI Integration**: A full-featured web terminal with the official Gemini CLI pre-installed.
* **Native Home Assistant Control**: Thanks to the integrated `ha-mcp` server, Gemini can read states, call services, and interact with your entities natively.
* **Session Persistence**: Built-in `tmux` support means you can navigate away or refresh without losing your terminal session or AI conversation.
* **Smart Environment Context**: Automatically creates a `GEMINI.md` file loaded with system info, architecture, and recent logs to ground Gemini in your specific setup.
* **Seamless Authentication**: Configure your `GEMINI_API_KEY` straight from the Home Assistant add-on UI.
* **Direct Config Access**: Boots directly into your `/config` directory for immediate YAML editing and troubleshooting.

## 📦 Installation

We've made installation as simple as possible.

### One-Click Install

Click the button below to add this repository directly to your Home Assistant instance:

[![Add Repository to Home Assistant](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Finzone1941-afk%2Fgemini-cli-home-assistant-addons)

### Manual Install

1. In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**.
2. Click the **⋮** menu in the top right corner and select **Repositories**.
3. Add the following URL:
   `https://github.com/inzone1941-afk/gemini-cli-home-assistant-addons`
4. Find **Gemini CLI Terminal** in the add-on store and click **Install**.

## ⚙️ Configuration & Usage

1. After installation, go to the add-on's **Configuration** tab.
2. Enter your `GEMINI_API_KEY` (highly recommended for seamless startup).
3. Start the add-on.
4. Click **Open Web UI** (or enable the "Show in sidebar" toggle) to access your terminal!

For advanced configurations, check out the [Full Add-on Documentation](./gemini-terminal/DOCS.md).

## 📖 Documentation & Logs

* [Full Add-on Documentation](./gemini-terminal/DOCS.md)
* [Changelog](./gemini-terminal/CHANGELOG.md)

## 🤝 Credits & Inspiration

This project was built on the incredible work of others in the Home Assistant community:

* **[Tom Cassady (@heytcass)](https://github.com/heytcass)**: For creating the original **[Claude Terminal for Home Assistant](https://github.com/heytcass/home-assistant-addons)** which served as the foundation for this project.
* **[oded996](https://github.com/oded996)**: For the original **[Gemini Terminal](https://github.com/oded996/gemini-cli-home-assistant-addons)** project which provided the core foundation for this enhanced version.
* **[Magnus Overli (@magnusoverli)](https://github.com/magnusoverli)**: For **[OpenCode for Home Assistant](https://github.com/magnusoverli/opencode)**, which provided the inspiration and architectural reference for our recent stability refactors.

## 📜 License

This repository is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.  
*Note: The Gemini CLI tool itself is subject to Google's Terms of Service.*