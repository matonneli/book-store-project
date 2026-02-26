## Description
This is my Diploma Project for Master Degree of Computer Science in University of Lodz. The topic of the diploma project is a web application for a bookstore/library. 
The main idea of ​​the project is to combine the functions of a library and a bookstore into a single application with a user-friendly interface and using modern technologies.

## Technologies used
Backend: 
 - Java 17
 - Spring Boot (Web, Data JPA, Data Redis, Mail)
 - Maven for building
 
 Security: 
 - JWT (jjwt) 
 - BCrypt

Database:
- PostgreSQL 17 (production)
- Redis (2FA codes for Admin authentication, Admin session management)

Frontend:
- React 18(for client), 19(for admin) (Tailwind CSS, Bootstrap, Context API, Hooks, Fetch API, React Router)

## Structure

- `admin/` - admin react app.
- `frontend/` — client react app.
- `backend/` — backend part of a project(Spring App).
- `backend/sql` — Database export (full schema).
