import { loadWordsForGrade, shuffle } from './wordUtils.js';
import { updateScore, updateProgressBar } from './uiUpdates.js';
import { saveScore } from './storage.js';
import { gameState, stopGame } from './main.js';

let challengeState = {
    currentWords: [],
    score: 0,
    timeLeft: 60,  // Set a time limit for the challenge mode (e.g., 60 seconds)
    timerInterval: null,
    isChallengeOver: false
};

export async function startChallengeMode() {
    // Reset challenge state
    challengeState.currentWords = await loadWordsForChallenge();  // Load challenge-specific words
    challengeState.score = 0;
    challengeState.timeLeft = 60;  // Reset the time for the challenge
    challengeState.isChallengeOver = false;

    // Display the challenge UI and hide other game elements
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('grade-buttons').style.display = 'none';

    // Start the challenge timer
    challengeState.timerInterval = setInterval(() => {
        challengeState.timeLeft -= 1;
        updateProgressBar(challengeState.timeLeft);  // Update the progress bar with time left

        if (challengeState.timeLeft <= 0) {
            endChallengeMode();  // End challenge when time runs out
        }
    }, 1000);

    loadChallengeQuestion();  // Load the first question for the challenge
}

async function loadWordsForChallenge() {
    // Load or shuffle words specifically for the challenge mode
    const words = await loadWordsForGrade('challenge');
    return shuffle(words);  // Example: Use 'challenge' grade to filter words
}

function loadChallengeQuestion() {
    if (challengeState.currentWords.length === 0) {
        // End the challenge if there are no more words
        endChallengeMode();
        return;
    }

    const word = challengeState.currentWords.pop();  // Get the next word
    // Update UI with the new word (add your own logic to display the word)
    document.getElementById('word-display').textContent = word;
}

function endChallengeMode() {
    clearInterval(challengeState.timerInterval);  // Stop the timer
    challengeState.isChallengeOver = true;

    // Hide the quiz area and show the end screen
    document.getElementById('quiz-area').style.display = 'none';
    alert(`Challenge Over! Your score: ${challengeState.score}`);

    // Optionally, save the challenge score to storage
    saveScore(`אתגר-${gameState.playerName}`, challengeState.score);

    // Call stopGame() to reset the game state
    stopGame();
}

export function checkChallengeAnswer(userAnswer) {
    if (challengeState.isChallengeOver) return;

    const correctAnswer = challengeState.currentWords[challengeState.currentWords.length - 1];  // Get the current word's correct answer
    if (userAnswer === correctAnswer) {
        challengeState.score += 1;  // Update score for correct answer
        updateScore(challengeState.score);
    }

    // Load the next question
    loadChallengeQuestion();
}
