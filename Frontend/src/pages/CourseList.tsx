import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../services/api';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string | null;
    instructorName: string;
}

export const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const pageSize = 9;

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/courses?search=${search}&page=${page}&pageSize=${pageSize}`);
                setCourses(data.items);
                setTotal(data.totalCount);
            } catch (err) {
                console.error("Failed to load courses", err);
            } finally {
                setLoading(false);
            }
        };

        // Add debounce for search
        const timer = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <div className="container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-color), #bc8cff)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Chào mừng bạn đến với Góc Học Tập Xây Dựng Bách Khoa
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem' }}>
                    Learn from industry experts and master the skills you need to advance your career.
                </p>

                <div style={{ display: 'flex', width: '100%', maxWidth: '600px', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: '3rem', fontSize: '1.1rem', padding: '1rem 3rem', borderRadius: '50px' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading courses...</div>
            ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>No courses found.</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {courses.map(course => (
                            <Link to={`/courses/${course.id}`} key={course.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } } as any}>
                                <div style={{ height: '180px', backgroundColor: 'var(--surface-color)', position: 'relative' }}>
                                    {course.thumbnailUrl ? (
                                        <img src={`http://localhost:5078${course.thumbnailUrl}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'linear-gradient(135deg, var(--surface-color), var(--surface-hover))' }}>
                                            No image
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 'bold' }}>
                                        ${course.price.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{course.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {course.description}
                                    </p>
                                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <span>By {course.instructorName}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {total > pageSize && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                            <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                            <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {Math.ceil(total / pageSize)}</span>
                            <button className="btn btn-secondary" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
