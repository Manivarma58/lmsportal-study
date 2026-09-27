import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { toast } from 'sonner';

const DEFAULT_USERS = [
  {
    id: 'USR-84920',
    name: 'Dr. Elena Vance',
    handle: '@elena.vance',
    email: 'elena.vance@nova-labs.edu',
    avatar: '/assets/instructor-elena.jpg',
    verified: true,
    ssoProvider: 'OKTA-SAML2',
    ssoDomain: 'nova-labs.edu',
    role: 'Instructor',
    roleType: 'instructor',
    status: 'Active',
    enrolledDate: 'Aug 12, 2022',
    tenure: '2.4 yrs tenure',
    lastSeen: '2 mins ago',
    lastSeenDevice: 'laptop_mac',
    lastSeenLocation: '198.51.100.24 (Boston, US)',
    title: 'Lead Cryptography Fellow & Instructor',
    ssoRealm: 'Okta Fed #991',
    timezone: 'EST (UTC-5) • US',
    cohort: 'Alpha-2024-Q3',
    securityLevel: 'Tier 4 Faculty',
    modules: [
      { name: 'Neural Networks & Quantum Algorithms', progress: 88, score: '94%', peers: 184 },
      { name: 'Distributed Cloud Kernel Design', progress: 42, score: '89%', peers: 96 },
    ],
  },
  {
    id: 'USR-00004',
    name: 'Marcus Vance',
    handle: '@marcus.v',
    email: 'marcus.v@admin.novalms.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    verified: true,
    securityBadge: true,
    ssoProvider: 'AZURE-OIDC',
    ssoDomain: 'admin.novalms.io',
    role: 'Super Admin',
    roleType: 'superadmin',
    status: 'Active',
    enrolledDate: 'Jan 04, 2021',
    tenure: 'System Origin',
    lastSeen: 'Just now',
    lastSeenDevice: 'terminal',
    lastSeenLocation: '10.240.0.12 (Internal Enclave)',
    title: 'Chief Security & System Architect',
    ssoRealm: 'Azure Master Tenant',
    timezone: 'UTC (GMT+0)',
    cohort: 'Core-Root',
    securityLevel: 'Tier 0 Master Admin',
    modules: [{ name: 'Distributed Systems & Byzantine Fault Tolerance', progress: 100, score: '99%', peers: 420 }],
  },
  {
    id: 'USR-10923',
    name: 'Alex Rivera',
    handle: '@a.rivera',
    email: 'a.rivera@mit.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    verified: false,
    ssoProvider: 'GOOGLE-WORKSPACE',
    ssoDomain: 'mit.edu',
    role: 'Student',
    roleType: 'student',
    status: 'Active',
    enrolledDate: 'Sep 18, 2023',
    tenure: '1 yr ago',
    lastSeen: '14 mins ago',
    lastSeenDevice: 'devices',
    lastSeenLocation: '18.18.0.45 (Cambridge, US)',
    title: 'Postgraduate Quantum Computing Researcher',
    ssoRealm: 'MIT Campus Workspace',
    timezone: 'EST (UTC-5) • US',
    cohort: 'Quantum-Beta-24',
    securityLevel: 'Tier 1 Scholar',
    modules: [{ name: 'Quantum Circuits & QPU Optimization', progress: 78, score: '91%', peers: 110 }],
  },
  {
    id: 'USR-49129',
    name: 'Dr. Sarah Jenkins',
    handle: '@s.jenkins',
    email: 's.jenkins@oxford.ac.uk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    verified: true,
    ssoProvider: 'SHIBBOLETH',
    ssoDomain: 'oxford.ac.uk',
    role: 'Instructor',
    roleType: 'instructor',
    status: 'Active',
    enrolledDate: 'Mar 02, 2023',
    tenure: '1.7 yrs ago',
    lastSeen: '1 hour ago',
    lastSeenDevice: 'laptop_chromebook',
    lastSeenLocation: '163.1.0.8 (Oxford, UK)',
    title: 'Senior Computational Fellow & Professor',
    ssoRealm: 'UK Access Federation',
    timezone: 'BST (UTC+1) • UK',
    cohort: 'Oxford-Cloud-01',
    securityLevel: 'Tier 4 Faculty',
    modules: [{ name: 'Zero-Knowledge Proof Systems', progress: 92, score: '97%', peers: 135 }],
  },
  {
    id: 'USR-90214',
    name: 'Liam Chen',
    handle: '@liam.c',
    email: 'liam.c@stanford.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    flagged: true,
    ssoProvider: 'STANFORD-SAML',
    ssoDomain: 'stanford.edu',
    role: 'Student',
    roleType: 'student',
    status: 'Suspended',
    enrolledDate: 'Jun 10, 2024',
    tenure: '4 mos ago',
    lastSeen: '3 days ago',
    lastSeenDevice: 'warning',
    lastSeenLocation: 'Concurrent Geo-IP: SG & US',
    title: 'AI Lab Scholar (Under Investigation)',
    ssoRealm: 'Stanford SSO Matrix',
    timezone: 'PST (UTC-8) • US',
    cohort: 'Delta-Stanford',
    securityLevel: 'Restricted Honeypot Sandbox',
    modules: [{ name: 'Deep Learning Kernel Optimization', progress: 45, score: '68%', peers: 82 }],
  },
  {
    id: 'USR-33291',
    name: 'Maya Lin',
    handle: '@m.lin',
    email: 'm.lin@nova-labs.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    verified: false,
    ssoProvider: 'OKTA-FEDERATION',
    ssoDomain: 'nova-labs.edu',
    role: 'System Auditor',
    roleType: 'auditor',
    status: 'Active',
    enrolledDate: 'Nov 15, 2023',
    tenure: '11 mos ago',
    lastSeen: '5 hours ago',
    lastSeenDevice: 'laptop_mac',
    lastSeenLocation: '140.82.112.4 (San Jose, US)',
    title: 'Lead Academic Compliance Inspector',
    ssoRealm: 'Okta Enterprise Directory',
    timezone: 'PST (UTC-8) • US',
    cohort: 'Governance-Audit',
    securityLevel: 'Tier 3 Compliance',
    modules: [{ name: 'SOC2 & Blockchain Smart Contract Audit', progress: 100, score: '99%', peers: 28 }],
  },
  {
    id: 'USR-62840',
    name: 'Devon Cooper',
    handle: '@devon.c',
    email: 'devon.c@cmu.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    inactive: true,
    ssoProvider: 'CMU-CAS',
    ssoDomain: 'cmu.edu',
    role: 'Student',
    roleType: 'student',
    status: 'Inactive',
    enrolledDate: 'Feb 20, 2024',
    tenure: '8 mos ago',
    lastSeen: '42 days ago',
    lastSeenDevice: 'schedule',
    lastSeenLocation: 'Dormant Session',
    title: 'Robotics & Neural Systems Scholar',
    ssoRealm: 'Carnegie Mellon Directory',
    timezone: 'EST (UTC-5) • US',
    cohort: 'CMU-Spring-24',
    securityLevel: 'Tier 1 Scholar (Dormant)',
    modules: [{ name: 'Distributed Systems & Cloud Computing', progress: 24, score: '72%', peers: 94 }],
  },
];

export default function AdminUsers() {
  const [usersList, setUsersList] = useState(DEFAULT_USERS);
  const [selectedUser, setSelectedUser] = useState(DEFAULT_USERS[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [density, setDensity] = useState('comfortable');
  const [selectedIds, setSelectedIds] = useState(new Set(['USR-84920']));

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Student',
    ssoProvider: 'OKTA-SAML2',
  });

  // Fetch real users from backend if available and prepend
  useEffect(() => {
    let isMounted = true;
    const fetchBackendUsers = async () => {
      try {
        const res = await API.get('/users');
        if (isMounted && res.data?.users && res.data.users.length > 0) {
          const mapped = res.data.users.map((u, i) => ({
            id: `USR-${u._id ? u._id.substring(u._id.length - 5).toUpperCase() : 90000 + i}`,
            _id: u._id,
            name: u.name,
            handle: `@${u.name ? u.name.toLowerCase().replace(/\s+/g, '.') : 'user'}`,
            email: u.email,
            avatar:
              u.avatar ||
              u.profileImage ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name || 'User')}`,
            verified: u.role === 'instructor' || u.role === 'admin',
            ssoProvider: 'OKTA-SAML2',
            ssoDomain: u.email.split('@')[1] || 'nova-labs.edu',
            role: u.role === 'admin' ? 'Super Admin' : u.role === 'instructor' ? 'Instructor' : 'Student',
            roleType: u.role,
            status: u.isActive !== false ? 'Active' : 'Inactive',
            enrolledDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Sep 01, 2024',
            tenure: 'Active Learner',
            lastSeen: '12 mins ago',
            lastSeenDevice: 'laptop_mac',
            lastSeenLocation: '198.51.100.24 (Live IP)',
            title: u.bio || `${u.role === 'instructor' ? 'Academic Faculty' : 'Learner Scholar'}`,
            ssoRealm: 'Enterprise IDP',
            timezone: 'UTC • Global',
            cohort: 'Cohort-2024',
            securityLevel: u.role === 'admin' ? 'Tier 0 Master Admin' : u.role === 'instructor' ? 'Tier 4 Faculty' : 'Tier 1 Scholar',
            modules: [{ name: 'Curriculum Foundations', progress: 75, score: '92%', peers: 120 }],
          }));

          setUsersList([...mapped, ...DEFAULT_USERS]);
        }
      } catch {
        // Use DEFAULT_USERS seamlessly
      }
    };
    fetchBackendUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered list based on Search, Role, and Status
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.ssoDomain.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === 'All' ||
        (roleFilter === 'Students' && user.role === 'Student') ||
        (roleFilter === 'Instructors' && user.role === 'Instructor') ||
        (roleFilter === 'Super Admins' && user.role === 'Super Admin') ||
        (roleFilter === 'System Auditors' && user.role === 'System Auditor');

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && user.status === 'Active') ||
        (statusFilter === 'Inactive' && user.status === 'Inactive') ||
        (statusFilter === 'Suspended' && user.status === 'Suspended');

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchQuery, roleFilter, statusFilter]);

  // Checkbox Selection
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectUser = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Inspect Identity in Drawer
  const handleInspectUser = (user, e) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  // Delete User Action
  const handleLaunchDelete = (user) => {
    setUserToDelete(user || selectedUser);
    setConfirmDeleteInput('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteInput.trim().toUpperCase() !== 'DELETE') {
      toast.error('Type DELETE to confirm execution');
      return;
    }
    if (!userToDelete) return;

    if (userToDelete._id) {
      try {
        await API.delete(`/users/${userToDelete._id}`);
      } catch {
        // Continue local removal
      }
    }

    setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setShowDeleteModal(false);
    setIsDrawerOpen(false);
    toast.success(`User ${userToDelete.name} permanently purged from cluster ledger.`);
  };

  // Add User Action
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      toast.error('Please enter name and institutional email');
      return;
    }

    const created = {
      id: `USR-${Math.floor(Math.random() * 89999 + 10000)}`,
      name: newUserForm.name,
      handle: `@${newUserForm.name.toLowerCase().replace(/\s+/g, '.')}`,
      email: newUserForm.email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newUserForm.name)}`,
      verified: newUserForm.role === 'Instructor' || newUserForm.role === 'Super Admin',
      ssoProvider: newUserForm.ssoProvider,
      ssoDomain: newUserForm.email.split('@')[1] || 'nova-labs.edu',
      role: newUserForm.role,
      roleType: newUserForm.role.toLowerCase(),
      status: 'Active',
      enrolledDate: 'Just now',
      tenure: 'New Identity',
      lastSeen: 'Invited',
      lastSeenDevice: 'mail',
      lastSeenLocation: 'Enrollment Sent',
      title: `${newUserForm.role} Identity`,
      ssoRealm: 'Enterprise IDP',
      timezone: 'UTC • Global',
      cohort: 'Cohort-2024-New',
      securityLevel: newUserForm.role === 'Super Admin' ? 'Tier 0 Master Admin' : 'Tier 1 Scholar',
      modules: [],
    };

    setUsersList([created, ...usersList]);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', email: '', role: 'Student', ssoProvider: 'OKTA-SAML2' });
    toast.success(`Provisioned ${created.name} (${created.id}) with TLS authentication keys.`);
  };

  // Impersonate Action
  const handleImpersonate = (user) => {
    toast.info(`Impersonation session established for ${user.name}`, {
      description: 'Zero-trust session proxy enabled. All audit actions dispatched with supervisory signature.',
    });
  };

  // Bulk Actions
  const handleBulkAction = (actionName) => {
    const count = selectedIds.size;
    if (count === 0) {
      toast.warning('No identities selected in data matrix');
      return;
    }
    toast.success(`Executed "${actionName}" on ${count} selected identities.`);
  };

  return (
    <div className="flex flex-col w-full pb-16 text-slate-800">
      {/* ================= TOP CONTEXT & BREADCRUMBS ================= */}
      <div className="flex flex-col gap-2 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Admin Portal</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Identity & Access Governance</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-blue-600 font-semibold">User Management</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col max-w-3xl">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              User Directory & Access Governance
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                48,219 IDENTITIES
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Manage institutional accounts, role assignments, authentication credentials, and federated security policies across 48,219 global identities.
            </p>
          </div>

          {/* Action Dock */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => {
                toast.success('Exporting Identity Directory (.csv / .json)', {
                  description: 'Compiled SHA256-verified cryptographic user registry.',
                });
              }}
              className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm border border-slate-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">file_download</span>
              <span>Export CSV / Audit JSON</span>
            </button>

            {/* Bulk Actions Dropdown */}
            <div className="relative group">
              <button className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm border border-slate-200 cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">low_priority</span>
                <span>Bulk Actions ({selectedIds.size})</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:rotate-180 transition-transform">
                  expand_more
                </span>
              </button>
              <div className="hidden group-hover:flex flex-col absolute right-0 top-11 w-56 py-1.5 rounded-xl bg-white shadow-xl z-30 border border-slate-200">
                <button
                  onClick={() => handleBulkAction('Assign Collective Role')}
                  className="px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">admin_panel_settings</span>
                  Assign Collective Role
                </button>
                <button
                  onClick={() => handleBulkAction('Force Password Reset')}
                  className="px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">lock_reset</span>
                  Force Password Reset
                </button>
                <button
                  onClick={() => handleBulkAction('Revoke Active Sessions')}
                  className="px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">power_settings_new</span>
                  Revoke Active Sessions
                </button>
                <div className="h-[1px] bg-slate-100 my-1"></div>
                <button
                  onClick={() => handleBulkAction('Deactivate Selected')}
                  className="px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  Deactivate Selected
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= TELEMETRY METRIC STRIP ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Global Identities
            </span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <span className="material-symbols-outlined text-[20px]">groups_3</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">48,219</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200">
              +1,240 mo
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>32 enterprise SSO realms</span>
            <span className="text-blue-600 font-mono font-semibold">99.8% Sync</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '86%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Active Students</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">42,850</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200">
              94.2% verified
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Engaged past 72h</span>
            <span className="font-mono text-xs text-slate-800 font-semibold">36,140 peers</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Certified Faculty</span>
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">1,482</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-200">
              98.9% active
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Curriculum chairs</span>
            <span className="font-mono text-xs text-slate-800 font-semibold">144 departments</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '98%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-rose-600 font-semibold">Suspended / At-Risk</span>
            <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-600 tracking-tight">38</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[11px] font-bold border border-rose-200">
              SOC Alert
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Anomaly triggers flagged</span>
            <span className="text-rose-600 font-mono font-semibold">mTLS & Geofence</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: '14%' }}></div>
          </div>
        </div>
      </div>

      {/* ================= CONTROL DOCK & FILTER MATRIX ================= */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm mt-2 mb-4 border border-slate-200/90">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
            <input
              id="user-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-slate-200 transition-all"
              placeholder="Search by name, email, user ID, or SSO domain..."
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Dropdown Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-700 text-xs font-medium appearance-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer border border-slate-200 transition-all"
              >
                <option value="All">All Roles (Active)</option>
                <option value="Students">Students</option>
                <option value="Instructors">Instructors</option>
                <option value="Super Admins">Super Admins</option>
                <option value="System Auditors">System Auditors</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-slate-400 pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-700 text-xs font-medium appearance-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer border border-slate-200 transition-all"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended (38)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-slate-400 pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Date Joined */}
            <div className="relative">
              <select className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-700 text-xs font-medium appearance-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer border border-slate-200 transition-all">
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Custom Range...</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-slate-400 pointer-events-none text-[18px]">
                calendar_today
              </span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            {/* View Controls */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  density === 'compact' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Compact Density"
              >
                <span className="material-symbols-outlined text-[18px]">density_small</span>
              </button>
              <button
                onClick={() => setDensity('comfortable')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  density === 'comfortable' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Comfortable Density"
              >
                <span className="material-symbols-outlined text-[18px]">density_medium</span>
              </button>
            </div>

            <button
              onClick={() => toast.info('Column layout customizer activated.')}
              className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">view_column</span>
              <span className="hidden xl:inline">Customize Columns</span>
            </button>
          </div>
        </div>

        {/* ACTIVE PILLS STRIP */}
        {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Filters:</span>
            {searchQuery && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                <span className="text-slate-500">Query:</span>
                <span className="font-bold text-blue-600">"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-600 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {roleFilter !== 'All' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">
                <span className="text-slate-500">Role:</span>
                <span className="font-bold text-indigo-600">{roleFilter}</span>
                <button onClick={() => setRoleFilter('All')} className="hover:text-rose-600 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {statusFilter !== 'All' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">{statusFilter} Only</span>
                <button onClick={() => setStatusFilter('All')} className="hover:text-rose-600 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs font-semibold text-slate-400 hover:text-blue-600 underline ml-2 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ================= MAIN ENTERPRISE DATA TABLE ================= */}
      <div className="w-full rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-200/90">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 cursor-pointer h-4 w-4"
                    type="checkbox"
                  />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span>User & Identity</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">SSO & Institutional Realm</th>
                <th className="py-3.5 px-4 font-semibold">Role Assignment</th>
                <th className="py-3.5 px-4 font-semibold">Account Status</th>
                <th className="py-3.5 px-4 font-semibold">Enrolled Date</th>
                <th className="py-3.5 px-4 font-semibold">Telemetry Last Seen</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">
                    No matching identities found in directory.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleInspectUser(user)}
                    className={`transition-colors group cursor-pointer ${
                      user.status === 'Suspended'
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center" onClick={(e) => toggleSelectUser(user.id, e)}>
                      <input
                        checked={selectedIds.has(user.id)}
                        onChange={() => {}}
                        className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 cursor-pointer h-4 w-4"
                        type="checkbox"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            className={`w-10 h-10 rounded-full object-cover border border-slate-200 ${user.inactive ? 'grayscale opacity-70' : ''}`}
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                            }}
                            alt={user.name}
                          />
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                              user.status === 'Suspended'
                                ? 'bg-rose-500'
                                : user.status === 'Inactive'
                                ? 'bg-slate-400'
                                : user.role === 'Super Admin'
                                ? 'bg-blue-600'
                                : 'bg-emerald-500'
                            }`}
                          ></span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {user.name}
                            {user.verified && (
                              <span className="material-symbols-outlined text-[15px] text-blue-600" title="Verified Identity">
                                verified
                              </span>
                            )}
                            {user.securityBadge && (
                              <span className="material-symbols-outlined text-[15px] text-indigo-600" title="Super Admin Authority">
                                security
                              </span>
                            )}
                            {user.flagged && (
                              <span className="material-symbols-outlined text-[15px] text-rose-500" title="Security Flagged">
                                flag
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {user.handle} // {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{user.email}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono text-[10px] font-semibold border border-slate-200">
                            {user.ssoProvider}
                          </span>
                          <span className="text-blue-600 text-xs font-mono font-medium">{user.ssoDomain}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold tracking-wide inline-flex items-center gap-1 border ${
                          user.role === 'Super Admin'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : user.role === 'Instructor'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : user.role === 'System Auditor'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {user.role === 'Super Admin'
                            ? 'shield_person'
                            : user.role === 'Instructor'
                            ? 'school'
                            : user.role === 'System Auditor'
                            ? 'gavel'
                            : 'person'}
                        </span>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${
                          user.status === 'Suspended'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : user.status === 'Inactive'
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === 'Suspended'
                              ? 'bg-rose-500'
                              : user.status === 'Inactive'
                              ? 'bg-slate-400'
                              : 'bg-emerald-500'
                          }`}
                        ></span>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-medium">{user.enrolledDate}</span>
                        <span className="font-mono text-[11px] text-slate-400">{user.tenure}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className={`flex items-center gap-1.5 font-mono text-xs ${
                          user.status === 'Suspended'
                            ? 'text-rose-600 font-semibold'
                            : user.role === 'Super Admin'
                            ? 'text-blue-600 font-semibold'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{user.lastSeenDevice}</span>
                        <span>{user.lastSeen}</span>
                      </div>
                      <span
                        className={`font-mono text-[10px] block ${
                          user.status === 'Suspended' ? 'text-rose-500' : 'text-slate-400'
                        }`}
                      >
                        {user.lastSeenLocation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleInspectUser(user)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Inspect Identity"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleImpersonate(user)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Impersonate / Permissions"
                        >
                          <span className="material-symbols-outlined text-[18px]">key</span>
                        </button>
                        <button
                          onClick={() => handleLaunchDelete(user)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Purge Identity"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card Tiles (< 768px) */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 p-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleInspectUser(user)}
              className="p-3 flex flex-col gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full object-cover border border-slate-200" src={user.avatar} alt={user.name} />
                  <div>
                    <span className="font-bold text-slate-900">{user.name}</span>
                    <span className="font-mono text-xs text-slate-400 block">
                      {user.handle} // {user.id}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px] font-semibold">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate max-w-[200px]">{user.email}</span>
                <span className="text-emerald-600 font-mono font-semibold">{user.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination & Footer Bar */}
        <div className="px-4 py-3.5 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">1-{filteredUsers.length}</strong> of{' '}
              <strong className="text-slate-900">48,219</strong> identities
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select className="bg-white text-slate-700 px-2 py-1 rounded-lg font-mono text-xs outline-none cursor-pointer border border-slate-200">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-1">
            <button
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              disabled
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs transition-colors cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs transition-colors cursor-pointer">
              3
            </button>
            <span className="px-1 text-slate-400 font-mono">...</span>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs transition-colors cursor-pointer">
              4,822
            </button>
            <button className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECONDARY WORKSPACE SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* IAM Federation Status */}
        <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-slate-200/90">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">IAM Federation Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                STABLE
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-2">
              Real-time sync between Okta, Azure AD, and institutional Shibboleth directories is operating within zero-trust SLAs.
            </p>
            <div className="space-y-2 mt-4 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-800 font-medium">Okta Enterprise IDP</span>
                <span className="text-emerald-600 font-semibold">99.98% • Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-800 font-medium">Azure Tenant (US-East)</span>
                <span className="text-emerald-600 font-semibold">100% • Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-800 font-medium">Higher Ed SAML Federation</span>
                <span className="text-blue-600 font-semibold">42 Realm Nodes</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => toast.success('Directory Connectors verified across all 42 campus domains.')}
            className="mt-4 w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">security_update_good</span>
            Configure Directory Connectors
          </button>
        </div>

        {/* Live Compliance Anomaly Digest */}
        <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-slate-200/90">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">SOC2 Access Audits</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-semibold border border-rose-200">
                1 ANOMALY
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-2">
              Automated heuristic detected sudden concurrent IP handshakes in user{' '}
              <span className="font-mono text-blue-600 font-semibold">#USR-90214</span> (Liam Chen).
            </p>
            <div className="mt-4 p-3 rounded-xl bg-rose-50/50 space-y-1.5 font-mono text-xs border border-rose-100">
              <div className="flex items-center justify-between text-rose-700 font-bold">
                <span>Alert: GEO_IP_MISMATCH</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Critical</span>
              </div>
              <div className="text-slate-500 text-[11px]">Primary: Singapore (AS13335)</div>
              <div className="text-slate-500 text-[11px]">Secondary: San Jose, US (AS8075)</div>
              <div className="text-slate-600 text-[11px] pt-1">Session tokens isolated to honeypot sandbox.</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                const liam = usersList.find((u) => u.id === 'USR-90214') || selectedUser;
                handleInspectUser(liam);
              }}
              className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              Review Anomaly
            </button>
            <button
              onClick={() => toast.info('Anomaly flagged for secondary tier review')}
              className="px-4 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-all border border-slate-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Destructive Security Deletion Dock */}
        <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-slate-200/90">
          <div>
            <div className="flex items-center gap-2.5 text-rose-600">
              <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
              <span className="font-bold text-slate-900 text-base">Security Deletion Dock</span>
            </div>
            <p className="text-slate-500 text-sm mt-2">
              Permanent user deletion irrevocably purges private repository forks, keys, and lab sandboxes across clusters.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-600 space-y-1 border border-slate-200/80">
              <p>• Revokes TLS client certificates</p>
              <p>• Archives immutable grading transcripts</p>
              <p>• Frees provisioned Kubernetes pods</p>
            </div>
          </div>
          <div className="mt-4 pt-3">
            <button
              onClick={() => handleLaunchDelete(selectedUser)}
              className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Launch Deletion Protocol
            </button>
          </div>
        </div>
      </div>

      {/* ================= SLIDE-OUT USER DETAIL INSPECTOR DRAWER ================= */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slideLeft">
          {/* Drawer Top */}
          <div className="p-6 flex flex-col">
            {/* Drawer Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600">IDENTITY // #{selectedUser.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold flex items-center gap-1.5 ${
                    selectedUser.status === 'Suspended'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedUser.status === 'Suspended' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  ></span>{' '}
                  {selectedUser.status}
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Action Pill Bar */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleImpersonate(selectedUser)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                Impersonate
              </button>
              <button
                onClick={() => toast.info(`Editing profile configuration for ${selectedUser.name}`)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">edit</span>
                Edit Profile
              </button>
              <button
                onClick={() => toast.info('Advanced identity scopes & SSO claim settings')}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="flex items-start gap-4 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="relative">
                <img className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-200" src={selectedUser.avatar} alt={selectedUser.name} />
                {selectedUser.verified && (
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white text-blue-600 shadow-sm border border-slate-200">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 text-base truncate">{selectedUser.name}</h2>
                <span className="text-slate-500 text-xs truncate mt-0.5">{selectedUser.title}</span>
                <span className="font-mono text-xs text-blue-600 mt-1 truncate">{selectedUser.email}</span>
              </div>
            </div>

            {/* Profile Metadata Key-Values */}
            <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">SSO Realm</span>
                <span className="text-slate-800 font-semibold">{selectedUser.ssoRealm || 'Okta Fed #991'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Timezone / Geo</span>
                <span className="text-slate-800 font-semibold">{selectedUser.timezone || 'EST (UTC-5) • US'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Assigned Cohort</span>
                <span className="text-blue-600 font-semibold">{selectedUser.cohort || 'Alpha-2024-Q3'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Security Level</span>
                <span className="text-emerald-700 font-semibold">{selectedUser.securityLevel || 'Tier 4 Faculty'}</span>
              </div>
            </div>

            {/* RBAC Entitlements Matrix */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">RBAC Entitlements</span>
                <span className="font-mono text-[11px] text-blue-600 font-semibold">3 ACTIVE GRANTS</span>
              </div>
              <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 text-xs border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">terminal</span>
                    <span className="font-medium">Lab Cloud Shell Provisioning</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 text-xs border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-purple-600">forum</span>
                    <span className="font-medium">Faculty Moderation & Forum Write</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[11px] font-semibold border border-purple-200">
                    Global
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 text-xs border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                    <span className="font-medium">Proctored Exam Issuance</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
                    Granted
                  </span>
                </div>
              </div>
            </div>

            {/* Enrolled / Lectured Courses Matrix */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Supervised Modules</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {selectedUser.modules?.length || 0} ENROLLED
                </span>
              </div>
              <div className="space-y-3 mt-1">
                {selectedUser.modules && selectedUser.modules.length > 0 ? (
                  selectedUser.modules.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{m.name}</span>
                        <span className="font-mono text-xs text-blue-600 font-semibold">{m.progress}% Completion</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${m.progress}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 font-mono text-[11px] text-slate-500">
                        <span>Avg Student Score: {m.score}</span>
                        <span>{m.peers} Enrolled Peers</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2 font-mono">No curriculum nodes currently assigned.</p>
                )}
              </div>
            </div>

            {/* Security Audit Trail */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Audit Log</span>
                <span className="font-mono text-[11px] text-slate-400">APPEND-ONLY LEDGER</span>
              </div>
              <div className="space-y-3 mt-1 border-l-2 border-slate-200 pl-3 text-xs">
                <div>
                  <span className="font-mono text-[11px] text-blue-600 font-semibold">Today 14:22 UTC</span>
                  <p className="text-slate-700 mt-0.5">Signed in from Chrome 124 on MacOS (IP: 198.51.100.24 - Boston, US)</p>
                </div>
                <div>
                  <span className="font-mono text-[11px] text-indigo-600 font-semibold">Yesterday 18:05 UTC</span>
                  <p className="text-slate-700 mt-0.5">Submitted Module 3 Quantum Checkpoint (Auto-grade: 96%)</p>
                </div>
                <div>
                  <span className="font-mono text-[11px] text-slate-400 font-semibold">Oct 26 09:12 UTC</span>
                  <p className="text-slate-700 mt-0.5">Issued CEU Accredited Faculty Certificate #NOVA-9941</p>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer Destructive Dock */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast.success(`Account lock status toggled for ${selectedUser.name}`);
                }}
                className="flex-1 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                Lock Account
              </button>
              <button
                onClick={() => handleLaunchDelete(selectedUser)}
                className="flex-1 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs transition-colors border border-rose-200 cursor-pointer"
              >
                Delete User
              </button>
            </div>
            <span className="font-mono text-[10px] text-center text-slate-400">mTLS Cryptographic Token Valid for 42m</span>
          </div>
        </div>
      )}

      {/* ================= MODAL: PERMANENT USER DELETION ================= */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <span className="material-symbols-outlined text-[28px]">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm User Deletion</h3>
                <span className="font-mono text-xs text-slate-500">
                  TARGET: {userToDelete.name} ({userToDelete.id})
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              This action is irreversible. All SSO linkages, active cryptographic keys, student evaluations, and container volumes assigned to this identity will be permanently decommissioned.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 font-mono text-xs text-slate-600 space-y-1 border border-slate-200">
              <div className="text-rose-600 font-semibold">• 2 Active lab workspaces terminated</div>
              <div>• 14 Auth sessions revoked across devices</div>
              <div>• Immutable audit hash dispatched to ledger</div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">
                Type DELETE to confirm execution:
              </label>
              <input
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 border border-slate-300"
                placeholder="DELETE"
                type="text"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW USER ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-lg p-6 rounded-2xl bg-white shadow-2xl flex flex-col gap-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="material-symbols-outlined text-xl text-blue-600">person_add</span>
                <span>Provision New User Identity</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full bg-slate-50 rounded-xl p-2.5 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Institutional Email (SSO Principal)</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. a.pendelton@nova-labs.edu"
                  className="w-full bg-slate-50 rounded-xl p-2.5 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Assigned Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-2.5 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Instructor">Instructor</option>
                    <option value="System Auditor">System Auditor</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">SSO Federation Provider</label>
                  <select
                    value={newUserForm.ssoProvider}
                    onChange={(e) => setNewUserForm({ ...newUserForm, ssoProvider: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-2.5 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs cursor-pointer"
                  >
                    <option value="OKTA-SAML2">OKTA-SAML2</option>
                    <option value="AZURE-OIDC">AZURE-OIDC</option>
                    <option value="GOOGLE-WORKSPACE">GOOGLE-WORKSPACE</option>
                    <option value="SHIBBOLETH">SHIBBOLETH</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Issue Identity Credential
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
