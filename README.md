# Progress Tracker

A comprehensive Next.js 14 web application for tracking student progress in a 15-day Cambridge Lower Secondary Mathematics crash course. Features both a tutor dashboard for creating assessments and a student interface optimized for iPad use.

## 🎯 Features

### For Tutors
- **Markdown-based Assessment Creation**: Create assessments using intuitive markdown syntax
- **Real-time Preview**: See how assessments will look before publishing
- **Question Type Support**: MCQ, Written, and Calculation questions
- **Validation System**: Built-in validation to ensure proper assessment format

### For Students
- **iPad-Optimized Interface**: Touch-friendly design perfect for iPad use
- **Digital Canvas**: Advanced drawing component with Apple Pencil support
- **Progress Tracking**: Real-time progress indicators and completion status
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

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage for canvas drawings
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel

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
   
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
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

---

**Built with ❤️ for Cambridge Mathematics Education**
