import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CourseList } from './pages/CourseList';
import { CourseDetail } from './pages/CourseDetail';
import { Dashboard } from './pages/Dashboard';
import { MyCourses } from './pages/MyCourses';
import { BlogList } from './pages/BlogList';
import { BlogDetail } from './pages/BlogDetail';
import { ToolLibrary } from './pages/ToolLibrary';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PoliciesPage } from './pages/PoliciesPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CourseList />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/:id" element={<BlogDetail />} />
        <Route path="tools" element={<ToolLibrary />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
        <Route path="admin/courses" element={<ProtectedRoute allowedRoles={['Instructor', 'Admin']}><Dashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};
