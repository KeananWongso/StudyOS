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

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/questions', questionRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/cognitive-assessment', cognitiveAssessmentRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Learning Pattern Assessment API is running' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

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