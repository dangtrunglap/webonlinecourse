import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem 0' }} className="container">
                <Outlet />
            </main>
            <footer style={{
                borderTop: '1px solid var(--border-color)',
                padding: '2rem 0',
                textAlign: 'center',
                color: 'var(--text-secondary)'
            }}>
                <p>&copy; 2026 GHTXDBK. All rights reserved.</p>
            </footer>
        </div>
    );
};
