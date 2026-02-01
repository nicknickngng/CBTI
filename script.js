// State management
let debugState = 'initial-prompt'; // 'initial-prompt' or 'nightly-routine'
let appState = 'initial-prompt-screen'; // Current screen ID

// DOM elements - Screens
const initialPromptScreen = document.getElementById('initial-prompt-screen');
const goalsGuidelinesScreen = document.getElementById('goals-guidelines-screen');
const sleepScheduleScreen = document.getElementById('sleep-schedule-screen');
const relaxationIntroScreen = document.getElementById('relaxation-intro-screen');
const pmrScreen = document.getElementById('pmr-screen');
const completionScreen = document.getElementById('completion-screen');

// DOM elements - Buttons
const yesProgramBtn = document.getElementById('yes-program-btn');
const notRightNowBtn = document.getElementById('not-right-now-btn');
const continueGoalsBtn = document.getElementById('continue-goals-btn');
const lockScheduleBtn = document.getElementById('lock-schedule-btn');
const startRelaxationBtn = document.getElementById('start-relaxation-btn');
const backGoalsBtn = document.getElementById('back-goals-btn');
const backScheduleBtn = document.getElementById('back-schedule-btn');
const backRelaxationBtn = document.getElementById('back-relaxation-btn');
const closeBtn = document.getElementById('close-btn');
const debugInitialPromptBtn = document.getElementById('debug-initial-prompt-btn');
const debugNightlyRoutineBtn = document.getElementById('debug-nightly-routine-btn');

// DOM elements - Other
const notRightNowMessage = document.getElementById('not-right-now-message');
const targetScoreInput = document.getElementById('target-score-input');
const earliestBedtimeInput = document.getElementById('earliest-bedtime-input');
const latestWakeupInput = document.getElementById('latest-wakeup-input');
const instructionText = document.getElementById('instruction-text');
const timer = document.getElementById('timer');
const cycleCount = document.getElementById('cycle-count');

// PMR exercise state
let currentCycle = 0;
let timeRemaining = 0;
let intervalId = null;

// Constants
const TENSE_DURATION = 1; // seconds
const RELEASE_DURATION = 2; // seconds
const TOTAL_CYCLES = 1;

// Screen navigation function
function showScreen(screenId) {
    // Hide all screens
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => screen.classList.remove('active'));
    
    // Show the requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState = screenId;
    }
}

// Debug state toggle handlers
debugInitialPromptBtn.addEventListener('click', () => {
    debugState = 'initial-prompt';
    showScreen('initial-prompt-screen');
    updateDebugButtons();
});

debugNightlyRoutineBtn.addEventListener('click', () => {
    debugState = 'nightly-routine';
    // TODO: Implement nightly routine starting screen
    showScreen('initial-prompt-screen'); // Placeholder for now
    updateDebugButtons();
});

function updateDebugButtons() {
    if (debugState === 'initial-prompt') {
        debugInitialPromptBtn.classList.add('active');
        debugNightlyRoutineBtn.classList.remove('active');
    } else {
        debugInitialPromptBtn.classList.remove('active');
        debugNightlyRoutineBtn.classList.add('active');
    }
}

// Initial Prompt Screen handlers
yesProgramBtn.addEventListener('click', () => {
    showScreen('goals-guidelines-screen');
});

notRightNowBtn.addEventListener('click', () => {
    notRightNowMessage.style.display = 'block';
});

// Goals & Guidelines Screen handlers
backGoalsBtn.addEventListener('click', () => {
    showScreen('initial-prompt-screen');
});

continueGoalsBtn.addEventListener('click', () => {
    // Validate inputs
    const targetScore = parseInt(targetScoreInput.value);
    const earliestBedtime = earliestBedtimeInput.value;
    const latestWakeup = latestWakeupInput.value;
    
    if (isNaN(targetScore) || targetScore < 72 || targetScore > 100) {
        alert('Please enter a valid target sleep score between 72 and 100.');
        return;
    }
    
    if (!earliestBedtime || !latestWakeup) {
        alert('Please enter both bedtime and wake-up times.');
        return;
    }
    
    // Proceed to sleep schedule screen
    showScreen('sleep-schedule-screen');
});

// Sleep Schedule Screen handlers
backScheduleBtn.addEventListener('click', () => {
    showScreen('goals-guidelines-screen');
});

lockScheduleBtn.addEventListener('click', () => {
    showScreen('relaxation-intro-screen');
});

// Relaxation Intro Screen handlers
backRelaxationBtn.addEventListener('click', () => {
    showScreen('sleep-schedule-screen');
});

startRelaxationBtn.addEventListener('click', () => {
    showScreen('pmr-screen');
    // Reset PMR state and start
    currentCycle = 0;
    startCycle();
});

// PMR Screen handlers
closeBtn.addEventListener('click', () => {
    // Clear any running intervals
    if (intervalId) {
        clearInterval(intervalId);
    }
    // Return to initial prompt screen
    showScreen('initial-prompt-screen');
    resetPMR();
});

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
                // All cycles complete, navigate to completion screen
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
    
    // Navigate to completion screen
    showScreen('completion-screen');
    resetPMR();
}

function resetPMR() {
    instructionText.textContent = 'Get ready...';
    instructionText.className = 'instruction-text';
    timer.textContent = '';
    cycleCount.textContent = 'Cycle 1 of 1';
    currentCycle = 0;
}

// Initialize
updateDebugButtons();
