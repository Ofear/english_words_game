import { gameState, gameSettings } from './main.js';
import { leaderboard } from './storage.js';

export function updateScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = `ניקוד: ${gameState.score} | רצף: ${gameState.streak}`;
}

export function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const percentage = ((gameState.currentWords.length - gameState.wordsLeft) / gameState.currentWords.length) * 100;
    progressBar.style.width = `100%`;
    progressBar.style.background = `linear-gradient(to right, lightblue ${100-percentage}%, lightgreen ${percentage})`;
    progressBar.textContent = `${gameState.wordsLeft} מילים נותרו`;
}

export function viewLeaderboard() {
    document.getElementById('grade-buttons').style.display = 'none';
    document.getElementById('view-mistakes-btn').style.display = 'none';
    document.getElementById('leaderboard-btn').style.display = 'none';
    document.getElementById('challenge-mode-btn').style.display = 'none';
    document.getElementById('leaderboard-area').style.display = 'block';
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    const sortedLeaderboard = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

    sortedLeaderboard.forEach(([player, score], index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player}</td>
            <td>${score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

export function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}