const basicScoring = require('./basic-scoring');
const weightedScoring = require('./weighted-scoring');
const patternAnalysis = require('./pattern-analysis');

module.exports = {
    calculateLearningPatterns: (answers, algorithm = 'weighted') => {
        switch (algorithm) {
            case 'basic':
                return basicScoring.calculate(answers);
            case 'weighted':
                return weightedScoring.calculate(answers);
            case 'advanced':
                return patternAnalysis.calculate(answers);
            default:
                return weightedScoring.calculate(answers);
        }
    },

    getPatternRecommendations: (results) => {
        return patternAnalysis.generateRecommendations(results);
    },

    compareAssessments: (previousResults, currentResults) => {
        return patternAnalysis.compareResults(previousResults, currentResults);
    },

    getConfidenceScore: (results) => {
        return patternAnalysis.calculateConfidence(results);
    }
};