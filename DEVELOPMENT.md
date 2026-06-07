# Development Guide

This guide covers local development and testing workflows for the Antigravity CLI Terminal add-on.

## Local Container Testing

### Prerequisites

- **Podman** (or Docker) installed
- **Git** repository cloned locally
- **NixOS development environment** (optional, for `nix develop`)

### Quick Start Testing

The fastest way to test changes without publishing new versions:

```bash
# 1. Build test container
podman build --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.21 \
  -t local/antigravity-terminal:test ./antigravity-terminal

# 2. Create test configuration
mkdir -p /tmp/test-config/antigravity-config
echo '{"auto_launch_antigravity": false}' > /tmp/test-config/options.json

# 3. Run test container
podman run -d --name test-antigravity-dev \
  -p 7682:7682 \
  -v /tmp/test-config:/config \
  local/antigravity-terminal:test

# 4. Check startup logs
podman logs test-antigravity-dev

# 5. Test in browser: http://localhost:7682

# 6. Clean up when done
podman stop test-antigravity-dev && podman rm test-antigravity-dev
```

### Development Workflow

#### 1. Iterative Development

```bash
# Make changes to code
vim antigravity-terminal/rootfs/usr/local/bin/antigravity-session-picker

# Rebuild image
podman build --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.21 \
  -t local/antigravity-terminal:test ./antigravity-terminal

# Stop old container
podman stop test-antigravity-dev && podman rm test-antigravity-dev

# Start new container with changes
podman run -d --name test-antigravity-dev -p 7682:7682 \
  -v /tmp/test-config:/config local/antigravity-terminal:test

# Test changes
open http://localhost:7682
```

#### 2. Hot-reload Script Testing

For script changes without full rebuilds:

```bash
# Copy updated script to running container
podman cp ./antigravity-terminal/rootfs/usr/local/bin/antigravity-session-picker \
  test-antigravity-dev:/usr/local/bin/antigravity-session-picker

# Make executable
podman exec test-antigravity-dev chmod +x /usr/local/bin/antigravity-session-picker

# Test directly
podman exec -it test-antigravity-dev /usr/local/bin/antigravity-session-picker
```

### Testing Scenarios

#### Session Picker Testing

```bash
# Test with auto-launch disabled
echo '{"auto_launch_antigravity": false}' > /tmp/test-config/options.json

# Test with auto-launch enabled (default)
echo '{"auto_launch_antigravity": true}' > /tmp/test-config/options.json
# OR
rm /tmp/test-config/options.json
```

#### Authentication Testing

```bash
# Start with clean credentials
rm -rf /tmp/test-config/antigravity-config/*

# Pre-populate credentials for testing (if any local credentials exist)
# cp ~/.config/google/* /tmp/test-config/antigravity-config/
```

#### Multi-session Testing

```bash
# Run multiple containers on different ports
podman run -d --name test-antigravity-dev-8681 -p 8681:7682 -v /tmp/test-config-2:/config local/antigravity-terminal:test
podman run -d --name test-antigravity-dev-9681 -p 9681:7682 -v /tmp/test-config-3:/config local/antigravity-terminal:test
```

### Debugging Techniques

#### Container Inspection

```bash
# Follow logs in real-time
podman logs -f test-antigravity-dev

# Execute shell inside container
podman exec -it test-antigravity-dev /bin/bash

# Check running processes
podman exec test-antigravity-dev ps aux

# Inspect environment variables
podman exec test-antigravity-dev env | grep GEMINI
```

#### Script Debugging

```bash
# Test session picker with debug output
podman exec -it test-antigravity-dev bash -x /usr/local/bin/antigravity-session-picker

# Check file permissions and locations
podman exec test-antigravity-dev ls -la /usr/local/bin/
podman exec test-antigravity-dev ls -la /config/antigravity-config/
```

#### Network Testing

```bash
# Test web endpoint
curl -I http://localhost:7682

# Test WebSocket connection
curl --include --no-buffer \
  --header "Connection: Upgrade" \
  --header "Upgrade: websocket" \
  --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
  --header "Sec-WebSocket-Version: 13" \
  http://localhost:7682/ws
```

### Performance Testing

#### Resource Usage

```bash
# Monitor container resources
podman stats test-antigravity-dev

# Check container size
podman images local/antigravity-terminal:test

# Inspect layers
podman history local/antigravity-terminal:test
```

#### Load Testing

```bash
# Multiple concurrent connections
for i in {1..5}; do
  curl http://localhost:7682 &
done
wait
```

### Common Issues & Solutions

#### Port Already In Use
```bash
# Find and kill process using port 7682
sudo lsof -ti:7682 | xargs kill -9

# Or use different port
podman run -d --name test-antigravity-dev -p 7682:7682 -v /tmp/test-config:/config local/antigravity-terminal:test
```

#### Volume Mount Issues
```bash
# Ensure directory exists and has correct permissions
mkdir -p /tmp/test-config/antigravity-config
chmod 755 /tmp/test-config/antigravity-config

# Check SELinux labels (if applicable)
ls -laZ /tmp/test-config/
```

#### Build Cache Issues
```bash
# Force rebuild without cache
podman build --no-cache --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.21 \
  -t local/antigravity-terminal:test ./antigravity-terminal

# Clean up unused images
podman image prune
```

### Cleanup Commands

#### Clean Up Test Environment
```bash
# Stop and remove test containers
podman stop test-antigravity-dev && podman rm test-antigravity-dev

# Remove test configurations
rm -rf /tmp/test-config*

# Clean up test images
podman rmi local/antigravity-terminal:test
```

#### Full System Cleanup
```bash
# Remove all stopped containers
podman container prune

# Remove unused images
podman image prune

# Remove unused volumes
podman volume prune
```

## Production Deployment

Once testing is complete:

```bash
# Commit changes
git add .
git commit -m "feature: description of changes"

# Update version in config.yaml
vim/antigravity-terminal/config.yaml

# Push to main branch
git push origin main
```

The changes will automatically be built and distributed to Home Assistant users.

## Advanced Testing

### Integration with Home Assistant

```bash
# Test with real Home Assistant config structure
mkdir -p /tmp/ha-config/{.storage,antigravity-config}
echo '{"auto_launch_antigravity": false}' > /tmp/ha-config/options.json

podman run -d --name test-ha-antigravity -p 7682:7682 \
  -v /tmp/ha-config:/config local/antigravity-terminal:test
```

### Cross-Platform Testing

```bash
# Test different base images
podman build --build-arg BUILD_FROM=ghcr.io/home-assistant/aarch64-base:3.21 \
  -t local/antigravity-terminal:arm64 ./antigravity-terminal

podman build --build-arg BUILD_FROM=ghcr.io/home-assistant/armv7-base:3.21 \
  -t local/antigravity-terminal:armv7 ./antigravity-terminal
```