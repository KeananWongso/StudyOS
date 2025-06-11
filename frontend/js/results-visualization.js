class ResultsVisualization {
    constructor() {
        this.results = null;
        this.charts = {};
        this.animationDelay = 100;
    }

    async initialize(assessmentResults) {
        this.results = assessmentResults;
        this.setupResultsInterface();
        this.generateVisualizations();
        this.displayPersonalizedRecommendations();
        this.animateResults();
    }

    setupResultsInterface() {
        const container = document.getElementById('results-container');
        if (!container) return;

        container.innerHTML = `
            <div class="results-module">
                <div class="results-header">
                    <div class="completion-celebration">
                        <div class="celebration-icon">🎉</div>
                        <h2>Your Learning Profile is Ready!</h2>
                        <p class="completion-message">We've analyzed your responses to create your personalized learning OS</p>
                    </div>
                    
                    <div class="profile-summary">
                        <div class="profile-type">
                            <h3>${this.results.overallProfile?.type || 'Adaptive Learner'}</h3>
                            <p class="type-description">${this.results.overallProfile?.description || 'You have a unique learning style'}</p>
                        </div>
                        <div class="confidence-score">
                            <div class="confidence-circle" data-score="${this.results.cognitiveFingerprint?.confidence || 75}">
                                <span class="confidence-number">${this.results.cognitiveFingerprint?.confidence || 75}%</span>
                                <span class="confidence-label">Profile Accuracy</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="results-content">
                    <div class="cognitive-dimensions">
                        <h4>Your Cognitive Fingerprint</h4>
                        <p class="dimensions-description">Your unique patterns across 5 learning dimensions</p>
                        
                        <div class="dimensions-visualization">
                            <canvas id="dimensions-radar" width="400" height="400"></canvas>
                            <div class="dimensions-legend">
                                <div class="legend-item">
                                    <div class="legend-color texture"></div>
                                    <span>Information Processing</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color temperature"></div>
                                    <span>Learning Energy</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color ecosystem"></div>
                                    <span>Concept Organization</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color temporal"></div>
                                    <span>Learning Rhythms</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color spatial"></div>
                                    <span>Knowledge Building</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="behavioral-insights">
                        <h4>How You Think & Learn</h4>
                        <div class="insights-grid">
                            ${this.generateBehavioralInsights()}
                        </div>
                    </div>

                    <div class="learning-strengths">
                        <h4>Your Learning Superpowers</h4>
                        <div class="strengths-list">
                            ${this.generateStrengthsList()}
                        </div>
                    </div>

                    <div class="personalized-recommendations">
                        <h4>Your Personalized Learning Strategies</h4>
                        <div class="recommendations-tabs">
                            <button class="rec-tab active" data-tab="study">Study Techniques</button>
                            <button class="rec-tab" data-tab="environment">Environment</button>
                            <button class="rec-tab" data-tab="tools">Tools & Apps</button>
                            <button class="rec-tab" data-tab="timing">Timing</button>
                        </div>
                        <div class="recommendations-content">
                            <div id="study-recommendations" class="rec-panel active">
                                ${this.generateStudyRecommendations()}
                            </div>
                            <div id="environment-recommendations" class="rec-panel">
                                ${this.generateEnvironmentRecommendations()}
                            </div>
                            <div id="tools-recommendations" class="rec-panel">
                                ${this.generateToolsRecommendations()}
                            </div>
                            <div id="timing-recommendations" class="rec-panel">
                                ${this.generateTimingRecommendations()}
                            </div>
                        </div>
                    </div>

                    <div class="next-steps">
                        <h4>Ready to Build Your Learning OS?</h4>
                        <p class="next-steps-description">
                            Now let's map your real life so we can fit learning into it perfectly
                        </p>
                        <div class="next-steps-actions">
                            <button id="continue-to-planner" class="btn-primary">
                                Set Up My Smart Planner
                                <span class="time-estimate">5-8 minutes</span>
                            </button>
                            <button id="view-detailed-results" class="btn-secondary">
                                View Detailed Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    generateVisualizations() {
        this.drawRadarChart();
        this.drawProgressBars();
    }

    drawRadarChart() {
        const canvas = document.getElementById('dimensions-radar');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get dimension scores
        const dimensions = ['texture', 'temperature', 'ecosystem', 'temporal', 'spatial'];
        const scores = dimensions.map(dim => {
            const primary = this.results.cognitiveFingerprint?.primary?.[dim];
            return primary ? primary.score : 0;
        });

        // Draw grid circles
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw axes
        dimensions.forEach((dim, index) => {
            const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            const labelX = centerX + (radius + 20) * Math.cos(angle);
            const labelY = centerY + (radius + 20) * Math.sin(angle);
            ctx.fillText(this.formatDimensionName(dim), labelX, labelY);
        });

        // Draw data polygon
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;

        ctx.beginPath();
        scores.forEach((score, index) => {
            const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
            const distance = (score / 100) * radius;
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw score points
        ctx.fillStyle = '#3b82f6';
        scores.forEach((score, index) => {
            const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
            const distance = (score / 100) * radius;
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    drawProgressBars() {
        // This will be called after DOM creation to animate progress bars
        setTimeout(() => {
            document.querySelectorAll('.progress-bar').forEach(bar => {
                const value = bar.dataset.value;
                bar.style.width = value + '%';
            });
        }, 500);
    }

    generateBehavioralInsights() {
        const behaviorProfile = this.results.cognitiveFingerprint?.behaviorProfile || {};
        
        return `
            <div class="insight-card">
                <div class="insight-icon">🧠</div>
                <div class="insight-content">
                    <h5>Decision Making</h5>
                    <p>${behaviorProfile.decisionMaking || 'Balanced decision-making style'}</p>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-icon">⚡</div>
                <div class="insight-content">
                    <h5>Processing Style</h5>
                    <p>${behaviorProfile.processingStyle || 'Moderate processing speed'}</p>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-icon">🎯</div>
                <div class="insight-content">
                    <h5>Attention Pattern</h5>
                    <p>${behaviorProfile.attentionPattern || 'Stable attention focus'}</p>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-icon">💡</div>
                <div class="insight-content">
                    <h5>Cognitive Load</h5>
                    <p>${behaviorProfile.cognitiveLoad || 'Balanced processing capacity'}</p>
                </div>
            </div>
        `;
    }

    generateStrengthsList() {
        const strengths = this.results.overallProfile?.strengths || [];
        const primary = this.results.cognitiveFingerprint?.primary || {};

        if (strengths.length === 0) {
            // Generate strengths from primary patterns
            Object.entries(primary).forEach(([dimension, data]) => {
                strengths.push(data.description);
            });
        }

        return strengths.slice(0, 4).map(strength => `
            <div class="strength-item">
                <div class="strength-icon">✨</div>
                <p>${strength}</p>
            </div>
        `).join('');
    }

    generateStudyRecommendations() {
        const recommendations = this.results.personalizedRecommendations?.studyTechniques || [
            "Use visual aids and diagrams to organize information",
            "Create concept maps to connect ideas",
            "Practice active recall with spaced repetition",
            "Break large topics into smaller, manageable chunks"
        ];

        return `
            <div class="recommendation-list">
                ${recommendations.slice(0, 5).map(rec => `
                    <div class="recommendation-item">
                        <div class="rec-icon">📚</div>
                        <p>${rec}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateEnvironmentRecommendations() {
        const recommendations = this.results.personalizedRecommendations?.learningEnvironments || [
            "Find a quiet space with minimal distractions",
            "Use good lighting and comfortable seating",
            "Keep your study materials organized and accessible",
            "Create a dedicated learning space"
        ];

        return `
            <div class="recommendation-list">
                ${recommendations.slice(0, 5).map(rec => `
                    <div class="recommendation-item">
                        <div class="rec-icon">🏠</div>
                        <p>${rec}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateToolsRecommendations() {
        const recommendations = this.results.personalizedRecommendations?.technologicalTools || [
            "Flashcard apps for memorization",
            "Mind mapping software for visual learning",
            "Note-taking apps with organization features",
            "Time tracking tools for study sessions"
        ];

        return `
            <div class="recommendation-list">
                ${recommendations.slice(0, 5).map(rec => `
                    <div class="recommendation-item">
                        <div class="rec-icon">🔧</div>
                        <p>${rec}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateTimingRecommendations() {
        const recommendations = this.results.personalizedRecommendations?.timeManagement || [
            "Schedule study sessions during your peak energy hours",
            "Use the Pomodoro Technique for focused work",
            "Take regular breaks to maintain concentration",
            "Plan review sessions spaced over time"
        ];

        return `
            <div class="recommendation-list">
                ${recommendations.slice(0, 5).map(rec => `
                    <div class="recommendation-item">
                        <div class="rec-icon">⏰</div>
                        <p>${rec}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupEventListeners() {
        // Recommendation tabs
        document.querySelectorAll('.rec-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchRecommendationTab(e.target.dataset.tab);
            });
        });

        // Next steps buttons
        document.getElementById('continue-to-planner')?.addEventListener('click', () => {
            this.proceedToSmartPlanner();
        });

        document.getElementById('view-detailed-results')?.addEventListener('click', () => {
            this.showDetailedResults();
        });
    }

    switchRecommendationTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.rec-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.rec-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-recommendations`).classList.add('active');
    }

    animateResults() {
        // Animate confidence circle
        const circle = document.querySelector('.confidence-circle');
        if (circle) {
            const score = circle.dataset.score;
            this.animateConfidenceCircle(circle, score);
        }

        // Animate dimension cards
        document.querySelectorAll('.insight-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * this.animationDelay);
        });

        // Animate strength items
        document.querySelectorAll('.strength-item').forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, (index + 4) * this.animationDelay);
        });
    }

    animateConfidenceCircle(circle, targetScore) {
        let currentScore = 0;
        const increment = targetScore / 50; // 50 steps
        
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(timer);
            }
            
            circle.style.background = `conic-gradient(#3b82f6 ${currentScore * 3.6}deg, #e5e7eb 0deg)`;
        }, 30);
    }

    formatDimensionName(dimension) {
        const names = {
            texture: 'Processing',
            temperature: 'Energy',
            ecosystem: 'Organization',
            temporal: 'Rhythms',
            spatial: 'Building'
        };
        return names[dimension] || dimension;
    }

    proceedToSmartPlanner() {
        // Save current results and proceed to Smart Planner
        localStorage.setItem('cognitiveProfile', JSON.stringify(this.results));
        
        // Show transition message
        const container = document.getElementById('results-container');
        container.innerHTML = `
            <div class="transition-screen">
                <div class="transition-content">
                    <div class="loading-spinner"></div>
                    <h3>Preparing Your Smart Planner</h3>
                    <p>We're using your cognitive profile to customize your scheduling experience...</p>
                </div>
            </div>
        `;

        // Initialize Smart Planner after short delay
        setTimeout(() => {
            window.smartPlanner = new SmartPlannerOnboarding();
            window.smartPlanner.initialize(this.results);
        }, 2000);
    }

    showDetailedResults() {
        // Create detailed results modal
        const modal = document.createElement('div');
        modal.className = 'detailed-results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detailed Cognitive Analysis</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.generateDetailedAnalysis()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    generateDetailedAnalysis() {
        const primary = this.results.cognitiveFingerprint?.primary || {};
        
        return `
            <div class="detailed-analysis">
                <h4>Dimension Breakdown</h4>
                ${Object.entries(primary).map(([dimension, data]) => `
                    <div class="dimension-detail">
                        <h5>${this.formatDimensionName(dimension)} - ${data.score}% (${data.confidence}% confidence)</h5>
                        <p><strong>Pattern:</strong> ${data.pattern}</p>
                        <p><strong>Description:</strong> ${data.description}</p>
                    </div>
                `).join('')}
                
                <h4>Processing Speed Analysis</h4>
                <p>${this.results.cognitiveFingerprint?.processingSpeed || 'Moderate processor'}</p>
                
                <h4>Adaptability Index</h4>
                <p>Your adaptability score is ${this.results.cognitiveFingerprint?.adaptabilityIndex || 75}/100</p>
            </div>
        `;
    }

    displayPersonalizedRecommendations() {
        // This method can be expanded to show more detailed recommendations
        console.log('Personalized recommendations loaded:', this.results.personalizedRecommendations);
    }
}

// Export for use in other modules
window.ResultsVisualization = ResultsVisualization;