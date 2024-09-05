import { updateScore } from './uiUpdates.js';
import { mistakes, leaderboard, saveScore } from './storage.js';
import { gameState, isPlaying } from './main.js';

export function setPlayerName() {
    const nameInput = document.getElementById("player-name");
    const playerName = nameInput.value.trim();
    if (playerName) {
        sessionStorage.setItem('playerName', playerName);
        document.getElementById("name-input").style.display = "none";
        const nameDisplay = document.getElementById("name-display");
        nameDisplay.textContent = `שחקן: ${playerName}`;
        nameDisplay.style.display = "inline";
        const changePlayerButton = document.createElement("button");
        changePlayerButton.textContent = "החלף שחקן";
        changePlayerButton.onclick = changePlayer;
        changePlayerButton.id = "change-player-btn";
        nameDisplay.appendChild(changePlayerButton);
        document.getElementById("grade-buttons").style.display = "grid";
        document.getElementById("view-mistakes-btn").style.display = "block";
        document.getElementById("leaderboard-btn").style.display = "block";
        document.getElementById("challenge-mode-btn").style.display = "block";
        if (!mistakes[playerName]) {
            mistakes[playerName] = [];
        }
        if (!leaderboard[playerName]) {
            leaderboard[playerName] = 0;
        }
        gameState.playerName = playerName;
        updateScore();
    } else {
        alert("אנא הכנס את שמך.");
    }
}

export function changePlayer() {
    if (isPlaying()) {
        alert("לא ניתן להחליף שחקן במהלך המשחק.");
        return;
    }
    const nameInput = document.getElementById("name-input");
    const nameDisplay = document.getElementById("name-display");
    const playerNameInput = document.getElementById("player-name");
    
    nameDisplay.style.display = "none";
    nameInput.style.display = "block";
    playerNameInput.value = "";
    playerNameInput.focus();
    
    // Reset game state for new player
    gameState.score = 0;
    gameState.streak = 0;
    updateScore();
}