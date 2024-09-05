export async function loadWordsForGrade(grade) {
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

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('grade-buttons').style.display = 'none';
    document.getElementById('view-mistakes-btn').style.display = 'none';
    document.getElementById('leaderboard-btn').style.display = 'none';
    document.getElementById('challenge-mode-btn').style.display = 'none';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}