function calculate(answers) {
    const patterns = {
        visual: { count: 0, score: 0 },
        auditory: { count: 0, score: 0 },
        kinesthetic: { count: 0, score: 0 },
        social: { count: 0, score: 0 }
    };

    let totalAnswers = 0;

    answers.forEach(answer => {
        if (answer && answer.pattern) {
            patterns[answer.pattern].count++;
            totalAnswers++;
        }
    });

    Object.keys(patterns).forEach(pattern => {
        if (totalAnswers > 0) {
            patterns[pattern].score = Math.round((patterns[pattern].count / totalAnswers) * 100);
        }
        patterns[pattern].description = getPatternDescription(pattern);
        patterns[pattern].strength = getStrengthLevel(patterns[pattern].score);
    });

    return {
        results: patterns,
        totalQuestions: totalAnswers,
        dominantPattern: getDominantPattern(patterns),
        algorithm: 'basic',
        timestamp: new Date().toISOString()
    };
}

function getPatternDescription(pattern) {
    const descriptions = {
        visual: "You learn best through visual aids like charts, diagrams, written instructions, and seeing information organized spatially.",
        auditory: "You prefer learning through listening, verbal explanations, discussions, and processing information through sound.",
        kinesthetic: "You learn most effectively through hands-on experience, physical practice, movement, and tactile exploration.",
        social: "You thrive in collaborative learning environments, group discussions, and learning through interaction with others."
    };
    return descriptions[pattern] || "Learning pattern not recognized.";
}

function getStrengthLevel(score) {
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Mild';
    return 'Minimal';
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
        strength: getStrengthLevel(maxScore)
    };
}

module.exports = {
    calculate
};