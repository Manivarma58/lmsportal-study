import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { toast } from 'sonner';

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Reorder mode state
  const [isReordering, setIsReordering] = useState(false);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Save Curriculum Changes');
  const [saveIcon, setSaveIcon] = useState('verified');

  // Preview Modal State
  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  // Sections and Lessons State
  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      title: 'Section 1: Quantum Decoherence & Density Matrices',
      subtitle: 'Markovian dissipators, Bloch Sphere state tracking, environmental noise vectors',
      meta: '3 Lessons • 1h 14m Total',
      collapsed: false,
      lessons: [
        {
          id: '1.1',
          code: '1.1',
          title: 'Superposition Collapse & Environmental Coupling',
          slug: '/lessons/1-1-superposition-collapse',
          durationMin: 18,
          durationSec: 24,
          description:
            'In this lecture, Dr. Elena Vance deconstructs the open quantum system Hamiltonian under thermal Markovian reservoir conditions. Scholars will explore Lindblad dissipators and examine decoherence rates across superconducting transmon qubits.',
          videoFile: 'quantum_decoherence_lecture_4k_v2.mp4',
          videoSize: '1.42 GB',
          transcodingPct: 84,
          transcodingRemaining: '12.4 MB/s • ~42s remaining',
          quality: '4K UHD',
          freePreview: true,
          discussionForum: true,
          status: 'Published',
          views: '1,840 views',
          type: 'video',
          typeIcon: 'smart_display',
          resources: [
            {
              id: 'r-1',
              name: 'decoherence_formalism_slides.pdf',
              meta: '3.8 MB • PDF Deck • Downloadable',
              icon: 'picture_as_pdf',
              color: 'text-rose-600',
            },
            {
              id: 'r-2',
              name: 'lindblad_sim_exercise.ipynb',
              meta: '1.2 MB • Jupyter Notebook • Sandbox Attached',
              icon: 'data_object',
              color: 'text-emerald-600',
            },
            {
              id: 'r-3',
              name: 'qubit_relaxation_telemetry.csv',
              meta: '840 KB • Telemetry Dataset',
              icon: 'table_chart',
              color: 'text-indigo-600',
            },
          ],
        },
        {
          id: '1.2',
          code: '1.2',
          title: 'Kraus Representation & Master Equations',
          slug: '/lessons/1-2-kraus-representation',
          durationMin: 24,
          durationSec: 10,
          description:
            'Exploration of completely positive trace-preserving (CPTP) maps, Kraus operators formulation, and their numerical representations in Python / Qiskit.',
          videoFile: 'kraus_master_equations_4k.mp4',
          videoSize: '1.85 GB',
          transcodingPct: 100,
          transcodingRemaining: 'Completed',
          quality: 'Jupyter & PDF',
          freePreview: false,
          discussionForum: true,
          status: 'Published',
          views: '1,210 views',
          type: 'video_docs',
          typeIcon: 'terminal',
          resources: [
            {
              id: 'r-4',
              name: 'kraus_operators_formalism.pdf',
              meta: '4.8 MB • PDF Deck • Downloadable',
              icon: 'picture_as_pdf',
              color: 'text-rose-600',
            },
          ],
        },
        {
          id: '1.3',
          code: '1.3',
          title: 'Interactive Bloch Sphere Phase Damping Lab',
          slug: '/lessons/1-3-bloch-sphere-lab',
          durationMin: 32,
          durationSec: 0,
          description:
            'Hands-on computational sandbox with real-time vector rotations on the Bloch Sphere under T1 and T2 dephasing channel simulations.',
          videoFile: 'bloch_damping_interactive.mp4',
          videoSize: '950 MB',
          transcodingPct: 100,
          transcodingRemaining: 'Completed',
          quality: 'Autograded Testsuite',
          freePreview: false,
          discussionForum: true,
          status: 'Published',
          views: '990 views',
          type: 'lab',
          typeIcon: 'science',
          resources: [
            {
              id: 'r-5',
              name: 'bloch_sim.ipynb',
              meta: '1.5 MB • Autograded Testsuite Attached',
              icon: 'data_object',
              color: 'text-emerald-600',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Section 2: Stabilizer Codes & Surface Lattice Geometry',
      subtitle: 'Fault-tolerant syndrome detection circuits and topological defect pairs',
      meta: '2 Lessons • 52m Total',
      collapsed: false,
      lessons: [
        {
          id: '2.1',
          code: '2.1',
          title: 'Pauli Operators & Syndrome Measurement Circuits',
          slug: '/lessons/2-1-pauli-syndrome-circuits',
          durationMin: 28,
          durationSec: 15,
          description:
            'Mathematical derivation of the Pauli group, stabilizer subspace projectors, and hardware syndrome extraction using CNOT entangling gates.',
          videoFile: 'pauli_syndrome_measurements.mp4',
          videoSize: '2.1 GB',
          transcodingPct: 100,
          transcodingRemaining: 'Completed',
          quality: '1080p 60fps',
          freePreview: false,
          discussionForum: true,
          status: 'Published',
          views: '840 views',
          type: 'video',
          typeIcon: 'smart_display',
          resources: [],
        },
        {
          id: '2.2',
          code: '2.2',
          title: 'Toric Code Braiding & Anyonic Excitations',
          slug: '/lessons/2-2-toric-code-braiding',
          durationMin: 24,
          durationSec: 30,
          description:
            'Topological surface lattice geometry, boundary Hamiltonian engineering, and braiding statistics of Abelian and non-Abelian anyons.',
          videoFile: 'toric_code_braiding_v1.mp4',
          videoSize: '1.7 GB',
          transcodingPct: 60,
          transcodingRemaining: 'Encoding 1080p...',
          quality: 'High Bitrate',
          freePreview: false,
          discussionForum: true,
          status: 'Draft v1.2',
          views: 'Draft',
          type: 'quiz',
          typeIcon: 'quiz',
          resources: [],
        },
      ],
    },
  ]);

  // Currently Selected Lesson in Editor
  const [selectedLessonId, setSelectedLessonId] = useState('1.1');
  const [editorData, setEditorData] = useState({
    title: 'Superposition Collapse & Environmental Coupling',
    slug: '/lessons/1-1-superposition-collapse',
    durationMin: 18,
    durationSec: 24,
    description:
      'In this lecture, Dr. Elena Vance deconstructs the open quantum system Hamiltonian under thermal Markovian reservoir conditions. Scholars will explore Lindblad dissipators and examine decoherence rates across superconducting transmon qubits.',
    status: 'Published',
    freePreview: true,
    discussionForum: true,
    videoFile: 'quantum_decoherence_lecture_4k_v2.mp4',
    videoSize: '1.42 GB',
    transcodingPct: 84,
    resources: [
      {
        id: 'r-1',
        name: 'decoherence_formalism_slides.pdf',
        meta: '3.8 MB • PDF Deck • Downloadable',
        icon: 'picture_as_pdf',
        color: 'text-rose-600',
      },
      {
        id: 'r-2',
        name: 'lindblad_sim_exercise.ipynb',
        meta: '1.2 MB • Jupyter Notebook • Sandbox Attached',
        icon: 'data_object',
        color: 'text-emerald-600',
      },
      {
        id: 'r-3',
        name: 'qubit_relaxation_telemetry.csv',
        meta: '840 KB • Telemetry Dataset',
        icon: 'table_chart',
        color: 'text-indigo-600',
      },
    ],
  });

  // Fetch real course if ID is present
  useEffect(() => {
    if (id && !id.startsWith('c-')) {
      API.get(`/courses/${id}`)
        .then((res) => {
          if (res.data.course?.sections?.length > 0) {
            const mapped = res.data.course.sections.map((sec, sIdx) => ({
              id: sec._id || `sec-${sIdx + 1}`,
              title: sec.title || `Section ${sIdx + 1}: Core Curriculum`,
              subtitle: 'Comprehensive module lectures and assessment sandbox',
              meta: `${sec.lessons?.length || 0} Lessons`,
              collapsed: false,
              lessons: (sec.lessons || []).map((les, lIdx) => ({
                id: les._id || `${sIdx + 1}.${lIdx + 1}`,
                code: `${sIdx + 1}.${lIdx + 1}`,
                title: les.title,
                slug: `/lessons/${sIdx + 1}-${lIdx + 1}-${les.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                durationMin: Math.floor((les.duration || 900) / 60),
                durationSec: (les.duration || 900) % 60,
                description: les.content || 'Lecture syllabus and computational objectives.',
                videoFile: les.videoUrl ? 'master_lecture_feed.mp4' : 'lecture_recording_4k.mp4',
                videoSize: '1.2 GB',
                transcodingPct: 100,
                transcodingRemaining: 'Ready',
                quality: '4K UHD',
                freePreview: Boolean(les.isFree),
                discussionForum: true,
                status: 'Published',
                views: 'Active',
                type: 'video',
                typeIcon: 'smart_display',
                resources: [],
              })),
            }));
            if (mapped.length > 0) {
              setSections(mapped);
              if (mapped[0]?.lessons?.length > 0) {
                selectLesson(mapped[0].lessons[0]);
              }
            }
          }
        })
        .catch((err) => console.warn('Could not load course sections:', err.message));
    }
  }, [id]);

  // Select lesson to edit
  const selectLesson = (lesson) => {
    setSelectedLessonId(lesson.id);
    setEditorData({
      title: lesson.title,
      slug: lesson.slug,
      durationMin: lesson.durationMin,
      durationSec: lesson.durationSec,
      description: lesson.description,
      status: lesson.status,
      freePreview: lesson.freePreview,
      discussionForum: lesson.discussionForum,
      videoFile: lesson.videoFile,
      videoSize: lesson.videoSize,
      transcodingPct: lesson.transcodingPct,
      resources: lesson.resources || [],
    });
  };

  // Toggle Collapse Section
  const toggleCollapse = (secId) => {
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, collapsed: !s.collapsed } : s))
    );
  };

  // Reorder Mode Toggle
  const toggleReorderMode = () => {
    setIsReordering((prev) => !prev);
    if (!isReordering) {
      toast.info('Reorder mode enabled: Drag handles to reorder sections and lessons.');
    } else {
      toast.success('Curriculum sequence committed.');
    }
  };

  // Add New Section
  const handleAddSection = () => {
    const nextNum = sections.length + 1;
    const title = prompt(
      'Enter new quantum curriculum module title:',
      `Section ${nextNum}: Quantum Error Mitigation & Real-Time Telemetry`
    );
    if (title?.trim()) {
      const newSec = {
        id: `sec-${nextNum}`,
        title: title.trim(),
        subtitle: 'Fault-tolerant syndrome detection circuits and topological defect pairs',
        meta: '0 Lessons • 0m Total',
        collapsed: false,
        lessons: [],
      };
      setSections((prev) => [...prev, newSec]);
      toast.success(`Module '${title.trim()}' scheduled for creation.`);
    }
  };

  // Add Lesson to Section
  const handleAddLessonToSection = (secId) => {
    const secIndex = sections.findIndex((s) => s.id === secId);
    const sec = sections[secIndex];
    const lessonNum = `${secIndex + 1}.${(sec?.lessons?.length || 0) + 1}`;
    const lessonTitle = prompt(
      `Enter lesson title for Section ${secIndex + 1}:`,
      `${lessonNum} Non-Markovian Decoherence Reservoirs`
    );
    if (lessonTitle?.trim()) {
      const newLesson = {
        id: `les-${Date.now()}`,
        code: lessonNum,
        title: lessonTitle.trim(),
        slug: `/lessons/${lessonNum.replace('.', '-')}-${lessonTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        durationMin: 20,
        durationSec: 0,
        description: 'Comprehensive analysis of open quantum dynamics and non-Markovian memory effects.',
        videoFile: 'lecture_transcription_raw.mp4',
        videoSize: '1.1 GB',
        transcodingPct: 100,
        transcodingRemaining: 'Ready',
        quality: '4K UHD',
        freePreview: false,
        discussionForum: true,
        status: 'Draft',
        views: 'Draft',
        type: 'video',
        typeIcon: 'smart_display',
        resources: [],
      };

      setSections((prev) =>
        prev.map((s) => (s.id === secId ? { ...s, lessons: [...s.lessons, newLesson] } : s))
      );
      selectLesson(newLesson);
      toast.success(`Lesson '${lessonTitle.trim()}' added.`);
    }
  };

  // Delete Section
  const handleDeleteSection = (secId, secTitle) => {
    if (window.confirm(`Delete '${secTitle}' and all contained lessons?`)) {
      setSections((prev) => prev.filter((s) => s.id !== secId));
      toast.success('Section removed.');
    }
  };

  // Delete Lesson
  const handleDeleteLesson = (lessonId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this lesson from curriculum?')) {
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          lessons: s.lessons.filter((l) => l.id !== lessonId),
        }))
      );
      toast.success('Lesson deleted.');
    }
  };

  // Save Lesson Solo
  const handleSaveLessonSolo = () => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lessons: sec.lessons.map((les) =>
          les.id === selectedLessonId
            ? {
                ...les,
                title: editorData.title,
                slug: editorData.slug,
                durationMin: Number(editorData.durationMin) || 0,
                durationSec: Number(editorData.durationSec) || 0,
                description: editorData.description,
                status: editorData.status,
                freePreview: editorData.freePreview,
                discussionForum: editorData.discussionForum,
                resources: editorData.resources,
              }
            : les
        ),
      }))
    );
    toast.success('Lesson updated successfully across decentralized curriculum nodes.');
  };

  // Batch Save all changes
  const triggerBatchSave = () => {
    setIsBatchSaving(true);
    setSaveIcon('sync');
    setSaveButtonText('Syncing to Ledger...');

    setTimeout(() => {
      setIsBatchSaving(false);
      setSaveIcon('check_circle');
      setSaveButtonText('All Changes Committed!');

      setTimeout(() => {
        setSaveIcon('verified');
        setSaveButtonText('Save Curriculum Changes');
      }, 2200);
      toast.success('Curriculum changes synchronized with cryptographic consensus proof.');
    }, 1000);
  };

  // Upload Resource Simulation
  const handleUploadResource = () => {
    const filename = prompt('Enter resource filename (e.g. quantum_telemetry.csv):');
    if (filename?.trim()) {
      const newRes = {
        id: `r-${Date.now()}`,
        name: filename.trim(),
        meta: '2.4 MB • Computational Dataset Attached',
        icon: filename.endsWith('.pdf')
          ? 'picture_as_pdf'
          : filename.endsWith('.ipynb')
          ? 'data_object'
          : 'table_chart',
        color: filename.endsWith('.pdf')
          ? 'text-rose-600'
          : filename.endsWith('.ipynb')
          ? 'text-emerald-600'
          : 'text-indigo-600',
      };
      setEditorData((prev) => ({
        ...prev,
        resources: [...prev.resources, newRes],
      }));
      toast.success(`Resource '${filename.trim()}' uploaded and linked to lecture.`);
    }
  };

  // Remove Resource
  const handleRemoveResource = (rId) => {
    setEditorData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== rId),
    }));
    toast.info('Resource unlinked.');
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16">
      <div className="relative w-full px-6 sm:px-8 lg:px-10 py-6 flex flex-col gap-8 max-w-[1680px] mx-auto">
        {/* ================= BREADCRUMBS & CONTEXT BAR ================= */}
        <div className="flex flex-col gap-3">
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Link to="/instructor/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>Instructor Portal</span>
            </Link>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <Link to="/instructor/courses" className="hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-700 font-semibold truncate max-w-xs">Neural Networks & Quantum Computing</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-blue-600 font-semibold">Curriculum Organizer</span>
          </nav>

          {/* 1. HERO BANNER SECTION (Matching Student Dashboard Welcome Banner) */}
          <section className="relative w-full rounded-2xl bg-white shadow-sm border border-slate-200/90 p-6 lg:p-8 overflow-hidden">
            {/* Subtle blueprint accent line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              {/* Left Title & Telemetry Badges */}
              <div className="flex flex-col gap-3 max-w-3xl min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    QPU-904 // POSTGRAD
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold border border-indigo-200/70">
                    GRADUATE TIER
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-medium border border-slate-200/80">
                    14.5 CEUs Accredited
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active Live Cohort
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Neural Networks & <span className="text-blue-600">Quantum Computing</span>
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                  Design syllabus architecture, transcode lectures to adaptive HLS streams, configure assessment sandboxes, and synchronize decentralized curriculum state.
                </p>
              </div>

              {/* Right Primary Actions Cluster */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={toggleReorderMode}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold ${
                    isReordering
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">drag_indicator</span>
                  <span>{isReordering ? 'Done Reordering' : 'Reorder Mode'}</span>
                </button>

                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all duration-200 cursor-pointer border border-slate-200 text-xs font-semibold"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">folder_special</span>
                  <span>+ Add Section</span>
                </button>

                <button
                  onClick={() => handleAddLessonToSection(sections[0]?.id || 'sec-1')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all duration-200 cursor-pointer border border-slate-200 text-xs font-semibold"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600">add_circle</span>
                  <span>+ New Lesson</span>
                </button>

                <button
                  onClick={() => setPlayerModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-all duration-200 cursor-pointer border border-slate-200 text-xs font-semibold"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">slideshow</span>
                  <span>Player Preview</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">open_in_new</span>
                </button>

                <button
                  onClick={triggerBatchSave}
                  disabled={isBatchSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isBatchSaving ? 'animate-spin' : ''}`}>
                    {saveIcon}
                  </span>
                  <span>{saveButtonText}</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ================= CURRICULUM SYNC HEALTH METRIC BAR ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex items-center justify-between transition-all hover:shadow-md">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Modules</span>
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
                {sections.length} <span className="text-sm font-semibold text-slate-400 font-normal">Sec</span> • {sections.reduce((a, s) => a + s.lessons.length, 0)} <span className="text-sm font-semibold text-slate-400 font-normal">Lessons</span>
              </span>
              <span className="text-xs text-slate-400 mt-1">Structured syllabus units</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex items-center justify-between transition-all hover:shadow-md">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curriculum Runtime</span>
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">2h 06m 09s</span>
              <span className="text-xs text-slate-400 mt-1">High-definition master stream</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex items-center justify-between transition-all hover:shadow-md">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Encoding CDN</span>
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">84% Transcoded</span>
              <span className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                1 job processing in cloud
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex items-center justify-between transition-all hover:shadow-md">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Scholars</span>
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">342 Researchers</span>
              <span className="text-xs text-blue-600 font-semibold mt-1">Active registered fellows</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
          </div>
        </div>

        {/* ================= MAIN DUAL PANE WORKSPACE (7 Cols Outline / 5 Cols Editor) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT MASTER TREE COLUMN (~58% -> 7 Cols) ================= */}
          <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
            {/* List Utility Row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-slate-900">Curriculum Outline</span>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold border border-blue-200">
                  Auto-Sync On
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <button
                  onClick={() => setSections((prev) => prev.map((s) => ({ ...s, collapsed: true })))}
                  className="hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  title="Collapse All Sections"
                >
                  <span className="material-symbols-outlined text-[18px]">unfold_less</span>
                </button>
                <button
                  onClick={() => setSections((prev) => prev.map((s) => ({ ...s, collapsed: false })))}
                  className="hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  title="Expand All Sections"
                >
                  <span className="material-symbols-outlined text-[18px]">unfold_more</span>
                </button>
                <span className="mx-1 text-slate-300">|</span>
                <span className="font-medium">Total Weight: 100%</span>
              </div>
            </div>

            {/* SECTIONS LIST */}
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 transition-all"
              >
                {/* Section Header Card */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-1 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">drag_pan</span>
                    </div>
                    <button
                      onClick={() => toggleCollapse(sec.id)}
                      className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-transform duration-150 cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform ${
                          sec.collapsed ? '-rotate-90' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900 truncate">
                          {sec.title}
                        </span>
                        <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-2.5 py-0.5 rounded-md border border-slate-200">
                          {sec.lessons.length} Lessons • {sec.meta}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 truncate mt-0.5">{sec.subtitle}</span>
                    </div>
                  </div>

                  {/* Section Action Tools */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toast.info(`Section settings for ${sec.title}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Section Settings"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                    </button>
                    <button
                      onClick={() => handleAddLessonToSection(sec.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Add Lesson to Section"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec.id, sec.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Section Lessons Container */}
                {!sec.collapsed && (
                  <div className="flex flex-col gap-3 pt-4 pl-1 sm:pl-3">
                    {sec.lessons.map((les) => {
                      const isSelected = selectedLessonId === les.id;
                      return (
                        <div
                          key={les.id}
                          onClick={() => selectLesson(les)}
                          className={`group relative flex flex-col p-4 rounded-xl transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 shadow-sm border border-blue-200 ring-2 ring-blue-500/20'
                              : 'bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs'
                          }`}
                        >
                          {/* Active Selection Indicator */}
                          {isSelected && (
                            <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r-full shadow-sm"></div>
                          )}

                          <div className="flex items-start justify-between gap-3 min-w-0">
                            <div className="flex items-start gap-3 min-w-0 pl-1">
                              {/* Reorder Grip Handle */}
                              <div
                                className={`cursor-grab active:cursor-grabbing pt-1 hover:scale-110 transition-transform ${
                                  isSelected ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                                }`}
                                title="Drag to reorder lesson"
                              >
                                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                              </div>

                              {/* Lesson Media Icon */}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 shadow-xs'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {les.typeIcon || 'smart_display'}
                                </span>
                              </div>

                              {/* Lesson Info */}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-900 truncate">
                                    {les.code} {les.title}
                                  </span>
                                  {isSelected && (
                                    <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                                      Active Selection
                                    </span>
                                  )}
                                  {les.type === 'quiz' && (
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium px-2 py-0.5 rounded">
                                      Lab Assessment
                                    </span>
                                  )}
                                </div>

                                {/* Metadata Chips */}
                                <div className="flex items-center gap-2.5 flex-wrap mt-1.5 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">videocam</span> Video
                                    {les.resources?.length > 0 && ` + ${les.resources.length} Files`}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">schedule</span>{' '}
                                    {les.durationMin}:{String(les.durationSec).padStart(2, '0')} min
                                  </span>
                                  <span>•</span>
                                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600">
                                    {les.quality || '4K UHD'}
                                  </span>
                                  {les.freePreview && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                        Free Preview Enabled
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge & Micro Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="hidden sm:inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1 rounded-full font-medium shadow-xs">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    les.status.includes('Published') ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                ></span>
                                {les.status} {les.views && `• ${les.views}`}
                              </span>
                              <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg shadow-xs">
                                <button
                                  onClick={() => selectLesson(les)}
                                  className={`p-1 rounded-md transition-colors ${
                                    isSelected ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600'
                                  }`}
                                  title="Edit Lesson"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayerModalOpen(true);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
                                  title="Preview Lesson"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Lesson '${les.title}' duplicated as draft.`);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                                  title="Duplicate Lesson"
                                >
                                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteLesson(les.id, e)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                                  title="Archive / Delete Lesson"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Lesson to Section Button */}
                    <button
                      onClick={() => handleAddLessonToSection(sec.id)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer border border-dashed border-slate-300 mt-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      <span>+ Add Lesson to {sec.title.split(':')[0]}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* CREATE NEW SECTION DROPZONE CARD */}
            <div
              onClick={handleAddSection}
              className="w-full rounded-2xl p-8 bg-white hover:bg-slate-50/80 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all border-2 border-dashed border-slate-300 group shadow-xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-105 border border-blue-200/60 flex items-center justify-center transition-all shadow-xs">
                <span className="material-symbols-outlined text-[28px]">library_add</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  + Append Section {sections.length + 1}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Click here to build new curriculum module segment
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT IN-DEPTH LESSON EDITOR COLUMN (~42% -> 5 Cols) ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
            {/* Editor Master Panel */}
            <div className="flex flex-col bg-white rounded-2xl p-6 lg:p-7 shadow-sm border border-slate-200/90 relative overflow-hidden">
              {/* Editor Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">
                      Editing Lesson {selectedLessonId}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Connected to Realtime Node"></span>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5">
                    Section 1: Quantum Decoherence & Density Matrices
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">cloud_done</span> Autosaved
                  </span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full font-semibold">
                    Live Changes
                  </span>
                </div>
              </div>

              {/* Lesson Meta & Textual Properties */}
              <div className="flex flex-col gap-4">
                {/* Title Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lesson Title</label>
                    <span className="font-mono text-xs text-slate-400">chars: {editorData.title.length} / 80</span>
                  </div>
                  <input
                    type="text"
                    value={editorData.title}
                    onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-slate-200 transition-all placeholder:text-slate-400 shadow-xs"
                  />
                </div>

                {/* URL Slug & Structured Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Canonical Path / Slug
                    </label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-xs">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 mr-2">link</span>
                      <input
                        type="text"
                        value={editorData.slug}
                        onChange={(e) => setEditorData({ ...editorData, slug: e.target.value })}
                        className="bg-transparent text-slate-900 font-mono text-xs w-full outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-5 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Duration</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 flex-1 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-xs">
                        <input
                          type="number"
                          value={editorData.durationMin}
                          onChange={(e) => setEditorData({ ...editorData, durationMin: Number(e.target.value) })}
                          className="bg-transparent text-slate-900 font-mono text-xs w-full text-center outline-none"
                        />
                        <span className="text-slate-400 text-xs pr-1 font-semibold">min</span>
                      </div>
                      <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 flex-1 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-xs">
                        <input
                          type="number"
                          value={editorData.durationSec}
                          onChange={(e) => setEditorData({ ...editorData, durationSec: Number(e.target.value) })}
                          className="bg-transparent text-slate-900 font-mono text-xs w-full text-center outline-none"
                        />
                        <span className="text-slate-400 text-xs pr-1 font-semibold">sec</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Rich Markdown Editor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Lecture Overview & Learning Objectives
                  </label>
                  <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 border-b border-slate-200 text-slate-600">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1 hover:text-slate-900 hover:bg-slate-200/70 rounded cursor-pointer transition-colors"
                          title="Bold"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + ' **bold**' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">format_bold</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-slate-900 hover:bg-slate-200/70 rounded cursor-pointer transition-colors"
                          title="Italic"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + ' _italic_' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">format_italic</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-slate-900 hover:bg-slate-200/70 rounded cursor-pointer transition-colors"
                          title="Code Block"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + '\n```python\n# code\n```' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-slate-900 hover:bg-slate-200/70 rounded cursor-pointer transition-colors"
                          title="LaTeX Equation"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + ' $$\\hat{H} = \\hbar \\omega$$' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">functions</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-slate-900 hover:bg-slate-200/70 rounded cursor-pointer transition-colors"
                          title="Bullet List"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + '\n- Item' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                        </button>
                      </div>
                      <span className="font-mono text-xs text-slate-400">Markdown Enabled</span>
                    </div>

                    {/* Text Area */}
                    <textarea
                      rows={3}
                      value={editorData.description}
                      onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                      className="w-full bg-slate-50 p-3.5 text-slate-900 text-sm outline-none resize-none focus:bg-white transition-colors"
                    ></textarea>
                  </div>
                </div>

                {/* Video Asset Management & Transcoder Widget */}
                <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">videocam</span>
                      Master Lecture Video Feed
                    </span>
                    <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                      Live Processing
                    </span>
                  </div>

                  {/* Video Preview Thumbnail Card */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden group shadow-md bg-slate-950">
                    <img
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                      alt="Lecture preview"
                      src="/assets/course-cloud.jpg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/course-cloud.jpg';
                      }}
                    />

                    {/* Video Scrim Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-900/80 text-emerald-400 font-mono text-[11px] px-2.5 py-0.5 rounded backdrop-blur font-semibold">
                          4K PRORES SOURCE
                        </span>
                        <button
                          onClick={() => setPlayerModalOpen(true)}
                          className="p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-center">
                        <div
                          onClick={() => setPlayerModalOpen(true)}
                          className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center backdrop-blur shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[26px]">play_arrow</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white">
                        <span className="font-mono text-slate-200">{editorData.videoFile}</span>
                        <span className="text-slate-300 font-medium">{editorData.videoSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Realtime Transcoding Engine Monitor */}
                  <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-blue-600 animate-spin">sync</span>
                        Transcoding: {editorData.transcodingPct}% Complete
                      </span>
                      <span className="font-mono text-emerald-700 font-semibold">12.4 MB/s • ~42s remaining</span>
                    </div>

                    {/* Multi-tier glowing progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${editorData.transcodingPct}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 font-medium">
                      <span className="text-emerald-700">1080p ✓</span>
                      <span className="text-emerald-700">1440p ✓</span>
                      <span className="text-blue-700 font-bold">4K UHD ({editorData.transcodingPct}%)</span>
                      <span className="text-emerald-700">HLS Packaging ✓</span>
                    </div>
                  </div>

                  {/* Replace Drop Trigger */}
                  <div
                    onClick={() => {
                      const file = prompt('Enter new video source URL or filename:');
                      if (file) {
                        setEditorData((prev) => ({ ...prev, videoFile: file }));
                        toast.success(`Video source updated to ${file}`);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 text-slate-500 hover:text-blue-600 cursor-pointer text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_upload</span>
                    <span>Drag to replace raw lecture video file</span>
                  </div>
                </div>

                {/* Attached Learning Resources & Files */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Attached Learning Resources ({editorData.resources?.length || 0} Files)
                    </label>
                    <span className="font-mono text-xs text-slate-400">Total 5.84 MB</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {editorData.resources?.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-3 px-3.5 rounded-xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`material-symbols-outlined text-[22px] ${res.color}`}>{res.icon}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate">{res.name}</span>
                            <span className="font-mono text-[11px] text-slate-400">{res.meta}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toast.info(`Previewing ${res.name}...`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Preview File"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button
                            onClick={() => handleRemoveResource(res.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Remove Resource"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Resource Dropzone */}
                  <div
                    onClick={handleUploadResource}
                    className="p-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all border border-dashed border-slate-300 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    <span>+ Upload Resource (PDF, Notebook, Code, Dataset)</span>
                  </div>
                </div>

                {/* Visibility & Access Controls Card */}
                <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Visibility & Access Controls
                  </span>

                  {/* Publishing State Selector */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 rounded-xl text-center">
                    {['Published', 'Draft', 'Scheduled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditorData({ ...editorData, status: st })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editorData.status === st
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Free Preview Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Free Preview Sample</span>
                      <span className="text-[11px] text-slate-500">
                        Allow prospective scholars to watch without course enrollment
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editorData.freePreview}
                        onChange={(e) => setEditorData({ ...editorData, freePreview: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Discussion & Forum Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Student Q&A Thread</span>
                      <span className="text-[11px] text-slate-500">
                        Mount cohort discussion forum directly below this lecture stream
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editorData.discussionForum}
                        onChange={(e) => setEditorData({ ...editorData, discussionForum: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Action Docks for Panel */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Discard uncommitted edits to Lesson ${selectedLessonId}?`)) {
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Discard
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">play_circle</span>
                    <span>Preview Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveLessonSolo}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save & Apply</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-3.5 text-slate-700 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="text-slate-900 font-bold text-sm">Instructional Design Tip</span>
                <span className="text-slate-500 mt-1 leading-relaxed">
                  Lectures featuring linked Jupyter notebooks exhibit a 43% higher completion rate among postgrad fellows.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EMBEDDED STUDENT PLAYER PREVIEW MODAL ================= */}
      {playerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative flex flex-col gap-4 border border-slate-200/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">slideshow</span>
                <span className="text-lg font-bold text-slate-900">
                  Student Player Preview: {selectedLessonId} {editorData.title}
                </span>
              </div>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt="Lecture player simulation"
                src="/assets/course-quantum.jpg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/course-quantum.jpg';
                }}
              />

              {/* Player Simulated Chrome */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <div className="w-full h-1.5 bg-white/20 rounded-full mb-3 relative cursor-pointer">
                  <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                  <div className="absolute left-1/3 -top-1 w-3.5 h-3.5 rounded-full bg-white shadow"></div>
                </div>

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined cursor-pointer hover:text-blue-400 transition-colors">
                      play_arrow
                    </span>
                    <span className="material-symbols-outlined cursor-pointer hover:text-blue-400 transition-colors">
                      volume_up
                    </span>
                    <span className="font-mono text-slate-200">06:08 / 18:24</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600/80 px-2 py-0.5 rounded text-white text-[11px] font-mono">4K UHD</span>
                    <span className="material-symbols-outlined cursor-pointer hover:text-blue-400 transition-colors">
                      settings
                    </span>
                    <span className="material-symbols-outlined cursor-pointer hover:text-blue-400 transition-colors">
                      fullscreen
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
              <span>Transcoded via Nova Adaptive HLS • Zero Latency CDN</span>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
