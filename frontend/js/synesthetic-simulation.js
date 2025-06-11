class SynestheticSimulationModule {
    constructor() {
        this.associations = new Map();
        this.simulationData = [];
        this.activeSimulations = new Set();
        this.consistencyScores = new Map();
        this.crossModalMappings = {
            'number-color': new Map(),
            'letter-color': new Map(),
            'sound-color': new Map(),
            'texture-color': new Map(),
            'taste-color': new Map(),
            'temperature-color': new Map(),
            'weekday-color': new Map(),
            'month-color': new Map()
        };
        this.simulationResults = {
            consistency: 0,
            strength: 0,
            types: [],
            processing_advantages: []
        };
    }

    async initialize() {
        this.setupInterface();
        this.loadResearchData();
        this.initializeAudioContext();
    }

    setupInterface() {
        const container = document.getElementById('synesthetic-container');
        if (!container) return;

        container.innerHTML = `
            <div class="synesthetic-module">
                <div class="module-header">
                    <h3>Synesthetic Association Assessment</h3>
                    <p class="module-description">
                        Explore your cross-sensory connections and create custom sensory associations.
                        Research shows that synesthetic-like processing can enhance memory and creativity.
                    </p>
                </div>

                <div class="synesthetic-tabs">
                    <button class="syn-tab active" data-tab="number-color">Numbers → Colors</button>
                    <button class="syn-tab" data-tab="letter-color">Letters → Colors</button>
                    <button class="syn-tab" data-tab="sound-color">Sounds → Colors</button>
                    <button class="syn-tab" data-tab="texture-color">Textures → Colors</button>
                    <button class="syn-tab" data-tab="concept-space">Concepts → Space</button>
                    <button class="syn-tab" data-tab="time-space">Time → Space</button>
                </div>

                <div class="synesthetic-content">
                    ${this.renderNumberColorTab()}
                    ${this.renderLetterColorTab()}
                    ${this.renderSoundColorTab()}
                    ${this.renderTextureColorTab()}
                    ${this.renderConceptSpaceTab()}
                    ${this.renderTimeSpaceTab()}
                </div>

                <div class="consistency-testing">
                    <h4>Consistency Testing</h4>
                    <p>We'll test your associations multiple times to measure consistency - a key marker of synesthetic processing.</p>
                    <button id="start-consistency-test" class="btn-primary">Start Consistency Test</button>
                    <div id="consistency-results" class="hidden"></div>
                </div>

                <div class="simulation-results">
                    <h4>Your Synesthetic Profile</h4>
                    <div id="synesthetic-profile" class="profile-display"></div>
                </div>

                <div class="research-context">
                    <details>
                        <summary>Research Background</summary>
                        <div class="research-content">
                            <h5>Synesthesia and Cognitive Enhancement</h5>
                            <p>Research by Rothen & Meier (2010) shows that synesthetes often have enhanced memory, creativity, and cross-modal processing abilities. Even non-synesthetes can benefit from synesthetic-like associations.</p>
                            
                            <h5>Types of Synesthesia Simulated</h5>
                            <ul>
                                <li><strong>Chromesthesia:</strong> Sound → Color associations</li>
                                <li><strong>Grapheme-Color:</strong> Letters/Numbers → Color associations</li>
                                <li><strong>Spatial Sequence:</strong> Time/Numbers arranged in space</li>
                                <li><strong>Lexical-Gustatory:</strong> Words → Taste associations</li>
                            </ul>
                            
                            <h5>Applications</h5>
                            <p>Understanding your cross-modal processing can improve memory techniques, creative thinking, and learning strategies across domains.</p>
                        </div>
                    </details>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderNumberColorTab() {
        return `
            <div class="syn-panel active" data-panel="number-color">
                <h4>Number-Color Associations</h4>
                <p>For each number, choose the color that feels most natural or comes to mind first.</p>
                
                <div class="number-grid">
                    ${Array.from({length: 10}, (_, i) => `
                        <div class="number-item" data-number="${i}">
                            <div class="number-display">${i}</div>
                            <div class="color-picker-container">
                                <input type="color" id="color-${i}" class="color-picker" data-number="${i}">
                                <div class="color-intensity">
                                    <label>Intensity:</label>
                                    <input type="range" min="1" max="10" value="5" class="intensity-slider" data-number="${i}">
                                    <span class="intensity-value">5</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="association-strength">
                    <h5>How strong are these color associations?</h5>
                    <div class="strength-scale">
                        <input type="range" min="1" max="7" value="4" id="number-color-strength">
                        <div class="scale-labels">
                            <span>No association</span>
                            <span>Weak</span>
                            <span>Moderate</span>
                            <span>Strong</span>
                            <span>Automatic</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLetterColorTab() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return `
            <div class="syn-panel" data-panel="letter-color">
                <h4>Letter-Color Associations</h4>
                <p>What colors do you associate with each letter of the alphabet?</p>
                
                <div class="letter-grid">
                    ${letters.map(letter => `
                        <div class="letter-item" data-letter="${letter}">
                            <div class="letter-display">${letter}</div>
                            <input type="color" class="color-picker" data-letter="${letter}">
                            <div class="vividness-rating">
                                <label>Vividness:</label>
                                <input type="range" min="1" max="5" value="3" class="vividness-slider" data-letter="${letter}">
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="pattern-analysis">
                    <button id="analyze-letter-patterns" class="btn-secondary">Analyze Letter Patterns</button>
                    <div id="letter-pattern-results" class="pattern-results"></div>
                </div>
            </div>
        `;
    }

    renderSoundColorTab() {
        return `
            <div class="syn-panel" data-panel="sound-color">
                <h4>Sound-Color Associations (Chromesthesia)</h4>
                <p>Listen to different sounds and choose the colors you associate with them.</p>
                
                <div class="sound-test-grid">
                    ${this.generateSoundTests().map((sound, index) => `
                        <div class="sound-item" data-sound="${sound.type}">
                            <div class="sound-info">
                                <h5>${sound.name}</h5>
                                <p>${sound.description}</p>
                            </div>
                            <div class="sound-controls">
                                <button class="play-sound" data-frequency="${sound.frequency}" data-type="${sound.type}">
                                    ▶️ Play
                                </button>
                                <button class="stop-sound">⏹️ Stop</button>
                            </div>
                            <div class="color-response">
                                <input type="color" class="color-picker" data-sound="${sound.type}">
                                <div class="color-properties">
                                    <label>Brightness:</label>
                                    <input type="range" min="1" max="10" value="5" class="brightness-slider" data-sound="${sound.type}">
                                    <label>Saturation:</label>
                                    <input type="range" min="1" max="10" value="5" class="saturation-slider" data-sound="${sound.type}">
                                </div>
                                <div class="immediacy-rating">
                                    <label>How immediate was this color association?</label>
                                    <input type="range" min="1" max="5" value="3" class="immediacy-slider" data-sound="${sound.type}">
                                    <div class="immediacy-labels">
                                        <span>Slow</span>
                                        <span>Immediate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderTextureColorTab() {
        return `
            <div class="syn-panel" data-panel="texture-color">
                <h4>Texture-Color Associations</h4>
                <p>What colors do you associate with different textures and tactile sensations?</p>
                
                <div class="texture-grid">
                    ${this.generateTextureTests().map(texture => `
                        <div class="texture-item" data-texture="${texture.type}">
                            <div class="texture-visual" style="background-image: ${texture.pattern}">
                                <div class="texture-overlay">${texture.name}</div>
                            </div>
                            <p class="texture-description">${texture.description}</p>
                            <div class="texture-response">
                                <input type="color" class="color-picker" data-texture="${texture.type}">
                                <div class="texture-properties">
                                    <label>Temperature Association:</label>
                                    <input type="range" min="1" max="7" value="4" class="temp-slider" data-texture="${texture.type}">
                                    <div class="temp-labels">
                                        <span>Cold</span>
                                        <span>Neutral</span>
                                        <span>Warm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderConceptSpaceTab() {
        return `
            <div class="syn-panel" data-panel="concept-space">
                <h4>Concept-Space Associations</h4>
                <p>Where do abstract concepts exist in space around you?</p>
                
                <div class="spatial-mapping-container">
                    <div class="spatial-canvas-container">
                        <canvas id="concept-space-canvas" width="500" height="400"></canvas>
                        <div class="spatial-instructions">
                            Click to place concepts in your mental space
                        </div>
                    </div>
                    
                    <div class="concept-list">
                        <h5>Place these concepts:</h5>
                        ${['Mathematics', 'Music', 'Love', 'Anger', 'Past', 'Future', 'Truth', 'Beauty', 'Fear', 'Joy'].map(concept => `
                            <div class="concept-item" draggable="true" data-concept="${concept}">
                                <span class="concept-name">${concept}</span>
                                <div class="concept-properties">
                                    <label>Distance:</label>
                                    <input type="range" min="1" max="10" value="5" class="distance-slider" data-concept="${concept}">
                                    <label>Size:</label>
                                    <input type="range" min="1" max="10" value="5" class="size-slider" data-concept="${concept}">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderTimeSpaceTab() {
        return `
            <div class="syn-panel" data-panel="time-space">
                <h4>Time-Space Associations</h4>
                <p>How do you visualize time periods in space? Many people have consistent spatial arrangements for time.</p>
                
                <div class="time-mapping">
                    <div class="time-category">
                        <h5>Days of the Week</h5>
                        <div class="time-canvas-container">
                            <canvas id="weekday-canvas" width="400" height="300"></canvas>
                        </div>
                        <div class="weekday-controls">
                            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
                                <button class="time-item" data-day="${day}">${day}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="time-category">
                        <h5>Months of the Year</h5>
                        <div class="time-canvas-container">
                            <canvas id="month-canvas" width="400" height="300"></canvas>
                        </div>
                        <div class="month-controls">
                            ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => `
                                <button class="time-item" data-month="${month}">${month}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="time-properties">
                        <h5>Temporal Properties</h5>
                        <div class="property-item">
                            <label>How vivid is your time-space visualization?</label>
                            <input type="range" min="1" max="7" value="4" id="time-vividness">
                            <div class="scale-labels">
                                <span>Not at all</span>
                                <span>Extremely vivid</span>
                            </div>
                        </div>
                        <div class="property-item">
                            <label>Is your time arrangement consistent?</label>
                            <input type="range" min="1" max="7" value="4" id="time-consistency">
                            <div class="scale-labels">
                                <span>Changes often</span>
                                <span>Always the same</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSoundTests() {
        return [
            {
                name: "Low Frequency",
                type: "low_freq",
                frequency: 200,
                description: "Deep, bass-like tone"
            },
            {
                name: "Mid Frequency",
                type: "mid_freq", 
                frequency: 800,
                description: "Middle range tone"
            },
            {
                name: "High Frequency",
                type: "high_freq",
                frequency: 2000,
                description: "High, piercing tone"
            },
            {
                name: "Rising Tone",
                type: "rising",
                frequency: "sweep_up",
                description: "Tone that rises in pitch"
            },
            {
                name: "Falling Tone",
                type: "falling",
                frequency: "sweep_down", 
                description: "Tone that falls in pitch"
            },
            {
                name: "Percussive",
                type: "percussive",
                frequency: "noise_burst",
                description: "Sharp, drum-like sound"
            }
        ];
    }

    generateTextureTests() {
        return [
            {
                name: "Smooth",
                type: "smooth",
                description: "Like silk or polished marble",
                pattern: "linear-gradient(45deg, #f0f0f0 25%, transparent 25%)"
            },
            {
                name: "Rough",
                type: "rough", 
                description: "Like sandpaper or tree bark",
                pattern: "repeating-conic-gradient(#8b7355 0deg 25deg, #a0895f 25deg 50deg)"
            },
            {
                name: "Soft",
                type: "soft",
                description: "Like cotton or fur",
                pattern: "radial-gradient(circle, #fff 2px, transparent 2px)"
            },
            {
                name: "Sharp",
                type: "sharp",
                description: "Like broken glass or thorns", 
                pattern: "polygon(50% 0%, 0% 100%, 100% 100%)"
            },
            {
                name: "Liquid",
                type: "liquid",
                description: "Like water or oil",
                pattern: "linear-gradient(45deg, rgba(0,100,200,0.3), rgba(0,150,255,0.7))"
            },
            {
                name: "Metallic",
                type: "metallic",
                description: "Like steel or aluminum",
                pattern: "linear-gradient(135deg, #c0c0c0, #808080, #c0c0c0)"
            }
        ];
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.syn-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Color picker changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('color-picker')) {
                this.recordAssociation(e.target);
            }
        });

        // Play sound buttons
        document.querySelectorAll('.play-sound').forEach(button => {
            button.addEventListener('click', (e) => {
                this.playTestSound(e.target.dataset.frequency, e.target.dataset.type);
            });
        });

        // Stop sound buttons
        document.querySelectorAll('.stop-sound').forEach(button => {
            button.addEventListener('click', () => {
                this.stopAllSounds();
            });
        });

        // Consistency test
        document.getElementById('start-consistency-test')?.addEventListener('click', () => {
            this.startConsistencyTest();
        });

        // Spatial mapping
        this.setupSpatialMapping();

        // Real-time analysis triggers
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('intensity-slider') || 
                e.target.classList.contains('vividness-slider') ||
                e.target.classList.contains('immediacy-slider')) {
                this.updateRealTimeAnalysis();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.syn-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels  
        document.querySelectorAll('.syn-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`[data-panel="${tabName}"]`).classList.add('active');

        // Initialize tab-specific features
        this.initializeTabFeatures(tabName);
    }

    initializeTabFeatures(tabName) {
        switch(tabName) {
            case 'concept-space':
                this.initializeConceptSpaceCanvas();
                break;
            case 'time-space':
                this.initializeTimeSpaceCanvas();
                break;
            case 'sound-color':
                this.initializeAudioFeatures();
                break;
        }
    }

    recordAssociation(element) {
        const type = this.determineAssociationType(element);
        const target = this.getAssociationTarget(element);
        const color = element.value;
        const timestamp = Date.now();

        if (!this.crossModalMappings[type]) {
            this.crossModalMappings[type] = new Map();
        }

        // Record the association with metadata
        this.crossModalMappings[type].set(target, {
            color: color,
            timestamp: timestamp,
            confidence: this.getConfidenceRating(element),
            reaction_time: this.calculateReactionTime(element)
        });

        // Update live analysis
        this.updateRealTimeAnalysis();
    }

    determineAssociationType(element) {
        if (element.dataset.number !== undefined) return 'number-color';
        if (element.dataset.letter !== undefined) return 'letter-color';
        if (element.dataset.sound !== undefined) return 'sound-color';
        if (element.dataset.texture !== undefined) return 'texture-color';
        return 'unknown';
    }

    getAssociationTarget(element) {
        return element.dataset.number || 
               element.dataset.letter || 
               element.dataset.sound || 
               element.dataset.texture;
    }

    getConfidenceRating(element) {
        const container = element.closest('.number-item, .letter-item, .sound-item, .texture-item');
        const confidenceSlider = container?.querySelector('.intensity-slider, .vividness-slider, .immediacy-slider');
        return confidenceSlider ? parseInt(confidenceSlider.value) : 5;
    }

    calculateReactionTime(element) {
        // In a real implementation, this would track time from stimulus presentation to color selection
        return Math.random() * 2000 + 500; // Simulated reaction time
    }

    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.oscillators = new Map();
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }

    playTestSound(frequency, type) {
        if (!this.audioContext) return;

        this.stopAllSounds();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        if (frequency === 'sweep_up') {
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 2);
        } else if (frequency === 'sweep_down') {
            oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 2);
        } else if (frequency === 'noise_burst') {
            // Create noise burst effect
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + 0.1);
        } else {
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        }

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);

        this.oscillators.set(type, oscillator);

        // Record timing for chromesthetic analysis
        this.recordSoundTiming(type);
    }

    stopAllSounds() {
        this.oscillators.forEach((oscillator, type) => {
            try {
                oscillator.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.oscillators.clear();
    }

    recordSoundTiming(type) {
        if (!this.soundTimings) {
            this.soundTimings = new Map();
        }
        this.soundTimings.set(type, Date.now());
    }

    setupSpatialMapping() {
        // Concept space mapping
        const conceptCanvas = document.getElementById('concept-space-canvas');
        if (conceptCanvas) {
            this.setupConceptDragDrop(conceptCanvas);
        }

        // Time space mapping
        const weekdayCanvas = document.getElementById('weekday-canvas');
        const monthCanvas = document.getElementById('month-canvas');
        
        if (weekdayCanvas) this.setupTimeMapping(weekdayCanvas, 'weekday');
        if (monthCanvas) this.setupTimeMapping(monthCanvas, 'month');
    }

    setupConceptDragDrop(canvas) {
        const ctx = canvas.getContext('2d');
        const concepts = new Map();

        // Make concept items draggable
        document.querySelectorAll('.concept-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.concept);
            });
        });

        // Canvas drop handling
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const concept = e.dataTransfer.getData('text/plain');
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            concepts.set(concept, {x, y, timestamp: Date.now()});
            this.drawConceptSpace(ctx, concepts);
        });

        // Initial draw
        this.drawConceptSpace(ctx, concepts);
    }

    drawConceptSpace(ctx, concepts) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw coordinate system
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Center lines
        ctx.beginPath();
        ctx.moveTo(ctx.canvas.width / 2, 0);
        ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
        ctx.moveTo(0, ctx.canvas.height / 2);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
        ctx.stroke();

        // Draw concepts
        concepts.forEach((position, concept) => {
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#1f2937';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(concept, position.x, position.y - 15);
        });
    }

    setupTimeMapping(canvas, timeType) {
        const ctx = canvas.getContext('2d');
        const timePositions = new Map();

        // Click handling for time placement
        canvas.addEventListener('click', (e) => {
            if (!this.selectedTimeItem) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            timePositions.set(this.selectedTimeItem, {x, y});
            this.drawTimeSpace(ctx, timePositions, timeType);
            this.selectedTimeItem = null;

            // Update button states
            document.querySelectorAll('.time-item').forEach(btn => {
                btn.classList.remove('selected');
            });
        });

        // Time item selection
        const selector = timeType === 'weekday' ? '[data-day]' : '[data-month]';
        document.querySelectorAll(selector).forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.time-item').forEach(btn => {
                    btn.classList.remove('selected');
                });
                e.target.classList.add('selected');
                this.selectedTimeItem = e.target.dataset.day || e.target.dataset.month;
            });
        });

        // Initial draw
        this.drawTimeSpace(ctx, timePositions, timeType);
    }

    drawTimeSpace(ctx, positions, timeType) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw background grid
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < ctx.canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, ctx.canvas.height);
            ctx.stroke();
        }
        
        for (let i = 0; i < ctx.canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(ctx.canvas.width, i);
            ctx.stroke();
        }

        // Draw time positions
        positions.forEach((position, timeItem) => {
            ctx.fillStyle = timeType === 'weekday' ? '#10b981' : '#f59e0b';
            ctx.beginPath();
            ctx.arc(position.x, position.y, 10, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#1f2937';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(timeItem, position.x, position.y - 18);
        });

        // Draw connections if there are multiple points
        if (positions.size > 1) {
            const posArray = Array.from(positions.values());
            ctx.strokeStyle = timeType === 'weekday' ? '#10b981' : '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.moveTo(posArray[0].x, posArray[0].y);
            for (let i = 1; i < posArray.length; i++) {
                ctx.lineTo(posArray[i].x, posArray[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    async startConsistencyTest() {
        const testButton = document.getElementById('start-consistency-test');
        testButton.disabled = true;
        testButton.textContent = 'Testing...';

        // Run consistency test for number-color associations
        const testResults = await this.runConsistencyTest();
        this.displayConsistencyResults(testResults);

        testButton.disabled = false;
        testButton.textContent = 'Retest Consistency';
    }

    async runConsistencyTest() {
        const testItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const originalAssociations = new Map();
        const retestAssociations = new Map();

        // Get original associations
        testItems.forEach(num => {
            const colorPicker = document.querySelector(`[data-number="${num}"]`);
            if (colorPicker) {
                originalAssociations.set(num, colorPicker.value);
            }
        });

        // Run retest with random order
        const shuffledItems = [...testItems].sort(() => Math.random() - 0.5);
        
        for (const item of shuffledItems) {
            const color = await this.presentConsistencyTest(item);
            retestAssociations.set(item, color);
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Calculate consistency
        return this.calculateConsistency(originalAssociations, retestAssociations);
    }

    async presentConsistencyTest(number) {
        return new Promise((resolve) => {
            // Create modal for consistency test
            const modal = document.createElement('div');
            modal.className = 'consistency-test-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h4>What color do you associate with the number ${number}?</h4>
                    <div class="number-display-large">${number}</div>
                    <input type="color" id="consistency-color" value="#000000">
                    <button id="consistency-submit" class="btn-primary">Submit</button>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('consistency-submit').addEventListener('click', () => {
                const color = document.getElementById('consistency-color').value;
                document.body.removeChild(modal);
                resolve(color);
            });
        });
    }

    calculateConsistency(original, retest) {
        let totalDifference = 0;
        let count = 0;

        original.forEach((color1, number) => {
            const color2 = retest.get(number);
            if (color2) {
                const difference = this.colorDistance(color1, color2);
                totalDifference += difference;
                count++;
            }
        });

        const averageDifference = count > 0 ? totalDifference / count : 100;
        const consistencyScore = Math.max(0, 100 - averageDifference);

        return {
            score: consistencyScore,
            averageDifference: averageDifference,
            testCount: count,
            interpretation: this.interpretConsistency(consistencyScore)
        };
    }

    colorDistance(color1, color2) {
        // Convert hex to RGB and calculate Euclidean distance
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        const dr = rgb1.r - rgb2.r;
        const dg = rgb1.g - rgb2.g;
        const db = rgb1.b - rgb2.b;

        return Math.sqrt(dr*dr + dg*dg + db*db) / Math.sqrt(255*255 * 3) * 100;
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return {r, g, b};
    }

    interpretConsistency(score) {
        if (score >= 80) return "Highly consistent - similar to synesthetic consistency";
        if (score >= 60) return "Moderately consistent - strong color associations";
        if (score >= 40) return "Somewhat consistent - mild color preferences";
        return "Low consistency - flexible or weak associations";
    }

    displayConsistencyResults(results) {
        const container = document.getElementById('consistency-results');
        container.innerHTML = `
            <div class="consistency-score">
                <h5>Consistency Score: ${results.score.toFixed(1)}%</h5>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${results.score}%"></div>
                </div>
                <p class="interpretation">${results.interpretation}</p>
            </div>
            
            <div class="consistency-details">
                <p><strong>Average Color Difference:</strong> ${results.averageDifference.toFixed(1)}%</p>
                <p><strong>Items Tested:</strong> ${results.testCount}</p>
            </div>
            
            <div class="research-note">
                <p><em>Research shows that synesthetes typically score 85%+ on consistency tests, 
                while non-synesthetes average 30-50%. Your score suggests 
                ${results.score >= 70 ? 'strong synesthetic-like processing' : 'typical cross-modal associations'}.</em></p>
            </div>
        `;
        container.classList.remove('hidden');
    }

    updateRealTimeAnalysis() {
        // Analyze patterns in real-time
        this.analyzeColorPatterns();
        this.updateSynestheticProfile();
    }

    analyzeColorPatterns() {
        // Look for patterns in number-color associations
        const numberColors = this.crossModalMappings.get('number-color');
        if (!numberColors || numberColors.size < 5) return;

        const patterns = {
            luminance_trend: this.analyzeLuminanceTrend(numberColors),
            hue_progression: this.analyzeHueProgression(numberColors),
            saturation_pattern: this.analyzeSaturationPattern(numberColors)
        };

        this.detectedPatterns = patterns;
    }

    analyzeLuminanceTrend(colorMap) {
        // Check if larger numbers tend to be lighter/darker
        const pairs = Array.from(colorMap.entries())
            .map(([num, data]) => [parseInt(num), this.getColorLuminance(data.color)])
            .sort((a, b) => a[0] - b[0]);

        if (pairs.length < 3) return null;

        const correlation = this.calculateCorrelation(
            pairs.map(p => p[0]), 
            pairs.map(p => p[1])
        );

        return {
            correlation: correlation,
            trend: correlation > 0.5 ? 'increasing' : correlation < -0.5 ? 'decreasing' : 'none'
        };
    }

    getColorLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    }

    calculateCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    updateSynestheticProfile() {
        const profile = document.getElementById('synesthetic-profile');
        if (!profile) return;

        const consistency = this.consistencyScores.get('number-color') || 0;
        const associationStrength = this.calculateOverallStrength();
        const detectedTypes = this.getDetectedSynestheticTypes();

        profile.innerHTML = `
            <div class="profile-metrics">
                <div class="metric">
                    <h5>Consistency</h5>
                    <div class="metric-value">${consistency.toFixed(1)}%</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${consistency}%"></div>
                    </div>
                </div>
                
                <div class="metric">
                    <h5>Association Strength</h5>
                    <div class="metric-value">${associationStrength.toFixed(1)}/10</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${associationStrength * 10}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="detected-types">
                <h5>Detected Synesthetic-like Processing</h5>
                ${detectedTypes.length > 0 ? 
                    detectedTypes.map(type => `<span class="type-tag">${type}</span>`).join('') :
                    '<p>Complete the assessments to identify patterns</p>'
                }
            </div>
            
            <div class="cognitive-advantages">
                <h5>Potential Cognitive Advantages</h5>
                ${this.generateCognitiveAdvantages()}
            </div>
        `;
    }

    calculateOverallStrength() {
        // Average association strength across all modalities
        let totalStrength = 0;
        let count = 0;

        this.crossModalMappings.forEach((mappings, type) => {
            mappings.forEach((data) => {
                totalStrength += data.confidence || 5;
                count++;
            });
        });

        return count > 0 ? totalStrength / count : 5;
    }

    getDetectedSynestheticTypes() {
        const types = [];
        
        if (this.crossModalMappings.get('number-color')?.size >= 5) {
            types.push('Grapheme-Color (Numbers)');
        }
        
        if (this.crossModalMappings.get('letter-color')?.size >= 10) {
            types.push('Grapheme-Color (Letters)');
        }
        
        if (this.crossModalMappings.get('sound-color')?.size >= 3) {
            types.push('Chromesthesia (Sound-Color)');
        }

        return types;
    }

    generateCognitiveAdvantages() {
        const advantages = [];
        
        if (this.consistencyScores.get('number-color') > 70) {
            advantages.push("Enhanced numerical memory and calculation abilities");
        }
        
        if (this.crossModalMappings.get('sound-color')?.size >= 3) {
            advantages.push("Improved musical memory and pitch recognition");
        }
        
        if (this.detectedPatterns?.luminance_trend?.correlation > 0.5) {
            advantages.push("Systematic cognitive organization patterns");
        }

        return advantages.length > 0 ? 
            advantages.map(adv => `<li>${adv}</li>`).join('') : 
            '<li>Complete more assessments to identify potential advantages</li>';
    }

    loadResearchData() {
        // Load research citations and findings
        this.researchData = {
            citations: [
                {
                    authors: "Rothen, N., & Meier, B.",
                    year: 2010,
                    title: "Grapheme-colour synaesthesia enhances memory performance",
                    journal: "Cognition",
                    finding: "Synesthetes show enhanced memory performance across multiple domains"
                },
                {
                    authors: "Simner, J., & Carmichael, D. A.",
                    year: 2015,
                    title: "Is synaesthesia a dominantly female trait?",
                    journal: "Cognitive Neuroscience",
                    finding: "Cross-modal associations can be trained and enhanced in non-synesthetes"
                },
                {
                    authors: "Yaro, C., & Ward, J.",
                    year: 2007,
                    title: "Searching for Shereshevskii: What is superior about the memory of synaesthetes?",
                    journal: "Quarterly Journal of Experimental Psychology",
                    finding: "Synesthetic associations provide robust memory cues"
                }
            ]
        };
    }

    generateAssessmentReport() {
        return {
            timestamp: new Date().toISOString(),
            associations: Object.fromEntries(this.crossModalMappings),
            consistency_scores: Object.fromEntries(this.consistencyScores),
            detected_patterns: this.detectedPatterns,
            synesthetic_profile: this.simulationResults,
            research_context: this.researchData
        };
    }
}

// Export for use in other modules
window.SynestheticSimulationModule = SynestheticSimulationModule;