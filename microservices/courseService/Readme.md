# EduVerse - Course Service

## Overview

The Course Service is a critical microservice component of the EduVerse e-learning platform. This service manages all course-related functionality, including course information, enrollments, lesson content, and assessment through quizzes.

## Features

- **Course Management**: Create, read, update, and delete courses
- **Enrollment Tracking**: Manage student enrollments in courses
- **Lesson Content**: Organize educational content through lessons with videos and notes
- **Assessment**: Create and manage quizzes with multiple-choice questions
- **Learning Outcomes**: Track and display expected outcomes for each course

## Tech Stack

- **Framework**: Node.js with Express
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (Integration with User Service)
- **Validation**: Express validators for request validation

## Database Schema

The service utilizes the following database schema:

![Database Schema](/microservices/courseService/SchemaDiagram.svg)

### Key Entities

- **Course**: Main entity storing course details and metadata
- **Lesson**: Educational content units within courses
- **Quiz**: Assessments associated with lessons
- **Question & Option**: Components of quizzes
- **Enrollment**: Tracks student registration in courses
- **CourseOutcome**: Expected learning outcomes for courses

## API Endpoints

### Courses

- `POST /courses/create` - Create a new course
- `PUT /courses/update/:id` - Update course details
- `DELETE /courses/delete/:id` - Delete a course
- `GET /courses/all` - List all courses
- `GET /courses/get/:id` - Get course details by ID
- `GET /courses/getByInstructorId/:id` - Get courses by instructor ID

### Enrollments

- `POST /enrollments/enroll` - Enroll a student in a course
- `DELETE /enrollments/unenroll/:id` - Unenroll a student from a course
- `GET /enrollments/student/:studentId` - Get enrollments for a specific student
- `GET /enrollments/course/:courseId` - Get all enrollments for a specific course

### Lessons

- `POST /lessons/add/:courseId` - Add a new lesson to a course
- `GET /lessons/get/:courseId` - Get all lessons for a specific course
- `PUT /lessons/update/:lessonId` - Update lesson content
- `DELETE /lessons/delete/:lessonId` - Delete a lesson

### Course Outcomes

- `POST /outcomes/add/:courseId` - Add a new outcome to a course
- `GET /outcomes/get/:courseId` - Get all outcomes for a specific course
- `DELETE /outcomes/delete/:outcomeId` - Delete a course outcome

### Quizzes

- `POST /quizzes/create/:lessonId` - Create a quiz for a lesson
- `GET /quizzes/get/:lessonId` - Get quiz for a specific lesson
- `POST /quizzes/addQuestion/:lessonId` - Add a question to a quiz
- `GET /quizzes/getQuestions/:lessonId` - Get all questions for a quiz
- `PUT /quizzes/update/:questionId` - Update a quiz question
- `DELETE /quizzes/delete/:questionId` - Delete a quiz question

### Search & Filtering

- `GET /search/courses` - Search for courses
- `GET /search/filter` - Filter courses by criteria

## Environment Setup

```
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/eduverse_courses"

# Service Configuration
PORT=3001
NODE_ENV=development

# Authentication 
JWT_SECRET=your_jwt_secret
USER_SERVICE_URL=http://user-service:3000
```

## Project Structure

```
course-service/
├── controllers/               # Request handlers
│   ├── courseController.js
│   ├── enrollmentController.js
│   ├── lessonController.js
│   ├── outcomeController.js
│   ├── quizController.js
│   └── searchController.js
├── middleware/
│   ├── validators/            # Request validation
│   │   ├── courseValidator.js
│   │   ├── lessonValidator.js
│   │   └── validateResult.js
├── routes/                    # API routes
│   ├── courseRoutes.js
│   ├── enrollmentRoutes.js
│   ├── lessonRoutes.js
│   ├── outcomeRoutes.js
│   ├── quizRoutes.js
│   └── searchRoutes.js
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
└── server.js                  # Main application entry point
```

## Installation & Running

1. Clone the repository
```bash
git clone https://github.com/eduverse/course-service.git
cd course-service
```

2. Install dependencies
```bash
npm install
```

3. Run database migrations
```bash
npx prisma migrate dev
```

4. Start the service
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Microservice Communication

This service communicates with other EduVerse microservices:

- **User Service**: For authentication and user information
- **Payment Service**: For course purchases
- **Notification Service**: For enrollment confirmations and course updates

## Development Guidelines

- Follow RESTful API design principles
- Write unit tests for all new endpoints
- Document API changes
- Run database migrations for schema changes

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT
