export let mistakes = {};
export let leaderboard = {};

export function saveMistakes() {
    localStorage.setItem('mistakes', JSON.stringify(mistakes));
}

export function saveLeaderboard() {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

export function saveScore(playerName, score) {
    leaderboard[playerName] = Math.max(leaderboard[playerName] || 0, score);
    saveLeaderboard();
}

export function loadStoredData() {
    const storedMistakes = localStorage.getItem('mistakes');
    if (storedMistakes) {
        mistakes = JSON.parse(storedMistakes);
    }

    const storedLeaderboard = localStorage.getItem('leaderboard');
    if (storedLeaderboard) {
        leaderboard = JSON.parse(storedLeaderboard);
    }
}