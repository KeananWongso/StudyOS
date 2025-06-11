const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();

const profilesPath = path.join(__dirname, '../../data/user-profiles');

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileFile = path.join(profilesPath, `profile_${userId}.json`);
        
        if (await fs.pathExists(profileFile)) {
            const profile = await fs.readJson(profileFile);
            res.json(profile);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
});

router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;
        
        await fs.ensureDir(profilesPath);
        
        const profileFile = path.join(profilesPath, `profile_${userId}.json`);
        let profile = {};
        
        if (await fs.pathExists(profileFile)) {
            profile = await fs.readJson(profileFile);
        }
        
        profile = { ...profile, ...profileData };
        profile.userId = userId;
        profile.lastUpdated = new Date().toISOString();
        
        await fs.writeJson(profileFile, profile, { spaces: 2 });
        
        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.get('/:userId/recommendations', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileFile = path.join(profilesPath, `profile_${userId}.json`);
        
        if (await fs.pathExists(profileFile)) {
            const profile = await fs.readJson(profileFile);
            const recommendations = generateRecommendations(profile);
            res.json(recommendations);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

router.get('/:userId/learning-history', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileFile = path.join(profilesPath, `profile_${userId}.json`);
        
        if (await fs.pathExists(profileFile)) {
            const profile = await fs.readJson(profileFile);
            const history = profile.assessmentHistory || [];
            res.json(history);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error retrieving learning history:', error);
        res.status(500).json({ error: 'Failed to retrieve learning history' });
    }
});

function generateRecommendations(profile) {
    const recommendations = {
        studyTechniques: [],
        environmentalFactors: [],
        resourceTypes: [],
        generalTips: []
    };
    
    const dominantPattern = profile.dominantPattern;
    const results = profile.latestResults || {};
    
    if (dominantPattern === 'visual' || (results.visual && results.visual.score > 60)) {
        recommendations.studyTechniques.push(
            "Use mind maps and diagrams to organize information",
            "Create flashcards with visual cues",
            "Highlight and color-code your notes"
        );
        recommendations.environmentalFactors.push(
            "Study in well-lit areas",
            "Keep your study space organized and clutter-free"
        );
        recommendations.resourceTypes.push(
            "Video tutorials and demonstrations",
            "Infographics and visual guides",
            "Charts and graphs"
        );
    }
    
    if (dominantPattern === 'auditory' || (results.auditory && results.auditory.score > 60)) {
        recommendations.studyTechniques.push(
            "Read materials aloud",
            "Record lectures and review them",
            "Explain concepts to yourself or others"
        );
        recommendations.environmentalFactors.push(
            "Study with soft background music if helpful",
            "Use quiet spaces for reading"
        );
        recommendations.resourceTypes.push(
            "Podcasts and audio books",
            "Recorded lectures",
            "Discussion groups and study partners"
        );
    }
    
    if (dominantPattern === 'kinesthetic' || (results.kinesthetic && results.kinesthetic.score > 60)) {
        recommendations.studyTechniques.push(
            "Take breaks to move around while studying",
            "Use hands-on activities and experiments",
            "Write notes by hand rather than typing"
        );
        recommendations.environmentalFactors.push(
            "Study in different locations",
            "Use a standing desk or exercise ball"
        );
        recommendations.resourceTypes.push(
            "Interactive simulations",
            "Hands-on workshops",
            "Physical models and manipulatives"
        );
    }
    
    if (dominantPattern === 'social' || (results.social && results.social.score > 60)) {
        recommendations.studyTechniques.push(
            "Form study groups",
            "Teach concepts to others",
            "Participate in class discussions"
        );
        recommendations.environmentalFactors.push(
            "Study in collaborative spaces",
            "Join online learning communities"
        );
        recommendations.resourceTypes.push(
            "Group projects and presentations",
            "Peer tutoring sessions",
            "Online forums and discussion boards"
        );
    }
    
    recommendations.generalTips = [
        "Review and adjust your study methods regularly",
        "Combine different learning approaches for best results",
        "Take regular breaks to maintain focus",
        "Set specific learning goals and track your progress"
    ];
    
    return recommendations;
}

module.exports = router;