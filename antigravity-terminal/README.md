# Antigravity CLI Terminal for Home Assistant

[![License][license-shield]][license]
[![Maintainer][maintainer-shield]][maintainer]

A secure, web-based terminal with the Google Antigravity CLI (`agy`) pre-installed for Home Assistant.

![Antigravity CLI Terminal Screenshot](https://github.com/inzone1941-afk/Google-antigravity-CLI-Terrminal-for-home-assistant/raw/main/antigravity-terminal/screenshot.png)

*Antigravity CLI Terminal running in Home Assistant*

## What is Antigravity CLI Terminal?

This add-on provides a web-based terminal interface with the Google Antigravity CLI (`agy`) pre-installed, allowing you to use Antigravity's powerful AI capabilities directly from your Home Assistant dashboard. It gives you direct access to Google's Antigravity AI assistant through a terminal, ideal for:

- **🏠 Smart Home Control**: Use natural language to control devices via the built-in Home Assistant MCP server.
- **💻 Coding Assistant**: Get help with Home Assistant YAML, Python scripts, and complex automations.
- **🔍 Advanced Debugging**: Analyze Home Assistant logs and troubleshoot issues with AI assistance.
- **🧠 System Awareness**: Antigravity automatically understands your entities, system info, and recent logs through "Smart Context" (`ANTIGRAVITY.md`).

## Key Features

- **🚀 Auto-Launch & Session Picker**: Starts Antigravity automatically or provides a menu to manage sessions.
- **🔗 Deep Home Assistant Integration**: Pre-configured Home Assistant MCP server for native control of your home.
- **📝 Smart Context**: Automatically generates a context file with your system state for the AI to read.
- **🛡️ Secure Headless Auth**: Use your Google Gemini/Antigravity API Key for zero-config, persistent authentication.
- **📦 Persistent Packages**: Install APT and PIP packages that survive container restarts.
- **🎨 Polished UI**: High-performance terminal (`ttyd`) with support for themes (Breeze, Dracula, Nord, etc.).
- **🔄 Session Persistence**: Built-in `tmux` ensures your sessions stay alive even if you close the browser.

## Quick Start

The terminal automatically starts Antigravity when you open it. You can immediately start using commands like:

```bash
# Ask Antigravity about your smart home
agy -p "Is the coffee maker on?"

# Start an interactive coding/chat session
agy

# Drop to bash and run context checks
ha-context
```

## Installation

1. Add this repository to your Home Assistant: 
   `https://github.com/inzone1941-afk/Google-antigravity-CLI-Terrminal-for-home-assistant`
2. Install the **Antigravity CLI Terminal** add-on.
3. Enter your **Google API Key** in the **Configuration** tab for a seamless experience.
4. Start the add-on.
5. Click **OPEN WEB UI** or use the sidebar icon.

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `antigravity_api_key` | `""` | Your Google Gemini/Antigravity API Key. |
| `auto_launch_antigravity` | `true` | Automatically start Antigravity on terminal open. |
| `enable_ha_mcp` | `true` | Enable the Home Assistant MCP server integration. |
| `ha_smart_context` | `true` | Automatically generate a system context file (`ANTIGRAVITY.md`). |
| `persistent_apt_packages` | `[]` | List of Debian (APT) packages to install on startup. |
| `persistent_pip_packages` | `[]` | List of Python (PIP) packages to install on startup. |
| `terminal_theme` | `breeze` | Visual theme for the terminal (Breeze, Dracula, Nord, etc.). |

## Credits & Inspiration

This project is developed and maintained by **Roland (@inzone1941-afk)**. It is a modernized and refitted fork built on top of the following incredible community projects:

- **[oded996](https://github.com/oded996)**: For the original **[Gemini Terminal](https://github.com/oded996/gemini-cli-home-assistant-addons)** project which served as the core foundation.
- **[Tom Cassady (@heytcass)](https://github.com/heytcass)**: For the **[Claude Terminal for Home Assistant](https://github.com/heytcass/home-assistant-addons)** which provided containerized terminal ideas.
- **[OpenCode](https://github.com/magnusoverli/opencode)**: For architectural reference.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. Antigravity CLI is subject to Google's Terms of Service.

[license-shield]: https://img.shields.io/github/license/inzone1941-afk/Google-antigravity-CLI-Terrminal-for-home-assistant.svg
[license]: https://github.com/inzone1941-afk/Google-antigravity-CLI-Terrminal-for-home-assistant/blob/main/LICENSE
[maintainer-shield]: https://img.shields.io/badge/maintainer-inzone1941--afk-blue.svg
[maintainer]: https://github.com/inzone1941-afk
