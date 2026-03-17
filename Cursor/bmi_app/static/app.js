const API_BASE = '';

// BMI categories
const BMI_CATEGORIES = {
    underweight: { max: 18.5, label: 'Underweight', interpretation: 'You may need to gain weight.' },
    normal: { max: 24.9, label: 'Normal', interpretation: 'You have a healthy body weight.' },
    overweight: { max: 29.9, label: 'Overweight', interpretation: 'Consider a balanced diet and exercise.' },
    obese: { max: Infinity, label: 'Obese', interpretation: 'Consult a healthcare provider for guidance.' }
};

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
}

function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

async function saveToDatabase(weight, height, bmi, name = '') {
    try {
        const response = await fetch(`${API_BASE}/api/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight, height, bmi: parseFloat(bmi), name })
        });
        const data = await response.json();
        return data.success;
    } catch (err) {
        console.error('Failed to save to database:', err);
        return false;
    }
}

async function fetchHistory() {
    try {
        const response = await fetch(`${API_BASE}/api/history`);
        const data = await response.json();
        return data.history || [];
    } catch (err) {
        console.error('Failed to fetch history:', err);
        return [];
    }
}

async function deleteEntry(id) {
    try {
        const response = await fetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE' });
        const data = await response.json();
        return data.success;
    } catch (err) {
        console.error('Failed to delete:', err);
        return false;
    }
}

function displayResult(bmi, category) {
    const resultEl = document.getElementById('result');
    const bmiValueEl = document.getElementById('bmi-value');
    const categoryEl = document.getElementById('bmi-category');
    const interpretationEl = document.getElementById('bmi-interpretation');

    bmiValueEl.textContent = bmi;
    categoryEl.textContent = category.label;
    categoryEl.className = `bmi-category ${getBMICategory(parseFloat(bmi))}`;
    interpretationEl.textContent = category.interpretation;
    resultEl.classList.remove('hidden');
}

function renderHistory(history) {
    const listEl = document.getElementById('history-list');
    const emptyState = document.getElementById('empty-state');

    if (history.length === 0) {
        emptyState.style.display = 'block';
        listEl.querySelectorAll('.history-item').forEach(el => el.remove());
        return;
    }

    emptyState.style.display = 'none';
    const existingItems = listEl.querySelectorAll('.history-item');
    existingItems.forEach(el => el.remove());

    history.slice(0, 10).forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(entry.created_at).toLocaleDateString(undefined, { 
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
        item.innerHTML = `
            <div>
                <span class="bmi-badge">BMI ${entry.bmi}</span>
                ${entry.name ? `<span>${entry.name}</span>` : ''}
                <span class="date">${date}</span>
            </div>
            <button class="delete-btn" data-id="${entry.id}" title="Delete">×</button>
        `;
        listEl.insertBefore(item, emptyState);

        item.querySelector('.delete-btn').addEventListener('click', async () => {
            const ok = await deleteEntry(entry.id);
            if (ok) loadHistory();
        });
    });
}

async function loadHistory() {
    const history = await fetchHistory();
    renderHistory(history);
}

document.getElementById('bmi-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const name = document.getElementById('name').value.trim();

    if (!weight || !height || weight < 20 || weight > 300 || height < 50 || height > 250) {
        alert('Please enter valid weight (20-300 kg) and height (50-250 cm).');
        return;
    }

    const bmi = calculateBMI(weight, height);
    const category = BMI_CATEGORIES[getBMICategory(parseFloat(bmi))];

    displayResult(bmi, category);

    const saved = await saveToDatabase(weight, height, bmi, name);
    if (saved) loadHistory();
});

loadHistory();
