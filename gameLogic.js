import { loadWordsForGrade, shuffle } from './wordUtils.js';
import { updateScore, updateProgressBar } from './uiUpdates.js';
import { addMistake } from './mistakesHandler.js';
import { leaderboard, saveScore } from './storage.js';
import { 
    gameState, gameSettings, correctSound, incorrectSound, updateGameState
} from './main.js';

export async function startGame(selectedGrade) {
    if (!gameState.playerName) {
        alert("אנא הגדר את שמך לפני תחילת המשחק.");
        return;
    }
    gameState.currentWords = await loadWordsForGrade(selectedGrade);
    if (gameState.currentWords.length > 0) {
        shuffle(gameState.currentWords);
        gameState.score = leaderboard[gameState.playerName] || 0;
        gameState.streak = 0;
        gameState.wordsLeft = gameState.currentWords.length;
        gameState.initialNumberOfWords = gameState.currentWords.length;
        updateScore();
        updateProgressBar();
        document.getElementById('grade-buttons').style.display = 'none';
        document.getElementById('view-mistakes-btn').style.display = 'none';
        document.getElementById('leaderboard-btn').style.display = 'none';
        document.getElementById('challenge-mode-btn').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'block';
        document.getElementById('difficulty-selector').style.display = 'none';
        loadQuestion();
    } else {
        alert("לא ניתן היה לטעון מילים. אנא נסה שוב.");
        document.getElementById('grade-buttons').style.display = 'grid';
        document.getElementById('view-mistakes-btn').style.display = 'block';
        document.getElementById('leaderboard-btn').style.display = 'block';
        document.getElementById('challenge-mode-btn').style.display = 'block';
    }
}

export function goBack() {
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('mistakes-area').style.display = 'none';
    document.getElementById('leaderboard-area').style.display = 'none';
    document.getElementById('grade-buttons').style.display = 'grid';
    document.getElementById('view-mistakes-btn').style.display = 'block';
    document.getElementById('leaderboard-btn').style.display = 'block';
    document.getElementById('challenge-mode-btn').style.display = 'block';
    document.getElementById('difficulty-selector').style.display = 'block';
    clearInterval(gameState.timerInterval);
    gameSettings.isChallengeMode = false;
}

export function loadQuestion() {
    if (gameState.currentWords.length === 0 || (gameSettings.isChallengeMode && gameSettings.challengeTimeLeft <= 0)) {
        alert("כל הכבוד! סיימת את כל המילים.");
        goBack();
        return;
    }

    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const successMessage = document.getElementById("success");
    const failureMessage = document.getElementById("failure");

    successMessage.style.display = "none";
    failureMessage.style.display = "none";

    gameState.currentWord = gameState.currentWords[Math.floor(Math.random() * gameState.currentWords.length)];
    
    gameState.isReverseQuestion = Math.random() < 0.2;

    if (gameState.isReverseQuestion) {
        questionElement.textContent = `מה המילה באנגלית ל-"${gameState.currentWord.he}"?`;
        gameState.currentCorrectAnswer = gameState.currentWord.en;
    } else {
        questionElement.textContent = `מה המילה בעברית ל-"${gameState.currentWord.en}"?`;
        gameState.currentCorrectAnswer = gameState.currentWord.he;
    }

    const options = [gameState.currentCorrectAnswer];
    while (options.length < 4) {
        const randomWord = gameState.currentWords[Math.floor(Math.random() * gameState.currentWords.length)];
        const randomOption = gameState.isReverseQuestion ? randomWord.en : randomWord.he;
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    shuffle(options);

    optionsElement.innerHTML = '';
    options.forEach(option => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("option");
        optionElement.textContent = option;
        optionElement.onclick = () => checkAnswer(optionElement, option);
        optionsElement.appendChild(optionElement);
    });

    startTimer();
    updateProgressBar();

    // Add animation for question transition
    questionElement.style.animation = 'fadeIn 0.5s';
    optionsElement.style.animation = 'fadeIn 0.5s';
}

export function checkAnswer(selectedElement, selected) {
    clearInterval(gameState.timerInterval);
    const successMessage = document.getElementById("success");
    const failureMessage = document.getElementById("failure");
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        option.classList.add('disabled');
        option.onclick = null;
        if (option.textContent === gameState.currentCorrectAnswer) {
            option.classList.add('correct');
        }
    });

    if (selected === gameState.currentCorrectAnswer) {
        if (selectedElement) {
            selectedElement.classList.add('correct');
        }
        successMessage.style.display = "block";
        successMessage.textContent = "נכון! עובר לשאלה הבאה...";
        correctSound.play();
        gameState.score += calculateScore();
        gameState.streak++;
        updateGameState(gameState.score, gameState.streak);
        gameState.currentWords = gameState.currentWords.filter(word => word !== gameState.currentWord);
        gameState.wordsLeft--;
        setTimeout(() => {
            loadQuestion();
        }, 2000);
    } else {
        if (selectedElement) {
            selectedElement.classList.add('incorrect');
        }
        failureMessage.style.display = "block";
        failureMessage.textContent = `לא נכון! התשובה הנכונה היא: ${gameState.currentCorrectAnswer}`;
        incorrectSound.play();
        gameState.streak = 0;
        updateGameState(gameState.score, gameState.streak);
        addMistake({
            question: gameState.isReverseQuestion ? gameState.currentWord.he : gameState.currentWord.en,
            correctAnswer: gameState.currentCorrectAnswer,
            userAnswer: selected || "לא נענה"
        });
        setTimeout(() => {
            loadQuestion();
        }, 3000);
    }

    // Add animation for answer reveal
    successMessage.style.animation = 'fadeIn 0.5s';
    failureMessage.style.animation = 'fadeIn 0.5s';
}

function calculateScore() {
    let baseScore = 10;
    switch (gameSettings.difficultyLevel) {
        case 'easy':
            baseScore = 5;
            break;
        case 'hard':
            baseScore = 15;
            break;
    }
    return baseScore + Math.floor(gameState.streak / 5) * 5; // Streak bonus
}

function startTimer() {
    if (gameSettings.isChallengeMode) {
        updateChallengeTimer();
    } else {
        switch (gameSettings.difficultyLevel) {
            case 'easy':
                gameState.timeLeft = 15;
                break;
            case 'medium':
                gameState.timeLeft = 10;
                break;
            case 'hard':
                gameState.timeLeft = 7;
                break;
        }
        updateTimerDisplay();
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(() => {
            gameState.timeLeft--;
            updateTimerDisplay();
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                checkAnswer(null, "");
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `זמן שנותר: ${gameState.timeLeft} שניות`;
}

function updateChallengeTimer() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `זמן שנותר: ${gameSettings.challengeTimeLeft} שניות`;
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameSettings.challengeTimeLeft--;
        timerElement.textContent = `זמן שנותר: ${gameSettings.challengeTimeLeft} שניות`;
        if (gameSettings.challengeTimeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            alert("זמן האתגר הסתיים!");
            goBack();
        }
    }, 1000);
}

export function setDifficulty(level) {
    gameSettings.difficultyLevel = level;
}