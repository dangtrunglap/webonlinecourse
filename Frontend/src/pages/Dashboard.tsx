import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Plus, Trash, Upload } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    price: number;
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // New Course state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            // In a real app we'd have a specific endpoint for instructor's courses
            // We'll reuse the generic search and assume standard access rules, but API currently returns all
            // For MVP, we'll just fetch all and filter client side if not admin, or rely on API to filter in future
            const { data } = await api.get('/courses?pageSize=50');
            // Instructors see only their courses theoretically, but for MVP we use the general list
            setCourses(data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', { title, description, price });
            setTitle('');
            setDescription('');
            setPrice(0);
            fetchMyCourses();
        } catch (err) {
            alert('Failed to create course');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchMyCourses();
        } catch (err) {
            alert('Failed to delete course');
        }
    };

    const handleThumbnailUpload = async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post(`/courses/${id}/thumbnail`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Thumbnail uploaded successfully!');
        } catch (err) {
            alert('Failed to upload thumbnail');
        }
    };

    return (
        <div className="container">
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{user?.role === 'Admin' ? 'Admin Dashboard' : 'Instructor Dashboard'}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> Create New Course
                    </h2>
                    <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price ($)</label>
                            <input type="number" step="0.01" required value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Course</button>
                    </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Manage Courses</h2>
                    {loading ? <p>Loading courses...</p> : courses.length === 0 ? <p>No courses found.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {courses.map(course => (
                                <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{course.title}</h3>
                                        <span style={{ color: 'var(--text-secondary)' }}>${course.price.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <label className="btn btn-secondary" style={{ padding: '0.5rem', cursor: 'pointer' }} title="Upload Thumbnail">
                                            <Upload size={16} />
                                            <input type="file" style={{ display: 'none' }} onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleThumbnailUpload(course.id, e.target.files[0]);
                                                }
                                            }} />
                                        </label>
                                        <button onClick={() => handleDelete(course.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--danger-color)' }} title="Delete Course">
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
