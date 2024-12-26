# Need Volunteer (Volunteer Management Website)

### (Server-side Repository)

It is a user-friendly platform for volunteer management where users can create, update, and delete volunteer need posts. Additionally, users can volunteer for others' posts. Through this project, I have learned and practiced securing APIs using JWT (jsonwebtoken), Firebase Authentication, React Router, creating APIs with Express.js, and performing CRUD operations with a MongoDB database. This project can be considered a simple MERN stack application.

## Live Site URL
[Need Volunteer](https://need-volunteer-40.netlify.app/)

## Key Features
- During login or sign-up, a JWT token is stored in the user's browser application. The token is removed upon logout.
- If a user's browser does not contain a valid JWT token, they cannot access any private routes or APIs. Attempting to access them explicitly will result in automatic logout.
- Users cannot access other users' data using their JWT token. Each user has an individual token stored in their browser's cookies. Any explicit attempt to access others' data will result in automatic logout.
- Authentication is implemented using Firebase, and API authorization is secured using JWT.
- The platform includes a search functionality for posts and a visibility toggle. Users can view posts in a grid layout or switch to a table layout.

## NPM Packages Used in This Project
- `axios`
- `date-fns`
- `lottie-react`
- `react-datepicker`
- `react-helmet-async`
- `react-icons`
- `sweetalert2`
- `swiper`
