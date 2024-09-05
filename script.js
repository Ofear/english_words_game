let currentWords = [];
let score = 0;
let playerName = "";
let timerInterval;
let timeLeft = 10;
let currentCorrectAnswer = "";
let isReverseQuestion = false;
let mistakes = [];
let currentWord = null;

function setPlayerName() {
    const nameInput = document.getElementById("player-name");
    playerName = nameInput.value.trim();
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
        updateScore();
    } else {
        alert("אנא הכנס את שמך.");
    }
}

function editName() {
    const nameInput = document.getElementById("name-input");
    const nameDisplay = document.getElementById("name-display");
    const playerNameInput = document.getElementById("player-name");
    
    nameDisplay.style.display = "none";
    nameInput.style.display = "block";
    playerNameInput.value = playerName;
    playerNameInput.focus();
}

async function loadWordsForGrade(grade) {
    showLoader();
    if (grade === 'all') {
        try {
            const response = await fetch('words/hebrew-english-translations-grade-all.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            hideLoader();
            return data.words;
        } catch (error) {
            console.error('Error loading all words:', error);
            hideLoader();
            return [];
        }
    } else {
        const words = [];
        for (let i = 1; i <= grade; i++) {
            try {
                const response = await fetch(`words/hebrew-english-translations-grade-${i}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                words.push(...data.words);
            } catch (error) {
                console.error(`Error loading words for grade ${i}:`, error);
            }
        }
        hideLoader();
        return words;
    }
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('grade-buttons').style.display = 'none';
    document.getElementById('view-mistakes-btn').style.display = 'none';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

document.querySelectorAll('.grade-button').forEach(button => {
    button.addEventListener('click', async () => {
        if (!playerName) {
            alert("אנא הגדר את שמך לפני תחילת המשחק.");
            return;
        }
        const selectedGrade = button.value;
        currentWords = await loadWordsForGrade(selectedGrade);
        if (currentWords.length > 0) {
            shuffle(currentWords);
            score = 0;
            mistakes = [];
            updateScore();
            document.getElementById('grade-buttons').style.display = 'none';
            document.getElementById('view-mistakes-btn').style.display = 'none';
            document.getElementById('quiz-area').style.display = 'block';
            loadQuestion();
        } else {
            alert("לא ניתן היה לטעון מילים. אנא נסה שוב.");
            document.getElementById('grade-buttons').style.display = 'grid';
            document.getElementById('view-mistakes-btn').style.display = 'block';
        }
    });
});

function goBack() {
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('mistakes-area').style.display = 'none';
    document.getElementById('grade-buttons').style.display = 'grid';
    document.getElementById('view-mistakes-btn').style.display = 'block';
    score = 0;
    updateScore();
    clearInterval(timerInterval);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = `ניקוד: ${score}`;
}

function loadQuestion() {
    if (currentWords.length === 0) {
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
}

function checkAnswer(selectedElement, selected) {
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
        score++;
        updateScore();
        // Remove the correctly answered word from the list
        currentWords = currentWords.filter(word => word !== currentWord);
        setTimeout(() => {
            loadQuestion();
        }, 2000);
    } else {
        if (selectedElement) {
            selectedElement.classList.add('incorrect');
        }
        failureMessage.style.display = "block";
        failureMessage.textContent = `לא נכון! התשובה הנכונה היא: ${currentCorrectAnswer}`;
        mistakes.push({
            question: isReverseQuestion ? currentWord.he : currentWord.en,
            correctAnswer: currentCorrectAnswer,
            userAnswer: selected || "לא נענה"
        });
        setTimeout(() => {
            loadQuestion();
        }, 3000);
    }
}

function startTimer() {
    timeLeft = 10;
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

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `זמן שנותר: ${timeLeft} שניות`;
}

function viewMistakes() {
    document.getElementById('grade-buttons').style.display = 'none';
    document.getElementById('view-mistakes-btn').style.display = 'none';
    document.getElementById('mistakes-area').style.display = 'block';
    const mistakesBody = document.getElementById('mistakes-body');
    mistakesBody.innerHTML = '';
    mistakes.forEach(mistake => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mistake.question}</td>
            <td>${mistake.correctAnswer}</td>
            <td>${mistake.userAnswer}</td>
        `;
        mistakesBody.appendChild(row);
    });
}

function returnToQuiz() {
    document.getElementById('mistakes-area').style.display = 'none';
    document.getElementById('grade-buttons').style.display = 'grid';
    document.getElementById('view-mistakes-btn').style.display = 'block';
}

// Initialize score display and load player name from session storage if available
window.onload = function() {
    updateScore();
    const savedName = sessionStorage.getItem('playerName');
    if (savedName) {
        playerName = savedName;
        document.getElementById("player-name").value = playerName;
        setPlayerName();
    }
};