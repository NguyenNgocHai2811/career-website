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
import JobSearch from './pages/JobSearch/JobSearch.jsx';
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard.jsx';
import Messaging from './pages/Messaging/Messaging.jsx';
import CareerExplorer from './pages/CareerAI/CareerExplorer.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminJobs from './pages/Admin/AdminJobs.jsx';
import AdminPosts from './pages/Admin/AdminPosts.jsx';

import CompanyProfile from './pages/Company/CompanyProfile.jsx';
import MyNetwork from './pages/Network/MyNetwork.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/saved-jobs" element={<Profile />} />
        <Route path="/profile/:userId/*" element={<Profile />} />
        <Route path="/company/:companyId" element={<CompanyProfile />} />
        <Route path="/network" element={<MyNetwork />} />
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/recruiter/*" element={<RecruiterDashboard />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/career-ai" element={<CareerExplorer />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
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
