import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Enrollment {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    enrollmentDate: string;
}

export const MyCourses: React.FC = () => {
    const [courses, setCourses] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const { data } = await api.get('/enrollments/my-courses');
                setCourses(data);
            } catch (err) {
                console.error('Failed to load enrolled courses', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading your modules...</div>;

    return (
        <div className="container">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My Learning</h1>

            {courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>You aren't enrolled in any courses yet.</h3>
                    <Link to="/" className="btn btn-primary">Explore Courses</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {courses.map(course => (
                        <Link to={`/courses/${course.id}`} key={course.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } } as any}>
                            <div style={{ height: '160px', backgroundColor: 'var(--surface-color)', position: 'relative' }}>
                                {course.thumbnailUrl ? (
                                    <img src={`http://localhost:5078${course.thumbnailUrl}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'linear-gradient(135deg, var(--surface-color), var(--surface-hover))' }}>
                                        No image
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{course.title}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Enrolled on {new Date(course.enrollmentDate).toLocaleDateString()}
                                </div>
                                <div style={{ marginTop: '1rem', width: '100%', height: '4px', background: 'var(--surface-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: '0%', height: '100%', background: 'var(--accent-color)' }}></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>0% complete</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
