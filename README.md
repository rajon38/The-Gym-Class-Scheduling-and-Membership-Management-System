
# Project Overview

This project is a Class Scheduling and Booking System designed to facilitate the management of classes, trainers, and trainees. Admins can create classes and schedules, trainers can view their assigned schedules, and trainees can book or cancel classes based on availability. The system supports role-based access control to ensure proper authorization.

# Relation Diagram

![Relational Diagram](./The%20Gym%20Class%20Scheduling%20and%20Membership%20Management%20System.png)

# Technology Stack

- Backend: Node.js, Express.js

- Database: MongoDB with Mongoose ODM

- Authentication: JWT (JSON Web Tokens)

- Middleware: Role-based access control with custom middleware

- API Testing: Postman

# API Endpoints
## Auth Routes

### Register User

- POST /register

- Body Parameters:

    fullName (string, required)

    email (string, required)

    password (string, required)

### Login User
- POST /login

- Body Parameters:

    email (string, required)

    password (string, required)

### Get All Users

- GET /allUsers

- Query Parameters: role (optional: 'Trainer', 'Trainee')

### Get a User
- GET /user/:id
- Headers: token (JWT)
- Parameters: userId

### Get Profile
- GET /profile

- Headers: token (JWT)

### Update Profile
- PUT /profile

- Headers: token (JWT), role: Admin, Trainee

### Create a Trainer
- POST /trainers
- Headers: token (JWT), role: Admin
- Body Parameters:

    fullName (string, required)

    email (string, required)

    password (string, required)

### Update a Trainer
- PUT /trainers/:id
- Headers: token (JWT), role: Admin
- Body Parameters:

    fullName (string, required)

### Delete a User
- DELETE /user/:id
- Headers: token (JWT), role: Admin
- Query Parameters: role (optional: 'Trainer', 'Trainee')

## Class Routes

### Create a Class

- POST /class

- Headers: token (JWT), role: Admin

- Body Parameters:


  name (string, required)

  description (string, optional)



### Get All Classes

- GET /class


### Create Class Schedule

- POST /schedule

- Headers: token (JWT), role: Admin

- Body Parameters:

  classId (string, required)

  trainerId (string, required)

  date (string, required)

  startTime (string, required)

  endTime (string, required)


### Get Assigned Schedules (Trainer)

- GET /schedule/assigned

- Headers: token (JWT), role: Trainer


### Get Available Schedules (Trainee)

- GET /schedule/available

- Headers: token (JWT), role: Trainee

- Query Parameters: date (string, required)

## Booking Routes

### Book a Class

- POST /schedule/book

- Headers: token (JWT), role: Trainee

- Body Parameters:

    classScheduleId (string, required)


### Get Trainee Bookings

- GET /schedule/bookings

- Headers: token (JWT), role: Trainee


### Cancel a Booking

- DELETE /schedule/cancel

- Headers: token (JWT), role: Trainee/Admin

- Body Parameters:

    classScheduleId (string, required)

    traineeId (string, required if Admin)

# Database Schema

## UsersSchema

```bash
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String,
  role: String, // 'Admin', 'Trainer', 'Trainee'
  createdAt: Date,
  updatedAt: Date
```

## ClassesSchema

```bash
  _id: ObjectId,
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
```

## ClassSchedulesSchema

```bash
  _id: ObjectId,
  class: ObjectId, // Reference to Class
  trainer: ObjectId, // Reference to User (Trainer)
  date: Date,
  startTime: String,
  endTime: String,
  trainees: [ObjectId], // References to Users (Trainees)
  createdAt: Date,
  updatedAt: Date
```

## BookingsSchema

```bash
  _id: ObjectId,
  schedule:: trainees: [ObjectId], // References to classSchedule (classSchedule)
  trainees: [ObjectId], // References to Users (Trainees)
  createdAt: Date,
  updatedAt: Date
```

# Admin Credentials

- Email: admin@gmail.com

- Password: 1234567

# Instructions to Run Locally
### Clone the repository:
```bash
https://github.com/rajon38/The-Gym-Class-Scheduling-and-Membership-Management-System.git
```
### Install dependencies:
```bash
npm install
```
### Set up the environment variables:
Create a .env file and configure the following:
```bash
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
```
### Start the server:
```bash
npm run dev
```
### Test the API:
Use Postman to interact with the endpoints.
https://documenter.getpostman.com/view/24585156/2sAYHxn3n4


# Live Hosting Link
https://vercel.com/rajon38s-projects/the-gym-class-scheduling-and-membership-management-system/

# Thank You