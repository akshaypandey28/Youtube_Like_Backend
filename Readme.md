# Video Upload Platform backend
`npm run dev`

The VideoTube Backend is a REST API built with Node.js, Express.js, and MongoDB for managing user authentication, profile management, and media uploads. It’s designed to be scalable, secure, and easy to extend for a complete video-sharing platform.

## ✨ Key Features

### User Authentication & Authorization

- Register, login, and logout functionality

- Secure JWT-based authentication with access & refresh tokens


### Profile Management

- Update profile details (name, email)

- Change password securely


### File Upload Handling

- Upload media files using Multer

- Store them on Cloudinary for optimized delivery

- Local file cleanup after upload


### Security & Best Practices

- Validation for all incoming requests

- Environment-based configuration using .env


### Clean Code Structure

- Controllers for business logic

- Middlewares for authentication & file handling

- Utilities for async error handling, custom API responses, and Cloudinary


---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (Access & Refresh Tokens)
- **File Storage:** Cloudinary, Multer
- **Utilities:** bcrypt for password hashing, dotenv for environment variables