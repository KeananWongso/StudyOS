const fs = require('fs-extra');
const path = require('path');

async function loadQuestionCategories() {
    try {
        const categoriesPath = path.join(__dirname, '../../data/assessment-questions/question-categories.json');
        if (await fs.pathExists(categoriesPath)) {
            return await fs.readJson(categoriesPath);
        }
    } catch (error) {
        console.error('Error loading question categories:', error);
    }
    
    return getDefaultCategories();
}

function getDefaultCategories() {
    return [
        { id: "information_processing", weight: 1.0 },
        { id: "memory_retention", weight: 1.2 },
        { id: "problem_solving", weight: 1.1 },
        { id: "study_environment", weight: 0.9 },
        { id: "instruction_preference", weight: 1.0 },
        { id: "note_taking", weight: 0.8 },
        { id: "concentration", weight: 1.1 },
        { id: "feedback_preference", weight: 0.9 },
        { id: "test_preparation", weight: 1.2 },
        { id: "comprehension", weight: 1.3 }
    ];
}

async function calculate(answers) {
    const categories = await loadQuestionCategories();
    const categoryWeights = {};
    
    categories.forEach(cat => {
        categoryWeights[cat.id] = cat.weight || 1.0;
    });

    const patterns = {
        visual: { weightedScore: 0, totalWeight: 0, count: 0 },
        auditory: { weightedScore: 0, totalWeight: 0, count: 0 },
        kinesthetic: { weightedScore: 0, totalWeight: 0, count: 0 },
        social: { weightedScore: 0, totalWeight: 0, count: 0 }
    };

    let totalAnswers = 0;

    answers.forEach((answer, index) => {
        if (answer && answer.pattern) {
            const questionCategory = getQuestionCategory(index + 1);
            const weight = categoryWeights[questionCategory] || 1.0;
            const answerWeight = answer.weight || 1.0;
            const finalWeight = weight * answerWeight;

            patterns[answer.pattern].weightedScore += finalWeight;
            patterns[answer.pattern].totalWeight += finalWeight;
            patterns[answer.pattern].count++;
            totalAnswers++;
        }
    });

    const totalWeight = Object.values(patterns).reduce((sum, pattern) => sum + pattern.totalWeight, 0);

    Object.keys(patterns).forEach(pattern => {
        const patternData = patterns[pattern];
        
        if (totalWeight > 0) {
            patternData.score = Math.round((patternData.weightedScore / totalWeight) * 100);
        } else {
            patternData.score = 0;
        }
        
        patternData.normalizedScore = totalAnswers > 0 ? 
            Math.round((patternData.count / totalAnswers) * 100) : 0;
        
        patternData.description = getPatternDescription(pattern);
        patternData.strength = getStrengthLevel(patternData.score);
        patternData.confidence = calculateConfidence(patternData, totalAnswers);
        
        delete patternData.weightedScore;
        delete patternData.totalWeight;
    });

    const dominantPattern = getDominantPattern(patterns);
    const secondaryPattern = getSecondaryPattern(patterns, dominantPattern.pattern);

    return {
        results: patterns,
        totalQuestions: totalAnswers,
        dominantPattern: dominantPattern,
        secondaryPattern: secondaryPattern,
        learningProfile: generateLearningProfile(patterns, dominantPattern, secondaryPattern),
        algorithm: 'weighted',
        timestamp: new Date().toISOString()
    };
}

function getQuestionCategory(questionId) {
    const categoryMap = {
        1: "information_processing",
        2: "memory_retention", 
        3: "problem_solving",
        4: "study_environment",
        5: "instruction_preference",
        6: "note_taking",
        7: "concentration",
        8: "feedback_preference",
        9: "test_preparation",
        10: "comprehension"
    };
    
    return categoryMap[questionId] || "general";
}

function getPatternDescription(pattern) {
    const descriptions = {
        visual: "You learn best through visual aids like charts, diagrams, written instructions, and seeing information organized spatially. Visual learners benefit from color-coding, mind maps, and graphic organizers.",
        auditory: "You prefer learning through listening, verbal explanations, discussions, and processing information through sound. Auditory learners often benefit from reading aloud, recordings, and group discussions.",
        kinesthetic: "You learn most effectively through hands-on experience, physical practice, movement, and tactile exploration. Kinesthetic learners need to actively engage with material through experimentation and real-world application.",
        social: "You thrive in collaborative learning environments, group discussions, and learning through interaction with others. Social learners benefit from study groups, peer teaching, and collaborative projects."
    };
    return descriptions[pattern] || "Learning pattern not recognized.";
}

function getStrengthLevel(score) {
    if (score >= 75) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 45) return 'Moderate';
    if (score >= 30) return 'Mild';
    return 'Minimal';
}

function calculateConfidence(patternData, totalAnswers) {
    if (totalAnswers === 0) return 0;
    
    const consistencyScore = patternData.count / totalAnswers;
    const strengthScore = patternData.score / 100;
    
    return Math.round((consistencyScore * strengthScore) * 100);
}

function getDominantPattern(patterns) {
    let maxScore = 0;
    let dominantPattern = null;

    Object.keys(patterns).forEach(pattern => {
        if (patterns[pattern].score > maxScore) {
            maxScore = patterns[pattern].score;
            dominantPattern = pattern;
        }
    });

    return {
        pattern: dominantPattern,
        score: maxScore,
        strength: getStrengthLevel(maxScore),
        confidence: patterns[dominantPattern]?.confidence || 0
    };
}

function getSecondaryPattern(patterns, dominantPatternName) {
    let maxScore = 0;
    let secondaryPattern = null;

    Object.keys(patterns).forEach(pattern => {
        if (pattern !== dominantPatternName && patterns[pattern].score > maxScore) {
            maxScore = patterns[pattern].score;
            secondaryPattern = pattern;
        }
    });

    if (maxScore < 20) return null;

    return {
        pattern: secondaryPattern,
        score: maxScore,
        strength: getStrengthLevel(maxScore),
        confidence: patterns[secondaryPattern]?.confidence || 0
    };
}

function generateLearningProfile(patterns, dominant, secondary) {
    const profile = {
        type: 'mixed',
        description: '',
        recommendations: []
    };

    if (dominant.score >= 60) {
        if (secondary && secondary.score >= 40) {
            profile.type = `${dominant.pattern}-${secondary.pattern}`;
            profile.description = `You have a strong ${dominant.pattern} learning preference with significant ${secondary.pattern} tendencies. This combination suggests you learn best when multiple approaches are used together.`;
        } else {
            profile.type = dominant.pattern;
            profile.description = `You have a clear ${dominant.pattern} learning preference. Your learning is most effective when information is presented in ways that align with this pattern.`;
        }
    } else {
        profile.type = 'balanced';
        profile.description = 'You show a balanced learning profile across multiple patterns. You may benefit from using a variety of learning approaches depending on the context and material.';
    }

    return profile;
}

module.exports = {
    calculate
};