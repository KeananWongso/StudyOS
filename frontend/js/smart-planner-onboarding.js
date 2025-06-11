class SmartPlannerOnboarding {
    constructor() {
        this.cognitiveProfile = null;
        this.userSchedule = {
            fixedCommitments: [],
            flexibleActivities: [],
            preferences: {},
            constraints: []
        };
        this.currentStep = 'welcome';
        this.scheduleUploads = [];
        this.conversationalData = {};
    }

    async initialize(cognitiveProfile) {
        this.cognitiveProfile = cognitiveProfile;
        this.setupPlannerInterface();
        this.showWelcomeStep();
    }

    setupPlannerInterface() {
        const container = document.getElementById('results-container');
        if (!container) return;

        container.innerHTML = `
            <div class="smart-planner-onboarding">
                <div class="planner-header">
                    <div class="progress-indicator">
                        <div class="progress-step active" data-step="welcome">Welcome</div>
                        <div class="progress-step" data-step="schedule">Schedule</div>
                        <div class="progress-step" data-step="preferences">Preferences</div>
                        <div class="progress-step" data-step="preview">Preview</div>
                    </div>
                </div>

                <div class="planner-content">
                    <div id="planner-step-content">
                        <!-- Dynamic content goes here -->
                    </div>
                </div>

                <div class="planner-navigation">
                    <button id="planner-back" class="btn-secondary" style="display: none;">Back</button>
                    <button id="planner-next" class="btn-primary">Get Started</button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('planner-next')?.addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('planner-back')?.addEventListener('click', () => {
            this.previousStep();
        });
    }

    showWelcomeStep() {
        const content = document.getElementById('planner-step-content');
        if (!content) return;

        const profileType = this.cognitiveProfile?.overallProfile?.type || 'Adaptive Learner';
        
        content.innerHTML = `
            <div class="welcome-step">
                <div class="welcome-hero">
                    <h2>Perfect! Now Let's Map Your Real Life</h2>
                    <p class="welcome-subtitle">
                        Your cognitive profile shows you're a <strong>${profileType}</strong>. 
                        Now we'll create a schedule that fits both how your mind works AND your actual life.
                    </p>
                </div>

                <div class="planner-preview">
                    <h3>What We'll Build Together</h3>
                    <div class="preview-features">
                        <div class="feature-card">
                            <div class="feature-icon">📅</div>
                            <h4>Smart Schedule Mapping</h4>
                            <p>Upload your timetables, or tell us about your week - we'll understand it all</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🧠</div>
                            <h4>Cognitive-Aware Planning</h4>
                            <p>Sessions scheduled for your peak energy and optimal learning patterns</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🔄</div>
                            <h4>Intelligent Adaptation</h4>
                            <p>Automatically adjusts to your changing schedule and priorities</p>
                        </div>
                    </div>
                </div>

                <div class="time-estimate">
                    <div class="estimate-card">
                        <div class="estimate-icon">⏱️</div>
                        <div class="estimate-text">
                            <span class="estimate-time">5-8 minutes</span>
                            <span class="estimate-description">to complete setup</span>
                        </div>
                    </div>
                </div>

                <div class="cognitive-connection">
                    <h4>How Your ${profileType} Profile Shapes Your Planner</h4>
                    <div class="connection-insights">
                        ${this.generateCognitiveConnectionInsights()}
                    </div>
                </div>
            </div>
        `;

        this.updateNavigationButtons('Welcome', 'Start Planning');
    }

    showScheduleStep() {
        const content = document.getElementById('planner-step-content');
        if (!content) return;

        content.innerHTML = `
            <div class="schedule-step">
                <div class="step-header">
                    <h2>Tell Us About Your Schedule</h2>
                    <p>We'll map your existing commitments and find the perfect learning windows</p>
                </div>

                <div class="schedule-input-methods">
                    <div class="input-method-tabs">
                        <button class="method-tab active" data-method="upload">Upload Files</button>
                        <button class="method-tab" data-method="conversation">Describe Your Week</button>
                        <button class="method-tab" data-method="calendar">Connect Calendar</button>
                    </div>

                    <div class="input-method-content">
                        <div id="upload-method" class="method-panel active">
                            ${this.renderUploadMethod()}
                        </div>
                        <div id="conversation-method" class="method-panel">
                            ${this.renderConversationMethod()}
                        </div>
                        <div id="calendar-method" class="method-panel">
                            ${this.renderCalendarMethod()}
                        </div>
                    </div>
                </div>

                <div class="schedule-preview">
                    <h4>Recognized Schedule</h4>
                    <div id="schedule-preview-content">
                        <p class="no-schedule">No schedule data yet. Use one of the methods above to add your schedule.</p>
                    </div>
                </div>
            </div>
        `;

        this.setupScheduleEventListeners();
        this.updateNavigationButtons('Back', 'Continue');
    }

    renderUploadMethod() {
        return `
            <div class="upload-section">
                <div class="upload-area" id="schedule-upload-area">
                    <div class="upload-icon">📁</div>
                    <h4>Drag & Drop Your Schedule Files</h4>
                    <p>Timetables, PDFs, Excel files, screenshots - we'll read them all</p>
                    <input type="file" id="schedule-files" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.txt">
                    <label for="schedule-files" class="upload-button">Or Click to Browse</label>
                </div>
                
                <div class="upload-tips">
                    <h5>📋 What We Can Read:</h5>
                    <ul>
                        <li>Class timetables and course schedules</li>
                        <li>Work schedules and meeting calendars</li>
                        <li>Screenshots of calendar apps</li>
                        <li>Handwritten schedules (we'll OCR them!)</li>
                        <li>Excel/CSV files with time blocks</li>
                    </ul>
                </div>

                <div id="uploaded-files" class="uploaded-files-list">
                    <!-- Uploaded files will appear here -->
                </div>
            </div>
        `;
    }

    renderConversationMethod() {
        return `
            <div class="conversation-section">
                <div class="ai-assistant">
                    <div class="assistant-avatar">🤖</div>
                    <div class="assistant-intro">
                        <h4>Hi! I'm your scheduling assistant</h4>
                        <p>Just tell me about your typical week - I'll ask questions to understand your routine</p>
                    </div>
                </div>

                <div class="conversation-area">
                    <div id="conversation-history" class="conversation-history">
                        <div class="message assistant-message">
                            <p>Let's start simple - what does a typical Monday look like for you?</p>
                        </div>
                    </div>
                    
                    <div class="conversation-input">
                        <input type="text" id="user-input" placeholder="e.g., I have classes from 9-11am, then work from 2-6pm..." />
                        <button id="send-message">Send</button>
                    </div>
                </div>

                <div class="conversation-suggestions">
                    <h5>💡 Example responses:</h5>
                    <div class="suggestion-buttons">
                        <button class="suggestion-btn" data-message="I have classes Monday-Friday 9am-3pm">Regular class schedule</button>
                        <button class="suggestion-btn" data-message="I work part-time Tues/Thurs 4-8pm">Part-time work</button>
                        <button class="suggestion-btn" data-message="I'm free most mornings but busy evenings">General availability</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderCalendarMethod() {
        return `
            <div class="calendar-section">
                <div class="calendar-options">
                    <h4>Connect Your Digital Calendar</h4>
                    <p>We'll import your existing events and work around them</p>
                    
                    <div class="calendar-providers">
                        <button class="calendar-provider" data-provider="google">
                            <div class="provider-icon">📅</div>
                            <span>Google Calendar</span>
                        </button>
                        <button class="calendar-provider" data-provider="outlook">
                            <div class="provider-icon">📧</div>
                            <span>Outlook Calendar</span>
                        </button>
                        <button class="calendar-provider" data-provider="apple">
                            <div class="provider-icon">🍎</div>
                            <span>Apple Calendar</span>
                        </button>
                        <button class="calendar-provider" data-provider="other">
                            <div class="provider-icon">🔗</div>
                            <span>Other (.ics file)</span>
                        </button>
                    </div>
                </div>

                <div class="privacy-notice">
                    <div class="privacy-icon">🔒</div>
                    <div class="privacy-text">
                        <h5>Your Privacy Matters</h5>
                        <p>We only read event times and titles. No personal content is stored or shared.</p>
                    </div>
                </div>
            </div>
        `;
    }

    showPreferencesStep() {
        const content = document.getElementById('planner-step-content');
        if (!content) return;

        content.innerHTML = `
            <div class="preferences-step">
                <div class="step-header">
                    <h2>Fine-Tune Your Learning Schedule</h2>
                    <p>Based on your ${this.cognitiveProfile?.overallProfile?.type || 'learning'} profile, here are some smart defaults we've set</p>
                </div>

                <div class="preference-categories">
                    <div class="preference-section">
                        <h4>⚡ Energy & Focus Patterns</h4>
                        <div class="preference-options">
                            ${this.renderEnergyPreferences()}
                        </div>
                    </div>

                    <div class="preference-section">
                        <h4>📅 Session Scheduling</h4>
                        <div class="preference-options">
                            ${this.renderSessionPreferences()}
                        </div>
                    </div>

                    <div class="preference-section">
                        <h4>🎯 Learning Priorities</h4>
                        <div class="preference-options">
                            ${this.renderPriorityPreferences()}
                        </div>
                    </div>

                    <div class="preference-section">
                        <h4>🚫 Constraints & Boundaries</h4>
                        <div class="preference-options">
                            ${this.renderConstraintPreferences()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupPreferencesEventListeners();
        this.updateNavigationButtons('Back', 'Generate My Planner');
    }

    showPreviewStep() {
        const content = document.getElementById('planner-step-content');
        if (!content) return;

        content.innerHTML = `
            <div class="preview-step">
                <div class="preview-celebration">
                    <div class="celebration-animation">🎉</div>
                    <h2>Your Personalized Learning OS is Ready!</h2>
                    <p>We've created a learning system that understands both your mind and your life</p>
                </div>

                <div class="preview-dashboard">
                    ${this.renderDashboardPreview()}
                </div>

                <div class="setup-summary">
                    <h3>What We've Built for You</h3>
                    <div class="summary-cards">
                        ${this.renderSetupSummary()}
                    </div>
                </div>

                <div class="next-actions">
                    <h3>Ready to Start Learning?</h3>
                    <div class="action-buttons">
                        <button id="launch-dashboard" class="btn-primary">
                            Launch My Learning OS
                            <span class="launch-subtitle">Start your first optimized study session</span>
                        </button>
                        <button id="customize-further" class="btn-secondary">
                            Customize Further
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupPreviewEventListeners();
        this.updateNavigationButtons('', 'Launch Dashboard', true);
    }

    setupScheduleEventListeners() {
        // Method tabs
        document.querySelectorAll('.method-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchInputMethod(e.target.dataset.method);
            });
        });

        // File upload
        const fileInput = document.getElementById('schedule-files');
        const uploadArea = document.getElementById('schedule-upload-area');

        if (fileInput && uploadArea) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        }

        // Conversation input
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-message');

        if (userInput && sendButton) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sendSuggestedMessage(e.target.dataset.message);
            });
        });

        // Calendar providers
        document.querySelectorAll('.calendar-provider').forEach(provider => {
            provider.addEventListener('click', (e) => {
                this.connectCalendar(e.target.closest('.calendar-provider').dataset.provider);
            });
        });
    }

    switchInputMethod(method) {
        // Update tabs
        document.querySelectorAll('.method-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.method-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${method}-method`).classList.add('active');
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.processUploadedFiles(files);
    }

    handleFileDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        this.processUploadedFiles(files);
    }

    async processUploadedFiles(files) {
        const uploadedList = document.getElementById('uploaded-files');
        
        for (const file of files) {
            // Create file item
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">${this.getFileIcon(file.type)}</div>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-status">
                    <div class="processing-spinner"></div>
                    <span>Processing...</span>
                </div>
            `;
            uploadedList.appendChild(fileItem);

            // Process file (simulate OCR/parsing)
            try {
                const extractedData = await this.extractScheduleFromFile(file);
                this.scheduleUploads.push(extractedData);
                
                fileItem.querySelector('.file-status').innerHTML = `
                    <div class="success-icon">✅</div>
                    <span>Processed successfully</span>
                `;
                
                this.updateSchedulePreview();
            } catch (error) {
                fileItem.querySelector('.file-status').innerHTML = `
                    <div class="error-icon">❌</div>
                    <span>Processing failed</span>
                `;
            }
        }
    }

    async extractScheduleFromFile(file) {
        // Simulate file processing with OCR and schedule parsing
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock extracted schedule data
                resolve({
                    fileName: file.name,
                    events: [
                        { day: 'Monday', time: '9:00-11:00', activity: 'Mathematics Class', type: 'fixed' },
                        { day: 'Monday', time: '14:00-16:00', activity: 'Physics Lab', type: 'fixed' },
                        { day: 'Tuesday', time: '10:00-12:00', activity: 'Chemistry Lecture', type: 'fixed' },
                        // More mock data...
                    ]
                });
            }, 2000);
        });
    }

    sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessageToConversation(message, 'user');
        input.value = '';

        // Process message and generate AI response
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addMessageToConversation(response, 'assistant');
        }, 1000);
    }

    sendSuggestedMessage(message) {
        this.addMessageToConversation(message, 'user');
        
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addMessageToConversation(response, 'assistant');
        }, 1000);
    }

    addMessageToConversation(message, sender) {
        const history = document.getElementById('conversation-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        history.appendChild(messageDiv);
        history.scrollTop = history.scrollHeight;
    }

    generateAIResponse(userMessage) {
        // Simulate AI conversation for schedule collection
        const responses = [
            "That's helpful! What about the rest of your week - any regular commitments on Tuesday through Friday?",
            "Got it! Do you have any evening activities or weekend commitments I should know about?",
            "Perfect! And when do you typically have the most energy for focused learning?",
            "Excellent! I'm getting a clear picture of your schedule. Any time blocks you absolutely need to keep free?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    updateSchedulePreview() {
        const preview = document.getElementById('schedule-preview-content');
        if (!preview) return;

        if (this.scheduleUploads.length === 0) {
            preview.innerHTML = '<p class="no-schedule">No schedule data yet.</p>';
            return;
        }

        const allEvents = this.scheduleUploads.flatMap(upload => upload.events);
        
        preview.innerHTML = `
            <div class="schedule-grid">
                ${this.renderScheduleGrid(allEvents)}
            </div>
        `;
    }

    renderScheduleGrid(events) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        return days.map(day => {
            const dayEvents = events.filter(event => event.day === day);
            return `
                <div class="schedule-day">
                    <h5>${day}</h5>
                    <div class="day-events">
                        ${dayEvents.map(event => `
                            <div class="event-block ${event.type}">
                                <div class="event-time">${event.time}</div>
                                <div class="event-activity">${event.activity}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    generateCognitiveConnectionInsights() {
        const profileType = this.cognitiveProfile?.overallProfile?.type || 'Adaptive Learner';
        const primary = this.cognitiveProfile?.cognitiveFingerprint?.primary || {};

        const insights = [];

        // Temporal insights
        if (primary.temporal?.pattern === 'lightning_burst') {
            insights.push({
                icon: '⚡',
                text: 'We\'ll schedule short, intensive 25-minute sessions during your peak energy windows'
            });
        } else if (primary.temporal?.pattern === 'seasonal_deep') {
            insights.push({
                icon: '🌊',
                text: 'We\'ll create longer 2-3 hour deep work blocks with preparation phases'
            });
        } else {
            insights.push({
                icon: '⏱️',
                text: 'We\'ll balance consistent daily sessions with flexibility for your natural rhythms'
            });
        }

        // Temperature insights
        if (primary.temperature?.pattern === 'hot_urgent') {
            insights.push({
                icon: '🔥',
                text: 'High-stakes deadlines and competitive elements will keep you motivated'
            });
        } else if (primary.temperature?.pattern === 'cool_logical') {
            insights.push({
                icon: '🧊',
                text: 'Calm, structured sessions with clear objectives will optimize your focus'
            });
        }

        return insights.map(insight => `
            <div class="connection-insight">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
            </div>
        `).join('');
    }

    renderEnergyPreferences() {
        return `
            <div class="energy-mapping">
                <h5>When do you feel most energetic and focused?</h5>
                <div class="time-blocks">
                    <label class="time-block">
                        <input type="checkbox" name="peak-energy" value="morning">
                        <span class="time-label">Early Morning (6-9 AM)</span>
                    </label>
                    <label class="time-block">
                        <input type="checkbox" name="peak-energy" value="mid-morning" checked>
                        <span class="time-label">Mid Morning (9-12 PM)</span>
                    </label>
                    <label class="time-block">
                        <input type="checkbox" name="peak-energy" value="afternoon">
                        <span class="time-label">Afternoon (12-5 PM)</span>
                    </label>
                    <label class="time-block">
                        <input type="checkbox" name="peak-energy" value="evening">
                        <span class="time-label">Evening (5-8 PM)</span>
                    </label>
                    <label class="time-block">
                        <input type="checkbox" name="peak-energy" value="night">
                        <span class="time-label">Night (8-11 PM)</span>
                    </label>
                </div>
            </div>
        `;
    }

    renderSessionPreferences() {
        const temporal = this.cognitiveProfile?.cognitiveFingerprint?.primary?.temporal;
        let defaultLength = '45';
        
        if (temporal?.pattern === 'lightning_burst') defaultLength = '25';
        else if (temporal?.pattern === 'seasonal_deep') defaultLength = '120';

        return `
            <div class="session-settings">
                <div class="setting-item">
                    <label>Preferred session length:</label>
                    <select name="session-length">
                        <option value="25" ${defaultLength === '25' ? 'selected' : ''}>25 minutes (Pomodoro)</option>
                        <option value="45" ${defaultLength === '45' ? 'selected' : ''}>45 minutes (Standard)</option>
                        <option value="90" ${defaultLength === '90' ? 'selected' : ''}>90 minutes (Deep work)</option>
                        <option value="120" ${defaultLength === '120' ? 'selected' : ''}>2 hours (Immersive)</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>Break duration:</label>
                    <select name="break-length">
                        <option value="5">5 minutes</option>
                        <option value="10" selected>10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>Study sessions per day:</label>
                    <select name="sessions-per-day">
                        <option value="1">1 session</option>
                        <option value="2" selected>2 sessions</option>
                        <option value="3">3 sessions</option>
                        <option value="4">4+ sessions</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderPriorityPreferences() {
        return `
            <div class="priority-settings">
                <div class="setting-item">
                    <label>
                        <input type="checkbox" name="priorities" value="urgent-deadlines" checked>
                        Prioritize urgent deadlines and exams
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" name="priorities" value="spaced-review" checked>
                        Include spaced repetition review sessions
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" name="priorities" value="skill-building">
                        Balance skill-building vs. content consumption
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" name="priorities" value="weak-subjects">
                        Extra time for challenging subjects
                    </label>
                </div>
            </div>
        `;
    }

    renderConstraintPreferences() {
        return `
            <div class="constraint-settings">
                <div class="setting-item">
                    <label>No study sessions after:</label>
                    <select name="no-study-after">
                        <option value="21">9:00 PM</option>
                        <option value="22" selected>10:00 PM</option>
                        <option value="23">11:00 PM</option>
                        <option value="24">Midnight</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>Weekend study preferences:</label>
                    <select name="weekend-study">
                        <option value="light" selected>Light study only</option>
                        <option value="normal">Normal schedule</option>
                        <option value="intensive">Intensive catch-up</option>
                        <option value="none">No weekend study</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" name="constraints" value="meal-buffer" checked>
                        Keep 30-minute buffer around meal times
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" name="constraints" value="travel-buffer" checked>
                        Account for travel time between locations
                    </label>
                </div>
            </div>
        `;
    }

    renderDashboardPreview() {
        return `
            <div class="dashboard-preview">
                <div class="preview-header">
                    <h4>Your Learning Dashboard</h4>
                    <div class="preview-date">Today, ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
                
                <div class="preview-content">
                    <div class="today-schedule">
                        <h5>Today's Optimized Schedule</h5>
                        <div class="schedule-items">
                            <div class="schedule-item optimal">
                                <span class="time">9:30 - 10:15 AM</span>
                                <span class="subject">Mathematics Review</span>
                                <span class="type">Peak Focus Session</span>
                            </div>
                            <div class="schedule-item good">
                                <span class="time">2:00 - 2:45 PM</span>
                                <span class="subject">History Reading</span>
                                <span class="type">Active Learning</span>
                            </div>
                            <div class="schedule-item review">
                                <span class="time">7:00 - 7:15 PM</span>
                                <span class="subject">Quick Review</span>
                                <span class="type">Spaced Repetition</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-tutor-preview">
                        <h5>Your AI Tutor</h5>
                        <div class="tutor-message">
                            "Ready for your math session? Based on your ${this.cognitiveProfile?.overallProfile?.type || 'learning'} profile, I've prepared visual problems that build step-by-step."
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSetupSummary() {
        return `
            <div class="summary-card">
                <div class="summary-icon">🧠</div>
                <div class="summary-content">
                    <h4>Cognitive Profile Integrated</h4>
                    <p>Your ${this.cognitiveProfile?.overallProfile?.type || 'learning'} patterns are built into every session</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">📅</div>
                <div class="summary-content">
                    <h4>Smart Schedule Created</h4>
                    <p>${this.scheduleUploads.length} schedule${this.scheduleUploads.length !== 1 ? 's' : ''} processed and optimized for learning</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">🤖</div>
                <div class="summary-content">
                    <h4>AI Tutor Personalized</h4>
                    <p>Your tutor knows both how you learn best and when you're available</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">📊</div>
                <div class="summary-content">
                    <h4>Analytics Ready</h4>
                    <p>Track your progress and optimize your learning patterns over time</p>
                </div>
            </div>
        `;
    }

    setupPreferencesEventListeners() {
        // Handle preference changes
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => {
                this.updateUserPreferences();
            });
        });
    }

    setupPreviewEventListeners() {
        document.getElementById('launch-dashboard')?.addEventListener('click', () => {
            this.launchLearningOS();
        });

        document.getElementById('customize-further')?.addEventListener('click', () => {
            this.showCustomizationOptions();
        });
    }

    updateUserPreferences() {
        // Collect all preference data
        const preferences = {};
        
        document.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'checkbox') {
                if (!preferences[input.name]) preferences[input.name] = [];
                if (input.checked) preferences[input.name].push(input.value);
            } else {
                preferences[input.name] = input.value;
            }
        });

        this.userSchedule.preferences = preferences;
    }

    nextStep() {
        const steps = ['welcome', 'schedule', 'preferences', 'preview'];
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex < steps.length - 1) {
            this.currentStep = steps[currentIndex + 1];
            this.updateProgressIndicator();
            
            switch (this.currentStep) {
                case 'schedule':
                    this.showScheduleStep();
                    break;
                case 'preferences':
                    this.showPreferencesStep();
                    break;
                case 'preview':
                    this.showPreviewStep();
                    break;
            }
        }
    }

    previousStep() {
        const steps = ['welcome', 'schedule', 'preferences', 'preview'];
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
            this.updateProgressIndicator();
            
            switch (this.currentStep) {
                case 'welcome':
                    this.showWelcomeStep();
                    break;
                case 'schedule':
                    this.showScheduleStep();
                    break;
                case 'preferences':
                    this.showPreferencesStep();
                    break;
            }
        }
    }

    updateProgressIndicator() {
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });

        const steps = ['welcome', 'schedule', 'preferences', 'preview'];
        const currentIndex = steps.indexOf(this.currentStep);

        steps.forEach((step, index) => {
            const stepElement = document.querySelector(`[data-step="${step}"]`);
            if (index < currentIndex) {
                stepElement.classList.add('completed');
            } else if (index === currentIndex) {
                stepElement.classList.add('active');
            }
        });
    }

    updateNavigationButtons(backText, nextText, hideBack = false) {
        const backBtn = document.getElementById('planner-back');
        const nextBtn = document.getElementById('planner-next');

        if (hideBack || !backText) {
            backBtn.style.display = 'none';
        } else {
            backBtn.style.display = 'block';
            backBtn.textContent = backText;
        }

        nextBtn.textContent = nextText;
    }

    connectCalendar(provider) {
        // Simulate calendar connection
        alert(`Calendar connection for ${provider} will be implemented in the full version!`);
    }

    launchLearningOS() {
        // Save complete profile and launch main application
        const completeProfile = {
            cognitive: this.cognitiveProfile,
            schedule: this.userSchedule,
            onboardingCompleted: true,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('learningOSProfile', JSON.stringify(completeProfile));
        
        // Show success message and redirect
        alert('🎉 Your personalized Learning OS is now ready! In the full version, this would launch your customized dashboard.');
    }

    showCustomizationOptions() {
        alert('Additional customization options would be available in the full version!');
    }

    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        return '📁';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export for use in other modules
window.SmartPlannerOnboarding = SmartPlannerOnboarding;