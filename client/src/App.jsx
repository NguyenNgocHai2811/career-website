import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register/Register.jsx'; 
import Homepage from './pages/Homepage/HomePage.jsx';
import Login from './pages/Login/Login.jsx';
import Onboarding from './pages/Onboarding/Onboarding.jsx';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx';
import CheckEmail from './pages/CheckEmail/CheckEmail.jsx';
import ResetPassword from './pages/ResetPassword/ResetPassword.jsx';
import ResetSuccess from './pages/ResetSuccess/ResetSuccess.jsx';
import Feed from './pages/Feed/Feed.jsx';
import Profile from './pages/Profile/Profile.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/success" element={<ResetSuccess />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
