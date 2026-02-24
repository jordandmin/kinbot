#!/usr/bin/env bash
# KinBot installer
# Usage: curl -fsSL https://raw.githubusercontent.com/MarlBurroW/kinbot/main/install.sh | bash
# Or:    KINBOT_PORT=8080 bash install.sh
set -euo pipefail

# ─── Configurable via env vars ───────────────────────────────────────────────
KINBOT_DIR="${KINBOT_DIR:-/opt/kinbot}"
KINBOT_DATA_DIR="${KINBOT_DATA_DIR:-/var/lib/kinbot}"
KINBOT_PORT="${KINBOT_PORT:-3000}"
KINBOT_USER="${KINBOT_USER:-kinbot}"
KINBOT_REPO="MarlBurroW/kinbot"
KINBOT_BRANCH="${KINBOT_BRANCH:-main}"

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}▸${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC} $*"; }
error()   { echo -e "${RED}✗ ERROR:${NC} $*" >&2; exit 1; }
header()  { echo -e "\n${BOLD}$*${NC}"; }

# ─── OS detection ────────────────────────────────────────────────────────────
detect_os() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Linux)
      if [ -f /etc/os-release ]; then
        # shellcheck disable=SC1091
        . /etc/os-release
        DISTRO="${ID:-unknown}"
        DISTRO_LIKE="${ID_LIKE:-}"
      else
        DISTRO="unknown"
        DISTRO_LIKE=""
      fi
      INIT_SYSTEM="systemd"
      ;;
    Darwin)
      DISTRO="macos"
      DISTRO_LIKE=""
      INIT_SYSTEM="launchd"
      ;;
    *)
      error "Unsupported OS: $OS. KinBot supports Linux and macOS."
      ;;
  esac

  success "Detected OS: $OS ($DISTRO, $ARCH)"
}

# ─── Check prerequisites ─────────────────────────────────────────────────────
check_prerequisites() {
  header "Checking prerequisites..."

  # Root check (Linux only)
  if [ "$OS" = "Linux" ] && [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root on Linux. Use: sudo bash install.sh"
  fi

  # git
  if ! command -v git &>/dev/null; then
    error "git is required but not installed. Install it first (e.g. apt install git / brew install git)"
  fi
  success "git found: $(git --version | head -1)"

  # curl
  if ! command -v curl &>/dev/null; then
    error "curl is required but not installed."
  fi
  success "curl found"

  # Disk space (require at least 500 MB)
  if command -v df &>/dev/null; then
    AVAILABLE_KB=$(df -k /opt 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")
    if [ "$AVAILABLE_KB" -lt 512000 ] 2>/dev/null; then
      warn "Less than 500 MB available. KinBot may not install correctly."
    fi
  fi
}

# ─── Install Bun ─────────────────────────────────────────────────────────────
ensure_bun() {
  header "Checking Bun runtime..."

  # Set up Bun paths
  BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export BUN_INSTALL
  export PATH="$BUN_INSTALL/bin:$PATH"

  if command -v bun &>/dev/null; then
    BUN_VERSION="$(bun --version)"
    success "Bun found: v$BUN_VERSION"
    return 0
  fi

  info "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$BUN_INSTALL/bin:$PATH"

  if ! command -v bun &>/dev/null; then
    error "Bun installation failed. Install manually: https://bun.sh"
  fi
  success "Bun installed: v$(bun --version)"
}

# ─── Clone or update ─────────────────────────────────────────────────────────
install_or_update() {
  header "Installing KinBot..."

  if [ -d "$KINBOT_DIR/.git" ]; then
    info "Existing installation found at $KINBOT_DIR — updating..."
    git -C "$KINBOT_DIR" fetch origin
    git -C "$KINBOT_DIR" checkout "$KINBOT_BRANCH"
    git -C "$KINBOT_DIR" pull origin "$KINBOT_BRANCH"
    success "Updated to latest version"
    IS_UPDATE=true
  else
    info "Cloning KinBot to $KINBOT_DIR..."
    mkdir -p "$(dirname "$KINBOT_DIR")"
    git clone "https://github.com/$KINBOT_REPO.git" "$KINBOT_DIR" --branch "$KINBOT_BRANCH" --depth 1
    success "Repository cloned"
    IS_UPDATE=false
  fi
}

# ─── Build ───────────────────────────────────────────────────────────────────
build_kinbot() {
  header "Installing dependencies and building..."

  cd "$KINBOT_DIR"

  info "Installing dependencies..."
  bun install --frozen-lockfile

  info "Building frontend..."
  bun run build

  success "Build complete"
}

# ─── Database ────────────────────────────────────────────────────────────────
setup_database() {
  header "Setting up database..."

  mkdir -p "$KINBOT_DATA_DIR"

  cd "$KINBOT_DIR"
  KINBOT_DATA_DIR="$KINBOT_DATA_DIR" \
  DB_PATH="$KINBOT_DATA_DIR/kinbot.db" \
    bun run db:migrate

  success "Database migrations applied"
}

# ─── System user (Linux) ─────────────────────────────────────────────────────
create_system_user() {
  if [ "$OS" != "Linux" ]; then return; fi

  if id "$KINBOT_USER" &>/dev/null; then
    success "User '$KINBOT_USER' already exists"
    return
  fi

  info "Creating system user '$KINBOT_USER'..."
  useradd \
    --system \
    --home-dir "$KINBOT_DIR" \
    --shell /usr/sbin/nologin \
    --comment "KinBot service account" \
    "$KINBOT_USER"
  success "User '$KINBOT_USER' created"
}

# ─── File ownership ──────────────────────────────────────────────────────────
set_ownership() {
  if [ "$OS" != "Linux" ]; then return; fi

  chown -R "$KINBOT_USER:$KINBOT_USER" "$KINBOT_DIR" "$KINBOT_DATA_DIR"
  success "Permissions set"
}

# ─── Resolve Bun binary path ─────────────────────────────────────────────────
resolve_bun_path() {
  BUN_BIN="$(command -v bun)"

  # On Linux, symlink to a stable system path so systemd can find it
  if [ "$OS" = "Linux" ] && [ "$BUN_BIN" != "/usr/local/bin/bun" ]; then
    if [ -f "$BUN_BIN" ]; then
      ln -sf "$BUN_BIN" /usr/local/bin/bun
      BUN_BIN="/usr/local/bin/bun"
      success "Bun symlinked to /usr/local/bin/bun"
    fi
  fi
}

# ─── Service: systemd (Linux) ────────────────────────────────────────────────
create_systemd_service() {
  header "Creating systemd service..."

  UNIT_FILE="/etc/systemd/system/kinbot.service"

  # Stop existing service before update
  if [ "$IS_UPDATE" = true ] && systemctl is-active --quiet kinbot 2>/dev/null; then
    info "Stopping existing service..."
    systemctl stop kinbot
  fi

  cat > "$UNIT_FILE" << UNIT
[Unit]
Description=KinBot — AI Agent Platform
After=network.target
StartLimitIntervalSec=60
StartLimitBurst=3

[Service]
Type=simple
User=$KINBOT_USER
Group=$KINBOT_USER
WorkingDirectory=$KINBOT_DIR
ExecStart=$BUN_BIN src/server/index.ts
Environment=NODE_ENV=production
Environment=PORT=$KINBOT_PORT
Environment=HOST=0.0.0.0
Environment=KINBOT_DATA_DIR=$KINBOT_DATA_DIR
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=kinbot

[Install]
WantedBy=multi-user.target
UNIT

  systemctl daemon-reload
  systemctl enable kinbot
  systemctl start kinbot
  success "systemd service enabled and started"
}

# ─── Service: launchd (macOS) ────────────────────────────────────────────────
create_launchd_service() {
  header "Creating launchd service..."

  PLIST_DIR="$HOME/Library/LaunchAgents"
  PLIST_PATH="$PLIST_DIR/io.kinbot.server.plist"
  LOG_DIR="$HOME/Library/Logs/kinbot"
  BUN_BIN="$(command -v bun)"

  mkdir -p "$PLIST_DIR" "$LOG_DIR"

  # Unload existing plist if present
  if [ -f "$PLIST_PATH" ]; then
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
  fi

  cat > "$PLIST_PATH" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>io.kinbot.server</string>

  <key>ProgramArguments</key>
  <array>
    <string>$BUN_BIN</string>
    <string>src/server/index.ts</string>
  </array>

  <key>WorkingDirectory</key>
  <string>$KINBOT_DIR</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key><string>production</string>
    <key>PORT</key><string>$KINBOT_PORT</string>
    <key>HOST</key><string>127.0.0.1</string>
    <key>KINBOT_DATA_DIR</key><string>$KINBOT_DATA_DIR</string>
    <key>PATH</key><string>$(dirname "$BUN_BIN"):/usr/local/bin:/usr/bin:/bin</string>
  </dict>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>$LOG_DIR/kinbot.log</string>

  <key>StandardErrorPath</key>
  <string>$LOG_DIR/kinbot-error.log</string>
</dict>
</plist>
PLIST

  launchctl load "$PLIST_PATH"
  success "launchd service loaded"
}

# ─── Create service (dispatch) ───────────────────────────────────────────────
create_service() {
  if [ "$INIT_SYSTEM" = "systemd" ]; then
    create_systemd_service
  else
    create_launchd_service
  fi
}

# ─── Summary ─────────────────────────────────────────────────────────────────
print_summary() {
  # Resolve local IP
  if [ "$OS" = "Linux" ]; then
    LOCAL_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")"
  else
    LOCAL_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")"
  fi

  ACTION="installed"
  [ "$IS_UPDATE" = true ] && ACTION="updated"

  echo ""
  echo -e "${BOLD}╔════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║   KinBot ${ACTION} successfully!          ${NC}"
  echo -e "${BOLD}╚════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${CYAN}Access URL:${NC}   http://$LOCAL_IP:$KINBOT_PORT"
  echo -e "  ${CYAN}Install dir:${NC}  $KINBOT_DIR"
  echo -e "  ${CYAN}Data dir:${NC}     $KINBOT_DATA_DIR"
  echo ""
  echo -e "  Visit the URL above to complete the setup wizard."
  echo -e "  You will need at least one AI provider API key"
  echo -e "  (Anthropic, OpenAI, or Google Gemini)."
  echo ""

  if [ "$INIT_SYSTEM" = "systemd" ]; then
    echo -e "  ${BOLD}Service commands:${NC}"
    echo -e "    sudo systemctl status kinbot"
    echo -e "    sudo systemctl restart kinbot"
    echo -e "    sudo journalctl -u kinbot -f"
  else
    echo -e "  ${BOLD}Service commands:${NC}"
    echo -e "    launchctl list | grep kinbot"
    echo -e "    tail -f ~/Library/Logs/kinbot/kinbot.log"
    echo -e "    launchctl unload ~/Library/LaunchAgents/io.kinbot.server.plist"
  fi

  echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${BOLD}KinBot Installer${NC}"
  echo -e "Self-hosted AI agent platform"
  echo -e "https://github.com/MarlBurroW/kinbot"
  echo ""

  detect_os
  check_prerequisites
  ensure_bun
  install_or_update
  build_kinbot
  setup_database
  create_system_user
  set_ownership
  resolve_bun_path
  create_service
  print_summary
}

main "$@"
