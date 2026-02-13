## Description
This is my Diploma Project for Master Degree of Computer Science in University of Lodz. The topic of diploma project - Web application in form of bookstore/library. 
The main idea of ​​the project is to combine the functions of a library and a bookstore into a single application with a user-friendly interface and using modern technologies.

## Technologies used
Backend: 
 - Java 17
 - Spring Boot (Web, Data JPA, Data Redis, Mail)
 
 Security: 
 - JWT (jjwt) 
 - BCrypt

Database:
- PostgreSQL 17 (production)
- Redis (2FA codes for Admin autentification, Admin session management)

Frontend:
- React (Tailwind CSS, Context API)

## Structure

- `admin/` - Admin react app.
- `frontend/` — client react app.
- `backend/` — Backend part of a project.
- `backend/sql` — Database part of a project.
