import { setPlayerName, editName } from './player.js';
import { loadWordsForGrade, shuffle } from './wordUtils.js';
import { updateScore, updateProgressBar, viewLeaderboard } from './uiUpdates.js';
import { startGame, goBack, loadQuestion, checkAnswer, setDifficulty } from './gameLogic.js';
import { viewMistakes, returnToQuiz } from './mistakesHandler.js';
import { startChallengeMode } from './challengeMode.js';
import { loadStoredData, saveScore } from './storage.js';

export const gameState = {
    currentWords: [],
    score: 0,
    playerName: "",
    timerInterval: null,
    timeLeft: 10,
    currentCorrectAnswer: "",
    isReverseQuestion: false,
    currentWord: null,
    streak: 0,
    wordsLeft: 0
};

export const gameSettings = {
    difficultyLevel: 'medium',
    isChallengeMode: false,
    challengeTimeLeft: 0
};

export const correctSound = new Audio('audio/correct-sound.mp3');
export const incorrectSound = new Audio('audio/incorrect-sound.mp3');

function initializeGame() {
    loadStoredData();

    document.querySelectorAll('.grade-button').forEach(button => {
        button.addEventListener('click', () => startGame(button.value));
    });

    document.getElementById('view-mistakes-btn').addEventListener('click', viewMistakes);
    document.getElementById('leaderboard-btn').addEventListener('click', viewLeaderboard);
    document.getElementById('challenge-mode-btn').addEventListener('click', startChallengeMode);

    document.querySelectorAll('.difficulty-btn').forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.value);
            updateDifficultyButtons(button.value);
        });
    });

    document.querySelectorAll('.return-to-quiz-btn').forEach(button => {
        button.addEventListener('click', returnToQuiz);
    });

    document.getElementById('set-player-name-btn').addEventListener('click', setPlayerName);

    document.getElementById('back-button').addEventListener('click', goBack);

    const savedName = sessionStorage.getItem('playerName');
    if (savedName) {
        gameState.playerName = savedName;
        document.getElementById("player-name").value = gameState.playerName;
        setPlayerName();
    }

    updateDifficultyButtons(gameSettings.difficultyLevel);
}

window.onload = initializeGame;

export function updateGameState(newScore, newStreak) {
    gameState.score = newScore;
    gameState.streak = newStreak;
    saveScore(gameState.playerName, gameState.score);
    updateScore();
}

export function isPlaying() {
    return document.getElementById('quiz-area').style.display === 'block';
}

function updateDifficultyButtons(selectedDifficulty) {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.value === selectedDifficulty) {
            btn.classList.add('active');
        }
    });
}