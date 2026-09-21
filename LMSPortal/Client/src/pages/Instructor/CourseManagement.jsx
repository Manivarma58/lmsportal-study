import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

// Default mock courses aligned with StudyPilot Cyber-Academic Spec
const INITIAL_CURRICULA = [
  {
    _id: 'c-qpu-904',
    code: 'QPU-904',
    tier: 'Graduate Tier',
    title: 'Neural Networks & Quantum Computing: Tensor Latents & Hybrid Algorithms',
    subtitle: '20 Modules • 8 Quantum Sandbox Workspaces • Lab Cluster #3',
    domain: 'Quantum Systems',
    domainColor: 'bg-tertiary-container/20 text-tertiary',
    students: 3842,
    studentsDelta: '+34 this week',
    rating: 4.96,
    reviewsCount: 1420,
    status: 'Published',
    statusType: 'published',
    updatedAtText: '2 hours ago',
    updatedBy: 'Dr. Vance',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVvF8q6YkooB6jd00HigLk1xg6D6cbOsCVV0EO7gL6hILBvwIyyGmNIL7iOTKwDHBFimS2-9QKg0fEDv6QZkmSNXxDjECvJ1FBgRu9wWzRDGzQV66Yr-5NsAFizgfXmsgurau2Ne7YTCr6ibQJb3OXHdEkplqdg79L4sYpjDVxie01xTxph4Xqga6HLxcQjSSnYtZZSDvywDSqGQRrYdyBA83m1TPJ2hFHKvlD6E6tlJpPbGnPzSw',
    price: 189,
    published: true,
  },
  {
    _id: 'c-cloud-702',
    code: 'CLOUD-702',
    tier: 'Practitioner',
    title: 'Fullstack Cloud Architecture & Kubernetes Microservice Mesh',
    subtitle: '18 Modules • Istio / Envoy / Cilium Lab Rigs',
    domain: 'Cloud & DevOps',
    domainColor: 'bg-primary-container/20 text-primary',
    students: 4110,
    studentsDelta: '+81 this week',
    rating: 4.91,
    reviewsCount: 2180,
    status: 'Published',
    statusType: 'published',
    updatedAtText: 'Yesterday',
    updatedBy: 'Dr. Vance',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbuXC-TvtmSqBiatMZolIgEEMfD5BKOwrGsnsQKh7UEuR1Oz2ipybFKoL_nzu78RIbbHD3Wimy17YrbiX2Cn4n0-KiEiwlyhmbwBdtHlcv6PVLTl1L7LJ6xzF8ocI5F6unxNA-X6kILGPZniWkydEqUf1osi3drtmc-DSJKQpTieTMOofGd_9n7jOzGZZuMvGyd-Dc9x_Y2kyw8TRNvgPMuDU1irP51joTSHjXuqyW5J98X7Dtrk4',
    price: 149,
    published: true,
  },
  {
    _id: 'c-crypto-802',
    code: 'CRYPTO-802',
    tier: 'Specialist',
    title: 'Applied Homomorphic Encryption & Secure Multi-Party Compute (SMPC)',
    subtitle: '14 Modules • ZK-SNARKs Engine • Math Sandbox',
    domain: 'Cryptography',
    domainColor: 'bg-secondary-container/20 text-secondary',
    students: 2490,
    studentsDelta: '+19 this week',
    rating: 4.88,
    reviewsCount: 890,
    status: 'Published',
    statusType: 'published',
    updatedAtText: '3 days ago',
    updatedBy: 'Dr. Vance',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQFNvgnnAXUSn003dxTDKL5jlxojixscjsuB_bvvlR_tCXRwzFAw7irMhAUSLrgG8Wf446VFM-WqnojrL1XFlBmEEyXTrMWSfPcnSXgJRXI0nT8fQC3nppk1P8AFCV3H8C14hKCBGv4PIWOK-R5Gc8mlawbcurObRnE0Xxjym9vZa0o24NrpPfhMiKXi0Q6M_cTxuG_QB3Hyo7jW9OedWfKgiqD_HPlTLT2M_t_XFz79gMsSDZJVs',
    price: 219,
    published: true,
  },
  {
    _id: 'c-ai-605',
    code: 'AI-605',
    tier: 'Core Track',
    title: 'Autonomous LLM Agents & Multi-Modal Synthetic Latents',
    subtitle: 'Draft v1.4 • Module 6 of 8 in drafting',
    domain: 'AI Architecture',
    domainColor: 'bg-primary-container/20 text-primary',
    students: 1820,
    studentsDelta: 'Pre-registered',
    rating: 4.98,
    reviewsCount: 450,
    status: 'Draft (Mod 6/8)',
    statusType: 'draft',
    updatedAtText: 'Oct 22, 2025',
    updatedBy: 'Dr. Vance',
    thumbnail:
      'https://lh3.googleusercontent.com/aida/AEtjO1VLCqn5wnEB6NjMW1LQuBO_r-r44pQaJ-GOblMCfDphpI0GzzJTiFdM8i5qmfRjRuasrCi2f2M3RdLyW0Pgf2iGzusgEad9nHlJkSCCD1bhY0Ph_2CILXXvbB3CYZqkgHJeGt9rRPatzB4Q88_nPJvA1AD0MsYfC2kLT2_t8vvd3hU85B4uE6n5r1TYJvvl3lZi0dIo53wMOYDSRRdB9hHpiudDqKbZ5H0BzO8ipSo4fL4C7ykbpQh6cQ',
    price: 199,
    published: false,
  },
  {
    _id: 'c-hpc-910',
    code: 'HPC-910',
    tier: 'Postgrad Research',
    title: 'High-Performance GPU Kernel Optimization in CUDA & Triton',
    subtitle: '12 Modules • H100 Cluster Allotment • Compiler Lab',
    domain: 'Systems & HPC',
    domainColor: 'bg-surface-container-highest text-on-surface-variant',
    students: 980,
    studentsDelta: '+4 peer audits',
    rating: 4.95,
    reviewsCount: 310,
    status: 'Faculty Audit',
    statusType: 'published',
    updatedAtText: 'Oct 18, 2025',
    updatedBy: 'Peer Review Node',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXw97BswuTBDqMJWw4-OB_f7a1Mw1LrUtvd9IFcRBRRyP1zwgiBse8akyQ6ROyE-6YKk1A_JGxCHh3BNKnCrpdRh6Uwzmx7A0o60jUw5UuBmJNkoaVANO62GwMJQa4-whNiQ4xec9d483MH6XQW8TGn1WjEvQD3yrlQZLxjzn7Lpyb8d0VcnwP-nTdB-7OVW9PIRozS1B763Aou_OHE8UnTyifRG78PSHqRXnj4_MOEUzDBxC9buk',
    price: 249,
    published: true,
  },
  {
    _id: 'c-dist-401',
    code: 'DIST-401',
    tier: 'Undergrad Core',
    title: 'Legacy Distributed Consensus Protocols & Raft v1',
    subtitle: '10 Modules • Deprecated by Raft-v2 Consensus Rig',
    domain: 'Distributed Systems',
    domainColor: 'bg-surface-container text-outline',
    students: 1240,
    studentsDelta: 'Archived Pool',
    rating: 4.72,
    reviewsCount: 520,
    status: 'Archived Dec 2024',
    statusType: 'archived',
    updatedAtText: 'Dec 12, 2024',
    updatedBy: 'SysAdmin Archive',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUPufXZXLwlJYDxtkgKdhDqmR2rolDM1WjBhwQT_keqzuJPhVCUn-hmnhV4nf_EVpeFd81xlZC6FP_zaFEGsd01xbTdC5nmcuwjZ1CEwbcTnINmI-Eyj0MuOZrv3-KSJ4ioeiRtCbg6Yoawf8iIK2un5YnStXh038Dt6jMgJODmB7290A19rj0jOTFEVEel-p4VJfT_c35AONwooD99emsVuBj0Mv2lTDfXWCKTwy5pVgpZhh3Ido',
    price: 99,
    published: false,
  },
];

export default function CourseManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Local state & database blend
  const [courses, setCourses] = useState(INITIAL_CURRICULA);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, published, draft, archived
  const [viewMode, setViewMode] = useState('table'); // table, grid
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteModalCourse, setDeleteModalCourse] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    shortDescription: '',
    description: '',
    category: 'Quantum Systems',
    level: 'Beginner',
    price: 149,
    isFree: false,
    thumbnail: '',
    willLearn: '',
  });

  // Fetch real courses from API and blend with faculty curricula
  const fetchMyCourses = async () => {
    try {
      const res = await API.get('/courses/instructor/my-courses');
      const dbCourses = res.data.courses || [];
      if (dbCourses.length > 0) {
        // Map backend courses to StudyPilot curriculum schema
        const mapped = dbCourses.map((c, i) => ({
          _id: c._id,
          code: c.code || `LMS-${100 + i}`,
          tier: c.level ? `${c.level} Tier` : 'Graduate Tier',
          title: c.title,
          subtitle: `${c.sections?.length || 4} Modules • Active Sandbox • Cluster #${i + 1}`,
          domain: c.category || 'Quantum Systems',
          domainColor: 'bg-primary-container/20 text-primary',
          students: c.enrolledCount || 120,
          studentsDelta: '+12 this week',
          rating: c.rating || 4.9,
          reviewsCount: c.numReviews || 45,
          status: c.published || c.isPublished ? 'Published' : 'Draft',
          statusType: c.published || c.isPublished ? 'published' : 'draft',
          updatedAtText: 'Recently',
          updatedBy: 'Faculty Lead',
          thumbnail:
            c.thumbnail ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAVvF8q6YkooB6jd00HigLk1xg6D6cbOsCVV0EO7gL6hILBvwIyyGmNIL7iOTKwDHBFimS2-9QKg0fEDv6QZkmSNXxDjECvJ1FBgRu9wWzRDGzQV66Yr-5NsAFizgfXmsgurau2Ne7YTCr6ibQJb3OXHdEkplqdg79L4sYpjDVxie01xTxph4Xqga6HLxcQjSSnYtZZSDvywDSqGQRrYdyBA83m1TPJ2hFHKvlD6E6tlJpPbGnPzSw',
          price: c.price || 0,
          published: Boolean(c.published || c.isPublished),
        }));

        // Merge: avoid duplicates by title or ID
        setCourses((prev) => {
          const existingTitles = new Set(mapped.map((m) => m.title.toLowerCase()));
          const rest = prev.filter((p) => !existingTitles.has(p.title.toLowerCase()));
          return [...mapped, ...rest];
        });
      }
    } catch (err) {
      console.warn('Could not load backend courses, using rich faculty dataset:', err.message);
    }
  };

  useEffect(() => {
    fetchMyCourses();
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredCurricula.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter and Sort Curricula
  const filteredCurricula = useMemo(() => {
    return courses.filter((item) => {
      // Tab filter
      if (activeTab === 'published' && item.statusType !== 'published') return false;
      if (activeTab === 'draft' && item.statusType !== 'draft') return false;
      if (activeTab === 'archived' && item.statusType !== 'archived') return false;

      // Category filter
      if (selectedCategory !== 'all' && item.domain !== selectedCategory) return false;

      // Status dropdown filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Published' && item.statusType !== 'published') return false;
        if (selectedStatus === 'Draft' && item.statusType !== 'draft') return false;
        if (selectedStatus === 'Archived' && item.statusType !== 'archived') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchDomain = item.domain.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDomain) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest_rated') return b.rating - a.rating;
      if (sortBy === 'most_students') return b.students - a.students;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0; // Default order
    });
  }, [courses, activeTab, selectedCategory, selectedStatus, searchQuery, sortBy]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: courses.length,
      published: courses.filter((c) => c.statusType === 'published').length,
      draft: courses.filter((c) => c.statusType === 'draft').length,
      archived: courses.filter((c) => c.statusType === 'archived').length,
    };
  }, [courses]);

  // Export Audit CSV
  const handleExportCSV = () => {
    const headers = ['Code', 'Title', 'Domain', 'Tier', 'Students', 'Rating', 'Reviews', 'Status', 'Price'];
    const rows = filteredCurricula.map((c) => [
      c.code,
      `"${c.title.replace(/"/g, '""')}"`,
      c.domain,
      c.tier,
      c.students,
      c.rating,
      c.reviewsCount,
      c.status,
      `$${c.price}`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StudyPilot_Course_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Curricula audit exported as CSV successfully!');
  };

  // Bulk Actions
  const handleBulkActions = () => {
    if (selectedIds.length === 0) {
      toast.info('Select one or more curricula rows to perform bulk actions.');
      return;
    }
    toast.info(`Selected ${selectedIds.length} course(s). Preparing ledger synchronization...`);
  };

  // Toggle Publish
  const handleTogglePublish = async (courseId) => {
    try {
      if (!courseId.startsWith('c-')) {
        await API.patch(`/courses/${courseId}/publish`);
      }
      setCourses((prev) =>
        prev.map((c) => {
          if (c._id === courseId) {
            const nextPub = !c.published;
            return {
              ...c,
              published: nextPub,
              status: nextPub ? 'Published' : 'Draft',
              statusType: nextPub ? 'published' : 'draft',
            };
          }
          return c;
        })
      );
      toast.success('Course lifecycle status toggled successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  // Trigger Delete Modal
  const openDeleteModal = (course) => {
    setDeleteModalCourse(course);
    setDeleteConfirmInput('');
  };

  const closeDeleteModal = () => {
    setDeleteModalCourse(null);
    setDeleteConfirmInput('');
  };

  const requiredDeleteToken = deleteModalCourse
    ? `DELETE-${deleteModalCourse.code}`
    : 'DELETE-DIST-401';
  const isDeleteTokenMatched =
    deleteConfirmInput.trim() === requiredDeleteToken ||
    (deleteModalCourse?.code === 'DIST-401' && deleteConfirmInput.trim() === 'DELETE-DIST-401');

  const handleConfirmDelete = async () => {
    if (!deleteModalCourse || !isDeleteTokenMatched) return;
    try {
      if (!deleteModalCourse._id.startsWith('c-')) {
        await API.delete(`/courses/${deleteModalCourse._id}`);
      }
      setCourses((prev) => prev.filter((c) => c._id !== deleteModalCourse._id));
      toast.success(`Curriculum '${deleteModalCourse.code}' deleted permanently from ledger.`);
      closeDeleteModal();
    } catch (err) {
      toast.error(err.message || 'Failed to delete curriculum');
    }
  };

  // Handle Create Course Submit
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      return toast.error('Please enter a course title');
    }

    try {
      setSaving(true);
      const code = formData.code?.trim() || `QPU-${Math.floor(100 + Math.random() * 900)}`;
      const payload = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description || formData.title,
        category: formData.category,
        level: formData.level,
        price: Number(formData.price) || 0,
        isFree: Number(formData.price) === 0,
        thumbnail:
          formData.thumbnail ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAVvF8q6YkooB6jd00HigLk1xg6D6cbOsCVV0EO7gL6hILBvwIyyGmNIL7iOTKwDHBFimS2-9QKg0fEDv6QZkmSNXxDjECvJ1FBgRu9wWzRDGzQV66Yr-5NsAFizgfXmsgurau2Ne7YTCr6ibQJb3OXHdEkplqdg79L4sYpjDVxie01xTxph4Xqga6HLxcQjSSnYtZZSDvywDSqGQRrYdyBA83m1TPJ2hFHKvlD6E6tlJpPbGnPzSw',
        willLearn: formData.willLearn
          ? formData.willLearn.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      let newId = `c-${Date.now()}`;
      try {
        const res = await API.post('/courses', payload);
        if (res.data.course?._id) {
          newId = res.data.course._id;
        }
      } catch (postErr) {
        console.warn('Local fallback course creation:', postErr.message);
      }

      const newCourseObj = {
        _id: newId,
        code,
        tier: `${formData.level} Tier`,
        title: formData.title,
        subtitle: '12 Modules • 4 Sandboxes • Cluster Alpha',
        domain: formData.category,
        domainColor: 'bg-primary-container/20 text-primary',
        students: 0,
        studentsDelta: 'New Cohort',
        rating: 5.0,
        reviewsCount: 1,
        status: 'Draft',
        statusType: 'draft',
        updatedAtText: 'Just now',
        updatedBy: 'Dr. Vance',
        thumbnail: payload.thumbnail,
        price: payload.price,
        published: false,
      };

      setCourses((prev) => [newCourseObj, ...prev]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        code: '',
        shortDescription: '',
        description: '',
        category: 'Quantum Systems',
        level: 'Beginner',
        price: 149,
        isFree: false,
        thumbnail: '',
        willLearn: '',
      });

      toast.success('Course created! Now you can organize sections and lessons.');
      if (!newId.startsWith('c-')) {
        navigate(`/instructor/courses/${newId}/editor`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-transparent">
      {/* ================= INTERACTIVE DELETE MODAL ================= */}
      {deleteModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
                  <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Course Curriculum?</h3>
                  <p className="font-mono text-xs text-slate-500">
                    {deleteModalCourse.code} // ARCHIVED RECORD
                  </p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              You are about to permanently delete{' '}
              <span className="font-semibold text-slate-900">
                ‘{deleteModalCourse.title}’ ({deleteModalCourse.code})
              </span>
              . This will unenroll {deleteModalCourse.students.toLocaleString()} students, revoke video access tokens, and archive all associated records.{' '}
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </p>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-slate-500 uppercase tracking-wider">
                Type confirmation token: <code className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{requiredDeleteToken}</code>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={`Type ${requiredDeleteToken} to confirm`}
                  className="w-full h-11 px-3 bg-slate-50 rounded-xl font-mono text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all border border-slate-200"
                  autoFocus
                />
                {isDeleteTokenMatched && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 material-symbols-outlined text-[18px]">
                    verified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={!isDeleteTokenMatched}
                onClick={handleConfirmDelete}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all ${
                  isDeleteTokenMatched
                    ? 'bg-red-600 hover:bg-red-700 shadow-sm cursor-pointer'
                    : 'bg-red-300 opacity-60 cursor-not-allowed'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>Delete Curriculum Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full space-y-6">
        {/* ================= HEADER BANNER ================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/80 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  INSTRUCTIONAL MANAGEMENT
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
                  FALL SESSION // ACTIVE
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Course Management
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Author, publish, and inspect telemetry for your active postgraduate curricula, research syllabi, and microservice compute labs.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleBulkActions}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">tune</span>
                <span>Bulk Actions</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
                <span>Export Audit (CSV)</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer group"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-90">add</span>
                <span>Create Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= TELEMETRY METRIC TILES ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Curricula</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{courses.length}</span>
              <span className="font-mono text-xs text-blue-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {tabCounts.published} Live
              </span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Active Students</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">12,480</span>
              <span className="font-mono text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.2%
              </span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Avg Cohort Rating</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">4.92 ★</span>
              <span className="font-mono text-xs text-slate-500">6,730 reviews</span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Faculty Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">$482,900</span>
              <span className="font-mono text-xs text-purple-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">insights</span> Net YTD
              </span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>

        {/* ================= TABS & FILTER TOOLBAR ================= */}
        <div className="space-y-4">
          {/* Tabs Strip */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-1">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                type="button"
              >
                <span>All Courses</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                    activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tabCounts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('published')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Published</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-200 font-mono text-[11px] text-slate-600">
                  {tabCounts.published}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('draft')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'draft'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Draft</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-200 font-mono text-[11px] text-slate-600">
                  {tabCounts.draft}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('archived')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'archived'
                    ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Archived</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-200 font-mono text-[11px] text-slate-600">
                  {tabCounts.archived}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 self-end">
              <button
                onClick={() => setViewMode('table')}
                aria-label="Table View"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border ${
                  viewMode === 'table' ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="p-3 bg-white rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-3 shadow-sm border border-slate-200/90">
            {/* Search */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-50 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-slate-200"
                placeholder="Search curricula by title, code, category..."
                type="text"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[11px] text-slate-500">
                /
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer border border-slate-200 font-medium"
                >
                  <option value="all">All Domains (Quantum, Cloud, AI)</option>
                  <option value="Quantum Systems">Quantum Systems</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Cryptography">Cryptography</option>
                  <option value="AI Architecture">AI Architecture</option>
                  <option value="Systems & HPC">Systems & HPC</option>
                  <option value="Distributed Systems">Distributed Systems</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer border border-slate-200 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer border border-slate-200 font-medium"
                >
                  <option value="newest">Last Updated: Most Recent ↓</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="most_students">Most Students</option>
                  <option value="title">Title: A to Z</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABLE VIEW SECTION ================= */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-mono text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center" scope="col">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredCurricula.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Course Curriculum & Code
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Domain
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Students
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Rating
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Lifecycle Status
                    </th>
                    <th className="py-3.5 px-4 font-semibold" scope="col">
                      Last Updated
                    </th>
                    <th className="py-3.5 px-4 text-right font-semibold" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-sm">
                  {filteredCurricula.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                        No curricula found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCurricula.map((row) => (
                      <tr
                        key={row._id}
                        className={`hover:bg-slate-50/80 transition-colors group ${
                          row.statusType === 'archived' ? 'opacity-70 hover:opacity-100' : ''
                        }`}
                      >
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row._id)}
                            onChange={() => handleToggleSelectRow(row._id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0 max-w-md">
                            <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-sm">
                              <img
                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                  row.statusType === 'archived' ? 'grayscale group-hover:grayscale-0' : ''
                                }`}
                                alt={row.title}
                                src={row.thumbnail}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-xs text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                                  {row.code}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{row.tier}</span>
                              </div>
                              <p className="text-sm font-semibold truncate text-slate-900 group-hover:text-blue-600 transition-colors">
                                {row.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{row.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {row.domain}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {row.students.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 font-mono text-xs text-emerald-600 font-medium">
                              {row.studentsDelta.startsWith('+') && (
                                <span className="material-symbols-outlined text-[13px]">add</span>
                              )}
                              <span>{row.studentsDelta}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-amber-400 text-[16px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-900">{row.rating}</span>
                            <span className="text-xs text-slate-400">({row.reviewsCount})</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {row.statusType === 'published' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              {row.status}
                            </span>
                          ) : row.statusType === 'draft' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-mono text-xs font-semibold border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {row.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              {row.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="font-mono text-xs text-slate-700 font-semibold">{row.updatedAtText}</p>
                          <p className="text-xs text-slate-400">{row.updatedBy}</p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {row.statusType === 'archived' ? (
                              <>
                                <button
                                  onClick={() => openDeleteModal(row)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all flex items-center cursor-pointer"
                                  title="Delete Course"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                                <button
                                  onClick={() => handleTogglePublish(row._id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                                  title="Restore Course"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">unarchive</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    row._id.startsWith('c-')
                                      ? toast.info(`Opening syllabus editor for ${row.code}`)
                                      : navigate(`/instructor/courses/${row._id}/editor`)
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                  title="Edit Syllabus"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/student/course/${row._id}/learn`)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                  title="Open Interactive Portal"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                </button>
                                <button
                                  onClick={() => navigate('/instructor/analytics')}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                                  title="Telemetry Metrics"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openDeleteModal(row)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Delete Options"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Telemetry Bottom Dock */}
            <div className="px-4 py-3 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-slate-500">
                  Showing <span className="text-slate-900 font-semibold">1–{filteredCurricula.length}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{courses.length}</span> instructional curricula
                </span>
                <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-500">
                  <span>Per page:</span>
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="bg-white px-2 py-1 rounded-lg text-slate-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer border border-slate-200 shadow-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Telemetry Sync Note */}
              <div className="hidden xl:flex items-center gap-2 font-mono text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Faculty Sync: Active • Autosaved • Cloud Mirror</span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 self-end md:self-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 font-mono text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold flex items-center justify-center cursor-pointer ${
                    currentPage === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                  type="button"
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center cursor-pointer ${
                    currentPage === 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                  type="button"
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center cursor-pointer ${
                    currentPage === 3 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                  type="button"
                >
                  3
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 font-mono text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                  type="button"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= GRID VIEW SECTION ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCurricula.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="font-mono text-xs text-blue-700 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg font-semibold border border-blue-200 shadow-sm">
                      {c.code}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold backdrop-blur-md shadow-sm ${
                      c.statusType === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">{c.tier}</span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{c.subtitle}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">{c.rating}</span>
                      <span className="text-xs text-slate-400">({c.reviewsCount})</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-600">{c.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="px-5 pb-5 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      c._id.startsWith('c-')
                        ? toast.info(`Opening syllabus editor for ${c.code}`)
                        : navigate(`/instructor/courses/${c._id}/editor`)
                    }
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => navigate(`/student/course/${c._id}/learn`)}
                    className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center justify-center cursor-pointer border border-blue-200"
                    title="Preview Portal"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(c)}
                    className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center cursor-pointer border border-red-200"
                    title="Delete Course"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= SYLLABUS AUXILIARY MATRIX ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Live Sync Status */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">hub</span>
                <h3 className="text-sm font-bold text-slate-900">Decentralized Lab Cluster</h3>
              </div>
              <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">NODE #42</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Real-time compute pods provisioned across 4 availability zones. Auto-scaling Kubernetes runtime for student compiler sandbox submissions.
            </p>
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold border-2 border-white">
                  EV
                </div>
                <div className="inline-block h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold border-2 border-white">
                  AK
                </div>
                <div className="inline-block h-7 w-7 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold border-2 border-white">
                  ML
                </div>
              </div>
              <span className="font-mono text-xs text-slate-500">12 Tutors Online</span>
            </div>
          </div>

          {/* Quick Authoring Snapshot */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">auto_stories</span>
                <h3 className="text-sm font-bold text-slate-900">Pending Course Audits</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono text-xs font-semibold border border-amber-200">
                2 Actions
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-800 truncate">HPC-910 CUDA Kernel Testing</span>
                <span className="font-mono text-xs text-blue-600 font-semibold">Review</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-800 truncate">AI-605 Synthetic Token Labs</span>
                <span className="font-mono text-xs text-amber-600 font-semibold">Final Draft</span>
              </div>
            </div>
            <a
              className="mt-3 font-mono text-xs text-blue-600 flex items-center gap-1 hover:underline cursor-pointer font-semibold"
              onClick={() => toast.info('Opening Peer Review Workbench...')}
            >
              <span>Go to Peer Review Workbench</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>

          {/* Cloud Resource Quota */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[20px]">cloud_sync</span>
                <h3 className="text-sm font-bold text-slate-900">Storage &amp; Video CDN</h3>
              </div>
              <span className="font-mono text-xs text-slate-500 font-semibold">19.2% Used</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Lecture recordings, compute sandbox artifacts, and student repository mirrors preserved on institution CDN storage.
            </p>
            <div className="mt-4 space-y-1.5">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '19.2%' }}></div>
              </div>
              <div className="flex justify-between font-mono text-xs text-slate-400 pt-1">
                <span>48.2 GB Allocated</span>
                <span>250 GB Quota</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CREATE COURSE ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[22px]">add_circle</span>
                <h2 className="text-lg font-bold text-slate-900">Author New Course Curriculum</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 mt-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Byzantine Fault Tolerance"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Curriculum Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QPU-904"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Domain / Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                  >
                    <option value="Quantum Systems">Quantum Systems</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="AI Architecture">AI Architecture</option>
                    <option value="Systems & HPC">Systems & HPC</option>
                    <option value="Distributed Systems">Distributed Systems</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Academic Tier
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                  >
                    <option value="Beginner">Undergrad Core</option>
                    <option value="Intermediate">Practitioner</option>
                    <option value="Advanced">Graduate Tier</option>
                    <option value="Postgraduate">Postgrad Research</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Tuition ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or cloud URL"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Course Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Comprehensive description of the syllabus, lab sandbox, and research requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Create Course Curriculum</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
