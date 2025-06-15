# Progress Tracker - AI-Assisted Manual Grading System

A comprehensive Next.js 15.3.3 web application for tracking student progress in a 15-day Cambridge Lower Secondary Mathematics crash course. Features an advanced AI-assisted manual grading workflow that replaces automated grading with human-AI collaboration, ensuring all student feedback is reviewed and approved by tutors.

## 🚀 Latest Major Update: AI-Assisted Manual Grading Workflow

This project has been completely enhanced with a sophisticated AI-assisted manual grading system that combines the power of AI analysis with human expertise to provide the highest quality feedback to students.

## 🎯 Features

### For Tutors
- **📝 Review Queue Dashboard**: Manage all pending student submissions with intelligent prioritization
- **🤖 AI Canvas Analysis**: Get intelligent suggestions for grading student canvas work using Gemini AI
- **📊 Comprehensive Analytics**: Track student progress and identify learning gaps across the curriculum
- **🎯 Curriculum Integration**: Use imported Day 1-10 Cambridge curriculum as single source of truth
- **💬 Detailed Feedback System**: Provide personalized, question-by-question feedback to students
- **📈 Manual Grading Workflow**: Complete control over all grading with AI assistance
- **Markdown-based Assessment Creation**: Create assessments using intuitive markdown syntax
- **Real-time Preview**: See how assessments will look before publishing
- **Question Type Support**: MCQ, Written, and Calculation questions
- **Validation System**: Built-in validation to ensure proper assessment format

### For Students
- **📱 Interactive Assessments**: Take assessments with integrated canvas support for mathematical working
- **📈 Progress Tracking**: View performance across different topics with detailed analytics
- **💬 Tutor Feedback**: Receive detailed, human-reviewed feedback for each question
- **⏱️ Status Updates**: Track submission status (pending, under review, completed)
- **📊 Performance Insights**: Visual progress indicators and improvement recommendations
- **iPad-Optimized Interface**: Touch-friendly design perfect for iPad use
- **Digital Canvas**: Advanced drawing component with Apple Pencil support
- **Auto-save**: Automatic saving of answers and canvas drawings
- **Personal Dashboard**: User-specific progress and data isolation

### Authentication & Security
- **Gmail-Only Access**: Secure Google OAuth with Gmail domain restriction
- **User-Scoped Data**: Complete data isolation between users
- **Session Management**: Persistent login with secure token handling
- **Role-Based Access**: Student and tutor roles with appropriate permissions
- **Route Protection**: Automatic redirect to login for unauthenticated users

### Analytics & Insights
- **Weakness Detection**: AI-powered algorithm to identify areas needing improvement
- **Performance Visualization**: Charts and graphs showing progress over time
- **Personalized Recommendations**: Tailored study suggestions based on performance
- **Chapter-wise Analysis**: Detailed breakdown of performance by topic
- **User-Specific Analytics**: Individual progress tracking and insights

## 🔄 AI-Assisted Manual Grading Workflow

### Complete Human-AI Collaboration System

This system replaces automatic grading with a comprehensive review workflow that ensures all student feedback is carefully reviewed and approved by tutors before being sent to students.

#### 1. **Student Submission Phase**
```
Student completes assessment → Submits with status: 'pending' → No automatic grading applied
```

#### 2. **Tutor Review Queue**
```
Tutor Dashboard → Review Queue → View all pending submissions → Select submission for review
```
- **Smart Prioritization**: Submissions sorted by submission time and student needs
- **Status Filtering**: View pending, in-review, or completed submissions
- **Batch Management**: Handle multiple submissions efficiently

#### 3. **AI-Assisted Canvas Analysis**
```
GPT-4o analyzes student drawings → Provides intelligent grading suggestions → Tutor reviews AI insights
```
- **Canvas Work Analysis**: AI examines mathematical working shown in drawings
- **Grading Suggestions**: Recommended points and feedback based on work quality
- **Error Detection**: Identifies calculation mistakes and conceptual errors
- **Advanced Vision**: GPT-4o provides detailed analysis of handwritten work

#### 4. **Manual Review & Grading**
```
Tutor reviews AI suggestions → Modifies feedback as needed → Assigns final grades → Approves submission
```
- **Question-by-Question Review**: Individual grading for each assessment question
- **AI-Enhanced Feedback**: Use AI suggestions as starting point for personalized feedback
- **Grade Override**: Complete tutor control over final grades and feedback
- **Quality Assurance**: Human oversight ensures appropriate and helpful feedback

#### 5. **Student Feedback Delivery**
```
Status changes to 'completed' → Student receives tutor-approved feedback → Detailed analytics updated
```
- **Rich Feedback Display**: Question-by-question feedback with grades
- **Progress Integration**: Feedback contributes to overall analytics and weakness detection
- **Status Transparency**: Students can track their submission through the review process

### Key Workflow Benefits
- **🎯 Quality Assurance**: Every piece of feedback is human-reviewed
- **⚡ Efficiency**: AI suggestions speed up the grading process
- **📈 Consistency**: Standardized review process across all submissions
- **💡 Intelligence**: AI helps identify patterns tutors might miss
- **🔍 Transparency**: Clear status tracking for both tutors and students

## 🚀 Tech Stack

### Core Technologies
- **Frontend**: Next.js 15.3.3 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with advanced workflow management
- **Database**: Firebase Firestore with dual-storage architecture
- **AI Integration**: Google Gemini API for canvas analysis
- **Storage**: Firebase Storage for canvas drawings
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel

### AI & Analysis
- **GPT-4o API**: Advanced canvas analysis and grading suggestions
- **Weakness Detection Algorithm**: Custom AI-powered student analytics
- **Real-time Processing**: Live analysis and feedback generation
- **Mock Implementation**: Fallback system for development/testing

### Database Architecture
- **Dual Storage Pattern**: User-scoped and global collections for optimal access
- **Real-time Updates**: Firestore listeners for live data synchronization
- **Review Workflow Schema**: Extended data models for grading workflow
- **Backward Compatibility**: Maintains support for existing assessment data

## 📱 iPad Optimization

- Touch-first design with minimum 44px touch targets
- Apple Pencil pressure sensitivity support
- Palm rejection on canvas
- Smooth 60fps drawing performance
- Responsive design for portrait and landscape modes
- Gesture-friendly navigation

## 🛠 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Enable Google Authentication
   - Get your Firebase configuration

3. **Configure OAuth Consent Screen**
   - Follow the detailed guide in `OAUTH_SETUP_GUIDE.md`
   - Set up Google Cloud Console OAuth consent screen
   - Add test users for development

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase and AI configuration in `.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # AI Integration (Optional - uses mock analysis if not provided)
   OPENAI_API_KEY=sk-your_openai_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
   
7. **Test Authentication**
   - You'll be redirected to the login page
   - Sign in with a Gmail account (must be added as test user)
   - Complete the authentication testing checklist

## 📖 Usage

### Creating Assessments (Tutor Dashboard)

1. Navigate to `/tutor`
2. Use the markdown editor to create assessments:

```markdown
# Day 1: Number Operations

## Question 1 [mcq] [5 points] [number_operations]
What is the result of 12 + 3 × 4 - 2?
A) 22 ✓
B) 58
C) 18
D) 46

## Question 2 [written] [10 points] [estimation]
Estimate the value of 47 × 23
Answer: 1000-1200

## Question 3 [calculation] [15 points] [order_operations]
Calculate: (-5) × (-3) + 7
Answer: 22
```

3. Preview the assessment
4. Save and publish

### Taking Assessments (Student Interface)

1. Navigate to the main dashboard
2. Select an available assessment
3. Answer questions using:
   - Multiple choice selections
   - Text input for written answers
   - Digital canvas for working and calculations
4. Navigate between questions
5. Submit when complete

### Viewing Analytics

1. Navigate to `/results`
2. View comprehensive analytics including:
   - Overall progress percentage
   - Chapter-wise performance
   - Weakness identification
   - Personalized recommendations
   - Progress over time

## 🔄 Using the AI-Assisted Grading Workflow

### For Tutors: Review & Grading Process

#### 1. **Access Review Queue**
```
Tutor Dashboard → "Review Queue" button → View all pending submissions
```

#### 2. **Start Review Process**
- Select a pending submission from the queue
- Click "Start Review" to begin the grading process
- System automatically marks submission as "in_review"

#### 3. **Navigate Through Questions**
- Use the question navigation sidebar
- Review each question individually
- View student answers and canvas drawings

#### 4. **AI-Assisted Analysis**
- Click "Get AI Analysis" on questions with canvas drawings
- Review AI suggestions including:
  - Grading recommendations
  - Identified strengths and weaknesses
  - Suggested feedback text
  - Confidence scores

#### 5. **Manual Grading**
- Write personalized feedback for each question
- Assign point values (0 to maximum points)
- Mark questions as correct/incorrect
- Modify AI suggestions as needed

#### 6. **Complete Review**
- Review all questions have feedback and grades
- Click "Complete Review" to finalize
- Student receives notification of completed review

### For Students: Tracking Submission Status

#### 1. **Submit Assessment**
- Complete assessment with canvas work
- Submit and receive "Pending Review" status
- No immediate automatic grade provided

#### 2. **Track Review Progress**
- Dashboard shows submission status:
  - ⏱️ **Pending Review**: Waiting for tutor
  - 📝 **Under Review**: Tutor actively grading
  - ✅ **Reviewed & Graded**: Complete with feedback

#### 3. **Receive Detailed Feedback**
- Question-by-question feedback from tutor
- Individual grades with explanations
- Overall score and performance insights
- Tutor-approved suggestions for improvement

### Review Status Indicators

| Status | Icon | Description | Actions Available |
|--------|------|-------------|------------------|
| Pending | ⏱️ | Awaiting tutor review | None (student waits) |
| In Review | 📝 | Tutor actively grading | Track progress |
| Completed | ✅ | Graded with feedback | View detailed feedback |

## 🧮 Assessment Markdown Format

### Question Types

**Multiple Choice Question (MCQ)**
```markdown
## Question 1 [mcq] [5 points] [chapter_name]
Question text here?
A) Option 1
B) Option 2 ✓
C) Option 3
D) Option 4
```

**Written Question**
```markdown
## Question 2 [written] [10 points] [chapter_name]
Question text here?
Answer: Expected answer or range
```

**Calculation Question**
```markdown
## Question 3 [calculation] [15 points] [chapter_name]
Calculate: Mathematical expression
Answer: Numerical answer
```

### Format Rules

- Use `✓` to mark correct MCQ options
- Points can be any positive integer
- Chapter names should use underscores (e.g., `number_operations`)
- Each assessment must start with `# Day X: Title`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy**: Automatic deployment on push to main branch

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

## 🔌 Key API Endpoints

### AI-Assisted Grading Workflow
- `GET /api/review-queue` - Fetch submissions for tutor review
- `PUT /api/review-queue` - Update submission status and grades
- `POST /api/analyze-canvas` - AI canvas analysis with Gemini API
- `POST /api/responses` - Submit assessments (now with review workflow)

### Assessment Management
- `GET /api/assessments` - Fetch all assessments
- `POST /api/assessments` - Create new assessments
- `DELETE /api/assessments` - Delete assessments with complete cleanup

### Analytics & Progress
- `GET /api/analytics` - Student performance analytics
- `GET /api/tutor/analytics` - Tutor dashboard analytics
- `GET /api/tutor/responses` - All student responses for tutor

## 📊 Database Schema Updates

### Enhanced StudentResponse
```typescript
interface StudentResponse {
  // Core fields
  id?: string;
  dayId: string;
  studentId: string;
  answers: Record<string, StudentAnswer>;
  canvasDrawings?: Record<string, string>;
  score: number;
  timeSpent: number;
  completedAt?: any;
  
  // NEW: Review Workflow Fields
  status?: 'pending' | 'in_review' | 'completed';
  reviewStartedAt?: Date;
  reviewCompletedAt?: Date;
  reviewedBy?: string; // Tutor email
  tutorFeedback?: Array<{
    questionId: string;
    aiSuggestion?: string;
    tutorFeedback: string;
    grade: number;
    maxPoints: number;
    isCorrect: boolean;
  }>;
  totalScore?: number;
  feedbackSentAt?: Date;
}
```

## 🔧 Implementation Notes

### Key Components Added
- **`ReviewQueue.tsx`** - Tutor submission management dashboard
- **`AssessmentReview.tsx`** - Individual submission review interface
- **`/api/analyze-canvas`** - AI canvas analysis endpoint
- **Enhanced `StudentDashboard.tsx`** - Status tracking and feedback display

### AI Integration
- **Mock Implementation**: Functional without API key for development
- **Gemini Ready**: Easy configuration for production AI analysis
- **Fallback System**: Graceful degradation when AI unavailable

### Backward Compatibility
- **Legacy Support**: Existing assessments continue to work
- **Dual Display**: Both old and new feedback formats supported
- **Migration Path**: Smooth transition from auto-grading to manual review

---

**Built with ❤️ for Cambridge Mathematics Education - Now with Advanced AI-Assisted Grading**
