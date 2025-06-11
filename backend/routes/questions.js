const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();

const questionsPath = path.join(__dirname, '../../data/assessment-questions');

router.get('/', async (req, res) => {
    try {
        const questionsFile = path.join(questionsPath, 'questions.json');
        
        if (await fs.pathExists(questionsFile)) {
            const questions = await fs.readJson(questionsFile);
            res.json(questions);
        } else {
            const defaultQuestions = getDefaultQuestions();
            await fs.ensureDir(questionsPath);
            await fs.writeJson(questionsFile, defaultQuestions, { spaces: 2 });
            res.json(defaultQuestions);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

router.post('/', async (req, res) => {
    try {
        const questions = req.body;
        const questionsFile = path.join(questionsPath, 'questions.json');
        
        await fs.ensureDir(questionsPath);
        await fs.writeJson(questionsFile, questions, { spaces: 2 });
        
        res.json({ message: 'Questions saved successfully', count: questions.length });
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({ error: 'Failed to save questions' });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categoriesFile = path.join(questionsPath, 'categories.json');
        
        if (await fs.pathExists(categoriesFile)) {
            const categories = await fs.readJson(categoriesFile);
            res.json(categories);
        } else {
            const defaultCategories = getDefaultCategories();
            await fs.ensureDir(questionsPath);
            await fs.writeJson(categoriesFile, defaultCategories, { spaces: 2 });
            res.json(defaultCategories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

function getDefaultQuestions() {
    return [
        {
            id: 1,
            category: "information_processing",
            text: "When learning new information, I prefer to:",
            options: [
                { id: 'a', text: "Read about it in detail", pattern: 'visual', weight: 1 },
                { id: 'b', text: "Listen to explanations", pattern: 'auditory', weight: 1 },
                { id: 'c', text: "Try it hands-on", pattern: 'kinesthetic', weight: 1 },
                { id: 'd', text: "Discuss it with others", pattern: 'social', weight: 1 }
            ]
        },
        {
            id: 2,
            category: "memory_retention",
            text: "I remember information best when:",
            options: [
                { id: 'a', text: "I can see it written or drawn", pattern: 'visual', weight: 1 },
                { id: 'b', text: "I hear it explained", pattern: 'auditory', weight: 1 },
                { id: 'c', text: "I practice it repeatedly", pattern: 'kinesthetic', weight: 1 },
                { id: 'd', text: "I teach it to someone else", pattern: 'social', weight: 1 }
            ]
        },
        {
            id: 3,
            category: "problem_solving",
            text: "When solving problems, I tend to:",
            options: [
                { id: 'a', text: "Draw diagrams or charts", pattern: 'visual', weight: 1 },
                { id: 'b', text: "Talk through the problem", pattern: 'auditory', weight: 1 },
                { id: 'c', text: "Work through examples", pattern: 'kinesthetic', weight: 1 },
                { id: 'd', text: "Brainstorm with others", pattern: 'social', weight: 1 }
            ]
        },
        {
            id: 4,
            category: "study_environment",
            text: "My ideal study environment is:",
            options: [
                { id: 'a', text: "Quiet with good lighting and organized materials", pattern: 'visual', weight: 1 },
                { id: 'b', text: "With background music or recorded lectures", pattern: 'auditory', weight: 1 },
                { id: 'c', text: "Where I can move around and use tools", pattern: 'kinesthetic', weight: 1 },
                { id: 'd', text: "In a group study setting", pattern: 'social', weight: 1 }
            ]
        },
        {
            id: 5,
            category: "instruction_preference",
            text: "I prefer instructions that are:",
            options: [
                { id: 'a', text: "Written step-by-step with illustrations", pattern: 'visual', weight: 1 },
                { id: 'b', text: "Explained verbally", pattern: 'auditory', weight: 1 },
                { id: 'c', text: "Demonstrated while I follow along", pattern: 'kinesthetic', weight: 1 },
                { id: 'd', text: "Discussed in a group setting", pattern: 'social', weight: 1 }
            ]
        }
    ];
}

function getDefaultCategories() {
    return [
        {
            id: "information_processing",
            name: "Information Processing",
            description: "How you prefer to receive and process new information"
        },
        {
            id: "memory_retention",
            name: "Memory Retention", 
            description: "Methods that help you best remember information"
        },
        {
            id: "problem_solving",
            name: "Problem Solving",
            description: "Your approach to tackling problems and challenges"
        },
        {
            id: "study_environment",
            name: "Study Environment",
            description: "Environmental factors that optimize your learning"
        },
        {
            id: "instruction_preference",
            name: "Instruction Preference",
            description: "How you prefer to receive instructions and guidance"
        }
    ];
}

module.exports = router;