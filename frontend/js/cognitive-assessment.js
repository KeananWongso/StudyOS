class CognitiveAssessmentApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.questions = [];
        this.behaviorData = {
            responses: [],
            timings: {},
            interactions: {},
            patterns: {}
        };
        this.startTime = null;
        this.questionStartTime = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        this.bindEvents();
        await this.loadCognitiveQuestions();
        this.showSection('home');
        this.initializeBehaviorTracking();
    }

    initializeBehaviorTracking() {
        // Track mouse movements and hover patterns
        document.addEventListener('mousemove', (e) => {
            if (this.isAssessmentActive()) {
                this.trackMouseMovement(e);
            }
        });

        // Track keyboard interactions
        document.addEventListener('keydown', (e) => {
            if (this.isAssessmentActive()) {
                this.trackKeyboardInteraction(e);
            }
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.isAssessmentActive()) {
                this.trackAttentionChange();
            }
        });
    }

    trackMouseMovement(event) {
        const currentQuestion = this.currentQuestionIndex;
        if (!this.behaviorData.interactions[currentQuestion]) {
            this.behaviorData.interactions[currentQuestion] = {
                mouseMovements: [],
                hovers: [],
                clicks: []
            };
        }

        // Sample mouse movements (not every movement to avoid performance issues)
        if (Math.random() < 0.1) { // Sample 10% of movements
            this.behaviorData.interactions[currentQuestion].mouseMovements.push({
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now()
            });
        }
    }

    trackOptionHover(optionElement, optionData) {
        const currentQuestion = this.currentQuestionIndex;
        if (!this.behaviorData.interactions[currentQuestion]) {
            this.behaviorData.interactions[currentQuestion] = {
                mouseMovements: [],
                hovers: [],
                clicks: []
            };
        }

        const hoverStart = Date.now();
        
        const hoverEndHandler = () => {
            const hoverDuration = Date.now() - hoverStart;
            this.behaviorData.interactions[currentQuestion].hovers.push({
                option: optionData.id,
                pattern: optionData.pattern,
                duration: hoverDuration,
                timestamp: hoverStart
            });
            optionElement.removeEventListener('mouseleave', hoverEndHandler);
        };

        optionElement.addEventListener('mouseleave', hoverEndHandler);
    }

    trackKeyboardInteraction(event) {
        const currentQuestion = this.currentQuestionIndex;
        if (!this.behaviorData.interactions[currentQuestion]) {
            this.behaviorData.interactions[currentQuestion] = {
                mouseMovements: [],
                hovers: [],
                clicks: [],
                keystrokes: []
            };
        }

        this.behaviorData.interactions[currentQuestion].keystrokes.push({
            key: event.key,
            timestamp: Date.now()
        });
    }

    trackAttentionChange() {
        const currentQuestion = this.currentQuestionIndex;
        if (!this.behaviorData.interactions[currentQuestion]) {
            this.behaviorData.interactions[currentQuestion] = {
                attentionChanges: []
            };
        }

        this.behaviorData.interactions[currentQuestion].attentionChanges = 
            this.behaviorData.interactions[currentQuestion].attentionChanges || [];
        
        this.behaviorData.interactions[currentQuestion].attentionChanges.push({
            visible: !document.hidden,
            timestamp: Date.now()
        });
    }

    isAssessmentActive() {
        return this.startTime && !this.isComplete();
    }

    isComplete() {
        return this.currentQuestionIndex >= this.questions.length;
    }

    bindEvents() {
        document.getElementById('start-cognitive-assessment')?.addEventListener('click', () => {
            this.startAssessment();
        });

        document.getElementById('next-btn')?.addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('prev-btn')?.addEventListener('click', () => {
            this.previousQuestion();
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    async loadCognitiveQuestions() {
        try {
            const response = await fetch('/api/cognitive-assessment/questions');
            const data = await response.json();
            
            // Handle the new scenario-based question format
            if (data.questions) {
                this.questions = data.questions;
            } else {
                this.questions = data;
            }
        } catch (error) {
            console.error('Failed to load cognitive questions:', error);
            // Load from local file as fallback
            try {
                const response = await fetch('/data/assessment-questions/cognitive-questions.json');
                const data = await response.json();
                this.questions = data.questions || data;
            } catch (fallbackError) {
                console.error('Failed to load fallback questions:', fallbackError);
                this.questions = [];
            }
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        if (sectionId === 'cognitive-profile') {
            this.displayCognitiveProfile();
        } else if (sectionId === 'results') {
            this.displayResults();
        }
    }

    startAssessment() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.behaviorData = {
            responses: [],
            timings: {},
            interactions: {},
            patterns: {}
        };
        this.startTime = Date.now();
        
        this.displayQuestion();
        this.showSection('cognitive-assessment');
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        this.questionStartTime = Date.now();

        document.getElementById('question-text').textContent = question.text;
        
        // Add question description if available
        const descriptionElement = document.getElementById('question-description');
        if (descriptionElement) {
            descriptionElement.textContent = question.description || '';
            descriptionElement.style.display = question.description ? 'block' : 'none';
        }

        // Update dimension indicator
        const dimensionIndicator = document.getElementById('current-dimension');
        if (dimensionIndicator) {
            const dimension = question.dimension || 'Scenario';
            dimensionIndicator.textContent = this.capitalizeFirst(question.category || dimension) + ' Question';
            dimensionIndicator.className = `dimension-indicator ${dimension}`;
        }

        document.getElementById('progress').textContent = 
            `${this.currentQuestionIndex + 1} / ${this.questions.length}`;

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const percentage = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = '';

        question.options.forEach(option => {
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.dataset.optionId = option.id;
            optionCard.dataset.pattern = option.pattern;
            
            optionCard.innerHTML = `
                <div class="option-content">
                    <div class="option-text">${option.text}</div>
                    ${option.description ? `<div class="option-description">${option.description}</div>` : ''}
                </div>
            `;
            
            // Add behavior tracking
            optionCard.addEventListener('mouseenter', () => {
                this.trackOptionHover(optionCard, option);
            });

            optionCard.addEventListener('click', () => {
                this.selectOption(optionCard, option);
            });

            optionsContainer.appendChild(optionCard);
        });

        this.updateNavigationButtons();
    }

    selectOption(cardElement, option) {
        // Track selection timing
        const responseTime = Date.now() - this.questionStartTime;
        
        // Clear previous selections
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        cardElement.classList.add('selected');
        
        // Record answer with behavioral data
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const answerData = {
            ...option,
            questionId: currentQuestion.id,
            dimension: currentQuestion.dimension || option.hidden_dimension,
            hidden_dimension: option.hidden_dimension, // For new scenario format
            scenario: currentQuestion.scenario, // For new scenario format
            category: currentQuestion.category, // For new scenario format
            responseTime: responseTime,
            timestamp: Date.now()
        };
        
        this.answers[this.currentQuestionIndex] = answerData;
        
        // Record behavioral data for this response
        this.behaviorData.responses[this.currentQuestionIndex] = {
            option: option,
            responseTime: responseTime,
            questionStartTime: this.questionStartTime,
            selectionTime: Date.now()
        };

        // Track if this was a changed answer
        if (this.behaviorData.timings[this.currentQuestionIndex]) {
            this.behaviorData.timings[this.currentQuestionIndex].changes = 
                (this.behaviorData.timings[this.currentQuestionIndex].changes || 0) + 1;
        } else {
            this.behaviorData.timings[this.currentQuestionIndex] = {
                responseTime: responseTime,
                changes: 0
            };
        }

        // Enable next button
        document.getElementById('next-btn').disabled = false;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.completeAssessment();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            
            // Re-enable next button if there's already an answer
            if (this.answers[this.currentQuestionIndex]) {
                document.getElementById('next-btn').disabled = false;
                
                // Re-select the previous answer
                const selectedOption = this.answers[this.currentQuestionIndex];
                const optionCard = document.querySelector(`[data-option-id="${selectedOption.id}"]`);
                if (optionCard) {
                    optionCard.classList.add('selected');
                }
            }
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.disabled = this.currentQuestionIndex === 0;
        nextBtn.disabled = !this.answers[this.currentQuestionIndex];
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.textContent = 'Complete Assessment';
        } else {
            nextBtn.textContent = 'Next';
        }
    }

    async completeAssessment() {
        const totalTime = Date.now() - this.startTime;
        
        try {
            // Calculate behavioral patterns
            this.calculateBehavioralPatterns();
            
            const results = await this.calculateCognitiveResults();
            await this.saveCognitiveResults(results, totalTime);
            
            // Use the new results visualization system
            this.initializeResultsVisualization(results);
            this.showSection('results');
        } catch (error) {
            console.error('Failed to complete assessment:', error);
        }
    }

    calculateBehavioralPatterns() {
        // Calculate response time patterns
        const responseTimes = this.behaviorData.responses.map(r => r.responseTime);
        this.behaviorData.patterns.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        this.behaviorData.patterns.responseTimeVariability = this.calculateVariance(responseTimes);
        
        // Calculate hesitation patterns (long hover times before selection)
        let totalHesitation = 0;
        let hesitationCount = 0;
        
        Object.values(this.behaviorData.interactions).forEach(interaction => {
            if (interaction.hovers) {
                const longHovers = interaction.hovers.filter(h => h.duration > 2000);
                totalHesitation += longHovers.length;
                hesitationCount++;
            }
        });
        
        this.behaviorData.patterns.hesitationIndex = hesitationCount > 0 ? totalHesitation / hesitationCount : 0;
        
        // Calculate answer changing behavior
        const totalChanges = Object.values(this.behaviorData.timings)
            .reduce((sum, timing) => sum + (timing.changes || 0), 0);
        this.behaviorData.patterns.changeFrequency = totalChanges / this.questions.length;
        
        // Calculate attention stability
        const attentionChanges = Object.values(this.behaviorData.interactions)
            .reduce((sum, interaction) => {
                return sum + (interaction.attentionChanges ? interaction.attentionChanges.length : 0);
            }, 0);
        this.behaviorData.patterns.attentionStability = Math.max(0, 100 - (attentionChanges * 10));
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        return squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
    }

    async calculateCognitiveResults() {
        try {
            // Convert answers to the expected format for the server
            const responses = this.answers.map((answer, index) => ({
                questionId: answer.questionId,
                selectedOption: answer.id,
                responseTime: answer.responseTime,
                questionData: this.questions[index]
            }));

            const response = await fetch('/api/cognitive-assessment/calculate-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    responses: responses,
                    assessmentType: 'scenario',
                    behaviorData: this.behaviorData
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to calculate results on server:', error);
            return this.calculateResultsLocally();
        }
    }

    calculateResultsLocally() {
        const dimensions = {
            texture: {},
            temperature: {},
            ecosystem: {},
            temporal: {},
            spatial: {}
        };

        // Initialize pattern counts for each dimension
        Object.keys(dimensions).forEach(dimension => {
            dimensions[dimension] = {
                patterns: {},
                totalCount: 0,
                scores: {}
            };
        });

        // Count responses by dimension and pattern
        this.answers.forEach(answer => {
            if (answer && answer.dimension && answer.pattern) {
                const dim = dimensions[answer.dimension];
                dim.patterns[answer.pattern] = (dim.patterns[answer.pattern] || 0) + 1;
                dim.totalCount++;
            }
        });

        // Calculate scores for each pattern within each dimension
        Object.keys(dimensions).forEach(dimension => {
            const dim = dimensions[dimension];
            Object.keys(dim.patterns).forEach(pattern => {
                dim.scores[pattern] = dim.totalCount > 0 ? 
                    Math.round((dim.patterns[pattern] / dim.totalCount) * 100) : 0;
            });
        });

        // Calculate cognitive fingerprint
        const cognitiveFingerprint = this.generateCognitiveFingerprint(dimensions);
        
        return {
            dimensions: dimensions,
            cognitiveFingerprint: cognitiveFingerprint,
            behaviorAnalysis: this.behaviorData.patterns,
            algorithm: 'cognitive_multi_dimensional',
            timestamp: new Date().toISOString()
        };
    }

    generateCognitiveFingerprint(dimensions) {
        const fingerprint = {
            primary: {},
            secondary: {},
            profile: '',
            confidence: 0
        };

        // Find dominant pattern in each dimension
        Object.keys(dimensions).forEach(dimension => {
            const dim = dimensions[dimension];
            let maxScore = 0;
            let dominantPattern = null;

            Object.keys(dim.scores).forEach(pattern => {
                if (dim.scores[pattern] > maxScore) {
                    maxScore = dim.scores[pattern];
                    dominantPattern = pattern;
                }
            });

            if (dominantPattern) {
                fingerprint.primary[dimension] = {
                    pattern: dominantPattern,
                    score: maxScore,
                    description: this.getPatternDescription(dimension, dominantPattern)
                };
            }
        });

        // Calculate overall confidence
        const allScores = Object.values(fingerprint.primary).map(p => p.score);
        fingerprint.confidence = allScores.length > 0 ? 
            Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

        // Generate profile description
        fingerprint.profile = this.generateProfileDescription(fingerprint.primary);

        return fingerprint;
    }

    getPatternDescription(dimension, pattern) {
        const descriptions = {
            texture: {
                smooth_flowing: "Prefers seamless, connected information flow",
                rough_grippable: "Needs concrete, tangible concepts to grasp",
                sand_shifting: "Appreciates flexible, adaptable information",
                clay_moldable: "Wants to actively shape and transform ideas"
            },
            temperature: {
                cool_logical: "Thrives in objective, analytical environments",
                warm_narrative: "Learns through stories and emotional connection",
                hot_urgent: "Motivated by intensity and immediate application",
                alternating_temp: "Needs variety in pace and emotional intensity"
            },
            ecosystem: {
                garden_organic: "Sees natural, evolving connections between ideas",
                city_systems: "Prefers organized, systematic relationships",
                forest_hierarchical: "Thinks in structured levels and hierarchies",
                ocean_depth: "Explores deep, far-reaching connections"
            },
            temporal: {
                tidal_steady: "Works best with consistent, regular patterns",
                seasonal_deep: "Prefers cycles of preparation and intensive work",
                lightning_burst: "Learns through sudden insights and intense focus",
                heartbeat_maintenance: "Maintains steady progress with periodic acceleration"
            },
            spatial: {
                foundation_up: "Builds knowledge systematically from basics",
                big_picture_down: "Starts with overview and fills in details",
                modular: "Learns in independent pieces that connect later",
                flowing: "Lets understanding develop organically"
            }
        };

        return descriptions[dimension]?.[pattern] || "Unique cognitive pattern";
    }

    generateProfileDescription(primaryPatterns) {
        const patterns = Object.values(primaryPatterns).map(p => p.pattern);
        
        // Generate a cohesive description based on pattern combinations
        let description = "Your cognitive profile shows ";
        
        if (patterns.includes('smooth_flowing') && patterns.includes('tidal_steady')) {
            description += "a preference for consistent, flowing learning experiences. ";
        } else if (patterns.includes('lightning_burst') && patterns.includes('hot_urgent')) {
            description += "an intense, breakthrough-oriented learning style. ";
        } else if (patterns.includes('garden_organic') && patterns.includes('clay_moldable')) {
            description += "a creative, adaptive approach to building understanding. ";
        } else {
            description += "a unique combination of cognitive preferences. ";
        }

        description += "This suggests you learn best when information and environments align with your natural cognitive rhythms.";
        
        return description;
    }

    async saveCognitiveResults(results, totalTime) {
        try {
            await fetch('/api/cognitive-assessment/save-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    results: results,
                    totalTime: totalTime,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Failed to save results:', error);
        }
    }

    displayResults() {
        if (this.answers.length === 0) {
            document.getElementById('results-container').innerHTML = '<p>Please complete the assessment first.</p>';
            return;
        }

        const results = this.calculateResultsLocally();
        const visualization = new CognitiveVisualization();
        visualization.displayResults(results);
    }

    initializeResultsVisualization(results) {
        // Initialize the new results visualization system
        if (window.ResultsVisualization) {
            const resultsViz = new window.ResultsVisualization();
            resultsViz.initialize(results);
        } else {
            // Fallback to basic display if ResultsVisualization is not loaded
            this.displayResults();
        }
    }

    displayCognitiveProfile() {
        // Load and display user's cognitive profile
        const profileContainer = document.getElementById('profile-content');
        profileContainer.innerHTML = '<p>Complete the assessment to generate your cognitive profile.</p>';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CognitiveAssessmentApp();
});