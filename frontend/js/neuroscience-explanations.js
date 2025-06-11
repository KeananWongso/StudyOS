class NeuroscienceExplanationModule {
    constructor() {
        this.brainData = null;
        this.currentExplanation = null;
        this.interactiveElements = new Map();
        this.explanationHistory = [];
    }

    async initialize() {
        await this.loadBrainData();
        this.setupInterface();
        this.initializeInteractiveElements();
    }

    async loadBrainData() {
        try {
            const response = await fetch('/data/neuroscience-context/brain-explanations.json');
            this.brainData = await response.json();
        } catch (error) {
            console.error('Failed to load neuroscience data:', error);
            this.brainData = this.getDefaultBrainData();
        }
    }

    setupInterface() {
        const container = document.getElementById('neuroscience-container');
        if (!container) return;

        container.innerHTML = `
            <div class="neuroscience-module">
                <div class="module-header">
                    <h3>Neuroscience Behind Your Cognitive Profile</h3>
                    <p class="module-description">
                        Discover the brain mechanisms underlying your cognitive patterns and 
                        evidence-based recommendations for enhancement.
                    </p>
                </div>

                <div class="brain-visualization-container">
                    <div class="brain-model">
                        <canvas id="brain-canvas" width="600" height="400"></canvas>
                        <div class="brain-controls">
                            <button class="brain-view-btn active" data-view="lateral">Lateral View</button>
                            <button class="brain-view-btn" data-view="medial">Medial View</button>
                            <button class="brain-view-btn" data-view="networks">Networks</button>
                        </div>
                    </div>
                    
                    <div class="brain-legend">
                        <h4>Brain Regions</h4>
                        <div id="brain-legend-content">
                            <!-- Populated by JavaScript -->
                        </div>
                    </div>
                </div>

                <div class="dimension-explanations">
                    <h4>Neural Foundations of Your Cognitive Dimensions</h4>
                    <div class="explanation-tabs">
                        ${Object.keys(this.brainData?.neural_foundations?.cognitive_dimensions || {}).map(dimension => `
                            <button class="explanation-tab" data-dimension="${dimension}">
                                ${this.formatDimensionName(dimension)}
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="explanation-content">
                        <div id="dimension-explanation">
                            <!-- Populated by tab selection -->
                        </div>
                    </div>
                </div>

                <div class="neuroplasticity-section">
                    <h4>Neuroplasticity and Enhancement Potential</h4>
                    <div class="plasticity-overview">
                        <div class="plasticity-timeline">
                            <h5>Enhancement Timeline</h5>
                            <div id="plasticity-timeline-viz">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                        
                        <div class="plasticity-mechanisms">
                            <h5>Plasticity Mechanisms</h5>
                            <div id="plasticity-mechanisms-viz">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="training-protocols">
                    <h4>Personalized Training Protocols</h4>
                    <div class="protocol-selector">
                        <label for="training-focus">Focus Area:</label>
                        <select id="training-focus">
                            <option value="mathematical">Mathematical Visualization</option>
                            <option value="synesthetic">Synesthetic Associations</option>
                            <option value="cognitive">Cognitive Dimensions</option>
                            <option value="integration">Cross-Modal Integration</option>
                        </select>
                    </div>
                    
                    <div id="training-protocol-content">
                        <!-- Populated by selection -->
                    </div>
                </div>

                <div class="individual-factors">
                    <h4>Individual Difference Factors</h4>
                    <div class="factors-grid">
                        <div class="factor-category">
                            <h5>Genetic Factors</h5>
                            <div id="genetic-factors">
                                ${this.renderGeneticFactors()}
                            </div>
                        </div>
                        
                        <div class="factor-category">
                            <h5>Developmental History</h5>
                            <div id="developmental-factors">
                                <div class="factor-input">
                                    <label>Musical Training:</label>
                                    <input type="range" id="musical-training" min="0" max="10" value="5">
                                    <span class="factor-value">5 years</span>
                                </div>
                                <div class="factor-input">
                                    <label>Bilingual Experience:</label>
                                    <input type="checkbox" id="bilingual"> Yes
                                </div>
                                <div class="factor-input">
                                    <label>Physical Activity Level:</label>
                                    <input type="range" id="physical-activity" min="1" max="10" value="5">
                                    <span class="factor-value">Moderate</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="factor-category">
                            <h5>Cognitive Style</h5>
                            <div id="cognitive-style-assessment">
                                <div class="style-question">
                                    <p>When looking at a complex diagram, I tend to:</p>
                                    <input type="radio" name="field-dependence" value="details"> Focus on details first
                                    <input type="radio" name="field-dependence" value="whole"> See the overall pattern first
                                </div>
                                <div class="style-question">
                                    <p>I prefer learning approaches that are:</p>
                                    <input type="radio" name="flexibility" value="consistent"> Consistent and structured
                                    <input type="radio" name="flexibility" value="varied"> Varied and flexible
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="research-citations">
                    <h4>Research Foundation</h4>
                    <div class="citation-tabs">
                        <button class="citation-tab active" data-category="plasticity">Neuroplasticity</button>
                        <button class="citation-tab" data-category="individual">Individual Differences</button>
                        <button class="citation-tab" data-category="training">Training Effectiveness</button>
                        <button class="citation-tab" data-category="integration">Cross-Modal Integration</button>
                    </div>
                    
                    <div class="citation-content">
                        <div id="research-citations-list">
                            <!-- Populated by tab selection -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.initializeDefaultView();
    }

    setupEventListeners() {
        // Brain view controls
        document.querySelectorAll('.brain-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchBrainView(e.target.dataset.view);
            });
        });

        // Dimension explanation tabs
        document.querySelectorAll('.explanation-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showDimensionExplanation(e.target.dataset.dimension);
            });
        });

        // Training protocol selector
        document.getElementById('training-focus')?.addEventListener('change', (e) => {
            this.showTrainingProtocol(e.target.value);
        });

        // Individual factors inputs
        document.getElementById('musical-training')?.addEventListener('input', (e) => {
            this.updateFactorValue(e.target, 'years');
        });

        document.getElementById('physical-activity')?.addEventListener('input', (e) => {
            this.updateActivityLevel(e.target);
        });

        // Citation tabs
        document.querySelectorAll('.citation-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showResearchCitations(e.target.dataset.category);
            });
        });

        // Cognitive style assessment
        document.querySelectorAll('input[name="field-dependence"], input[name="flexibility"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateCognitiveStyleProfile();
            });
        });
    }

    initializeDefaultView() {
        this.drawBrainModel('lateral');
        this.showDimensionExplanation('texture');
        this.showTrainingProtocol('mathematical');
        this.showResearchCitations('plasticity');
        this.renderPlasticityTimeline();
        this.renderPlasticityMechanisms();
    }

    drawBrainModel(view) {
        const canvas = document.getElementById('brain-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (view) {
            case 'lateral':
                this.drawLateralBrain(ctx);
                break;
            case 'medial':
                this.drawMedialBrain(ctx);
                break;
            case 'networks':
                this.drawNetworkView(ctx);
                break;
        }

        this.updateBrainLegend(view);
    }

    drawLateralBrain(ctx) {
        // Draw simplified lateral brain view with key regions
        const regions = [
            {name: 'Frontal Cortex', x: 100, y: 150, width: 120, height: 80, color: '#3b82f6'},
            {name: 'Parietal Cortex', x: 220, y: 120, width: 100, height: 100, color: '#10b981'},
            {name: 'Temporal Cortex', x: 150, y: 220, width: 100, height: 60, color: '#f59e0b'},
            {name: 'Occipital Cortex', x: 320, y: 140, width: 80, height: 80, color: '#ef4444'},
            {name: 'Cerebellum', x: 350, y: 250, width: 70, height: 50, color: '#8b5cf6'}
        ];

        // Draw brain outline
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(250, 180, 180, 120, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw regions
        regions.forEach(region => {
            ctx.fillStyle = region.color;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(region.x, region.y, region.width, region.height);
            
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(region.name, region.x + region.width/2, region.y + region.height/2);
        });

        // Add interaction areas
        this.addBrainInteractionAreas(regions);
    }

    drawMedialBrain(ctx) {
        // Draw sagittal (medial) brain view
        const regions = [
            {name: 'ACC', x: 200, y: 120, width: 60, height: 40, color: '#3b82f6'},
            {name: 'Hippocampus', x: 250, y: 200, width: 80, height: 30, color: '#10b981'},
            {name: 'Cerebellum', x: 350, y: 220, width: 60, height: 60, color: '#8b5cf6'},
            {name: 'Brainstem', x: 280, y: 250, width: 40, height: 80, color: '#6b7280'}
        ];

        // Draw brain outline (sagittal view)
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 150);
        ctx.quadraticCurveTo(150, 100, 250, 110);
        ctx.quadraticCurveTo(400, 120, 420, 180);
        ctx.quadraticCurveTo(410, 250, 350, 280);
        ctx.quadraticCurveTo(250, 300, 150, 280);
        ctx.quadraticCurveTo(100, 250, 100, 150);
        ctx.stroke();

        // Draw regions
        regions.forEach(region => {
            ctx.fillStyle = region.color;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(region.x, region.y, region.width, region.height);
            
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(region.name, region.x + region.width/2, region.y + region.height/2);
        });
    }

    drawNetworkView(ctx) {
        // Draw network connectivity view
        const nodes = [
            {name: 'PFC', x: 150, y: 120, size: 30, color: '#3b82f6'},
            {name: 'PAR', x: 280, y: 100, size: 25, color: '#10b981'},
            {name: 'TEMP', x: 200, y: 220, size: 25, color: '#f59e0b'},
            {name: 'OCC', x: 350, y: 150, size: 20, color: '#ef4444'},
            {name: 'HIP', x: 250, y: 180, size: 25, color: '#8b5cf6'},
            {name: 'CER', x: 380, y: 250, size: 25, color: '#6366f1'}
        ];

        const connections = [
            {from: 0, to: 1, strength: 0.8},
            {from: 0, to: 4, strength: 0.9},
            {from: 1, to: 2, strength: 0.7},
            {from: 1, to: 3, strength: 0.6},
            {from: 2, to: 4, strength: 0.8},
            {from: 4, to: 5, strength: 0.5}
        ];

        // Draw connections
        connections.forEach(conn => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            
            ctx.strokeStyle = `rgba(100, 116, 139, ${conn.strength})`;
            ctx.lineWidth = conn.strength * 5;
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.name, node.x, node.y + 4);
        });
    }

    addBrainInteractionAreas(regions) {
        // Add clickable areas for brain regions
        regions.forEach(region => {
            this.interactiveElements.set(region.name, {
                x: region.x,
                y: region.y,
                width: region.width,
                height: region.height,
                onClick: () => this.showRegionDetails(region.name)
            });
        });

        // Add click listener to canvas
        const canvas = document.getElementById('brain-canvas');
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.interactiveElements.forEach((element, name) => {
                if (x >= element.x && x <= element.x + element.width &&
                    y >= element.y && y <= element.y + element.height) {
                    element.onClick();
                }
            });
        });
    }

    showRegionDetails(regionName) {
        // Show detailed information about brain region
        const modal = document.createElement('div');
        modal.className = 'brain-region-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h4>${regionName}</h4>
                <div class="region-details">
                    ${this.getRegionDetails(regionName)}
                </div>
                <button class="close-modal">Close</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    getRegionDetails(regionName) {
        const details = {
            'Frontal Cortex': {
                function: 'Executive control, working memory, planning',
                relevance: 'Critical for cognitive flexibility and attention regulation',
                plasticity: 'High plasticity, responds well to training',
                training: 'Working memory exercises, cognitive control tasks'
            },
            'Parietal Cortex': {
                function: 'Spatial processing, attention, mathematical reasoning',
                relevance: 'Key for spatial and mathematical cognitive dimensions',
                plasticity: 'Very high plasticity for spatial skills',
                training: 'Mental rotation, spatial working memory tasks'
            },
            'Temporal Cortex': {
                function: 'Auditory processing, language, memory',
                relevance: 'Important for synesthetic associations and timing',
                plasticity: 'Moderate plasticity, sensitive to experience',
                training: 'Auditory-visual pairing, temporal pattern training'
            }
        };

        const detail = details[regionName] || {
            function: 'Multiple cognitive functions',
            relevance: 'Contributes to overall cognitive processing',
            plasticity: 'Shows experience-dependent plasticity',
            training: 'Various training approaches can enhance function'
        };

        return `
            <p><strong>Function:</strong> ${detail.function}</p>
            <p><strong>Relevance:</strong> ${detail.relevance}</p>
            <p><strong>Plasticity:</strong> ${detail.plasticity}</p>
            <p><strong>Training:</strong> ${detail.training}</p>
        `;
    }

    updateBrainLegend(view) {
        const legendContent = document.getElementById('brain-legend-content');
        if (!legendContent) return;

        const legends = {
            lateral: [
                {color: '#3b82f6', name: 'Frontal Cortex', function: 'Executive control'},
                {color: '#10b981', name: 'Parietal Cortex', function: 'Spatial processing'},
                {color: '#f59e0b', name: 'Temporal Cortex', function: 'Auditory/memory'},
                {color: '#ef4444', name: 'Occipital Cortex', function: 'Visual processing'},
                {color: '#8b5cf6', name: 'Cerebellum', function: 'Motor/timing'}
            ],
            medial: [
                {color: '#3b82f6', name: 'ACC', function: 'Cognitive control'},
                {color: '#10b981', name: 'Hippocampus', function: 'Memory formation'},
                {color: '#8b5cf6', name: 'Cerebellum', function: 'Motor learning'},
                {color: '#6b7280', name: 'Brainstem', function: 'Basic functions'}
            ],
            networks: [
                {color: '#3b82f6', name: 'PFC', function: 'Prefrontal cortex'},
                {color: '#10b981', name: 'PAR', function: 'Parietal cortex'},
                {color: '#f59e0b', name: 'TEMP', function: 'Temporal cortex'},
                {color: '#ef4444', name: 'OCC', function: 'Occipital cortex'},
                {color: '#8b5cf6', name: 'HIP', function: 'Hippocampus'},
                {color: '#6366f1', name: 'CER', function: 'Cerebellum'}
            ]
        };

        legendContent.innerHTML = legends[view].map(item => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <div class="legend-text">
                    <strong>${item.name}</strong>
                    <span>${item.function}</span>
                </div>
            </div>
        `).join('');
    }

    switchBrainView(view) {
        document.querySelectorAll('.brain-view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        this.drawBrainModel(view);
    }

    showDimensionExplanation(dimension) {
        const container = document.getElementById('dimension-explanation');
        if (!container) return;

        const dimensionData = this.brainData?.neural_foundations?.cognitive_dimensions?.[dimension];
        if (!dimensionData) return;

        container.innerHTML = `
            <div class="dimension-explanation-content">
                <h5>${this.formatDimensionName(dimension)} Dimension</h5>
                
                <div class="neural-basis">
                    <h6>Brain Regions Involved</h6>
                    <ul class="brain-regions-list">
                        ${dimensionData.brain_regions.map(region => `
                            <li class="brain-region-item">${region}</li>
                        `).join('')}
                    </ul>
                </div>

                <div class="neural-mechanisms">
                    <h6>Neural Mechanisms</h6>
                    <div class="mechanism-item">
                        <strong>Primary:</strong> ${dimensionData.neural_mechanisms.primary}
                    </div>
                    <div class="mechanism-item">
                        <strong>Secondary:</strong> ${dimensionData.neural_mechanisms.secondary}
                    </div>
                    <div class="mechanism-item">
                        <strong>Plasticity:</strong> ${dimensionData.neural_mechanisms.plasticity}
                    </div>
                </div>

                <div class="research-support">
                    <h6>Research Support</h6>
                    <div class="citation">
                        <strong>Study:</strong> ${dimensionData.research_basis.citation}
                    </div>
                    <div class="finding">
                        <strong>Finding:</strong> ${dimensionData.research_basis.finding}
                    </div>
                    <div class="implications">
                        <strong>Implications:</strong> ${dimensionData.research_basis.implications}
                    </div>
                </div>

                <div class="plasticity-potential">
                    <h6>Enhancement Potential</h6>
                    <div class="plasticity-level">
                        <strong>Level:</strong> ${Object.keys(dimensionData.neuroplasticity_potential)[0]}
                    </div>
                    <div class="plasticity-timeline">
                        <strong>Timeline:</strong> ${dimensionData.neuroplasticity_potential.timeline}
                    </div>
                    <div class="plasticity-mechanisms">
                        <strong>Mechanisms:</strong> ${dimensionData.neuroplasticity_potential.mechanisms.join(', ')}
                    </div>
                </div>
            </div>
        `;

        // Update active tab
        document.querySelectorAll('.explanation-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-dimension="${dimension}"]`).classList.add('active');
    }

    renderPlasticityTimeline() {
        const container = document.getElementById('plasticity-timeline-viz');
        if (!container) return;

        const timelineData = [
            {period: '1-2 weeks', changes: 'Initial neural adaptations', color: '#3b82f6'},
            {period: '2-6 weeks', changes: 'Synaptic strengthening', color: '#10b981'},
            {period: '6-12 weeks', changes: 'Structural changes', color: '#f59e0b'},
            {period: '3+ months', changes: 'Network optimization', color: '#ef4444'}
        ];

        container.innerHTML = `
            <div class="timeline-visualization">
                ${timelineData.map((item, index) => `
                    <div class="timeline-item" style="--delay: ${index * 0.2}s">
                        <div class="timeline-marker" style="background-color: ${item.color}"></div>
                        <div class="timeline-content">
                            <div class="timeline-period">${item.period}</div>
                            <div class="timeline-changes">${item.changes}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPlasticityMechanisms() {
        const container = document.getElementById('plasticity-mechanisms-viz');
        if (!container) return;

        const mechanisms = this.brainData?.neuroplasticity_mechanisms;
        if (!mechanisms) return;

        container.innerHTML = `
            <div class="mechanisms-grid">
                <div class="mechanism-category">
                    <h6>Synaptic Plasticity</h6>
                    <div class="mechanism-items">
                        ${Object.entries(mechanisms.synaptic_plasticity).map(([key, data]) => `
                            <div class="mechanism-item">
                                <strong>${this.formatMechanismName(key)}</strong>
                                <p>${data.description}</p>
                                <small>Timeline: ${data.timeline}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mechanism-category">
                    <h6>Structural Plasticity</h6>
                    <div class="mechanism-items">
                        ${Object.entries(mechanisms.structural_plasticity).map(([key, data]) => `
                            <div class="mechanism-item">
                                <strong>${this.formatMechanismName(key)}</strong>
                                <p>${data.description}</p>
                                <small>Timeline: ${data.timeline}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mechanism-category">
                    <h6>Network Plasticity</h6>
                    <div class="mechanism-items">
                        ${Object.entries(mechanisms.network_plasticity).map(([key, data]) => `
                            <div class="mechanism-item">
                                <strong>${this.formatMechanismName(key)}</strong>
                                <p>${data.description}</p>
                                <small>Timeline: ${data.timeline}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showTrainingProtocol(focus) {
        const container = document.getElementById('training-protocol-content');
        if (!container) return;

        const protocols = this.brainData?.training_protocols;
        if (!protocols) return;

        const protocolMap = {
            'mathematical': 'mathematical_visualization',
            'synesthetic': 'synesthetic_training',
            'cognitive': 'cognitive_dimension_training',
            'integration': 'mathematical_visualization' // Use as example for integration
        };

        const protocolKey = protocolMap[focus];
        const protocol = protocols[protocolKey];

        if (!protocol) return;

        container.innerHTML = `
            <div class="training-protocol">
                <h5>${this.formatProtocolName(focus)} Training Protocol</h5>
                
                <div class="neural-targets">
                    <h6>Neural Targets</h6>
                    <ul>
                        ${protocol.neural_targets.map(target => `<li>${target}</li>`).join('')}
                    </ul>
                </div>

                ${protocol.training_phases ? this.renderTrainingPhases(protocol.training_phases) : ''}
                ${protocol.consistency_training ? this.renderSynestheticTraining(protocol) : ''}
                ${protocol.texture_enhancement ? this.renderCognitiveDimensionTraining(protocol) : ''}

                ${protocol.neuroplasticity_optimization ? `
                    <div class="optimization-principles">
                        <h6>Optimization Principles</h6>
                        ${Object.entries(protocol.neuroplasticity_optimization).map(([key, value]) => `
                            <div class="principle-item">
                                <strong>${this.formatPrincipleName(key)}:</strong> ${value}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderTrainingPhases(phases) {
        return `
            <div class="training-phases">
                <h6>Training Phases</h6>
                ${Object.entries(phases).map(([phaseKey, phase]) => `
                    <div class="training-phase">
                        <div class="phase-header">
                            <strong>${phase.focus}</strong>
                            <span class="phase-duration">${phase.duration}</span>
                        </div>
                        <div class="phase-changes">Neural Changes: ${phase.neural_changes}</div>
                        <div class="phase-exercises">
                            <strong>Exercises:</strong>
                            <ul>
                                ${phase.exercises.map(exercise => `<li>${exercise}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSynestheticTraining(protocol) {
        return `
            <div class="synesthetic-training-phases">
                <h6>Synesthetic Training Components</h6>
                <div class="training-component">
                    <h7>Consistency Training</h7>
                    <p><strong>Objective:</strong> ${protocol.consistency_training.objective}</p>
                    <p><strong>Method:</strong> ${protocol.consistency_training.method}</p>
                    <p><strong>Timeline:</strong> ${protocol.consistency_training.timeline}</p>
                </div>
                <div class="training-component">
                    <h7>Association Strengthening</h7>
                    <p><strong>Objective:</strong> ${protocol.association_strengthening.objective}</p>
                    <p><strong>Method:</strong> ${protocol.association_strengthening.method}</p>
                    <p><strong>Timeline:</strong> ${protocol.association_strengthening.timeline}</p>
                </div>
                <div class="training-component">
                    <h7>Transfer Training</h7>
                    <p><strong>Objective:</strong> ${protocol.transfer_training.objective}</p>
                    <p><strong>Method:</strong> ${protocol.transfer_training.method}</p>
                    <p><strong>Timeline:</strong> ${protocol.transfer_training.timeline}</p>
                </div>
            </div>
        `;
    }

    renderGeneticFactors() {
        const geneticFactors = this.brainData?.individual_differences?.genetic_factors;
        if (!geneticFactors) return '<p>Genetic factor information not available.</p>';

        return Object.entries(geneticFactors).map(([gene, data]) => `
            <div class="genetic-factor">
                <div class="gene-name">${gene}</div>
                <div class="gene-role">${data.role}</div>
                <div class="gene-impact">Impact: ${data.learning_impact}</div>
                <div class="gene-implications">Training: ${data.training_implications}</div>
            </div>
        `).join('');
    }

    showResearchCitations(category) {
        const container = document.getElementById('research-citations-list');
        if (!container) return;

        // Update active tab
        document.querySelectorAll('.citation-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        const citations = this.getResearchCitations(category);
        
        container.innerHTML = `
            <div class="citations-list">
                ${citations.map(citation => `
                    <div class="citation-item">
                        <div class="citation-title">${citation.title}</div>
                        <div class="citation-authors">${citation.authors} (${citation.year})</div>
                        <div class="citation-journal">${citation.journal}</div>
                        <div class="citation-finding">
                            <strong>Key Finding:</strong> ${citation.finding}
                        </div>
                        <div class="citation-relevance">
                            <strong>Relevance:</strong> ${citation.relevance}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getResearchCitations(category) {
        const citationSets = {
            plasticity: [
                {
                    title: "Principles of neuroplasticity-based training",
                    authors: "Merzenich, M. M., Van Vleet, T. M., & Nahum, M.",
                    year: 2014,
                    journal: "Frontiers in Human Neuroscience",
                    finding: "Targeted training can drive specific neural adaptations in cortical circuits",
                    relevance: "Demonstrates that personalized training protocols can optimize brain plasticity"
                },
                {
                    title: "Training-induced plasticity in human brain networks",
                    authors: "Zatorre, R. J., Fields, R. D., & Johansen-Berg, H.",
                    year: 2012,
                    journal: "Nature Neuroscience",
                    finding: "Adult brain shows remarkable capacity for structural and functional changes",
                    relevance: "Supports the potential for cognitive enhancement through targeted training"
                }
            ],
            individual: [
                {
                    title: "Individual differences in cognitive abilities",
                    authors: "Kanai, R., & Rees, G.",
                    year: 2011,
                    journal: "Nature Reviews Neuroscience",
                    finding: "Brain structure correlates with individual cognitive differences",
                    relevance: "Explains why personalized approaches are necessary for optimal training"
                }
            ],
            training: [
                {
                    title: "Cognitive training: An evidence review",
                    authors: "Simons, D. J., et al.",
                    year: 2016,
                    journal: "Psychological Science in the Public Interest",
                    finding: "Training benefits are strongest when matched to individual profiles",
                    relevance: "Supports the approach of personalized cognitive assessment and training"
                }
            ],
            integration: [
                {
                    title: "Multisensory integration and crossmodal plasticity",
                    authors: "Driver, J., & Noesselt, T.",
                    year: 2008,
                    journal: "Current Biology",
                    finding: "Cross-modal training enhances both individual modalities and integration",
                    relevance: "Validates the inverse effectiveness principle in cognitive training"
                }
            ]
        };

        return citationSets[category] || [];
    }

    updateFactorValue(slider, unit) {
        const valueSpan = slider.nextElementSibling;
        const value = slider.value;
        valueSpan.textContent = `${value} ${unit}`;
        this.updatePersonalizationRecommendations();
    }

    updateActivityLevel(slider) {
        const valueSpan = slider.nextElementSibling;
        const levels = ['Very Low', 'Low', 'Low-Moderate', 'Moderate', 'Moderate-High', 'High', 'Very High'];
        const level = levels[Math.min(parseInt(slider.value) - 1, levels.length - 1)];
        valueSpan.textContent = level;
        this.updatePersonalizationRecommendations();
    }

    updateCognitiveStyleProfile() {
        const fieldDependence = document.querySelector('input[name="field-dependence"]:checked')?.value;
        const flexibility = document.querySelector('input[name="flexibility"]:checked')?.value;
        
        // Update recommendations based on cognitive style
        this.updatePersonalizationRecommendations();
    }

    updatePersonalizationRecommendations() {
        // This would update training recommendations based on individual factors
        // Implementation would depend on having a results container to update
        console.log('Updating personalization recommendations based on individual factors');
    }

    formatDimensionName(dimension) {
        const names = {
            texture: 'Information Texture',
            temperature: 'Learning Temperature', 
            ecosystem: 'Concept Ecosystem',
            temporal: 'Learning Rhythms',
            spatial: 'Mental Construction'
        };
        return names[dimension] || dimension;
    }

    formatMechanismName(mechanism) {
        return mechanism.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatProtocolName(protocol) {
        const names = {
            mathematical: 'Mathematical Visualization',
            synesthetic: 'Synesthetic Association',
            cognitive: 'Cognitive Dimension',
            integration: 'Cross-Modal Integration'
        };
        return names[protocol] || protocol;
    }

    formatPrincipleName(principle) {
        return principle.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    generatePersonalizedExplanation(userResults) {
        // Generate personalized neuroscience explanation based on user's assessment results
        if (!userResults) return;

        this.currentExplanation = {
            dominantDimensions: this.identifyDominantDimensions(userResults),
            neuroplasticityTargets: this.identifyNeuroplasticityTargets(userResults),
            trainingRecommendations: this.generateTrainingRecommendations(userResults),
            expectedTimelines: this.calculateExpectedTimelines(userResults)
        };

        this.displayPersonalizedExplanation();
    }

    identifyDominantDimensions(userResults) {
        // Identify user's strongest cognitive dimensions
        const cognitiveResults = userResults.cognitiveFingerprint?.primary || {};
        return Object.entries(cognitiveResults)
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 3)
            .map(([dimension, data]) => ({
                dimension,
                score: data.score,
                brainRegions: this.brainData?.neural_foundations?.cognitive_dimensions?.[dimension]?.brain_regions || []
            }));
    }

    identifyNeuroplasticityTargets(userResults) {
        // Identify areas with highest potential for improvement
        const weakDimensions = Object.entries(userResults.cognitiveFingerprint?.primary || {})
            .filter(([_, data]) => data.score < 60)
            .map(([dimension, data]) => ({
                dimension,
                score: data.score,
                improvementPotential: 100 - data.score,
                plasticityLevel: this.brainData?.neural_foundations?.cognitive_dimensions?.[dimension]?.neuroplasticity_potential
            }));

        return weakDimensions.sort((a, b) => b.improvementPotential - a.improvementPotential);
    }

    generateTrainingRecommendations(userResults) {
        // Generate specific training recommendations based on user profile
        return {
            immediate: this.getImmediateRecommendations(userResults),
            shortTerm: this.getShortTermRecommendations(userResults),
            longTerm: this.getLongTermRecommendations(userResults)
        };
    }

    calculateExpectedTimelines(userResults) {
        // Calculate expected improvement timelines based on current performance
        const basePlasticity = this.getBasePlasticityRate(userResults);
        
        return {
            initialChanges: Math.ceil(2 / basePlasticity) + ' weeks',
            significantImprovement: Math.ceil(6 / basePlasticity) + ' weeks', 
            optimalPerformance: Math.ceil(12 / basePlasticity) + ' weeks'
        };
    }

    getBasePlasticityRate(userResults) {
        // Estimate plasticity rate based on user factors
        let rate = 1.0;
        
        // Age factor (if available)
        const age = userResults.demographics?.age;
        if (age) {
            rate *= Math.max(0.7, 1.2 - (age - 20) * 0.01);
        }
        
        // Baseline performance factor
        const avgPerformance = Object.values(userResults.cognitiveFingerprint?.primary || {})
            .reduce((sum, data) => sum + data.score, 0) / 5;
        
        if (avgPerformance < 40) rate *= 1.2; // Lower baseline = higher plasticity potential
        else if (avgPerformance > 80) rate *= 0.8; // Higher baseline = ceiling effects
        
        return rate;
    }

    getDefaultBrainData() {
        return {
            neural_foundations: {
                cognitive_dimensions: {
                    texture: {
                        brain_regions: ["Somatosensory cortex", "Posterior parietal cortex"],
                        neural_mechanisms: {
                            primary: "Tactile-cognitive integration",
                            secondary: "Cross-modal texture mapping",
                            plasticity: "High adaptability"
                        },
                        research_basis: {
                            citation: "Default citation",
                            finding: "Default finding",
                            implications: "Default implications"
                        },
                        neuroplasticity_potential: {
                            high: "High plasticity",
                            mechanisms: ["Synaptic strengthening"],
                            timeline: "2-4 weeks"
                        }
                    }
                }
            },
            neuroplasticity_mechanisms: {
                synaptic_plasticity: {
                    long_term_potentiation: {
                        description: "Strengthening of synaptic connections",
                        timeline: "Minutes to hours"
                    }
                },
                structural_plasticity: {
                    dendritic_sprouting: {
                        description: "Growth of new connections",
                        timeline: "Days to weeks"
                    }
                },
                network_plasticity: {
                    functional_connectivity: {
                        description: "Network coordination improvements",
                        timeline: "Days to weeks"
                    }
                }
            },
            training_protocols: {
                mathematical_visualization: {
                    neural_targets: ["Parietal cortex", "Prefrontal cortex"],
                    training_phases: {
                        phase_1: {
                            duration: "2-4 weeks",
                            focus: "Foundation building",
                            neural_changes: "Basic pathway strengthening",
                            exercises: ["Number training", "Spatial tasks"]
                        }
                    }
                }
            },
            individual_differences: {
                genetic_factors: {
                    COMT_gene: {
                        role: "Dopamine regulation",
                        learning_impact: "Working memory",
                        training_implications: "Individual timing needs"
                    }
                }
            }
        };
    }
}

// Export for use in other modules
window.NeuroscienceExplanationModule = NeuroscienceExplanationModule;