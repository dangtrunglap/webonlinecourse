import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            borderBottom: '2px solid var(--accent-color)', /* Thick navy border to match logo ring */
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '1rem 0'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                    {/* Assuming the user will save the image as logo.jpg in the public folder */}
                    <img src="/logo.jpg" alt="Logo" style={{ height: '36px', width: 'auto', borderRadius: '50%' }} onError={(e) => {
                        // Fallback to icon if logo is missing or named differently
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                    }} />
                    <BookOpen color="var(--accent-color)" size={28} style={{ display: 'none' }} />
                    <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>GHTXDBK</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/">Courses</Link>
                    {isAuthenticated ? (
                        <>
                            {user?.role === 'Student' && <Link to="/my-courses">My Learning</Link>}
                            {(user?.role === 'Instructor' || user?.role === 'Admin') && (
                                <Link to="/admin/courses" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <UserIcon size={16} /> {user?.name}
                                </span>
                                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-secondary">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
