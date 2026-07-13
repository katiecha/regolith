#!/usr/bin/env bash
# Run the Next.js dev server detached from the terminal, and tear it down cleanly.
set -euo pipefail

cd "$(dirname "$0")/.."

PID_FILE=".next/dev-server.pid"
LOG_FILE=".next/dev-server.log"

start() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Dev server already running (PID $(cat "$PID_FILE"))."
    status
    exit 0
  fi

  mkdir -p .next
  nohup npx next dev -p 0 > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  disown

  sleep 1
  echo "Dev server started (PID $(cat "$PID_FILE"))."
  grep -m1 "Local:" "$LOG_FILE" 2>/dev/null || echo "(still booting — check $LOG_FILE)"
}

stop() {
  if [ ! -f "$PID_FILE" ]; then
    echo "No PID file found; nothing to stop."
    exit 0
  fi

  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    # next dev spawns a next-server child; kill that too, not just the wrapper.
    pkill -P "$PID" 2>/dev/null || true
    kill "$PID" 2>/dev/null || true
    for _ in $(seq 1 10); do
      kill -0 "$PID" 2>/dev/null || break
      sleep 0.5
    done
    kill -0 "$PID" 2>/dev/null && kill -9 "$PID" 2>/dev/null || true
  fi

  rm -f "$PID_FILE"
  echo "Dev server stopped."
}

status() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Running (PID $(cat "$PID_FILE"))."
    grep -m1 "Local:" "$LOG_FILE" 2>/dev/null || true
  else
    echo "Not running."
  fi
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  *) echo "Usage: $0 {start|stop|status}"; exit 1 ;;
esac
