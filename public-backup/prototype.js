/**
 * Deburn Prototype - Interactive Click-through Demo
 * Human-First AI Leadership Solution
 */

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initializePrototype();
});

// State management
const state = {
    currentScreen: 'dashboard',
    currentStep: 1,
    totalSteps: 4,
    checkinData: {
        mood: null,
        physicalEnergy: 5,
        mentalEnergy: 6,
        sleep: null,
        stress: 4
    }
};

// Feature flags - control visibility of features
const featureFlags = {
    showEmailDiagnostics: false,  // Toggle admin email diagnostics UI
    showDebugPanel: false,        // Toggle debug panel for mobile testing
};

// Capacitor native app detection and initialization
const isNativeApp = window.Capacitor && window.Capacitor.isNativePlatform();

/**
 * Get full API URL (handles native app vs web)
 * @param {string} path - API path starting with /api/...
 * @returns {string} Full URL for the API endpoint
 */
function apiUrl(path) {
    if (window.ApiConfig) {
        return window.ApiConfig.getBaseUrl() + path;
    }
    return path;
}

/**
 * Initialize Capacitor plugins for native app
 */
async function initializeCapacitor() {
    if (!isNativeApp) return;

    try {
        // Import Capacitor plugins
        const { StatusBar, Style } = await import('https://unpkg.com/@capacitor/status-bar@8/dist/esm/index.js');
        const { SplashScreen } = await import('https://unpkg.com/@capacitor/splash-screen@8/dist/esm/index.js');
        const { Keyboard } = await import('https://unpkg.com/@capacitor/keyboard@8/dist/esm/index.js');

        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#F8F7F4' });

        // Hide splash screen after app is ready
        await SplashScreen.hide();

        // Keyboard events for iOS
        Keyboard.addListener('keyboardWillShow', (info) => {
            document.body.style.paddingBottom = `${info.keyboardHeight}px`;
        });

        Keyboard.addListener('keyboardWillHide', () => {
            document.body.style.paddingBottom = '0px';
        });

        console.log('Capacitor initialized successfully');
    } catch (error) {
        console.error('Capacitor initialization error:', error);
    }
}

/**
 * Initialize prototype
 */
function initializePrototype() {
    // Initialize Capacitor for native apps
    initializeCapacitor();

    // Set up navigation listeners
    setupNavigation();

    // Set up slider listeners
    setupSliders();

    // Set up period selector for progress page
    setupPeriodSelector();

    // Update date display
    updateGreeting();

    // Load profile data immediately to prevent name flashing
    loadProfileOnInit();

    // Apply feature flags
    applyFeatureFlags();
}

/**
 * Apply feature flags to show/hide UI elements
 */
function applyFeatureFlags() {
    // Email diagnostics section in admin panel
    const emailDiagnosticsSection = document.getElementById('admin-email-diagnostics-section');
    if (emailDiagnosticsSection) {
        emailDiagnosticsSection.style.display = featureFlags.showEmailDiagnostics ? '' : 'none';
    }
}

/**
 * Set up period selector buttons on progress page
 */
function setupPeriodSelector() {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            // Update active state
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const period = parseInt(btn.dataset.period);

            // Update period label
            const periodLabel = document.querySelector('.period-label');
            if (periodLabel) {
                periodLabel.textContent = `(Last ${period} Days)`;
            }

            // Reload trends with new period
            try {
                const trendsResponse = await fetch(apiUrl(`/api/checkin/trends?period=${period}`), {
                    credentials: 'include',
                });

                if (trendsResponse.ok) {
                    const trendsData = await trendsResponse.json();
                    if (trendsData.success && trendsData.data.dataPoints > 0) {
                        updateProgressCharts(trendsData.data);
                    }
                }
            } catch (error) {
                console.error('Error loading trends:', error);
            }
        });
    });
}

/**
 * Set up navigation click handlers
 */
function setupNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = item.dataset.screen;
            if (screen) {
                showScreen(screen);
            }
        });
    });

    // Mobile navigation
    document.querySelectorAll('.mobile-nav-item[data-screen]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = item.dataset.screen;
            if (screen) {
                showScreen(screen);
            }
        });
    });

    // Check-in card click (only on the card itself, not the button)
    const checkinCard = document.getElementById('checkin-card');
    if (checkinCard) {
        checkinCard.addEventListener('click', (e) => {
            // Don't trigger if clicking the button (button handles itself)
            if (e.target.id === 'checkin-button' || e.target.closest('#checkin-button')) {
                return;
            }
            showScreen('checkin');
        });
    }

    // Check-in button click - always allow (for both new and retake)
    const checkinButton = document.getElementById('checkin-button');
    if (checkinButton) {
        checkinButton.addEventListener('click', () => {
            showScreen('checkin');
        });
    }
}

/**
 * Set up slider input listeners
 */
function setupSliders() {
    const physicalSlider = document.getElementById('physical-energy');
    const mentalSlider = document.getElementById('mental-energy');
    const stressSlider = document.getElementById('stress-level');

    if (physicalSlider) {
        physicalSlider.addEventListener('input', (e) => {
            state.checkinData.physicalEnergy = parseInt(e.target.value);
            updateSliderStyle(e.target);
        });
        updateSliderStyle(physicalSlider);
    }

    if (mentalSlider) {
        mentalSlider.addEventListener('input', (e) => {
            state.checkinData.mentalEnergy = parseInt(e.target.value);
            updateSliderStyle(e.target);
        });
        updateSliderStyle(mentalSlider);
    }

    if (stressSlider) {
        stressSlider.addEventListener('input', (e) => {
            state.checkinData.stress = parseInt(e.target.value);
        });
    }
}

/**
 * Update slider fill style
 */
function updateSliderStyle(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(90deg, var(--color-sage) 0%, var(--color-deep-forest) ${value}%, var(--neutral-200) ${value}%)`;
}

/**
 * Show a specific screen
 */
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show requested screen
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        state.currentScreen = screenId;
    }

    // Update navigation active states
    updateNavigation(screenId);

    // Reset check-in if showing dashboard
    if (screenId === 'dashboard') {
        resetCheckin();
        loadDashboardData();
    }

    // Load existing check-in data when showing check-in screen
    if (screenId === 'checkin') {
        loadTodaysCheckinData();
    }

    // Load progress data when showing progress screen
    if (screenId === 'progress') {
        loadProgressData();
    }

    // Reinitialize icons for the new screen
    lucide.createIcons();
}

/**
 * Update navigation active states
 */
function updateNavigation(screenId) {
    // Auth screens where mobile nav should be hidden
    const authScreens = ['login', 'register', 'forgot-password', 'reset-password', 'verify-pending', 'verify-success'];
    const isAuthScreen = authScreens.includes(screenId);

    // Show/hide mobile nav based on screen type
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.style.display = isAuthScreen ? 'none' : '';
    }

    // Handle coach-active class for immersive mobile experience
    const isCoachScreen = screenId === 'coach';
    document.body.classList.toggle('coach-active', isCoachScreen);

    // Update coach floating nav active states and visibility
    const coachFloatingNav = document.getElementById('coach-floating-nav');
    if (coachFloatingNav) {
        coachFloatingNav.classList.remove('expanded');
        document.querySelectorAll('.coach-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screenId) {
                item.classList.add('active');
            }
        });
    }

    // Sidebar nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenId) {
            item.classList.add('active');
        }
    });

    // Mobile nav
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenId) {
            item.classList.add('active');
        }
    });
}

/**
 * Load today's check-in data for retake
 */
async function loadTodaysCheckinData() {
    try {
        const response = await fetch(apiUrl('/api/checkin/today'), {
            credentials: 'include',
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.success || !data.data.checkIn) {
            // No existing check-in, use defaults
            resetCheckin();
            return;
        }

        const checkIn = data.data.checkIn;

        // Update state with existing values
        state.checkinData = {
            mood: checkIn.metrics.mood,
            physicalEnergy: checkIn.metrics.physicalEnergy,
            mentalEnergy: checkIn.metrics.mentalEnergy,
            sleep: checkIn.metrics.sleep,
            stress: checkIn.metrics.stress,
        };

        // Reset to step 1
        state.currentStep = 1;
        updateStep(1);

        // Pre-populate the UI with existing values
        populateCheckinForm();

    } catch (error) {
        console.error('Error loading today\'s check-in:', error);
        resetCheckin();
    }
}

/**
 * Populate check-in form with existing values
 */
function populateCheckinForm() {
    // Pre-select mood
    if (state.checkinData.mood) {
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
            if (parseInt(option.dataset.value) === state.checkinData.mood) {
                option.classList.add('selected');
            }
        });
    }

    // Pre-select sleep
    if (state.checkinData.sleep) {
        document.querySelectorAll('.sleep-option').forEach(option => {
            option.classList.remove('selected');
            if (parseInt(option.dataset.value) === state.checkinData.sleep) {
                option.classList.add('selected');
            }
        });
    }

    // Set slider values
    const physicalSlider = document.getElementById('physical-energy');
    const mentalSlider = document.getElementById('mental-energy');
    const stressSlider = document.getElementById('stress-level');

    if (physicalSlider && state.checkinData.physicalEnergy) {
        physicalSlider.value = state.checkinData.physicalEnergy;
        updateSliderStyle(physicalSlider);
    }

    if (mentalSlider && state.checkinData.mentalEnergy) {
        mentalSlider.value = state.checkinData.mentalEnergy;
        updateSliderStyle(mentalSlider);
    }

    if (stressSlider && state.checkinData.stress) {
        stressSlider.value = state.checkinData.stress;
    }
}

/**
 * Reset check-in to initial state
 */
function resetCheckin() {
    state.currentStep = 1;
    state.checkinData = {
        mood: null,
        physicalEnergy: 5,
        mentalEnergy: 6,
        sleep: null,
        stress: 4
    };

    // Reset UI
    updateStep(1);

    // Clear selections
    document.querySelectorAll('.mood-option, .sleep-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Reset sliders
    const physicalSlider = document.getElementById('physical-energy');
    const mentalSlider = document.getElementById('mental-energy');
    const stressSlider = document.getElementById('stress-level');

    if (physicalSlider) {
        physicalSlider.value = 5;
        updateSliderStyle(physicalSlider);
    }
    if (mentalSlider) {
        mentalSlider.value = 6;
        updateSliderStyle(mentalSlider);
    }
    if (stressSlider) {
        stressSlider.value = 4;
    }

    // Reset back button visibility
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        backBtn.style.visibility = 'hidden';
    }

    // Reset next button text
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) {
        nextBtn.innerHTML = 'Continue <i data-lucide="arrow-right"></i>';
        lucide.createIcons();
    }
}

/**
 * Go to next step in check-in
 */
async function nextStep() {
    if (state.currentStep < state.totalSteps) {
        // If moving to completion step, save check-in FIRST so streak is ready
        if (state.currentStep + 1 === state.totalSteps) {
            // Show loading state on button
            const nextBtn = document.getElementById('btn-next');
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';
            }

            await saveCheckIn();

            // Restore button state
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        }

        state.currentStep++;
        updateStep(state.currentStep);
    } else {
        // Already on completion step, go back to dashboard
        showScreen('dashboard');
    }
}

/**
 * Save check-in data to backend
 */
async function saveCheckIn() {
    try {
        const response = await fetch(apiUrl('/api/checkin'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                mood: state.checkinData.mood,
                physicalEnergy: state.checkinData.physicalEnergy,
                mentalEnergy: state.checkinData.mentalEnergy,
                sleep: state.checkinData.sleep,
                stress: state.checkinData.stress,
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Update streak display with real data
            updateStreakDisplay(data.data.streak);

            // Update completion screen streak
            const completionStreak = document.getElementById('completion-streak');
            if (completionStreak && data.data.streak) {
                completionStreak.textContent = data.data.streak.current;
            }

            if (data.data.alreadyCheckedIn) {
                console.log('Already checked in today:', data.data);
            } else {
                console.log('Check-in saved successfully:', data.data);
            }
        } else {
            console.error('Failed to save check-in:', data.error);
        }
    } catch (error) {
        console.error('Error saving check-in:', error);
        // Silently fail - check-in flow should still complete
    }
}

/**
 * Load dashboard data (streak, trends for week at a glance)
 */
async function loadDashboardData() {
    try {
        // Check if user already checked in today
        const todayResponse = await fetch(apiUrl('/api/checkin/today'), {
            credentials: 'include',
        });

        if (todayResponse.ok) {
            const todayData = await todayResponse.json();
            if (todayData.success) {
                updateCheckinCardState(todayData.data.hasCheckedInToday);
            }
        }

        // Load streak data
        const streakResponse = await fetch(apiUrl('/api/checkin/streak'), {
            credentials: 'include',
        });

        if (streakResponse.ok) {
            const streakData = await streakResponse.json();
            if (streakData.success) {
                updateStreakDisplay({
                    current: streakData.data.currentStreak,
                    longest: streakData.data.longestStreak,
                });
            }
        }

        // Load 7-day trends for "Week at a Glance"
        const trendsResponse = await fetch(apiUrl('/api/checkin/trends?period=7'), {
            credentials: 'include',
        });

        if (trendsResponse.ok) {
            const trendsData = await trendsResponse.json();
            if (trendsData.success && trendsData.data.dataPoints > 0) {
                updateWeekAtGlance(trendsData.data);
            }
        }

        // Load insights count for quick access card
        const insightsResponse = await fetch(apiUrl('/api/progress/insights/count'), {
            credentials: 'include',
        });

        if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            if (insightsData.success) {
                updateInsightsCount(insightsData.data.unreadCount);
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Load progress page data
 */
async function loadProgressData() {
    try {
        // Load streak and total check-ins
        const streakResponse = await fetch(apiUrl('/api/checkin/streak'), {
            credentials: 'include',
        });

        if (streakResponse.ok) {
            const streakData = await streakResponse.json();
            if (streakData.success) {
                // Update progress page stats
                const streakStatEl = document.querySelector('#screen-progress .stat-number[data-stat="streak"]');
                const checkinsStatEl = document.querySelector('#screen-progress .stat-number[data-stat="checkins"]');

                if (streakStatEl) {
                    streakStatEl.textContent = streakData.data.currentStreak;
                }
                if (checkinsStatEl) {
                    checkinsStatEl.textContent = streakData.data.totalCheckIns;
                }
            }
        }

        // Load 30-day trends for progress charts
        const trendsResponse = await fetch(apiUrl('/api/checkin/trends?period=30'), {
            credentials: 'include',
        });

        if (trendsResponse.ok) {
            const trendsData = await trendsResponse.json();
            if (trendsData.success && trendsData.data.dataPoints > 0) {
                updateProgressCharts(trendsData.data);
            }
        }

        // Load insights
        loadInsights();
    } catch (error) {
        console.error('Error loading progress data:', error);
    }
}

/**
 * Load and display insights on progress page
 */
async function loadInsights() {
    try {
        const response = await fetch(apiUrl('/api/progress/insights'), {
            credentials: 'include',
        });

        if (!response.ok) return;

        const data = await response.json();
        const insightsList = document.querySelector('#screen-progress .insights-list');
        if (!insightsList) return;

        // Update dashboard insights count
        updateInsightsCount(data.data.unreadCount || 0);

        // If no insights, keep the empty state
        if (!data.success || !data.data.insights || !data.data.insights.length) {
            return;
        }

        // Clear existing content (including empty state)
        insightsList.innerHTML = '';

        // Add real insights
        data.data.insights.forEach(insight => {
            const insightEl = createInsightElement(insight);
            insightsList.appendChild(insightEl);
        });
    } catch (error) {
        console.error('Error loading insights:', error);
    }
}

/**
 * Create an insight element
 */
function createInsightElement(insight) {
    const div = document.createElement('div');
    div.className = `insight-item${insight.isRead ? '' : ' unread'}`;
    div.dataset.insightId = insight.id;

    const iconClass = getInsightIcon(insight.type);

    div.innerHTML = `
        <div class="insight-icon ${insight.type === 'streak' ? 'success' : ''}">
            <i data-lucide="${iconClass}"></i>
        </div>
        <div class="insight-content">
            <h4 class="insight-title">${escapeHtml(insight.title)}</h4>
            <p class="insight-description">${escapeHtml(insight.body)}</p>
        </div>
    `;

    // Mark as read on click
    div.addEventListener('click', async () => {
        if (!insight.isRead) {
            await markInsightRead(insight.id);
            div.classList.remove('unread');
        }
    });

    // Reinitialize lucide icons for this element
    setTimeout(() => lucide.createIcons(), 0);

    return div;
}

/**
 * Get icon name for insight type
 */
function getInsightIcon(type) {
    switch (type) {
        case 'streak': return 'award';
        case 'pattern': return 'lightbulb';
        case 'trend': return 'trending-up';
        case 'recommendation': return 'target';
        default: return 'info';
    }
}

/**
 * Mark an insight as read
 */
async function markInsightRead(insightId) {
    try {
        await fetch(apiUrl(`/api/progress/insights/${insightId}/read`), {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Error marking insight as read:', error);
    }
}

/**
 * Update insights count on dashboard
 */
function updateInsightsCount(count) {
    const countEl = document.querySelector('.insights-waiting-count');
    if (countEl) {
        countEl.textContent = `${count} insight${count === 1 ? '' : 's'} waiting`;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update check-in card state based on whether user checked in today
 */
function updateCheckinCardState(hasCheckedIn) {
    const checkinCard = document.getElementById('checkin-card');
    const checkinButton = document.getElementById('checkin-button');
    const checkinDescription = checkinCard?.querySelector('.card-description');

    // Update sidebar nav check-in item
    const navCheckinItems = document.querySelectorAll('.nav-item[data-screen="checkin"]');

    if (hasCheckedIn) {
        if (checkinButton) {
            checkinButton.textContent = 'Retake Check-in';
            checkinButton.disabled = false;
            checkinButton.classList.remove('btn-disabled');
            checkinButton.classList.add('btn-secondary');
            checkinButton.classList.remove('btn-primary');
        }
        if (checkinDescription) {
            checkinDescription.textContent = "Done for today! Want to update your responses?";
        }
        if (checkinCard) {
            checkinCard.classList.add('checked-in');
        }
        // Update nav items
        navCheckinItems.forEach(item => {
            item.classList.add('completed');
            const label = item.querySelector('span');
            if (label && !label.dataset.originalText) {
                label.dataset.originalText = label.textContent;
                label.textContent = 'Check-in ✓';
            }
        });
    } else {
        if (checkinButton) {
            checkinButton.textContent = 'Begin Check-in';
            checkinButton.disabled = false;
            checkinButton.classList.remove('btn-disabled');
            checkinButton.classList.add('btn-primary');
            checkinButton.classList.remove('btn-secondary');
        }
        if (checkinDescription) {
            checkinDescription.textContent = 'Start your day with a quick reflection';
        }
        if (checkinCard) {
            checkinCard.classList.remove('checked-in');
        }
        // Reset nav items
        navCheckinItems.forEach(item => {
            item.classList.remove('completed');
            const label = item.querySelector('span');
            if (label && label.dataset.originalText) {
                label.textContent = label.dataset.originalText;
            }
        });
    }
}

/**
 * Update streak display elements
 */
function updateStreakDisplay(streak) {
    // Dashboard streak
    const dashboardStreakEl = document.querySelector('.streak-count');
    if (dashboardStreakEl && streak) {
        const count = streak.current || 0;
        dashboardStreakEl.textContent = `${count} day${count === 1 ? '' : 's'} streak`;
    }
}

/**
 * Update Week at a Glance section with real trend data
 */
function updateWeekAtGlance(trends) {
    // Update mood trend
    const moodTrendEl = document.querySelector('.metric-trend[data-metric="mood"]');
    if (moodTrendEl && trends.mood) {
        const change = trends.mood.change;
        if (change !== null) {
            const prefix = change > 0 ? '+' : '';
            moodTrendEl.textContent = `${prefix}${Math.round(change)}%`;
            moodTrendEl.classList.remove('positive', 'negative', 'neutral');
            moodTrendEl.classList.add(change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral');
        }
    }

    // Update energy trend
    const energyTrendEl = document.querySelector('.metric-trend[data-metric="energy"]');
    if (energyTrendEl && trends.physicalEnergy) {
        const trend = trends.physicalEnergy.trend;
        if (trend) {
            energyTrendEl.textContent = trend.charAt(0).toUpperCase() + trend.slice(1);
        }
    }

    // Update stress trend
    const stressTrendEl = document.querySelector('.metric-trend[data-metric="stress"]');
    if (stressTrendEl && trends.stress) {
        const change = trends.stress.change;
        if (change !== null) {
            // For stress, negative change is good
            const prefix = change > 0 ? '+' : '';
            stressTrendEl.textContent = `${prefix}${Math.round(change)}%`;
            stressTrendEl.classList.remove('positive', 'negative', 'neutral');
            // Inverse: for stress, decrease is good (positive), increase is bad (negative)
            stressTrendEl.classList.add(change < 0 ? 'positive' : change > 0 ? 'negative' : 'neutral');
        }
    }

    // Update SVG chart paths if we have enough data points
    if (trends.mood && trends.mood.values) {
        updateTrendChart('mood', trends.mood.values);
    }
    if (trends.physicalEnergy && trends.physicalEnergy.values) {
        updateTrendChart('energy', trends.physicalEnergy.values);
    }
    if (trends.stress && trends.stress.values) {
        updateTrendChart('stress', trends.stress.values);
    }
}

/**
 * Get dynamic scale range for chart data
 * Uses actual data range with padding to maximize visual variation
 */
function getDynamicScale(values) {
    if (!values || values.length === 0) return { min: 0, max: 10 };

    const dataValues = values.map(v => v.value);
    const dataMin = Math.min(...dataValues);
    const dataMax = Math.max(...dataValues);

    // If all values are the same, add small range around it
    if (dataMin === dataMax) {
        return { min: dataMin - 0.5, max: dataMax + 0.5 };
    }

    // Add 20% padding on each side to not touch edges
    const range = dataMax - dataMin;
    const padding = range * 0.2;

    return {
        min: dataMin - padding,
        max: dataMax + padding
    };
}

/**
 * Update a trend chart SVG with real data
 * Uses dynamic scaling to maximize visual variation in trends
 */
function updateTrendChart(metric, values) {
    if (!values || values.length < 2) return;

    const chartContainer = document.querySelector(`.trend-chart[data-metric="${metric}"]`);
    if (!chartContainer) return;

    const chartLine = chartContainer.querySelector('polyline.trend-line');
    const chartFill = chartContainer.querySelector('path.trend-line');
    if (!chartLine) return;

    // Chart dimensions (matching the SVG viewBox 0 0 100 40)
    const width = 100;
    const height = 40;
    const padding = 5;

    // Use dynamic scale based on actual data for maximum visual variation
    const scale = getDynamicScale(values);
    const range = scale.max - scale.min;

    const points = values.map((v, i) => {
        const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((v.value - scale.min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    });

    // Update polyline points
    chartLine.setAttribute('points', points.join(' '));

    // Update fill path if exists (area under curve)
    if (chartFill) {
        const firstX = padding;
        const lastX = width - padding;
        const pathData = `M${firstX},${height} L${points.join(' L')} L${lastX},${height} Z`;
        chartFill.setAttribute('d', pathData);
    }
}

/**
 * Update progress page charts with 30-day trend data
 */
function updateProgressCharts(trends) {
    // Update mood chart
    updateProgressChart('mood', trends.mood);

    // Update stress chart
    updateProgressChart('stress', trends.stress);
}

/**
 * Update a single progress chart
 * Uses dynamic scaling to maximize visual variation in trends
 */
function updateProgressChart(metric, data) {
    if (!data || !data.values || data.values.length < 2) return;

    const chartContainer = document.querySelector(`#screen-progress .wellbeing-chart[data-metric="${metric}"]`);
    if (!chartContainer) return;

    const chartLine = chartContainer.querySelector('polyline.chart-line');
    const chartFill = chartContainer.querySelector('svg.trend-chart > path');
    if (!chartLine) return;

    // Chart dimensions (matching SVG viewBox 0 0 400 100)
    const width = 400;
    const height = 100;
    const padding = 10;

    const values = data.values;

    // Use dynamic scale based on actual data for maximum visual variation
    const scale = getDynamicScale(values);
    const range = scale.max - scale.min;

    const points = values.map((v, i) => {
        const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((v.value - scale.min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    });

    // Update polyline points
    chartLine.setAttribute('points', points.join(' '));

    // Update fill path if exists (area under curve)
    if (chartFill) {
        const firstX = padding;
        const lastX = width - padding;
        const pathData = `M${firstX},${height} L${points.join(' L')} L${lastX},${height} Z`;
        chartFill.setAttribute('d', pathData);
    }

    // Update trend badge if exists
    const trendBadge = chartContainer.querySelector('.trend-badge');
    if (trendBadge && data.change !== null) {
        const prefix = data.change > 0 ? '+' : '';
        trendBadge.textContent = `${prefix}${Math.round(data.change)}%`;
    }
}

/**
 * Go to previous step in check-in
 */
function prevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateStep(state.currentStep);
    }
}

/**
 * Update step display
 */
function updateStep(step) {
    // Update step indicator
    document.getElementById('current-step').textContent = step;

    // Update step dots
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index + 1 === step) {
            dot.classList.add('active');
        } else if (index + 1 < step) {
            dot.classList.add('completed');
        }
    });

    // Show/hide steps
    document.querySelectorAll('.checkin-step').forEach(stepEl => {
        stepEl.classList.remove('active');
        if (parseInt(stepEl.dataset.step) === step) {
            stepEl.classList.add('active');
        }
    });

    // Update back button visibility
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        backBtn.style.visibility = step > 1 ? 'visible' : 'hidden';
    }

    // Update next button text for final step
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) {
        if (step === state.totalSteps) {
            nextBtn.innerHTML = 'Go to Dashboard <i data-lucide="arrow-right"></i>';
        } else {
            nextBtn.innerHTML = 'Continue <i data-lucide="arrow-right"></i>';
        }
        lucide.createIcons();
    }

    // Reinitialize icons
    lucide.createIcons();
}

/**
 * Select mood option
 */
function selectMood(element) {
    // Remove selection from all
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selection to clicked
    element.classList.add('selected');
    state.checkinData.mood = parseInt(element.dataset.value);
}

/**
 * Select sleep option
 */
function selectSleep(element) {
    // Remove selection from all
    document.querySelectorAll('.sleep-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selection to clicked
    element.classList.add('selected');
    state.checkinData.sleep = parseInt(element.dataset.value);
}

/**
 * Update date display (greeting is handled by profile functions)
 */
function updateGreeting() {
    // Update hero date display
    const heroDate = document.querySelector('.hero-date');
    if (heroDate) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        heroDate.textContent = today;
    }

    // Update legacy date display
    const dateEl = document.querySelector('.date-display');
    if (dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        dateEl.textContent = today;
    }
}

// ============================================================================
// Authentication Handlers
// ============================================================================

/**
 * Auth state
 */
const authState = {
  pendingEmail: null,
};

/**
 * Initialize auth on page load
 */
async function initializeAuth() {
  // Check URL for special routes
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);

  // Handle verify-email route
  if (path === '/verify-email') {
    const token = urlParams.get('token');
    if (token) {
      await handleVerifyEmailToken(token);
    } else {
      showScreen('login');
    }
    return;
  }

  // Handle reset-password route
  if (path === '/reset-password') {
    const token = urlParams.get('token');
    if (token) {
      document.getElementById('reset-token').value = token;
      showScreen('reset-password');
    } else {
      showScreen('login');
    }
    return;
  }

  // Handle direct auth routes
  if (path === '/login') {
    showScreen('login');
    return;
  }

  if (path === '/register') {
    showScreen('register');
    return;
  }

  if (path === '/forgot-password') {
    showScreen('forgot-password');
    return;
  }

  // Check existing session - require authentication for all other pages
  try {
    const result = await AuthClient.getSession();
    if (result.success && result.data?.authenticated) {
      // User is logged in - show dashboard
      updateUserDisplay(result.data.user);
      // Check admin status to show/hide admin nav
      checkAdminStatus();
      showScreen('dashboard');
    } else {
      // Not logged in - redirect to login
      showScreen('login');
    }
  } catch (error) {
    console.log('No active session - redirecting to login');
    showScreen('login');
  }
}

/**
 * Update user display in header
 */
function updateUserDisplay(user) {
  if (!user) return;

  // Update profile state with user data
  if (user.profile?.firstName) profileState.profileData.firstName = user.profile.firstName;
  if (user.profile?.lastName) profileState.profileData.lastName = user.profile.lastName;
  if (user.email) profileState.profileData.email = user.email;
  if (user.profile?.organization) profileState.profileData.organization = user.profile.organization;

  // Get display name - prioritize firstName, then capitalize email prefix
  let displayName;
  if (user.profile?.firstName) {
    displayName = user.profile.firstName;
  } else if (user.email) {
    // Capitalize first letter of email prefix as fallback
    const emailPrefix = user.email.split('@')[0];
    displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  } else {
    displayName = 'User';
  }

  // Update avatar initials or picture
  const avatars = document.querySelectorAll('.avatar');
  const initials = getInitials(user.profile?.firstName, user.profile?.lastName, user.email);
  avatars.forEach(avatar => {
    if (profileState.profilePicture) {
      avatar.innerHTML = `<img src="${profileState.profilePicture}" alt="Profile picture">`;
    } else if (!avatar.querySelector('img')) {
      avatar.textContent = initials;
    }
  });

  // Update user name displays (first name only)
  const names = document.querySelectorAll('.user-name');
  names.forEach(el => {
    el.textContent = displayName;
  });

  // Update greeting (only on dashboard)
  const greetings = document.querySelectorAll('.hero-greeting');
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  greetings.forEach(el => {
    if (!el.closest('#screen-learning') &&
        !el.closest('#screen-circles') &&
        !el.closest('#screen-progress') &&
        !el.closest('#screen-coach')) {
      el.textContent = `${greeting}, ${displayName}`;
    }
  });
}

/**
 * Get initials from name or email
 */
function getInitials(firstName, lastName, email) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('login-submit');
  const errorAlert = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');

  // Clear previous errors
  errorAlert.classList.remove('visible');
  clearFormErrors(form);

  // Get form data
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('login-remember').checked;

  // Show loading
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const result = await AuthClient.login(email, password, rememberMe);

    if (result.success) {
      // Update user display
      updateUserDisplay(result.data.user);
      // Check admin status to show/hide admin nav
      checkAdminStatus();
      // Navigate to dashboard
      showScreen('dashboard');
      // Clear form
      form.reset();
    }
  } catch (error) {
    // Show error
    errorText.textContent = error.message || 'Login failed';
    errorAlert.classList.add('visible');

    // Handle field-specific errors
    if (error.fields) {
      showFieldErrors(form, error.fields);
    }
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    lucide.createIcons();
  }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('register-submit');
  const errorAlert = document.getElementById('register-error');
  const errorText = document.getElementById('register-error-text');

  // Clear previous errors
  errorAlert.classList.remove('visible');
  clearFormErrors(form);

  // Get form data
  const firstName = document.getElementById('register-firstname').value;
  const lastName = document.getElementById('register-lastname').value;
  const email = document.getElementById('register-email').value;
  const organization = document.getElementById('register-organization').value;
  const country = document.getElementById('register-country').value;
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;

  // Get consents
  const consents = {
    termsOfService: document.getElementById('consent-terms').checked,
    privacyPolicy: document.getElementById('consent-privacy').checked,
    dataProcessing: document.getElementById('consent-data').checked,
    marketing: document.getElementById('consent-marketing').checked,
  };

  // Client-side validation
  if (password !== passwordConfirm) {
    showFieldError('register-password-confirm', 'Passwords do not match');
    return;
  }

  // Show loading
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const result = await AuthClient.register({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      organization,
      country,
      consents,
    });

    if (result.success) {
      // Save profile data
      profileState.profileData.firstName = firstName;
      profileState.profileData.lastName = lastName;
      profileState.profileData.email = email;
      profileState.profileData.organization = organization;
      saveProfileToLocalStorage();

      // Store email for verification resend
      authState.pendingEmail = email;

      // Clear form
      form.reset();
      document.getElementById('password-strength').dataset.strength = '';
      document.getElementById('strength-text').textContent = '';

      // Show verification pending screen
      document.getElementById('verify-email-address').textContent = email;
      showScreen('verify-pending');
    }
  } catch (error) {
    // Show error
    errorText.textContent = error.message || 'Registration failed';
    errorAlert.classList.add('visible');

    // Handle field-specific errors
    if (error.fields) {
      showFieldErrors(form, error.fields);
    }
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    lucide.createIcons();
  }
}

/**
 * Handle email verification token from URL
 */
async function handleVerifyEmailToken(token) {
  try {
    const result = await AuthClient.verifyEmail(token);

    if (result.success) {
      showScreen('verify-success');
    }
  } catch (error) {
    // Show error on login screen
    showScreen('login');
    const errorAlert = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    errorText.textContent = error.message || 'Verification failed';
    errorAlert.classList.add('visible');
    lucide.createIcons();
  }
}

/**
 * Resend verification email
 */
async function resendVerification() {
  const email = authState.pendingEmail || document.getElementById('verify-email-address').textContent;

  if (!email || email === 'your email') {
    showScreen('login');
    return;
  }

  try {
    await AuthClient.resendVerification(email);
    alert('Verification email sent!');
  } catch (error) {
    alert('Failed to resend email. Please try again.');
  }
}

/**
 * Handle forgot password form submission
 */
async function handleForgotPassword(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('forgot-submit');
  const successAlert = document.getElementById('forgot-success');

  // Clear previous state
  successAlert.classList.remove('visible');
  clearFormErrors(form);

  // Get form data
  const email = document.getElementById('forgot-email').value;

  // Show loading
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    await AuthClient.forgotPassword(email);
    // Always show success (security best practice)
    successAlert.classList.add('visible');
    lucide.createIcons();
  } catch (error) {
    // Still show success to prevent email enumeration
    successAlert.classList.add('visible');
    lucide.createIcons();
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

/**
 * Handle reset password form submission
 */
async function handleResetPassword(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('reset-submit');
  const errorAlert = document.getElementById('reset-error');
  const errorText = document.getElementById('reset-error-text');

  // Clear previous errors
  errorAlert.classList.remove('visible');
  clearFormErrors(form);

  // Get form data
  const token = document.getElementById('reset-token').value;
  const password = document.getElementById('reset-password').value;
  const passwordConfirm = document.getElementById('reset-password-confirm').value;

  // Client-side validation
  if (password !== passwordConfirm) {
    showFieldError('reset-password-confirm', 'Passwords do not match');
    return;
  }

  // Show loading
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const result = await AuthClient.resetPassword(token, password, passwordConfirm);

    if (result.success) {
      showScreen('reset-success');
      form.reset();
      document.getElementById('reset-password-strength').dataset.strength = '';
      document.getElementById('reset-strength-text').textContent = '';
    }
  } catch (error) {
    // Show error
    errorText.textContent = error.message || 'Reset failed';
    errorAlert.classList.add('visible');
    lucide.createIcons();
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await AuthClient.logout();
  } catch (error) {
    console.warn('Logout error:', error);
  }

  // Clear profile data from localStorage and state
  localStorage.removeItem('deburn_profile');
  profileState.profileData = {
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    bio: ''
  };
  profileState.profilePicture = null;

  // Reset user name displays
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = 'User';
  });

  showScreen('login');
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    icon.setAttribute('data-lucide', 'eye');
  }

  lucide.createIcons();
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
  const strengthEl = document.getElementById('password-strength');
  const textEl = document.getElementById('strength-text');

  const { strength, label } = calculatePasswordStrength(password);

  strengthEl.dataset.strength = strength;
  textEl.textContent = password ? label : '';
}

/**
 * Update reset password strength indicator
 */
function updateResetPasswordStrength(password) {
  const strengthEl = document.getElementById('reset-password-strength');
  const textEl = document.getElementById('reset-strength-text');

  const { strength, label } = calculatePasswordStrength(password);

  strengthEl.dataset.strength = strength;
  textEl.textContent = password ? label : '';
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
  if (!password) {
    return { strength: '', label: '' };
  }

  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Determine strength
  if (score <= 2) {
    return { strength: 'weak', label: 'Weak password' };
  } else if (score <= 3) {
    return { strength: 'fair', label: 'Fair password' };
  } else if (score <= 5) {
    return { strength: 'good', label: 'Good password' };
  } else {
    return { strength: 'strong', label: 'Strong password' };
  }
}

/**
 * Clear all form errors
 */
function clearFormErrors(form) {
  form.querySelectorAll('.form-input, .form-select, .checkbox-input').forEach(input => {
    input.classList.remove('error');
  });
  form.querySelectorAll('.form-error').forEach(error => {
    error.classList.remove('visible');
    error.textContent = '';
  });
}

/**
 * Show field-specific errors
 */
function showFieldErrors(form, fields) {
  Object.entries(fields).forEach(([field, message]) => {
    showFieldError(field, message);
  });
}

/**
 * Show error for a specific field
 */
function showFieldError(fieldName, message) {
  // Try to find by ID pattern
  const errorId = fieldName.includes('-') ? `${fieldName}-error` : `register-${fieldName}-error`;
  const errorEl = document.getElementById(errorId) || document.querySelector(`[id$="${fieldName}-error"]`);

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }

  // Add error class to input
  const inputEl = document.getElementById(fieldName) || document.getElementById(`register-${fieldName}`);
  if (inputEl) {
    inputEl.classList.add('error');
  }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure AuthClient is loaded
  setTimeout(initializeAuth, 100);
});

/**
 * Toggle user menu dropdown
 */
function toggleUserMenu(menuElement) {
  // Close all other open menus first
  document.querySelectorAll('.user-menu.open').forEach(menu => {
    if (menu !== menuElement) {
      menu.classList.remove('open');
    }
  });

  // Toggle current menu
  menuElement.classList.toggle('open');

  // Reinitialize icons for the dropdown
  lucide.createIcons();
}

/**
 * Close user menu when clicking outside
 */
document.addEventListener('click', (event) => {
  const openMenus = document.querySelectorAll('.user-menu.open');
  openMenus.forEach(menu => {
    if (!menu.contains(event.target)) {
      menu.classList.remove('open');
    }
  });
});

// ============================================================================
// Inline Loading Spinner (Hula Hoop Style)
// ============================================================================

/**
 * Get the HTML for the inline spinner
 * @param {string} text - Optional loading text to display
 */
function getSpinnerHTML(text = 'Loading...') {
  return `
    <div class="spinner-inline">
      <div class="spinner-container">
        <svg class="spinner-svg" viewBox="0 0 100 100">
          <circle class="spinner-orb spinner-orb-1" cx="60" cy="50" r="40"/>
          <circle class="spinner-orb spinner-orb-2" cx="58" cy="50" r="33"/>
          <circle class="spinner-orb spinner-orb-3" cx="56" cy="50" r="26"/>
          <circle class="spinner-orb spinner-orb-4" cx="54" cy="50" r="19"/>
          <circle class="spinner-orb spinner-orb-5" cx="52" cy="50" r="12"/>
        </svg>
      </div>
      <span class="spinner-text">${text}</span>
    </div>
  `;
}

/**
 * Show spinner in a container element
 * @param {HTMLElement|string} container - Container element or selector
 * @param {string} text - Optional loading text
 */
function showSpinner(container, text = 'Loading...') {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (el) {
    el.innerHTML = getSpinnerHTML(text);
  }
}

/**
 * Hide spinner (clear container)
 * @param {HTMLElement|string} container - Container element or selector
 */
function hideSpinner(container) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (el) {
    el.innerHTML = '';
  }
}

// ============================================================================
// Coach Floating Navigation (Mobile)
// ============================================================================

/**
 * Toggle the coach floating navigation menu
 */
function toggleCoachFloatingNav() {
    const nav = document.getElementById('coach-floating-nav');
    if (nav) {
        nav.classList.toggle('expanded');
    }
}

/**
 * Navigate from the coach floating nav menu
 */
function navigateFromCoach(screenId) {
    const nav = document.getElementById('coach-floating-nav');
    if (nav) {
        nav.classList.remove('expanded');
    }
    showScreen(screenId);
}

/**
 * Close coach floating nav when clicking outside
 */
document.addEventListener('click', function(e) {
    const nav = document.getElementById('coach-floating-nav');
    if (nav && nav.classList.contains('expanded')) {
        if (!nav.contains(e.target)) {
            nav.classList.remove('expanded');
        }
    }
});

// Make functions available globally for onclick handlers
window.getSpinnerHTML = getSpinnerHTML;
window.showSpinner = showSpinner;
window.showScreen = showScreen;
window.toggleCoachFloatingNav = toggleCoachFloatingNav;
window.navigateFromCoach = navigateFromCoach;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.selectMood = selectMood;
window.selectSleep = selectSleep;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleForgotPassword = handleForgotPassword;
window.handleResetPassword = handleResetPassword;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;
window.updatePasswordStrength = updatePasswordStrength;
window.updateResetPasswordStrength = updateResetPasswordStrength;
window.resendVerification = resendVerification;
window.toggleUserMenu = toggleUserMenu;

// ============================================================================
// Coach Avatar (Multi-circle icon)
// ============================================================================

/**
 * Get the HTML for the coach avatar (static circles icon)
 */
function getCoachAvatarHTML() {
  return `
    <svg class="coach-avatar-svg" viewBox="0 0 100 100">
      <circle class="avatar-orb avatar-orb-1" cx="55" cy="50" r="40"/>
      <circle class="avatar-orb avatar-orb-2" cx="53" cy="50" r="32"/>
      <circle class="avatar-orb avatar-orb-3" cx="51" cy="50" r="24"/>
      <circle class="avatar-orb avatar-orb-4" cx="49" cy="50" r="16"/>
      <circle class="avatar-orb avatar-orb-5" cx="47" cy="50" r="8"/>
    </svg>
  `;
}

// ============================================================================
// AI Coach Chat Functions
// ============================================================================

/**
 * Coach chat state
 */
const coachState = {
  isLoading: false,
  currentMessageElement: null,
  currentResponseText: '',
  preloadedAudio: new Map() // Cache for preloaded TTS audio
};

/**
 * Preload TTS audio for a message in the background
 */
async function preloadTTSAudio(messageId, text) {
  if (!text || text.length < 10) return;

  try {
    console.log('[TTS Preload] Starting preload for message:', messageId);
    const currentLang = window.i18nClient?.getCurrentLanguage?.() || 'en';

    const response = await fetch('/api/coach/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text, language: currentLang }),
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      coachState.preloadedAudio.set(messageId, audioUrl);
      console.log('[TTS Preload] Audio ready for message:', messageId);
    }
  } catch (error) {
    console.warn('[TTS Preload] Failed:', error.message);
  }
}

/**
 * Voice mode instance
 */
let voiceModeInstance = null;

/**
 * Initialize voice mode for the coach
 */
function initVoiceMode() {
  const voiceBtn = document.getElementById('voice-input-btn');
  const coachInput = document.getElementById('coach-input');

  // Check if voice input (STT) is supported - TTS works regardless
  if (!VoiceMode.isSupported()) {
    if (voiceBtn) {
      voiceBtn.classList.add('not-supported');
      voiceBtn.title = 'Voice input not supported in this browser';
      voiceBtn.disabled = true;
    }
    // Still create instance for TTS functionality
  }

  // Get current language
  const currentLang = window.i18nClient?.getCurrentLanguage?.() || 'en';
  const langCode = VoiceMode.getLanguageCode(currentLang);

  // Create voice mode instance
  voiceModeInstance = new VoiceMode({
    language: langCode,
    onTranscript: (transcript) => {
      if (coachInput && transcript) {
        coachInput.value = transcript;
        // Auto-send after getting final transcript
        sendCoachMessage();
      }
    },
    onInterimTranscript: (transcript) => {
      if (coachInput) {
        coachInput.value = transcript;
        coachInput.placeholder = '';
      }
    },
    onStart: () => {
      if (voiceBtn) {
        voiceBtn.classList.add('recording');
      }
      if (coachInput) {
        coachInput.placeholder = 'Listening...';
      }
    },
    onEnd: () => {
      if (voiceBtn) {
        voiceBtn.classList.remove('recording');
      }
      if (coachInput) {
        coachInput.placeholder = coachInput.dataset.originalPlaceholder || 'Type a message...';
      }
    },
    onError: (message, errorType) => {
      if (voiceBtn) {
        voiceBtn.classList.remove('recording');
      }
      if (coachInput) {
        coachInput.placeholder = coachInput.dataset.originalPlaceholder || 'Type a message...';
      }
      // Show error toast if not just "no speech"
      if (errorType !== 'no-speech' && errorType !== 'aborted') {
        showToast(message, 'error');
      }
    }
  });

  // Store original placeholder
  if (coachInput) {
    coachInput.dataset.originalPlaceholder = coachInput.placeholder;
  }
}

/**
 * Toggle voice input recording
 */
function toggleVoiceInput() {
  if (!voiceModeInstance) {
    initVoiceMode();
  }

  if (!voiceModeInstance) {
    showToast('Voice input not available', 'error');
    return;
  }

  voiceModeInstance.toggleListening();
}

/**
 * Add listen button to a coach message
 */
function addListenButtonToMessage(messageElement, text, messageId) {
  if (!text || text.length < 10) return; // Don't add for very short messages

  const contentDiv = messageElement.querySelector('.message-content');
  if (!contentDiv) return;

  // Check if button already exists
  if (contentDiv.querySelector('.coach-listen-btn')) return;

  // Generate message ID if not provided
  const msgId = messageId || `msg-${Date.now()}`;

  // Start preloading audio in background
  preloadTTSAudio(msgId, text);

  const listenBtn = document.createElement('button');
  listenBtn.className = 'coach-listen-btn';
  listenBtn.innerHTML = `
    <i data-lucide="volume-2"></i>
    <span class="listen-text">Listen</span>
  `;

  // Audio element for this button (persists across clicks)
  const audioState = { element: null };

  // Helper to update button state
  const updateListenButton = (isPlaying) => {
    if (isPlaying) {
      listenBtn.classList.add('playing');
      listenBtn.querySelector('.listen-text').textContent = 'Stop';
    } else {
      listenBtn.classList.remove('playing');
      listenBtn.querySelector('.listen-text').textContent = 'Listen';
    }
    // Replace icon - Lucide converts <i> to <svg>, so we need to replace the whole thing
    const iconContainer = listenBtn.querySelector('svg') || listenBtn.querySelector('i');
    if (iconContainer) {
      const newIcon = document.createElement('i');
      newIcon.setAttribute('data-lucide', isPlaying ? 'square' : 'volume-2');
      iconContainer.replaceWith(newIcon);
      lucide.createIcons({ nodes: [listenBtn] });
    }
  };

  listenBtn.onclick = async () => {
    // If already playing, stop
    if (listenBtn.classList.contains('playing')) {
      if (audioState.element) {
        audioState.element.pause();
        audioState.element.currentTime = 0;
        audioState.element = null;
      }
      if (voiceModeInstance) {
        voiceModeInstance.stopAudio();
      }
      updateListenButton(false);
      return;
    }

    // Start playing
    updateListenButton(true);

    // Check for preloaded audio first
    const preloadedUrl = coachState.preloadedAudio.get(msgId);
    if (preloadedUrl) {
      console.log('[Listen] Using preloaded audio');
      audioState.element = new Audio(preloadedUrl);
      audioState.element.onended = () => updateListenButton(false);
      audioState.element.onerror = () => {
        updateListenButton(false);
        showToast('Failed to play audio', 'error');
      };
      try {
        await audioState.element.play();
      } catch (e) {
        updateListenButton(false);
        showToast('Failed to play audio', 'error');
      }
      return;
    }

    // Fallback: generate audio on demand
    console.log('[Listen] No preloaded audio, generating...');
    if (!voiceModeInstance) {
      initVoiceMode();
    }

    if (voiceModeInstance) {
      const currentLang = window.i18nClient?.getCurrentLanguage?.() || 'en';
      await voiceModeInstance.playTTS(text, {
        language: currentLang,
        onEnd: () => updateListenButton(false),
        onError: () => {
          updateListenButton(false);
          showToast('Failed to play audio', 'error');
        }
      });
    }
  };

  contentDiv.appendChild(listenBtn);
  lucide.createIcons({ nodes: [listenBtn] });
}

// Initialize voice mode when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Delay initialization slightly to ensure all elements are ready
  setTimeout(initVoiceMode, 500);
});

/**
 * Send a message to the AI coach
 */
async function sendCoachMessage() {
  const input = document.getElementById('coach-input');
  const message = input.value.trim();

  if (!message || coachState.isLoading) return;

  // Clear input
  input.value = '';

  // Hide conversation starters if visible
  const starters = document.getElementById('conversation-starters');
  if (starters) {
    starters.style.display = 'none';
  }

  // Hide quick replies
  hideQuickReplies();

  // Add user message to chat
  addUserMessage(message);

  // Show typing indicator
  showTypingIndicator();

  // Set loading state
  coachState.isLoading = true;
  updateSendButton(true);

  // Reset response text tracking
  coachState.currentResponseText = '';

  try {
    // Use streaming
    await CoachClient.streamMessage(message, {
      onText: (text) => {
        // Hide typing indicator on first text
        hideTypingIndicator();

        // Track response text for TTS
        coachState.currentResponseText += text;

        // Add or update coach message
        if (!coachState.currentMessageElement) {
          coachState.currentMessageElement = addCoachMessage('');
        }
        appendToCoachMessage(coachState.currentMessageElement, text);
      },
      onActions: (actions) => {
        if (actions && actions.length > 0) {
          addActionsToMessage(coachState.currentMessageElement, actions);
        }
      },
      onQuickReplies: (replies) => {
        if (replies && replies.length > 0) {
          showQuickReplies(replies);
        }
      },
      onMetadata: (metadata) => {
        console.log('Coach metadata:', metadata);
      },
      onDone: () => {
        // Add listen button to the completed message
        if (coachState.currentMessageElement && coachState.currentResponseText) {
          addListenButtonToMessage(coachState.currentMessageElement, coachState.currentResponseText);
        }

        coachState.isLoading = false;
        coachState.currentMessageElement = null;
        coachState.currentResponseText = '';
        updateSendButton(false);
        scrollToBottom();
      },
      onError: (error) => {
        console.error('Coach error:', error);
        hideTypingIndicator();
        addErrorMessage('Sorry, I encountered an error. Please try again.');
        coachState.isLoading = false;
        coachState.currentMessageElement = null;
        updateSendButton(false);
      }
    });
  } catch (error) {
    console.error('Coach error:', error);
    hideTypingIndicator();
    addErrorMessage('Sorry, I encountered an error. Please try again.');
    coachState.isLoading = false;
    updateSendButton(false);
  }
}

/**
 * Send a conversation starter message
 * @param {HTMLElement|string} buttonOrMessage - Either the button element or a message string
 */
function sendStarterMessage(buttonOrMessage) {
  const input = document.getElementById('coach-input');

  // Handle both element clicks and direct string calls
  let message;
  if (typeof buttonOrMessage === 'string') {
    message = buttonOrMessage;
  } else {
    // Get the text from the span inside the button (for i18n support)
    const span = buttonOrMessage.querySelector('span');
    message = span ? span.textContent : buttonOrMessage.textContent;
  }

  input.value = message.trim();
  sendCoachMessage();
}

/**
 * Handle quick reply click
 */
function handleQuickReply(reply) {
  const input = document.getElementById('coach-input');
  input.value = reply;
  sendCoachMessage();
}

/**
 * Handle Enter key in chat input
 */
function handleCoachInputKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendCoachMessage();
  }
}

/**
 * Add user message to chat
 */
function addUserMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message-user';
  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

/**
 * Add coach message to chat
 */
function addCoachMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message-coach';
  messageDiv.innerHTML = `
    <div class="message-avatar">
      ${getCoachAvatarHTML()}
    </div>
    <div class="message-content">
      <div class="message-text"></div>
    </div>
  `;
  messagesContainer.appendChild(messageDiv);

  const textDiv = messageDiv.querySelector('.message-text');
  if (text) {
    textDiv.innerHTML = formatCoachResponse(text);
  }

  scrollToBottom();
  return messageDiv;
}

/**
 * Append text to coach message (for streaming)
 */
function appendToCoachMessage(messageElement, text) {
  const textDiv = messageElement.querySelector('.message-text');
  if (textDiv) {
    // Append raw text and reformat
    textDiv.dataset.rawText = (textDiv.dataset.rawText || '') + text;
    textDiv.innerHTML = formatCoachResponse(textDiv.dataset.rawText);
    scrollToBottom();
  }
}

/**
 * Add actions to coach message
 */
function addActionsToMessage(messageElement, actions) {
  const contentDiv = messageElement.querySelector('.message-content');
  if (!contentDiv || actions.length === 0) return;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'coach-content-suggestions';

  actions.forEach(action => {
    const card = document.createElement('button');
    card.className = 'coach-content-card';
    card.onclick = () => handleActionClick(action);

    // Determine icon based on content type or action type
    let iconName = 'book-open';
    if (action.contentType === 'audio_article' || action.contentType === 'audio_exercise') {
      iconName = 'play-circle';
    } else if (action.type === 'exercise') {
      iconName = 'headphones';
    }

    card.innerHTML = `
      <div class="coach-content-card-icon"><i data-lucide="${iconName}"></i></div>
      <div class="coach-content-card-title">${escapeHtml(action.label)}</div>
    `;
    actionsDiv.appendChild(card);
  });

  contentDiv.appendChild(actionsDiv);
  lucide.createIcons();
}

/**
 * Handle action button click - opens content in modal
 */
async function handleActionClick(action) {
  console.log('Action clicked:', action);

  // If we have an ID, try to open the content directly
  if (action.id) {
    // Check if content is already loaded in learningContentItems
    if (learningContentItems[action.id]) {
      const item = learningContentItems[action.id];
      console.log('Found in cache:', item);
      if (item.audioFileEn || item.audioFileSv) {
        openAudioPlayer(action.id);
        return;
      }
      if (item.textContentEn || item.textContentSv) {
        openTextContentModal(item);
        return;
      }
    }

    // Fetch the content item from API
    try {
      console.log('Fetching content:', action.id);
      const response = await fetch(apiUrl(`/api/learning/content/${action.id}`), {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        if (data.success && data.data && data.data.item) {
          const item = data.data.item;
          // Store for future use
          learningContentItems[item.id] = item;

          // Open audio player if it has audio
          if (item.audioFileEn || item.audioFileSv) {
            openAudioPlayer(item.id);
            return;
          }

          // For text content, show in a simple modal
          if (item.textContentEn || item.textContentSv) {
            openTextContentModal(item);
            return;
          }

          // Content found but no audio/text - show info modal
          openTextContentModal({
            titleEn: item.titleEn || action.label,
            titleSv: item.titleSv,
            textContentEn: item.purpose || 'This content is coming soon.',
            textContentSv: item.purpose
          });
          return;
        }
      }
    } catch (error) {
      console.warn('Error fetching content:', error);
    }
  }

  // Fallback: switch to Learning tab where content can be browsed
  console.log('Falling back to Learning tab');
  const learningTab = document.querySelector('[data-tab="learning"]');
  if (learningTab) {
    learningTab.click();
  }
}

/**
 * Show quick reply chips
 */
function showQuickReplies(replies) {
  const container = document.getElementById('quick-replies');
  container.innerHTML = '';
  container.style.display = 'flex';

  replies.forEach(reply => {
    const chip = document.createElement('button');
    chip.className = 'quick-reply-chip';
    chip.textContent = reply;
    chip.onclick = () => handleQuickReply(reply);
    container.appendChild(chip);
  });
}

/**
 * Hide quick reply chips
 */
function hideQuickReplies() {
  const container = document.getElementById('quick-replies');
  container.style.display = 'none';
  container.innerHTML = '';
}

/**
 * Add error message to chat
 */
function addErrorMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message-coach message-error';
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <i data-lucide="alert-circle"></i>
    </div>
    <div class="message-content">
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  messagesContainer.appendChild(messageDiv);
  lucide.createIcons();
  scrollToBottom();
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById('chat-messages');

  // Remove existing indicator if any
  hideTypingIndicator();

  const indicator = document.createElement('div');
  indicator.className = 'message message-coach typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <div class="message-avatar">
      ${getCoachAvatarHTML()}
    </div>
    <div class="message-content">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(indicator);
  lucide.createIcons();
  scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Update send button state
 */
function updateSendButton(isLoading) {
  const btn = document.getElementById('coach-send-btn');
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i>';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="send"></i>';
  }
  lucide.createIcons();
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
  const messagesContainer = document.getElementById('chat-messages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

/**
 * Format coach response with markdown-like formatting
 */
function formatCoachResponse(text) {
  if (!text) return '';

  // Escape HTML first
  let formatted = escapeHtml(text);

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert bullet points (- item) to list items
  formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive list items in <ul>
  formatted = formatted.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert numbered lists (1. item) to ordered list items
  formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Convert double newlines to paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p>');

  // Convert single newlines to line breaks (but not within lists)
  formatted = formatted.replace(/(?<!<\/li>)\n(?!<li>)/g, '<br>');

  // Wrap in paragraph if not already wrapped
  if (!formatted.startsWith('<')) {
    formatted = '<p>' + formatted + '</p>';
  }

  return formatted;
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Reset coach chat to initial state
 */
function resetCoachChat() {
  const messagesContainer = document.getElementById('chat-messages');
  const starters = document.getElementById('conversation-starters');

  // Clear messages except welcome message
  const welcomeMessage = document.getElementById('welcome-message');
  messagesContainer.innerHTML = '';
  if (welcomeMessage) {
    messagesContainer.appendChild(welcomeMessage.cloneNode(true));
  }

  // Show starters
  if (starters) {
    messagesContainer.appendChild(starters.cloneNode(true));
  }

  // Hide quick replies
  hideQuickReplies();

  // Reset coach client conversation
  if (window.CoachClient) {
    CoachClient.newConversation();
  }

  // Reset state
  coachState.isLoading = false;
  coachState.currentMessageElement = null;

  lucide.createIcons();
}

// Make coach functions available globally
window.sendCoachMessage = sendCoachMessage;
window.sendStarterMessage = sendStarterMessage;
window.handleQuickReply = handleQuickReply;
window.handleCoachInputKeypress = handleCoachInputKeypress;
window.resetCoachChat = resetCoachChat;

// ============================================================================
// Profile Page Functions
// ============================================================================

/**
 * Profile state
 */
const profileState = {
  profilePicture: null, // Base64 encoded image or null
  profileData: {
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    bio: ''
  }
};

/**
 * Initialize profile page
 */
function initializeProfilePage() {
  loadProfileData();
  updateProfileAvatarPreview();
}

/**
 * Load profile data from local storage or defaults
 */
function loadProfileData() {
  // Try to load from localStorage
  const savedProfile = localStorage.getItem('deburn_profile');
  if (savedProfile) {
    try {
      const data = JSON.parse(savedProfile);
      profileState.profileData = { ...profileState.profileData, ...data };
      profileState.profilePicture = data.profilePicture || null;
    } catch (e) {
      console.warn('Failed to parse saved profile:', e);
    }
  }

  // Populate form fields
  const firstNameInput = document.getElementById('profile-firstname');
  const lastNameInput = document.getElementById('profile-lastname');
  const emailInput = document.getElementById('profile-email');
  const orgInput = document.getElementById('profile-organization');
  const roleInput = document.getElementById('profile-role');
  const bioInput = document.getElementById('profile-bio');

  if (firstNameInput) firstNameInput.value = profileState.profileData.firstName || '';
  if (lastNameInput) lastNameInput.value = profileState.profileData.lastName || '';
  if (emailInput) emailInput.value = profileState.profileData.email || '';
  if (orgInput) orgInput.value = profileState.profileData.organization || '';
  if (roleInput) roleInput.value = profileState.profileData.role || '';
  if (bioInput) bioInput.value = profileState.profileData.bio || '';

  // Update remove button visibility
  const removeBtn = document.getElementById('remove-picture-btn');
  if (removeBtn) {
    removeBtn.style.display = profileState.profilePicture ? 'inline-flex' : 'none';
  }
}

/**
 * Handle profile picture upload
 */
function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  const errorEl = document.getElementById('profile-picture-error');

  // Clear previous error
  if (errorEl) errorEl.textContent = '';

  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    if (errorEl) errorEl.textContent = 'Please upload a JPG or PNG image.';
    event.target.value = '';
    return;
  }

  // Validate file size (1MB = 1048576 bytes)
  const maxSize = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    if (errorEl) errorEl.textContent = 'File size must be less than 1MB.';
    event.target.value = '';
    return;
  }

  // Read and convert to base64
  const reader = new FileReader();
  reader.onload = function(e) {
    profileState.profilePicture = e.target.result;

    // Update preview
    updateProfileAvatarPreview();

    // Update all avatars across the app
    updateAllAvatars();

    // Show remove button
    const removeBtn = document.getElementById('remove-picture-btn');
    if (removeBtn) removeBtn.style.display = 'inline-flex';

    // Save to localStorage
    saveProfileToLocalStorage();

    // Reinitialize icons
    lucide.createIcons();
  };
  reader.readAsDataURL(file);

  // Reset input so same file can be selected again
  event.target.value = '';
}

/**
 * Remove profile picture
 */
function removeProfilePicture() {
  profileState.profilePicture = null;

  // Update preview
  updateProfileAvatarPreview();

  // Update all avatars across the app
  updateAllAvatars();

  // Hide remove button
  const removeBtn = document.getElementById('remove-picture-btn');
  if (removeBtn) removeBtn.style.display = 'none';

  // Save to localStorage
  saveProfileToLocalStorage();

  // Reinitialize icons
  lucide.createIcons();
}

/**
 * Update profile avatar preview on profile page
 */
function updateProfileAvatarPreview() {
  const previewEl = document.getElementById('profile-avatar-preview');
  if (!previewEl) return;

  if (profileState.profilePicture) {
    previewEl.innerHTML = `<img src="${profileState.profilePicture}" alt="Profile picture">`;
  } else {
    const initials = getProfileInitials();
    previewEl.innerHTML = initials;
  }
}

/**
 * Update all avatar elements across the app
 */
function updateAllAvatars() {
  const avatars = document.querySelectorAll('.avatar');
  const initials = getProfileInitials();

  avatars.forEach(avatar => {
    if (profileState.profilePicture) {
      avatar.innerHTML = `<img src="${profileState.profilePicture}" alt="Profile picture">`;
    } else {
      avatar.innerHTML = initials;
    }
  });
}

/**
 * Get initials from profile data
 */
function getProfileInitials() {
  const { firstName, lastName, email } = profileState.profileData;

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

/**
 * Handle profile form submission
 */
function handleProfileUpdate(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('profile-submit');
  const successAlert = document.getElementById('profile-success');

  // Get form data
  profileState.profileData.firstName = document.getElementById('profile-firstname').value;
  profileState.profileData.lastName = document.getElementById('profile-lastname').value;
  profileState.profileData.organization = document.getElementById('profile-organization').value;
  profileState.profileData.role = document.getElementById('profile-role').value;
  profileState.profileData.bio = document.getElementById('profile-bio').value;

  // Show loading
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // Simulate save delay
  setTimeout(() => {
    // Save to localStorage
    saveProfileToLocalStorage();

    // Update all avatars (in case name changed)
    updateProfileAvatarPreview();
    updateAllAvatars();

    // Update user name displays
    updateUserNameDisplays();

    // Show success
    if (successAlert) {
      successAlert.classList.add('visible');
      setTimeout(() => {
        successAlert.classList.remove('visible');
      }, 3000);
    }

    // Remove loading
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    lucide.createIcons();
  }, 500);
}

/**
 * Update user name displays across the app
 */
function updateUserNameDisplays() {
  const { firstName } = profileState.profileData;
  const displayName = firstName || 'User';

  // Update user name in headers (use first name only)
  const userNames = document.querySelectorAll('.user-name');
  userNames.forEach(el => {
    el.textContent = displayName;
  });

  // Update greetings
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  const greetings = document.querySelectorAll('.hero-greeting');
  greetings.forEach(el => {
    if (!el.closest('#screen-learning') &&
        !el.closest('#screen-circles') &&
        !el.closest('#screen-progress') &&
        !el.closest('#screen-coach')) {
      el.textContent = `${greeting}, ${displayName}`;
    }
  });
}

/**
 * Save profile to localStorage
 */
function saveProfileToLocalStorage() {
  const dataToSave = {
    ...profileState.profileData,
    profilePicture: profileState.profilePicture
  };
  localStorage.setItem('deburn_profile', JSON.stringify(dataToSave));
}

/**
 * Load profile on app init
 */
function loadProfileOnInit() {
  const savedProfile = localStorage.getItem('deburn_profile');
  if (savedProfile) {
    try {
      const data = JSON.parse(savedProfile);
      profileState.profileData = { ...profileState.profileData, ...data };
      profileState.profilePicture = data.profilePicture || null;

      // Update avatars
      updateAllAvatars();

      // Update user displays
      updateUserNameDisplays();
    } catch (e) {
      console.warn('Failed to parse saved profile:', e);
    }
  }
}

// Initialize profile page when navigating to it
const originalShowScreen = window.showScreen;
window.showScreen = function(screenId) {
  originalShowScreen(screenId);
  if (screenId === 'dashboard') {
    loadTodaysFocus();
  }
  if (screenId === 'profile') {
    initializeProfilePage();
  }
  if (screenId === 'circles') {
    loadCirclesData();
  }
  if (screenId === 'admin') {
    loadAdminData();
  }
  if (screenId === 'learning') {
    loadLearningContent();
  }
};

// Make profile functions available globally
window.handleProfilePictureUpload = handleProfilePictureUpload;
window.removeProfilePicture = removeProfilePicture;
window.handleProfileUpdate = handleProfileUpdate;

// ============================================
// CIRCLES FUNCTIONALITY
// ============================================

// Circles state
const circlesState = {
  groups: [],
  currentGroup: null,
  meetings: [],
  availabilitySet: false,
  userAvailability: [],
  commonSlots: [],
  selectedSlot: null,
  pendingInvitations: [],
  acceptedInvitations: [],
};

/**
 * Load circles data when showing circles screen
 */
async function loadCirclesData() {
  try {
    // Check if user is authenticated using AuthClient (cookie-based auth)
    if (!AuthClient.isLoggedIn()) {
      // Try to verify session via API
      try {
        const session = await AuthClient.getSession();
        if (!session.success || !session.data?.user) {
          renderCirclesNotLoggedIn();
          return;
        }
      } catch (e) {
        renderCirclesNotLoggedIn();
        return;
      }
    }

    // Load groups, invitations, and availability in parallel
    const [groupsResult, invitationsResult, availabilityResult] = await Promise.all([
      loadMyGroups(),
      loadMyInvitations(),
      loadMyAvailability(),
    ]);

    circlesState.groups = groupsResult;
    circlesState.pendingInvitations = invitationsResult.pending;
    circlesState.acceptedInvitations = invitationsResult.accepted;
    circlesState.userAvailability = availabilityResult.slots || [];
    circlesState.availabilitySet = circlesState.userAvailability.length > 0;

    renderCirclesScreen();
  } catch (error) {
    console.error('Error loading circles data:', error);
    renderCirclesError('Failed to load circles data');
  }
}

/**
 * Load user's groups
 */
async function loadMyGroups() {
  try {
    const response = await fetch(apiUrl('/api/circles/my-groups'), {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return [];
      }
      throw new Error('Failed to load groups');
    }

    const data = await response.json();
    return data.success ? data.data.groups : [];
  } catch (error) {
    console.error('Error loading groups:', error);
    return [];
  }
}

/**
 * Load user's invitations (pending and accepted)
 */
async function loadMyInvitations() {
  try {
    const response = await fetch(apiUrl('/api/circles/my-invitations'), {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { pending: [], accepted: [] };
      }
      throw new Error('Failed to load invitations');
    }

    const data = await response.json();
    const invitations = data.success ? data.data.invitations : [];
    return {
      pending: invitations.filter(inv => inv.status === 'pending'),
      accepted: invitations.filter(inv => inv.status === 'accepted'),
    };
  } catch (error) {
    console.error('Error loading invitations:', error);
    return { pending: [], accepted: [] };
  }
}

/**
 * Load user's availability
 */
async function loadMyAvailability() {
  try {
    const response = await fetch(apiUrl('/api/circles/availability'), {
      credentials: 'include',
    });

    if (!response.ok) {
      return { slots: [] };
    }

    const data = await response.json();
    return data.success ? data.data.availability : { slots: [] };
  } catch (error) {
    console.error('Error loading availability:', error);
    return { slots: [] };
  }
}

/**
 * Save user's availability
 */
async function saveAvailability(slots) {
  try {
    const response = await fetch(apiUrl('/api/circles/availability'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ slots }),
    });

    if (!response.ok) {
      throw new Error('Failed to save availability');
    }

    const data = await response.json();
    circlesState.userAvailability = data.data.availability.slots;
    circlesState.availabilitySet = circlesState.userAvailability.length > 0;

    showToast('Availability saved!');
    return data.data.availability;
  } catch (error) {
    console.error('Error saving availability:', error);
    alert('Failed to save availability');
    throw error;
  }
}

/**
 * Load common availability for a group
 */
async function loadCommonAvailability(groupId) {
  try {
    const response = await fetch(apiUrl(`/api/circles/groups/${groupId}/common-availability`), {
      credentials: 'include',
    });

    if (!response.ok) {
      return { commonSlots: [], allMembersSet: false };
    }

    const data = await response.json();
    return data.success ? data.data : { commonSlots: [], allMembersSet: false };
  } catch (error) {
    console.error('Error loading common availability:', error);
    return { commonSlots: [], allMembersSet: false };
  }
}

/**
 * Show availability picker modal
 */
function showAvailabilityPicker() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = [];
  for (let h = 8; h <= 20; h++) {
    hours.push(h);
  }

  // Create a set of current selections for easy lookup
  const selectedSet = new Set(
    circlesState.userAvailability.map(s => `${s.day}-${s.hour}`)
  );

  const modal = document.createElement('div');
  modal.className = 'circles-modal';
  modal.id = 'availability-modal';
  modal.innerHTML = `
    <div class="circles-modal-backdrop" onclick="closeAvailabilityModal()"></div>
    <div class="circles-modal-content availability-modal-content">
      <div class="circles-modal-header">
        <h2>Set Your Availability</h2>
        <button class="circles-modal-close" onclick="closeAvailabilityModal()">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="circles-modal-body">
        <p class="availability-instructions">Click on time slots when you're available for circle meetings. Click again to deselect.</p>
        <div class="availability-grid">
          <div class="availability-header">
            <div class="availability-time-label"></div>
            ${days.map((day, i) => `<div class="availability-day-header">${day}</div>`).join('')}
          </div>
          <div class="availability-body">
            ${hours.map(hour => `
              <div class="availability-row">
                <div class="availability-time-label">${formatHour(hour)}</div>
                ${days.map((day, dayIndex) => {
                  const isSelected = selectedSet.has(`${dayIndex}-${hour}`);
                  return `<div class="availability-cell ${isSelected ? 'selected' : ''}"
                              data-day="${dayIndex}"
                              data-hour="${hour}"
                              onclick="toggleAvailabilitySlot(this, ${dayIndex}, ${hour})"></div>`;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="circles-modal-footer">
        <button class="btn btn-ghost" onclick="closeAvailabilityModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveAvailabilityFromModal()">
          <i data-lucide="check"></i>
          Save Availability
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  lucide.createIcons();
}

/**
 * Format hour for display
 */
function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Toggle availability slot
 */
function toggleAvailabilitySlot(cell, day, hour) {
  cell.classList.toggle('selected');
}

/**
 * Save availability from modal
 */
async function saveAvailabilityFromModal() {
  const cells = document.querySelectorAll('#availability-modal .availability-cell.selected');
  const slots = Array.from(cells).map(cell => ({
    day: parseInt(cell.dataset.day),
    hour: parseInt(cell.dataset.hour),
  }));

  try {
    await saveAvailability(slots);
    closeAvailabilityModal();
    renderCirclesScreen();
  } catch (error) {
    // Error already handled in saveAvailability
  }
}

/**
 * Close availability modal
 */
function closeAvailabilityModal() {
  const modal = document.getElementById('availability-modal');
  if (modal) {
    modal.remove();
  }
}

// Legacy function for compatibility - now does nothing
async function connectGoogleCalendar() {
  showAvailabilityPicker();
}

// Legacy function stubs for compatibility
async function checkCalendarStatus() {
  return { connected: false };
}

async function disconnectCalendar() {
  // No longer needed - using manual availability
}

/**
 * Load group details
 */
async function loadGroupDetails(groupId) {
  try {
    const response = await fetch(apiUrl(`/api/circles/groups/${groupId}`), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to load group');
    }

    const data = await response.json();
    return data.success ? data.data.group : null;
  } catch (error) {
    console.error('Error loading group:', error);
    return null;
  }
}

/**
 * Load group meetings
 */
async function loadGroupMeetings(groupId) {
  try {
    const response = await fetch(apiUrl(`/api/circles/groups/${groupId}/meetings`), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to load meetings');
    }

    const data = await response.json();
    return data.success ? data.data.meetings : [];
  } catch (error) {
    console.error('Error loading meetings:', error);
    return [];
  }
}

/**
 * Load available time slots for a group
 */
async function loadAvailability(groupId) {
  try {
    const response = await fetch(apiUrl(`/api/circles/groups/${groupId}/availability`), {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to load availability');
    }

    const data = await response.json();
    return data.success ? data.data : { slots: [], allConnected: false };
  } catch (error) {
    console.error('Error loading availability:', error);
    throw error;
  }
}

/**
 * Schedule a meeting
 */
async function scheduleMeeting(groupId, slotData) {
  try {
    const response = await fetch(apiUrl(`/api/circles/groups/${groupId}/meetings`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(slotData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to schedule meeting');
    }

    const data = await response.json();
    return data.success ? data.data.meeting : null;
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    throw error;
  }
}

/**
 * Cancel a meeting
 */
async function cancelMeeting(meetingId, reason = '') {
  try {
    const response = await fetch(apiUrl(`/api/circles/meetings/${meetingId}/cancel`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel meeting');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    return false;
  }
}

/**
 * Update meeting attendance
 */
async function updateAttendance(meetingId, status) {
  try {
    const response = await fetch(apiUrl(`/api/circles/meetings/${meetingId}/attendance`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update attendance');
    }

    return true;
  } catch (error) {
    console.error('Error updating attendance:', error);
    return false;
  }
}

/**
 * Load invitation details
 */
async function loadInvitationDetails(token) {
  try {
    const response = await fetch(apiUrl(`/api/circles/invitations/${token}`));

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Invalid invitation');
    }

    const data = await response.json();
    return data.success ? data.data.invitation : null;
  } catch (error) {
    console.error('Error loading invitation:', error);
    throw error;
  }
}

/**
 * Accept invitation
 */
async function acceptInvitation(token) {
  try {
    const response = await fetch(apiUrl(`/api/circles/invitations/${token}/accept`), {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to accept invitation');
    }

    return data;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Decline invitation
 */
async function declineInvitation(token) {
  try {
    const response = await fetch(apiUrl(`/api/circles/invitations/${token}/decline`), {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to decline invitation');
    }

    return true;
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw error;
  }
}

// ============================================
// CIRCLES UI RENDERING
// ============================================

/**
 * Render the main circles screen
 */
function renderCirclesScreen() {
  const contentArea = document.querySelector('#screen-circles .content-area');
  if (!contentArea) return;

  const hasGroups = circlesState.groups.length > 0;

  if (!hasGroups) {
    renderCirclesNoGroups(contentArea);
    return;
  }

  // Render with groups
  contentArea.innerHTML = `
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-image-container">
        <img src="/images/hero-circles.jpg" alt="Abstract circles representing community" class="hero-image">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-greeting">Leadership Circles</h1>
        <p class="hero-tagline">Connect with peers who understand</p>
      </div>
    </div>

    <!-- Calendar Connection Banner -->
    ${renderAvailabilityBanner()}

    <!-- Your Groups -->
    <section class="section">
      <h2 class="section-title">Your Circles</h2>
      <div class="circles-groups-list">
        ${circlesState.groups.map(group => renderGroupCard(group)).join('')}
      </div>
    </section>
  `;

  lucide.createIcons();
}

/**
 * Render calendar connection banner
 */
function renderAvailabilityBanner() {
  const slotCount = circlesState.userAvailability.length;

  if (slotCount > 0) {
    return `
      <div class="calendar-connection-banner availability-set">
        <div class="calendar-banner-icon">
          <i data-lucide="check-circle"></i>
        </div>
        <div class="calendar-banner-content">
          <h3>Availability Set</h3>
          <p>You've marked ${slotCount} time slot${slotCount !== 1 ? 's' : ''} as available.</p>
        </div>
        <button class="btn btn-ghost" onclick="showAvailabilityPicker()">
          <i data-lucide="edit"></i>
          Edit
        </button>
      </div>
    `;
  }

  return `
    <div class="calendar-connection-banner">
      <div class="calendar-banner-icon">
        <i data-lucide="calendar"></i>
      </div>
      <div class="calendar-banner-content">
        <h3>Set Your Availability</h3>
        <p>Mark when you're free to meet with your circle. This helps find times that work for everyone.</p>
      </div>
      <button class="btn btn-primary" onclick="showAvailabilityPicker()">
        <i data-lucide="clock"></i>
        Set Availability
      </button>
    </div>
  `;
}

// Keep old name for compatibility
function renderCalendarBanner() {
  return renderAvailabilityBanner();
}

/**
 * Render group card
 */
function renderGroupCard(group) {
  const nextMeeting = group.nextMeeting;
  const memberCount = group.members?.length || 0;

  return `
    <div class="circle-card" data-group-id="${group.id || group._id}">
      <div class="circle-header">
        <div class="circle-info">
          <h3 class="circle-name">${escapeHtml(group.name)}</h3>
          <p class="circle-meta">${memberCount} members${group.pool?.cadence ? ` · Meets ${group.pool.cadence}` : ''}</p>
        </div>
        ${nextMeeting ? `
          <div class="circle-next-meeting">
            <i data-lucide="calendar"></i>
            <div>
              <span class="next-label">Next meeting</span>
              <span class="next-date">${formatMeetingDate(nextMeeting.scheduledAt)}</span>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="circle-members">
        <div class="member-avatars">
          ${(group.members || []).slice(0, 6).map((member, i) => {
            const initials = getInitials(member.profile?.firstName, member.profile?.lastName, member.email);
            const colors = ['var(--color-deep-forest)', 'var(--color-sage)', 'var(--color-ember)', 'var(--color-sky)', 'var(--color-dawn)', 'var(--neutral-500)'];
            return `<div class="member-avatar" style="background: ${colors[i % colors.length]}" title="${escapeHtml(member.profile?.firstName || member.email)}">${initials}</div>`;
          }).join('')}
        </div>
      </div>
      ${group.pool?.topic ? `
        <div class="circle-topic">
          <div class="topic-label">Discussion topic</div>
          <div class="topic-title">${escapeHtml(group.pool.topic)}</div>
        </div>
      ` : ''}
      <div class="circle-actions">
        ${nextMeeting && nextMeeting.meetingLink ? `
          <a href="${nextMeeting.meetingLink}" target="_blank" class="btn btn-primary">
            <i data-lucide="video"></i>
            Join Video Call
          </a>
        ` : `
          <button class="btn btn-primary" onclick="showScheduleMeeting('${group.id || group._id}')">
            <i data-lucide="calendar-plus"></i>
            Schedule Meeting
          </button>
        `}
        <button class="btn btn-ghost" onclick="showGroupDetails('${group.id || group._id}')">
          View Details
        </button>
      </div>
    </div>
  `;
}

/**
 * Render no groups state
 */
function renderCirclesNoGroups(contentArea) {
  const hasPendingInvitations = circlesState.pendingInvitations.length > 0;
  const hasAcceptedInvitations = circlesState.acceptedInvitations.length > 0;

  contentArea.innerHTML = `
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-image-container">
        <img src="/images/hero-circles.jpg" alt="Abstract circles representing community" class="hero-image">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-greeting">Leadership Circles</h1>
        <p class="hero-tagline">Connect with peers who understand</p>
      </div>
    </div>

    ${hasPendingInvitations ? `
    <!-- Pending Invitations -->
    <section class="section">
      <h2 class="section-title">Pending Invitations</h2>
      <div class="invitations-list">
        ${circlesState.pendingInvitations.map(inv => `
          <div class="invitation-card">
            <div class="invitation-info">
              <div class="invitation-icon">
                <i data-lucide="mail"></i>
              </div>
              <div class="invitation-details">
                <h3>${inv.poolName || 'Leadership Circle'}</h3>
                <p>You've been invited to join a leadership circle</p>
                <span class="invitation-expires">Expires: ${new Date(inv.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div class="invitation-actions">
              <button class="btn btn-primary" onclick="handleAcceptInvitation('${inv.token}')">
                <i data-lucide="check"></i>
                Accept
              </button>
              <button class="btn btn-ghost" onclick="handleDeclineInvitation('${inv.token}')">
                Decline
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : hasAcceptedInvitations ? `
    <!-- Waiting for Group Assignment -->
    <section class="section">
      <div class="circles-waiting-state">
        <div class="waiting-state-icon">
          <i data-lucide="clock"></i>
        </div>
        <h2>Waiting for group assignment</h2>
        <p>You've accepted your invitation! Your organization admin will assign you to a circle group soon. You'll be notified when your group is ready.</p>
        <div class="waiting-state-info">
          <i data-lucide="check-circle"></i>
          <span>Invitation accepted for: ${circlesState.acceptedInvitations[0]?.poolName || 'Leadership Circle'}</span>
        </div>
      </div>
    </section>
    ` : `
    <!-- No Groups State -->
    <section class="section">
      <div class="circles-empty-state">
        <div class="empty-state-icon">
          <i data-lucide="users"></i>
        </div>
        <h2>No circles yet</h2>
        <p>You haven't been assigned to any leadership circles yet. When your organization admin creates a circle and assigns groups, you'll see your circle here.</p>
        <div class="empty-state-hint">
          <i data-lucide="mail"></i>
          <span>Check your email for circle invitations</span>
        </div>
      </div>
    </section>
    `}
  `;

  lucide.createIcons();
}

/**
 * Render not logged in state
 */
function renderCirclesNotLoggedIn() {
  const contentArea = document.querySelector('#screen-circles .content-area');
  if (!contentArea) return;

  contentArea.innerHTML = `
    <div class="hero-section">
      <div class="hero-image-container">
        <img src="/images/hero-circles.jpg" alt="Abstract circles representing community" class="hero-image">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-greeting">Leadership Circles</h1>
        <p class="hero-tagline">Connect with peers who understand</p>
      </div>
    </div>

    <section class="section">
      <div class="circles-empty-state">
        <div class="empty-state-icon">
          <i data-lucide="log-in"></i>
        </div>
        <h2>Sign in to view your circles</h2>
        <p>Log in to see your leadership circles and connect with your peers.</p>
        <button class="btn btn-primary" onclick="showScreen('login')">
          Sign In
        </button>
      </div>
    </section>
  `;

  lucide.createIcons();
}

/**
 * Render error state
 */
function renderCirclesError(message) {
  const contentArea = document.querySelector('#screen-circles .content-area');
  if (!contentArea) return;

  contentArea.innerHTML = `
    <div class="hero-section">
      <div class="hero-image-container">
        <img src="/images/hero-circles.jpg" alt="Abstract circles representing community" class="hero-image">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-greeting">Leadership Circles</h1>
        <p class="hero-tagline">Connect with peers who understand</p>
      </div>
    </div>

    <section class="section">
      <div class="circles-empty-state">
        <div class="empty-state-icon error">
          <i data-lucide="alert-circle"></i>
        </div>
        <h2>Something went wrong</h2>
        <p>${escapeHtml(message)}</p>
        <button class="btn btn-primary" onclick="loadCirclesData()">
          Try Again
        </button>
      </div>
    </section>
  `;

  lucide.createIcons();
}

/**
 * Show group details modal/view
 */
async function showGroupDetails(groupId) {
  try {
    const [group, meetings] = await Promise.all([
      loadGroupDetails(groupId),
      loadGroupMeetings(groupId),
    ]);

    if (!group) {
      alert('Failed to load group details');
      return;
    }

    circlesState.currentGroup = group;
    circlesState.meetings = meetings;

    renderGroupDetailsModal(group, meetings);
  } catch (error) {
    console.error('Error showing group details:', error);
    alert('Failed to load group details');
  }
}

/**
 * Render group details modal
 */
function renderGroupDetailsModal(group, meetings) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.circles-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'circles-modal';
  modal.innerHTML = `
    <div class="circles-modal-backdrop" onclick="closeCirclesModal()"></div>
    <div class="circles-modal-content">
      <div class="circles-modal-header">
        <h2>${escapeHtml(group.name)}</h2>
        <button class="circles-modal-close" onclick="closeCirclesModal()">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="circles-modal-body">
        <!-- Members Section -->
        <div class="group-detail-section">
          <h3>Members</h3>
          <div class="group-members-list">
            ${(group.members || []).map(member => `
              <div class="group-member-item">
                <div class="member-avatar" style="background: var(--color-sage)">
                  ${getInitials(member.profile?.firstName, member.profile?.lastName, member.email)}
                </div>
                <div class="member-info">
                  <span class="member-name">${escapeHtml(member.profile?.firstName || '')} ${escapeHtml(member.profile?.lastName || '')}</span>
                  <span class="member-email">${escapeHtml(member.email)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Meetings Section -->
        <div class="group-detail-section">
          <h3>Meetings</h3>
          ${meetings.length > 0 ? `
            <div class="meetings-list">
              ${meetings.map(meeting => renderMeetingItem(meeting)).join('')}
            </div>
          ` : `
            <p class="no-meetings">No meetings scheduled yet.</p>
          `}
          <button class="btn btn-primary" onclick="showScheduleMeeting('${group.id || group._id}'); closeCirclesModal();">
            <i data-lucide="calendar-plus"></i>
            Schedule Meeting
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  lucide.createIcons();
}

/**
 * Render a meeting item
 */
function renderMeetingItem(meeting) {
  const isPast = new Date(meeting.scheduledAt) < new Date();
  const statusClass = meeting.status === 'cancelled' ? 'cancelled' : (isPast ? 'past' : 'upcoming');

  return `
    <div class="meeting-item ${statusClass}">
      <div class="meeting-date">
        <i data-lucide="calendar"></i>
        <span>${formatMeetingDate(meeting.scheduledAt)}</span>
      </div>
      <div class="meeting-title">${escapeHtml(meeting.title)}</div>
      ${meeting.topic ? `<div class="meeting-topic">${escapeHtml(meeting.topic)}</div>` : ''}
      <div class="meeting-actions">
        ${meeting.meetingLink && !isPast && meeting.status !== 'cancelled' ? `
          <a href="${meeting.meetingLink}" target="_blank" class="btn btn-sm btn-primary">
            <i data-lucide="video"></i>
            Join
          </a>
        ` : ''}
        ${!isPast && meeting.status !== 'cancelled' ? `
          <button class="btn btn-sm btn-ghost" onclick="handleCancelMeeting('${meeting.id || meeting._id}')">
            Cancel
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Close circles modal
 */
function closeCirclesModal() {
  const modal = document.querySelector('.circles-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Show schedule meeting modal
 */
async function showScheduleMeeting(groupId) {
  try {
    // Check if user has set their availability
    if (!circlesState.availabilitySet) {
      if (confirm('You need to set your availability first. Set it now?')) {
        showAvailabilityPicker();
      }
      return;
    }

    // Show loading state
    showScheduleModal(groupId, { loading: true });

    // Load common availability for the group
    const availability = await loadCommonAvailability(groupId);

    if (!availability.allMembersSet) {
      showScheduleModal(groupId, {
        notAllConnected: true,
        connectedCount: availability.membersWithAvailability || 0,
        totalMembers: availability.totalMembers || 0,
      });
      return;
    }

    circlesState.commonSlots = availability.commonSlots || [];
    showScheduleModal(groupId, { slots: circlesState.commonSlots });
  } catch (error) {
    console.error('Error loading availability:', error);
    showScheduleModal(groupId, { error: error.message });
  }
}

/**
 * Show the schedule meeting modal
 */
function showScheduleModal(groupId, options = {}) {
  // Remove existing modal
  const existingModal = document.querySelector('.circles-modal');
  if (existingModal) {
    existingModal.remove();
  }

  let bodyContent = '';

  if (options.loading) {
    bodyContent = `
      <div class="schedule-loading">
        <div class="loading-spinner"></div>
        <p>Finding available times...</p>
      </div>
    `;
  } else if (options.error) {
    bodyContent = `
      <div class="schedule-error">
        <i data-lucide="alert-circle"></i>
        <p>${escapeHtml(options.error)}</p>
        <button class="btn btn-primary" onclick="showScheduleMeeting('${groupId}')">Try Again</button>
      </div>
    `;
  } else if (options.notAllConnected) {
    bodyContent = `
      <div class="schedule-not-connected">
        <i data-lucide="calendar-x"></i>
        <h3>Waiting for availability</h3>
        <p>Only ${options.connectedCount} of ${options.totalMembers} members have set their availability. Ask your group members to set their availability so we can find a time that works for everyone.</p>
        <button class="btn btn-ghost" onclick="closeCirclesModal()">Close</button>
      </div>
    `;
  } else if (options.slots && options.slots.length === 0) {
    bodyContent = `
      <div class="schedule-no-slots">
        <i data-lucide="calendar-x"></i>
        <h3>No common availability</h3>
        <p>We couldn't find any times that work for all members in the next 2 weeks. Try checking back later or coordinate directly with your group.</p>
        <button class="btn btn-ghost" onclick="closeCirclesModal()">Close</button>
      </div>
    `;
  } else if (options.slots) {
    bodyContent = `
      <div class="schedule-slots">
        <p class="slots-intro">Select a time that works for your group:</p>
        <div class="time-slots-list">
          ${options.slots.map((slot, index) => `
            <div class="time-slot-option ${circlesState.selectedSlot === index ? 'selected' : ''}"
                 onclick="selectTimeSlot(${index})">
              <div class="slot-date">
                <i data-lucide="calendar"></i>
                ${formatSlotDate(slot.start)}
              </div>
              <div class="slot-time">
                <i data-lucide="clock"></i>
                ${formatSlotTime(slot.start)} - ${formatSlotTime(slot.end)}
              </div>
              <div class="slot-duration">${slot.duration} min</div>
            </div>
          `).join('')}
        </div>
        <div class="schedule-form">
          <div class="form-group">
            <label for="meeting-title">Meeting Title</label>
            <input type="text" id="meeting-title" placeholder="Weekly Circle Discussion" value="Circle Discussion">
          </div>
          <div class="form-group">
            <label for="meeting-topic">Discussion Topic (optional)</label>
            <input type="text" id="meeting-topic" placeholder="e.g., Managing through change">
          </div>
        </div>
        <div class="schedule-actions">
          <button class="btn btn-ghost" onclick="closeCirclesModal()">Cancel</button>
          <button class="btn btn-primary" onclick="confirmScheduleMeeting('${groupId}')" id="confirm-schedule-btn" disabled>
            <i data-lucide="calendar-check"></i>
            Schedule Meeting
          </button>
        </div>
      </div>
    `;
  }

  const modal = document.createElement('div');
  modal.className = 'circles-modal';
  modal.innerHTML = `
    <div class="circles-modal-backdrop" onclick="closeCirclesModal()"></div>
    <div class="circles-modal-content">
      <div class="circles-modal-header">
        <h2>Schedule Meeting</h2>
        <button class="circles-modal-close" onclick="closeCirclesModal()">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="circles-modal-body">
        ${bodyContent}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  lucide.createIcons();
}

/**
 * Select a time slot
 */
function selectTimeSlot(index) {
  circlesState.selectedSlot = index;

  // Update UI
  document.querySelectorAll('.time-slot-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });

  // Enable confirm button
  const confirmBtn = document.getElementById('confirm-schedule-btn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
  }
}

/**
 * Confirm and schedule the meeting
 */
async function confirmScheduleMeeting(groupId) {
  if (circlesState.selectedSlot === null) {
    alert('Please select a time slot');
    return;
  }

  const slot = circlesState.availableSlots[circlesState.selectedSlot];
  const title = document.getElementById('meeting-title')?.value || 'Circle Discussion';
  const topic = document.getElementById('meeting-topic')?.value || '';

  try {
    const confirmBtn = document.getElementById('confirm-schedule-btn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<div class="loading-spinner-sm"></div> Scheduling...';
    }

    const meeting = await scheduleMeeting(groupId, {
      title,
      topic,
      scheduledAt: slot.start,
      duration: slot.duration,
    });

    closeCirclesModal();

    // Reload circles data to show updated meeting
    await loadCirclesData();

    // Show success message
    showToast('Meeting scheduled successfully! Calendar invites have been sent.');
  } catch (error) {
    alert('Failed to schedule meeting: ' + error.message);
    const confirmBtn = document.getElementById('confirm-schedule-btn');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<i data-lucide="calendar-check"></i> Schedule Meeting';
      lucide.createIcons();
    }
  }
}

/**
 * Handle cancel meeting
 */
async function handleCancelMeeting(meetingId) {
  if (!confirm('Are you sure you want to cancel this meeting? All members will be notified.')) {
    return;
  }

  const reason = prompt('Reason for cancellation (optional):') || '';

  try {
    await cancelMeeting(meetingId, reason);
    closeCirclesModal();
    await loadCirclesData();
    showToast('Meeting cancelled successfully.');
  } catch (error) {
    alert('Failed to cancel meeting');
  }
}

/**
 * Show a toast notification
 */
function showToast(message) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <i data-lucide="check-circle"></i>
    <span>${escapeHtml(message)}</span>
  `;
  document.body.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// CIRCLE INVITATION PAGE
// ============================================

/**
 * Handle circle invitation URL
 */
async function handleCircleInvitation(token) {
  const contentArea = document.querySelector('#screen-circles .content-area');
  if (!contentArea) return;

  try {
    // Show loading
    contentArea.innerHTML = `
      <div class="invitation-loading">
        <div class="loading-spinner"></div>
        <p>Loading invitation...</p>
      </div>
    `;

    const invitation = await loadInvitationDetails(token);
    renderInvitationPage(contentArea, invitation, token);
  } catch (error) {
    renderInvitationError(contentArea, error.message);
  }
}

/**
 * Render invitation page
 */
function renderInvitationPage(contentArea, invitation, token) {
  const isLoggedIn = AuthClient.isLoggedIn();

  contentArea.innerHTML = `
    <div class="invitation-page">
      <div class="invitation-card">
        <div class="invitation-header">
          <i data-lucide="users"></i>
          <h1>You're Invited!</h1>
        </div>
        <div class="invitation-body">
          <h2>${escapeHtml(invitation.pool?.name || 'Leadership Circle')}</h2>
          ${invitation.pool?.topic ? `<p class="invitation-topic">${escapeHtml(invitation.pool.topic)}</p>` : ''}
          <p class="invitation-description">Join a small group of peers for meaningful discussions about leadership, growth, and development.</p>

          <div class="invitation-details">
            <div class="detail-item">
              <i data-lucide="users"></i>
              <span>Groups of ${invitation.pool?.targetGroupSize || 4} people</span>
            </div>
            <div class="detail-item">
              <i data-lucide="calendar"></i>
              <span>Meets ${invitation.pool?.cadence || 'regularly'}</span>
            </div>
          </div>

          ${invitation.status === 'pending' ? `
            <div class="invitation-actions">
              ${isLoggedIn ? `
                <button class="btn btn-primary btn-lg" onclick="handleAcceptInvitation('${token}')">
                  <i data-lucide="check"></i>
                  Accept Invitation
                </button>
                <button class="btn btn-ghost" onclick="handleDeclineInvitation('${token}')">
                  Decline
                </button>
              ` : `
                <p class="login-prompt">Sign in or create an account to accept this invitation.</p>
                <button class="btn btn-primary btn-lg" onclick="redirectToLoginWithInvite('${token}')">
                  Sign In to Accept
                </button>
                <button class="btn btn-ghost" onclick="redirectToRegisterWithInvite('${token}')">
                  Create Account
                </button>
              `}
            </div>
          ` : invitation.status === 'accepted' ? `
            <div class="invitation-status accepted">
              <i data-lucide="check-circle"></i>
              <span>You've already accepted this invitation</span>
            </div>
            <button class="btn btn-primary" onclick="showScreen('circles')">
              Go to Circles
            </button>
          ` : `
            <div class="invitation-status ${invitation.status}">
              <i data-lucide="x-circle"></i>
              <span>This invitation has been ${invitation.status}</span>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

/**
 * Render invitation error
 */
function renderInvitationError(contentArea, message) {
  contentArea.innerHTML = `
    <div class="invitation-page">
      <div class="invitation-card error">
        <div class="invitation-header">
          <i data-lucide="alert-circle"></i>
          <h1>Invalid Invitation</h1>
        </div>
        <div class="invitation-body">
          <p>${escapeHtml(message)}</p>
          <button class="btn btn-primary" onclick="showScreen('dashboard')">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

/**
 * Handle accept invitation
 */
async function handleAcceptInvitation(token) {
  try {
    const result = await acceptInvitation(token);
    showToast('Invitation accepted! You\'ll be notified when groups are assigned.');

    // Redirect to circles
    setTimeout(() => {
      showScreen('circles');
    }, 1500);
  } catch (error) {
    alert('Failed to accept invitation: ' + error.message);
  }
}

/**
 * Handle decline invitation
 */
async function handleDeclineInvitation(token) {
  if (!confirm('Are you sure you want to decline this invitation?')) {
    return;
  }

  try {
    await declineInvitation(token);
    showToast('Invitation declined.');
    showScreen('dashboard');
  } catch (error) {
    alert('Failed to decline invitation: ' + error.message);
  }
}

/**
 * Redirect to login with invitation token
 */
function redirectToLoginWithInvite(token) {
  localStorage.setItem('pendingInviteToken', token);
  showScreen('login');
}

/**
 * Redirect to register with invitation token
 */
function redirectToRegisterWithInvite(token) {
  localStorage.setItem('pendingInviteToken', token);
  showScreen('register');
}

// ============================================
// CIRCLES HELPER FUNCTIONS
// ============================================

/**
 * Get initials from name or email
 */
function getInitials(firstName, lastName, email) {
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }
  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return '??';
}

/**
 * Format meeting date
 */
function formatMeetingDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format slot date
 */
function formatSlotDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format slot time
 */
function formatSlotTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// URL ROUTING FOR INVITATIONS
// ============================================

// Check for invitation URL on page load
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const inviteMatch = path.match(/^\/circles\/invite\/([a-zA-Z0-9]+)$/);

  if (inviteMatch) {
    const token = inviteMatch[1];
    // Show circles screen and handle invitation
    showScreen('circles');
    setTimeout(() => {
      handleCircleInvitation(token);
    }, 100);
  }
});

// Check for pending invite after login
const originalInitializeAuth = window.initializeAuth;
if (originalInitializeAuth) {
  window.initializeAuth = async function() {
    await originalInitializeAuth();

    // Check for pending invite
    const pendingToken = localStorage.getItem('pendingInviteToken');
    if (pendingToken && AuthClient.isLoggedIn()) {
      localStorage.removeItem('pendingInviteToken');
      showScreen('circles');
      setTimeout(() => {
        handleCircleInvitation(pendingToken);
      }, 100);
    }
  };
}

// Make circles functions globally available
window.loadCirclesData = loadCirclesData;
window.connectGoogleCalendar = connectGoogleCalendar;
window.disconnectCalendar = disconnectCalendar;
window.showGroupDetails = showGroupDetails;
window.showScheduleMeeting = showScheduleMeeting;
window.selectTimeSlot = selectTimeSlot;
window.confirmScheduleMeeting = confirmScheduleMeeting;
window.handleCancelMeeting = handleCancelMeeting;
window.closeCirclesModal = closeCirclesModal;
window.handleAcceptInvitation = handleAcceptInvitation;
window.handleDeclineInvitation = handleDeclineInvitation;
window.redirectToLoginWithInvite = redirectToLoginWithInvite;
window.redirectToRegisterWithInvite = redirectToRegisterWithInvite;
window.showAvailabilityPicker = showAvailabilityPicker;
window.toggleAvailabilitySlot = toggleAvailabilitySlot;
window.saveAvailabilityFromModal = saveAvailabilityFromModal;
window.closeAvailabilityModal = closeAvailabilityModal;

// =============================================================================
// Audio Player
// =============================================================================

// Audio player state
let audioElement = null;
let isAudioPlaying = false;

// Learning content loaded from content library API
let learningContentItems = {};
let learningContentLoaded = false;

// Category display configuration
const categoryConfig = {
  featured: { icon: 'star', titleKey: 'learning.categories.featured', defaultTitle: 'Featured' },
  leadership: { icon: 'briefcase', titleKey: 'learning.categories.leadership', defaultTitle: 'Leadership' },
  burnout: { icon: 'heart', titleKey: 'learning.categories.burnout', defaultTitle: 'Burnout Prevention' },
  breath: { icon: 'wind', titleKey: 'learning.categories.breathTechniques', defaultTitle: 'Breath Techniques' },
  meditation: { icon: 'brain', titleKey: 'learning.categories.meditation', defaultTitle: 'Meditation' },
  wellbeing: { icon: 'smile', titleKey: 'learning.categories.wellbeing', defaultTitle: 'Wellbeing' },
  other: { icon: 'folder', titleKey: 'learning.categories.other', defaultTitle: 'Other' },
};

/**
 * Load and render learning content from the content library API
 */
async function loadLearningContent() {
  const container = document.getElementById('learning-content-container');
  if (!container) return;

  // Show inline loading spinner
  showSpinner(container, 'Loading learning content...');

  try {
    const response = await fetch(apiUrl('/api/learning/content'), {
      credentials: 'include',
    });

    if (!response.ok) {
      container.innerHTML = '<div class="learning-empty"><p>Unable to load learning content</p></div>';
      return;
    }

    const data = await response.json();
    if (!data.success || !data.data?.items || data.data.items.length === 0) {
      container.innerHTML = '<div class="learning-empty"><p>No learning content available</p></div>';
      return;
    }

    // Store items for audio player lookup
    data.data.items.forEach(item => {
      learningContentItems[item.id] = item;
    });
    learningContentLoaded = true;

    // Group by category
    const byCategory = {};
    data.data.items.forEach(item => {
      const cat = item.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    // Sort items within each category by sortOrder
    Object.keys(byCategory).forEach(cat => {
      byCategory[cat].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    });

    // Render categories in preferred order
    const categoryOrder = ['featured', 'leadership', 'burnout', 'breath', 'meditation', 'wellbeing', 'other'];
    const lang = document.documentElement.lang || 'en';

    let html = '';
    categoryOrder.forEach(cat => {
      if (!byCategory[cat] || byCategory[cat].length === 0) return;

      const config = categoryConfig[cat] || categoryConfig.other;
      const categoryTitle = config.defaultTitle;

      html += `
        <section class="section learning-category">
          <h2 class="section-title" data-i18n="${config.titleKey}">${categoryTitle}</h2>
          <div class="learning-grid">
      `;

      byCategory[cat].forEach(item => {
        const title = lang === 'sv' ? (item.titleSv || item.titleEn) : item.titleEn;
        const icon = getContentIcon(item);
        const isPlayable = item.contentType === 'audio_article' || item.contentType === 'audio_exercise';
        const hasTextContent = item.textContentEn || item.textContentSv;

        let clickHandler = '';
        let cardClass = 'learning-card';

        if (isPlayable) {
          clickHandler = `onclick="openAudioPlayer('${item.id}')"`;
          cardClass = 'learning-card learning-card-playable';
        } else if (hasTextContent) {
          // Store item data for text content modal
          const itemDataId = `content-item-${item.id || item._id}`;
          window._contentItems = window._contentItems || {};
          window._contentItems[itemDataId] = item;
          clickHandler = `onclick="openTextContentModal(window._contentItems['${itemDataId}'])"`;
          cardClass = 'learning-card learning-card-readable';
        } else {
          // No content - gray out
          cardClass = 'learning-card learning-card-disabled';
        }

        html += `
          <div class="${cardClass}" ${clickHandler}>
            <div class="learning-card-icon"><i data-lucide="${icon}"></i></div>
            <h4 class="learning-card-title">${escapeHtml(title)}</h4>
          </div>
        `;
      });

      html += `
          </div>
        </section>
      `;
    });

    container.innerHTML = html;

    // Re-initialize icons
    lucide.createIcons();

    // Re-apply translations if i18n is available
    if (window.I18nClient?.applyTranslations) {
      I18nClient.applyTranslations();
    }
  } catch (error) {
    console.warn('Failed to load learning content:', error);
    container.innerHTML = '<div class="learning-empty"><p>Failed to load learning content</p></div>';
  }
}

// Today's Focus state
let todaysFocusItem = null;

/**
 * Load random learning content for Today's Focus card on dashboard
 * Uses daily seed so the same content shows for the entire day
 */
async function loadTodaysFocus() {
  const titleEl = document.querySelector('.todays-focus-title');
  const durationEl = document.querySelector('.todays-focus-duration');
  const progressEl = document.querySelector('.todays-focus-progress');
  const btnEl = document.querySelector('.todays-focus-btn');

  if (!titleEl) return;

  try {
    // Check if content is already loaded
    let items = Object.values(learningContentItems);

    // If not loaded, fetch from API
    if (items.length === 0) {
      const response = await fetch(apiUrl('/api/learning/content'), {
        credentials: 'include',
      });

      if (!response.ok) {
        titleEl.textContent = 'Content unavailable';
        return;
      }

      const data = await response.json();
      if (!data.success || !data.data?.items || data.data.items.length === 0) {
        titleEl.textContent = 'No content available';
        return;
      }

      // Store items for later use
      data.data.items.forEach(item => {
        learningContentItems[item.id] = item;
      });
      learningContentLoaded = true;
      items = data.data.items;
    }

    // Filter to playable/readable content only
    const playableItems = items.filter(item =>
      item.audioFileEn || item.audioFileSv || item.textContentEn || item.textContentSv
    );

    if (playableItems.length === 0) {
      titleEl.textContent = 'No content available';
      return;
    }

    // Use daily seed for consistent random selection throughout the day
    const today = new Date();
    const dailySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const randomIndex = dailySeed % playableItems.length;

    const item = playableItems[randomIndex];
    todaysFocusItem = item;

    // Update UI
    const lang = document.documentElement.lang || 'en';
    const title = lang === 'sv' ? (item.titleSv || item.titleEn) : item.titleEn;

    titleEl.textContent = title;

    // Show duration if available
    if (item.lengthMinutes) {
      durationEl.textContent = `${item.lengthMinutes} min`;
      progressEl.style.width = '0%';
    } else {
      durationEl.textContent = '';
      progressEl.style.width = '0%';
    }

    // Update icon based on content type
    const iconContainer = document.querySelector('#todays-focus-card .card-icon i');
    if (iconContainer) {
      const iconName = getContentIcon(item);
      iconContainer.setAttribute('data-lucide', iconName);
      lucide.createIcons();
    }

    // Make button functional
    if (btnEl) {
      btnEl.onclick = () => openTodaysFocusContent();
    }

  } catch (error) {
    console.warn('Failed to load today\'s focus:', error);
    titleEl.textContent = 'Content unavailable';
  }
}

/**
 * Open the Today's Focus content item
 */
function openTodaysFocusContent() {
  if (!todaysFocusItem) return;

  const item = todaysFocusItem;
  const hasAudio = item.audioFileEn || item.audioFileSv;
  const hasText = item.textContentEn || item.textContentSv;

  if (hasAudio) {
    openAudioPlayer(item.id);
  } else if (hasText) {
    openTextContentModal(item);
  }
}

/**
 * Get icon for content type
 */
function getContentIcon(item) {
  switch (item.contentType) {
    case 'audio_article':
      return 'play-circle';
    case 'audio_exercise':
      return 'headphones';
    case 'video_link':
      return 'video';
    case 'text_article':
    default:
      return 'file-text';
  }
}

/**
 * Get audio content by ID (from content library or legacy fallback)
 */
function getAudioContent(audioId) {
  // First check content library items
  if (learningContentItems[audioId]) {
    const item = learningContentItems[audioId];
    return {
      titleEn: item.titleEn,
      titleSv: item.titleSv,
      audioFileEn: item.audioFileEn,
      audioFileSv: item.audioFileSv,
    };
  }

  // Legacy fallback for hardcoded IDs (kept for backwards compatibility)
  const legacyContent = {
    'time-ninja': {
      titleEn: 'Time Ninja: Master Your Schedule',
      titleSv: 'Tidsninja: Bemästra ditt schema',
      audioFileEn: '/audio/sample_time_ninja_EN.mp3',
      audioFileSv: '/audio/sample_time_ninja_SV.mp3',
    }
  };

  return legacyContent[audioId] || null;
}

/**
 * Open audio player modal
 */
function openAudioPlayer(audioId) {
  const content = getAudioContent(audioId);
  if (!content) return;

  // Get current language
  const lang = document.documentElement.lang || 'en';
  const audioFile = lang === 'sv' ? (content.audioFileSv || content.audioFileEn) : content.audioFileEn;
  const title = lang === 'sv' ? (content.titleSv || content.titleEn) : content.titleEn;

  // Set up audio element
  audioElement = document.getElementById('audio-element');
  audioElement.src = audioFile;

  // Set title
  document.getElementById('audio-player-title').textContent = title;

  // Reset progress
  document.getElementById('audio-progress-bar').style.width = '0%';
  document.getElementById('audio-current-time').textContent = '0:00';
  document.getElementById('audio-duration').textContent = '0:00';

  // Show loading state on play button
  const playBtn = document.getElementById('audio-play-btn');
  playBtn.classList.add('loading');

  // Show modal
  document.getElementById('audio-player-modal').classList.add('active');

  // Set up event listeners
  audioElement.addEventListener('loadedmetadata', updateAudioDuration);
  audioElement.addEventListener('timeupdate', updateAudioProgress);
  audioElement.addEventListener('ended', onAudioEnded);

  // Auto-play when audio is ready
  const autoPlayHandler = () => {
    audioElement.removeEventListener('canplaythrough', autoPlayHandler);
    // Remove loading state
    document.getElementById('audio-play-btn').classList.remove('loading');
    audioElement.play().then(() => {
      isAudioPlaying = true;
      updateAudioPlayIcon(true);
    }).catch(() => {
      // Autoplay blocked by browser, user needs to click play
      isAudioPlaying = false;
      updateAudioPlayIcon(false);
    });
  };
  audioElement.addEventListener('canplaythrough', autoPlayHandler);
  audioElement.load();

  lucide.createIcons();
}

/**
 * Close audio player modal
 */
function closeAudioPlayer() {
  if (audioElement) {
    audioElement.pause();
    audioElement.removeEventListener('loadedmetadata', updateAudioDuration);
    audioElement.removeEventListener('timeupdate', updateAudioProgress);
    audioElement.removeEventListener('ended', onAudioEnded);
  }
  document.getElementById('audio-player-modal').classList.remove('active');
  isAudioPlaying = false;
}

/**
 * Parse simple markdown to HTML
 * Supports: ## headings, ### subheadings, **bold**, *italic*, - lists, > blockquotes, --- dividers
 */
function parseMarkdownToHtml(text) {
  if (!text) return '';

  // First escape HTML to prevent XSS
  let html = escapeHtml(text);

  // Convert --- horizontal rules (section dividers)
  html = html.replace(/^---$/gm, '<hr>');

  // Convert ## headers to h2
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

  // Convert ### headers to h3
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // Convert **bold** to strong
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to em (but not **bold**)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Convert > blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert bullet points to list items
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive list items in ul
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g, (match) => {
    return '<ul>' + match + '</ul>';
  });

  // Convert double newlines to paragraph breaks
  const parts = html.split(/\n\n+/);
  html = parts.map(p => {
    // Don't wrap if already has block element
    if (p.match(/^<(h[23]|ul|ol|blockquote|li|hr)/)) {
      return p;
    }
    // Convert single newlines to br within paragraphs
    p = p.replace(/\n/g, '<br>');
    return p.trim() ? `<p>${p}</p>` : '';
  }).join('\n');

  return html;
}

/**
 * Calculate estimated reading time
 */
function calculateReadingTime(text, lang = 'en') {
  if (!text) return lang === 'sv' ? '1 min läsning' : '1 min read';
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return lang === 'sv' ? `${minutes} min läsning` : `${minutes} min read`;
}

/**
 * Open text content modal for articles
 */
function openTextContentModal(item) {
  const lang = document.documentElement.lang || 'en';
  const title = lang === 'sv' ? (item.titleSv || item.titleEn) : item.titleEn;
  const content = lang === 'sv' ? (item.textContentSv || item.textContentEn) : item.textContentEn;
  const framework = item.relatedFramework || '';

  // Get the pre-rendered modal
  const modal = document.getElementById('text-content-modal');
  if (!modal) {
    console.error('Text content modal not found');
    return;
  }

  // Set title
  const titleEl = document.getElementById('text-content-title');
  if (titleEl) titleEl.textContent = title;

  // Set article content with markdown parsing (separate from header)
  const articleEl = document.getElementById('text-content-article');
  if (articleEl) {
    articleEl.innerHTML = parseMarkdownToHtml(content || (lang === 'sv' ? 'Innehåll inte tillgängligt.' : 'Content not available.'));
  }

  // Scroll body to top
  const bodyEl = document.getElementById('text-content-body');
  if (bodyEl) {
    bodyEl.scrollTop = 0;
  }

  // Set metadata
  const readingTimeEl = document.getElementById('text-content-reading-time');
  if (readingTimeEl) {
    readingTimeEl.textContent = calculateReadingTime(content, lang);
  }

  const frameworkEl = document.getElementById('text-content-framework');
  if (frameworkEl) {
    frameworkEl.textContent = framework;
    frameworkEl.style.display = framework ? '' : 'none';
  }

  // Show modal
  modal.classList.add('active');
  lucide.createIcons();
}

/**
 * Close text content modal
 */
function closeTextContentModal() {
  const modal = document.getElementById('text-content-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close text modal when clicking overlay background
document.addEventListener('click', (event) => {
  const modal = document.getElementById('text-content-modal');
  if (event.target === modal) {
    closeTextContentModal();
  }
});

// Make text content modal functions globally available
window.openTextContentModal = openTextContentModal;
window.closeTextContentModal = closeTextContentModal;
window.parseMarkdownToHtml = parseMarkdownToHtml;

/**
 * Toggle audio playback
 */
function toggleAudioPlayback() {
  if (!audioElement) return;

  if (isAudioPlaying) {
    audioElement.pause();
  } else {
    audioElement.play();
  }
  isAudioPlaying = !isAudioPlaying;
  updateAudioPlayIcon(isAudioPlaying);
}

/**
 * Update play/pause icon and visualizer state
 */
function updateAudioPlayIcon(playing) {
  const icon = document.getElementById('audio-play-icon');
  icon.setAttribute('data-lucide', playing ? 'pause' : 'play');

  // Toggle visualizer animation
  const visualizer = document.getElementById('audio-visualizer');
  if (visualizer) {
    visualizer.classList.toggle('playing', playing);
  }

  lucide.createIcons();
}

/**
 * Update audio duration display
 */
function updateAudioDuration() {
  const duration = audioElement.duration;
  document.getElementById('audio-duration').textContent = formatAudioTime(duration);
}

/**
 * Update audio progress bar and time
 */
function updateAudioProgress() {
  const current = audioElement.currentTime;
  const duration = audioElement.duration;
  const percent = (current / duration) * 100;

  document.getElementById('audio-progress-bar').style.width = percent + '%';
  document.getElementById('audio-current-time').textContent = formatAudioTime(current);
}

/**
 * Seek audio to clicked position
 */
function seekAudio(event) {
  if (!audioElement) return;

  const container = event.currentTarget;
  const rect = container.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audioElement.currentTime = percent * audioElement.duration;
}

/**
 * Skip audio forward or backward
 */
function skipAudio(seconds) {
  if (!audioElement) return;
  audioElement.currentTime = Math.max(0, Math.min(audioElement.duration, audioElement.currentTime + seconds));
}

/**
 * Handle audio ended event
 */
function onAudioEnded() {
  isAudioPlaying = false;
  updateAudioPlayIcon(false);
}

/**
 * Format seconds to mm:ss
 */
function formatAudioTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Close modal when clicking outside
document.addEventListener('click', (event) => {
  const modal = document.getElementById('audio-player-modal');
  if (event.target === modal) {
    closeAudioPlayer();
  }
});

// Make audio player functions globally available
window.openAudioPlayer = openAudioPlayer;
window.closeAudioPlayer = closeAudioPlayer;
window.toggleAudioPlayback = toggleAudioPlayback;
window.seekAudio = seekAudio;
window.skipAudio = skipAudio;

// ============================================================================
// ADMIN PANEL FUNCTIONS
// ============================================================================

/**
 * Admin state
 */
const adminState = {
  isAdmin: false,
  organizations: [],
  currentPoolId: null,
  pools: [],
  invitations: [],
  groups: []
};

/**
 * Check if user is admin and update nav visibility
 */
async function checkAdminStatus() {
  try {
    const response = await fetch(apiUrl('/api/auth/admin-status'), {
      credentials: 'include'
    });

    if (!response.ok) {
      adminState.isAdmin = false;
      updateAdminNavVisibility(false);
      return false;
    }

    const result = await response.json();
    adminState.isAdmin = result.data?.isAdmin || false;
    adminState.organizations = result.data?.organizations || [];

    updateAdminNavVisibility(adminState.isAdmin);
    return adminState.isAdmin;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    adminState.isAdmin = false;
    updateAdminNavVisibility(false);
    return false;
  }
}

/**
 * Update admin nav visibility across all sidebars
 */
function updateAdminNavVisibility(isAdmin) {
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
}

/**
 * Load admin data (pools, invitations, groups)
 */
async function loadAdminData() {
  if (!adminState.isAdmin) {
    await checkAdminStatus();
    if (!adminState.isAdmin) {
      showScreen('dashboard');
      return;
    }
  }

  await loadAdminPools();
}

/**
 * Load pools for admin's organization (auto-selects the single pool)
 */
async function loadAdminPools() {
  const poolNameEl = document.getElementById('admin-pool-name');

  try {
    const response = await fetch(apiUrl('/api/circles/pools'), {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load pools');

    const result = await response.json();
    adminState.pools = result.data?.pools || [];

    // Auto-select the first (and typically only) pool
    if (adminState.pools.length > 0) {
      const pool = adminState.pools[0];
      adminState.currentPoolId = pool.id;
      poolNameEl.textContent = pool.name;
      await loadPoolData(pool.id);
    } else {
      poolNameEl.textContent = 'No pool configured';
      document.getElementById('admin-pool-status').innerHTML = `
        <span class="admin-status-info">Contact support to set up your organization.</span>
      `;
    }
  } catch (error) {
    console.error('Failed to load pools:', error);
    poolNameEl.textContent = 'Error loading pool';
  }
}

/**
 * Load data for a specific pool
 */
async function loadPoolData(poolId) {
  // Update pool status
  const pool = adminState.pools.find(p => p.id === poolId);
  if (pool) {
    const statusEl = document.getElementById('admin-pool-status');
    statusEl.innerHTML = `
      <span class="admin-status-badge status-${pool.status}">${pool.status}</span>
      <span class="admin-status-info">Target group size: ${pool.targetGroupSize}</span>
    `;
  }

  // Load invitations and groups in parallel
  await Promise.all([
    loadPoolInvitations(poolId),
    loadPoolGroups(poolId)
  ]);
}

/**
 * Load invitations for a pool
 */
async function loadPoolInvitations(poolId) {
  try {
    const response = await fetch(apiUrl(`/api/circles/pools/${poolId}/invitations`), {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load invitations');

    const result = await response.json();
    adminState.invitations = result.data?.invitations || [];

    renderAdminInvitations();
    updateAssignButton();
  } catch (error) {
    console.error('Failed to load invitations:', error);
    adminState.invitations = [];
    renderAdminInvitations();
  }
}

/**
 * Load groups for a pool
 */
async function loadPoolGroups(poolId) {
  try {
    const response = await fetch(apiUrl(`/api/circles/pools/${poolId}/groups`), {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load groups');

    const result = await response.json();
    adminState.groups = result.data?.groups || [];

    renderAdminGroups();
  } catch (error) {
    console.error('Failed to load groups:', error);
    adminState.groups = [];
    renderAdminGroups();
  }
}

/**
 * Render invitations list
 */
function renderAdminInvitations() {
  const container = document.getElementById('admin-invitations-list');
  const countEl = document.getElementById('admin-invitation-count');

  countEl.textContent = adminState.invitations.length;

  if (adminState.invitations.length === 0) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <i data-lucide="users"></i>
        <p>No invitations yet</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="admin-invitations-table">
      <div class="admin-table-header">
        <span>Email</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      ${adminState.invitations.map(inv => `
        <div class="admin-table-row">
          <span class="admin-invitation-email">${inv.email}</span>
          <span class="admin-invitation-status status-${inv.status}">${inv.status}</span>
          <button class="btn btn-sm btn-danger" onclick="removeAdminInvitation('${inv.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `).join('')}
    </div>
  `;
  lucide.createIcons();
}

/**
 * Render groups list
 */
function renderAdminGroups() {
  const container = document.getElementById('admin-groups-list');
  const countEl = document.getElementById('admin-group-count');

  countEl.textContent = adminState.groups.length;

  if (adminState.groups.length === 0) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <i data-lucide="users"></i>
        <p>No groups assigned yet</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = adminState.groups.map(group => `
    <div class="admin-group-card">
      <div class="admin-group-header">
        <h4>${group.name}</h4>
        <span class="admin-group-count">${group.members?.length || 0} members</span>
      </div>
      <ul class="admin-group-members">
        ${(group.members || []).map(member => `
          <li>
            <i data-lucide="user"></i>
            ${member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.email}
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
  lucide.createIcons();
}

/**
 * Update assign button visibility
 */
function updateAssignButton() {
  const btn = document.getElementById('admin-assign-btn');
  const acceptedCount = adminState.invitations.filter(i => i.status === 'accepted').length;
  const pool = adminState.pools.find(p => p.id === adminState.currentPoolId);

  // Show button if we have enough accepted invitations and pool is in inviting state
  const minRequired = pool?.targetGroupSize || 3;
  const canAssign = acceptedCount >= minRequired && pool?.status === 'inviting';

  btn.style.display = canAssign ? '' : 'none';
  btn.textContent = `Assign Groups (${acceptedCount} accepted)`;
}

/**
 * Parse emails from text input
 */
function parseEmails(text) {
  // Split by comma, newline, semicolon, or whitespace
  const parts = text.split(/[,;\n\r]+/);
  const emails = [];

  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    // Basic email validation
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      emails.push(trimmed);
    }
  }

  // Remove duplicates
  return [...new Set(emails)];
}

/**
 * Update email count display
 */
function updateAdminEmailCount() {
  const text = document.getElementById('admin-emails-input').value;
  const emails = parseEmails(text);
  const countEl = document.getElementById('admin-email-count');
  countEl.textContent = `${emails.length} email${emails.length !== 1 ? 's' : ''} detected`;
}

/**
 * Send batch invitations
 */
async function sendAdminInvitations() {
  const text = document.getElementById('admin-emails-input').value;
  const emails = parseEmails(text);

  if (emails.length === 0) {
    alert('Please enter at least one valid email address');
    return;
  }

  if (!adminState.currentPoolId) {
    alert('Please select a pool first');
    return;
  }

  try {
    // Transform email strings into invitee objects
    const invitees = emails.map(email => ({ email }));

    const response = await fetch(apiUrl(`/api/circles/pools/${adminState.currentPoolId}/invitations`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ invitees })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send invitations');
    }

    const result = await response.json();

    // Clear input
    document.getElementById('admin-emails-input').value = '';
    updateAdminEmailCount();

    // Reload invitations
    await loadPoolInvitations(adminState.currentPoolId);

    // Show success message
    const sent = result.data?.sent || emails.length;
    alert(`Successfully sent ${sent} invitation${sent !== 1 ? 's' : ''}`);
  } catch (error) {
    console.error('Failed to send invitations:', error);
    alert('Failed to send invitations: ' + error.message);
  }
}

/**
 * Remove an invitation
 */
async function removeAdminInvitation(invitationId) {
  if (!confirm('Are you sure you want to remove this invitation?')) {
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/circles/invitations/${invitationId}`), {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to remove invitation');
    }

    // Reload invitations
    await loadPoolInvitations(adminState.currentPoolId);
  } catch (error) {
    console.error('Failed to remove invitation:', error);
    alert('Failed to remove invitation: ' + error.message);
  }
}

/**
 * Trigger group assignment
 */
async function triggerAdminAssignment() {
  if (!adminState.currentPoolId) {
    alert('Please select a pool first');
    return;
  }

  const acceptedCount = adminState.invitations.filter(i => i.status === 'accepted').length;
  if (!confirm(`This will assign ${acceptedCount} accepted members into groups. Continue?`)) {
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/circles/pools/${adminState.currentPoolId}/assign`), {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to assign groups');
    }

    const result = await response.json();

    // Reload pool data
    await loadAdminPools();

    // Show success
    const groupCount = result.data?.groups?.length || 0;
    alert(`Successfully created ${groupCount} group${groupCount !== 1 ? 's' : ''}`);
  } catch (error) {
    console.error('Failed to assign groups:', error);
    alert('Failed to assign groups: ' + error.message);
  }
}

// Set up email input listener for count updates
document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('admin-emails-input');
  if (emailInput) {
    emailInput.addEventListener('input', updateAdminEmailCount);
  }
});

// Check admin status after auth state changes
document.addEventListener('DOMContentLoaded', () => {
  // Check admin status when page loads if user is logged in
  if (AuthClient.isLoggedIn()) {
    checkAdminStatus();
  }
});

/**
 * Send diagnostic test email
 */
async function sendDiagnosticEmail() {
  const toInput = document.getElementById('diagnostic-email-to');
  const subjectInput = document.getElementById('diagnostic-email-subject');
  const messageInput = document.getElementById('diagnostic-email-message');
  const resultDiv = document.getElementById('diagnostic-email-result');

  const to = toInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();

  if (!to || !subject || !message) {
    resultDiv.innerHTML = '<div class="diagnostic-error"><i data-lucide="alert-circle"></i> Please fill in all fields</div>';
    resultDiv.style.display = 'block';
    lucide.createIcons();
    return;
  }

  // Show loading state
  resultDiv.innerHTML = '<div class="diagnostic-loading"><i data-lucide="loader"></i> Sending test email...</div>';
  resultDiv.style.display = 'block';
  lucide.createIcons();

  console.log('[EMAIL DIAGNOSTIC] Starting diagnostic email send...');
  console.log('[EMAIL DIAGNOSTIC] To:', to);
  console.log('[EMAIL DIAGNOSTIC] Subject:', subject);

  try {
    const response = await fetch(apiUrl('/api/admin/diagnostic-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ to, subject, message }),
    });

    const result = await response.json();

    console.log('[EMAIL DIAGNOSTIC] Response:', result);

    // Display diagnostic log
    let logHtml = '';
    if (result.diagnosticLog && result.diagnosticLog.length > 0) {
      logHtml = '<div class="diagnostic-log"><strong>Diagnostic Log:</strong><pre>' +
        result.diagnosticLog.map(entry =>
          `[${entry.elapsed}] ${entry.message}${entry.data ? '\n  ' + JSON.stringify(entry.data, null, 2) : ''}`
        ).join('\n') +
        '</pre></div>';
    }

    if (result.success) {
      resultDiv.innerHTML = `
        <div class="diagnostic-success">
          <i data-lucide="check-circle"></i>
          <strong>Email sent successfully!</strong>
          <p>Mode: ${result.data?.mode || 'unknown'}</p>
          ${result.data?.messageId ? `<p>Message ID: ${result.data.messageId}</p>` : ''}
        </div>
        ${logHtml}
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="diagnostic-error">
          <i data-lucide="x-circle"></i>
          <strong>Email send failed</strong>
          <p>Error: ${result.error?.message || 'Unknown error'}</p>
          ${result.error?.code ? `<p>Code: ${result.error.code}</p>` : ''}
        </div>
        ${logHtml}
      `;
    }
  } catch (error) {
    console.error('[EMAIL DIAGNOSTIC] Exception:', error);
    resultDiv.innerHTML = `
      <div class="diagnostic-error">
        <i data-lucide="x-circle"></i>
        <strong>Request failed</strong>
        <p>${error.message}</p>
      </div>
    `;
  }

  resultDiv.style.display = 'block';
  lucide.createIcons();
}

// Make admin functions globally available
window.loadAdminData = loadAdminData;
window.sendAdminInvitations = sendAdminInvitations;
window.removeAdminInvitation = removeAdminInvitation;
window.triggerAdminAssignment = triggerAdminAssignment;
window.checkAdminStatus = checkAdminStatus;
window.sendDiagnosticEmail = sendDiagnosticEmail;
