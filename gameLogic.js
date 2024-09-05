import { loadWordsForGrade, shuffle } from './wordUtils.js';
import { updateScore, updateProgressBar } from './uiUpdates.js';
import { addMistake } from './mistakesHandler.js';
import { leaderboard, saveScore } from './storage.js';
import { 
    currentWords, score, playerName, timerInterval, timeLeft, currentCorrectAnswer, 
    isReverseQuestion, currentWord, streak, wordsLeft, 
    gameSettings, correctSound, incorrectSound, updateGameState
} from './main.js';

export async function startGame(selectedGrade) {
    if (!playerName) {
        alert("אנא הגדר את שמך לפני תחילת המשחק.");
        return;
    }
    currentWords = await loadWordsForGrade(selectedGrade);
    if (currentWords.length > 0) {
        shuffle(currentWords);
        score = leaderboard[playerName] || 0;
        streak = 0;
        wordsLeft = currentWords.length;
        updateScore();
        updateProgressBar();
        document.getElementById('grade-buttons').style.display = 'none';
        document.getElementById('view-mistakes-btn').style.display = 'none';
        document.getElementById('leaderboard-btn').style.display = 'none';
        document.getElementById('challenge-mode-btn').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'block';
        document.getElementById('difficulty-selector').style.display = 'block';
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
    document.getElementById('difficulty-selector').style.display = 'none';
    clearInterval(timerInterval);
    gameSettings.isChallengeMode = false;
}

export function loadQuestion() {
    if (currentWords.length === 0 || (gameSettings.isChallengeMode && gameSettings.challengeTimeLeft <= 0)) {
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

    currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    
    isReverseQuestion = Math.random() < 0.2;

    if (isReverseQuestion) {
        questionElement.textContent = `מה המילה באנגלית ל-"${currentWord.he}"?`;
        currentCorrectAnswer = currentWord.en;
    } else {
        questionElement.textContent = `מה המילה בעברית ל-"${currentWord.en}"?`;
        currentCorrectAnswer = currentWord.he;
    }

    const options = [currentCorrectAnswer];
    while (options.length < 4) {
        const randomWord = currentWords[Math.floor(Math.random() * currentWords.length)];
        const randomOption = isReverseQuestion ? randomWord.en : randomWord.he;
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
    clearInterval(timerInterval);
    const successMessage = document.getElementById("success");
    const failureMessage = document.getElementById("failure");
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        option.classList.add('disabled');
        option.onclick = null;
        if (option.textContent === currentCorrectAnswer) {
            option.classList.add('correct');
        }
    });

    if (selected === currentCorrectAnswer) {
        if (selectedElement) {
            selectedElement.classList.add('correct');
        }
        successMessage.style.display = "block";
        successMessage.textContent = "נכון! עובר לשאלה הבאה...";
        correctSound.play();
        score += calculateScore();
        streak++;
        updateGameState(score, streak);
        currentWords = currentWords.filter(word => word !== currentWord);
        wordsLeft--;
        setTimeout(() => {
            loadQuestion();
        }, 2000);
    } else {
        if (selectedElement) {
            selectedElement.classList.add('incorrect');
        }
        failureMessage.style.display = "block";
        failureMessage.textContent = `לא נכון! התשובה הנכונה היא: ${currentCorrectAnswer}`;
        incorrectSound.play();
        streak = 0;
        updateGameState(score, streak);
        addMistake({
            question: isReverseQuestion ? currentWord.he : currentWord.en,
            correctAnswer: currentCorrectAnswer,
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
    return baseScore + Math.floor(streak / 5) * 5; // Streak bonus
}

function startTimer() {
    if (gameSettings.isChallengeMode) {
        updateChallengeTimer();
    } else {
        switch (gameSettings.difficultyLevel) {
            case 'easy':
                timeLeft = 15;
                break;
            case 'medium':
                timeLeft = 10;
                break;
            case 'hard':
                timeLeft = 7;
                break;
        }
        updateTimerDisplay();
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                checkAnswer(null, "");
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `זמן שנותר: ${timeLeft} שניות`;
}

function updateChallengeTimer() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `זמן שנותר: ${gameSettings.challengeTimeLeft} שניות`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameSettings.challengeTimeLeft--;
        timerElement.textContent = `זמן שנותר: ${gameSettings.challengeTimeLeft} שניות`;
        if (gameSettings.challengeTimeLeft <= 0) {
            clearInterval(timerInterval);
            alert("זמן האתגר הסתיים!");
            goBack();
        }
    }, 1000);
}

export function setDifficulty(level) {
    gameSettings.difficultyLevel = level;
}