import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [enrollments, setEnrollments] = useState([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '10:00 AM - 11:30 AM',
    type: 'lecture',
    course: '',
    location: 'Virtual Lab Pod #04',
  });

  // Calendar events
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Cloud Architecture Live Lab: Istio Mesh Routing',
      time: '09:00 AM - 10:30 AM',
      date: new Date(),
      type: 'lab',
      course: 'Fullstack Cloud Architecture & Kubernetes Clusters',
      instructor: 'Prof. Maya Lin',
      location: 'Virtual Cluster Node #08',
      completed: false,
    },
    {
      id: 2,
      title: 'Quantum Variational Circuits Problem Session',
      time: '02:00 PM - 03:30 PM',
      date: new Date(),
      type: 'lecture',
      course: 'Neural Networks & Quantum Computing',
      instructor: 'Dr. Elena Vance',
      location: 'Main Amphitheater Stream',
      completed: false,
    },
    {
      id: 3,
      title: 'Cryptographic Security Capstone Milestone Due',
      time: '11:59 PM UTC',
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      type: 'deadline',
      course: 'Cyber Defense & Cryptographic Security',
      instructor: 'Marcus Lin, CISSP',
      location: 'Student Submission Portal',
      completed: false,
    },
    {
      id: 4,
      title: 'Midterm Evaluation: Distributed Systems & Consensus',
      time: '11:00 AM - 12:30 PM',
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      type: 'exam',
      course: 'Distributed Systems & High Performance Computing',
      instructor: 'Dr. Sora Takahashi',
      location: 'Proctored Assessment Arena',
      completed: false,
    },
  ]);

  // Fetch real enrolled courses to tie events to
  useEffect(() => {
    API.get('/enrollments/my-courses')
      .then((res) => {
        const list = (res.data?.enrollments || []).filter((e) => Boolean(e.course));
        setEnrollments(list);
        if (list.length > 0 && !newEvent.course) {
          setNewEvent((prev) => ({ ...prev, course: list[0].course.title }));
        }
      })
      .catch((err) => console.warn('Could not load course list for schedule:', err));
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculations
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate, daysInMonth, firstDayIndex]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const toggleEventComplete = (id) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, completed: !ev.completed } : ev))
    );
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const created = {
      id: Date.now(),
      title: newEvent.title.trim(),
      time: newEvent.time,
      date: new Date(selectedDate),
      type: newEvent.type,
      course: newEvent.course || (enrollments[0]?.course?.title || 'Academic Curriculum'),
      location: newEvent.location,
      completed: false,
    };

    setEvents((prev) => [...prev, created]);
    setModalOpen(false);
    setNewEvent({
      title: '',
      time: '10:00 AM - 11:30 AM',
      type: 'lecture',
      course: enrollments[0]?.course?.title || '',
      location: 'Virtual Lab Pod #04',
    });
    toast.success('New session scheduled successfully!');
  };

  // Filter events for current selected day and type
  const dayEvents = events.filter((ev) => isSameDay(ev.date, selectedDate));
  const filteredDayEvents = dayEvents.filter((ev) => {
    if (activeTypeFilter === 'all') return true;
    return ev.type === activeTypeFilter;
  });

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Academic Schedule</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Academic Calendar &amp; Laboratory Schedule
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Synchronized schedules for live interactive sessions, hands-on laboratories, and project milestones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_alarm</span>
              <span>Schedule Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Column: Calendar Matrix (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
                  SPRING TERM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDate(new Date());
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 my-4 text-center">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-xs font-mono font-semibold text-slate-400 uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl bg-slate-50/50"></div>;
                }

                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const dayHasEvents = events.some((ev) => isSameDay(ev.date, day));

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`h-14 sm:h-16 rounded-xl p-2 flex flex-col justify-between items-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                        : isToday
                        ? 'bg-blue-50/80 text-blue-800 border-blue-200 hover:bg-blue-100/70'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? 'text-white' : isToday ? 'text-blue-700' : 'text-slate-800'
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {/* Dot indicators for scheduled items */}
                    {dayHasEvents && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-blue-600'
                        }`}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Day Agendas & Events (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
            <div>
              {/* Day Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    {daysOfWeek[selectedDate.getDay()]}, {months[selectedDate.getMonth()]}{' '}
                    {selectedDate.getDate()}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Agenda &amp; Scheduled Sessions</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
                  {dayEvents.length} Events
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 py-3 border-b border-slate-100 flex-wrap">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'lecture', label: 'Lectures' },
                  { id: 'lab', label: 'Labs' },
                  { id: 'deadline', label: 'Deadlines' },
                  { id: 'exam', label: 'Exams' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTypeFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTypeFilter === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Event Cards */}
              <div className="flex flex-col gap-3 mt-4">
                {filteredDayEvents.length > 0 ? (
                  filteredDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        ev.completed
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200/90 shadow-sm hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleEventComplete(ev.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                            ev.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 hover:border-blue-500 bg-white'
                          }`}
                        >
                          {ev.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
                        </button>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                                ev.type === 'lab'
                                  ? 'bg-cyan-50 text-cyan-700'
                                  : ev.type === 'exam'
                                  ? 'bg-rose-50 text-rose-700'
                                  : ev.type === 'deadline'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {ev.type}
                            </span>
                            <span className="text-xs font-mono text-slate-500">{ev.time}</span>
                          </div>

                          <h4
                            className={`text-sm font-bold text-slate-900 line-clamp-1 ${
                              ev.completed ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {ev.title}
                          </h4>
                          <span className="text-xs text-slate-500 truncate">{ev.course}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {ev.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <span className="material-symbols-outlined text-slate-400 text-[28px] mb-1">
                      calendar_month
                    </span>
                    <p className="text-xs text-slate-500">No scheduled sessions for this day.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">SYNCED WITH LMS CLOUD</span>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                + Add Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Schedule Academic Session</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Computing Code Review"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Range</label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Hands-on Lab</option>
                    <option value="deadline">Project Deadline</option>
                    <option value="exam">Assessment / Exam</option>
                  </select>
                </div>
              </div>

              {enrollments.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Related Course</label>
                  <select
                    value={newEvent.course}
                    onChange={(e) => setNewEvent({ ...newEvent, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {enrollments.map((e) => (
                      <option key={e._id} value={e.course.title}>
                        {e.course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Pod</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}