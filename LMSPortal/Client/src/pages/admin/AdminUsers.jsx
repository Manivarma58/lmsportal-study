import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { toast } from 'sonner';

const DEFAULT_USERS = [
  {
    id: 'USR-84920',
    name: 'Dr. Elena Vance',
    handle: '@elena.vance',
    email: 'elena.vance@nova-labs.edu',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXi3Hhkt4UfP5r96Xw2ZLX6AkaxaUhnmcd9OgIlU2_jlH2XUhwvBxS0wO2vlLAhyc9pu3ZOkKUQMQQnD6rtDUfuE0OIgFQIbE4XTgigWNZfxpUROH6tD36AmdVyb0e7ezUo4E0q4JE-x6WzS-oZXtW5ceTi9xk2GzYMfAJ3aOZDLpBjZlAfp9zJjAH7G9B3HPFyUgEXp6zUXl6lKk58nCaCnOtA1hP27XJb5JlQ9AZiUv_0f4G1_4',
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
    email: 'marcus.v@admin.studypilot.io',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5vfPgOblVCVD80TwvMu_gWXl-n2JeMs6A4gw8YAcAokODoNwoQuLo8Td1jTzkY5ku5sKDKJjZv91G4p7Gt1l7R61fhOrRqOIGcoz7B9xt22kneqBeV3dZYIphWvRPuOSagRe1HI2bhBrXakJfyWYYlKeelOlMlgZRPlzM8n1V_bxZxPHcVV_buQoBEq3kcNjf-GOw9jwzhzq-_AjoY2SBprYu8PfHDAWH_aKkJQEaZpARM_echfY',
    verified: true,
    securityBadge: true,
    ssoProvider: 'AZURE-OIDC',
    ssoDomain: 'admin.studypilot.io',
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
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoYnGT3So4mQu2ptaNH6Q5vRd5pSCVGSLQgkZOPExaXOXkXvUsDSnDgsLMlYTwbBvCrlkytQuaG-aJGByK1FlDJxtJ55eCIuMn4Ph2qpk6CM3ykMwsi170e0Xx6Eee_Ustj7O4ylktsnR4IQw8uZgkX19xDeaRfKieJYDRpOlIwOfq6NCDYKIRY-N0-VH9zfVJ8ZbynQHYfOi9ea8teVvMCMX4cdFK6vs-Kk9Qlk__-yfm8-5cZ9w',
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
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDoTg4N1CY7HqZM3NBAC3M-PHizNvHaIokbassLxEEkjjuNPxtzjMcccQGlj926p0y_w7B3ntHN9xEczU52rjrvlIU9IafHu5XZlUtljRw9QezOKpR1q3M3J6VHJ1IuA1GP5exe6-sO3O-yCyE550Hv7UfddRJ4frKFXvaW1XAT3EwKkVVkwcWYdwnXvLax5tAiclZl2FQw4saPZ3P2s_6hOMPqhMGhja2Xun3ASWe4pZwW-u-lwmA',
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
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrgVwchXuIkqnzLHZJG7IAn9pVeSnDk87jPcD1xE_MD-gjc7sx2GDhxVt_6m6CB6re_FBsWHtM66PQMHlNWXyztiQVbgmOnJmI1B8wIZcTnbbMdaTncS3oSn1t_bmbQNeo-a_rPyoG7PLPU-3FkSZnKp-iouHx1ruAAHOZpWiv5wwlOcXXVgIAVin97skNUTpy3UwIj2nx69FvmHRVwvAFzRzvci6TyGA-8XiMB4hC7rYoBPsTQmY',
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
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqmNsqdpnbleJGuJaSOwYqitBpTAvZh81oVs8INQnI9xNzdtf9Nm8Os9VSR51fZE-XG45AZf_dUFbDd5NPaCZk25-Lap6gLOSoGp4VwnioctpawgvocMyWMpk04NVP7ppfbIIaWPjipuPCatFyFKieNuNqV0ni_3WWs3FiPuAscEuu4gRKQI5AW8CRYF3cjhDkLI3bRxmJ5Fcz_3hj0_Z6SFVzM-vs7H4HUxtdrSm-da4zDKj2tFM',
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
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqXpN0GEbwHIYqVZvchghl-iyGdpyyzUEwDt_VIlge68HK6YCkFFpdepKQgSs5yBz4CJy3Hjs56jNxogeX5XunSS4rifmV5k1PsPXOc-ZDJ2L0HPgxqjlSy4RpQ5MEH0RbcDfyXq6jKfw9ie-M9_ZLtFgau5bBYErexBV_TYTo6qOq3HdLd2OLW3SHCBnss0bGw_ZGxmfJRKHNGetbEubm9hPlOcqNIEBagqGJ9KQKgaYb4tjUOlo',
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
    <div className="flex flex-col w-full pb-16 text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* ================= TOP CONTEXT & BREADCRUMBS ================= */}
      <div className="flex flex-col gap-space-sm pt-6 pb-4">
        <div className="flex items-center gap-2 text-label-sm font-code-md text-on-surface-variant">
          <span className="hover:text-primary transition-colors cursor-pointer">Admin Portal</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Identity & Access Governance</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-primary font-semibold">User Management</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mt-1">
          <div className="flex flex-col max-w-3xl">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface flex items-center gap-3">
              User Directory & Access Governance
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-code-md text-label-sm border border-tertiary/20">
                48,219 IDENTITIES
              </span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
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
              className="h-10 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center gap-2 transition-all shadow-sm border border-surface-container-high/60"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
              <span>Export CSV / Audit JSON</span>
            </button>

            {/* Bulk Actions Dropdown */}
            <div className="relative group">
              <button className="h-10 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center gap-2 transition-all shadow-sm border border-surface-container-high/60">
                <span className="material-symbols-outlined text-[18px] text-outline">low_priority</span>
                <span>Bulk Actions ({selectedIds.size})</span>
                <span className="material-symbols-outlined text-[16px] text-outline group-hover:rotate-180 transition-transform">
                  expand_more
                </span>
              </button>
              <div className="hidden group-hover:flex flex-col absolute right-0 top-11 w-56 py-1.5 rounded-xl bg-surface-container-highest shadow-xl z-30 border border-surface-container-high/60 backdrop-blur-md">
                <button
                  onClick={() => handleBulkAction('Assign Collective Role')}
                  className="px-3.5 py-2 text-left font-body-sm text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">admin_panel_settings</span>
                  Assign Collective Role
                </button>
                <button
                  onClick={() => handleBulkAction('Force Password Reset')}
                  className="px-3.5 py-2 text-left font-body-sm text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-tertiary">lock_reset</span>
                  Force Password Reset
                </button>
                <button
                  onClick={() => handleBulkAction('Revoke Active Sessions')}
                  className="px-3.5 py-2 text-left font-body-sm text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">power_settings_new</span>
                  Revoke Active Sessions
                </button>
                <div className="h-[1px] bg-outline-variant/30 my-1"></div>
                <button
                  onClick={() => handleBulkAction('Deactivate Selected')}
                  className="px-3.5 py-2 text-left font-body-sm text-body-sm text-error hover:bg-error-container/30 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  Deactivate Selected
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="h-10 px-4 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold flex items-center gap-2 hover:brightness-110 shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= TELEMETRY METRIC STRIP ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md my-4">
        {/* Metric 1 */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-md relative overflow-hidden group border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="font-code-md text-label-sm uppercase tracking-wider text-on-surface-variant">
              Global Identities
            </span>
            <span className="p-2 rounded-lg bg-surface-container text-primary material-symbols-outlined text-[20px]">
              groups_3
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">48,219</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-tertiary font-code-md text-label-sm font-medium border border-tertiary/20">
              +1,240 mo
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <span>32 enterprise SSO realms</span>
            <span className="text-tertiary font-code-md text-label-sm">99.8% Sync</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '86%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-md relative overflow-hidden border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="font-code-md text-label-sm uppercase tracking-wider text-on-surface-variant">Active Students</span>
            <span className="p-2 rounded-lg bg-surface-container text-tertiary material-symbols-outlined text-[20px]">
              school
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">42,850</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-tertiary-fixed-dim font-code-md text-label-sm border border-tertiary/20">
              94.2% verified
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <span>Engaged past 72h</span>
            <span className="font-code-md text-label-sm text-on-surface">36,140 peers</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-tertiary rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-md relative overflow-hidden border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="font-code-md text-label-sm uppercase tracking-wider text-on-surface-variant">Certified Faculty</span>
            <span className="p-2 rounded-lg bg-surface-container text-secondary material-symbols-outlined text-[20px]">
              workspace_premium
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">1,482</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-secondary-fixed-dim font-code-md text-label-sm border border-secondary/20">
              98.9% active
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <span>Curriculum chairs</span>
            <span className="font-code-md text-label-sm text-on-surface">144 departments</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: '98%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-md relative overflow-hidden border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="font-code-md text-label-sm uppercase tracking-wider text-error">Suspended / At-Risk</span>
            <span className="p-2 rounded-lg bg-error-container text-error material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-error tracking-tight">38</span>
            <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-code-md text-label-sm border border-error/30">
              SOC Alert
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <span>Anomaly triggers flagged</span>
            <span className="text-error font-code-md text-label-sm">mTLS & Geofence</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-error rounded-full" style={{ width: '14%' }}></div>
          </div>
        </div>
      </div>

      {/* ================= CONTROL DOCK & FILTER MATRIX ================= */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-low shadow-md mt-2 mb-4 border border-surface-container-high/40">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
            <input
              id="user-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
              placeholder="Search by name, email, user ID, or SSO domain..."
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface"
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
                className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high/40"
              >
                <option value="All">All Roles (Active)</option>
                <option value="Students">Students</option>
                <option value="Instructors">Instructors</option>
                <option value="Super Admins">Super Admins</option>
                <option value="System Auditors">System Auditors</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high/40"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended (38)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Date Joined */}
            <div className="relative">
              <select className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high/40">
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Custom Range...</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline pointer-events-none text-[18px]">
                calendar_today
              </span>
            </div>

            <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>

            {/* View Controls */}
            <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-lg border border-surface-container-high/40">
              <button
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded transition-colors ${
                  density === 'compact' ? 'bg-surface-container text-primary font-semibold' : 'text-outline hover:text-on-surface'
                }`}
                title="Compact Density"
              >
                <span className="material-symbols-outlined text-[18px]">density_small</span>
              </button>
              <button
                onClick={() => setDensity('comfortable')}
                className={`px-2 py-1 rounded transition-colors ${
                  density === 'comfortable' ? 'bg-surface-container text-primary font-semibold' : 'text-outline hover:text-on-surface'
                }`}
                title="Comfortable Density"
              >
                <span className="material-symbols-outlined text-[18px]">density_medium</span>
              </button>
            </div>

            <button
              onClick={() => toast.info('Column layout customizer activated.')}
              className="h-10 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-all border border-surface-container-high/40"
            >
              <span className="material-symbols-outlined text-[18px]">view_column</span>
              <span className="hidden xl:inline">Customize Columns</span>
            </button>
          </div>
        </div>

        {/* ACTIVE PILLS STRIP */}
        {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-surface-container-high/30">
            <span className="font-code-md text-label-sm text-outline uppercase tracking-wider">Active Filters:</span>
            {searchQuery && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Query:</span>
                <span className="font-semibold text-primary">"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {roleFilter !== 'All' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Role:</span>
                <span className="font-semibold text-secondary">{roleFilter}</span>
                <button onClick={() => setRoleFilter('All')} className="hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            {statusFilter !== 'All' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Status:</span>
                <span className="font-semibold text-tertiary">{statusFilter} Only</span>
                <button onClick={() => setStatusFilter('All')} className="hover:text-error transition-colors">
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
              className="text-label-sm font-label-sm text-outline hover:text-primary underline ml-2 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ================= MAIN ENTERPRISE DATA TABLE ================= */}
      <div className="w-full rounded-xl bg-surface-container-low shadow-xl overflow-hidden border border-surface-container-high/40">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left font-body-md text-body-md border-collapse">
            <thead className="bg-surface-container text-on-surface-variant font-code-md text-label-sm uppercase tracking-wider border-b border-surface-container-high/30">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-surface-container-highest text-primary focus:ring-0 cursor-pointer h-4 w-4"
                    type="checkbox"
                  />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-on-surface">
                  <div className="flex items-center gap-1.5">
                    <span>User & Identity</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">SSO & Institutional Realm</th>
                <th className="py-3.5 px-4">Role Assignment</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Enrolled Date</th>
                <th className="py-3.5 px-4">Telemetry Last Seen</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-outline font-body-md">
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
                        ? 'bg-error-container/10 hover:bg-error-container/20'
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center" onClick={(e) => toggleSelectUser(user.id, e)}>
                      <input
                        checked={selectedIds.has(user.id)}
                        onChange={() => {}}
                        className="rounded bg-surface-container-highest text-primary focus:ring-0 cursor-pointer h-4 w-4"
                        type="checkbox"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            className={`w-10 h-10 rounded-full object-cover ${user.inactive ? 'grayscale opacity-70' : ''}`}
                            src={user.avatar}
                            alt={user.name}
                          />
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-surface-container-low ${
                              user.status === 'Suspended'
                                ? 'bg-error'
                                : user.status === 'Inactive'
                                ? 'bg-outline'
                                : user.role === 'Super Admin'
                                ? 'bg-primary'
                                : 'bg-tertiary'
                            }`}
                          ></span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {user.name}
                            {user.verified && (
                              <span className="material-symbols-outlined text-[15px] text-primary" title="Verified Identity">
                                verified
                              </span>
                            )}
                            {user.securityBadge && (
                              <span className="material-symbols-outlined text-[15px] text-secondary" title="Super Admin Authority">
                                security
                              </span>
                            )}
                            {user.flagged && (
                              <span className="material-symbols-outlined text-[15px] text-error" title="Security Flagged">
                                flag
                              </span>
                            )}
                          </span>
                          <span className="font-code-md text-label-sm text-outline">
                            {user.handle} // {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm text-on-surface font-medium">{user.email}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-code-md text-[10px]">
                            {user.ssoProvider}
                          </span>
                          <span className="text-tertiary text-label-sm font-code-md">{user.ssoDomain}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide inline-flex items-center gap-1 ${
                          user.role === 'Super Admin'
                            ? 'bg-primary-container text-on-primary-container'
                            : user.role === 'Instructor'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : user.role === 'System Auditor'
                            ? 'bg-tertiary-container text-on-tertiary'
                            : 'bg-surface-container-highest text-tertiary'
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-code-md text-label-sm font-medium ${
                          user.status === 'Suspended'
                            ? 'bg-error-container text-on-error-container'
                            : user.status === 'Inactive'
                            ? 'bg-surface-container text-outline'
                            : 'bg-surface-container-high text-tertiary'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.status === 'Suspended'
                              ? 'bg-error'
                              : user.status === 'Inactive'
                              ? 'bg-outline'
                              : 'bg-tertiary animate-pulse'
                          }`}
                        ></span>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm text-on-surface">{user.enrolledDate}</span>
                        <span className="font-code-md text-[11px] text-outline">{user.tenure}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className={`flex items-center gap-1.5 font-code-md text-label-sm ${
                          user.status === 'Suspended'
                            ? 'text-error'
                            : user.role === 'Super Admin'
                            ? 'text-primary font-semibold'
                            : 'text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{user.lastSeenDevice}</span>
                        <span>{user.lastSeen}</span>
                      </div>
                      <span
                        className={`font-code-md text-[10px] block ${
                          user.status === 'Suspended' ? 'text-error' : 'text-outline'
                        }`}
                      >
                        {user.lastSeenLocation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleInspectUser(user)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                          title="Inspect Identity"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleImpersonate(user)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-tertiary transition-colors"
                          title="Impersonate / Permissions"
                        >
                          <span className="material-symbols-outlined text-[18px]">key</span>
                        </button>
                        <button
                          onClick={() => handleLaunchDelete(user)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-error transition-colors"
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
        <div className="md:hidden flex flex-col divide-y divide-surface-container-high p-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleInspectUser(user)}
              className="p-3 flex flex-col gap-3 hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                  <div>
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">{user.name}</span>
                    <span className="font-code-md text-label-sm text-outline block">
                      {user.handle} // {user.id}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm font-body-sm">
                <span className="text-on-surface-variant truncate max-w-[200px]">{user.email}</span>
                <span className="text-tertiary font-code-md text-label-sm">{user.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination & Footer Bar */}
        <div className="px-4 py-3.5 bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm font-body-sm border-t border-surface-container-high/30">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span>
              Showing <strong className="text-on-surface">1-{filteredUsers.length}</strong> of{' '}
              <strong className="text-on-surface">48,219</strong> identities
            </span>
            <span className="text-outline">•</span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select className="bg-surface-container-high text-on-surface px-2 py-1 rounded font-code-md text-label-sm outline-none cursor-pointer border border-surface-container-high/40">
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
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-outline hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-colors"
              disabled
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-code-md text-label-sm font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-code-md text-label-sm transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-code-md text-label-sm transition-colors">
              3
            </button>
            <span className="px-1 text-outline font-code-md">...</span>
            <button className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-code-md text-label-sm transition-colors">
              4,822
            </button>
            <button className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECONDARY WORKSPACE SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md mt-6">
        {/* IAM Federation Status */}
        <div className="p-5 rounded-xl bg-surface-container-low shadow-md flex flex-col justify-between border border-surface-container-high/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">IAM Federation Status</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-code-md text-label-sm border border-tertiary/20">
                STABLE
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Real-time sync between Okta, Azure AD, and institutional Shibboleth directories is operating within zero-trust SLAs.
            </p>
            <div className="space-y-2 mt-4 font-code-md text-label-sm">
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-high border border-surface-container-high/40">
                <span className="text-on-surface">Okta Enterprise IDP</span>
                <span className="text-tertiary">99.98% • Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-high border border-surface-container-high/40">
                <span className="text-on-surface">Azure Tenant (US-East)</span>
                <span className="text-tertiary">100% • Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-high border border-surface-container-high/40">
                <span className="text-on-surface">Higher Ed SAML Federation</span>
                <span className="text-secondary">42 Realm Nodes</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => toast.success('Directory Connectors verified across all 42 campus domains.')}
            className="mt-4 w-full h-9 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-2 border border-surface-container-high/40"
          >
            <span className="material-symbols-outlined text-[16px]">security_update_good</span>
            Configure Directory Connectors
          </button>
        </div>

        {/* Live Compliance Anomaly Digest */}
        <div className="p-5 rounded-xl bg-surface-container-low shadow-md flex flex-col justify-between border border-surface-container-high/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">SOC2 Access Audits</span>
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-md text-label-sm border border-error/30">
                1 ANOMALY
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Automated heuristic detected sudden concurrent IP handshakes in user{' '}
              <span className="font-code-md text-primary font-semibold">#USR-90214</span> (Liam Chen).
            </p>
            <div className="mt-4 p-3 rounded-lg bg-surface-container-lowest space-y-1.5 font-code-md text-label-sm border border-error/20">
              <div className="flex items-center justify-between text-error font-semibold">
                <span>Alert: GEO_IP_MISMATCH</span>
                <span>Critical</span>
              </div>
              <div className="text-outline text-[11px]">Primary: Singapore (AS13335)</div>
              <div className="text-outline text-[11px]">Secondary: San Jose, US (AS8075)</div>
              <div className="text-on-surface-variant text-[11px] pt-1">Session tokens isolated to honeypot sandbox.</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                const liam = usersList.find((u) => u.id === 'USR-90214') || selectedUser;
                handleInspectUser(liam);
              }}
              className="flex-1 h-9 rounded-lg bg-error-container text-on-error-container hover:brightness-110 font-label-md text-label-md font-semibold transition-all shadow-sm"
            >
              Review Anomaly
            </button>
            <button
              onClick={() => toast.info('Anomaly flagged for secondary tier review')}
              className="px-3 h-9 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-md text-label-md transition-all border border-surface-container-high/40"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Destructive Security Deletion Dock */}
        <div className="p-5 rounded-xl bg-surface-container-high shadow-lg flex flex-col justify-between border border-surface-container-highest/60">
          <div>
            <div className="flex items-center gap-2.5 text-error">
              <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Security Deletion Dock</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Permanent user deletion irrevocably purges private repository forks, keys, and lab sandboxes across clusters.
            </p>
            <div className="mt-3 p-2.5 rounded bg-surface-container-lowest font-code-md text-[11px] text-outline space-y-1 border border-surface-container-high/40">
              <p>• Revokes TLS client certificates</p>
              <p>• Archives immutable grading transcripts</p>
              <p>• Frees provisioned Kubernetes pods</p>
            </div>
          </div>
          <div className="mt-4 pt-3">
            <button
              onClick={() => handleLaunchDelete(selectedUser)}
              className="w-full h-10 rounded-lg bg-error text-on-error font-label-lg text-label-lg font-bold hover:brightness-110 shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Launch Deletion Protocol
            </button>
          </div>
        </div>
      </div>

      {/* ================= SLIDE-OUT USER DETAIL INSPECTOR DRAWER ================= */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface-container-low shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-l border-surface-container-high animate-slideLeft">
          {/* Drawer Top */}
          <div className="p-6 flex flex-col">
            {/* Drawer Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="font-code-md text-label-sm font-semibold text-primary">IDENTITY // #{selectedUser.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-code-md text-label-sm flex items-center gap-1 ${
                    selectedUser.status === 'Suspended'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-surface-container-highest text-tertiary'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedUser.status === 'Suspended' ? 'bg-error' : 'bg-tertiary'
                    }`}
                  ></span>{' '}
                  {selectedUser.status}
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Action Pill Bar */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleImpersonate(selectedUser)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors border border-surface-container-high/40"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary">badge</span>
                Impersonate
              </button>
              <button
                onClick={() => toast.info(`Editing profile configuration for ${selectedUser.name}`)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors border border-surface-container-high/40"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
                Edit Profile
              </button>
              <button
                onClick={() => toast.info('Advanced identity scopes & SSO claim settings')}
                className="py-1.5 px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors border border-surface-container-high/40"
              >
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="flex items-start gap-4 mt-5 p-4 rounded-xl bg-surface-container border border-surface-container-high/40">
              <div className="relative">
                <img className="w-16 h-16 rounded-xl object-cover shadow-md" src={selectedUser.avatar} alt={selectedUser.name} />
                {selectedUser.verified && (
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-surface-container text-primary">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{selectedUser.name}</h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{selectedUser.title}</span>
                <span className="font-code-md text-label-sm text-primary mt-1 truncate">{selectedUser.email}</span>
              </div>
            </div>

            {/* Profile Metadata Key-Values */}
            <div className="grid grid-cols-2 gap-2 mt-4 font-code-md text-label-sm">
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-container-high/30">
                <span className="text-outline block text-[10px] uppercase">SSO Realm</span>
                <span className="text-on-surface font-semibold">{selectedUser.ssoRealm || 'Okta Fed #991'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-container-high/30">
                <span className="text-outline block text-[10px] uppercase">Timezone / Geo</span>
                <span className="text-on-surface font-semibold">{selectedUser.timezone || 'EST (UTC-5) • US'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-container-high/30">
                <span className="text-outline block text-[10px] uppercase">Assigned Cohort</span>
                <span className="text-secondary font-semibold">{selectedUser.cohort || 'Alpha-2024-Q3'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-container-high/30">
                <span className="text-outline block text-[10px] uppercase">Security Level</span>
                <span className="text-tertiary font-semibold">{selectedUser.securityLevel || 'Tier 4 Faculty'}</span>
              </div>
            </div>

            {/* RBAC Entitlements Matrix */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">RBAC Entitlements</span>
                <span className="font-code-md text-[11px] text-tertiary">3 ACTIVE GRANTS</span>
              </div>
              <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container text-body-sm font-body-sm border border-surface-container-high/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">terminal</span>
                    <span>Lab Cloud Shell Provisioning</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-tertiary font-code-md text-label-sm">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container text-body-sm font-body-sm border border-surface-container-high/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">forum</span>
                    <span>Faculty Moderation & Forum Write</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-code-md text-label-sm">
                    Global
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container text-body-sm font-body-sm border border-surface-container-high/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                    <span>Proctored Exam Issuance</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-code-md text-label-sm">
                    Granted
                  </span>
                </div>
              </div>
            </div>

            {/* Enrolled / Lectured Courses Matrix */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">Supervised Modules</span>
                <span className="font-code-md text-[11px] text-outline">
                  {selectedUser.modules?.length || 0} ENROLLED
                </span>
              </div>
              <div className="space-y-3 mt-1">
                {selectedUser.modules && selectedUser.modules.length > 0 ? (
                  selectedUser.modules.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface-container border border-surface-container-high/30">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">{m.name}</span>
                        <span className="font-code-md text-label-sm text-tertiary">{m.progress}% Completion</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary rounded-full" style={{ width: `${m.progress}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 font-code-md text-[11px] text-outline">
                        <span>Avg Student Score: {m.score}</span>
                        <span>{m.peers} Enrolled Peers</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-outline py-2 font-code-md">No curriculum nodes currently assigned.</p>
                )}
              </div>
            </div>

            {/* Security Audit Trail */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">Security Audit Log</span>
                <span className="font-code-md text-[11px] text-outline">APPEND-ONLY LEDGER</span>
              </div>
              <div className="space-y-2.5 mt-1 border-l-2 border-surface-container-highest pl-3 font-body-sm text-body-sm">
                <div>
                  <span className="font-code-md text-[11px] text-tertiary">Today 14:22 UTC</span>
                  <p className="text-on-surface">Signed in from Chrome 124 on MacOS (IP: 198.51.100.24 - Boston, US)</p>
                </div>
                <div>
                  <span className="font-code-md text-[11px] text-primary">Yesterday 18:05 UTC</span>
                  <p className="text-on-surface">Submitted Module 3 Quantum Checkpoint (Auto-grade: 96%)</p>
                </div>
                <div>
                  <span className="font-code-md text-[11px] text-outline">Oct 26 09:12 UTC</span>
                  <p className="text-on-surface">Issued CEU Accredited Faculty Certificate #NOVA-9941</p>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer Destructive Dock */}
          <div className="p-6 bg-surface-container-lowest border-t border-surface-container-high flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast.success(`Account lock status toggled for ${selectedUser.name}`);
                }}
                className="flex-1 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-surface-container-high/40"
              >
                Lock Account
              </button>
              <button
                onClick={() => handleLaunchDelete(selectedUser)}
                className="flex-1 h-9 rounded-lg bg-error-container/40 text-error hover:bg-error-container font-label-md text-label-md transition-colors border border-error/30"
              >
                Delete User
              </button>
            </div>
            <span className="font-code-md text-[10px] text-center text-outline">mTLS Cryptographic Token Valid for 42m</span>
          </div>
        </div>
      )}

      {/* ================= MODAL: PERMANENT USER DELETION ================= */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface-container-low shadow-2xl flex flex-col gap-4 border border-error/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-error-container text-error">
                <span className="material-symbols-outlined text-[28px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Confirm User Deletion</h3>
                <span className="font-code-md text-label-sm text-outline">
                  TARGET: {userToDelete.name} ({userToDelete.id})
                </span>
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              This action is irreversible. All SSO linkages, active cryptographic keys, student evaluations, and container volumes assigned to this identity will be permanently decommissioned.
            </p>

            <div className="p-3 rounded-lg bg-surface-container-lowest font-code-md text-label-sm text-on-surface-variant space-y-1 border border-surface-container-high/40">
              <div className="text-error font-semibold">• 2 Active lab workspaces terminated</div>
              <div>• 14 Auth sessions revoked across devices</div>
              <div>• Immutable audit hash dispatched to ledger</div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-outline uppercase font-code-md">
                Type DELETE to confirm execution:
              </label>
              <input
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface placeholder:text-outline font-code-md text-body-sm outline-none focus:ring-1 focus:ring-error border border-surface-container-high/60"
                placeholder="DELETE"
                type="text"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all border border-surface-container-high/40"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 h-10 rounded-lg bg-error text-on-error font-label-md text-label-md font-semibold hover:brightness-110 shadow-md transition-all"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW USER ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-lg p-6 rounded-2xl bg-surface-container-low shadow-2xl flex flex-col gap-4 border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-xl">person_add</span>
                <span>Provision New User Identity</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-sm text-xs">
              <div>
                <label className="text-outline block mb-1 font-semibold">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full bg-surface-container rounded-lg p-2.5 text-on-surface border border-surface-container-high/60 focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="text-outline block mb-1 font-semibold">Institutional Email (SSO Principal)</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. a.pendelton@nova-labs.edu"
                  className="w-full bg-surface-container rounded-lg p-2.5 text-on-surface border border-surface-container-high/60 focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-outline block mb-1 font-semibold">Assigned Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-surface-container rounded-lg p-2.5 text-on-surface border border-surface-container-high/60 focus:outline-none focus:border-primary text-xs cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Instructor">Instructor</option>
                    <option value="System Auditor">System Auditor</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-outline block mb-1 font-semibold">SSO Federation Provider</label>
                  <select
                    value={newUserForm.ssoProvider}
                    onChange={(e) => setNewUserForm({ ...newUserForm, ssoProvider: e.target.value })}
                    className="w-full bg-surface-container rounded-lg p-2.5 text-on-surface border border-surface-container-high/60 focus:outline-none focus:border-primary text-xs cursor-pointer"
                  >
                    <option value="OKTA-SAML2">OKTA-SAML2</option>
                    <option value="AZURE-OIDC">AZURE-OIDC</option>
                    <option value="GOOGLE-WORKSPACE">GOOGLE-WORKSPACE</option>
                    <option value="SHIBBOLETH">SHIBBOLETH</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-bold shadow-md hover:brightness-110"
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
