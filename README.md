# 🚀 ProView-AI

> **Ace Your Interviews with AI-Powered Preparation**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Now-green?style=for-the-badge&logo=vercel)](https://pro-view-ai.vercel.app/)  
![Tech](https://img.shields.io/badge/Tech_Stack-MERN,_Gemini_API,_TailwindCSS-blue?style=for-the-badge)  
![License](https://img.shields.io/github/license/anuj07-creater/ProView-AI?style=for-the-badge)  
![Stars](https://img.shields.io/github/stars/anuj07-creater/ProView-AI?style=for-the-badge)  

---

## 📌 Overview

**ProView-AI** is an AI-powered interview preparation platform designed to give you personalized Q&A sessions based on your target role, years of experience, and focus topics. Powered by **Google's Gemini API**, it delivers tailored interview questions, in-depth explanations, and tools to organize your learning.

---

## ✨ Features

- 🤖 **AI-Powered Questions** – Generate interview questions tailored to your role and experience level.
- 📚 **Detailed AI Answers** – Expand answers with deep explanations instantly.
- 🎯 **Customizable Preparation** – Set role, years of experience, and focus areas.
- 📂 **Save & Revisit** – Organize Q&A sessions and revisit them anytime.
- 🛠 **Multi-Role Support** – Prepare for multiple roles such as Frontend, Backend, etc.
- ⚡ **Gemini API Integration** – Ensures accurate and context-rich answers.

---

## 🖼 Screenshots

### Landing Page
![Landing Page](./screenshots/Screenshot_1.png)

### Create a New Interview Session
![Create Session](./screenshots/Screenshot_2.png)

### Frontend Developer Q&A
![Frontend Developer Q&A](./screenshots/Screenshot_3.png)

### Backend Developer Q&A
![Backend Developer Q&A](./screenshots/Screenshot_4.png)

---

## 🛠 Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **AI:** Google Gemini API  
- **Deployment:** Vercel  

---


## ⚙️ Installation

Follow these steps to set up and run **ProView-AI** on your local machine.

### Prerequisites

Ensure the following software is installed:

- Node.js (v18 or later)
- npm (comes with Node.js)
- MongoDB (Local installation or MongoDB Atlas)
- Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/anuj07-creater/ProView-AI.git
cd ProView-AI
```

### 2. Install Dependencies

Install the required packages for both the backend and frontend.

**Backend**

```bash
cd server
npm install
```

**Frontend**

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory and add the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

> **Note:** Never commit your `.env` file to GitHub. Make sure it is listed in your `.gitignore` file.

### 4. Run the Application

Open **two terminal windows**.

**Terminal 1 – Start the Backend**

```bash
cd server
npm run dev
```

**Terminal 2 – Start the Frontend**

```bash
cd client
npm run dev
```

### 5. Access the Application

Open your browser and visit:

```text
http://localhost:5173
```