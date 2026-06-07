# Antigravity CLI Terminal Home Assistant Add-on Documentation

## Overview

Antigravity CLI Terminal provides a web-based terminal interface with the Google **Antigravity CLI** (`agy`) pre-installed, allowing you to access Antigravity's powerful AI agent capabilities directly from your Home Assistant dashboard. Antigravity is an AI coding agent by Google that can help you with Home Assistant configuration, automation creation, debugging, and general coding tasks.

## Installation

Follow these steps to install the add-on:

1. Navigate to your Home Assistant instance
2. Go to **Settings** -> **Add-ons** -> **Add-on Store**
3. Click the three dots (top right corner) and select **"Repositories"**
4. Add the URL of this repository: `https://github.com/inzone1941-afk/Google-antigravity-CLI-Terrminal-for-home-assistant` and click **"Add"**
5. Find the **"Antigravity CLI Terminal"** add-on and click on it
6. Click **"Install"**

## Configuration

The add-on works out of the box using OAuth authentication. However, you can also provide an `antigravity_api_key` in the configuration tab for a "headless" login experience.

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `antigravity_api_key` | `""` | Optional Google Gemini/Antigravity API key for headless authentication |
| `enable_ha_mcp` | `true` | Enable Home Assistant MCP server integration. |
| `ha_smart_context` | `true` | Automatically generate HA context (`ANTIGRAVITY.md`) for AI awareness. |
| `auto_launch_antigravity` | `true` | Automatically start Antigravity when opening the terminal |
| `persistent_apt_packages` | `[]` | APT packages to install on every startup. |
| `persistent_pip_packages` | `[]` | Python packages to install on every startup. |

## Usage

The Antigravity CLI launches automatically when you open the terminal. You can interact with it using the following commands:

### Common Commands

- `agy` - Start an interactive Antigravity session
- `agy --help` - See all available commands
- `gemini` - Alias command for `agy` to preserve muscle memory
- `ha-context --full` - Refresh the Home Assistant context (`ANTIGRAVITY.md`) with full entity details

Your session data and configuration are stored in `/data/.gemini/antigravity-cli`, which persists between restarts.

## Home Assistant-Specific Use Cases

Antigravity CLI Terminal is particularly useful for Home Assistant tasks. Because it has a built-in **MCP (Model Context Protocol)** server and access to a generated **ANTIGRAVITY.md** context file, it knows your system intimately.

### 1. Automation Creation and Debugging

```
# Ask about your home state
agy "Which lights are currently on?"

# Create a new automation
agy "create an automation that turns on the porch lights when the front door opens, but only after sunset"
```

### 2. YAML Configuration Help

```
# Get help with syntax
agy "what's wrong with this YAML? [paste YAML]"

# Analyze your current config
agy "Analyze my /config/configuration.yaml and suggest improvements"
```

### 3. Entity Management

```
# Clean up entity names
agy "suggest better names for these entities: [paste entity list]"

# Create a template sensor
agy "create a template sensor that averages all my temperature sensors"
```

## Safety & Guardrails

Antigravity Terminal is designed to be powerful but safe. It includes several built-in guardrails to prevent accidental or destructive changes:

### 1. Interactive Approvals
By default, the Antigravity CLI will **never** modify a file or execute a shell command without your explicit permission. It will show you a **diff** of the proposed changes and ask for confirmation.

### 2. Sandbox Mode (Dry-Run)
If you want to explore solutions without any risk of modification, you can launch Antigravity in **Sandbox Mode**:
```bash
agy --sandbox
```
In this mode, Antigravity is strictly forbidden from executing any tools that modify your system or files outside of the sandbox.

### 3. Home Assistant Backups
Because this add-on operates on your live `/config` directory, we always recommend ensuring you have a recent **Home Assistant backup** before performing major AI-driven refactoring of your YAML files.

## Troubleshooting

### Logs

Check the add-on logs for detailed information about any issues:

1. Go to the add-on page in Home Assistant
2. Click the **"Logs"** tab

## Security Considerations

Antigravity Terminal is designed with security in mind:

- The add-on runs in an isolated container.
- Your code and queries go directly to Google's API.
- The `ha-mcp` integration uses the internal Supervisor token for secure Home Assistant access.

## Credits & Inspiration

This project is a refitted fork of the **[Claude Terminal for Home Assistant](https://github.com/heytcass/home-assistant-addons)** by **[Tom Cassady (@heytcass)](https://github.com/heytcass)**. 

Special thanks to the original author for the excellent foundation in containerized terminal environments and Home Assistant integration.

## Support

- For issues with the add-on itself, please open an issue on the GitHub repository.
- For Antigravity CLI-specific issues, refer to the [Google documentation](https://antigravity.google).

## License

This repository is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Antigravity CLI itself is subject to Google's Terms of Service.
