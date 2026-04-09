# Tiki Topple Game

A multiplayer strategy card game where players compete to position their tiki totems favorably.

## How to Play
- Each player has secret tiki objectives worth points
- Players take turns playing cards to move tikis up/down the totem pole
- Score points based on your tikis' final positions each round
- Most points after all rounds wins!

## Running Locally
1. Clone the repo
2. Install server dependencies: `cd server && npm install`
3. Install client dependencies: `cd client && npm install`
4. Start the server: `cd server && npm start`
5. Start the client: `cd client && npm start`
6. Open http://localhost:3000

## Game Rules
- **TikiUp**: Move a tiki up the pole by 1, 2, or 3 positions
- **TikiToast**: Remove the bottom tiki (cannot be first move of round)
- **TikiTopple**: Send any tiki to the bottom of the pole

## Scoring
- Position 1 (top): 3 points
- Position 2: 2 points
- Position 3: 1 point
- Lower positions: 0 points