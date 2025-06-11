class MathematicalVisualizationModule {
    constructor() {
        this.problems = [];
        this.currentProblem = 0;
        this.userResponses = [];
        this.performanceData = {
            numerical: [],
            spatial: [],
            colorCoded: [],
            crossModal: []
        };
        this.startTime = null;
        this.modalityOrder = [];
    }

    async initialize() {
        await this.loadMathProblems();
        this.setupEventListeners();
        this.generateRandomModalityOrder();
    }

    async loadMathProblems() {
        try {
            const response = await fetch('/data/mathematical-visualization/math-problems.json');
            this.problems = await response.json();
        } catch (error) {
            console.error('Failed to load math problems:', error);
            this.problems = this.getDefaultProblems();
        }
    }

    generateRandomModalityOrder() {
        // Randomize order to avoid bias - research shows order effects in multi-modal testing
        const modalities = ['numerical', 'spatial', 'colorCoded'];
        this.modalityOrder = [];
        
        for (let i = 0; i < this.problems.length; i++) {
            const shuffled = [...modalities].sort(() => Math.random() - 0.5);
            this.modalityOrder.push(shuffled);
        }
    }

    startAssessment() {
        this.currentProblem = 0;
        this.userResponses = [];
        this.performanceData = {
            numerical: [],
            spatial: [],
            colorCoded: [],
            crossModal: []
        };
        this.startTime = Date.now();
        
        this.displayProblem();
        document.getElementById('math-viz-section').classList.remove('hidden');
    }

    displayProblem() {
        if (this.currentProblem >= this.problems.length) {
            this.completeAssessment();
            return;
        }

        const problem = this.problems[this.currentProblem];
        const container = document.getElementById('math-problem-container');
        
        container.innerHTML = `
            <div class="math-problem-header">
                <h3>Mathematical Visualization ${this.currentProblem + 1} / ${this.problems.length}</h3>
                <div class="problem-category">${this.formatCategory(problem.category)}</div>
                <div class="difficulty-indicator difficulty-${problem.difficulty}">${problem.difficulty}</div>
            </div>
            
            <div class="modality-tabs">
                ${this.modalityOrder[this.currentProblem].map((modality, index) => `
                    <button class="modality-tab ${index === 0 ? 'active' : ''}" 
                            data-modality="${modality}">
                        ${this.getModalityIcon(modality)} ${this.formatModality(modality)}
                    </button>
                `).join('')}
            </div>
            
            <div class="modality-content">
                ${this.modalityOrder[this.currentProblem].map((modality, index) => `
                    <div class="modality-panel ${index === 0 ? 'active' : ''}" 
                         data-panel="${modality}">
                        ${this.renderModalityContent(problem, modality)}
                    </div>
                `).join('')}
            </div>
            
            <div class="math-response-section">
                <div class="response-inputs">
                    <label for="math-answer">Your Answer:</label>
                    <input type="text" id="math-answer" placeholder="Enter your answer">
                    <label for="confidence-level">Confidence (1-10):</label>
                    <input type="range" id="confidence-level" min="1" max="10" value="5">
                    <span id="confidence-display">5</span>
                </div>
                
                <div class="modality-ratings">
                    <h4>Rate each representation's helpfulness (1-5):</h4>
                    ${this.modalityOrder[this.currentProblem].map(modality => `
                        <div class="rating-item">
                            <label>${this.formatModality(modality)}:</label>
                            <div class="star-rating" data-modality="${modality}">
                                ${[1,2,3,4,5].map(star => `
                                    <span class="star" data-rating="${star}">★</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button id="submit-math-answer" class="btn-primary">Submit Answer</button>
            </div>
            
            <div class="research-context">
                <details>
                    <summary>Research Context</summary>
                    <div class="citation">
                        <strong>Study:</strong> ${problem.research_context.citation}
                    </div>
                    <div class="finding">
                        <strong>Finding:</strong> ${problem.research_context.finding}
                    </div>
                </details>
            </div>
        `;

        this.setupProblemInteractivity();
        this.recordModalityStartTime();
    }

    renderModalityContent(problem, modality) {
        const content = problem.problem[modality];
        
        switch (modality) {
            case 'numerical':
                return `
                    <div class="numerical-content">
                        <h4>${content.question}</h4>
                        <p class="explanation">${content.explanation}</p>
                        <div class="numerical-workspace">
                            <textarea placeholder="Show your work here..." rows="4"></textarea>
                        </div>
                    </div>
                `;
                
            case 'spatial':
                return this.renderSpatialContent(content);
                
            case 'colorCoded':
                return this.renderColorCodedContent(content);
                
            default:
                return '<p>Content not available</p>';
        }
    }

    renderSpatialContent(content) {
        const viz = content.visualization;
        
        switch (viz.type) {
            case 'tetris_blocks':
                return `
                    <div class="spatial-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="tetris-visualization" id="tetris-viz">
                            ${this.renderTetrisBlocks(viz.pattern)}
                        </div>
                    </div>
                `;
                
            case '3d_rotation':
                return `
                    <div class="spatial-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="rotation-visualization" id="rotation-viz">
                            <canvas id="rotation-canvas" width="400" height="300"></canvas>
                            <div class="rotation-controls">
                                <input type="range" id="rotation-slider" min="0" max="360" value="0">
                                <span id="rotation-value">0°</span>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'proportional_blocks':
                return `
                    <div class="spatial-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="proportional-visualization" id="proportional-viz">
                            ${this.renderProportionalBlocks(viz)}
                        </div>
                    </div>
                `;
                
            case 'function_machine':
                return `
                    <div class="spatial-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="function-machine" id="function-machine">
                            ${this.renderFunctionMachine(viz.machine_design)}
                        </div>
                    </div>
                `;
                
            case 'probability_grid':
                return `
                    <div class="spatial-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="probability-grid" id="probability-grid">
                            ${this.renderProbabilityGrid()}
                        </div>
                    </div>
                `;
                
            case 'interactive_graph':
                return `
                    <div class="spatial-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="graph-visualization" id="graph-viz">
                            <canvas id="graph-canvas" width="500" height="400"></canvas>
                        </div>
                    </div>
                `;
                
            default:
                return '<div class="spatial-placeholder">Spatial visualization loading...</div>';
        }
    }

    renderColorCodedContent(content) {
        const viz = content.visualization;
        
        switch (viz.type) {
            case 'color_gradient':
                return `
                    <div class="color-coded-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="color-gradient-viz">
                            ${viz.pattern.map((item, index) => `
                                <div class="gradient-item">
                                    <div class="color-block" 
                                         style="background-color: hsl(${item.hue}, 70%, ${item.intensity === '?' ? 50 : item.intensity * 100}%)">
                                        ${item.value}
                                    </div>
                                    <div class="intensity-label">${item.intensity === '?' ? '?' : Math.round(item.intensity * 100)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
            case 'color_conservation':
                return `
                    <div class="color-coded-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="color-conservation-viz">
                            <div class="conservation-demo">
                                <div class="original-shape" style="background-color: ${viz.color_map.original_area}">
                                    Original Square
                                </div>
                                <div class="transformation-arrow" style="color: ${viz.color_map.visual_change}">
                                    ↻ Rotate 45°
                                </div>
                                <div class="rotated-shape" style="background-color: ${viz.color_map.rotated_area}">
                                    Rotated Diamond
                                </div>
                                <div class="conservation-note" style="color: ${viz.color_map.conservation_principle}">
                                    Area Conserved!
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'intensity_mapping':
                return `
                    <div class="color-coded-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="intensity-mapping-viz">
                            ${Object.entries(viz.ratio_visualization).map(([key, value]) => `
                                <div class="ratio-item">
                                    <div class="apple-representation" 
                                         style="background-color: ${viz.base_color}; 
                                                opacity: ${value.intensity === '?' ? 0.5 : value.intensity}">
                                        ${key.replace('_', ' ')}
                                    </div>
                                    <div class="cost-label">${value.cost_representation}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
            case 'color_flow':
                return `
                    <div class="color-coded-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="color-flow-viz">
                            ${viz.flow_stages.map((stage, index) => `
                                <div class="flow-stage">
                                    <div class="stage-box" style="background-color: ${stage.color}">
                                        ${stage.value}
                                    </div>
                                    <div class="stage-label">${stage.stage.replace('_', ' ')}</div>
                                    ${index < viz.flow_stages.length - 1 ? '<div class="flow-arrow">→</div>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
            case 'probability_heatmap':
                return `
                    <div class="color-coded-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="probability-heatmap-viz">
                            ${this.renderProbabilityHeatmap(viz.color_scheme)}
                        </div>
                    </div>
                `;
                
            case 'statistical_color_coding':
                return `
                    <div class="color-coded-content">
                        <h4>${content.question}</h4>
                        <p>${content.description}</p>
                        <div class="statistical-viz">
                            ${this.renderStatisticalColorCoding(viz.color_meanings)}
                        </div>
                    </div>
                `;
                
            default:
                return '<div class="color-placeholder">Color visualization loading...</div>';
        }
    }

    renderTetrisBlocks(pattern) {
        return pattern.map((block, index) => `
            <div class="tetris-block ${block.shape.toLowerCase()}" 
                 style="background-color: ${block.color}; 
                        width: ${block.size === '?' ? 127 : block.size * 5}px; 
                        height: ${block.size === '?' ? 127 : block.size * 5}px;">
                <span class="block-size">${block.size}</span>
            </div>
        `).join('');
    }

    renderProportionalBlocks(viz) {
        return `
            <div class="proportion-base">
                <div class="apple-group">
                    ${Array(viz.base_ratio.items).fill().map(() => 
                        '<div class="apple">🍎</div>'
                    ).join('')}
                </div>
                <div class="cost-display">$${viz.base_ratio.cost}</div>
            </div>
            <div class="proportion-target">
                <div class="apple-group">
                    ${Array(viz.target_items).fill().map(() => 
                        '<div class="apple">🍎</div>'
                    ).join('')}
                </div>
                <div class="cost-display unknown">$?</div>
            </div>
        `;
    }

    renderFunctionMachine(design) {
        return `
            <div class="machine-flow">
                <div class="input-box">${design.input}</div>
                <div class="machine-box">
                    <div class="operation">×${design.first_transformation.multiply}</div>
                    <div class="operation">+${design.first_transformation.add}</div>
                </div>
                <div class="intermediate-box">${design.intermediate_result}</div>
                <div class="machine-box">
                    <div class="operation">×${design.second_transformation.multiply}</div>
                    <div class="operation">+${design.second_transformation.add}</div>
                </div>
                <div class="output-box">${design.final_output}</div>
            </div>
        `;
    }

    renderProbabilityGrid() {
        let gridHTML = '<div class="dice-grid">';
        for (let i = 1; i <= 6; i++) {
            for (let j = 1; j <= 6; j++) {
                const sum = i + j;
                const isTarget = sum === 7;
                gridHTML += `
                    <div class="dice-cell ${isTarget ? 'target-sum' : ''}" 
                         data-sum="${sum}">
                        <div class="dice-pair">
                            <span class="die">${i}</span>
                            <span class="die">${j}</span>
                        </div>
                        <div class="sum">${sum}</div>
                    </div>
                `;
            }
        }
        gridHTML += '</div>';
        return gridHTML;
    }

    renderProbabilityHeatmap(colorScheme) {
        const sums = {};
        for (let i = 1; i <= 6; i++) {
            for (let j = 1; j <= 6; j++) {
                const sum = i + j;
                sums[sum] = (sums[sum] || 0) + 1;
            }
        }

        return Object.entries(sums).map(([sum, count]) => {
            let colorClass = 'low-probability';
            if (count === 1) colorClass = 'impossible';
            else if (count <= 2) colorClass = 'low-probability';
            else if (count <= 4) colorClass = 'medium-probability';
            else if (count <= 5) colorClass = 'high-probability';
            else colorClass = 'most-likely';

            return `
                <div class="heatmap-cell ${colorClass}">
                    <div class="sum-value">${sum}</div>
                    <div class="probability">${count}/36</div>
                </div>
            `;
        }).join('');
    }

    renderStatisticalColorCoding(colorMeanings) {
        const data = [2, 4, 6, 8, 10];
        const mean = 6;
        const median = 6;

        return `
            <div class="data-visualization">
                <div class="data-points">
                    ${data.map(value => `
                        <div class="data-point" style="background-color: ${colorMeanings.data_points}">
                            ${value}
                        </div>
                    `).join('')}
                </div>
                <div class="statistical-measures">
                    <div class="measure" style="color: ${colorMeanings.mean}">
                        Mean: ${mean}
                    </div>
                    <div class="measure" style="color: ${colorMeanings.median}">
                        Median: ${median}
                    </div>
                    <div class="trend-line" style="background-color: ${colorMeanings.trend_line}">
                        Trend: Linear Increase
                    </div>
                </div>
            </div>
        `;
    }

    setupProblemInteractivity() {
        // Setup modality tabs
        document.querySelectorAll('.modality-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchModality(e.target.dataset.modality);
            });
        });

        // Setup confidence slider
        const confidenceSlider = document.getElementById('confidence-level');
        const confidenceDisplay = document.getElementById('confidence-display');
        confidenceSlider.addEventListener('input', (e) => {
            confidenceDisplay.textContent = e.target.value;
        });

        // Setup star ratings
        document.querySelectorAll('.star-rating').forEach(rating => {
            const stars = rating.querySelectorAll('.star');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    this.setStarRating(rating.dataset.modality, index + 1);
                    this.updateStarDisplay(rating, index + 1);
                });
            });
        });

        // Setup submit button
        document.getElementById('submit-math-answer').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Initialize interactive visualizations
        this.initializeInteractiveElements();
    }

    switchModality(modality) {
        // Track modality switch for analysis
        this.recordModalitySwitch(modality);

        // Update tabs
        document.querySelectorAll('.modality-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-modality="${modality}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.modality-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`[data-panel="${modality}"]`).classList.add('active');
    }

    recordModalityStartTime() {
        this.currentModalityStartTime = Date.now();
        this.modalityTimes = {};
    }

    recordModalitySwitch(modality) {
        const currentTime = Date.now();
        if (!this.modalityTimes[modality]) {
            this.modalityTimes[modality] = 0;
        }
        this.currentModalityStartTime = currentTime;
    }

    setStarRating(modality, rating) {
        if (!this.currentRatings) {
            this.currentRatings = {};
        }
        this.currentRatings[modality] = rating;
    }

    updateStarDisplay(ratingElement, rating) {
        const stars = ratingElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('filled', index < rating);
        });
    }

    submitAnswer() {
        const answer = document.getElementById('math-answer').value;
        const confidence = parseInt(document.getElementById('confidence-level').value);
        const ratings = this.currentRatings || {};

        if (!answer.trim()) {
            alert('Please enter an answer before submitting.');
            return;
        }

        const responseData = {
            problemId: this.problems[this.currentProblem].id,
            answer: answer,
            confidence: confidence,
            modalityRatings: ratings,
            responseTime: Date.now() - this.currentModalityStartTime,
            modalityTimes: this.modalityTimes,
            correct: this.checkAnswer(answer)
        };

        this.userResponses.push(responseData);
        this.currentProblem++;
        this.currentRatings = {};
        this.displayProblem();
    }

    checkAnswer(userAnswer) {
        const correctAnswer = this.problems[this.currentProblem].answer;
        
        // Handle different answer formats
        if (typeof correctAnswer === 'number') {
            return Math.abs(parseFloat(userAnswer) - correctAnswer) < 0.01;
        } else if (typeof correctAnswer === 'string') {
            return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        } else if (typeof correctAnswer === 'object') {
            // Handle complex answers like {mean: 6, trend: "linear_increase"}
            try {
                const userObj = JSON.parse(userAnswer);
                return Object.keys(correctAnswer).every(key => 
                    userObj[key] === correctAnswer[key]
                );
            } catch {
                return false;
            }
        }
        return false;
    }

    completeAssessment() {
        this.calculatePerformanceMetrics();
        this.displayResults();
    }

    calculatePerformanceMetrics() {
        // Calculate performance across modalities
        const modalityPerformance = {
            numerical: this.calculateModalityScore('numerical'),
            spatial: this.calculateModalityScore('spatial'),
            colorCoded: this.calculateModalityScore('colorCoded')
        };

        // Calculate inverse effectiveness (cross-modal improvement)
        this.inverseEffectiveness = this.calculateInverseEffectiveness();

        // Determine preferred modality
        this.preferredModality = Object.entries(modalityPerformance)
            .reduce((a, b) => modalityPerformance[a[0]] > modalityPerformance[b[0]] ? a : b)[0];
    }

    calculateModalityScore(modality) {
        const responses = this.userResponses.filter(r => r.modalityRatings[modality]);
        if (responses.length === 0) return 0;

        const avgRating = responses.reduce((sum, r) => sum + r.modalityRatings[modality], 0) / responses.length;
        const avgCorrectness = responses.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0) / responses.length;
        
        return (avgRating + avgCorrectness * 5) / 2; // Combined rating and performance score
    }

    calculateInverseEffectiveness() {
        // Measure how much cross-modal cues improve performance
        const singleModalityPerf = this.userResponses.filter(r => 
            Object.keys(r.modalityRatings).length === 1
        );
        const multiModalityPerf = this.userResponses.filter(r => 
            Object.keys(r.modalityRatings).length > 1
        );

        if (singleModalityPerf.length === 0 || multiModalityPerf.length === 0) {
            return 0;
        }

        const singleAvg = singleModalityPerf.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0) / singleModalityPerf.length;
        const multiAvg = multiModalityPerf.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0) / multiModalityPerf.length;

        return ((multiAvg - singleAvg) / singleAvg) * 100; // Percentage improvement
    }

    displayResults() {
        const resultsContainer = document.getElementById('math-viz-results');
        
        resultsContainer.innerHTML = `
            <div class="math-viz-results-content">
                <h3>Mathematical Visualization Assessment Results</h3>
                
                <div class="performance-summary">
                    <div class="modality-scores">
                        <h4>Modality Performance</h4>
                        <div class="score-item">
                            <span>Numerical:</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${this.calculateModalityScore('numerical') * 10}%"></div>
                            </div>
                            <span>${this.calculateModalityScore('numerical').toFixed(1)}/10</span>
                        </div>
                        <div class="score-item">
                            <span>Spatial:</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${this.calculateModalityScore('spatial') * 10}%"></div>
                            </div>
                            <span>${this.calculateModalityScore('spatial').toFixed(1)}/10</span>
                        </div>
                        <div class="score-item">
                            <span>Color-Coded:</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${this.calculateModalityScore('colorCoded') * 10}%"></div>
                            </div>
                            <span>${this.calculateModalityScore('colorCoded').toFixed(1)}/10</span>
                        </div>
                    </div>
                    
                    <div class="inverse-effectiveness">
                        <h4>Cross-Modal Enhancement</h4>
                        <div class="effectiveness-score ${this.inverseEffectiveness > 0 ? 'positive' : 'negative'}">
                            ${this.inverseEffectiveness > 0 ? '+' : ''}${this.inverseEffectiveness.toFixed(1)}%
                        </div>
                        <p class="effectiveness-explanation">
                            ${this.inverseEffectiveness > 0 ? 
                                'Multi-modal presentations improve your performance!' : 
                                'You perform best with single modality presentations.'}
                        </p>
                    </div>
                    
                    <div class="preferred-modality">
                        <h4>Preferred Mathematical Representation</h4>
                        <div class="modality-preference">
                            ${this.getModalityIcon(this.preferredModality)} 
                            ${this.formatModality(this.preferredModality)}
                        </div>
                    </div>
                </div>
                
                <div class="research-insights">
                    <h4>Research-Based Insights</h4>
                    <div class="insight-cards">
                        ${this.generateResearchInsights()}
                    </div>
                </div>
            </div>
        `;

        resultsContainer.classList.remove('hidden');
    }

    generateResearchInsights() {
        const insights = [];
        
        if (this.preferredModality === 'spatial') {
            insights.push(`
                <div class="insight-card">
                    <h5>Spatial-Mathematical Strength</h5>
                    <p>Research shows that individuals with strong spatial-mathematical preferences often excel in STEM fields. Consider exploring careers in engineering, architecture, or data visualization.</p>
                    <cite>Wai, J., Lubinski, D., & Benbow, C. P. (2009). Spatial ability for STEM domains. Journal of Educational Psychology, 101(4), 817-835.</cite>
                </div>
            `);
        }

        if (this.inverseEffectiveness > 20) {
            insights.push(`
                <div class="insight-card">
                    <h5>Cross-Modal Integration</h5>
                    <p>Your significant improvement with multiple representations suggests strong cross-modal integration abilities. This is linked to enhanced problem-solving and creativity.</p>
                    <cite>Shams, L., & Seitz, A. R. (2008). Benefits of multisensory learning. Trends in Cognitive Sciences, 12(11), 411-417.</cite>
                </div>
            `);
        }

        if (this.calculateModalityScore('colorCoded') > 7) {
            insights.push(`
                <div class="insight-card">
                    <h5>Color-Cognitive Processing</h5>
                    <p>Your strong performance with color-coded representations indicates enhanced visuospatial working memory. This can be leveraged for learning complex systems and data analysis.</p>
                    <cite>Elliot, A. J., & Maier, M. A. (2014). Color psychology: Effects of perceiving color on psychological functioning. Annual Review of Psychology, 65, 95-120.</cite>
                </div>
            `);
        }

        return insights.join('');
    }

    getModalityIcon(modality) {
        const icons = {
            numerical: '🔢',
            spatial: '🧊',
            colorCoded: '🌈'
        };
        return icons[modality] || '📊';
    }

    formatModality(modality) {
        const formats = {
            numerical: 'Numerical',
            spatial: 'Spatial',
            colorCoded: 'Color-Coded'
        };
        return formats[modality] || modality;
    }

    formatCategory(category) {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    initializeInteractiveElements() {
        // Initialize any canvas-based visualizations
        const rotationCanvas = document.getElementById('rotation-canvas');
        if (rotationCanvas) {
            this.initializeRotationVisualization(rotationCanvas);
        }

        const graphCanvas = document.getElementById('graph-canvas');
        if (graphCanvas) {
            this.initializeGraphVisualization(graphCanvas);
        }
    }

    initializeRotationVisualization(canvas) {
        const ctx = canvas.getContext('2d');
        const slider = document.getElementById('rotation-slider');
        const valueDisplay = document.getElementById('rotation-value');

        const drawSquare = (angle) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const size = 60;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle * Math.PI / 180);
            
            // Draw square
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(-size/2, -size/2, size, size);
            
            // Draw area label
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('16', 0, 5);
            
            ctx.restore();
        };

        slider.addEventListener('input', (e) => {
            const angle = parseInt(e.target.value);
            valueDisplay.textContent = `${angle}°`;
            drawSquare(angle);
        });

        // Initial draw
        drawSquare(0);
    }

    initializeGraphVisualization(canvas) {
        const ctx = canvas.getContext('2d');
        const data = [2, 4, 6, 8, 10];
        
        const drawGraph = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw axes
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, canvas.height - 50);
            ctx.lineTo(canvas.width - 50, canvas.height - 50);
            ctx.moveTo(50, 50);
            ctx.lineTo(50, canvas.height - 50);
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#3b82f6';
            data.forEach((value, index) => {
                const x = 50 + (index + 1) * 80;
                const y = canvas.height - 50 - (value * 25);
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                // Label
                ctx.fillStyle = '#374151';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(value.toString(), x, y - 15);
                ctx.fillStyle = '#3b82f6';
            });
            
            // Draw trend line
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(50 + 80, canvas.height - 50 - (2 * 25));
            ctx.lineTo(50 + 80 * 5, canvas.height - 50 - (10 * 25));
            ctx.stroke();
        };

        drawGraph();
    }

    getDefaultProblems() {
        return [
            {
                id: "default_problem",
                category: "pattern_recognition",
                difficulty: "medium",
                problem: {
                    numerical: {
                        question: "Find the next number: 2, 4, 8, 16, ?",
                        explanation: "Each number doubles the previous one"
                    },
                    spatial: {
                        question: "Complete the visual pattern",
                        description: "Growing squares representing the doubling pattern",
                        visualization: { type: "default" }
                    },
                    colorCoded: {
                        question: "Follow the color intensity pattern",
                        description: "Colors double in intensity",
                        visualization: { type: "default" }
                    }
                },
                answer: 32,
                research_context: {
                    citation: "Example Study (2024)",
                    finding: "Multi-modal mathematical representations improve understanding"
                }
            }
        ];
    }
}

// Export for use in other modules
window.MathematicalVisualizationModule = MathematicalVisualizationModule;