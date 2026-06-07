#!/bin/bash

# Antigravity Session Picker - Interactive menu for choosing Antigravity session type
# Provides options for interactive session, custom command, or regular shell

show_banner() {
    clear
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🤖 Antigravity Terminal                   ║"
    echo "║                   Interactive Session Picker                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

show_menu() {
    echo "Choose your session type:"
    echo ""
    echo "  1) 🆕 Interactive TUI session (default)"
    echo "  2) 💬 One-shot custom prompt (e.g. agy -p \"...\")"
    echo "  3) 🐚 Drop to bash shell"
    echo "  4) ❌ Exit"
    echo ""
}

get_user_choice() {
    local choice
    echo -n "Enter your choice [1-4] (default: 1): "
    read -r choice
    
    # Default to 1 if empty
    if [ -z "$choice" ]; then
        choice=1
    fi
    
    echo "$choice"
}

launch_agy_interactive() {
    echo "🚀 Starting Antigravity interactive session..."
    sleep 1
    exec agy
}

launch_agy_custom() {
    echo ""
    echo "Enter your custom prompt or flags (e.g., '-p \"List my config\"' or '--help'):"
    echo -n "> agy "
    read -r custom_args
    
    if [ -z "$custom_args" ]; then
        echo "No arguments provided. Starting default session..."
        launch_agy_interactive
    else
        echo "🚀 Running: agy $custom_args"
        sleep 1
        eval "exec agy $custom_args"
    fi
}

launch_bash_shell() {
    echo "🐚 Dropping to bash shell..."
    echo "Tip: Run 'agy' manually when ready"
    sleep 1
    exec bash
}

# Main execution flow
main() {
    while true; do
        show_banner
        show_menu
        choice=$(get_user_choice)
        
        case "$choice" in
            1)
                launch_agy_interactive
                ;;
            2)
                launch_agy_custom
                ;;
            3)
                launch_bash_shell
                ;;
            4)
                exit 0
                ;;
            *)
                echo ""
                echo "❌ Invalid choice: $choice"
                echo "Please select a number between 1-4"
                echo ""
                echo "Press Enter to continue..."
                read -r
                ;;
        esac
    done
}

# Run main function
main "$@"