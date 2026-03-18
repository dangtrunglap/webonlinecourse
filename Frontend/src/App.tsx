import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import { ResourceLibrary } from './pages/ResourceLibrary';
import { ToolLibrary } from './pages/ToolLibrary';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CourseList />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/:id" element={<BlogDetail />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="tools" element={<ToolLibrary />} />
            <Route path="my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="admin/courses" element={<ProtectedRoute allowedRoles={['Instructor', 'Admin']}><Dashboard /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
