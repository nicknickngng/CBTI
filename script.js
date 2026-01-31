// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const pmrScreen = document.getElementById('pmr-screen');
const continueBtn = document.getElementById('continue-btn');
const closeBtn = document.getElementById('close-btn');
const restartBtn = document.getElementById('restart-btn');
const restartContainer = document.getElementById('restart-container');
const instructionText = document.getElementById('instruction-text');
const timer = document.getElementById('timer');
const cycleCount = document.getElementById('cycle-count');

// PMR exercise state
let currentCycle = 0;
let timeRemaining = 0;
let intervalId = null;

// Constants
const TENSE_DURATION = 4; // seconds
const RELEASE_DURATION = 8; // seconds
const TOTAL_CYCLES = 2;

// Initialize
continueBtn.addEventListener('click', startPMR);
closeBtn.addEventListener('click', returnToHomepage);
restartBtn.addEventListener('click', returnToHomepage);

function startPMR() {
    // Switch to PMR screen
    welcomeScreen.classList.remove('active');
    pmrScreen.classList.add('active');
    
    // Reset state
    currentCycle = 0;
    
    // Start first cycle
    startCycle();
}

function startCycle() {
    currentCycle++;
    cycleCount.textContent = `Cycle ${currentCycle} of ${TOTAL_CYCLES}`;
    
    // Start with tensing
    startTensePhase();
}

function startTensePhase() {
    instructionText.textContent = 'Tense a muscle group';
    instructionText.className = 'instruction-text tense';
    timeRemaining = TENSE_DURATION;
    updateTimer();
    
    intervalId = setInterval(() => {
        timeRemaining--;
        updateTimer();
        
        if (timeRemaining <= 0) {
            clearInterval(intervalId);
            startReleasePhase();
        }
    }, 1000);
}

function startReleasePhase() {
    instructionText.textContent = 'Release';
    instructionText.className = 'instruction-text release';
    timeRemaining = RELEASE_DURATION;
    updateTimer();
    
    intervalId = setInterval(() => {
        timeRemaining--;
        updateTimer();
        
        if (timeRemaining <= 0) {
            clearInterval(intervalId);
            
            // We've completed one full cycle (tense + release)
            if (currentCycle < TOTAL_CYCLES) {
                // Start next cycle
                startCycle();
            } else {
                // All cycles complete, return to welcome screen
                completePMR();
            }
        }
    }, 1000);
}

function updateTimer() {
    timer.textContent = timeRemaining;
}

function completePMR() {
    // Clear any remaining intervals
    if (intervalId) {
        clearInterval(intervalId);
    }
    
    // Show completion message
    instructionText.textContent = 'Exercise complete!';
    instructionText.className = 'instruction-text';
    timer.textContent = '';
    
    // Show RESTART button
    restartContainer.style.display = 'block';
}

function returnToHomepage() {
    // Clear any running intervals
    if (intervalId) {
        clearInterval(intervalId);
    }
    
    // Switch screens
    pmrScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
    
    // Reset for next time
    instructionText.textContent = 'Get ready...';
    instructionText.className = 'instruction-text';
    timer.textContent = '';
    cycleCount.textContent = 'Cycle 1 of 2';
    restartContainer.style.display = 'none';
    currentCycle = 0;
}
