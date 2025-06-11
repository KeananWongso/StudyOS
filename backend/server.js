const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const questionRoutes = require('./routes/questions');
const profileRoutes = require('./routes/profiles');
const assessmentRoutes = require('./routes/assessments');
const cognitiveAssessmentRoutes = require('./routes/cognitive-assessment');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes first
app.use('/api/questions', questionRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/cognitive-assessment', cognitiveAssessmentRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Learning Pattern Assessment API is running' });
});

// HTML routes (before static middleware to override default index.html)
// Route for the new cognitive assessment system (default)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index-cognitive.html'));
});

// Route for cognitive assessment specifically 
app.get('/cognitive', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index-cognitive.html'));
});

app.get('/assessment', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index-cognitive.html'));
});

// Route for the original/legacy UI
app.get('/legacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route for smart planner (will redirect to cognitive assessment which includes planner)
app.get('/planner', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index-cognitive.html'));
});

// Static file middleware (after specific routes)
app.use(express.static(path.join(__dirname, '../frontend')));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Learning Pattern Assessment server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});