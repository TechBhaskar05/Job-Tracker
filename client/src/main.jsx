import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import ToastContainer from './components/ui/Toast.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Board from './pages/Board.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Interview from './pages/Interview.jsx';
import ATS from './pages/ATS.jsx';
import Quiz from './pages/Quiz.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Profile from './pages/Profile.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<App />}>
              <Route index element={<Board />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="interview/:id" element={<Interview />} />
              <Route path="ats" element={<ATS />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

