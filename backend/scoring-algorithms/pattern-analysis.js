function calculate(answers) {
    const weightedResults = require('./weighted-scoring').calculate(answers);
    
    const enhancedResults = {
        ...weightedResults,
        algorithm: 'advanced',
        patternInteractions: analyzePatternInteractions(weightedResults.results),
        learningEfficiency: calculateLearningEfficiency(weightedResults.results),
        adaptabilityScore: calculateAdaptability(answers),
        recommendations: generateDetailedRecommendations(weightedResults.results)
    };

    return enhancedResults;
}

function analyzePatternInteractions(patterns) {
    const interactions = {};
    const patternNames = Object.keys(patterns);
    
    for (let i = 0; i < patternNames.length; i++) {
        for (let j = i + 1; j < patternNames.length; j++) {
            const pattern1 = patternNames[i];
            const pattern2 = patternNames[j];
            const interactionKey = `${pattern1}_${pattern2}`;
            
            interactions[interactionKey] = {
                compatibility: calculateCompatibility(patterns[pattern1], patterns[pattern2]),
                synergy: calculateSynergy(pattern1, pattern2, patterns),
                recommendation: getInteractionRecommendation(pattern1, pattern2, patterns)
            };
        }
    }
    
    return interactions;
}

function calculateCompatibility(pattern1Data, pattern2Data) {
    const scoreDifference = Math.abs(pattern1Data.score - pattern2Data.score);
    const compatibility = 100 - (scoreDifference * 0.5);
    return Math.max(0, Math.min(100, compatibility));
}

function calculateSynergy(pattern1, pattern2, patterns) {
    const synergyMatrix = {
        'visual_auditory': 0.8,
        'visual_kinesthetic': 0.9,
        'visual_social': 0.7,
        'auditory_kinesthetic': 0.6,
        'auditory_social': 0.9,
        'kinesthetic_social': 0.8
    };
    
    const key1 = `${pattern1}_${pattern2}`;
    const key2 = `${pattern2}_${pattern1}`;
    
    const baseSynergy = synergyMatrix[key1] || synergyMatrix[key2] || 0.5;
    const scoreSum = patterns[pattern1].score + patterns[pattern2].score;
    const adjustedSynergy = baseSynergy * (scoreSum / 100);
    
    return Math.round(adjustedSynergy * 100);
}

function getInteractionRecommendation(pattern1, pattern2, patterns) {
    const score1 = patterns[pattern1].score;
    const score2 = patterns[pattern2].score;
    
    if (score1 > 50 && score2 > 50) {
        return getCombinedApproachRecommendation(pattern1, pattern2);
    } else if (Math.abs(score1 - score2) < 20) {
        return getBalancedApproachRecommendation(pattern1, pattern2);
    }
    
    return getComplementaryApproachRecommendation(pattern1, pattern2);
}

function getCombinedApproachRecommendation(pattern1, pattern2) {
    const combinations = {
        'visual_auditory': "Combine visual materials with verbal explanations. Use annotated diagrams and recorded lectures.",
        'visual_kinesthetic': "Use interactive visual tools, hands-on building with visual guides, and physical manipulation of visual elements.",
        'visual_social': "Create visual presentations for group discussions and collaborative mind mapping sessions.",
        'auditory_kinesthetic': "Engage in verbal practice while doing hands-on activities, like explaining processes while performing them.",
        'auditory_social': "Participate in group discussions, verbal brainstorming, and peer teaching sessions.",
        'kinesthetic_social': "Engage in collaborative hands-on projects and group experiments."
    };
    
    const key1 = `${pattern1}_${pattern2}`;
    const key2 = `${pattern2}_${pattern1}`;
    
    return combinations[key1] || combinations[key2] || "Combine both approaches for optimal learning.";
}

function getBalancedApproachRecommendation(pattern1, pattern2) {
    return `Your ${pattern1} and ${pattern2} preferences are fairly balanced. Try alternating between both approaches or combining them based on the complexity of the material.`;
}

function getComplementaryApproachRecommendation(pattern1, pattern2) {
    return `Use your stronger ${pattern1 > pattern2 ? pattern1 : pattern2} preference as your primary approach, while occasionally incorporating ${pattern1 > pattern2 ? pattern2 : pattern1} elements to reinforce learning.`;
}

function calculateLearningEfficiency(patterns) {
    const scores = Object.values(patterns).map(p => p.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const variance = calculateVariance(scores);
    
    const dominanceStrength = maxScore;
    const patternBalance = 100 - variance;
    const consistencyScore = 100 - (maxScore - minScore);
    
    const efficiency = (dominanceStrength * 0.4) + (patternBalance * 0.3) + (consistencyScore * 0.3);
    
    return {
        overall: Math.round(efficiency),
        dominanceStrength: Math.round(dominanceStrength),
        patternBalance: Math.round(patternBalance),
        consistency: Math.round(consistencyScore),
        interpretation: getEfficiencyInterpretation(efficiency)
    };
}

function calculateVariance(scores) {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDifferences = scores.map(score => Math.pow(score - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / scores.length;
}

function getEfficiencyInterpretation(efficiency) {
    if (efficiency >= 80) return "Highly efficient learning profile with clear preferences";
    if (efficiency >= 65) return "Good learning efficiency with some adaptability";
    if (efficiency >= 50) return "Moderate efficiency, benefits from varied approaches";
    return "Flexible learning profile, adapts well to different methods";
}

function calculateAdaptability(answers) {
    if (!answers || answers.length === 0) return 0;
    
    const patternSwitches = countPatternSwitches(answers);
    const consistencyScore = calculateConsistency(answers);
    const diversityScore = calculateDiversity(answers);
    
    const adaptability = (patternSwitches * 0.4) + ((100 - consistencyScore) * 0.3) + (diversityScore * 0.3);
    
    return {
        score: Math.round(adaptability),
        interpretation: getAdaptabilityInterpretation(adaptability),
        factors: {
            flexibility: Math.round(patternSwitches),
            consistency: Math.round(consistencyScore),
            diversity: Math.round(diversityScore)
        }
    };
}

function countPatternSwitches(answers) {
    let switches = 0;
    let previousPattern = null;
    
    answers.forEach(answer => {
        if (answer && answer.pattern) {
            if (previousPattern && previousPattern !== answer.pattern) {
                switches++;
            }
            previousPattern = answer.pattern;
        }
    });
    
    return Math.min(100, (switches / Math.max(1, answers.length - 1)) * 100);
}

function calculateConsistency(answers) {
    const patternCounts = {};
    let totalAnswers = 0;
    
    answers.forEach(answer => {
        if (answer && answer.pattern) {
            patternCounts[answer.pattern] = (patternCounts[answer.pattern] || 0) + 1;
            totalAnswers++;
        }
    });
    
    if (totalAnswers === 0) return 0;
    
    const maxCount = Math.max(...Object.values(patternCounts));
    return (maxCount / totalAnswers) * 100;
}

function calculateDiversity(answers) {
    const uniquePatterns = new Set();
    
    answers.forEach(answer => {
        if (answer && answer.pattern) {
            uniquePatterns.add(answer.pattern);
        }
    });
    
    return (uniquePatterns.size / 4) * 100; // 4 is the total number of patterns
}

function getAdaptabilityInterpretation(adaptability) {
    if (adaptability >= 75) return "Highly adaptable, thrives with varied learning approaches";
    if (adaptability >= 60) return "Good adaptability, comfortable with multiple methods";
    if (adaptability >= 45) return "Moderate adaptability, prefers some consistency";
    return "Prefers consistent approaches, benefits from routine";
}

function generateDetailedRecommendations(patterns) {
    const recommendations = {
        primary: [],
        secondary: [],
        environmental: [],
        technological: [],
        social: []
    };
    
    const sortedPatterns = Object.entries(patterns)
        .sort(([,a], [,b]) => b.score - a.score);
    
    const [primaryPattern, primaryData] = sortedPatterns[0];
    const [secondaryPattern, secondaryData] = sortedPatterns[1];
    
    recommendations.primary = getPrimaryRecommendations(primaryPattern, primaryData);
    
    if (secondaryData.score >= 30) {
        recommendations.secondary = getSecondaryRecommendations(secondaryPattern, secondaryData);
    }
    
    recommendations.environmental = getEnvironmentalRecommendations(primaryPattern, secondaryPattern);
    recommendations.technological = getTechnologicalRecommendations(primaryPattern, secondaryPattern);
    recommendations.social = getSocialRecommendations(patterns);
    
    return recommendations;
}

function getPrimaryRecommendations(pattern, data) {
    const recommendations = {
        visual: [
            "Use mind maps and concept diagrams for complex topics",
            "Color-code your notes and materials",
            "Create visual timelines and flowcharts",
            "Use flashcards with images and diagrams"
        ],
        auditory: [
            "Read materials aloud or use text-to-speech",
            "Record lectures and review them regularly",
            "Explain concepts to yourself or others",
            "Use music or rhythmic patterns to remember information"
        ],
        kinesthetic: [
            "Take breaks to move around while studying",
            "Use hands-on activities and experiments",
            "Write notes by hand rather than typing",
            "Use physical objects to represent abstract concepts"
        ],
        social: [
            "Form or join study groups",
            "Participate in class discussions and forums",
            "Teach concepts to others",
            "Engage in collaborative projects"
        ]
    };
    
    return recommendations[pattern] || [];
}

function getSecondaryRecommendations(pattern, data) {
    return [`Incorporate ${pattern} elements to complement your primary learning style`];
}

function getEnvironmentalRecommendations(primary, secondary) {
    const environments = {
        visual: ["Well-lit, organized workspace", "Minimal visual distractions", "Wall space for charts and diagrams"],
        auditory: ["Quiet space or appropriate background music", "Good acoustics for recordings", "Minimize sound distractions"],
        kinesthetic: ["Space to move around", "Comfortable seating options", "Access to hands-on materials"],
        social: ["Access to collaborative spaces", "Good internet for online discussions", "Comfortable group meeting areas"]
    };
    
    return [...(environments[primary] || []), ...(environments[secondary] || [])];
}

function getTechnologicalRecommendations(primary, secondary) {
    const tech = {
        visual: ["Mind mapping software", "Digital drawing tools", "Video content platforms"],
        auditory: ["Audio recording apps", "Podcast platforms", "Text-to-speech tools"],
        kinesthetic: ["Interactive simulations", "Virtual reality tools", "Touch-screen devices"],
        social: ["Video conferencing tools", "Collaborative platforms", "Discussion forums"]
    };
    
    return [...(tech[primary] || []), ...(tech[secondary] || [])];
}

function getSocialRecommendations(patterns) {
    const socialScore = patterns.social?.score || 0;
    
    if (socialScore >= 60) {
        return ["Actively seek group learning opportunities", "Consider becoming a peer tutor"];
    } else if (socialScore >= 30) {
        return ["Balance independent and group study", "Occasionally work with study partners"];
    } else {
        return ["Focus on independent study methods", "Use social learning sparingly"];
    }
}

function generateRecommendations(results) {
    return generateDetailedRecommendations(results);
}

function compareResults(previousResults, currentResults) {
    const comparison = {
        changes: {},
        trends: {},
        stability: 0,
        recommendations: []
    };
    
    Object.keys(currentResults).forEach(pattern => {
        if (previousResults[pattern]) {
            const change = currentResults[pattern].score - previousResults[pattern].score;
            comparison.changes[pattern] = {
                change: change,
                direction: change > 0 ? 'increased' : change < 0 ? 'decreased' : 'stable',
                magnitude: Math.abs(change)
            };
        }
    });
    
    const totalChange = Object.values(comparison.changes)
        .reduce((sum, change) => sum + change.magnitude, 0);
    
    comparison.stability = Math.max(0, 100 - (totalChange / 4));
    
    return comparison;
}

function calculateConfidence(results) {
    const scores = Object.values(results).map(r => r.score);
    const maxScore = Math.max(...scores);
    const secondMax = scores.sort((a, b) => b - a)[1] || 0;
    
    const separation = maxScore - secondMax;
    const consistency = maxScore;
    
    return Math.round((separation * 0.6) + (consistency * 0.4));
}

module.exports = {
    calculate,
    generateRecommendations,
    compareResults,
    calculateConfidence
};