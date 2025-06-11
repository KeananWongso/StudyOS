const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const scoringAlgorithms = require('../scoring-algorithms');

const router = express.Router();
const assessmentsPath = path.join(__dirname, '../../data/user-profiles');

router.post('/calculate-results', async (req, res) => {
    try {
        const { answers } = req.body;
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const results = scoringAlgorithms.calculateLearningPatterns(answers);
        
        res.json(results);
    } catch (error) {
        console.error('Error calculating results:', error);
        res.status(500).json({ error: 'Failed to calculate results' });
    }
});

router.post('/save-results', async (req, res) => {
    try {
        const { results, timestamp, userId } = req.body;
        const assessmentId = uuidv4();
        const currentUserId = userId || 'anonymous';
        
        const assessment = {
            id: assessmentId,
            userId: currentUserId,
            results: results,
            timestamp: timestamp || new Date().toISOString(),
            completed: true
        };

        await fs.ensureDir(assessmentsPath);
        
        const assessmentFile = path.join(assessmentsPath, `assessment_${assessmentId}.json`);
        await fs.writeJson(assessmentFile, assessment, { spaces: 2 });

        await updateUserProfile(currentUserId, assessment);
        
        res.json({ 
            message: 'Results saved successfully', 
            assessmentId: assessmentId,
            userId: currentUserId
        });
    } catch (error) {
        console.error('Error saving results:', error);
        res.status(500).json({ error: 'Failed to save results' });
    }
});

router.get('/:assessmentId', async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessmentFile = path.join(assessmentsPath, `assessment_${assessmentId}.json`);
        
        if (await fs.pathExists(assessmentFile)) {
            const assessment = await fs.readJson(assessmentFile);
            res.json(assessment);
        } else {
            res.status(404).json({ error: 'Assessment not found' });
        }
    } catch (error) {
        console.error('Error retrieving assessment:', error);
        res.status(500).json({ error: 'Failed to retrieve assessment' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        await fs.ensureDir(assessmentsPath);
        const files = await fs.readdir(assessmentsPath);
        const assessmentFiles = files.filter(file => file.startsWith('assessment_'));
        
        const userAssessments = [];
        
        for (const file of assessmentFiles) {
            const filePath = path.join(assessmentsPath, file);
            const assessment = await fs.readJson(filePath);
            
            if (assessment.userId === userId) {
                userAssessments.push(assessment);
            }
        }
        
        userAssessments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json(userAssessments);
    } catch (error) {
        console.error('Error retrieving user assessments:', error);
        res.status(500).json({ error: 'Failed to retrieve user assessments' });
    }
});

async function updateUserProfile(userId, assessment) {
    try {
        const profileFile = path.join(assessmentsPath, `profile_${userId}.json`);
        let profile = {};
        
        if (await fs.pathExists(profileFile)) {
            profile = await fs.readJson(profileFile);
        }
        
        profile.userId = userId;
        profile.lastAssessment = assessment.timestamp;
        profile.assessmentCount = (profile.assessmentCount || 0) + 1;
        profile.latestResults = assessment.results;
        
        const dominantPattern = getDominantPattern(assessment.results);
        profile.dominantPattern = dominantPattern;
        
        if (!profile.assessmentHistory) {
            profile.assessmentHistory = [];
        }
        profile.assessmentHistory.push({
            assessmentId: assessment.id,
            timestamp: assessment.timestamp,
            dominantPattern: dominantPattern
        });
        
        await fs.writeJson(profileFile, profile, { spaces: 2 });
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

function getDominantPattern(results) {
    let maxScore = 0;
    let dominantPattern = null;
    
    Object.keys(results).forEach(pattern => {
        if (results[pattern].score > maxScore) {
            maxScore = results[pattern].score;
            dominantPattern = pattern;
        }
    });
    
    return dominantPattern;
}

module.exports = router;