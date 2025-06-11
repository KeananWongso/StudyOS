# Learning Pattern Assessment System

A comprehensive web application for assessing individual learning patterns and providing personalized learning recommendations.

## Project Structure

```
learning-pattern-assessment/
├── frontend/                 # Client-side application
│   ├── index.html           # Main HTML file
│   ├── css/
│   │   └── styles.css       # Styling
│   ├── js/
│   │   └── app.js          # Frontend JavaScript
│   └── assets/             # Images and other assets
├── backend/                 # Server-side application
│   ├── server.js           # Main server file
│   ├── routes/             # API route handlers
│   │   ├── questions.js    # Question management
│   │   ├── assessments.js  # Assessment processing
│   │   └── profiles.js     # User profile management
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── scoring-algorithms/ # Scoring and analysis
│       ├── index.js        # Main scoring interface
│       ├── basic-scoring.js
│       ├── weighted-scoring.js
│       └── pattern-analysis.js
├── data/                   # Data storage
│   ├── assessment-questions/
│   │   ├── sample-questions.json
│   │   └── question-categories.json
│   ├── scoring-algorithms/ # Algorithm configurations
│   └── user-profiles/      # User data and profiles
│       ├── sample-profile.json
│       └── profile-schema.json
├── tests/                  # Test files
│   ├── frontend/
│   └── backend/
└── package.json           # Project dependencies
```

## Features

### Frontend
- Interactive assessment interface
- Responsive design
- Real-time progress tracking
- Results visualization
- User profile management

### Backend
- RESTful API design
- Multiple scoring algorithms
- User profile persistence
- Assessment history tracking
- Learning recommendations

### Assessment System
- 10 comprehensive questions covering:
  - Information processing preferences
  - Memory retention methods
  - Problem-solving approaches
  - Study environment preferences
  - Instruction preferences
  - Note-taking styles
  - Concentration factors
  - Feedback preferences
  - Test preparation methods
  - Comprehension patterns

### Learning Patterns
- **Visual**: Learning through charts, diagrams, and visual organization
- **Auditory**: Learning through listening, discussions, and verbal processing
- **Kinesthetic**: Learning through hands-on experience and physical practice
- **Social**: Learning through collaboration and group interaction

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## API Endpoints

### Questions
- `GET /api/questions` - Retrieve assessment questions
- `POST /api/questions` - Add new questions
- `GET /api/questions/categories` - Get question categories

### Assessments
- `POST /api/assessments/calculate-results` - Calculate assessment results
- `POST /api/assessments/save-results` - Save assessment results
- `GET /api/assessments/:assessmentId` - Get specific assessment
- `GET /api/assessments/user/:userId` - Get user's assessments

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles/:userId` - Update user profile
- `GET /api/profiles/:userId/recommendations` - Get learning recommendations
- `GET /api/profiles/:userId/learning-history` - Get assessment history

## Scoring Algorithms

### Basic Scoring
Simple percentage-based scoring for each learning pattern.

### Weighted Scoring
Advanced scoring that considers:
- Question category weights
- Answer confidence levels
- Pattern interactions

### Pattern Analysis
Comprehensive analysis including:
- Pattern compatibility
- Learning efficiency
- Adaptability scoring
- Detailed recommendations

## Usage

1. **Take Assessment**: Complete the 10-question assessment
2. **View Results**: See your learning pattern breakdown
3. **Get Recommendations**: Receive personalized study suggestions
4. **Track Progress**: Monitor your learning pattern evolution over time

## Development

### Scripts
- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Adding New Questions
1. Add questions to `data/assessment-questions/sample-questions.json`
2. Update categories in `question-categories.json` if needed
3. Restart the server

### Customizing Scoring
Modify algorithms in `backend/scoring-algorithms/` to adjust:
- Pattern weights
- Category importance
- Recommendation logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details