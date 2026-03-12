import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string | null;
    instructorName: string;
}

export const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showPayment, setShowPayment] = useState(false);
    const [card, setCard] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${id}`);
                setCourse(data);
            } catch (err) {
                setError('Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleEnrollClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowPayment(true);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnrollLoading(true);
        setError('');

        try {
            await api.post(`/enrollments/${id}/enroll`, {
                cardNumber: card,
                expiryDate: expiry,
                cvv
            });
            setSuccess('Successfully enrolled in the course!');
            setShowPayment(false);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to enroll.');
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading...</div>;
    if (!course) return <div style={{ textAlign: 'center', padding: '4rem 0' }}>Course not found.</div>;

    return (
        <div className="container">
            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(248,81,73,0.1)', padding: '1rem', borderRadius: '8px' }}>{error}</div>}
            {success && <div style={{ color: 'var(--success-color)', marginBottom: '1rem', background: 'rgba(46,160,67,0.1)', padding: '1rem', borderRadius: '8px' }}>{success}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{course.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>{course.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <span style={{ fontWeight: 600 }}>Instructor:</span> {course.instructorName}
                    </div>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Course Content</h2>
                    <div style={{ color: 'var(--text-secondary)', padding: '2rem', background: 'var(--surface-color)', borderRadius: '8px', textAlign: 'center' }}>
                        {success ? 'Course materials are now unlocked!' : 'Enroll to access course materials.'}
                    </div>
                </div>

                <div>
                    <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                        {course.thumbnailUrl && (
                            <img src={`http://localhost:5078${course.thumbnailUrl}`} alt={course.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1.5rem' }} />
                        )}
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>${course.price.toFixed(2)}</h2>

                        {!showPayment ? (
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleEnrollClick} disabled={!!success}>
                                {success ? 'Go to Course' : 'Enroll Now'}
                            </button>
                        ) : (
                            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Secure Payment</h3>
                                <input type="text" placeholder="Card Number (mock: any 12+ digits)" value={card} onChange={e => setCard(e.target.value)} required minLength={12} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="text" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} required />
                                    <input type="text" placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={enrollLoading}>
                                    {enrollLoading ? 'Processing...' : `Pay $${course.price.toFixed(2)}`}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPayment(false)}>Cancel</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
