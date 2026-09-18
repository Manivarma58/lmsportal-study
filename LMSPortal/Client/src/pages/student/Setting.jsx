import React, { useState } from 'react';

function Setting() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        general: {
            language: 'english',
            theme: 'light',
            timezone: 'UTC+5:30'
        },
        notifications: {
            emailPromotions: true,
            promotionalEmails: false,
            instructorAnnouncements: true,
            examNotices: true,
            courseRecommendations: true,
            assignmentReminders: true,
            deadlineAlerts: true
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showCourses: true,
            showProgress: true,
            dataSharing: false
        },
        subscription: {
            plan: 'free',
            nextBillingDate: '2024-12-01',
            autoRenew: true
        }
    });

    const languages = [
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
        { value: 'chinese', label: 'Chinese' }
    ];

    const themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'auto', label: 'Auto' }
    ];

    const timezones = [
        { value: 'UTC+5:30', label: 'UTC+5:30 (India)' },
        { value: 'UTC-5', label: 'UTC-5 (EST)' },
        { value: 'UTC-8', label: 'UTC-8 (PST)' },
        { value: 'UTC+0', label: 'UTC+0 (GMT)' },
        { value: 'UTC+1', label: 'UTC+1 (CET)' }
    ];

    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const handleSaveSettings = () => {
        // In a real app, you would save settings to backend
        alert('Settings saved successfully!');
    };

    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            setSettings({
                general: {
                    language: 'english',
                    theme: 'light',
                    timezone: 'UTC+5:30'
                },
                notifications: {
                    emailPromotions: true,
                    promotionalEmails: false,
                    instructorAnnouncements: true,
                    examNotices: true,
                    courseRecommendations: true,
                    assignmentReminders: true,
                    deadlineAlerts: true
                },
                privacy: {
                    profileVisibility: 'public',
                    showEmail: false,
                    showCourses: true,
                    showProgress: true,
                    dataSharing: false
                },
                subscription: {
                    plan: 'free',
                    nextBillingDate: '2024-12-01',
                    autoRenew: true
                }
            });
        }
    };

    return (
        <div className="settings-container">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .settings-container {
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
                
                /* Settings Tabs */
                .settings-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #eef2f7;
                    padding-bottom: 1rem;
                    flex-wrap: wrap;
                }
                
                .tab {
                    padding: 0.75rem 1.5rem;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: #6c757d;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .tab:hover {
                    background: #f8f9fa;
                    color: #4361ee;
                }
                
                .tab.active {
                    background: #4361ee;
                    color: white;
                }
                
                /* Settings Content */
                .settings-content {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eef2f7;
                    min-height: 500px;
                }
                
                /* General Settings */
                .section {
                    margin-bottom: 2rem;
                }
                
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #eef2f7;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-label {
                    display: block;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                }
                
                .form-help {
                    font-size: 0.85rem;
                    color: #6c757d;
                    margin-top: 0.25rem;
                }
                
                .form-select {
                    width: 100%;
                    max-width: 300px;
                    padding: 0.75rem 1rem;
                    border: 1px solid #eef2f7;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .form-select:focus {
                    outline: none;
                    border-color: #4361ee;
                    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
                }
                
                /* Notification Settings */
                .notification-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    border: 1px solid #eef2f7;
                }
                
                .notification-info h4 {
                    font-size: 1rem;
                    color: #1a1a1a;
                    margin-bottom: 0.25rem;
                }
                
                .notification-info p {
                    font-size: 0.85rem;
                    color: #6c757d;
                }
                
                /* Toggle Switch */
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .toggle-slider {
                    background-color: #4361ee;
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
                
                /* Privacy Settings */
                .privacy-option {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    border: 1px solid #eef2f7;
                }
                
                .radio-group {
                    display: flex;
                    gap: 1rem;
                }
                
                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                
                .radio-input {
                    accent-color: #4361ee;
                }
                
                /* Subscription Section */
                .subscription-card {
                    background: linear-gradient(135deg, #4361ee, #3a56d4);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                
                .subscription-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .subscription-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                
                .subscription-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                
                .subscription-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .subscription-detail {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 1rem;
                    border-radius: 8px;
                }
                
                .detail-label {
                    font-size: 0.85rem;
                    opacity: 0.8;
                    margin-bottom: 0.25rem;
                }
                
                .detail-value {
                    font-weight: 600;
                }
                
                /* Action Buttons */
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #eef2f7;
                }
                
                .btn-primary {
                    background: #4361ee;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-primary:hover {
                    background: #3a56d4;
                    transform: translateY(-2px);
                }
                
                .btn-secondary {
                    background: #f8f9fa;
                    color: #1a1a1a;
                    border: 1px solid #ddd;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-secondary:hover {
                    background: #e9ecef;
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
                
                /* Danger Zone */
                .danger-zone {
                    margin-top: 3rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #ff6b6b;
                }
                
                .danger-title {
                    color: #dc3545;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                
                .btn-danger {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-danger:hover {
                    background: #c82333;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .settings-container {
                        padding: 1rem;
                    }
                    
                    .settings-tabs {
                        flex-direction: column;
                    }
                    
                    .tab {
                        width: 100%;
                        text-align: left;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                    
                    .btn-primary, .btn-secondary, .btn-danger {
                        width: 100%;
                    }
                }
                
                @media (max-width: 480px) {
                    .subscription-details {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-select {
                        max-width: 100%;
                    }
                    
                    .radio-group {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
                `}
            </style>

            <div className="header">
                <h1>Settings</h1>
                <p>Manage your account preferences and settings</p>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
                <button 
                    className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
                <button 
                    className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Email Notification
                </button>
                <button 
                    className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('privacy')}
                >
                    Privacy
                </button>
                <button 
                    className={`tab ${activeTab === 'subscription' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscription')}
                >
                    Subscription
                </button>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
                {activeTab === 'general' && (
                    <>
                        <h3 className="section-title">General Settings</h3>
                        
                        <div className="form-group">
                            <label className="form-label">Language</label>
                            <select 
                                className="form-select"
                                value={settings.general.language}
                                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                            >
                                {languages.map(lang => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                            <p className="form-help">Choose your preferred language for the interface</p>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Theme</label>
                            <select 
                                className="form-select"
                                value={settings.general.theme}
                                onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                            >
                                {themes.map(theme => (
                                    <option key={theme.value} value={theme.value}>{theme.label}</option>
                                ))}
                            </select>
                            <p className="form-help">Choose light, dark, or auto theme</p>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Timezone</label>
                            <select 
                                className="form-select"
                                value={settings.general.timezone}
                                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                            >
                                {timezones.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                            <p className="form-help">Set your local timezone for accurate timing</p>
                        </div>
                    </>
                )}
                
                {activeTab === 'notifications' && (
                    <>
                        <h3 className="section-title">Email Notification</h3>
                        <p style={{color: '#6c757d', marginBottom: '1.5rem'}}>When email me:</p>
                        
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Promotion, course recommendations</h4>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.emailPromotions}
                                    onChange={(e) => handleSettingChange('notifications', 'emailPromotions', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Don't send any promotional emails</h4>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.promotionalEmails}
                                    onChange={(e) => handleSettingChange('notifications', 'promotionalEmails', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Announcement from instructors whose course</h4>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.instructorAnnouncements}
                                    onChange={(e) => handleSettingChange('notifications', 'instructorAnnouncements', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Examination notice</h4>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.examNotices}
                                    onChange={(e) => handleSettingChange('notifications', 'examNotices', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Course Recommendations</h4>
                                <p>Receive personalized course suggestions</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.courseRecommendations}
                                    onChange={(e) => handleSettingChange('notifications', 'courseRecommendations', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Assignment Reminders</h4>
                                <p>Get reminders for upcoming assignments</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.assignmentReminders}
                                    onChange={(e) => handleSettingChange('notifications', 'assignmentReminders', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Deadline Alerts</h4>
                                <p>Receive alerts for approaching deadlines</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.notifications.deadlineAlerts}
                                    onChange={(e) => handleSettingChange('notifications', 'deadlineAlerts', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </>
                )}
                
                {activeTab === 'privacy' && (
                    <>
                        <h3 className="section-title">Privacy Settings</h3>
                        
                        <div className="privacy-option">
                            <div className="notification-info">
                                <h4>Profile Visibility</h4>
                                <p>Who can see your profile</p>
                            </div>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        className="radio-input"
                                        name="profileVisibility"
                                        value="public"
                                        checked={settings.privacy.profileVisibility === 'public'}
                                        onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                                    />
                                    <span>Public</span>
                                </label>
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        className="radio-input"
                                        name="profileVisibility"
                                        value="private"
                                        checked={settings.privacy.profileVisibility === 'private'}
                                        onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                                    />
                                    <span>Private</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="privacy-option">
                            <div className="notification-info">
                                <h4>Show Email Address</h4>
                                <p>Allow others to see your email</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.privacy.showEmail}
                                    onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div className="privacy-option">
                            <div className="notification-info">
                                <h4>Show Enrolled Courses</h4>
                                <p>Display your course list publicly</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.privacy.showCourses}
                                    onChange={(e) => handleSettingChange('privacy', 'showCourses', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="privacy-option">
                            <div className="notification-info">
                                <h4>Show Learning Progress</h4>
                                <p>Allow others to see your course progress</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.privacy.showProgress}
                                    onChange={(e) => handleSettingChange('privacy', 'showProgress', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="privacy-option">
                            <div className="notification-info">
                                <h4>Data Sharing</h4>
                                <p>Allow anonymous data for improvement</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={settings.privacy.dataSharing}
                                    onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </>
                )}
                
                {activeTab === 'subscription' && (
                    <>
                        <h3 className="section-title">Subscription</h3>
                        
                        <div className="subscription-card">
                            <div className="subscription-header">
                                <div className="subscription-title">Current Plan</div>
                                <div className="subscription-badge">{settings.subscription.plan.toUpperCase()}</div>
                            </div>
                            <p>Access all basic features and limited resources</p>
                            
                            <div className="subscription-details">
                                <div className="subscription-detail">
                                    <div className="detail-label">Next Billing Date</div>
                                    <div className="detail-value">{settings.subscription.nextBillingDate}</div>
                                </div>
                                <div className="subscription-detail">
                                    <div className="detail-label">Auto Renew</div>
                                    <div className="detail-value">
                                        <label className="toggle-switch" style={{transform: 'scale(0.8)'}}>
                                            <input 
                                                type="checkbox" 
                                                checked={settings.subscription.autoRenew}
                                                onChange={(e) => handleSettingChange('subscription', 'autoRenew', e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Payment Methods</h4>
                                <p>Manage your payment methods</p>
                            </div>
                            <button className="btn-primary" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                                Manage
                            </button>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Learning Reminder</h4>
                                <p>Get reminders for your learning schedule</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="upgrade-section" style={{marginTop: '2rem', marginBottom: '2rem'}}>
                            <div className="upgrade-title">Upgrade to PRO for more resources</div>
                            <p style={{fontSize: "0.9rem", opacity: 0.9}}>Get access to premium courses and features</p>
                            <button className="upgrade-btn">Upgrade Now</button>
                        </div>
                    </>
                )}
                
                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="btn-primary" onClick={handleSaveSettings}>
                        Save Settings
                    </button>
                    <button className="btn-secondary" onClick={handleResetSettings}>
                        Reset to Default
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                    <h4 className="danger-title">Danger Zone</h4>
                    <p style={{color: '#6c757d', marginBottom: '1rem'}}>Permanent actions that cannot be undone</p>
                    <button className="btn-danger">Delete Account</button>
                </div>
            </div>
        </div>
    );
}

export default Setting;