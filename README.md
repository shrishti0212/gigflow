# gigflow

🌟 GigFlow – Freelance Marketplace

A Real-Time MERN Stack Freelancing & Bidding Platform

<div align="center"> <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" /> <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge" /> <img src="https://img.shields.io/badge/Database-MongoDB-success?style=for-the-badge" /> <img src="https://img.shields.io/badge/Socket.io-Real--Time-black?style=for-the-badge" /> </div>

## 📽️ Demo video link:


## 📸 Screenshots
<table>
  <tr>
        <td> <img width="700" height="944" alt="Screenshot 2026-01-13 161826" src="https://github.com/user-attachments/assets/b712d5b9-5681-4a44-bbef-c7194f226c54" /> </td>
      <td> <img width="700" height="941" alt="Screenshot 2026-01-13 161942" src="https://github.com/user-attachments/assets/2201e38f-9016-460c-b10d-fce5d64207fb" /> </td>
  </tr>
  <tr>
    <td> <img width="700" height="943" alt="Screenshot 2026-01-13 161957" src="https://github.com/user-attachments/assets/e3e5ac04-eba4-4052-a828-6f87a4c939b0" /> </td>
<td> <img width="700" height="947" alt="Screenshot 2026-01-13 162524" src="https://github.com/user-attachments/assets/7ae339fe-2638-4bf0-a897-320dca27acaa" /> </td>
  </tr>
</table>


## ✨ About the Project

GigFlow is a freelance marketplace where clients create gigs and freelancers place bids.
Clients can hire instantly, and freelancers receive real-time notifications through Socket.io.


The project includes:

- Secure JWT + Cookie-based Authentication

- User Roles: Gig Owners & Freelancers

- Gig CRUD (Create, Edit, Delete, View)

- Freelancer Bidding System

- Real-Time Hire Notifications

- React + Tailwind clean UI

- MERN Stack with fully modular API design


## 📦 Tech Stack
Layer	Technology
- Frontend - React React Router, Axios, TailwindCSS
- Backend - Node.js, Express.js
- Database - MongoDB (Mongoose)
- Socket.io
- Auth	JWT + HttpOnly Cookies
- Deployment - Vercel (client), Render (server)
  
## ⚙️ Installation Commands
### Clone the project
```bash
git clone <repo-url>
cd gigflow
```

### Backend Setup
```bash
cd server
npm install
npm start
```

### Environment file (server/.env):
```bash
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment file (client/.env):
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## API Endpoints Overview
### 🔐 Authentication
- POST	             /api/auth/register	            Register new user
- POST	             /api/auth/login	              Login + issue cookie
- POST	             /api/auth/logout	              Clear auth cookie
- GET              	/api/auth/me	                  Get logged in user
### 📝 Gigs API
- POST	            /api/gigs	                      Create a new gig
- GET	/api/gigs/my	Owner: view all my gigs
- GET	/api/gigs/available	Freelancer: all open gigs
- GET	/api/gigs/:id	View gig details
- PUT	/api/gigs/:id	Edit gig
- DELETE	/api/gigs/:id	Delete gig
### 💼 Bids API
- POST	/api/bids	Place a bid on a gig
- GET	/api/bids/my	All bids I placed
- GET	/api/bids/gig/:gigId	Owner: all bids on my gig
- GET	/api/bids/my-bid/:gigId	Freelancer: see my bid for this gig
- PATCH	/api/bids/:bidId/hire	Hire freelancer

## ⚡ Real-Time Events (Socket.io)
### Client → Server:
```bash
socket.emit("join", userId)
```

### Server → Client:
```bash
io.to(userId).emit("hired", {
  message: "...",
  gigId,
  gigTitle
})
```

- When a freelancer is hired:
- They get a real-time popup
- Page auto-redirects

## 🧩 Project Structure
```bash
gigflow/
│
├── client/        # React Frontend
│   ├── pages/
│   ├── components/
│   └── api/
│
├── server/        # Node Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── socket.io
│
└── README.md
```

## 🎯 Conclusion

GigFlow is a complete mini-freelancing platform with modern MERN features, real-time communication, and clean modular code.
