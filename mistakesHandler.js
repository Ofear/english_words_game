import { mistakes, saveMistakes } from './storage.js';
import { playerName } from './main.js';

export function viewMistakes() {
    document.getElementById('grade-buttons').style.display = 'none';
    document.getElementById('view-mistakes-btn').style.display = 'none';
    document.getElementById('leaderboard-btn').style.display = 'none';
    document.getElementById('challenge-mode-btn').style.display = 'none';
    document.getElementById('mistakes-area').style.display = 'block';
    const mistakesBody = document.getElementById('mistakes-body');
    mistakesBody.innerHTML = '';

    for (const [player, playerMistakes] of Object.entries(mistakes)) {
        if (playerMistakes.length > 0) {
            const playerHeader = document.createElement('tr');
            playerHeader.innerHTML = `<th colspan="3">${player}</th>`;
            mistakesBody.appendChild(playerHeader);

            playerMistakes.forEach(mistake => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${mistake.question}</td>
                    <td>${mistake.correctAnswer}</td>
                    <td>${mistake.userAnswer}</td>
                `;
                mistakesBody.appendChild(row);
            });
        }
    }

    if (mistakesBody.children.length === 0) {
        mistakesBody.innerHTML = '<tr><td colspan="3">אין טעויות להצגה</td></tr>';
    }
}

export function returnToQuiz() {
    document.getElementById('mistakes-area').style.display = 'none';
    document.getElementById('leaderboard-area').style.display = 'none';
    document.getElementById('grade-buttons').style.display = 'grid';
    document.getElementById('view-mistakes-btn').style.display = 'block';
    document.getElementById('leaderboard-btn').style.display = 'block';
    document.getElementById('challenge-mode-btn').style.display = 'block';
}

export function addMistake(mistake) {
    if (!mistakes[playerName]) {
        mistakes[playerName] = [];
    }
    mistakes[playerName].push(mistake);
    saveMistakes();
}