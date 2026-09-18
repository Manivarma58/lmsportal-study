import React from "react";

function Assignments() {
    return (
        <>
            <style>
{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.assignments-container {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    padding: 2rem;
}

:root {
    --primary-color: #4361ee;
    --primary-dark: #3a56d4;
    --secondary-color: #6c757d;
    --dark-color: #1a1a1a;
    --gray-color: #6c757d;
    --light-color: #f8f9fa;
    --border-color: #e9ecef;
    --danger-color: #dc3545;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --border-radius: 12px;
    --shadow-sm: 0 2px 8px rgba(67, 97, 238, 0.08);
    --shadow-md: 0 6px 20px rgba(67, 97, 238, 0.12);
    --shadow-lg: 0 10px 30px rgba(67, 97, 238, 0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.assignments-header {
    margin-bottom: 2.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(67, 97, 238, 0.1);
}

.assignments-header h2 {
    color: var(--dark-color);
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #4361ee 0%, #3a56d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.assignments-header p {
    color: var(--gray-color);
    margin-top: 0.75rem;
    font-size: 1.05rem;
    font-weight: 500;
}

/* Enhanced Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
    padding: 1.8rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(67, 97, 238, 0.1);
    text-align: center;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
    border-radius: 5px 5px 0 0;
}

.stat-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(67, 97, 238, 0.2);
}

.stat-card.success::before { background: linear-gradient(90deg, var(--success-color), #1ea346); }
.stat-card.warning::before { background: linear-gradient(90deg, var(--warning-color), #f59e0b); }
.stat-card.danger::before { background: linear-gradient(90deg, var(--danger-color), #b91c1c); }
.stat-card.info::before { background: linear-gradient(90deg, var(--info-color), #0d9488); }
.stat-card.primary::before { background: linear-gradient(90deg, var(--primary-color), var(--primary-dark)); }

.stat-value {
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--dark-color);
    margin-bottom: 0.5rem;
    line-height: 1;
}

.stat-label {
    font-size: 0.9rem;
    color: var(--gray-color);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Enhanced Table Container */
.assignments-table-wrapper {
    background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(67, 97, 238, 0.1);
    overflow: hidden;
    margin-top: 2rem;
}

/* Enhanced Table Styles */
.assignments-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: transparent;
}

.assignments-table thead {
    background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(67, 97, 238, 0.02) 100%);
    backdrop-filter: blur(10px);
}

.assignments-table th {
    padding: 1.2rem 1.5rem;
    text-align: left;
    font-weight: 700;
    color: var(--dark-color);
    border-bottom: 2px solid rgba(67, 97, 238, 0.1);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.assignments-table td {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(67, 97, 238, 0.08);
    color: var(--dark-color);
    font-size: 0.95rem;
    font-weight: 500;
}

.assignments-table tbody tr {
    transition: var(--transition);
    background: transparent;
}

.assignments-table tbody tr:hover {
    background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(67, 97, 238, 0.02) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.1);
}

.assignments-table tbody tr:last-child td {
    border-bottom: none;
}

/* Enhanced Badges */
.status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 700;
    text-align: center;
    min-width: 120px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-warning {
    background: linear-gradient(135deg, #ffd166 0%, #fbbf24 100%);
    color: #92400e;
}

.badge-success {
    background: linear-gradient(135deg, #06d6a0 0%, #10b981 100%);
    color: #064e3b;
}

.badge-danger {
    background: linear-gradient(135deg, #ef476f 0%, #dc2626 100%);
    color: #7f1d1d;
}

.badge-info {
    background: linear-gradient(135deg, #118ab2 0%, #0d9488 100%);
    color: white;
}

.badge-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
}

/* Enhanced Buttons */
.btn-sm {
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    min-width: 120px;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25);
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-dark) 0%, #304fd6 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.35);
}

.btn-secondary {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: var(--gray-color);
    border: 2px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    transform: translateY(-2px);
}

.btn-outline-danger {
    background: transparent;
    color: var(--danger-color);
    border: 2px solid var(--danger-color);
}

.btn-outline-danger:hover {
    background: linear-gradient(135deg, rgba(239, 71, 111, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    transform: translateY(-2px);
}

/* Enhanced Topic Label */
.topic-label {
    display: inline-block;
    background: linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(67, 97, 238, 0.05) 100%);
    color: var(--primary-color);
    padding: 0.4rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(67, 97, 238, 0.2);
}

/* Responsive Enhancements */
@media (max-width: 768px) {
    .assignments-container {
        padding: 1.5rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }
    
    .assignments-header {
        padding: 1.5rem;
    }
    
    .assignments-header h2 {
        font-size: 1.8rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .stat-card {
        padding: 1.5rem;
    }
    
    .stat-value {
        font-size: 2.2rem;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .assignments-header h2 {
        font-size: 1.6rem;
    }
    
    .btn-sm {
        min-width: 100px;
        padding: 0.4rem 1rem;
    }
}
`}
</style>

            <div className="assignments-container">
                <div className="assignments-header">
                    <h2>My Assignments</h2>
                    <p>Track and manage all your course assignments</p>
                </div>

                {/* Summary Cards */}
                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-value">5</div>
                        <div className="stat-label">Total Assignments</div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-value">2</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-value">1</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-value">1</div>
                        <div className="stat-label">Not Attempted</div>
                    </div>
                    <div className="stat-card danger">
                        <div className="stat-value">1</div>
                        <div className="stat-label">Expired</div>
                    </div>
                </div>

                {/* Assignments Table */}
                <div className="assignments-table-wrapper">
                    <table className="assignments-table">
                        <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Topic</th>
                            <th>Created On</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td>
                                <strong>React Basics Test</strong>
                            </td>
                            <td>
                                <span className="topic-label">Components & Props</span>
                            </td>
                            <td>10 Sep 2025</td>
                            <td>20 Sep 2025</td>
                            <td>
                                <span className="status-badge badge-warning">
                                    Not Attempted
                                </span>
                            </td>
                            <td>
                                <button className="btn-sm btn-primary">
                                    Attempt Test
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Java Fundamentals</strong>
                            </td>
                            <td>
                                <span className="topic-label">OOP Concepts</span>
                            </td>
                            <td>05 Sep 2025</td>
                            <td>15 Sep 2025</td>
                            <td>
                                <span className="status-badge badge-success">
                                    Completed
                                </span>
                            </td>
                            <td>
                                <button className="btn-sm btn-secondary" disabled>
                                    Completed
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>DSA Quiz</strong>
                            </td>
                            <td>
                                <span className="topic-label">Arrays</span>
                            </td>
                            <td>12 Sep 2025</td>
                            <td>22 Sep 2025</td>
                            <td>
                                <span className="status-badge badge-danger">
                                    Expired
                                </span>
                            </td>
                            <td>
                                <button className="btn-sm btn-outline-danger" disabled>
                                    Expired
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Web Development Final</strong>
                            </td>
                            <td>
                                <span className="topic-label">Full Stack</span>
                            </td>
                            <td>15 Sep 2025</td>
                            <td>25 Sep 2025</td>
                            <td>
                                <span className="status-badge badge-info">
                                    In Progress
                                </span>
                            </td>
                            <td>
                                <button className="btn-sm btn-primary">
                                    Continue
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Database Systems</strong>
                            </td>
                            <td>
                                <span className="topic-label">SQL Queries</span>
                            </td>
                            <td>08 Sep 2025</td>
                            <td>18 Sep 2025</td>
                            <td>
                                <span className="status-badge badge-success">
                                    Graded: 95%
                                </span>
                            </td>
                            <td>
                                <button className="btn-sm btn-secondary">
                                    View Results
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Assignments;