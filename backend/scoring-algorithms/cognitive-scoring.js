const fs = require('fs-extra');
const path = require('path');

async function calculateCognitiveResults(answers, behaviorData = {}) {
    const dimensions = {
        texture: {
            patterns: {
                smooth_flowing: { count: 0, scores: [], behaviorWeight: 1.0 },
                rough_grippable: { count: 0, scores: [], behaviorWeight: 1.0 },
                sand_shifting: { count: 0, scores: [], behaviorWeight: 1.0 },
                clay_moldable: { count: 0, scores: [], behaviorWeight: 1.0 }
            },
            totalCount: 0,
            confidence: 0
        },
        temperature: {
            patterns: {
                cool_logical: { count: 0, scores: [], behaviorWeight: 1.0 },
                warm_narrative: { count: 0, scores: [], behaviorWeight: 1.0 },
                hot_urgent: { count: 0, scores: [], behaviorWeight: 1.0 },
                alternating_temp: { count: 0, scores: [], behaviorWeight: 1.0 }
            },
            totalCount: 0,
            confidence: 0
        },
        ecosystem: {
            patterns: {
                garden_organic: { count: 0, scores: [], behaviorWeight: 1.0 },
                city_systems: { count: 0, scores: [], behaviorWeight: 1.0 },
                forest_hierarchical: { count: 0, scores: [], behaviorWeight: 1.0 },
                ocean_depth: { count: 0, scores: [], behaviorWeight: 1.0 }
            },
            totalCount: 0,
            confidence: 0
        },
        temporal: {
            patterns: {
                tidal_steady: { count: 0, scores: [], behaviorWeight: 1.0 },
                seasonal_deep: { count: 0, scores: [], behaviorWeight: 1.0 },
                lightning_burst: { count: 0, scores: [], behaviorWeight: 1.0 },
                heartbeat_maintenance: { count: 0, scores: [], behaviorWeight: 1.0 }
            },
            totalCount: 0,
            confidence: 0
        },
        spatial: {
            patterns: {
                foundation_up: { count: 0, scores: [], behaviorWeight: 1.0 },
                big_picture_down: { count: 0, scores: [], behaviorWeight: 1.0 },
                modular: { count: 0, scores: [], behaviorWeight: 1.0 },
                flowing: { count: 0, scores: [], behaviorWeight: 1.0 }
            },
            totalCount: 0,
            confidence: 0
        }
    };

    // Apply behavioral analysis to adjust pattern weights
    if (behaviorData.patterns) {
        applyBehavioralWeights(dimensions, behaviorData.patterns, answers);
    }

    // Process answers and calculate scores
    answers.forEach((answer, index) => {
        // Handle both old format (dimension/pattern) and new format (hidden_dimension/pattern from scenario questions)
        let dimensionKey, patternKey, weight;
        
        if (answer.dimension && answer.pattern) {
            // Old format
            dimensionKey = answer.dimension;
            patternKey = answer.pattern;
            weight = answer.weight || 1.0;
        } else if (answer.hidden_dimension && answer.pattern) {
            // New scenario-based format
            dimensionKey = answer.hidden_dimension;
            patternKey = answer.pattern;
            weight = answer.weight || 1.0;
        } else {
            // Skip invalid answers
            return;
        }
        
        const dimension = dimensions[dimensionKey];
        if (dimension) {
            // Map scenario patterns to cognitive patterns
            const mappedPattern = mapScenarioPatternToCognitive(dimensionKey, patternKey);
            
            if (dimension.patterns[mappedPattern]) {
                const pattern = dimension.patterns[mappedPattern];
                
                // Base score from selection
                let baseScore = weight;
                
                // Apply behavioral weight
                baseScore *= pattern.behaviorWeight;
                
                // Apply response time weight (faster responses might indicate confidence)
                if (answer.responseTime) {
                    const responseWeight = calculateResponseTimeWeight(answer.responseTime);
                    baseScore *= responseWeight;
                }
                
                pattern.count++;
                pattern.scores.push(baseScore);
                dimension.totalCount++;
            }
        }
    });

    // Calculate final scores for each pattern
    Object.keys(dimensions).forEach(dimensionKey => {
        const dimension = dimensions[dimensionKey];
        Object.keys(dimension.patterns).forEach(patternKey => {
            const pattern = dimension.patterns[patternKey];
            
            if (pattern.scores.length > 0) {
                const avgScore = pattern.scores.reduce((a, b) => a + b, 0) / pattern.scores.length;
                const frequency = pattern.count / Math.max(1, dimension.totalCount);
                pattern.finalScore = Math.round(avgScore * frequency * 100);
            } else {
                pattern.finalScore = 0;
            }
        });

        // Calculate dimension confidence
        dimension.confidence = calculateDimensionConfidence(dimension);
    });

    // Generate cognitive fingerprint
    const cognitiveFingerprint = generateAdvancedCognitiveFingerprint(dimensions, behaviorData);
    
    // Generate learning pathways
    const learningPathways = generateLearningPathways(cognitiveFingerprint);
    
    // Calculate cognitive compatibility between dimensions
    const dimensionInteractions = calculateDimensionInteractions(dimensions);

    return {
        dimensions: dimensions,
        cognitiveFingerprint: cognitiveFingerprint,
        learningPathways: learningPathways,
        dimensionInteractions: dimensionInteractions,
        behaviorAnalysis: analyzeBehaviorPatterns(behaviorData),
        overallProfile: generateOverallProfile(cognitiveFingerprint, behaviorData),
        algorithm: 'cognitive_multi_dimensional_advanced',
        timestamp: new Date().toISOString()
    };
}

function applyBehavioralWeights(dimensions, behaviorPatterns, answers) {
    // Adjust weights based on response time patterns
    if (behaviorPatterns.averageResponseTime) {
        const avgTime = behaviorPatterns.averageResponseTime;
        
        answers.forEach(answer => {
            const dimensionKey = answer.dimension || answer.hidden_dimension;
            const patternKey = answer.pattern;
            
            if (answer && answer.responseTime && dimensionKey && patternKey) {
                const dimension = dimensions[dimensionKey];
                const mappedPattern = mapScenarioPatternToCognitive(dimensionKey, patternKey);
                
                if (dimension && dimension.patterns[mappedPattern]) {
                    // Quick responses might indicate intuitive alignment
                    if (answer.responseTime < avgTime * 0.7) {
                        dimension.patterns[mappedPattern].behaviorWeight *= 1.2;
                    }
                    // Very slow responses might indicate uncertainty
                    else if (answer.responseTime > avgTime * 1.5) {
                        dimension.patterns[mappedPattern].behaviorWeight *= 0.9;
                    }
                }
            }
        });
    }

    // Adjust for hesitation patterns
    if (behaviorPatterns.hesitationIndex > 2) {
        // High hesitation might indicate lower confidence in selections
        Object.values(dimensions).forEach(dimension => {
            Object.values(dimension.patterns).forEach(pattern => {
                pattern.behaviorWeight *= 0.95;
            });
        });
    }

    // Adjust for answer changing behavior
    if (behaviorPatterns.changeFrequency > 0.3) {
        // Frequent changes might indicate indecision or evolving preferences
        Object.values(dimensions).forEach(dimension => {
            Object.values(dimension.patterns).forEach(pattern => {
                pattern.behaviorWeight *= 0.9;
            });
        });
    }
}

function calculateResponseTimeWeight(responseTime) {
    // Optimal response time is considered to be between 3-10 seconds
    // Too fast might be impulsive, too slow might indicate uncertainty
    if (responseTime < 2000) {
        return 0.8; // Too fast, might be impulsive
    } else if (responseTime > 30000) {
        return 0.7; // Too slow, might indicate uncertainty
    } else if (responseTime >= 3000 && responseTime <= 15000) {
        return 1.1; // Optimal range, thoughtful response
    }
    return 1.0; // Default weight
}

function calculateDimensionConfidence(dimension) {
    const patterns = Object.values(dimension.patterns);
    const scores = patterns.map(p => p.finalScore).filter(s => s > 0);
    
    if (scores.length === 0) return 0;
    
    const maxScore = Math.max(...scores);
    const secondMax = scores.length > 1 ? scores.sort((a, b) => b - a)[1] : 0;
    
    // Higher confidence when there's a clear leader
    const separation = maxScore - secondMax;
    const consistency = maxScore;
    
    return Math.round((separation * 0.6) + (consistency * 0.4));
}

function generateAdvancedCognitiveFingerprint(dimensions, behaviorData) {
    const fingerprint = {
        primary: {},
        secondary: {},
        behaviorProfile: {},
        cognitiveStyle: '',
        adaptabilityIndex: 0,
        processingSpeed: '',
        confidence: 0
    };

    // Find dominant and secondary patterns in each dimension
    Object.keys(dimensions).forEach(dimensionKey => {
        const dimension = dimensions[dimensionKey];
        const sortedPatterns = Object.entries(dimension.patterns)
            .map(([pattern, data]) => ({ pattern, score: data.finalScore }))
            .sort((a, b) => b.score - a.score);

        if (sortedPatterns.length > 0 && sortedPatterns[0].score > 0) {
            fingerprint.primary[dimensionKey] = {
                pattern: sortedPatterns[0].pattern,
                score: sortedPatterns[0].score,
                description: getPatternDescription(dimensionKey, sortedPatterns[0].pattern),
                confidence: dimension.confidence
            };

            if (sortedPatterns.length > 1 && sortedPatterns[1].score > 20) {
                fingerprint.secondary[dimensionKey] = {
                    pattern: sortedPatterns[1].pattern,
                    score: sortedPatterns[1].score,
                    description: getPatternDescription(dimensionKey, sortedPatterns[1].pattern)
                };
            }
        }
    });

    // Generate behavior profile
    if (behaviorData.patterns) {
        fingerprint.behaviorProfile = analyzeBehaviorPatterns(behaviorData);
        fingerprint.processingSpeed = determineProcessingSpeed(behaviorData.patterns);
        fingerprint.adaptabilityIndex = calculateAdaptabilityIndex(fingerprint.primary, fingerprint.secondary);
    }

    // Generate cognitive style description
    fingerprint.cognitiveStyle = generateCognitiveStyleDescription(fingerprint.primary);

    // Calculate overall confidence
    const confidenceScores = Object.values(fingerprint.primary).map(p => p.confidence || 0);
    fingerprint.confidence = confidenceScores.length > 0 ? 
        Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 0;

    return fingerprint;
}

function analyzeBehaviorPatterns(behaviorData) {
    if (!behaviorData.patterns) return {};

    const analysis = {
        decisionMaking: '',
        processingStyle: '',
        attentionPattern: '',
        cognitiveLoad: ''
    };

    const patterns = behaviorData.patterns;

    // Decision making analysis
    if (patterns.changeFrequency > 0.4) {
        analysis.decisionMaking = 'Deliberative - tends to reconsider and refine choices';
    } else if (patterns.changeFrequency < 0.1) {
        analysis.decisionMaking = 'Decisive - commits quickly to initial choices';
    } else {
        analysis.decisionMaking = 'Balanced - thoughtful but not overly hesitant';
    }

    // Processing style analysis
    if (patterns.averageResponseTime < 5000) {
        analysis.processingStyle = 'Rapid processor - quick to form judgments';
    } else if (patterns.averageResponseTime > 15000) {
        analysis.processingStyle = 'Deep processor - takes time for thorough consideration';
    } else {
        analysis.processingStyle = 'Moderate processor - balanced thinking pace';
    }

    // Attention pattern analysis
    if (patterns.attentionStability > 90) {
        analysis.attentionPattern = 'Highly focused - maintains steady attention';
    } else if (patterns.attentionStability < 70) {
        analysis.attentionPattern = 'Variable attention - may benefit from engagement strategies';
    } else {
        analysis.attentionPattern = 'Stable attention - good focus with minor fluctuations';
    }

    // Cognitive load analysis
    if (patterns.hesitationIndex > 3) {
        analysis.cognitiveLoad = 'High cognitive load - may benefit from simplified presentations';
    } else if (patterns.hesitationIndex < 1) {
        analysis.cognitiveLoad = 'Low cognitive load - can handle complex information well';
    } else {
        analysis.cognitiveLoad = 'Moderate cognitive load - balanced processing capacity';
    }

    return analysis;
}

function determineProcessingSpeed(patterns) {
    if (patterns.averageResponseTime < 4000) {
        return 'Fast processor';
    } else if (patterns.averageResponseTime > 12000) {
        return 'Reflective processor';
    } else {
        return 'Moderate processor';
    }
}

function calculateAdaptabilityIndex(primary, secondary) {
    // Higher adaptability when there are strong secondary patterns
    let adaptabilityScore = 0;
    
    Object.keys(secondary).forEach(dimension => {
        const secondaryScore = secondary[dimension].score;
        adaptabilityScore += secondaryScore * 0.5; // Weight secondary patterns
    });

    // Check for pattern diversity
    const primaryPatterns = Object.values(primary).map(p => p.pattern);
    const uniquePatternTypes = new Set(primaryPatterns).size;
    adaptabilityScore += uniquePatternTypes * 5;

    return Math.min(100, Math.round(adaptabilityScore));
}

function generateCognitiveStyleDescription(primaryPatterns) {
    const patterns = Object.values(primaryPatterns).map(p => p.pattern);
    
    let style = "Your cognitive style is characterized by ";
    
    // Analyze pattern combinations
    if (patterns.includes('smooth_flowing') && patterns.includes('tidal_steady')) {
        style += "consistent, systematic processing with a preference for clear, connected information flows.";
    } else if (patterns.includes('lightning_burst') && patterns.includes('hot_urgent')) {
        style += "intense, breakthrough-oriented thinking with high-energy problem-solving approaches.";
    } else if (patterns.includes('clay_moldable') && patterns.includes('garden_organic')) {
        style += "creative, adaptive thinking that shapes and evolves ideas through exploration.";
    } else if (patterns.includes('ocean_depth') && patterns.includes('seasonal_deep')) {
        style += "deep, reflective processing that uncovers hidden connections through patient exploration.";
    } else {
        style += "a unique combination of cognitive preferences that creates a distinctive thinking style.";
    }
    
    return style;
}

function generateLearningPathways(cognitiveFingerprint) {
    const pathways = {
        optimal: [],
        alternative: [],
        development: []
    };

    const primary = cognitiveFingerprint.primary;

    // Generate optimal pathways based on primary patterns
    Object.entries(primary).forEach(([dimension, data]) => {
        const recommendations = getPathwayRecommendations(dimension, data.pattern, 'optimal');
        pathways.optimal.push(...recommendations);
    });

    // Generate alternative pathways based on secondary patterns
    Object.entries(cognitiveFingerprint.secondary).forEach(([dimension, data]) => {
        const recommendations = getPathwayRecommendations(dimension, data.pattern, 'alternative');
        pathways.alternative.push(...recommendations);
    });

    // Generate development pathways for growth
    pathways.development = generateDevelopmentPathways(primary);

    return pathways;
}

function getPathwayRecommendations(dimension, pattern, type) {
    const recommendations = {
        texture: {
            smooth_flowing: [
                "Sequential learning modules with clear connections",
                "Narrative-based information presentation",
                "Process-oriented explanations"
            ],
            rough_grippable: [
                "Concrete examples and case studies",
                "Hands-on practice with tangible outcomes",
                "Step-by-step procedural learning"
            ],
            sand_shifting: [
                "Flexible, adaptive learning paths",
                "Context-sensitive information",
                "Multiple perspective approaches"
            ],
            clay_moldable: [
                "Interactive, manipulable content",
                "Creative project-based learning",
                "Experimental exploration opportunities"
            ]
        },
        temperature: {
            cool_logical: [
                "Data-driven, analytical content",
                "Objective, fact-based presentations",
                "Systematic problem-solving approaches"
            ],
            warm_narrative: [
                "Story-based learning",
                "Personal connection to material",
                "Contextual, meaningful examples"
            ],
            hot_urgent: [
                "High-stakes, time-pressured scenarios",
                "Immediate application opportunities",
                "Competitive or challenging environments"
            ],
            alternating_temp: [
                "Varied pacing and intensity",
                "Mixed approaches within sessions",
                "Flexible engagement strategies"
            ]
        },
        ecosystem: {
            garden_organic: [
                "Discovery-based learning",
                "Natural progression of complexity",
                "Emergent understanding approaches"
            ],
            city_systems: [
                "Structured, systematic curricula",
                "Clear roles and relationships",
                "Organized knowledge frameworks"
            ],
            forest_hierarchical: [
                "Layered, foundational approaches",
                "Prerequisite-based progressions",
                "Scaffolded complexity building"
            ],
            ocean_depth: [
                "Deep-dive explorations",
                "Interconnected concept mapping",
                "Philosophical and theoretical foundations"
            ]
        },
        temporal: {
            tidal_steady: [
                "Regular, consistent study schedules",
                "Predictable learning rhythms",
                "Steady progress tracking"
            ],
            seasonal_deep: [
                "Intensive learning periods",
                "Extended preparation phases",
                "Cyclical review and mastery"
            ],
            lightning_burst: [
                "Intensive workshop formats",
                "Breakthrough-focused sessions",
                "High-concentration learning bursts"
            ],
            heartbeat_maintenance: [
                "Regular maintenance with periodic intensity",
                "Balanced routine with occasional acceleration",
                "Sustainable long-term learning patterns"
            ]
        },
        spatial: {
            foundation_up: [
                "Progressive skill building",
                "Prerequisite mastery requirements",
                "Solid foundational approaches"
            ],
            big_picture_down: [
                "Overview-first presentations",
                "Top-down design thinking",
                "Conceptual framework starters"
            ],
            modular: [
                "Independent learning modules",
                "Flexible assembly of knowledge",
                "Component-based understanding"
            ],
            flowing: [
                "Organic learning experiences",
                "Intuitive progression paths",
                "Natural knowledge emergence"
            ]
        }
    };

    return recommendations[dimension]?.[pattern] || [];
}

function generateDevelopmentPathways(primaryPatterns) {
    const development = [];
    
    // Suggest complementary patterns for growth
    Object.entries(primaryPatterns).forEach(([dimension, data]) => {
        const currentPattern = data.pattern;
        const complementaryPatterns = getComplementaryPatterns(dimension, currentPattern);
        
        complementaryPatterns.forEach(pattern => {
            development.push({
                dimension: dimension,
                pattern: pattern,
                reason: `Develop ${pattern} to complement your ${currentPattern} strength`,
                activities: getPathwayRecommendations(dimension, pattern, 'development')
            });
        });
    });

    return development;
}

function getComplementaryPatterns(dimension, currentPattern) {
    const complements = {
        texture: {
            smooth_flowing: ['rough_grippable'],
            rough_grippable: ['sand_shifting'],
            sand_shifting: ['clay_moldable'],
            clay_moldable: ['smooth_flowing']
        },
        temperature: {
            cool_logical: ['warm_narrative'],
            warm_narrative: ['cool_logical'],
            hot_urgent: ['seasonal_deep'],
            alternating_temp: ['tidal_steady']
        },
        ecosystem: {
            garden_organic: ['city_systems'],
            city_systems: ['ocean_depth'],
            forest_hierarchical: ['garden_organic'],
            ocean_depth: ['forest_hierarchical']
        },
        temporal: {
            tidal_steady: ['lightning_burst'],
            seasonal_deep: ['heartbeat_maintenance'],
            lightning_burst: ['tidal_steady'],
            heartbeat_maintenance: ['seasonal_deep']
        },
        spatial: {
            foundation_up: ['big_picture_down'],
            big_picture_down: ['foundation_up'],
            modular: ['flowing'],
            flowing: ['modular']
        }
    };

    return complements[dimension]?.[currentPattern] || [];
}

function calculateDimensionInteractions(dimensions) {
    const interactions = {};
    const dimensionKeys = Object.keys(dimensions);
    
    for (let i = 0; i < dimensionKeys.length; i++) {
        for (let j = i + 1; j < dimensionKeys.length; j++) {
            const dim1 = dimensionKeys[i];
            const dim2 = dimensionKeys[j];
            const interactionKey = `${dim1}_${dim2}`;
            
            interactions[interactionKey] = {
                synergy: calculateDimensionSynergy(dimensions[dim1], dimensions[dim2]),
                recommendations: getDimensionInteractionRecommendations(dim1, dim2, dimensions)
            };
        }
    }
    
    return interactions;
}

function calculateDimensionSynergy(dim1, dim2) {
    // Calculate how well the dominant patterns in each dimension work together
    const dim1Patterns = Object.entries(dim1.patterns).sort((a, b) => b[1].finalScore - a[1].finalScore);
    const dim2Patterns = Object.entries(dim2.patterns).sort((a, b) => b[1].finalScore - a[1].finalScore);
    
    if (dim1Patterns.length === 0 || dim2Patterns.length === 0) return 0;
    
    const pattern1 = dim1Patterns[0][0];
    const pattern2 = dim2Patterns[0][0];
    
    // Define synergy matrix between different pattern combinations
    const synergyMatrix = {
        'smooth_flowing_tidal_steady': 0.9,
        'lightning_burst_hot_urgent': 0.9,
        'garden_organic_clay_moldable': 0.8,
        'city_systems_foundation_up': 0.8,
        'ocean_depth_seasonal_deep': 0.9,
        // Add more combinations as needed
    };
    
    const key1 = `${pattern1}_${pattern2}`;
    const key2 = `${pattern2}_${pattern1}`;
    
    return Math.round((synergyMatrix[key1] || synergyMatrix[key2] || 0.5) * 100);
}

function getDimensionInteractionRecommendations(dim1, dim2, dimensions) {
    // Generate specific recommendations based on how dimensions interact
    return [
        `Combine ${dim1} and ${dim2} approaches for enhanced learning`,
        `Balance your ${dim1} preferences with ${dim2} strategies`
    ];
}

function generateOverallProfile(cognitiveFingerprint, behaviorData) {
    const profile = {
        type: '',
        description: '',
        strengths: [],
        growthAreas: [],
        optimalConditions: []
    };

    // Determine overall profile type
    const primaryPatterns = Object.values(cognitiveFingerprint.primary).map(p => p.pattern);
    
    if (primaryPatterns.includes('lightning_burst') && primaryPatterns.includes('hot_urgent')) {
        profile.type = 'Intensity Processor';
    } else if (primaryPatterns.includes('smooth_flowing') && primaryPatterns.includes('tidal_steady')) {
        profile.type = 'Flow State Learner';
    } else if (primaryPatterns.includes('clay_moldable') && primaryPatterns.includes('garden_organic')) {
        profile.type = 'Creative Explorer';
    } else if (primaryPatterns.includes('ocean_depth') && primaryPatterns.includes('seasonal_deep')) {
        profile.type = 'Deep Contemplator';
    } else {
        profile.type = 'Adaptive Thinker';
    }

    profile.description = cognitiveFingerprint.cognitiveStyle;

    // Generate strengths based on primary patterns
    Object.values(cognitiveFingerprint.primary).forEach(pattern => {
        profile.strengths.push(pattern.description);
    });

    // Generate growth areas based on weak dimensions
    const weakDimensions = Object.entries(cognitiveFingerprint.primary)
        .filter(([dim, data]) => data.confidence < 60)
        .map(([dim, data]) => dim);
    
    weakDimensions.forEach(dim => {
        profile.growthAreas.push(`Develop stronger preferences in ${dim} dimension`);
    });

    return profile;
}

function getPatternDescription(dimension, pattern) {
    const descriptions = {
        texture: {
            smooth_flowing: "Prefers seamless, connected information that flows logically from one concept to the next",
            rough_grippable: "Needs concrete, tangible concepts with clear boundaries and specific details to grasp",
            sand_shifting: "Appreciates flexible, adaptable information that can be viewed from multiple perspectives",
            clay_moldable: "Wants to actively shape and transform ideas through hands-on manipulation and experimentation"
        },
        temperature: {
            cool_logical: "Thrives in objective, analytical environments with facts and systematic reasoning",
            warm_narrative: "Learns best through stories, emotional connections, and personally meaningful contexts",
            hot_urgent: "Motivated by intensity, immediacy, and high-stakes applications with clear deadlines",
            alternating_temp: "Benefits from variety in emotional intensity and pacing throughout learning experiences"
        },
        ecosystem: {
            garden_organic: "Sees natural, evolving connections between ideas that grow and develop organically",
            city_systems: "Prefers organized, systematic relationships with clear functions and structured interactions",
            forest_hierarchical: "Thinks in structured levels and hierarchies, building from ground up to complex canopies",
            ocean_depth: "Explores deep, far-reaching connections that span vast conceptual distances"
        },
        temporal: {
            tidal_steady: "Works best with consistent, regular patterns and predictable learning rhythms",
            seasonal_deep: "Prefers cycles of extensive preparation followed by periods of intensive learning and growth",
            lightning_burst: "Learns through sudden insights, breakthrough moments, and intense focus sessions",
            heartbeat_maintenance: "Maintains steady progress with periodic acceleration and regular maintenance cycles"
        },
        spatial: {
            foundation_up: "Builds knowledge systematically from basic principles to complex applications",
            big_picture_down: "Starts with comprehensive overviews and fills in specific details progressively",
            modular: "Learns in independent pieces that can be flexibly combined and connected over time",
            flowing: "Allows understanding to develop organically following natural curiosity and interest"
        }
    };

    return descriptions[dimension]?.[pattern] || "Unique cognitive pattern";
}

function mapScenarioPatternToCognitive(dimension, scenarioPattern) {
    // Map scenario-based patterns to cognitive framework patterns
    const patternMappings = {
        texture: {
            'structured_preparation': 'rough_grippable',
            'fluid_expression': 'smooth_flowing',
            'concrete_points': 'rough_grippable',
            'responsive_adaptation': 'sand_shifting',
            'tactile_concrete': 'rough_grippable',
            'intuitive_adaptation': 'clay_moldable',
            'concrete_progress': 'rough_grippable',
            'granular_breakdown': 'sand_shifting',
            'fact_grounding': 'rough_grippable',
            'tangible_examples': 'rough_grippable',
            'concrete_feedback': 'rough_grippable',
            'aesthetic_flow': 'smooth_flowing'
        },
        temperature: {
            'high_intensity': 'hot_urgent',
            'moderate_ambient': 'warm_narrative',
            'low_systematic': 'cool_logical',
            'warm_social': 'warm_narrative',
            'immediate_application': 'hot_urgent',
            'engaging_intensity': 'hot_urgent',
            'energy_motivation': 'hot_urgent'
        },
        ecosystem: {
            'narrative_connection': 'garden_organic',
            'linear_causal': 'city_systems',
            'web_systems': 'ocean_depth',
            'hierarchical_structure': 'forest_hierarchical',
            'concrete_expansion': 'garden_organic',
            'cultural_context': 'ocean_depth',
            'flavor_integration': 'ocean_depth',
            'collaborative_processing': 'garden_organic',
            'idea_connections': 'ocean_depth',
            'pattern_recognition': 'ocean_depth',
            'synthesis_connection': 'ocean_depth',
            'collaborative_thinking': 'garden_organic',
            'holistic_integration': 'ocean_depth',
            'metaphorical_connection': 'garden_organic'
        },
        temporal: {
            'rhythm_sequence': 'tidal_steady',
            'interval_bursts': 'lightning_burst',
            'deep_immersion': 'seasonal_deep',
            'steady_accumulation': 'tidal_steady',
            'intuitive_flow': 'heartbeat_maintenance',
            'auditory_rhythm': 'tidal_steady',
            'timing_coordination': 'heartbeat_maintenance',
            'burst_recovery': 'lightning_burst',
            'time_coordination': 'tidal_steady',
            'incubation_processing': 'seasonal_deep',
            'chronological_tracking': 'tidal_steady',
            'natural_rhythm': 'heartbeat_maintenance',
            'adaptive_pacing': 'heartbeat_maintenance'
        },
        spatial: {
            'visual_spatial': 'big_picture_down',
            'sequential_build': 'foundation_up',
            'goal_visualization': 'big_picture_down',
            'holistic_assembly': 'modular',
            'adaptive_construction': 'flowing',
            'systematic_structure': 'foundation_up',
            'systematic_preparation': 'foundation_up',
            'perspective_shift': 'big_picture_down',
            'logical_progression': 'foundation_up',
            'structural_planning': 'foundation_up',
            'visual_mapping': 'big_picture_down',
            'scope_visualization': 'big_picture_down',
            'structured_progression': 'foundation_up',
            'scaffolded_building': 'foundation_up'
        }
    };
    
    // Default patterns for each dimension if mapping not found
    const defaultPatterns = {
        texture: 'smooth_flowing',
        temperature: 'cool_logical',
        ecosystem: 'garden_organic',
        temporal: 'tidal_steady',
        spatial: 'foundation_up'
    };
    
    return patternMappings[dimension]?.[scenarioPattern] || defaultPatterns[dimension] || 'unknown';
}

// New function to handle scenario-based assessment data
async function processScenarioAssessment(responses, behaviorData = {}) {
    // Convert scenario responses to cognitive dimension answers
    const cognitiveAnswers = [];
    
    if (responses && Array.isArray(responses)) {
        responses.forEach((response, index) => {
            if (response.selectedOption && response.questionData) {
                const option = response.questionData.options.find(opt => opt.id === response.selectedOption);
                if (option) {
                    cognitiveAnswers.push({
                        questionId: response.questionId,
                        hidden_dimension: option.hidden_dimension,
                        pattern: option.pattern,
                        weight: option.weight,
                        responseTime: response.responseTime,
                        scenario: response.questionData.scenario,
                        category: response.questionData.category
                    });
                }
            }
        });
    }
    
    return await calculateCognitiveResults(cognitiveAnswers, behaviorData);
}

module.exports = {
    calculateCognitiveResults,
    processScenarioAssessment
};