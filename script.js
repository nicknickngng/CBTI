// State management
let debugState = 'initial-notification'; // 'initial-prompt', 'nightly-routine', or 'initial-notification'
let appState = 'initial-notification-screen'; // Current screen ID
let dayCounter = 0; // Day counter for Nightly Routine (0-13)
let previousBedtime = { hours: 23, minutes: 30 }; // Initial: 11:30 PM
let previousWakeup = { hours: 6, minutes: 0 }; // Initial: 6:00 AM
let userEarliestBedtime = null; // Stored from Goals screen
let userLatestWakeup = null; // Stored from Goals screen
let lockedBedtime = { hours: 23, minutes: 30 }; // Calculated schedule from Initial Prompt
let lockedWakeup = { hours: 6, minutes: 0 }; // Calculated schedule from Initial Prompt

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
const initialNotificationScreen = document.getElementById('initial-notification-screen');
const nightlyNotificationScreen = document.getElementById('nightly-notification-screen');
const summaryScreen = document.getElementById('summary-screen');

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
const debugInitialNotificationBtn = document.getElementById('debug-initial-notification-btn');
const debugInitialPromptBtn = document.getElementById('debug-initial-prompt-btn');
const debugNightlyNotificationBtn = document.getElementById('debug-nightly-notification-btn');
const debugNightlyRoutineBtn = document.getElementById('debug-nightly-routine-btn');
const debugSummaryBtn = document.getElementById('debug-summary-btn');
const debugResetBtn = document.getElementById('debug-reset-btn');
const seImprovementDisplay = document.getElementById('se-improvement');
const solImprovementDisplay = document.getElementById('sol-improvement');
const dayCounterDisplay = document.getElementById('day-counter-display');
const lockscreenTime = document.getElementById('lockscreen-time');
const lockscreenDate = document.getElementById('lockscreen-date');
const notificationBubble = document.getElementById('notification-bubble');
const nightlyLockscreenTime = document.getElementById('nightly-lockscreen-time');
const nightlyLockscreenDate = document.getElementById('nightly-lockscreen-date');
const nightlyNotificationBubble = document.getElementById('nightly-notification-bubble');

// DOM elements - Other
const notRightNowMessage = document.getElementById('not-right-now-message');
const earliestBedtimeInput = document.getElementById('earliest-bedtime-input');
const latestWakeupInput = document.getElementById('latest-wakeup-input');
const sleepDurationError = document.getElementById('sleep-duration-error');
const instructionText = document.getElementById('instruction-text');
const timer = document.getElementById('timer');
const cycleCount = document.getElementById('cycle-count');
const bedtimeAdjustment = document.getElementById('bedtime-adjustment');
const wakeupAdjustment = document.getElementById('wakeup-adjustment');
const calculatedScheduleTime = document.getElementById('calculated-schedule-time');

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

// Time and date formatting functions
function formatTime12Hour() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    // Convert to 12-hour format but don't show AM/PM (like iPhone lock screen)
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr}`;
}

function formatDate() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    return `${dayName}, ${day} ${monthName}`;
}

function updateLockscreenTimeDate() {
    if (lockscreenTime) {
        lockscreenTime.textContent = formatTime12Hour();
    }
    if (lockscreenDate) {
        lockscreenDate.textContent = formatDate();
    }
    if (nightlyLockscreenTime) {
        nightlyLockscreenTime.textContent = formatTime12Hour();
    }
    if (nightlyLockscreenDate) {
        nightlyLockscreenDate.textContent = formatDate();
    }
}

// Debug state toggle handlers
debugInitialNotificationBtn.addEventListener('click', () => {
    debugState = 'initial-notification';
    showScreen('initial-notification-screen');
    updateLockscreenTimeDate();
    updateDebugButtons();
});

debugInitialPromptBtn.addEventListener('click', () => {
    debugState = 'initial-prompt';
    showScreen('initial-prompt-screen');
    updateDebugButtons();
});

debugNightlyNotificationBtn.addEventListener('click', () => {
    debugState = 'nightly-notification';
    showScreen('nightly-notification-screen');
    updateLockscreenTimeDate();
    updateDebugButtons();
});

debugNightlyRoutineBtn.addEventListener('click', () => {
    // Only do something if not already in Nightly Routine
    if (debugState !== 'nightly-routine') {
        debugState = 'nightly-routine';
        dayCounter = 1; // Set to 1 when entering Nightly Routine
        // Use locked schedule from Initial Prompt, or default if not set
        if (lockedBedtime && lockedWakeup) {
            previousBedtime = { hours: lockedBedtime.hours, minutes: lockedBedtime.minutes };
            previousWakeup = { hours: lockedWakeup.hours, minutes: lockedWakeup.minutes };
        } else {
            // Fallback to default if no schedule was locked
            previousBedtime = { hours: 23, minutes: 30 };
            previousWakeup = { hours: 6, minutes: 0 };
        }
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

debugSummaryBtn.addEventListener('click', () => {
    debugState = 'summary';
    updateSummaryScreen();
    showScreen('summary-screen');
    updateDebugButtons();
});

debugResetBtn.addEventListener('click', () => {
    debugState = 'initial-notification';
    dayCounter = 0; // Reset day counter
    // Reset sleep times to initial values
    previousBedtime = { hours: 23, minutes: 30 };
    previousWakeup = { hours: 6, minutes: 0 };
    lockedBedtime = { hours: 23, minutes: 30 };
    lockedWakeup = { hours: 6, minutes: 0 };
    userEarliestBedtime = null;
    userLatestWakeup = null;
    showScreen('initial-notification-screen');
    updateLockscreenTimeDate();
    updateDebugButtons();
});

function updateDebugButtons() {
    // Remove active class from all debug buttons
    debugInitialNotificationBtn.classList.remove('active');
    debugInitialPromptBtn.classList.remove('active');
    debugNightlyNotificationBtn.classList.remove('active');
    debugNightlyRoutineBtn.classList.remove('active');
    debugSummaryBtn.classList.remove('active');
    
    // Add active class to current state
    if (debugState === 'initial-notification') {
        debugInitialNotificationBtn.classList.add('active');
    } else if (debugState === 'initial-prompt') {
        debugInitialPromptBtn.classList.add('active');
    } else if (debugState === 'nightly-notification') {
        debugNightlyNotificationBtn.classList.add('active');
    } else if (debugState === 'nightly-routine') {
        debugNightlyRoutineBtn.classList.add('active');
    } else if (debugState === 'summary') {
        debugSummaryBtn.classList.add('active');
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

// Sleep duration calculation function
function calculateSleepDuration(bedtimeStr, wakeupStr) {
    if (!bedtimeStr || !wakeupStr) {
        return null;
    }
    
    // Parse time strings (format: "HH:MM")
    const [bedtimeHours, bedtimeMinutes] = bedtimeStr.split(':').map(Number);
    const [wakeupHours, wakeupMinutes] = wakeupStr.split(':').map(Number);
    
    // Convert to total minutes
    const bedtimeTotalMinutes = bedtimeHours * 60 + bedtimeMinutes;
    let wakeupTotalMinutes = wakeupHours * 60 + wakeupMinutes;
    
    // If wake-up time is earlier than bedtime, it's the next day
    if (wakeupTotalMinutes <= bedtimeTotalMinutes) {
        wakeupTotalMinutes += 24 * 60; // Add 24 hours
    }
    
    // Calculate duration in minutes, then convert to hours
    const durationMinutes = wakeupTotalMinutes - bedtimeTotalMinutes;
    const durationHours = durationMinutes / 60;
    
    return durationHours;
}

// Function to calculate proposed sleep schedule
function calculateProposedSchedule(earliestBedtimeStr, latestWakeupStr) {
    if (!earliestBedtimeStr || !latestWakeupStr) {
        return null;
    }
    
    // Parse time strings
    const [earliestHours, earliestMinutes] = earliestBedtimeStr.split(':').map(Number);
    const [latestHours, latestMinutes] = latestWakeupStr.split(':').map(Number);
    
    // Convert to total minutes
    let earliestTotalMinutes = earliestHours * 60 + earliestMinutes;
    let latestTotalMinutes = latestHours * 60 + latestMinutes;
    
    // Calculate proposed bedtime: earliest + 1hr 15min
    let proposedBedtimeMinutes = earliestTotalMinutes + (1 * 60 + 15);
    
    // Calculate proposed wakeup: latest - 45min
    let proposedWakeupMinutes = latestTotalMinutes - 45;
    
    // Handle day rollover for wakeup (if negative, it's previous day, so add 24 hours)
    if (proposedWakeupMinutes < 0) {
        proposedWakeupMinutes += 24 * 60;
    }
    
    // Handle day rollover for bedtime (if >= 24 hours, subtract 24 hours)
    if (proposedBedtimeMinutes >= 24 * 60) {
        proposedBedtimeMinutes -= 24 * 60;
    }
    
    // Calculate initial duration
    let wakeupForDuration = proposedWakeupMinutes;
    if (wakeupForDuration <= proposedBedtimeMinutes) {
        wakeupForDuration += 24 * 60; // Next day
    }
    let durationHours = (wakeupForDuration - proposedBedtimeMinutes) / 60;
    
    // If duration < 5 hours, adjust bedtime earlier
    if (durationHours < 5) {
        const deficitHours = 5 - durationHours;
        const deficitMinutes = deficitHours * 60;
        proposedBedtimeMinutes -= deficitMinutes;
        
        // Handle negative bedtime (previous day)
        if (proposedBedtimeMinutes < 0) {
            proposedBedtimeMinutes += 24 * 60;
        }
    }
    
    // Convert back to hours and minutes
    const proposedBedtimeHours = Math.floor(proposedBedtimeMinutes / 60) % 24;
    const proposedBedtimeMins = proposedBedtimeMinutes % 60;
    const proposedWakeupHours = Math.floor(proposedWakeupMinutes / 60) % 24;
    const proposedWakeupMins = proposedWakeupMinutes % 60;
    
    return {
        bedtime: { hours: proposedBedtimeHours, minutes: proposedBedtimeMins },
        wakeup: { hours: proposedWakeupHours, minutes: proposedWakeupMins }
    };
}

continueGoalsBtn.addEventListener('click', () => {
    // Hide any previous error messages
    if (sleepDurationError) {
        sleepDurationError.style.display = 'none';
    }
    
    // Validate inputs
    const earliestBedtime = earliestBedtimeInput.value;
    const latestWakeup = latestWakeupInput.value;
    
    if (!earliestBedtime || !latestWakeup) {
        alert('Please enter both bedtime and wake-up times.');
        return;
    }
    
    // Calculate and validate sleep duration
    const sleepDuration = calculateSleepDuration(earliestBedtime, latestWakeup);
    
    if (sleepDuration === null) {
        alert('Please enter both bedtime and wake-up times.');
        return;
    }
    
    if (sleepDuration < 5 || sleepDuration > 12) {
        // Show error message
        if (sleepDurationError) {
            sleepDurationError.textContent = `Sleep duration must be between 5 and 12 hours. Your current selection is ${sleepDuration.toFixed(1)} hours. Please adjust your bedtime or wake-up time.`;
            sleepDurationError.style.display = 'block';
        } else {
            alert(`Sleep duration must be between 5 and 12 hours. Your current selection is ${sleepDuration.toFixed(1)} hours. Please adjust your bedtime or wake-up time.`);
        }
        return;
    }
    
    // Store user inputs
    userEarliestBedtime = earliestBedtime;
    userLatestWakeup = latestWakeup;
    
    // Calculate and display proposed schedule
    const proposedSchedule = calculateProposedSchedule(earliestBedtime, latestWakeup);
    if (proposedSchedule && calculatedScheduleTime) {
        const bedtimeStr = formatTime(proposedSchedule.bedtime.hours, proposedSchedule.bedtime.minutes);
        const wakeupStr = formatTime(proposedSchedule.wakeup.hours, proposedSchedule.wakeup.minutes);
        calculatedScheduleTime.textContent = `${bedtimeStr} - ${wakeupStr}`;
    }
    
    // Proceed to sleep schedule screen
    showScreen('sleep-schedule-screen');
});

// Sleep Schedule Screen handlers
backScheduleBtn.addEventListener('click', () => {
    showScreen('goals-guidelines-screen');
});

lockScheduleBtn.addEventListener('click', () => {
    // Store the calculated schedule for use in Nightly Routine
    const proposedSchedule = calculateProposedSchedule(userEarliestBedtime, userLatestWakeup);
    if (proposedSchedule) {
        // Store as time objects with hours and minutes
        lockedBedtime = { hours: proposedSchedule.bedtime.hours, minutes: proposedSchedule.bedtime.minutes };
        lockedWakeup = { hours: proposedSchedule.wakeup.hours, minutes: proposedSchedule.wakeup.minutes };
    }
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

// Calculate improvements for Summary screen
function calculateImprovements() {
    // Based on data generation: SE goes from 72% to 95%, SOL goes from 35min to 12min
    const seImprovement = 95 - 72; // 23%
    const solImprovement = 35 - 12; // 23 min
    return {
        seImprovement: seImprovement,
        solImprovement: solImprovement
    };
}

// Update Summary screen with calculated improvements
function updateSummaryScreen() {
    const improvements = calculateImprovements();
    if (seImprovementDisplay) {
        seImprovementDisplay.textContent = `${improvements.seImprovement}%`;
    }
    if (solImprovementDisplay) {
        solImprovementDisplay.textContent = `${improvements.solImprovement} min`;
    }
}

// Chart initialization
// Register Chart.js annotations plugin
// The plugin auto-registers when loaded, but we ensure it's available
if (typeof Chart !== 'undefined') {
    // Plugin should be auto-registered, but we can explicitly register if needed
    // chartjs-plugin-annotation v3 auto-registers with Chart.js 4.x
}

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
                            },
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                const labels = original.call(this, chart);
                                // Add custom "Target Range" legend item
                                labels.push({
                                    text: 'Target Range',
                                    fillStyle: 'rgba(0, 255, 0, 0.2)',
                                    strokeStyle: 'rgba(0, 255, 0, 0.5)',
                                    lineWidth: 1,
                                    hidden: false,
                                    index: labels.length,
                                    datasetIndex: -1
                                });
                                return labels;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            targetBand: {
                                type: 'box',
                                yMin: 80,
                                yMax: 85,
                                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                                borderColor: 'rgba(0, 255, 0, 0.5)',
                                borderWidth: 1,
                                xScaleID: 'x',
                                yScaleID: 'y',
                                xMin: 0,
                                xMax: dayLabels.length - 1
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
                            },
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                const labels = original.call(this, chart);
                                // Add custom "Target Range" legend item
                                labels.push({
                                    text: 'Target Range',
                                    fillStyle: 'rgba(0, 255, 0, 0.2)',
                                    strokeStyle: 'rgba(0, 255, 0, 0.5)',
                                    lineWidth: 1,
                                    hidden: false,
                                    index: labels.length,
                                    datasetIndex: -1
                                });
                                return labels;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            targetBand: {
                                type: 'box',
                                yMin: 15,
                                yMax: 25,
                                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                                borderColor: 'rgba(0, 255, 0, 0.5)',
                                borderWidth: 1,
                                xScaleID: 'x',
                                yScaleID: 'y',
                                xMin: 0,
                                xMax: dayLabels.length - 1
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
        
        // Update annotation xMax to span full width of current X-axis
        const maxIndex = dayLabels.length - 1;
        if (seChart.options.plugins?.annotation?.annotations?.targetBand) {
            seChart.options.plugins.annotation.annotations.targetBand.xMax = maxIndex;
        }
        if (solChart.options.plugins?.annotation?.annotations?.targetBand) {
            solChart.options.plugins.annotation.annotations.targetBand.xMax = maxIndex;
        }
        
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
    // Use locked schedule from Initial Prompt, or previous night's adjusted times
    let currentBedtime, currentWakeup;
    
    if (dayCounter === 1) {
        // First night of Nightly Routine - use locked schedule from Initial Prompt
        currentBedtime = lockedBedtime;
        currentWakeup = lockedWakeup;
    } else {
        // Subsequent nights - use previous night's adjusted times
        currentBedtime = previousBedtime;
        currentWakeup = previousWakeup;
    }
    
    const adjustedBedtime = subtractMinutes(currentBedtime.hours, currentBedtime.minutes, 5);
    const adjustedWakeup = addMinutes(currentWakeup.hours, currentWakeup.minutes, 10);
    
    const bedtimeOldTime = bedtimeAdjustment.querySelector('.old-time');
    const bedtimeNewTime = bedtimeAdjustment.querySelector('.new-time');
    const wakeupOldTime = wakeupAdjustment.querySelector('.old-time');
    const wakeupNewTime = wakeupAdjustment.querySelector('.new-time');
    
    if (bedtimeOldTime && bedtimeNewTime) {
        bedtimeOldTime.textContent = formatTime(currentBedtime.hours, currentBedtime.minutes);
        bedtimeNewTime.textContent = formatTime(adjustedBedtime.hours, adjustedBedtime.minutes);
    }
    if (wakeupOldTime && wakeupNewTime) {
        wakeupOldTime.textContent = formatTime(currentWakeup.hours, currentWakeup.minutes);
        wakeupNewTime.textContent = formatTime(adjustedWakeup.hours, adjustedWakeup.minutes);
    }
}

// Nightly Routine Screen handlers
getReadyBtn.addEventListener('click', () => {
    // Initialize previous times for first night of Nightly Routine
    if (dayCounter === 1) {
        previousBedtime = lockedBedtime;
        previousWakeup = lockedWakeup;
    }
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
        // Navigate to Nightly Notification
        debugState = 'nightly-notification';
        dayCounter = 1; // Increment to 1 when first entering Nightly Routine
        // Use locked schedule from Initial Prompt, or default if not set
        if (lockedBedtime && lockedWakeup) {
            previousBedtime = { hours: lockedBedtime.hours, minutes: lockedBedtime.minutes };
            previousWakeup = { hours: lockedWakeup.hours, minutes: lockedWakeup.minutes };
        } else {
            // Fallback to default if no schedule was locked
            previousBedtime = { hours: 23, minutes: 30 };
            previousWakeup = { hours: 6, minutes: 0 };
        }
        showScreen('nightly-notification-screen');
        updateLockscreenTimeDate();
        updateDebugButtons();
    } else if (debugState === 'nightly-routine') {
        // Increment day counter and navigate to Nightly Notification
        dayCounter++;
        // Ensure day counter doesn't exceed 13
        if (dayCounter > 13) {
            dayCounter = 13;
        }
        debugState = 'nightly-notification';
        showScreen('nightly-notification-screen');
        updateLockscreenTimeDate();
        updateDebugButtons();
    }
});

// Notification bubble click handlers
if (notificationBubble) {
    notificationBubble.addEventListener('click', () => {
        debugState = 'initial-prompt';
        showScreen('initial-prompt-screen');
        updateDebugButtons();
    });
}

if (nightlyNotificationBubble) {
    nightlyNotificationBubble.addEventListener('click', () => {
        debugState = 'nightly-routine';
        showScreen('good-evening-screen');
        updateDebugButtons();
        // Initialize or update charts
        if (seChart && solChart) {
            updateCharts();
        } else {
            initializeCharts();
        }
    });
}

// Update time every minute
setInterval(() => {
    if ((initialNotificationScreen && initialNotificationScreen.classList.contains('active')) ||
        (nightlyNotificationScreen && nightlyNotificationScreen.classList.contains('active'))) {
        updateLockscreenTimeDate();
    }
}, 60000);

// Initialize
updateDebugButtons();
updateLockscreenTimeDate();
