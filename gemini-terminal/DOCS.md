# Antigravity CLI Terminal

A terminal interface for Google's Antigravity CLI in Home Assistant.

## About

This add-on provides a web-based terminal with the Google Antigravity CLI (`agy`) pre-installed, allowing you to access Antigravity's powerful AI agent capabilities directly from your Home Assistant dashboard. The terminal provides full access to code generation, explanation, and problem-solving, with deep integration into Home Assistant.

## Installation

1. Add this repository to your Home Assistant add-on store: `https://github.com/inzone1941-afk/antigravity-cli-home-assistant-addons`
2. Install the **Antigravity CLI Terminal** add-on.
3. Start the add-on.
4. Click **"OPEN WEB UI"** to access the terminal.
5. On first use, follow the authentication prompts (or enter a `gemini_api_key` in the configuration for headless login).

## Configuration

Your authentication credentials and session data are stored in the `/data/.gemini` directory and will persist across add-on updates and restarts.

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `gemini_api_key` | `""` | Optional Google Gemini/Antigravity API key for headless authentication |
| `gemini_debug` | `false` | Enable verbose debugging and show internal logs in add-on logs |
| `auto_launch_gemini` | `true` | Automatically start Antigravity when opening the terminal |

| `enable_ha_mcp` | `true` | Enable Home Assistant MCP server integration. |
| `ha_smart_context` | `true` | Automatically generate HA context (`GEMINI.md`) for AI awareness. |
| `persistent_apt_packages` | `[]` | APT packages to install on every startup. |
| `persistent_pip_packages` | `[]` | Python packages to install on every startup. |

## Usage

Antigravity launches automatically when you open the terminal. You can also start it manually with:

```bash
agy
```

### Common Commands

- `agy` - Start an interactive Antigravity session.
- `agy --help` - See all available commands.
- `gemini` - Alias for `agy` to preserve muscle memory.
- `ha-context --full` - Refresh the Home Assistant context (`GEMINI.md`) with full entity details.

The terminal starts directly in your `/config` directory, giving you immediate access to all your Home Assistant configuration files. This makes it easy to get help with your configuration, create automations, and troubleshoot issues.

## Features

- **Web Terminal**: Access a full terminal environment via your browser with a polished dark theme.
- **Auto-Launching**: Antigravity starts automatically when you open the terminal.
- **Home Assistant MCP Server**: Built-in integration with standard Home Assistant MCP for natural language control.
- **Smart Context**: Automatically generates a `GEMINI.md` context file for system and entity awareness.
- **Session Persistence**: Built-in `tmux` support ensures your session stays alive.
- **Direct Config Access**: Terminal starts in `/config` for immediate access to Home Assistant YAML files.

## Home Assistant MCP Integration

This add-on includes the Home Assistant MCP server, enabling Antigravity to directly interact with your Home Assistant instance using natural language.

### What You Can Do

- **Control Devices**: "Turn off the living room lights", "Set the thermostat to 72°F"
- **Query States**: "What's the temperature in the bedroom?", "Is the front door locked?"
- **Manage Automations**: "Create an automation that turns on the porch light at sunset"
- **Work with Scripts**: "Run my movie mode script", "Create a script for my morning routine"
- **View History**: "Show me the energy usage for the last week"

### How It Works

The MCP (Model Context Protocol) server automatically connects to your Home Assistant using the Supervisor API. No manual configuration or token setup is required - it just works!

## Safety & Guardrails

Antigravity Terminal is designed to be powerful but safe. It includes several built-in guardrails to prevent accidental or destructive changes:

### 1. Interactive Approvals
By default, the Antigravity CLI will **never** modify a file or execute a shell command without your explicit permission. It will show you the proposed changes and ask for confirmation.

### 2. Sandbox Mode (Dry-Run)
If you want to explore solutions without any risk of modification, you can launch Antigravity in **Sandbox Mode**:
```bash
agy --sandbox
```
In this mode, Antigravity is strictly forbidden from executing any tools that modify your system or files outside of the sandbox.

### 3. Home Assistant Backups
Because this add-on operates on your live `/config` directory, we always recommend ensuring you have a recent **Home Assistant backup** before performing major AI-driven refactoring of your YAML files.

## Troubleshooting

- If Antigravity doesn't start automatically, try running `agy` manually.
- Check the add-on logs in Home Assistant for any error messages.

## Credits & Inspiration

This project is a refitted fork of the **[Claude Terminal for Home Assistant](https://github.com/heytcass/home-assistant-addons)** by **[Tom Cassady (@heytcass)](https://github.com/heytcass)**. 

Special thanks to the original author for the excellent foundation in containerized terminal environments and Home Assistant integration.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. Antigravity CLI itself is subject to Google's Terms of Service.
