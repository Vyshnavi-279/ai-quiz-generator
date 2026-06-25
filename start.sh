#!/bin/bash
echo "Killing old processes..."
lsof -ti:5000,5001,5173,5174 | xargs kill -9 2>/dev/null
sleep 2

echo "Starting parser..."
osascript -e 'tell app "Terminal" to do script "cd ~/ai-quiz-generator/parser && source venv/bin/activate && python app.py"'

echo "Starting backend..."
osascript -e 'tell app "Terminal" to do script "cd ~/ai-quiz-generator/backend && npm run dev"'

echo "Starting frontend..."
osascript -e 'tell app "Terminal" to do script "cd ~/ai-quiz-generator/frontend && npm run dev"'

echo "Opening browser in 3 seconds..."
sleep 3
open http://localhost:5173
