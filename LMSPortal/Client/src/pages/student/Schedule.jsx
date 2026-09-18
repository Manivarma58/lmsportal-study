import React, { useState, useEffect } from 'react';

function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Figma Prototype Class',
            time: '07:00 - 08:00 AM',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28),
            type: 'class',
            completed: false
        },
        {
            id: 2,
            title: 'Sketch learning',
            time: '07:00 - 08:00 AM',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28),
            type: 'workshop',
            completed: false
        },
        {
            id: 3,
            title: 'Web design test notice',
            time: '08:00 AM',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 29),
            type: 'exam',
            completed: false
        },
        {
            id: 4,
            title: 'Your subscription expires',
            time: '15:00 PM',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 29),
            type: 'reminder',
            completed: false
        },
        {
            id: 5,
            title: 'React Fundamentals Test',
            time: '10:00 - 12:00 AM',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 30),
            type: 'exam',
            completed: false
        }
    ]);

    const [newTask, setNewTask] = useState({
        title: '',
        time: '',
        type: 'class'
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get current month and year
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
        const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
        
        const days = [];
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        
        return days;
    };

    const calendarDays = generateCalendarDays();

    // Filter events for selected date
    const eventsForSelectedDate = events.filter(event => 
        event.date.toDateString() === selectedDate.toDateString()
    );

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleAddTask = () => {
        if (!newTask.title.trim() || !newTask.time.trim()) return;
        
        const newEvent = {
            id: events.length + 1,
            title: newTask.title,
            time: newTask.time,
            date: new Date(selectedDate),
            type: newTask.type,
            completed: false
        };
        
        setEvents([...events, newEvent]);
        setNewTask({ title: '', time: '', type: 'class' });
    };

    const handleEventToggle = (id) => {
        setEvents(events.map(event => 
            event.id === id ? { ...event, completed: !event.completed } : event
        ));
    };

    const handleDeleteEvent = (id) => {
        setEvents(events.filter(event => event.id !== id));
    };

    const isToday = (date) => {
        const today = new Date();
        return date && date.toDateString() === today.toDateString();
    };

    const isSelectedDate = (date) => {
        return date && date.toDateString() === selectedDate.toDateString();
    };

    const getEventCountForDate = (date) => {
        return events.filter(event => event.date.toDateString() === date.toDateString()).length;
    };

    return (
        <div className="schedule-container">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .schedule-container {
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    background: #f5f7fa;
                    padding: 2rem;
                }
                
                /* Header */
                .header {
                    margin-bottom: 2rem;
                }
                
                .header h1 {
                    font-size: 2rem;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                }
                
                .header p {
                    color: #6c757d;
                    font-size: 1rem;
                }
                
                /* Main Grid */
                .main-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                }
                
                /* Calendar Section */
                .calendar-section {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eef2f7;
                }
                
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .calendar-nav {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .calendar-nav-btn {
                    background: #f8f9fa;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .calendar-nav-btn:hover {
                    background: #e9ecef;
                }
                
                .calendar-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                
                .view-switcher {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .view-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid #eef2f7;
                    border-radius: 6px;
                    color: #6c757d;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .view-btn.active {
                    background: #4361ee;
                    color: white;
                    border-color: #4361ee;
                }
                
                /* Calendar Grid */
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }
                
                .calendar-day-header {
                    text-align: center;
                    padding: 0.75rem;
                    font-weight: 600;
                    color: #6c757d;
                    font-size: 0.85rem;
                }
                
                .calendar-day {
                    aspect-ratio: 1;
                    border: 1px solid #eef2f7;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    padding: 0.5rem;
                }
                
                .calendar-day.empty {
                    border: none;
                    cursor: default;
                }
                
                .calendar-day:hover:not(.empty) {
                    background: #f8f9fa;
                }
                
                .calendar-day.today {
                    background: #e0e7ff;
                    border-color: #4361ee;
                }
                
                .calendar-day.selected {
                    background: #4361ee;
                    color: white;
                    border-color: #4361ee;
                }
                
                .calendar-day.selected .event-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                .day-number {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                .event-count {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    background: #f8f9fa;
                    color: #4361ee;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Time Table */
                .time-table-section {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eef2f7;
                    margin-top: 2rem;
                }
                
                .time-table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .time-table-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                
                .time-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .time-table th {
                    text-align: left;
                    padding: 0.75rem;
                    color: #6c757d;
                    font-weight: 600;
                    border-bottom: 1px solid #eef2f7;
                    font-size: 0.85rem;
                }
                
                .time-table td {
                    padding: 1rem 0.75rem;
                    border-bottom: 1px solid #eef2f7;
                }
                
                /* Events Section */
                .events-section {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eef2f7;
                }
                
                .events-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .events-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                
                .selected-date {
                    color: #4361ee;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                
                .events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .event-item {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 1rem;
                    border: 1px solid #eef2f7;
                    transition: all 0.3s ease;
                }
                
                .event-item:hover {
                    border-color: #4361ee;
                }
                
                .event-item.completed {
                    opacity: 0.6;
                }
                
                .event-item.completed .event-title {
                    text-decoration: line-through;
                }
                
                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }
                
                .event-title {
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 0.25rem;
                }
                
                .event-time {
                    color: #4361ee;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                
                .event-type {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin-top: 0.5rem;
                }
                
                .event-type.class {
                    background: #e0e7ff;
                    color: #4361ee;
                }
                
                .event-type.workshop {
                    background: #f3e8ff;
                    color: #9333ea;
                }
                
                .event-type.exam {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .event-type.reminder {
                    background: #fef3c7;
                    color: #d97706;
                }
                
                .event-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .event-btn {
                    background: transparent;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .complete-btn {
                    color: #22c55e;
                }
                
                .complete-btn:hover {
                    background: #dcfce7;
                }
                
                .delete-btn {
                    color: #dc2626;
                }
                
                .delete-btn:hover {
                    background: #fee2e2;
                }
                
                /* Add Task Form */
                .add-task-form {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eef2f7;
                    margin-top: 2rem;
                }
                
                .form-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 1.5rem;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                }
                
                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #eef2f7;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }
                
                .form-input:focus {
                    outline: none;
                    border-color: #4361ee;
                    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
                }
                
                .form-select {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #eef2f7;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    background: white;
                    cursor: pointer;
                }
                
                .form-select:focus {
                    outline: none;
                    border-color: #4361ee;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .add-task-btn {
                    background: #4361ee;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                }
                
                .add-task-btn:hover {
                    background: #3a56d4;
                    transform: translateY(-2px);
                }
                
                .add-task-btn:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }
                
                /* Upgrade Section */
                .upgrade-section {
                    background: linear-gradient(135deg, #4361ee, #3a56d4);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 15px;
                    margin-top: 2rem;
                    text-align: center;
                }
                
                .upgrade-title {
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                
                .upgrade-btn {
                    background: white;
                    color: #4361ee;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: all 0.3s ease;
                }
                
                .upgrade-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                /* Responsive */
                @media (max-width: 1200px) {
                    .main-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                @media (max-width: 768px) {
                    .schedule-container {
                        padding: 1rem;
                    }
                    
                    .calendar-grid {
                        gap: 0.25rem;
                    }
                    
                    .calendar-day {
                        padding: 0.25rem;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
                
                @media (max-width: 480px) {
                    .calendar-day-header {
                        padding: 0.5rem;
                        font-size: 0.75rem;
                    }
                    
                    .day-number {
                        font-size: 0.85rem;
                    }
                }
                `}
            </style>

            <div className="header">
                <h1>Schedule</h1>
                <p>Manage your classes, exams, and deadlines</p>
            </div>

            <div className="main-grid">
                {/* Left Column - Calendar */}
                <div>
                    <div className="calendar-section">
                        <div className="calendar-header">
                            <div className="calendar-nav">
                                <button className="calendar-nav-btn" onClick={handlePrevMonth}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <div className="calendar-title">{currentMonth} {currentYear}</div>
                                <button className="calendar-nav-btn" onClick={handleNextMonth}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                            <div className="view-switcher">
                                <button className="view-btn active">Month</button>
                                <button className="view-btn">Week</button>
                                <button className="view-btn">Day</button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {daysOfWeek.map(day => (
                                <div key={day} className="calendar-day-header">{day}</div>
                            ))}
                            
                            {calendarDays.map((date, index) => (
                                <div
                                    key={index}
                                    className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelectedDate(date) ? 'selected' : ''}`}
                                    onClick={() => date && setSelectedDate(date)}
                                >
                                    {date && (
                                        <>
                                            <div className="day-number">{date.getDate()}</div>
                                            {getEventCountForDate(date) > 0 && (
                                                <div className="event-count">{getEventCountForDate(date)}</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Table */}
                    <div className="time-table-section">
                        <div className="time-table-header">
                            <h3 className="time-table-title">Time Table</h3>
                        </div>
                        <table className="time-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Monday</th>
                                    <th>Tuesday</th>
                                    <th>Wednesday</th>
                                    <th>Thursday</th>
                                    <th>Friday</th>
                                    <th>Saturday</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['08:00', '10:00', '12:00', '14:00', '16:00'].map(time => (
                                    <tr key={time}>
                                        <td style={{fontWeight: 600, color: '#1a1a1a'}}>{time}</td>
                                        {daysOfWeek.slice(1, 7).map((day, index) => (
                                            <td key={index}>
                                                {index === 0 && time === '10:00' ? 'React Class' : ''}
                                                {index === 2 && time === '14:00' ? 'DSA Workshop' : ''}
                                                {index === 4 && time === '16:00' ? 'UI/UX Design' : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column - Events & Add Task */}
                <div>
                    {/* Events List */}
                    <div className="events-section">
                        <div className="events-header">
                            <h3 className="events-title">Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                            <div className="selected-date">{eventsForSelectedDate.length} events</div>
                        </div>
                        
                        <div className="events-list">
                            {eventsForSelectedDate.length > 0 ? (
                                eventsForSelectedDate.map(event => (
                                    <div key={event.id} className={`event-item ${event.completed ? 'completed' : ''}`}>
                                        <div className="event-header">
                                            <div>
                                                <div className="event-title">{event.title}</div>
                                                <div className="event-time">{event.time}</div>
                                            </div>
                                            <div className="event-actions">
                                                <button 
                                                    className="event-btn complete-btn"
                                                    onClick={() => handleEventToggle(event.id)}
                                                    title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                                >
                                                    {event.completed ? '✓' : '○'}
                                                </button>
                                                <button 
                                                    className="event-btn delete-btn"
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    title="Delete event"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        <span className={`event-type ${event.type}`}>
                                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{textAlign: 'center', color: '#6c757d', padding: '2rem'}}>
                                    No events scheduled for this day
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Task Form */}
                    <div className="add-task-form">
                        <h3 className="form-title">Add New Task</h3>
                        
                        <div className="form-group">
                            <label className="form-label">Task Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Time</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 08:00 - 10:00 AM"
                                    value={newTask.time}
                                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    value={newTask.type}
                                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                                >
                                    <option value="class">Class</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="exam">Exam</option>
                                    <option value="reminder">Reminder</option>
                                </select>
                            </div>
                        </div>
                        
                        <button
                            className="add-task-btn"
                            onClick={handleAddTask}
                            disabled={!newTask.title.trim() || !newTask.time.trim()}
                        >
                            + Add New Task
                        </button>
                    </div>

                    {/* Upgrade Section */}
                    <div className="upgrade-section">
                        <div className="upgrade-title">Upgrade to PRO for more resources</div>
                        <p style={{fontSize: "0.9rem", opacity: 0.9}}>Get access to premium scheduling features</p>
                        <button className="upgrade-btn">Upgrade Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Schedule;