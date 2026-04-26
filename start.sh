#!/bin/bash
# start.sh — run from the MARGanti/ root directory
# Starts all three services in parallel with colour-coded output.
# Kills all on Ctrl+C.

set -e

# Terminal colours
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[M.A.R.G.] Starting all services...${NC}"

# Health check helper
wait_for_health() {
  local url=$1
  local name=$2
  local max=20
  for i in $(seq 1 $max); do
    if curl -sf "$url" > /dev/null 2>&1; then
      echo -e "${GREEN}[✓] $name is healthy${NC}"
      return 0
    fi
    sleep 1
  done
  echo -e "${RED}[✗] $name failed to start after ${max}s${NC}"
  return 1
}

# Start Python AI engine
(
  cd backend-python
  source venv/bin/activate 2>/dev/null || true
  echo -e "${BLUE}[Python] Starting AI Engine on :8000${NC}"
  uvicorn main:app --host 0.0.0.0 --port 8000 2>&1 | sed "s/^/[Python] /"
) &
PYTHON_PID=$!

# Start Node orchestrator
(
  cd backend-node
  echo -e "${RED}[Node] Starting Orchestrator on :4000${NC}"
  npm run dev 2>&1 | sed "s/^/[Node]   /"
) &
NODE_PID=$!

# Start React frontend
(
  cd frontend
  echo -e "${GREEN}[React] Starting UI on :5173${NC}"
  npm run dev 2>&1 | sed "s/^/[React]  /"
) &
REACT_PID=$!

# Wait for services to be ready
sleep 3
wait_for_health "http://localhost:8000/health" "Python AI Engine"
wait_for_health "http://localhost:4000/health"  "Node Orchestrator"

echo -e "${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  M.A.R.G. is running"
echo "  Frontend  → http://localhost:5173"
echo "  Node API  → http://localhost:4000"
echo "  Python AI → http://localhost:8000"
echo "  Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Trap Ctrl+C and kill all background processes
trap "echo 'Shutting down...'; kill $PYTHON_PID $NODE_PID $REACT_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
