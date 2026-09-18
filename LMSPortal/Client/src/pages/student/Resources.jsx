import React, { useState } from 'react';

function Resources() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    
    const categories = [
        { id: 'all', name: 'All Resources', count: 24 },
        { id: 'blog', name: 'Blog Sites', count: 8 },
        { id: 'illustration', name: 'Illustration', count: 5 },
        { id: 'typography', name: 'Typography', count: 4 },
        { id: 'icon', name: 'Icon Sites', count: 4 },
        { id: 'image', name: 'Image Sites', count: 3 },
    ];
    
    const resources = [
        {
            id: 1,
            title: 'Medium',
            url: 'medium.com',
            category: 'blog',
            description: 'Platform for reading, writing, and interacting with articles',
            icon: '📝'
        },
        {
            id: 2,
            title: 'NN/g Nielsen Norman Group',
            url: 'nngroup.com',
            category: 'blog',
            description: 'World leaders in research-based user experience',
            icon: '🎯'
        },
        {
            id: 3,
            title: 'UX Design Collective',
            url: 'uxdesign.cc',
            category: 'blog',
            description: 'Curated stories on user experience, usability, and product design',
            icon: '🎨'
        },
        {
            id: 4,
            title: 'UXPin',
            url: 'uxpin.com',
            category: 'blog',
            description: 'Design, prototype, and collaborate with your team',
            icon: '🛠️'
        },
        {
            id: 5,
            title: 'Toptal Design Blog',
            url: 'toptal.com/designers/blog',
            category: 'blog',
            description: 'Insights from top designers around the world',
            icon: '🌟'
        },
        {
            id: 6,
            title: 'UX Magazine',
            url: 'uxmag.com',
            category: 'blog',
            description: 'Online publication for user experience professionals',
            icon: '📰'
        },
        {
            id: 7,
            title: 'UIBootstrap',
            url: 'uibootstrap.com',
            category: 'blog',
            description: 'Bootstrap tutorials and components',
            icon: '💻'
        },
        {
            id: 8,
            title: 'Prototype.io',
            url: 'prototype.io',
            category: 'blog',
            description: 'Prototyping tools and resources',
            icon: '🎮'
        },
        {
            id: 9,
            title: 'Undraw',
            url: 'undraw.co',
            category: 'illustration',
            description: 'Open-source illustrations for every project',
            icon: '🖼️'
        },
        {
            id: 10,
            title: 'Freepik',
            url: 'freepik.com',
            category: 'illustration',
            description: 'Free vectors, stock photos, and PSD',
            icon: '📷'
        },
        {
            id: 11,
            title: 'Google Fonts',
            url: 'fonts.google.com',
            category: 'typography',
            description: 'Free licensed font families',
            icon: '🔤'
        },
        {
            id: 12,
            title: 'Font Awesome',
            url: 'fontawesome.com',
            category: 'icon',
            description: 'Icon library and toolkit',
            icon: '✨'
        },
        {
            id: 13,
            title: 'Unsplash',
            url: 'unsplash.com',
            category: 'image',
            description: 'Beautiful free images & photos',
            icon: '📸'
        },
    ];

    const filteredResources = resources.filter(resource => {
        const matchesSearch = searchTerm === '' || 
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="resources-container">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .resources-container {
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
                
                /* Search Bar */
                .search-container {
                    margin-bottom: 2rem;
                    position: relative;
                }
                
                .search-box {
                    width: 100%;
                    max-width: 400px;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 1px solid #eef2f7;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    background: white;
                    color: #1a1a1a;
                    transition: all 0.3s ease;
                }
                
                .search-box:focus {
                    outline: none;
                    border-color: #4361ee;
                    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
                }
                
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6c757d;
                }
                
                /* Categories */
                .categories-container {
                    margin-bottom: 2rem;
                }
                
                .categories-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .categories-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                
                .categories-grid {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .category-card {
                    background: white;
                    border: 2px solid transparent;
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 160px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                
                .category-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                
                .category-card.active {
                    background: #4361ee;
                    color: white;
                    border-color: #4361ee;
                }
                
                .category-card.active .category-count {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .category-name {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .category-count {
                    display: inline-block;
                    background: #f8f9fa;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                
                .category-card.active .category-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                /* Resources Grid */
                .resources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .resource-card {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    border: 1px solid #eef2f7;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                
                .resource-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border-color: #4361ee;
                }
                
                .resource-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                
                .resource-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                }
                
                .resource-url {
                    color: #4361ee;
                    font-size: 0.85rem;
                    margin-bottom: 0.75rem;
                    display: block;
                    text-decoration: none;
                }
                
                .resource-url:hover {
                    text-decoration: underline;
                }
                
                .resource-description {
                    color: #6c757d;
                    font-size: 0.9rem;
                    line-height: 1.5;
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
                
                /* Stats */
                .stats-section {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                
                .stat-box {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    border: 1px solid #eef2f7;
                    text-align: center;
                    min-width: 120px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                
                .stat-number {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #4361ee;
                    margin-bottom: 0.25rem;
                }
                
                .stat-label {
                    font-size: 0.85rem;
                    color: #6c757d;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .resources-container {
                        padding: 1rem;
                    }
                    
                    .resources-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .categories-grid {
                        flex-direction: column;
                    }
                    
                    .category-card {
                        min-width: auto;
                    }
                    
                    .stats-section {
                        justify-content: center;
                    }
                }
                
                @media (max-width: 480px) {
                    .header h1 {
                        font-size: 1.5rem;
                    }
                    
                    .search-box {
                        max-width: 100%;
                    }
                    
                    .stat-box {
                        flex: 1;
                        min-width: 100px;
                    }
                }
                `}
            </style>

            <div className="header">
                <h1>My Resources</h1>
                <p>Access learning materials, tools, and external resources</p>
            </div>

            {/* Stats */}
            <div className="stats-section">
                <div className="stat-box">
                    <div className="stat-number">24</div>
                    <div className="stat-label">Total Resources</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">8</div>
                    <div className="stat-label">Blog Sites</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">5</div>
                    <div className="stat-label">Illustration</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">4</div>
                    <div className="stat-label">Typography</div>
                </div>
            </div>

            {/* Search */}
            <div className="search-container">
                <div className="search-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                </div>
                <input
                    type="text"
                    className="search-box"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Categories */}
            <div className="categories-container">
                <div className="categories-header">
                    <h2 className="categories-title">Categories</h2>
                </div>
                <div className="categories-grid">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            <div className="category-name">{category.name}</div>
                            <span className="category-count">{category.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resources Grid */}
            <div className="resources-grid">
                {filteredResources.map(resource => (
                    <div key={resource.id} className="resource-card">
                        <div className="resource-icon">{resource.icon}</div>
                        <h3 className="resource-title">{resource.title}</h3>
                        <a 
                            href={`https://${resource.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resource-url"
                        >
                            {resource.url}
                        </a>
                        <p className="resource-description">{resource.description}</p>
                    </div>
                ))}
            </div>

            {/* Upgrade Section */}
            <div className="upgrade-section">
                <div className="upgrade-title">Upgrade to PRO for more resources</div>
                <p style={{fontSize: "0.9rem", opacity: 0.9}}>Get access to premium resources and tools</p>
                <button className="upgrade-btn">Upgrade Now</button>
            </div>
        </div>
    );
}

export default Resources;