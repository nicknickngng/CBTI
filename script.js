// State management
let debugState = 'initial-prompt'; // 'initial-prompt' or 'nightly-routine'
let appState = 'initial-prompt-screen'; // Current screen ID
let dayCounter = 0; // Day counter for Nightly Routine (0-13)
let previousBedtime = { hours: 23, minutes: 30 }; // Initial: 11:30 PM
let previousWakeup = { hours: 6, minutes: 0 }; // Initial: 6:00 AM

// Chart instances
let seChart = null;
let solChart = null;

// DOM elements - Screens
const initialPromptScreen = document.getElementById('initial-prompt-screen');
const goalsGuidelinesScreen = document.getElementById('goals-guidelines-screen');
const sleepScheduleScreen = document.getElementById('sleep-schedule-screen');
const relaxationIntroScreen = document.getElementById('relaxation-intro-screen');
const pmrScreen = document.getElementById('pmr-screen');
const completionScreen = document.getElementById('completion-screen');
const goodEveningScreen = document.getElementById('good-evening-screen');
const sleepWindowScreen = document.getElementById('sleep-window-screen');
const relaxationInfoScreen = document.getElementById('relaxation-info-screen');

// DOM elements - Buttons
const yesProgramBtn = document.getElementById('yes-program-btn');
const notRightNowBtn = document.getElementById('not-right-now-btn');
const continueGoalsBtn = document.getElementById('continue-goals-btn');
const lockScheduleBtn = document.getElementById('lock-schedule-btn');
const startRelaxationBtn = document.getElementById('start-relaxation-btn');
const backGoalsBtn = document.getElementById('back-goals-btn');
const backScheduleBtn = document.getElementById('back-schedule-btn');
const backRelaxationBtn = document.getElementById('back-relaxation-btn');
const getReadyBtn = document.getElementById('get-ready-btn');
const backWindowBtn = document.getElementById('back-window-btn');
const okWindowBtn = document.getElementById('ok-window-btn');
const backInfoBtn = document.getElementById('back-info-btn');
const startNightlyRelaxationBtn = document.getElementById('start-nightly-relaxation-btn');
const advanceNightBtn = document.getElementById('advance-night-btn');
const closeBtn = document.getElementById('close-btn');
const debugInitialPromptBtn = document.getElementById('debug-initial-prompt-btn');
const debugNightlyRoutineBtn = document.getElementById('debug-nightly-routine-btn');
const debugResetBtn = document.getElementById('debug-reset-btn');
const dayCounterDisplay = document.getElementById('day-counter-display');

// DOM elements - Other
const notRightNowMessage = document.getElementById('not-right-now-message');
const targetScoreInput = document.getElementById('target-score-input');
const earliestBedtimeInput = document.getElementById('earliest-bedtime-input');
const latestWakeupInput = document.getElementById('latest-wakeup-input');
const instructionText = document.getElementById('instruction-text');
const timer = document.getElementById('timer');
const cycleCount = document.getElementById('cycle-count');
const bedtimeAdjustment = document.getElementById('bedtime-adjustment');
const wakeupAdjustment = document.getElementById('wakeup-adjustment');

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
        
        // Initialize charts if showing Good Evening screen
        if (screenId === 'good-evening-screen') {
            // Small delay to ensure canvas is visible
            setTimeout(() => {
                if (!seChart || !solChart) {
                    initializeCharts();
                } else {
                    updateCharts();
                }
            }, 100);
        }
    }
}

// Debug state toggle handlers
debugInitialPromptBtn.addEventListener('click', () => {
    debugState = 'initial-prompt';
    showScreen('initial-prompt-screen');
    updateDebugButtons();
});

debugNightlyRoutineBtn.addEventListener('click', () => {
    // Only do something if not already in Nightly Routine
    if (debugState !== 'nightly-routine') {
        debugState = 'nightly-routine';
        dayCounter = 1; // Set to 1 when entering Nightly Routine
        // Reset sleep times to initial values
        previousBedtime = { hours: 23, minutes: 30 };
        previousWakeup = { hours: 6, minutes: 0 };
        showScreen('good-evening-screen');
        updateDebugButtons();
        // Initialize or update charts
        if (seChart && solChart) {
            updateCharts();
        } else {
            initializeCharts();
        }
    }
});

debugResetBtn.addEventListener('click', () => {
    debugState = 'initial-prompt';
    dayCounter = 0; // Reset day counter
    // Reset sleep times to initial values
    previousBedtime = { hours: 23, minutes: 30 };
    previousWakeup = { hours: 6, minutes: 0 };
    showScreen('initial-prompt-screen');
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
    // Update day counter display
    if (dayCounterDisplay) {
        dayCounterDisplay.textContent = `Night ${dayCounter}`;
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

// Chart data generation functions
function generateSEData() {
    const data = [];
    // Only generate data up to current day counter (Night 1 = data for Night 0 only)
    const maxDay = dayCounter;
    for (let day = 0; day < maxDay && day <= 13; day++) {
        const se = 72 + (day / 13) * 23; // Linear interpolation from 72% to 95%
        data.push(Math.round(se * 10) / 10); // Round to 1 decimal place
    }
    return data;
}

function generateSOLData() {
    const data = [];
    // Only generate data up to current day counter (Night 1 = data for Night 0 only)
    const maxDay = dayCounter;
    for (let day = 0; day < maxDay && day <= 13; day++) {
        const sol = 35 - (day / 13) * 23; // Linear interpolation from 35min to 12min
        data.push(Math.round(sol * 10) / 10); // Round to 1 decimal place
    }
    return data;
}

function generateDayLabels() {
    const labels = [];
    // Generate labels up to current day counter + 1 (to show next night on axis)
    const maxDay = dayCounter + 1;
    for (let day = 0; day < maxDay && day <= 13; day++) {
        labels.push(`Night ${day}`);
    }
    return labels;
}

// Chart initialization
function initializeCharts() {
    const seData = generateSEData();
    const solData = generateSOLData();
    const dayLabels = generateDayLabels();
    
    // Sleep Efficiency Chart
    const seCtx = document.getElementById('se-chart');
    if (seCtx) {
        seChart = new Chart(seCtx, {
            type: 'line',
            data: {
                labels: dayLabels,
                datasets: [{
                    label: 'Sleep Efficiency (%)',
                    data: seData,
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: "'TT Commons Pro', 'Inter', sans-serif"
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100,
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: "'TT Commons Pro', 'Inter', sans-serif"
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: "'TT Commons Pro', 'Inter', sans-serif"
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    // Sleep Onset Latency Chart
    const solCtx = document.getElementById('sol-chart');
    if (solCtx) {
        solChart = new Chart(solCtx, {
            type: 'line',
            data: {
                labels: dayLabels,
                datasets: [{
                    label: 'Sleep Onset Latency (min)',
                    data: solData,
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: "'TT Commons Pro', 'Inter', sans-serif"
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 10,
                        max: 40,
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: "'TT Commons Pro', 'Inter', sans-serif"
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: "'TT Commons Pro', 'Inter', sans-serif"
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
}

function updateCharts() {
    if (seChart && solChart) {
        const seData = generateSEData();
        const solData = generateSOLData();
        const dayLabels = generateDayLabels();
        seChart.data.labels = dayLabels;
        seChart.data.datasets[0].data = seData;
        solChart.data.labels = dayLabels;
        solChart.data.datasets[0].data = solData;
        seChart.update();
        solChart.update();
    }
}

// Time formatting and calculation functions
function formatTime(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
}

function subtractMinutes(hours, minutes, subtractMins) {
    let totalMinutes = hours * 60 + minutes;
    totalMinutes -= subtractMins;
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Wrap around to previous day
    }
    return {
        hours: Math.floor(totalMinutes / 60) % 24,
        minutes: totalMinutes % 60
    };
}

function addMinutes(hours, minutes, addMins) {
    let totalMinutes = hours * 60 + minutes;
    totalMinutes += addMins;
    return {
        hours: Math.floor(totalMinutes / 60) % 24,
        minutes: totalMinutes % 60
    };
}

function updateSleepWindowDisplay() {
    const adjustedBedtime = subtractMinutes(previousBedtime.hours, previousBedtime.minutes, 5);
    const adjustedWakeup = addMinutes(previousWakeup.hours, previousWakeup.minutes, 10);
    
    bedtimeAdjustment.textContent = `${formatTime(previousBedtime.hours, previousBedtime.minutes)} → ${formatTime(adjustedBedtime.hours, adjustedBedtime.minutes)}`;
    wakeupAdjustment.textContent = `${formatTime(previousWakeup.hours, previousWakeup.minutes)} → ${formatTime(adjustedWakeup.hours, adjustedWakeup.minutes)}`;
}

// Nightly Routine Screen handlers
getReadyBtn.addEventListener('click', () => {
    updateSleepWindowDisplay();
    showScreen('sleep-window-screen');
});

backWindowBtn.addEventListener('click', () => {
    showScreen('good-evening-screen');
});

okWindowBtn.addEventListener('click', () => {
    // Update previous times for next night
    previousBedtime = subtractMinutes(previousBedtime.hours, previousBedtime.minutes, 5);
    previousWakeup = addMinutes(previousWakeup.hours, previousWakeup.minutes, 10);
    showScreen('relaxation-info-screen');
});

backInfoBtn.addEventListener('click', () => {
    showScreen('sleep-window-screen');
});

startNightlyRelaxationBtn.addEventListener('click', () => {
    showScreen('pmr-screen');
    // Reset PMR state and start
    currentCycle = 0;
    startCycle();
});

// Advance to next night button handler
advanceNightBtn.addEventListener('click', () => {
    if (debugState === 'initial-prompt') {
        // Same as clicking Nightly Routine debug button, but increment counter
        debugState = 'nightly-routine';
        dayCounter = 1; // Increment to 1 when first entering Nightly Routine
        previousBedtime = { hours: 23, minutes: 30 };
        previousWakeup = { hours: 6, minutes: 0 };
        showScreen('good-evening-screen');
        updateDebugButtons();
        if (seChart && solChart) {
            updateCharts();
        } else {
            initializeCharts();
        }
    } else if (debugState === 'nightly-routine') {
        // Increment day counter and go back to Good Evening screen
        dayCounter++;
        // Ensure day counter doesn't exceed 13
        if (dayCounter > 13) {
            dayCounter = 13;
        }
        updateDebugButtons(); // Update day counter display
        showScreen('good-evening-screen');
        updateCharts();
    }
});

// Initialize
updateDebugButtons();
