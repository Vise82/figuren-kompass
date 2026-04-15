// ===== DATEN =====
const figurenDaten = {
    Tom: {
        eigenschaften: [
            "timide",
            "courageux",
            "ami d'Elsa",
            "n'aime pas parler devant la classe"
        ],
        farbe: "#667eea"
    },
    Elsa: {
        eigenschaften: [
            "sûre d'elle",
            "voit mal",
            "veut participer à l'échange",
            "aide Tom à parler"
        ],
        farbe: "#764ba2"
    },
    Hugo: {
        eigenschaften: [
            "drôle",
            "parfois méchant",
            "ancien ami de Jakob",
            "différent maintenant"
        ],
        farbe: "#f2994a"
    },
    Jakob: {
        eigenschaften: [
            "habite avec ses grands-parents",
            "correspondant de Tom",
            "vit à Tübingen",
            "ancien ami d'Hugo"
        ],
        farbe: "#56ab2f"
    }
};

// ===== SPIELSTATUS =====
let score = 0;
let correct = 0;
let wrong = 0;
let hintsUsed = 0;

// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    // Eigenschaften-Pool erstellen
    const pool = document.getElementById('eigenschaften-pool');
    pool.innerHTML = '';
    
    // Alle Eigenschaften sammeln und mischen
    const alleEigenschaften = [];
    Object.keys(figurenDaten).forEach(figur => {
        figurenDaten[figur].eigenschaften.forEach(eigenschaft => {
            alleEigenschaften.push({
                text: eigenschaft,
                figur: figur
            });
        });
    });
    
    // Mischen (Fisher-Yates Shuffle)
    shuffleArray(alleEigenschaften);
    
    // Eigenschaften-Karten erstellen
    alleEigenschaften.forEach((item, index) => {
        const eigenschaftDiv = document.createElement('div');
        eigenschaftDiv.className = 'eigenschaft';
        eigenschaftDiv.textContent = item.text;
        eigenschaftDiv.draggable = true;
        eigenschaftDiv.dataset.figur = item.figur;
        eigenschaftDiv.dataset.id = index;
        
        // Drag Events
        eigenschaftDiv.addEventListener('dragstart', handleDragStart);
        eigenschaftDiv.addEventListener('dragend', handleDragEnd);
        
        pool.appendChild(eigenschaftDiv);
    });
    
    // Drop Zones einrichten
    setupDropZones();
}

function setupDropZones() {
    const dropzones = document.querySelectorAll('.figur-dropzone');
    
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

// ===== DRAG & DROP FUNKTIONEN =====
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const dropzone = e.currentTarget;
    dropzone.classList.remove('drag-over');
    
    if (draggedElement) {
        // Hint entfernen wenn vorhanden
        const hint = dropzone.querySelector('.dropzone-hint');
        if (hint) {
            hint.remove();
        }
        
        // Element zur Dropzone hinzufügen
        dropzone.appendChild(draggedElement);
        draggedElement = null;
    }
    
    return false;
}

// ===== BUTTON FUNKTIONEN =====
function setupEventListeners() {
    document.getElementById('check-btn').addEventListener('click', checkAnswers);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    document.getElementById('hint-btn').addEventListener('click', giveHint);
}

function checkAnswers() {
    const dropzones = document.querySelectorAll('.figur-dropzone');
    let totalCorrect = 0;
    let totalWrong = 0;
    
    dropzones.forEach(zone => {
        const figurName = zone.dataset.figur;
        const eigenschaften = zone.querySelectorAll('.eigenschaft');
        
        eigenschaften.forEach(eigenschaft => {
            const correctFigur = eigenschaft.dataset.figur;
            
            if (correctFigur === figurName) {
                eigenschaft.classList.add('correct');
                eigenschaft.classList.remove('incorrect');
                eigenschaft.draggable = false;
                totalCorrect++;
            } else {
                eigenschaft.classList.add('incorrect');
                eigenschaft.classList.remove('correct');
                totalWrong++;
            }
        });
    });
    
    // Score aktualisieren
    correct = totalCorrect;
    wrong = totalWrong;
    score = (totalCorrect * 10) - (totalWrong * 5);
    updateScore();
    
    // Feedback anzeigen
    showFeedback(totalCorrect, totalWrong);
    
    // Wenn alles richtig: Beziehungsnetz zeigen
    if (totalWrong === 0 && totalCorrect === 16) {
        setTimeout(() => {
            showBeziehungsnetz();
        }, 2000);
    }
}

function showFeedback(correctCount, wrongCount) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden', 'success', 'error', 'info');
    
    if (wrongCount === 0 && correctCount === 16) {
        feedback.className = 'feedback success';
        feedback.innerHTML = `
            🎉 <strong>Parfait!</strong> Du hast alle Eigenschaften richtig zugeordnet!<br>
            Score: ${score} Punkte
        `;
    } else if (wrongCount === 0 && correctCount > 0) {
        feedback.className = 'feedback success';
        feedback.innerHTML = `
            ✓ <strong>Gut!</strong> Alle bisherigen Zuordnungen sind richtig!<br>
            Weiter so! (${correctCount}/16)
        `;
    } else {
        feedback.className = 'feedback error';
        feedback.innerHTML = `
            ⚠️ <strong>Fast!</strong> ${correctCount} richtig, ${wrongCount} falsch.<br>
            Die falschen Karten sind rot markiert. Versuche es nochmal!
        `;
    }
}

function resetGame() {
    // Alle Eigenschaften zurück zum Pool
    const eigenschaften = document.querySelectorAll('.eigenschaft');
    eigenschaften.forEach(e => {
        e.classList.remove('correct', 'incorrect');
        e.draggable = true;
    });
    
    // Dropzone-Hints wiederherstellen
    const dropzones = document.querySelectorAll('.figur-dropzone');
    dropzones.forEach(zone => {
        if (!zone.querySelector('.dropzone-hint')) {
            const hint = document.createElement('p');
            hint.className = 'dropzone-hint';
            hint.textContent = 'Ziehe Eigenschaften hierher';
            zone.insertBefore(hint, zone.firstChild);
        }
    });
    
    // Score zurücksetzen
    score = 0;
    correct = 0;
    wrong = 0;
    hintsUsed = 0;
    updateScore();
    
    // Feedback verstecken
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('beziehungsnetz').classList.add('hidden');
    
    // Neu initialisieren
    initializeGame();
}

function giveHint() {
    if (hintsUsed >= 3) {
        showTemporaryMessage('Du hast bereits 3 Hinweise verwendet!', 'info');
        return;
    }
    
    // Finde eine falsch platzierte oder nicht platzierte Eigenschaft
    const eigenschaften = document.querySelectorAll('.eigenschaft:not(.correct)');
    
    if (eigenschaften.length === 0) {
        showTemporaryMessage('Alle Eigenschaften sind bereits richtig!', 'success');
        return;
    }
    
    // Zufällige Eigenschaft auswählen
    const randomEigenschaft = eigenschaften[Math.floor(Math.random() * eigenschaften.length)];
    const correctFigur = randomEigenschaft.dataset.figur;
    
    showTemporaryMessage(`💡 Hinweis: "${randomEigenschaft.textContent}" gehört zu ${correctFigur}!`, 'info');
    
    // Eigenschaft kurz highlighten
    randomEigenschaft.style.animation = 'pulse 1s';
    setTimeout(() => {
        randomEigenschaft.style.animation = '';
    }, 1000);
    
    hintsUsed++;
    score -= 5; // Punktabzug für Hinweis
    updateScore();
}

function showTemporaryMessage(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    feedback.classList.remove('hidden');
    
    setTimeout(() => {
        feedback.classList.add('hidden');
    }, 3000);
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('correct').textContent = correct;
    document.getElementById('wrong').textContent = wrong;
}

// ===== BEZIEHUNGSNETZ =====
function showBeziehungsnetz() {
    const netzDiv = document.getElementById('beziehungsnetz');
    netzDiv.classList.remove('hidden');
    
    // SVG erstellen
    const svg = document.getElementById('netz-svg');
    svg.innerHTML = '';
    
    const width = svg.clientWidth;
    const height = 400;
    
    // Positionen der Figuren
    const positionen = {
        Tom: { x: width * 0.25, y: height * 0.3 },
        Elsa: { x: width * 0.75, y: height * 0.3 },
        Hugo: { x: width * 0.25, y: height * 0.7 },
        Jakob: { x: width * 0.75, y: height * 0.7 }
    };
    
    // Beziehungen definieren
    const beziehungen = [
        { von: 'Tom', zu: 'Elsa', text: 's\'aident mutuellement' },
        { von: 'Tom', zu: 'Jakob', text: 'correspondants' },
        { von: 'Hugo', zu: 'Jakob', text: 'anciens amis' },
        { von: 'Hugo', zu: 'Tom', text: 'relation compliquée' }
    ];
    
    // Linien zeichnen
    beziehungen.forEach(bez => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', positionen[bez.von].x);
        line.setAttribute('y1', positionen[bez.von].y);
        line.setAttribute('x2', positionen[bez.zu].x);
        line.setAttribute('y2', positionen[bez.zu].y);
        line.setAttribute('stroke', '#667eea');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(line);
        
        // Text für Beziehung
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (positionen[bez.von].x + positionen[bez.zu].x) / 2);
        text.setAttribute('y', (positionen[bez.von].y + positionen[bez.zu].y) / 2);
        text.setAttribute('fill', '#764ba2');
        text.setAttribute('font-size', '12');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = bez.text;
        svg.appendChild(text);
    });
    
    // Kreise für Figuren
    Object.keys(positionen).forEach(figur => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', positionen[figur].x);
        circle.setAttribute('cy', positionen[figur].y);
        circle.setAttribute('r', '40');
        circle.setAttribute('fill', figurenDaten[figur].farbe);
        svg.appendChild(circle);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', positionen[figur].x);
        text.setAttribute('y', positionen[figur].y + 5);
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = figur;
        svg.appendChild(text);
    });
    
    // Smooth scroll zum Netz
    netzDiv.scrollIntoView({ behavior: 'smooth' });
}

// ===== HILFSFUNKTIONEN =====
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
