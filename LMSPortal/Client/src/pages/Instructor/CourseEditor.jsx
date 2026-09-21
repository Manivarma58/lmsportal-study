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
              color: 'text-error',
            },
            {
              id: 'r-2',
              name: 'lindblad_sim_exercise.ipynb',
              meta: '1.2 MB • Jupyter Notebook • Sandbox Attached',
              icon: 'data_object',
              color: 'text-tertiary',
            },
            {
              id: 'r-3',
              name: 'qubit_relaxation_telemetry.csv',
              meta: '840 KB • Telemetry Dataset',
              icon: 'table_chart',
              color: 'text-secondary',
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
              color: 'text-error',
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
              color: 'text-tertiary',
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
        color: 'text-error',
      },
      {
        id: 'r-2',
        name: 'lindblad_sim_exercise.ipynb',
        meta: '1.2 MB • Jupyter Notebook • Sandbox Attached',
        icon: 'data_object',
        color: 'text-tertiary',
      },
      {
        id: 'r-3',
        name: 'qubit_relaxation_telemetry.csv',
        meta: '840 KB • Telemetry Dataset',
        icon: 'table_chart',
        color: 'text-secondary',
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
          ? 'text-error'
          : filename.endsWith('.ipynb')
          ? 'text-tertiary'
          : 'text-secondary',
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
    <div className="flex flex-col w-full text-on-surface bg-surface min-h-screen relative antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Dynamic Gradient Ambient Backdrop */}
      <div className="absolute -top-12 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-80 right-10 w-[30rem] h-[30rem] bg-tertiary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="flex flex-col w-full px-gutter lg:px-margin pb-16">
        {/* ================= BREADCRUMBS & CONTEXT BAR ================= */}
        <div className="flex flex-col gap-space-sm pt-space-lg mb-space-lg">
          <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <Link to="/instructor/dashboard" className="hover:text-tertiary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">domain</span>
              Instructor Portal
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <Link to="/instructor/courses" className="hover:text-tertiary transition-colors">
              Courses
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="text-on-surface">Neural Networks & Quantum Computing</span>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="text-primary font-semibold">Curriculum Organizer</span>
          </nav>

          {/* Top Sub-Header: Course Identity & Primary Actions */}
          <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-code-md text-code-md text-tertiary bg-surface-container-high px-space-xs py-0.5 rounded uppercase tracking-wider font-semibold">
                  QPU-904 // POSTGRAD
                </span>
                <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-space-sm py-0.5 rounded-full font-semibold">
                  Graduate Tier
                </span>
                <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-space-sm py-0.5 rounded-full">
                  14.5 CEUs Accredited
                </span>
                <span className="bg-tertiary/10 text-tertiary font-label-sm text-label-sm px-space-sm py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  Active Live Cohort
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Neural Networks & Quantum Computing
              </h1>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                onClick={toggleReorderMode}
                className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-lg transition-all duration-200 cursor-pointer ${
                  isReordering
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">drag_indicator</span>
                <span className="font-label-lg text-label-lg">
                  {isReordering ? 'Done Reordering' : 'Reorder Mode'}
                </span>
              </button>

              <button
                onClick={handleAddSection}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface shadow-sm transition-all duration-200 cursor-pointer border border-surface-container-high/40"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">folder_special</span>
                <span className="font-label-lg text-label-lg">+ Add Section</span>
              </button>

              <button
                onClick={() => handleAddLessonToSection(sections[0]?.id || 'sec-1')}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all duration-200 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
                <span className="font-label-lg text-label-lg">+ New Lesson</span>
              </button>

              <button
                onClick={() => setPlayerModalOpen(true)}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200 cursor-pointer border border-surface-container-high/30"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">slideshow</span>
                <span className="font-label-lg text-label-lg">Player Preview</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>

              <button
                onClick={triggerBatchSave}
                disabled={isBatchSaving}
                className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-inverse-primary text-white font-label-lg text-label-lg shadow-lg hover:shadow-primary-container/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer font-semibold"
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${isBatchSaving ? 'animate-spin' : ''}`}>
                  {saveIcon}
                </span>
                <span>{saveButtonText}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= CURRICULUM SYNC HEALTH METRIC BAR ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm mb-space-lg">
          <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Total Modules</span>
              <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                {sections.length} Sections • {sections.reduce((a, s) => a + s.lessons.length, 0)} Lessons
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Curriculum Runtime</span>
              <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">2h 06m 09s</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">schedule</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Active Encoding CDN</span>
              <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">1 Transcoding (84%)</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined animate-spin text-tertiary">sync</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Enrolled Scholars</span>
              <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">342 Researchers</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">school</span>
            </div>
          </div>
        </div>

        {/* ================= MAIN DUAL PANE WORKSPACE (58% Tree / 42% Editor) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* ================= LEFT MASTER TREE COLUMN (~58% -> 7 Cols) ================= */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg min-w-0">
            {/* List Utility Row */}
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Curriculum Outline</span>
                <span className="font-code-md text-code-md px-space-xs py-0.5 bg-surface-container-high rounded text-on-surface-variant font-medium">
                  Auto-Sync On
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-outline">
                <button
                  onClick={() => setSections((prev) => prev.map((s) => ({ ...s, collapsed: true })))}
                  className="hover:text-on-surface p-1 rounded hover:bg-surface-container cursor-pointer"
                  title="Collapse All Sections"
                >
                  <span className="material-symbols-outlined text-[18px]">unfold_less</span>
                </button>
                <button
                  onClick={() => setSections((prev) => prev.map((s) => ({ ...s, collapsed: false })))}
                  className="hover:text-on-surface p-1 rounded hover:bg-surface-container cursor-pointer"
                  title="Expand All Sections"
                >
                  <span className="material-symbols-outlined text-[18px]">unfold_more</span>
                </button>
                <span className="mx-1 text-surface-variant">|</span>
                <span className="text-label-sm font-label-sm">Total Weight: 100%</span>
              </div>
            </div>

            {/* SECTIONS LIST */}
            {sections.map((sec, secIdx) => (
              <div
                key={sec.id}
                className="flex flex-col bg-surface-container-low rounded-xl p-space-md shadow-md transition-all border border-surface-container-high/30"
              >
                {/* Section Header Card */}
                <div className="flex items-center justify-between gap-space-sm pb-space-md bg-surface-container-low rounded-t-lg">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="cursor-grab active:cursor-grabbing text-outline hover:text-on-surface p-1 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">drag_pan</span>
                    </div>
                    <button
                      onClick={() => toggleCollapse(sec.id)}
                      className="text-outline hover:text-tertiary p-0.5 rounded transition-transform duration-150 cursor-pointer"
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
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                          {sec.title}
                        </span>
                        <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-space-xs py-0.5 rounded">
                          {sec.lessons.length} Lessons • {sec.meta}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-outline truncate">{sec.subtitle}</span>
                    </div>
                  </div>

                  {/* Section Action Tools */}
                  <div className="flex items-center gap-space-xs shrink-0">
                    <button
                      onClick={() => toast.info(`Section settings for ${sec.title}`)}
                      className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                      title="Section Settings"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                    </button>
                    <button
                      onClick={() => handleAddLessonToSection(sec.id)}
                      className="p-1.5 rounded-lg text-outline hover:text-tertiary hover:bg-surface-container transition-colors cursor-pointer"
                      title="Add Lesson to Section"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec.id, sec.title)}
                      className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Section Lessons Container */}
                {!sec.collapsed && (
                  <div className="flex flex-col gap-space-sm pt-space-sm pl-space-md">
                    {sec.lessons.map((les) => {
                      const isSelected = selectedLessonId === les.id;
                      return (
                        <div
                          key={les.id}
                          onClick={() => selectLesson(les)}
                          className={`group relative flex flex-col p-space-md rounded-xl transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-surface-container shadow-md border border-primary/30'
                              : 'bg-surface-container/60 hover:bg-surface-container border border-transparent'
                          }`}
                        >
                          {/* Neon Luminous Indigo Indicator Left Border for Active Selection */}
                          {isSelected && (
                            <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary rounded-r-full shadow-[0_0_12px_rgba(192,193,255,0.8)]"></div>
                          )}

                          <div className="flex items-start justify-between gap-space-sm min-w-0">
                            <div className="flex items-start gap-space-sm min-w-0 pl-1">
                              {/* Reorder Grip Handle */}
                              <div
                                className={`cursor-grab active:cursor-grabbing pt-0.5 hover:scale-110 transition-transform ${
                                  isSelected ? 'text-primary' : 'text-outline hover:text-on-surface'
                                }`}
                                title="Drag to reorder lesson"
                              >
                                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                              </div>

                              {/* Lesson Media Icon */}
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-primary-container/20 text-primary'
                                    : 'bg-surface-container-highest text-secondary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {les.typeIcon || 'smart_display'}
                                </span>
                              </div>

                              {/* Lesson Info */}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-space-xs flex-wrap">
                                  <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                                    {les.code} {les.title}
                                  </span>
                                  {isSelected && (
                                    <span className="bg-primary/20 text-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded font-semibold">
                                      Active Selection
                                    </span>
                                  )}
                                  {les.type === 'quiz' && (
                                    <span className="bg-secondary-container/40 text-secondary font-label-sm text-label-sm px-space-xs py-0.2 rounded font-medium">
                                      Lab Assessment
                                    </span>
                                  )}
                                </div>

                                {/* Metadata Chips */}
                                <div className="flex items-center gap-space-xs flex-wrap mt-space-xs text-body-sm font-body-sm text-on-surface-variant">
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
                                  <span className="bg-surface-container-high px-space-xs py-0.2 rounded text-[11px] font-code-md">
                                    {les.quality || '4K UHD'}
                                  </span>
                                  {les.freePreview && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-tertiary/10 text-tertiary px-space-xs py-0.2 rounded text-[11px] font-semibold">
                                        Free Preview Enabled
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge & Micro Action Buttons */}
                            <div className="flex items-center gap-space-xs shrink-0">
                              <span className="hidden sm:inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant text-[11px] font-medium px-space-xs py-1 rounded-full">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    les.status.includes('Published') ? 'bg-tertiary' : 'bg-secondary-fixed'
                                  }`}
                                ></span>
                                {les.status} {les.views && `• ${les.views}`}
                              </span>
                              <div className="flex items-center bg-surface-container-high p-0.5 rounded-lg">
                                <button
                                  onClick={() => selectLesson(les)}
                                  className={`p-1 rounded transition-colors ${
                                    isSelected ? 'text-primary bg-surface-bright' : 'text-outline hover:text-primary'
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
                                  className="p-1 rounded text-outline hover:text-tertiary hover:bg-surface-bright transition-colors"
                                  title="Preview Lesson"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Lesson '${les.title}' duplicated as draft.`);
                                  }}
                                  className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-bright transition-colors"
                                  title="Duplicate Lesson"
                                >
                                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteLesson(les.id, e)}
                                  className="p-1 rounded text-outline hover:text-error hover:bg-surface-bright transition-colors"
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
                      className="w-full py-space-sm px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-tertiary flex items-center justify-center gap-space-xs font-label-md text-label-md transition-all cursor-pointer border border-surface-container-high/40"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      <span>+ Add Lesson to {sec.title.split(':')[0]}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* CREATE NEW SECTION 3 DROPZONE CARD */}
            <div
              onClick={handleAddSection}
              className="w-full rounded-2xl p-space-lg bg-surface-container-low/60 hover:bg-surface-container-low flex flex-col items-center justify-center gap-space-sm text-center cursor-pointer transition-all duration-200 group border border-dashed border-surface-container-highest/60"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary-container/20 group-hover:text-primary text-outline flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[24px]">library_add</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors font-semibold">
                  + Append Section {sections.length + 1}
                </span>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">
                  Drag syllabus JSON or click here to build quantum module segment
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT IN-DEPTH LESSON EDITOR COLUMN (~42% -> 5 Cols) ================= */}
          <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
            {/* Editor Master Panel */}
            <div className="flex flex-col bg-surface-container-low rounded-2xl p-space-lg shadow-xl relative overflow-hidden border border-surface-container-high/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

              {/* Editor Header */}
              <div className="flex items-center justify-between pb-space-md mb-space-md bg-surface-container-low border-b border-surface-container-high/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      Editing Lesson {selectedLessonId}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" title="Connected to Nova Realtime Node"></span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline">
                    Section 1: Quantum Decoherence & Density Matrices
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="bg-surface-container-high text-tertiary font-code-md text-code-md px-space-xs py-0.5 rounded flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">cloud_done</span> Autosaved
                  </span>
                  <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded-full font-semibold">
                    Live Changes
                  </span>
                </div>
              </div>

              {/* Lesson Meta & Textual Properties */}
              <div className="flex flex-col gap-space-md">
                {/* Title Input */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface-variant font-medium">Lesson Title</label>
                    <span className="font-code-md text-code-md text-outline">chars: {editorData.title.length} / 80</span>
                  </div>
                  <input
                    type="text"
                    value={editorData.title}
                    onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                    className="w-full bg-surface-container text-on-surface font-body-md text-body-md rounded-lg px-space-sm py-2.5 outline-none focus:bg-surface-container-high transition-colors border border-surface-container-high/40 focus:border-primary/50"
                  />
                </div>

                {/* URL Slug & Structured Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm">
                  <div className="md:col-span-7 flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                      Canonical Path / Slug
                    </label>
                    <div className="relative flex items-center bg-surface-container rounded-lg px-space-sm py-2 border border-surface-container-high/40">
                      <span className="material-symbols-outlined text-[16px] text-outline mr-1">link</span>
                      <input
                        type="text"
                        value={editorData.slug}
                        onChange={(e) => setEditorData({ ...editorData, slug: e.target.value })}
                        className="bg-transparent text-on-surface font-code-md text-code-md w-full outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-5 flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface-variant font-medium">Duration</label>
                    <div className="flex items-center gap-space-xs">
                      <div className="flex items-center bg-surface-container rounded-lg px-space-xs py-2 flex-1 border border-surface-container-high/40">
                        <input
                          type="number"
                          value={editorData.durationMin}
                          onChange={(e) => setEditorData({ ...editorData, durationMin: Number(e.target.value) })}
                          className="bg-transparent text-on-surface font-code-md text-code-md w-full text-center outline-none"
                        />
                        <span className="text-outline font-label-sm text-label-sm pr-1">min</span>
                      </div>
                      <div className="flex items-center bg-surface-container rounded-lg px-space-xs py-2 flex-1 border border-surface-container-high/40">
                        <input
                          type="number"
                          value={editorData.durationSec}
                          onChange={(e) => setEditorData({ ...editorData, durationSec: Number(e.target.value) })}
                          className="bg-transparent text-on-surface font-code-md text-code-md w-full text-center outline-none"
                        />
                        <span className="text-outline font-label-sm text-label-sm pr-1">sec</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Rich Markdown Editor */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                    Lecture Overview & Learning Objectives
                  </label>
                  <div className="flex flex-col rounded-xl overflow-hidden bg-surface-container border border-surface-container-high/40">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-space-sm py-1.5 bg-surface-container-high text-outline">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1 hover:text-on-surface hover:bg-surface-container rounded cursor-pointer"
                          title="Bold"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + ' **bold**' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">format_bold</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-on-surface hover:bg-surface-container rounded cursor-pointer"
                          title="Italic"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + ' _italic_' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">format_italic</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-on-surface hover:bg-surface-container rounded cursor-pointer"
                          title="Code Block"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + '\n```python\n# code\n```' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-on-surface hover:bg-surface-container rounded cursor-pointer"
                          title="LaTeX Equation"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + ' $$\\hat{H} = \\hbar \\omega$$' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">functions</span>
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:text-on-surface hover:bg-surface-container rounded cursor-pointer"
                          title="Bullet List"
                          onClick={() => setEditorData((d) => ({ ...d, description: d.description + '\n- Item' }))}
                        >
                          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                        </button>
                      </div>
                      <span className="font-code-md text-code-md text-outline">Markdown Enabled</span>
                    </div>

                    {/* Text Area */}
                    <textarea
                      rows={3}
                      value={editorData.description}
                      onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                      className="w-full bg-surface-container p-space-sm text-on-surface font-body-sm text-body-sm outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Video Asset Management & Transcoder Widget */}
                <div className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-container border border-surface-container-high/40">
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                      Master Lecture Video Feed
                    </span>
                    <span className="font-code-md text-code-md text-tertiary">Live Processing</span>
                  </div>

                  {/* Video Preview Thumbnail Card */}
                  <div className="relative w-full h-44 rounded-lg overflow-hidden group shadow-inner bg-surface-container-lowest">
                    <img
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity"
                      alt="Lecture preview"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBDa6-cJy70-zYSvLMf72bHmtB7G-Jrjkthl8GAPjPJa9QE3fOX_Dd-K8E6DK796yLbTxwzJM7ffQ7OJzdRi6GMTGbGRyXqR0W8uTKNcewut7HgzZcazfCPkNGI44ESzdPQIpCug4ICTT7d0NL1frMLbs6UYWdZ8waxpa_PksiLVLOCq29jxpf9RfZRIDO-0PgDUnt2fewOeWjPmOR-jBoMRWjUiNqFQMAOGvLgYwoBOEsplCg_bw"
                    />

                    {/* Video Scrim Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-black/40 flex flex-col justify-between p-space-sm">
                      <div className="flex items-center justify-between">
                        <span className="bg-surface-container-lowest/80 text-tertiary font-code-md text-code-md px-space-xs py-0.5 rounded backdrop-blur">
                          4K PRORES SOURCE
                        </span>
                        <button
                          onClick={() => setPlayerModalOpen(true)}
                          className="p-1 rounded-full bg-surface-container-lowest/70 text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-center">
                        <div
                          onClick={() => setPlayerModalOpen(true)}
                          className="w-12 h-12 rounded-full bg-primary-container/80 text-on-primary-container flex items-center justify-center backdrop-blur shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[26px]">play_arrow</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface">
                        <span className="font-code-md text-code-md">{editorData.videoFile}</span>
                        <span className="text-outline">{editorData.videoSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Realtime Transcoding Engine Monitor */}
                  <div className="flex flex-col gap-1.5 mt-space-xs p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/30">
                    <div className="flex items-center justify-between text-body-sm font-body-sm">
                      <span className="text-on-surface font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary animate-spin">sync</span>
                        Transcoding: {editorData.transcodingPct}% Complete
                      </span>
                      <span className="font-code-md text-code-md text-tertiary">12.4 MB/s • ~42s remaining</span>
                    </div>

                    {/* Multi-tier glowing progress bar */}
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-primary via-tertiary to-primary-container rounded-full transition-all duration-300"
                        style={{ width: `${editorData.transcodingPct}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-0.5">
                      <span className="text-tertiary">1080p ✓</span>
                      <span className="text-tertiary">1440p ✓</span>
                      <span className="text-primary font-semibold">4K UHD ({editorData.transcodingPct}%)</span>
                      <span className="text-tertiary">HLS Packaging ✓</span>
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
                    className="flex items-center justify-center gap-space-xs py-2 text-outline hover:text-tertiary cursor-pointer font-label-md text-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_upload</span>
                    <span>Drag to replace raw lecture video file</span>
                  </div>
                </div>

                {/* Attached Learning Resources & Files */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                      Attached Learning Resources ({editorData.resources?.length || 0} Files)
                    </label>
                    <span className="font-code-md text-code-md text-outline">Total 5.84 MB</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {editorData.resources?.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-space-xs px-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-container-high/30"
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <span className={`material-symbols-outlined text-[20px] ${res.color}`}>{res.icon}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-body-md text-body-md text-on-surface truncate">{res.name}</span>
                            <span className="font-code-md text-code-md text-outline">{res.meta}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toast.info(`Previewing ${res.name}...`)}
                            className="p-1 rounded text-outline hover:text-on-surface cursor-pointer"
                            title="Preview File"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button
                            onClick={() => handleRemoveResource(res.id)}
                            className="p-1 rounded text-outline hover:text-error cursor-pointer"
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
                    className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container text-outline hover:text-primary flex items-center justify-center gap-space-xs font-label-sm text-label-sm cursor-pointer transition-all border border-dashed border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    <span>+ Upload Resource (PDF, Notebook, Code, Dataset)</span>
                  </div>
                </div>

                {/* Visibility & Access Controls Card */}
                <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container border border-surface-container-high/40">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Visibility & Access Controls
                  </span>

                  {/* Publishing State Selector */}
                  <div className="grid grid-cols-3 gap-space-xs p-1 bg-surface-container-high rounded-lg text-center">
                    {['Published', 'Draft', 'Scheduled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditorData({ ...editorData, status: st })}
                        className={`py-1 px-space-xs rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                          editorData.status === st
                            ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                            : 'text-outline hover:text-on-surface'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Free Preview Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-medium">Free Preview Sample</span>
                      <span className="font-body-sm text-body-sm text-outline">
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
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
                    </label>
                  </div>

                  {/* Discussion & Forum Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-medium">Student Q&A Thread</span>
                      <span className="font-body-sm text-body-sm text-outline">
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
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Action Docks for Panel */}
              <div className="flex items-center justify-between pt-space-lg mt-space-lg bg-surface-container-low border-t border-surface-container-high/30">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Discard uncommitted edits to Lesson ${selectedLessonId}?`)) {
                      window.location.reload();
                    }
                  }}
                  className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer"
                >
                  Discard
                </button>

                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => setPlayerModalOpen(true)}
                    className="flex items-center gap-1 px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer border border-surface-container-high/40"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    <span>Preview Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveLessonSolo}
                    className="flex items-center gap-1.5 px-space-lg py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save & Apply</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm text-outline border border-surface-container-high/30">
              <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">tips_and_updates</span>
              <div className="flex flex-col font-body-sm text-body-sm">
                <span className="text-on-surface font-medium">Instructional Design Tip</span>
                <span>
                  Lectures featuring linked Jupyter notebooks exhibit a 43% higher completion rate among postgrad fellows.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EMBEDDED STUDENT PLAYER PREVIEW MODAL ================= */}
      {playerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low rounded-2xl max-w-3xl w-full p-space-lg shadow-2xl relative flex flex-col gap-space-md border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary">slideshow</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Student Player Preview: {selectedLessonId} {editorData.title}
                </span>
              </div>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="p-1 rounded text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt="Lecture player simulation"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCphP798aYLhJ8y57WD52HEu7Oq0t6JMIZludZIrmn51jLMbQSMh2_Vl96RnekTAa647MJOTwzfBWjpz69fdYVVILfOjQSyIiYgXrKC6XzMez8zXT39ztbcBJIpDfDHiVN6Ir0cjwMsc-3WWLiU9r7YqIPNoQCysgSfTZVWbsCfY-yNc-LNb0NLQ7jrkvvgCuxIoZFcEjQLcUAsgYUBPyqGPJ0f50CF3Kv4ccfr5HtFq8Ii32FcGEU"
              />

              {/* Player Simulated Chrome */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-space-md">
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full mb-space-sm relative cursor-pointer">
                  <div className="w-1/3 h-full bg-tertiary rounded-full"></div>
                  <div className="absolute left-1/3 -top-1 w-3.5 h-3.5 rounded-full bg-white shadow"></div>
                </div>

                <div className="flex items-center justify-between text-white text-body-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined cursor-pointer hover:text-tertiary transition-colors">
                      play_arrow
                    </span>
                    <span className="material-symbols-outlined cursor-pointer hover:text-tertiary transition-colors">
                      volume_up
                    </span>
                    <span className="font-code-md text-code-md">06:08 / 18:24</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="bg-primary/20 px-1.5 py-0.5 rounded text-primary text-[11px] font-code-md">4K UHD</span>
                    <span className="material-symbols-outlined cursor-pointer hover:text-tertiary transition-colors">
                      settings
                    </span>
                    <span className="material-symbols-outlined cursor-pointer hover:text-tertiary transition-colors">
                      fullscreen
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs text-body-sm font-body-sm text-on-surface-variant">
              <span>Transcoded via Nova Adaptive HLS • Zero Latency CDN</span>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-bright cursor-pointer"
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
