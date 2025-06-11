class LearningAssessmentApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.questions = [];
        this.userProfile = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        this.bindEvents();
        await this.loadQuestions();
        this.showSection('home');
    }

    bindEvents() {
        document.getElementById('start-assessment').addEventListener('click', () => {
            this.startAssessment();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
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

    async loadQuestions() {
        try {
            const response = await fetch('/api/questions');
            this.questions = await response.json();
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.questions = this.getDefaultQuestions();
        }
    }

    getDefaultQuestions() {
        return [
            {
                id: 1,
                text: "When learning new information, I prefer to:",
                options: [
                    { id: 'a', text: "Read about it in detail", pattern: 'visual' },
                    { id: 'b', text: "Listen to explanations", pattern: 'auditory' },
                    { id: 'c', text: "Try it hands-on", pattern: 'kinesthetic' },
                    { id: 'd', text: "Discuss it with others", pattern: 'social' }
                ]
            },
            {
                id: 2,
                text: "I remember information best when:",
                options: [
                    { id: 'a', text: "I can see it written or drawn", pattern: 'visual' },
                    { id: 'b', text: "I hear it explained", pattern: 'auditory' },
                    { id: 'c', text: "I practice it repeatedly", pattern: 'kinesthetic' },
                    { id: 'd', text: "I teach it to someone else", pattern: 'social' }
                ]
            }
        ];
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        if (sectionId === 'profile') {
            this.loadUserProfile();
        } else if (sectionId === 'results') {
            this.displayResults();
        }
    }

    startAssessment() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.displayQuestion();
        this.showSection('assessment');
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        document.getElementById('question-text').textContent = question.text;
        document.getElementById('progress').textContent = 
            `${this.currentQuestionIndex + 1} / ${this.questions.length}`;

        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = '';

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option.text;
            button.dataset.optionId = option.id;
            button.dataset.pattern = option.pattern;
            
            button.addEventListener('click', () => {
                this.selectOption(button, option);
            });

            optionsContainer.appendChild(button);
        });

        this.updateNavigationButtons();
    }

    selectOption(buttonElement, option) {
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        buttonElement.classList.add('selected');
        
        this.answers[this.currentQuestionIndex] = option;
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
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.textContent = 'Complete Assessment';
        } else {
            nextBtn.textContent = 'Next';
        }
    }

    async completeAssessment() {
        try {
            const results = await this.calculateResults();
            await this.saveResults(results);
            this.showSection('results');
        } catch (error) {
            console.error('Failed to complete assessment:', error);
        }
    }

    async calculateResults() {
        try {
            const response = await fetch('/api/calculate-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers: this.answers })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to calculate results:', error);
            return this.calculateResultsLocally();
        }
    }

    calculateResultsLocally() {
        const patterns = {};
        
        this.answers.forEach(answer => {
            if (answer && answer.pattern) {
                patterns[answer.pattern] = (patterns[answer.pattern] || 0) + 1;
            }
        });

        const totalAnswers = this.answers.length;
        const results = {};

        Object.keys(patterns).forEach(pattern => {
            results[pattern] = {
                score: Math.round((patterns[pattern] / totalAnswers) * 100),
                description: this.getPatternDescription(pattern)
            };
        });

        return results;
    }

    getPatternDescription(pattern) {
        const descriptions = {
            visual: "You learn best through visual aids like charts, diagrams, and written instructions.",
            auditory: "You prefer learning through listening, discussions, and verbal explanations.",
            kinesthetic: "You learn most effectively through hands-on experience and physical practice.",
            social: "You thrive in collaborative learning environments and group discussions."
        };
        return descriptions[pattern] || "Learning pattern not recognized.";
    }

    async saveResults(results) {
        try {
            await fetch('/api/save-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    results: results,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Failed to save results:', error);
        }
    }

    displayResults() {
        const resultsContainer = document.getElementById('results-container');
        
        if (this.answers.length === 0) {
            resultsContainer.innerHTML = '<p>Please complete the assessment first.</p>';
            return;
        }

        const results = this.calculateResultsLocally();
        let html = '<h3>Your Learning Pattern Results</h3>';

        Object.keys(results).forEach(pattern => {
            const result = results[pattern];
            html += `
                <div class="learning-pattern">
                    <div class="pattern-score">${this.capitalizeFirst(pattern)}: ${result.score}%</div>
                    <div class="pattern-description">${result.description}</div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    async loadUserProfile() {
        const profileContainer = document.getElementById('user-profile');
        try {
            const response = await fetch('/api/profile');
            const profile = await response.json();
            this.displayProfile(profile);
        } catch (error) {
            profileContainer.innerHTML = '<p>Profile information not available. Please complete an assessment first.</p>';
        }
    }

    displayProfile(profile) {
        const profileContainer = document.getElementById('user-profile');
        profileContainer.innerHTML = `
            <h3>Learning Profile</h3>
            <p><strong>Assessment Completed:</strong> ${profile.lastAssessment || 'Never'}</p>
            <p><strong>Dominant Learning Pattern:</strong> ${profile.dominantPattern || 'Not determined'}</p>
            <p><strong>Assessment Count:</strong> ${profile.assessmentCount || 0}</p>
        `;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LearningAssessmentApp();
});