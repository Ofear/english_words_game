import { updateScore } from './uiUpdates.js';
import { mistakes, leaderboard, saveScore } from './storage.js';
import { isPlaying } from './main.js';

export function setPlayerName() {
    const nameInput = document.getElementById("player-name");
    const playerName = nameInput.value.trim();
    if (playerName) {
        sessionStorage.setItem('playerName', playerName);
        document.getElementById("name-input").style.display = "none";
        const nameDisplay = document.getElementById("name-display");
        nameDisplay.textContent = `שחקן: ${playerName}`;
        nameDisplay.style.display = "inline";
        const editButton = document.createElement("button");
        editButton.innerHTML = "&#9998;"; // Pen icon
        editButton.onclick = editName;
        editButton.id = "edit-name-btn";
        nameDisplay.appendChild(editButton);
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
        updateScore();
    } else {
        alert("אנא הכנס את שמך.");
    }
}

export function editName() {
    if (isPlaying()) {
        alert("לא ניתן לשנות שם במהלך המשחק.");
        return;
    }
    const nameInput = document.getElementById("name-input");
    const nameDisplay = document.getElementById("name-display");
    const playerNameInput = document.getElementById("player-name");
    
    nameDisplay.style.display = "none";
    nameInput.style.display = "block";
    playerNameInput.value = playerName;
    playerNameInput.focus();
}