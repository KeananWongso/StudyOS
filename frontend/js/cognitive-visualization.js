class CognitiveVisualization {
    constructor() {
        this.results = null;
        this.animations = new Map();
    }

    displayResults(results) {
        this.results = results;
        this.renderCognitiveStyleCard();
        this.renderDimensionsVisualization();
        this.renderLearningPathways();
        this.renderBehaviorInsights();
        this.setupInteractivity();
    }

    renderCognitiveStyleCard() {
        const styleCard = document.getElementById('cognitive-style-card');
        const fingerprint = this.results.cognitiveFingerprint;
        
        styleCard.innerHTML = `
            <div class="style-header">
                <div class="style-type">
                    <h3>${this.results.overallProfile.type}</h3>
                    <div class="confidence-badge">
                        <span>Confidence: ${fingerprint.confidence}%</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${fingerprint.confidence}%"></div>
                        </div>
                    </div>
                </div>
                <div class="processing-speed">
                    <span class="speed-label">Processing Style:</span>
                    <span class="speed-value">${fingerprint.processingSpeed}</span>
                </div>
            </div>
            
            <div class="style-description">
                <p>${fingerprint.cognitiveStyle}</p>
            </div>
            
            <div class="style-metrics">
                <div class="metric">
                    <div class="metric-icon">🎯</div>
                    <div class="metric-content">
                        <span class="metric-label">Adaptability</span>
                        <span class="metric-value">${fingerprint.adaptabilityIndex}%</span>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-content">
                        <span class="metric-label">Processing</span>
                        <span class="metric-value">${fingerprint.processingSpeed.split(' ')[0]}</span>
                    </div>
                </div>
                <div class="metric">
                    <div class="metric-icon">🧠</div>
                    <div class="metric-content">
                        <span class="metric-label">Profile</span>
                        <span class="metric-value">${this.results.overallProfile.type.split(' ')[0]}</span>
                    </div>
                </div>
            </div>
        `;

        this.addStyleCardAnimations(styleCard);
    }

    renderDimensionsVisualization() {
        const container = document.getElementById('dimensions-visualization');
        const dimensions = this.results.dimensions;
        
        container.innerHTML = `
            <div class="radar-chart-container">
                <canvas id="cognitive-radar" width="400" height="400"></canvas>
            </div>
            <div class="dimensions-list">
                ${Object.entries(dimensions).map(([dimension, data]) => 
                    this.createDimensionCard(dimension, data)
                ).join('')}
            </div>
        `;

        this.renderRadarChart(dimensions);
        this.addDimensionCardInteractivity();
    }

    createDimensionCard(dimensionName, dimensionData) {
        const primary = this.results.cognitiveFingerprint.primary[dimensionName];
        const secondary = this.results.cognitiveFingerprint.secondary[dimensionName];
        
        if (!primary) return '';

        return `
            <div class="dimension-card-detailed" data-dimension="${dimensionName}">
                <div class="dimension-header">
                    <div class="dimension-icon">${this.getDimensionIcon(dimensionName)}</div>
                    <div class="dimension-info">
                        <h4>${this.capitalizeFirst(dimensionName)}</h4>
                        <span class="confidence-score">${primary.confidence}% confidence</span>
                    </div>
                </div>
                
                <div class="dimension-patterns">
                    <div class="primary-pattern">
                        <div class="pattern-header">
                            <span class="pattern-label">Primary:</span>
                            <span class="pattern-name">${this.formatPatternName(primary.pattern)}</span>
                            <span class="pattern-score">${primary.score}%</span>
                        </div>
                        <div class="pattern-bar">
                            <div class="pattern-fill primary" style="width: ${primary.score}%"></div>
                        </div>
                        <p class="pattern-description">${primary.description}</p>
                    </div>
                    
                    ${secondary ? `
                        <div class="secondary-pattern">
                            <div class="pattern-header">
                                <span class="pattern-label">Secondary:</span>
                                <span class="pattern-name">${this.formatPatternName(secondary.pattern)}</span>
                                <span class="pattern-score">${secondary.score}%</span>
                            </div>
                            <div class="pattern-bar">
                                <div class="pattern-fill secondary" style="width: ${secondary.score}%"></div>
                            </div>
                            <p class="pattern-description">${secondary.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderRadarChart(dimensions) {
        const canvas = document.getElementById('cognitive-radar');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = 150;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get dimension scores
        const dimensionNames = Object.keys(dimensions);
        const scores = dimensionNames.map(dim => {
            const primary = this.results.cognitiveFingerprint.primary[dim];
            return primary ? primary.score : 0;
        });
        
        // Draw radar background
        this.drawRadarBackground(ctx, centerX, centerY, maxRadius, dimensionNames);
        
        // Draw data polygon
        this.drawDataPolygon(ctx, centerX, centerY, maxRadius, scores, dimensionNames);
        
        // Add dimension labels
        this.drawRadarLabels(ctx, centerX, centerY, maxRadius, dimensionNames);
    }

    drawRadarBackground(ctx, centerX, centerY, maxRadius, dimensions) {
        const numLevels = 5;
        const angleStep = (2 * Math.PI) / dimensions.length;
        
        // Draw concentric circles
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= numLevels; i++) {
            const radius = (maxRadius * i) / numLevels;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Draw radial lines
        for (let i = 0; i < dimensions.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    drawDataPolygon(ctx, centerX, centerY, maxRadius, scores, dimensions) {
        const angleStep = (2 * Math.PI) / dimensions.length;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
        
        // Draw filled polygon
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < scores.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const distance = (scores[i] / 100) * maxRadius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#6366f1';
        for (let i = 0; i < scores.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const distance = (scores[i] / 100) * maxRadius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    drawRadarLabels(ctx, centerX, centerY, maxRadius, dimensions) {
        const angleStep = (2 * Math.PI) / dimensions.length;
        const labelRadius = maxRadius + 30;
        
        ctx.fillStyle = '#374151';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < dimensions.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;
            
            const label = this.capitalizeFirst(dimensions[i]);
            ctx.fillText(label, x, y);
        }
    }

    renderLearningPathways() {
        const container = document.getElementById('learning-pathways');
        const pathways = this.results.learningPathways;
        
        container.innerHTML = `
            <div class="pathways-tabs">
                <button class="pathway-tab active" data-tab="optimal">Optimal Pathways</button>
                <button class="pathway-tab" data-tab="alternative">Alternative Approaches</button>
                <button class="pathway-tab" data-tab="development">Growth Areas</button>
            </div>
            
            <div class="pathways-content">
                <div class="pathway-panel active" data-panel="optimal">
                    ${this.renderPathwaysList(pathways.optimal, 'optimal')}
                </div>
                <div class="pathway-panel" data-panel="alternative">
                    ${this.renderPathwaysList(pathways.alternative, 'alternative')}
                </div>
                <div class="pathway-panel" data-panel="development">
                    ${this.renderDevelopmentPathways(pathways.development)}
                </div>
            </div>
        `;

        this.setupPathwayTabs();
    }

    renderPathwaysList(pathways, type) {
        if (!pathways || pathways.length === 0) {
            return '<p class="no-pathways">No specific pathways identified for this category.</p>';
        }

        return `
            <div class="pathways-list">
                ${pathways.map((pathway, index) => `
                    <div class="pathway-item ${type}" style="animation-delay: ${index * 0.1}s">
                        <div class="pathway-icon">${this.getPathwayIcon(type)}</div>
                        <div class="pathway-content">
                            <p>${pathway}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDevelopmentPathways(developmentPathways) {
        if (!developmentPathways || developmentPathways.length === 0) {
            return '<p class="no-pathways">Your cognitive profile is well-balanced across all dimensions.</p>';
        }

        return `
            <div class="development-list">
                ${developmentPathways.map((pathway, index) => `
                    <div class="development-item" style="animation-delay: ${index * 0.1}s">
                        <div class="development-header">
                            <div class="development-dimension">
                                ${this.getDimensionIcon(pathway.dimension)}
                                <span>${this.capitalizeFirst(pathway.dimension)}</span>
                            </div>
                            <div class="development-pattern">
                                ${this.formatPatternName(pathway.pattern)}
                            </div>
                        </div>
                        <p class="development-reason">${pathway.reason}</p>
                        <div class="development-activities">
                            ${pathway.activities.map(activity => `
                                <span class="activity-tag">${activity}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderBehaviorInsights() {
        const container = document.getElementById('behavior-insights');
        const behaviorAnalysis = this.results.behaviorAnalysis;
        
        if (!behaviorAnalysis || Object.keys(behaviorAnalysis).length === 0) {
            container.innerHTML = '<p>No behavioral data available.</p>';
            return;
        }

        container.innerHTML = `
            ${Object.entries(behaviorAnalysis).map(([aspect, insight]) => `
                <div class="behavior-card">
                    <div class="behavior-header">
                        <div class="behavior-icon">${this.getBehaviorIcon(aspect)}</div>
                        <h4>${this.formatBehaviorAspect(aspect)}</h4>
                    </div>
                    <p class="behavior-insight">${insight}</p>
                </div>
            `).join('')}
        `;

        this.addBehaviorCardAnimations();
    }

    setupInteractivity() {
        // Add hover effects to dimension cards
        document.querySelectorAll('.dimension-card-detailed').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightDimension(card.dataset.dimension);
            });
            
            card.addEventListener('mouseleave', () => {
                this.unhighlightDimension();
            });
        });

        // Setup export functionality
        document.getElementById('export-pdf')?.addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('share-results')?.addEventListener('click', () => {
            this.shareResults();
        });

        document.getElementById('retake-assessment')?.addEventListener('click', () => {
            this.retakeAssessment();
        });
    }

    setupPathwayTabs() {
        const tabs = document.querySelectorAll('.pathway-tab');
        const panels = document.querySelectorAll('.pathway-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active panel
                panels.forEach(p => p.classList.remove('active'));
                document.querySelector(`[data-panel="${targetPanel}"]`).classList.add('active');
            });
        });
    }

    addStyleCardAnimations(card) {
        const metrics = card.querySelectorAll('.metric');
        metrics.forEach((metric, index) => {
            metric.style.animationDelay = `${index * 0.2}s`;
            metric.classList.add('metric-animate');
        });
    }

    addDimensionCardInteractivity() {
        const cards = document.querySelectorAll('.dimension-card-detailed');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('dimension-animate');
        });
    }

    addBehaviorCardAnimations() {
        const cards = document.querySelectorAll('.behavior-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('behavior-animate');
        });
    }

    highlightDimension(dimension) {
        // Add highlighting effect to radar chart
        // This would require more complex canvas manipulation
        console.log(`Highlighting dimension: ${dimension}`);
    }

    unhighlightDimension() {
        // Remove highlighting effect
        console.log('Removing dimension highlight');
    }

    exportToPDF() {
        // Implement PDF export functionality
        alert('PDF export functionality would be implemented here');
    }

    shareResults() {
        // Implement sharing functionality
        if (navigator.share) {
            navigator.share({
                title: 'My Cognitive Assessment Results',
                text: 'Check out my cognitive fingerprint from CogniMap!',
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => alert('Results link copied to clipboard!'));
        }
    }

    retakeAssessment() {
        if (confirm('Are you sure you want to retake the assessment? This will clear your current results.')) {
            window.location.reload();
        }
    }

    getDimensionIcon(dimension) {
        const icons = {
            texture: '🌊',
            temperature: '🌡️',
            ecosystem: '🌳',
            temporal: '⏰',
            spatial: '🏗️'
        };
        return icons[dimension] || '🧠';
    }

    getPathwayIcon(type) {
        const icons = {
            optimal: '⭐',
            alternative: '🔄',
            development: '📈'
        };
        return icons[type] || '💡';
    }

    getBehaviorIcon(aspect) {
        const icons = {
            decisionMaking: '🎯',
            processingStyle: '⚡',
            attentionPattern: '👁️',
            cognitiveLoad: '🧠'
        };
        return icons[aspect] || '📊';
    }

    formatPatternName(pattern) {
        return pattern.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatBehaviorAspect(aspect) {
        const formatted = aspect.replace(/([A-Z])/g, ' $1').trim();
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Additional CSS for animations would be added to the main CSS file
const additionalCSS = `
.metric-animate {
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

.dimension-animate {
    animation: fadeInScale 0.5s ease-out forwards;
    opacity: 0;
    transform: scale(0.9);
}

.behavior-animate {
    animation: slideInLeft 0.5s ease-out forwards;
    opacity: 0;
    transform: translateX(-20px);
}

.pathway-item {
    animation: slideInRight 0.5s ease-out forwards;
    opacity: 0;
    transform: translateX(20px);
}

@keyframes slideInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInScale {
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideInLeft {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.confidence-fill {
    background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
    border-radius: inherit;
    transition: width 1s ease-out;
}

.pattern-fill.primary {
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.pattern-fill.secondary {
    background: linear-gradient(90deg, #06b6d4, #3b82f6);
}

.pathway-tab {
    padding: 8px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.pathway-tab.active {
    border-bottom-color: #6366f1;
    color: #6366f1;
}

.pathway-panel {
    display: none;
    padding-top: 20px;
}

.pathway-panel.active {
    display: block;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);