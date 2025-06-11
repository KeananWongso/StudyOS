const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { calculateCognitiveResults, processScenarioAssessment } = require('../scoring-algorithms/cognitive-scoring');

const router = express.Router();
const cognitiveDataPath = path.join(__dirname, '../../data/cognitive-assessments');
const questionsPath = path.join(__dirname, '../../data/assessment-questions');

// Get cognitive assessment questions
router.get('/questions', async (req, res) => {
    try {
        const questionsFile = path.join(questionsPath, 'cognitive-questions.json');
        
        if (await fs.pathExists(questionsFile)) {
            const questions = await fs.readJson(questionsFile);
            res.json(questions);
        } else {
            res.status(404).json({ error: 'Cognitive questions not found' });
        }
    } catch (error) {
        console.error('Error loading cognitive questions:', error);
        res.status(500).json({ error: 'Failed to load cognitive questions' });
    }
});

// Calculate cognitive assessment results
router.post('/calculate-results', async (req, res) => {
    try {
        const { answers, responses, behaviorData, assessmentType } = req.body;
        
        let results;
        
        if (assessmentType === 'scenario' && responses) {
            // Handle new scenario-based assessment
            if (!responses || !Array.isArray(responses)) {
                return res.status(400).json({ error: 'Invalid responses format for scenario assessment' });
            }
            results = await processScenarioAssessment(responses, behaviorData);
        } else {
            // Handle legacy format
            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({ error: 'Invalid answers format' });
            }
            results = await calculateCognitiveResults(answers, behaviorData);
        }
        
        // Add personalized recommendations
        const recommendations = await generatePersonalizedRecommendations(results);
        results.personalizedRecommendations = recommendations;
        
        res.json(results);
    } catch (error) {
        console.error('Error calculating cognitive results:', error);
        res.status(500).json({ error: 'Failed to calculate cognitive results' });
    }
});

// Save cognitive assessment results
router.post('/save-results', async (req, res) => {
    try {
        const { results, totalTime, userId } = req.body;
        const assessmentId = uuidv4();
        const currentUserId = userId || 'anonymous';
        
        const assessment = {
            id: assessmentId,
            userId: currentUserId,
            results: results,
            totalTime: totalTime,
            timestamp: new Date().toISOString(),
            version: '2.0',
            type: 'cognitive'
        };

        await fs.ensureDir(cognitiveDataPath);
        
        const assessmentFile = path.join(cognitiveDataPath, `cognitive_assessment_${assessmentId}.json`);
        await fs.writeJson(assessmentFile, assessment, { spaces: 2 });

        await updateCognitiveProfile(currentUserId, assessment);
        
        res.json({ 
            message: 'Cognitive assessment results saved successfully', 
            assessmentId: assessmentId,
            userId: currentUserId
        });
    } catch (error) {
        console.error('Error saving cognitive results:', error);
        res.status(500).json({ error: 'Failed to save cognitive results' });
    }
});

// Get specific cognitive assessment
router.get('/assessment/:assessmentId', async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessmentFile = path.join(cognitiveDataPath, `cognitive_assessment_${assessmentId}.json`);
        
        if (await fs.pathExists(assessmentFile)) {
            const assessment = await fs.readJson(assessmentFile);
            res.json(assessment);
        } else {
            res.status(404).json({ error: 'Cognitive assessment not found' });
        }
    } catch (error) {
        console.error('Error retrieving cognitive assessment:', error);
        res.status(500).json({ error: 'Failed to retrieve cognitive assessment' });
    }
});

// Get user's cognitive assessments
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        await fs.ensureDir(cognitiveDataPath);
        const files = await fs.readdir(cognitiveDataPath);
        const assessmentFiles = files.filter(file => file.startsWith('cognitive_assessment_'));
        
        const userAssessments = [];
        
        for (const file of assessmentFiles) {
            const filePath = path.join(cognitiveDataPath, file);
            const assessment = await fs.readJson(filePath);
            
            if (assessment.userId === userId) {
                userAssessments.push(assessment);
            }
        }
        
        userAssessments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json(userAssessments);
    } catch (error) {
        console.error('Error retrieving user cognitive assessments:', error);
        res.status(500).json({ error: 'Failed to retrieve user cognitive assessments' });
    }
});

// Get cognitive profile for user
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileFile = path.join(cognitiveDataPath, `cognitive_profile_${userId}.json`);
        
        if (await fs.pathExists(profileFile)) {
            const profile = await fs.readJson(profileFile);
            res.json(profile);
        } else {
            res.status(404).json({ error: 'Cognitive profile not found' });
        }
    } catch (error) {
        console.error('Error retrieving cognitive profile:', error);
        res.status(500).json({ error: 'Failed to retrieve cognitive profile' });
    }
});

// Get learning recommendations based on cognitive profile
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileFile = path.join(cognitiveDataPath, `cognitive_profile_${userId}.json`);
        
        if (await fs.pathExists(profileFile)) {
            const profile = await fs.readJson(profileFile);
            const recommendations = await generateDetailedRecommendations(profile.latestResults);
            res.json(recommendations);
        } else {
            res.status(404).json({ error: 'Cognitive profile not found' });
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Compare two cognitive assessments
router.post('/compare', async (req, res) => {
    try {
        const { assessmentId1, assessmentId2 } = req.body;
        
        const assessment1File = path.join(cognitiveDataPath, `cognitive_assessment_${assessmentId1}.json`);
        const assessment2File = path.join(cognitiveDataPath, `cognitive_assessment_${assessmentId2}.json`);
        
        if (!(await fs.pathExists(assessment1File)) || !(await fs.pathExists(assessment2File))) {
            return res.status(404).json({ error: 'One or both assessments not found' });
        }
        
        const assessment1 = await fs.readJson(assessment1File);
        const assessment2 = await fs.readJson(assessment2File);
        
        const comparison = compareAssessments(assessment1.results, assessment2.results);
        
        res.json(comparison);
    } catch (error) {
        console.error('Error comparing assessments:', error);
        res.status(500).json({ error: 'Failed to compare assessments' });
    }
});

// Get dimension explanations
router.get('/dimensions/explanations', async (req, res) => {
    try {
        const explanations = getDimensionExplanations();
        res.json(explanations);
    } catch (error) {
        console.error('Error getting dimension explanations:', error);
        res.status(500).json({ error: 'Failed to get dimension explanations' });
    }
});

async function generatePersonalizedRecommendations(results) {
    const recommendations = {
        studyTechniques: [],
        learningEnvironments: [],
        technologicalTools: [],
        collaborationStrategies: [],
        timeManagement: [],
        skillDevelopment: []
    };

    const fingerprint = results.cognitiveFingerprint;
    const primary = fingerprint.primary;
    const behaviorProfile = fingerprint.behaviorProfile;

    // Generate study techniques based on cognitive patterns
    Object.entries(primary).forEach(([dimension, data]) => {
        const techniques = getStudyTechniques(dimension, data.pattern);
        recommendations.studyTechniques.push(...techniques);
    });

    // Generate environment recommendations
    Object.entries(primary).forEach(([dimension, data]) => {
        const environments = getEnvironmentRecommendations(dimension, data.pattern);
        recommendations.learningEnvironments.push(...environments);
    });

    // Generate technology recommendations
    Object.entries(primary).forEach(([dimension, data]) => {
        const tools = getTechnologyRecommendations(dimension, data.pattern);
        recommendations.technologicalTools.push(...tools);
    });

    // Generate collaboration strategies based on social patterns
    if (primary.ecosystem) {
        const collaboration = getCollaborationStrategies(primary.ecosystem.pattern);
        recommendations.collaborationStrategies.push(...collaboration);
    }

    // Generate time management based on temporal patterns
    if (primary.temporal) {
        const timeManagement = getTimeManagementRecommendations(primary.temporal.pattern);
        recommendations.timeManagement.push(...timeManagement);
    }

    // Generate skill development based on behavioral profile
    if (behaviorProfile) {
        const skillDev = getSkillDevelopmentRecommendations(behaviorProfile);
        recommendations.skillDevelopment.push(...skillDev);
    }

    // Remove duplicates and limit recommendations
    Object.keys(recommendations).forEach(category => {
        recommendations[category] = [...new Set(recommendations[category])].slice(0, 5);
    });

    return recommendations;
}

function getStudyTechniques(dimension, pattern) {
    const techniques = {
        texture: {
            smooth_flowing: [
                "Use sequential learning modules with clear progressions",
                "Create narrative-based study materials",
                "Follow guided learning paths with smooth transitions"
            ],
            rough_grippable: [
                "Break information into concrete, manageable chunks",
                "Use flashcards with specific facts and details",
                "Practice with tangible examples and case studies"
            ],
            sand_shifting: [
                "Adapt study methods based on context and mood",
                "Use flexible scheduling and varied approaches",
                "Switch between different perspectives on the same topic"
            ],
            clay_moldable: [
                "Create interactive study materials you can modify",
                "Use mind mapping and concept manipulation tools",
                "Engage in project-based learning with creative freedom"
            ]
        },
        temperature: {
            cool_logical: [
                "Focus on data-driven and analytical content",
                "Use systematic problem-solving approaches",
                "Maintain objective, fact-based study sessions"
            ],
            warm_narrative: [
                "Connect learning to personal stories and experiences",
                "Use case studies and real-world examples",
                "Incorporate emotional context into study materials"
            ],
            hot_urgent: [
                "Set tight deadlines and competitive goals",
                "Use high-stakes practice scenarios",
                "Create urgency through time-pressured exercises"
            ],
            alternating_temp: [
                "Mix intensive and relaxed study periods",
                "Alternate between different emotional approaches",
                "Use varied pacing throughout learning sessions"
            ]
        }
    };

    return techniques[dimension]?.[pattern] || [];
}

function getEnvironmentRecommendations(dimension, pattern) {
    const environments = {
        ecosystem: {
            garden_organic: [
                "Study in natural, peaceful environments",
                "Use organic, unstructured learning spaces",
                "Allow for spontaneous discovery and exploration"
            ],
            city_systems: [
                "Organize study space with clear systems",
                "Use structured, well-organized environments",
                "Maintain consistent, functional learning areas"
            ],
            forest_hierarchical: [
                "Create layered information displays",
                "Use hierarchical organization systems",
                "Build from simple to complex arrangements"
            ],
            ocean_depth: [
                "Seek quiet, contemplative spaces",
                "Use minimal distractions for deep focus",
                "Create environments that support extended concentration"
            ]
        },
        spatial: {
            foundation_up: [
                "Start with basic, clean workspace setup",
                "Build complexity gradually in your environment",
                "Maintain clear foundations before adding elements"
            ],
            big_picture_down: [
                "Use walls for big-picture visual displays",
                "Start with overview materials prominently displayed",
                "Fill in details in secondary locations"
            ],
            modular: [
                "Create flexible, reconfigurable study spaces",
                "Use moveable elements and modular furniture",
                "Separate different subjects into distinct areas"
            ],
            flowing: [
                "Allow for organic, natural flow in your space",
                "Avoid rigid structure in environment setup",
                "Let your space evolve naturally with your needs"
            ]
        }
    };

    return environments[dimension]?.[pattern] || [];
}

function getTechnologyRecommendations(dimension, pattern) {
    const tools = {
        texture: {
            smooth_flowing: ["Linear learning platforms", "Sequential course apps", "Guided tutorial software"],
            rough_grippable: ["Flashcard apps", "Quiz platforms", "Fact-based learning tools"],
            sand_shifting: ["Adaptive learning systems", "Multi-modal platforms", "Flexible content apps"],
            clay_moldable: ["Mind mapping software", "Creative project tools", "Interactive simulation platforms"]
        },
        temperature: {
            cool_logical: ["Data analysis tools", "Logical reasoning apps", "Systematic learning platforms"],
            warm_narrative: ["Story-based learning apps", "Social learning platforms", "Community-driven tools"],
            hot_urgent: ["Gamified learning platforms", "Time-pressured quiz apps", "Competitive learning tools"],
            alternating_temp: ["Multi-modal learning apps", "Variety-focused platforms", "Adaptive pacing tools"]
        }
    };

    return tools[dimension]?.[pattern] || [];
}

function getCollaborationStrategies(ecosystemPattern) {
    const strategies = {
        garden_organic: [
            "Participate in organic, discussion-based study groups",
            "Engage in peer-to-peer learning networks",
            "Use collaborative discovery sessions"
        ],
        city_systems: [
            "Join structured study groups with defined roles",
            "Participate in organized learning communities",
            "Use systematic peer review processes"
        ],
        forest_hierarchical: [
            "Engage in mentorship relationships",
            "Participate in hierarchical learning structures",
            "Use tiered group learning approaches"
        ],
        ocean_depth: [
            "Engage in deep, philosophical discussions",
            "Participate in long-form collaborative projects",
            "Use contemplative group learning sessions"
        ]
    };

    return strategies[ecosystemPattern] || [];
}

function getTimeManagementRecommendations(temporalPattern) {
    const recommendations = {
        tidal_steady: [
            "Maintain consistent daily study schedules",
            "Use regular, predictable time blocks",
            "Build sustainable long-term habits"
        ],
        seasonal_deep: [
            "Plan intensive learning periods",
            "Use cyclical study schedules",
            "Allow for extended preparation phases"
        ],
        lightning_burst: [
            "Capitalize on moments of high energy and focus",
            "Use intensive, short-duration study sessions",
            "Be ready to act on sudden insights"
        ],
        heartbeat_maintenance: [
            "Balance regular maintenance with periodic intensity",
            "Use pulsed learning rhythms",
            "Maintain steady progress with strategic acceleration"
        ]
    };

    return recommendations[temporalPattern] || [];
}

function getSkillDevelopmentRecommendations(behaviorProfile) {
    const recommendations = [];

    if (behaviorProfile.decisionMaking?.includes('Deliberative')) {
        recommendations.push("Practice quick decision-making exercises");
        recommendations.push("Use time-limited choice scenarios");
    } else if (behaviorProfile.decisionMaking?.includes('Decisive')) {
        recommendations.push("Develop reflection and consideration skills");
        recommendations.push("Practice analyzing multiple perspectives");
    }

    if (behaviorProfile.processingStyle?.includes('Rapid')) {
        recommendations.push("Develop deep processing techniques");
        recommendations.push("Practice patience and thorough analysis");
    } else if (behaviorProfile.processingStyle?.includes('Deep')) {
        recommendations.push("Practice rapid information processing");
        recommendations.push("Develop quick synthesis skills");
    }

    return recommendations;
}

async function updateCognitiveProfile(userId, assessment) {
    try {
        const profileFile = path.join(cognitiveDataPath, `cognitive_profile_${userId}.json`);
        let profile = {};
        
        if (await fs.pathExists(profileFile)) {
            profile = await fs.readJson(profileFile);
        }
        
        profile.userId = userId;
        profile.lastAssessment = assessment.timestamp;
        profile.assessmentCount = (profile.assessmentCount || 0) + 1;
        profile.latestResults = assessment.results;
        profile.cognitiveType = assessment.results.overallProfile?.type || 'Unknown';
        
        if (!profile.assessmentHistory) {
            profile.assessmentHistory = [];
        }
        profile.assessmentHistory.push({
            assessmentId: assessment.id,
            timestamp: assessment.timestamp,
            cognitiveType: profile.cognitiveType,
            confidence: assessment.results.cognitiveFingerprint?.confidence || 0
        });
        
        // Keep only last 10 assessments
        if (profile.assessmentHistory.length > 10) {
            profile.assessmentHistory = profile.assessmentHistory.slice(-10);
        }
        
        await fs.writeJson(profileFile, profile, { spaces: 2 });
    } catch (error) {
        console.error('Error updating cognitive profile:', error);
    }
}

function compareAssessments(results1, results2) {
    const comparison = {
        overallChange: {},
        dimensionChanges: {},
        cognitiveEvolution: '',
        recommendations: []
    };

    // Compare overall cognitive types
    const type1 = results1.overallProfile?.type || 'Unknown';
    const type2 = results2.overallProfile?.type || 'Unknown';
    
    comparison.overallChange = {
        from: type1,
        to: type2,
        changed: type1 !== type2
    };

    // Compare dimensions
    Object.keys(results1.dimensions).forEach(dimension => {
        const dim1 = results1.cognitiveFingerprint?.primary[dimension];
        const dim2 = results2.cognitiveFingerprint?.primary[dimension];
        
        if (dim1 && dim2) {
            comparison.dimensionChanges[dimension] = {
                pattern: {
                    from: dim1.pattern,
                    to: dim2.pattern,
                    changed: dim1.pattern !== dim2.pattern
                },
                confidence: {
                    from: dim1.confidence,
                    to: dim2.confidence,
                    change: dim2.confidence - dim1.confidence
                }
            };
        }
    });

    // Generate evolution narrative
    if (comparison.overallChange.changed) {
        comparison.cognitiveEvolution = `You've evolved from a ${type1} to a ${type2}, showing growth in your cognitive approach.`;
    } else {
        comparison.cognitiveEvolution = `You've maintained your ${type1} cognitive style, showing consistency in your approach.`;
    }

    return comparison;
}

function getDimensionExplanations() {
    return {
        texture: {
            name: "Information Texture",
            description: "How you prefer information to 'feel' - whether smooth and flowing, rough and grippable, shifting like sand, or moldable like clay.",
            patterns: {
                smooth_flowing: "You prefer seamless, connected information that flows logically from one concept to the next",
                rough_grippable: "You need concrete, tangible concepts with clear boundaries that you can mentally grasp",
                sand_shifting: "You appreciate flexible, adaptable information that can be viewed from multiple perspectives",
                clay_moldable: "You want to actively shape and transform ideas through hands-on manipulation"
            }
        },
        temperature: {
            name: "Learning Temperature",
            description: "Your emotional and cognitive temperature preferences - from cool analysis to warm narratives to hot urgency.",
            patterns: {
                cool_logical: "You thrive in objective, analytical environments with systematic reasoning",
                warm_narrative: "You learn best through stories, emotional connections, and personally meaningful contexts",
                hot_urgent: "You're motivated by intensity, immediacy, and high-stakes applications",
                alternating_temp: "You benefit from variety in emotional intensity and pacing"
            }
        },
        ecosystem: {
            name: "Concept Ecosystem",
            description: "How you organize and relate concepts - like a garden, city, forest, or ocean.",
            patterns: {
                garden_organic: "You see natural, evolving connections between ideas that grow organically",
                city_systems: "You prefer organized, systematic relationships with clear functions",
                forest_hierarchical: "You think in structured levels and hierarchies",
                ocean_depth: "You explore deep, far-reaching connections across vast conceptual distances"
            }
        },
        temporal: {
            name: "Learning Rhythms",
            description: "Your natural learning rhythms and timing patterns - steady like tides, deep like seasons, burst like lightning, or pulsed like a heartbeat.",
            patterns: {
                tidal_steady: "You work best with consistent, regular patterns and predictable rhythms",
                seasonal_deep: "You prefer cycles of preparation followed by intensive learning periods",
                lightning_burst: "You learn through sudden insights and intense focus sessions",
                heartbeat_maintenance: "You maintain steady progress with periodic acceleration"
            }
        },
        spatial: {
            name: "Mental Construction",
            description: "How you build and organize knowledge - from the ground up, top-down, in modules, or organically flowing.",
            patterns: {
                foundation_up: "You build knowledge systematically from basic principles to complex applications",
                big_picture_down: "You start with comprehensive overviews and fill in specific details",
                modular: "You learn in independent pieces that can be flexibly combined over time",
                flowing: "You allow understanding to develop organically following natural curiosity"
            }
        }
    };
}

async function generateDetailedRecommendations(results) {
    const recommendations = await generatePersonalizedRecommendations(results);
    
    // Add contextual explanations
    recommendations.explanations = {
        studyTechniques: "These techniques align with your cognitive patterns for optimal information processing",
        learningEnvironments: "These environments support your natural cognitive preferences",
        technologicalTools: "These tools complement your thinking style and processing patterns",
        collaborationStrategies: "These approaches match your social and interactive learning preferences",
        timeManagement: "These timing strategies align with your natural learning rhythms",
        skillDevelopment: "These areas represent opportunities for cognitive growth and balance"
    };

    return recommendations;
}

module.exports = router;