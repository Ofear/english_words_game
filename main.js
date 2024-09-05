import { setPlayerName, editName } from './player.js';
import { loadWordsForGrade, shuffle } from './wordUtils.js';
import { updateScore, updateProgressBar, viewLeaderboard } from './uiUpdates.js';
import { startGame, goBack, loadQuestion, checkAnswer, setDifficulty } from './gameLogic.js';
import { viewMistakes, returnToQuiz } from './mistakesHandler.js';
import { startChallengeMode } from './challengeMode.js';
import { loadStoredData, saveScore } from './storage.js';

export let currentWords = [];
export let score = 0;
export let playerName = "";
export let timerInterval;
export let timeLeft = 10;
export let currentCorrectAnswer = "";
export let isReverseQuestion = false;
export let currentWord = null;
export let streak = 0;
export let wordsLeft = 0;
export let isChallengeMode = false;
export let challengeTimeLeft = 0;

export const gameSettings = {
    difficultyLevel: 'medium'
};

export const correctSound = new Audio('path/to/correct-sound.mp3');
export const incorrectSound = new Audio('path/to/incorrect-sound.mp3');

function initializeGame() {
    loadStoredData();

    document.querySelectorAll('.grade-button').forEach(button => {
        button.addEventListener('click', () => startGame(button.value));
    });

    document.getElementById('view-mistakes-btn').addEventListener('click', viewMistakes);
    document.getElementById('leaderboard-btn').addEventListener('click', viewLeaderboard);
    document.getElementById('challenge-mode-btn').addEventListener('click', startChallengeMode);

    document.querySelectorAll('.difficulty-btn').forEach(button => {
        button.addEventListener('click', () => setDifficulty(button.value));
    });

    document.querySelectorAll('.return-to-quiz-btn').forEach(button => {
        button.addEventListener('click', returnToQuiz);
    });

    document.getElementById('set-player-name-btn').addEventListener('click', setPlayerName);

    document.getElementById('back-button').addEventListener('click', goBack);

    const savedName = sessionStorage.getItem('playerName');
    if (savedName) {
        playerName = savedName;
        document.getElementById("player-name").value = playerName;
        setPlayerName();
    }
}

window.onload = initializeGame;

export function updateGameState(newScore, newStreak) {
    score = newScore;
    streak = newStreak;
    saveScore(playerName, score);
    updateScore();
}

export function isPlaying() {
    return document.getElementById('quiz-area').style.display === 'block';
}