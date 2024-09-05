import { gameSettings } from './main.js';
import { loadQuestion } from './gameLogic.js';

export function startChallengeMode() {
    gameSettings.isChallengeMode = true;
    gameSettings.challengeTimeLeft = 60; // 1 minute challenge
    document.getElementById('grade-buttons').style.display = 'none';
    document.getElementById('view-mistakes-btn').style.display = 'none';
    document.getElementById('leaderboard-btn').style.display = 'none';
    document.getElementById('challenge-mode-btn').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';
    loadQuestion();
}