// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    // Global helper function for image URLs
    getImageUrl(photoUrl, fallbackUrl = 'images/default-avatar.png') {
        if (!photoUrl) return fallbackUrl;
        if (photoUrl.startsWith('http')) return photoUrl;
        return `http://localhost:3001${photoUrl}`;
    }

    // Worker status helper function
    getWorkerStatus(worker) {
        // Default logic - can be enhanced with actual data from backend
        const hasActiveJobs = worker.active_jobs && worker.active_jobs.length > 0;
        const isCurrentlyHired = worker.current_employer_id && worker.current_employer_id !== null;
        const isAvailable = worker.availability === 'available' || worker.is_available === true;
        
        if (isCurrentlyHired) {
            return {
                status: 'hired',
                label: 'Hired',
                icon: 'fas fa-briefcase',
                color: '#1d4ed8'
            };
        } else if (hasActiveJobs) {
            return {
                status: 'unavailable',
                label: 'Unavailable',
                icon: 'fas fa-clock',
                color: '#dc2626'
            };
        } else if (isAvailable) {
            return {
                status: 'available',
                label: 'Available',
                icon: 'fas fa-check-circle',
                color: '#166534'
            };
        } else {
            return {
                status: 'unhired',
                label: 'Unhired',
                icon: 'fas fa-user-clock',
                color: '#d97706'
            };
        }
    }

    // Generate status badge HTML
    generateStatusBadge(worker) {
        const statusInfo = this.getWorkerStatus(worker);
        return `
            <div class="worker-status ${statusInfo.status}">
                <i class="${statusInfo.icon}"></i>
                ${statusInfo.label}
            </div>
        `;
    }

    async init() {
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Verify token with backend
                const user = await apiService.verifyToken();
                this.currentUser = user;
                
                // Hide homepage and show dashboard immediately
                this.hideHomePage();
                this.showDashboard();
            } catch (error) {
                console.warn('Token verification failed:', error.message);
                // Token is invalid, clear it
                apiService.logout();
            }
        }
    }

    hideHomePage() {
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'none';
        }
    }

    async register(userData, userType) {
        try {
            const response = await apiService.register({
                ...userData,
                userType: userType
            });
            
            this.currentUser = response.user;
            
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(email, password) {
        try {
            console.log('=== AUTH LOGIN ===');
            console.log('Attempting login for:', email);
            
            const response = await apiService.login(email, password);
            console.log('Login response:', response);
            
            // Token is already stored in localStorage by apiService.login
            this.currentUser = response.user;
            
            console.log('Login successful, user:', this.currentUser);
            console.log('Token stored:', localStorage.getItem('authToken') ? 'Yes' : 'No');
            
            return { success: true, message: response.message };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: error.message };
        }
    }

    logout() {
        if (confirm('Are you sure you want to log out of Umukozi?')) {
            apiService.logout();
            this.currentUser = null;
            this.showHome();
        }
    }

    showHome() {
        // Show homepage
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
        }
        
        // Hide dashboard
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            dashboard.style.display = 'none';
        }
        
        // Update homepage auth buttons
        if (typeof updateAuthUI === 'function') {
            updateAuthUI(false);
        }
    }

    showDashboard() {
        if (!this.currentUser) return;

        document.getElementById('app').style.display = 'none';
        
        if (this.currentUser.userType === 'worker') {
            this.showWorkerDashboard();
        } else {
            this.showEmployerDashboard();
        }
    }

    async    showWorkerDashboard() {
        let dashboard = document.querySelector('.dashboard');
        if (!dashboard) {
            dashboard = document.createElement('div');
            dashboard.className = 'dashboard';
            document.body.appendChild(dashboard);
        }

        dashboard.innerHTML = `
            <div class="app-layout worker-dashboard-new">
                <!-- Left Sidebar -->
                <aside class="app-sidebar">
                    <div class="sidebar-top">
                        <div class="app-logo-mark">
                            <i class="fas fa-home"></i>
                        </div>
                        <nav class="sidebar-nav">
                            <button class="nav-item active" onclick="showDashboardSection('overview')" title="Dashboard">
                                <i class="fas fa-th-large"></i>
                                <span>Overview</span>
                            </button>
                            <button class="nav-item" onclick="showDashboardSection('jobs')" title="Find Jobs">
                                <i class="fas fa-search-dollar"></i>
                                <span>Find Jobs</span>
                            </button>
                            <button class="nav-item" onclick="showDashboardSection('applications')" title="Applications">
                                <i class="fas fa-paper-plane"></i>
                                <span>Applications</span>
                            </button>
                            <button class="nav-item" onclick="showDashboardSection('stats')" title="Activity">
                                <i class="fas fa-chart-line"></i>
                                <span>Activity</span>
                            </button>
                        </nav>
                    </div>

                    <div class="sidebar-bottom">
                         <button class="nav-item" onclick="showDashboardSection('settings')" title="Settings">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                        </button>
                        <button class="logout-btn-new" onclick="authSystem.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </aside>

                <!-- Main Content Area -->
                <div class="app-main">
                    <header class="app-header">
                        <div class="header-left">
                            <button class="app-menu-toggle" onclick="toggleMobileSidebar()">
                                <i class="fas fa-bars"></i>
                            </button>
                            <h2 id="pageTitle">Overview</h2>
                        </div>
                        <div class="header-right">
                            <div class="search-box-modern">
                                <i class="fas fa-search"></i>
                                <input type="text" placeholder="Search...">
                            </div>
                            <div class="header-tools">
                                <button class="tool-circle"><i class="fas fa-bell"></i><span class="dot"></span></button>
                                <div class="profile-trigger" onclick="showDashboardSection('profile')">
                                    <div class="avatar-sm">
                                        ${this.currentUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span class="user-name-compact">${this.currentUser.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main class="app-content-scroll">
                        <div id="dashboardContent" class="fade-in">
                            <div class="loading-state">
                                <div class="spinner"></div>
                                <span>Initializing your workspace...</span>
                            </div>
                        </div>
                    </main>
                </div>
                
                <div class="mobile-sidebar-overlay" onclick="toggleMobileSidebar()"></div>
            </div>
        `;

        dashboard.style.display = 'block';
        
        // Load overview by default
        showDashboardSection('overview');
    }

    showEmployerDashboard() {
        let dashboard = document.querySelector('.dashboard');
        if (!dashboard) {
            dashboard = document.createElement('div');
            dashboard.className = 'dashboard';
            document.body.appendChild(dashboard);
        }

        dashboard.innerHTML = `
            <header class="dashboard-header employer-header">
                <div class="container">
                    <div class="header-content">
                        <button class="mobile-menu-toggle" onclick="toggleMobileSidebar()">
                            <i class="fas fa-bars"></i>
                        </button>
                        

                        <div class="header-search">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search workers, jobs or skills...">
                        </div>

                        <div class="header-actions">
                            <div class="notif-btn">
                                <i class="fas fa-bell"></i>
                                <span class="badge">3</span>
                            </div>
                            <div class="user-info">
                                <div class="user-avatar">
                                    ${this.currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="user-welcome">
                                    <span class="user-welcome-text">Employer Account</span>
                                    <span class="user-welcome-subtitle">${this.currentUser.name}</span>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <div class="dashboard-layout">
                <div class="mobile-sidebar-overlay" onclick="toggleMobileSidebar()"></div>
                <aside class="dashboard-sidebar">
                    <div class="dashboard-nav">
                        <button class="active" onclick="showDashboardSection('overview')">
                            <i class="fas fa-th-large"></i> Dashboard
                        </button>
                        <button onclick="showDashboardSection('search')">
                            <i class="fas fa-search"></i> Find Workers
                        </button>
                        <button onclick="showDashboardSection('post')">
                            <i class="fas fa-plus-circle"></i> Post Job
                        </button>
                        <button onclick="showDashboardSection('manage')">
                            <i class="fas fa-tasks"></i> Manage Jobs
                        </button>
                        <button onclick="showDashboardSection('applications')">
                            <i class="fas fa-envelope-open-text"></i> Applications
                        </button>
                        <button onclick="showDashboardSection('settings')">
                            <i class="fas fa-cog"></i> Account Settings
                        </button>
                        <button class="logout-btn" onclick="authSystem.logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </aside>
                
                <main class="dashboard-content">
                    <div id="dashboardContent">
                        <div class="loading">Loading...</div>
                    </div>
                </main>
            </div>
        `;

        dashboard.style.display = 'block';
        
        // Load overview by default
        showDashboardSection('overview');
    }

    getWorkerProfileForm() {
        return `
            <div class="profile-card">
                <h2>Complete Your Profile</h2>
                <p>Please fill in your details to help employers find you</p>
                
                <form id="workerProfileForm" onsubmit="authSystem.saveWorkerProfile(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nationalId">National ID Number</label>
                            <input type="text" id="nationalId" name="nationalId" required>
                        </div>
                        
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profilePhoto">Profile Photo</label>
                            <input type="file" id="profilePhoto" name="profilePhoto" accept="image/*" onchange="previewImage(event, 'imagePreview')">
                            <div id="imagePreview" style="margin-top: 10px;"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="idPhoto">National ID Photo (Essential for Verification)</label>
                            <input type="file" id="idPhoto" name="idPhoto" accept="image/*" onchange="previewImage(event, 'idImagePreview')" required>
                            <div id="idImagePreview" style="margin-top: 10px;"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="location">Location</label>
                            <input type="text" id="location" name="location" placeholder="e.g., Kiyovu, Kigali" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="availability">Availability</label>
                            <select id="availability" name="availability" required>
                                <option value="">Select Availability</option>
                                <option value="full-time">Full Time</option>
                                <option value="part-time">Part Time</option>
                                <option value="weekends">Weekends Only</option>
                                <option value="flexible">Flexible</option>
                                <option value="live-in">Live-in</option>
                                <option value="go-home">Go After Work</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expectedSalary">Expected Salary (RWF/month)</label>
                            <input type="number" id="expectedSalary" name="expectedSalary" placeholder="e.g., 50000" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="experienceYears">Experience (years)</label>
                            <input type="number" id="experienceYears" name="experienceYears" placeholder="e.g., 3" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="skills">Skills (comma separated)</label>
                        <textarea id="skills" name="skills" placeholder="e.g., Cooking, Cleaning, Childcare, Laundry" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="recommendation1Name">Recommendation 1 - Name</label>
                            <input type="text" id="recommendation1Name" name="recommendation1Name" placeholder="e.g., Jean Mugabo" required>
                        </div>
                        <div class="form-group">
                            <label for="recommendation1Phone">Recommendation 1 - Phone</label>
                            <input type="tel" id="recommendation1Phone" name="recommendation1Phone" placeholder="e.g., 0788123456" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="recommendation2Name">Recommendation 2 - Name</label>
                            <input type="text" id="recommendation2Name" name="recommendation2Name" placeholder="e.g., Marie Uwimana" required>
                        </div>
                        <div class="form-group">
                            <label for="recommendation2Phone">Recommendation 2 - Phone</label>
                            <input type="tel" id="recommendation2Phone" name="recommendation2Phone" placeholder="e.g., 0722123456" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Save Profile</button>
                </form>
            </div>
        `;
    }

    async getWorkerProfileSection() {
        try {
            const response = await apiService.getWorkerProfile();
            const profile = response.profile;
            
            // Helper function to get full image URL
            // Helper function for image URLs
            const getImageUrl = (photoUrl) => this.getImageUrl(photoUrl);
            
            return `
                <div class="profile-card">
                    <div class="profile-status">
                        <span class="profile-status-label">Current Status:</span>
                        ${this.generateStatusBadge({...profile, name: this.currentUser.name})}
                    </div>
                    <div class="profile-header">
                        <img src="${getImageUrl(profile.profile_photo)}" alt="Profile" class="profile-avatar">
                        <div class="profile-info">
                            <h3>${this.currentUser.name}</h3>
                            <p><i class="fas fa-map-marker-alt"></i> ${profile.location || 'Not specified'}</p>
                            <p><i class="fas fa-clock"></i> ${profile.availability || 'Not specified'}</p>
                            <p><i class="fas fa-money-bill"></i> RWF ${profile.expected_salary || 'Not specified'}/month</p>
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <div class="profile-actions">
                            <button class="btn btn-primary" onclick="authSystem.showEditProfile()">
                                <i class="fas fa-edit"></i> Edit Profile
                            </button>
                            <button class="btn btn-outline" onclick="authSystem.showStatusManagement()">
                                <i class="fas fa-toggle-on"></i> Update Status
                            </button>
                        </div>
                        
                        <h4>Experience & Skills</h4>
                        <p><strong>Experience:</strong> ${profile.experience_years || 'Not specified'} years</p>
                        <p><strong>Skills:</strong> ${profile.skills || 'Not specified'}</p>
                        
                        <h4>Recommendations</h4>
                        <p><strong>Reference 1:</strong> ${profile.recommendation1_name || 'Not provided'} - ${profile.recommendation1_phone || 'Not provided'}</p>
                        <p><strong>Reference 2:</strong> ${profile.recommendation2_name || 'Not provided'} - ${profile.recommendation2_phone || 'Not provided'}</p>
                        
                        <h4>National ID</h4>
                        <p><strong>ID Number:</strong> ${profile.national_id || 'Not provided'}</p>
                    </div>
                </div>
            `;
        } catch (error) {
            return '<div class="alert alert-error">Failed to load profile. Please try again.</div>';
        }
    }

    async showEditProfile() {
        try {
            const response = await apiService.getWorkerProfile();
            const profile = response.profile;
            
            // Helper function to get full image URL
            // Helper function for image URLs
            const getImageUrl = (photoUrl) => this.getImageUrl(photoUrl, '');
            
            const editForm = `
                <div class="profile-card">
                    <h2>Edit Your Profile</h2>
                    <p>Update your information to help employers find you</p>
                    
                    <form id="editWorkerProfileForm" onsubmit="authSystem.updateWorkerProfile(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editNationalId">National ID Number</label>
                                <input type="text" id="editNationalId" name="nationalId" value="${profile.national_id || ''}" required>
                            </div>
                            
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProfilePhoto">Profile Photo</label>
                                <input type="file" id="editProfilePhoto" name="profilePhoto" accept="image/*" onchange="previewImage(event, 'editImagePreview')">
                                <div id="editImagePreview" style="margin-top: 10px;">
                                    ${profile.profile_photo ? `<img src="${getImageUrl(profile.profile_photo)}" alt="Current profile" style="max-width: 100px; max-height: 100px; border-radius: 50%;">` : ''}
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="editIdPhoto">National ID Photo</label>
                                <input type="file" id="editIdPhoto" name="idPhoto" accept="image/*" onchange="previewImage(event, 'editIdImagePreview')">
                                <div id="editIdImagePreview" style="margin-top: 10px;">
                                    ${profile.id_photo ? `<img src="${getImageUrl(profile.id_photo)}" alt="Current ID" style="max-width: 150px; border-radius: 8px;">` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editLocation">Location</label>
                                <input type="text" id="editLocation" name="location" placeholder="e.g., Kiyovu, Kigali" value="${profile.location || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editAvailability">Availability</label>
                                <select id="editAvailability" name="availability" required>
                                    <option value="">Select Availability</option>
                                    <option value="full-time" ${profile.availability === 'full-time' ? 'selected' : ''}>Full Time</option>
                                    <option value="part-time" ${profile.availability === 'part-time' ? 'selected' : ''}>Part Time</option>
                                    <option value="weekends" ${profile.availability === 'weekends' ? 'selected' : ''}>Weekends Only</option>
                                    <option value="flexible" ${profile.availability === 'flexible' ? 'selected' : ''}>Flexible</option>
                                    <option value="live-in" ${profile.availability === 'live-in' ? 'selected' : ''}>Live-in</option>
                                    <option value="go-home" ${profile.availability === 'go-home' ? 'selected' : ''}>Go After Work</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editExpectedSalary">Expected Salary (RWF/month)</label>
                                <input type="number" id="editExpectedSalary" name="expectedSalary" placeholder="e.g., 50000" value="${profile.expected_salary || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editExperienceYears">Experience (years)</label>
                                <input type="number" id="editExperienceYears" name="experienceYears" placeholder="e.g., 3" value="${profile.experience_years || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSkills">Skills (comma separated)</label>
                            <textarea id="editSkills" name="skills" placeholder="e.g., Cooking, Cleaning, Childcare, Laundry" required>${profile.skills || ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editRecommendation1Name">Recommendation 1 - Name</label>
                                <input type="text" id="editRecommendation1Name" name="recommendation1Name" placeholder="e.g., Jean Mugabo" value="${profile.recommendation1_name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editRecommendation1Phone">Recommendation 1 - Phone</label>
                                <input type="tel" id="editRecommendation1Phone" name="recommendation1Phone" placeholder="e.g., 0788123456" value="${profile.recommendation1_phone || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editRecommendation2Name">Recommendation 2 - Name</label>
                                <input type="text" id="editRecommendation2Name" name="recommendation2Name" placeholder="e.g., Marie Uwimana" value="${profile.recommendation2_name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editRecommendation2Phone">Recommendation 2 - Phone</label>
                                <input type="tel" id="editRecommendation2Phone" name="recommendation2Phone" placeholder="e.g., 0722123456" value="${profile.recommendation2_phone || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="authSystem.cancelEditProfile()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </div>
                    </form>
                </div>
            `;
            
            document.getElementById('dashboardContent').innerHTML = editForm;
        } catch (error) {
            this.showAlert('Failed to load profile for editing. Please try again.', 'error');
        }
    }

    getEmployerSearchSection() {
        return `
            <div class="fw-page">

                <!-- Page Header -->
                <div class="fw-header">
                    <div>
                        <h2><i class="fas fa-users"></i> Find Household Workers</h2>
                        <p class="fw-sub">Search and connect with verified, skilled workers in your area</p>
                    </div>
                </div>

                <!-- Filter Bar -->
                <div class="fw-filters">
                    <div class="fw-filter-input-wrap">
                        <i class="fas fa-map-marker-alt fw-filter-icon"></i>
                        <input type="text" id="searchLocation" class="fw-filter-input" placeholder="Location (e.g. Kiyovu, Kigali)">
                    </div>
                    <div class="fw-filter-input-wrap">
                        <i class="fas fa-tools fw-filter-icon"></i>
                        <input type="text" id="searchSkills" class="fw-filter-input" placeholder="Skills (e.g. Cooking, Childcare)">
                    </div>
                    <div class="fw-filter-select-wrap">
                        <i class="fas fa-clock fw-filter-icon"></i>
                        <select id="searchAvailability" class="fw-filter-select">
                            <option value="">Any Availability</option>
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="weekends">Weekends Only</option>
                            <option value="flexible">Flexible</option>
                            <option value="live-in">Live-in</option>
                            <option value="go-home">Go After Work</option>
                        </select>
                    </div>
                    <button class="btn btn-primary fw-search-btn" onclick="authSystem.searchWorkers()">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>

                <!-- Results Area -->
                <div id="searchResults" class="fw-results">
                    <div class="fw-initial-state">
                        <div class="fw-initial-art"><i class="fas fa-search"></i></div>
                        <h3>Find Your Perfect Worker</h3>
                        <p>Use the filters above to search, or click <strong>Search</strong> to see all available workers.</p>
                    </div>
                </div>

            </div>
        `;
    }

    async saveWorkerProfile(event) {
        event.preventDefault();
        
        const formElement = event.target;
        const formData = new FormData(formElement);
        let photoUrl = '';
        let idPhotoUrl = '';
        
        // Handle Profile Photo
        const photoFile = formData.get('profilePhoto');
        if (photoFile && photoFile.size > 0) {
            const upP = new FormData(); upP.append('image', photoFile);
            try {
                const res = await apiService.uploadImage(upP);
                if (res.url) photoUrl = res.url;
            } catch (err) { console.warn('Profile photo upload failed:', err.message); }
        }

        // Handle ID Photo
        const idFile = formData.get('idPhoto');
        if (idFile && idFile.size > 0) {
            const upI = new FormData(); upI.append('image', idFile);
            try {
                const res = await apiService.uploadImage(upI);
                if (res.url) idPhotoUrl = res.url;
            } catch (err) { console.warn('ID photo upload failed:', err.message); }
        }
        
        const profileData = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'profilePhoto') {
                profileData[key] = photoUrl;
            } else if (key === 'idPhoto') {
                profileData[key] = idPhotoUrl;
            } else if (key === 'nationalId') {
                profileData[key] = value;
            } else if (key === 'location') {
                profileData[key] = value;
            } else if (key === 'availability') {
                profileData[key] = value;
            } else if (key === 'expectedSalary') {
                profileData[key] = value;
            } else if (key === 'experienceYears') {
                profileData[key] = value;
            } else if (key === 'skills') {
                profileData[key] = value;
            } else if (key === 'recommendation1Name') {
                profileData[key] = value;
            } else if (key === 'recommendation1Phone') {
                profileData[key] = value;
            } else if (key === 'recommendation2Name') {
                profileData[key] = value;
            } else if (key === 'recommendation2Phone') {
                profileData[key] = value;
            }
        }
        
        console.log('=== FRONTEND PROFILE SAVE ===');
        console.log('Profile data being sent:', profileData);
        
        try {
            const response = await apiService.saveWorkerProfile(profileData);
            
            // Update current user with profile data
            this.currentUser.profileComplete = true;
            
            // Show success message
            let successMessage = 'Profile completed successfully!';
            if (photoUrl) successMessage += ' Profile photo uploaded.';
            if (idPhotoUrl) successMessage += ' ID photo uploaded.';
            
            this.showAlert(successMessage, 'success');
            this.showWorkerDashboard();
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async updateWorkerProfile(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        let profilePhoto = '';
        let idPhoto = '';
        
        try {
            // Handle Profile Photo Edit
            const pFile = formData.get('profilePhoto');
            if (pFile && pFile.size > 0) {
                const up = new FormData(); up.append('image', pFile);
                const res = await apiService.uploadImage(up);
                profilePhoto = res.url;
            }
            
            // Handle ID Photo Edit
            const iFile = formData.get('idPhoto');
            if (iFile && iFile.size > 0) {
                const up = new FormData(); up.append('image', iFile);
                const res = await apiService.uploadImage(up);
                idPhoto = res.url;
            }
            
            const updateData = {};
            for (let [k, v] of formData.entries()) {
                if (k === 'profilePhoto') {
                    if (profilePhoto) updateData[k] = profilePhoto;
                } else if (k === 'idPhoto') {
                    if (idPhoto) updateData[k] = idPhoto;
                } else {
                    updateData[k] = v;
                }
            }
            
            await apiService.updateWorkerProfile(updateData);
            this.showAlert('Profile updated successfully!', 'success');
            this.showDashboardSection('profile');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async showStatusManagement() {
        try {
            const response = await apiService.getWorkerProfile();
            const profile = response.profile;
            const currentStatus = this.getWorkerStatus({...profile, name: this.currentUser.name});
            
            const statusModal = `
                <div class="profile-card">
                    <h2><i class="fas fa-toggle-on"></i> Update Your Status</h2>
                    <p>Let employers know your current availability</p>
                    
                    <div class="profile-status">
                        <span class="profile-status-label">Current Status:</span>
                        ${this.generateStatusBadge({...profile, name: this.currentUser.name})}
                    </div>
                    
                    <form id="statusUpdateForm" onsubmit="authSystem.updateWorkerStatus(event)">
                        <div class="form-group">
                            <label for="availabilityStatus">Availability Status</label>
                            <select id="availabilityStatus" name="availability" class="form-control" required>
                                <option value="available" ${currentStatus.status === 'available' ? 'selected' : ''}>
                                    🟢 Available for work
                                </option>
                                <option value="unavailable" ${currentStatus.status === 'unavailable' ? 'selected' : ''}>
                                    🔴 Temporarily unavailable
                                </option>
                                <option value="hired" ${currentStatus.status === 'hired' ? 'selected' : ''}>
                                    💼 Currently employed
                                </option>
                                <option value="unhired" ${currentStatus.status === 'unhired' ? 'selected' : ''}>
                                    🟡 Seeking employment
                                </option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="statusNote">Status Note (Optional)</label>
                            <textarea id="statusNote" name="status_note" placeholder="Add a note about your current situation..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Update Status
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            showModal(statusModal);
            
        } catch (error) {
            this.showAlert('Failed to load current status. Please try again.', 'error');
        }
    }

    async updateWorkerStatus(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const statusData = {
            availability: formData.get('availability'),
            status_note: formData.get('status_note')
        };
        
        try {
            // In a real app: await apiService.updateWorkerStatus(statusData);
            this.currentUser.availability = statusData.availability;
            this.currentUser.status_note = statusData.status_note;
            
            this.showAlert('Status updated successfully!', 'success');
            closeModal();
            
            // Refresh the profile section
            showDashboardSection('profile');
            
        } catch (error) {
            this.showAlert('Failed to update status. Please try again.', 'error');
        }
    }

    async updateWorkerProfile(event) {
        event.preventDefault();
        
        const formElement = event.target;
        const formData = new FormData(formElement);
        let photoUrl = '';
        
        // Check if a new image was selected
        const photoFile = formData.get('profilePhoto');
        if (photoFile && photoFile.size > 0) {
            const uploadData = new FormData();
            uploadData.append('image', photoFile);
            try {
                const uploadResponse = await apiService.uploadImage(uploadData);
                if (uploadResponse.url) {
                    photoUrl = uploadResponse.url;
                }
            } catch (err) {
                // Don't fail the entire profile update if image upload fails
                console.warn('Image upload failed:', err.message);
                // Continue without photo - user can upload later
            }
        }
        
        const profileData = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'profilePhoto') {
                if (photoUrl) {
                    profileData[key] = photoUrl;
                }
                // If no new photo, don't include the field to keep existing photo
            } else {
                profileData[key] = value;
            }
        }
        
        try {
            const response = await apiService.updateWorkerProfile(profileData);
            
            // Show success message with appropriate image upload info
            let successMessage = 'Profile updated successfully!';
            if (photoFile && photoFile.size > 0 && photoUrl) {
                successMessage += ' Profile photo updated successfully.';
            } else if (photoFile && photoFile.size > 0 && !photoUrl) {
                successMessage += ' (Profile photo upload failed - you can try again later)';
            }
            this.showAlert(successMessage, 'success');
            this.showWorkerDashboard();
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    cancelEditProfile() {
        this.showWorkerDashboard();
    }

    async searchWorkers() {
        const location = document.getElementById('searchLocation').value;
        const skills = document.getElementById('searchSkills').value;
        const availability = document.getElementById('searchAvailability').value;
        
        const searchParams = {};
        if (location) searchParams.location = location;
        if (skills) searchParams.skills = skills;
        if (availability) searchParams.availability = availability;
        
        try {
            const response = await apiService.searchWorkers(searchParams);
            this.displaySearchResults(response.workers);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    displaySearchResults(workers) {
        const resultsDiv = document.getElementById('searchResults');
        
        console.log('=== DISPLAYING WORKER SEARCH RESULTS ===');
        console.log('Workers data:', workers);

        if (!workers || workers.length === 0) {
            resultsDiv.innerHTML = `
                <div class="fw-empty">
                    <div class="fw-empty-art"><i class="fas fa-user-slash"></i></div>
                    <h3>No Workers Found</h3>
                    <p>Try adjusting your filters or broadening your search to see more results.</p>
                </div>`;
            return;
        }

        const availabilityLabels = {
            'full-time': 'Full Time', 'part-time': 'Part Time',
            'weekends': 'Weekends Only', 'flexible': 'Flexible',
            'live-in': 'Live-in', 'live-out': 'Live-out'
        };
        const availabilityColors = {
            'full-time': '#2563eb', 'part-time': '#7c3aed',
            'weekends': '#d97706', 'flexible': '#059669',
            'live-in': '#dc2626', 'live-out': '#0891b2'
        };

        const getImageUrl = (photoUrl, workerId) => {
            const url = this.getImageUrl(photoUrl, `https://picsum.photos/seed/worker${workerId}/100/100.jpg`);
            console.log(`Image URL for worker ${workerId}:`, url, 'Original photo_url:', photoUrl);
            return url;
        };

        const cardsHTML = workers.map(worker => {
            console.log(`Processing worker ${worker.id}:`, {
                name: worker.name,
                profile_photo: worker.profile_photo,
                id_photo: worker.id_photo,
                is_verified: worker.is_verified
            });
            
            const avKey = worker.availability || 'flexible';
            const avLabel = availabilityLabels[avKey] || avKey;
            const avColor = availabilityColors[avKey] || '#2563eb';
            const salary = worker.expected_salary
                ? `RWF ${Number(worker.expected_salary).toLocaleString()}/mo`
                : 'Negotiable';
            const skills = (worker.skills || '').split(',').map(s => s.trim()).filter(Boolean);
            const skillChips = skills.slice(0, 4).map(s =>
                `<span class="wc-skill-chip">${s}</span>`).join('');
            const extraSkills = skills.length > 4
                ? `<span class="wc-skill-chip wc-skill-more">+${skills.length - 4} more</span>` : '';
            const initials = worker.name ? worker.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

            const profileImageUrl = getImageUrl(worker.profile_photo, worker.id);
            const hasIdPhoto = worker.id_photo && worker.id_photo !== null && worker.id_photo !== '';

            return `
            <article class="wc-card">
                <!-- Status Badge -->
                <div class="wc-status-container">
                    ${this.generateStatusBadge(worker)}
                </div>
                
                <!-- Avatar + Name -->
                <div class="wc-top">
                    <div class="wc-avatar-wrap">
                        <img src="${profileImageUrl}" alt="${worker.name}"
                             class="wc-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <div class="wc-avatar-fallback" style="display:none">${initials}</div>
                        ${worker.is_verified ? '<div class="wc-verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                    </div>
                    <div class="wc-identity">
                        <h3 class="wc-name">${worker.name}</h3>
                        <span class="wc-badge" style="background:${avColor}18;color:${avColor};border:1.5px solid ${avColor}35">${avLabel}</span>
                        ${hasIdPhoto ? '<span class="wc-id-badge"><i class="fas fa-id-card"></i> ID Verified</span>' : ''}
                    </div>
                    <div class="wc-salary-pill">
                        <i class="fas fa-coins"></i> ${salary}
                    </div>
                </div>

                <!-- Meta row -->
                <div class="wc-meta">
                    <span class="wc-meta-item"><i class="fas fa-map-marker-alt"></i> ${worker.location || 'Not specified'}</span>
                    <span class="wc-meta-item"><i class="fas fa-briefcase"></i> ${worker.experience_years || '0'} yrs exp</span>
                </div>

                <!-- Skill chips -->
                ${skills.length > 0 ? `<div class="wc-skills">${skillChips}${extraSkills}</div>` : ''}

                <!-- Actions -->
                <div class="wc-actions">
                    <button class="btn btn-primary wc-btn" onclick="authSystem.contactWorker('${worker.id}')">
                        <i class="fas fa-phone"></i> Contact
                    </button>
                    <button class="btn btn-outline wc-btn" onclick="authSystem.viewWorkerProfile('${worker.id}')">
                        <i class="fas fa-id-card"></i> Full Profile
                    </button>
                </div>
            </article>`;
        }).join('');

        resultsDiv.innerHTML = `
            <div class="fw-results-header">
                <span class="fw-results-count">${workers.length} worker${workers.length !== 1 ? 's' : ''} found</span>
            </div>
            <div class="fw-grid">${cardsHTML}</div>`;
    }

    async contactWorker(workerId) {
        try {
            const response = await apiService.getWorkerById(workerId);
            const worker = response.worker;
            this.showAlert(`Contact ${worker.name} at: ${worker.phone}`, 'info');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async viewWorkerProfile(workerId) {
        try {
            const response = await apiService.getWorkerById(workerId);
            const worker = response.worker;
            
            // Helper function to get full image URL
            const getImageUrl = (photoUrl) => this.getImageUrl(photoUrl);
            
            // Show detailed profile view
            const profileHTML = `
                <div class="profile-card">
                    <div class="profile-status">
                        <span class="profile-status-label">Worker Status:</span>
                        ${this.generateStatusBadge(worker)}
                    </div>
                    <div class="profile-header">
                        <img src="${getImageUrl(worker.profile_photo) || 'https://picsum.photos/seed/worker' + worker.id + '/120/120.jpg'}" alt="${worker.name}" class="profile-avatar">
                        <div class="profile-info">
                            <h3>${worker.name}</h3>
                            <p><i class="fas fa-envelope"></i> ${worker.email}</p>
                            <p><i class="fas fa-phone"></i> ${worker.phone}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${worker.location}</p>
                            <p><i class="fas fa-clock"></i> ${worker.availability}</p>
                            <p><i class="fas fa-money-bill"></i> RWF ${worker.expected_salary}/month</p>
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <h4>Experience & Skills</h4>
                        <p><strong>Experience:</strong> ${worker.experience_years} years</p>
                        <p><strong>Skills:</strong> ${worker.skills}</p>
                        
                        <h4>Recommendations</h4>
                        <p><strong>Reference 1:</strong> ${worker.recommendation1_name} - ${worker.recommendation1_phone}</p>
                        <p><strong>Reference 2:</strong> ${worker.recommendation2_name} - ${worker.recommendation2_phone}</p>
                        
                        <h4>National ID</h4>
                        <p><strong>ID Number:</strong> ${worker.national_id}</p>
                        ${worker.id_photo && worker.id_photo !== null && worker.id_photo !== '' ? `
                            <div class="id-photo-container">
                                <label><i class="fas fa-id-card"></i> Verified ID Document:</label>
                                <div class="id-photo-wrapper">
                                    <img src="${this.getImageUrl(worker.id_photo)}" alt="National ID" class="id-photo-preview" 
                                         onerror="this.style.display='none';this.nextElementSibling.style.display='block'; console.error('Failed to load ID photo:', this.src)">
                                    <div class="id-photo-error" style="display:none">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <p>ID photo could not be loaded</p>
                                        <small>Please contact support if this issue persists</small>
                                    </div>
                                </div>
                                <button class="btn btn-outline btn-sm" onclick="window.open('${this.getImageUrl(worker.id_photo)}', '_blank')">
                                    <i class="fas fa-expand"></i> View Full Size
                                </button>
                            </div>
                        ` : '<p class="no-photo"><i class="fas fa-info-circle"></i> ID photo not uploaded or verified.</p>'}
                    </div>
                    
                    <button class="btn btn-primary" onclick="authSystem.contactWorker('${worker.id}')">
                        <i class="fas fa-phone"></i> Contact Worker
                    </button>
                </div>
            `;
            
            document.getElementById('dashboardContent').innerHTML = profileHTML;
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    // Enhanced worker dashboard sections
    async getAvailableJobsSection() {
        try {
            const response = await apiService.getJobs();
            const jobs = response.jobs || [];

            const typeLabels = {
                'full-time': 'Full Time',
                'part-time': 'Part Time',
                'weekends': 'Weekends Only',
                'flexible': 'Flexible',
                'live-in': 'Live-in',
                'live-out': 'Live-out'
            };

            const typeColors = {
                'full-time': '#2563eb',
                'part-time': '#7c3aed',
                'weekends': '#d97706',
                'flexible': '#059669',
                'live-in': '#dc2626',
                'live-out': '#0891b2'
            };

            if (jobs.length === 0) {
                return `
                    <div class="jobs-section">
                        <div class="jobs-header">
                            <h2><i class="fas fa-briefcase"></i> Available Jobs</h2>
                            <span class="jobs-count">0 jobs found</span>
                        </div>
                        <div class="empty-state">
                            <i class="fas fa-briefcase"></i>
                            <h3>No Jobs Available</h3>
                            <p>There are no open job postings at the moment. Check back soon — new opportunities are added daily!</p>
                        </div>
                    </div>
                `;
            }

            const jobsHTML = jobs.map(job => {
                const typeKey = job.job_type || 'flexible';
                const typeLabel = typeLabels[typeKey] || typeKey;
                const typeColor = typeColors[typeKey] || '#2563eb';
                const salary = job.salary_range_min
                    ? `RWF ${Number(job.salary_range_min).toLocaleString()}${job.salary_range_max ? ' – ' + Number(job.salary_range_max).toLocaleString() : '+'}/mo`
                    : 'Negotiable';

                return `
                <article class="job-card-modern" data-type="${typeKey}" data-location="${(job.location || '').toLowerCase()}">
                    <div class="jcm-top">
                        <div class="jcm-icon">
                            <i class="fas fa-home"></i>
                        </div>
                        <div class="jcm-meta">
                            <h3 class="jcm-title">${job.title}</h3>
                            <span class="jcm-employer"><i class="fas fa-building"></i> ${job.employer_name || 'Private Employer'}</span>
                        </div>
                        <span class="jcm-badge" style="background:${typeColor}20;color:${typeColor};border:1.5px solid ${typeColor}40">${typeLabel}</span>
                    </div>

                    <div class="jcm-details">
                        <span class="jcm-detail"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Not specified'}</span>
                        <span class="jcm-detail jcm-salary"><i class="fas fa-coins"></i> ${salary}</span>
                    </div>

                    <p class="jcm-desc">${(job.description || '').substring(0, 130)}${(job.description || '').length > 130 ? '…' : ''}</p>

                    <div class="jcm-actions">
                        <button class="btn btn-primary jcm-btn-apply" onclick="authSystem.applyForJob('${job.id}')">
                            <i class="fas fa-paper-plane"></i> Apply Now
                        </button>
                        <button class="btn btn-outline jcm-btn-details" onclick="authSystem.viewJobDetails('${job.id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </div>
                </article>`;
            }).join('');

            return `
                <div class="jobs-section">
                    <div class="jobs-header">
                        <div>
                            <h2><i class="fas fa-briefcase"></i> Available Jobs</h2>
                            <p class="jobs-sub">Browse and apply for household worker positions near you</p>
                        </div>
                        <span class="jobs-count">${jobs.length} job${jobs.length !== 1 ? 's' : ''} found</span>
                    </div>

                    <div class="jobs-filter-bar">
                        <div class="jfb-input-wrap">
                            <i class="fas fa-search jfb-icon"></i>
                            <input type="text" id="jobSearchLocation" class="jfb-input" placeholder="Search by location…" oninput="authSystem.filterJobs()">
                        </div>
                        <select id="jobSearchType" class="jfb-select" onchange="authSystem.filterJobs()">
                            <option value="">All Types</option>
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="weekends">Weekends Only</option>
                            <option value="flexible">Flexible</option>
                            <option value="live-in">Live-in</option>
                            <option value="live-out">Live-out</option>
                        </select>
                    </div>

                    <div class="job-listings-modern" id="jobListings">
                        ${jobsHTML}
                    </div>
                </div>
            `;
        } catch (error) {
            return `
                <div class="jobs-section">
                    <h2>Available Jobs</h2>
                    <div class="alert alert-error">Failed to load jobs. Please try again.</div>
                </div>
            `;
        }
    }

    async getApplicationsSection() {
        try {
            const response = await apiService.getMyApplications();
            const apps = response.applications || [];
            
            const stats = {
                total: apps.length,
                pending: apps.filter(a => a.status === 'pending').length,
                accepted: apps.filter(a => a.status === 'accepted').length,
                rejected: apps.filter(a => a.status === 'rejected').length
            };

            const getStatusConfig = (status) => {
                const config = {
                    pending: {
                        color: '#f59e0b',
                        icon: 'fas fa-clock',
                        label: 'Pending',
                        message: 'Your application is currently being reviewed by the employer.',
                        msgIcon: 'fas fa-hourglass-half'
                    },
                    accepted: {
                        color: '#10b981',
                        icon: 'fas fa-check-circle',
                        label: 'Accepted',
                        message: 'Congratulations! You\'ve been accepted. Contact the employer for next steps.',
                        msgIcon: 'fas fa-trophy'
                    },
                    rejected: {
                        color: '#ef4444',
                        icon: 'fas fa-times-circle',
                        label: 'Declined',
                        message: 'This position was filled or you weren\'t selected. Keep looking!',
                        msgIcon: 'fas fa-info-circle'
                    }
                };
                return config[status] || config.pending;
            };

            const appsHTML = apps.length > 0 ? `
                <div class="modern-apps-container">
                    <!-- Filter Tabs -->
                    <div class="apps-filter-tabs">
                        <button class="filter-tab active" data-filter="all">All Applications <span>${stats.total}</span></button>
                        <button class="filter-tab" data-filter="pending">Pending <span>${stats.pending}</span></button>
                        <button class="filter-tab" data-filter="accepted">Accepted <span>${stats.accepted}</span></button>
                        <button class="filter-tab" data-filter="rejected">Rejected <span>${stats.rejected}</span></button>
                    </div>

                    <div class="modern-apps-list" id="modernAppsList">
                        ${apps.map(app => {
                            const config = getStatusConfig(app.status);
                            const appliedDate = new Date(app.applied_at);
                            const formattedDate = appliedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const daysAgo = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24));
                            const daysAgoText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
                            
                            return `
                            <div class="modern-app-card" data-status="${app.status}">
                                <div class="app-card-glass"></div>
                                <div class="app-card-content">
                                    <div class="app-card-main">
                                        <div class="app-info-group">
                                            <h3 class="app-job-title">${app.job_title}</h3>
                                            <div class="app-meta-grid">
                                                <span class="app-meta-item" title="Employer">
                                                    <i class="fas fa-building"></i> ${app.employer_name}
                                                </span>
                                                <span class="app-meta-item" title="Location">
                                                    <i class="fas fa-map-marker-alt"></i> ${app.job_location}
                                                </span>
                                                <span class="app-meta-item" title="Applied Date">
                                                    <i class="fas fa-calendar-alt"></i> ${formattedDate}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="app-status-side">
                                            <div class="modern-status-badge ${app.status}">
                                                <i class="${config.icon}"></i>
                                                <span>${config.label}</span>
                                            </div>
                                            <span class="app-relative-time">${daysAgoText}</span>
                                        </div>
                                    </div>
                                    <div class="app-card-footer">
                                        <div class="app-message-box ${app.status}">
                                            <i class="${config.msgIcon}"></i>
                                            <p>${config.message}</p>
                                        </div>
                                        <div class="app-actions">
                                            <button class="btn-text-action" onclick="authSystem.viewJobDetails('${app.job_id}')">
                                                Job Details <i class="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `}).join('')}
                    </div>
                </div>
            ` : `
                <div class="modern-empty-state">
                    <div class="empty-art">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <h3>Your Journey Starts Here</h3>
                    <p>You haven't applied to any jobs yet. Browse thousands of opportunities and find your perfect fit.</p>
                    <button class="btn btn-primary btn-large" onclick="showDashboardSection('jobs')">
                        Explore Opportunities
                    </button>
                </div>
            `;

            // Initialize filter event listeners after return
            setTimeout(() => {
                const tabs = document.querySelectorAll('.filter-tab');
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        const filter = tab.dataset.filter;
                        const cards = document.querySelectorAll('.modern-app-card');
                        cards.forEach(card => {
                            if (filter === 'all' || card.dataset.status === filter) {
                                card.style.display = 'block';
                                card.classList.add('fade-in');
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }, 100);

            return `
                <div class="modern-apps-page">
                    <header class="section-hero">
                        <div class="hero-text">
                            <h1>Application Portal</h1>
                            <p>Track your professional growth and upcoming opportunities</p>
                        </div>
                        <div class="hero-stats">
                            <div class="mini-stat">
                                <span class="num">${stats.total}</span>
                                <span class="lab">Total</span>
                            </div>
                            <div class="mini-stat pending">
                                <span class="num">${stats.pending}</span>
                                <span class="lab">Pending</span>
                            </div>
                            <div class="mini-stat accepted">
                                <span class="num">${stats.accepted}</span>
                                <span class="lab">Success</span>
                            </div>
                        </div>
                    </header>

                    <div class="content-body">
                        ${appsHTML}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load applications:', error);
            return `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Something went wrong</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-outline" onclick="showDashboardSection('applications')">Try Again</button>
                </div>
            `;
        }
    }

    getWorkerStatsSection() {
        return `
            <div class="ws-page">
                <div class="ws-header">
                    <h2><i class="fas fa-chart-bar"></i> My Performance</h2>
                    <p class="ws-sub">Track your growth and visibility on the platform</p>
                </div>
                
                <div class="ws-grid">
                    <div class="ws-card ws-card--blue">
                        <div class="ws-icon"><i class="fas fa-eye"></i></div>
                        <div class="ws-label">Profile Views</div>
                        <div class="ws-num">0</div>
                        <div class="ws-hint">Last 30 days</div>
                    </div>
                    
                    <div class="ws-card ws-card--orange">
                        <div class="ws-icon"><i class="fas fa-paper-plane"></i></div>
                        <div class="ws-label">Applications Sent</div>
                        <div class="ws-num">0</div>
                        <div class="ws-hint">Job applications</div>
                    </div>
                    
                    <div class="ws-card ws-card--purple">
                        <div class="ws-icon"><i class="fas fa-star"></i></div>
                        <div class="ws-label">Employer Reviews</div>
                        <div class="ws-num">0</div>
                        <div class="ws-hint">Average rating: 0.0</div>
                    </div>
                    
                    <div class="ws-card ws-card--green">
                        <div class="ws-icon"><i class="fas fa-award"></i></div>
                        <div class="ws-label">Profile Score</div>
                        <div class="ws-num">${this.currentUser?.profileComplete ? '100' : '25'}%</div>
                        <div class="ws-hint">Visibility strength</div>
                    </div>
                </div>

                <div class="ws-insights-card">
                    <div class="wsi-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="wsi-content">
                        <h3>Pro Tip: Increase your visibility</h3>
                        <p>Complete your profile with a professional photo and detailed recommendations to appear higher in employer search results.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Modern modal dialog system
    showModal(title, content, onConfirm, onCancel) {
        const modalHTML = `
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="authSystem.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="authSystem.closeModal()">Cancel</button>
                        <button class="btn btn-primary" id="modalConfirmBtn">Apply for Job</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Setup event handlers
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const overlay = document.getElementById('modalOverlay');
        
        confirmBtn.addEventListener('click', () => {
            const result = onConfirm();
            if (result !== false) {
                this.closeModal();
            }
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
                if (onCancel) onCancel();
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }
    
    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    // Job application methods
    async applyForJob(jobId) {
        try {
            console.log('=== APPLYING FOR JOB ===');
            console.log('Job ID:', jobId);
            console.log('User:', this.currentUser);
            
            // Check if user is logged in and is a worker
            if (!this.currentUser || this.currentUser.userType !== 'worker') {
                this.showAlert('Only workers can apply for jobs. Please log in as a worker.', 'error');
                return;
            }
            
            // Check if worker has completed profile
            if (!this.currentUser.profileComplete) {
                this.showAlert('Please complete your profile before applying for jobs.', 'error');
                return;
            }
            
            // Show modern application modal
            const modalContent = `
                <div class="job-application-form">
                    <div class="form-group">
                        <label for="coverLetter">Cover Letter (Optional)</label>
                        <textarea id="coverLetter" class="form-textarea" placeholder="Tell the employer why you're perfect for this job..." rows="5"></textarea>
                        <small class="form-help">Share your relevant experience and why you're interested in this position</small>
                    </div>
                </div>
            `;
            
            this.showModal(
                'Apply for Job',
                modalContent,
                () => {
                    const coverLetter = document.getElementById('coverLetter').value.trim();
                    this.submitJobApplication(jobId, coverLetter);
                },
                () => {
                    console.log('Application cancelled');
                }
            );
            
        } catch (error) {
            console.error('=== JOB APPLICATION FAILED ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            
            // Show specific error messages
            let errorMsg = error.message || 'Failed to apply for job';
            
            if (errorMsg.includes('already applied')) {
                errorMsg = 'You have already applied for this job.';
            } else if (errorMsg.includes('not found') || errorMsg.includes('not active')) {
                errorMsg = 'This job is no longer available.';
            } else if (errorMsg.includes('Only workers')) {
                errorMsg = 'Only workers can apply for jobs.';
            } else if (errorMsg.includes('Access token')) {
                errorMsg = 'Please log in again and try.';
            }
            
            this.showAlert(errorMsg, 'error');
        }
    }
    
    async submitJobApplication(jobId, coverLetter) {
        try {
            // Show loading state
            const confirmBtn = document.getElementById('modalConfirmBtn');
            const originalText = confirmBtn.innerHTML;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            confirmBtn.disabled = true;
            
            const response = await apiService.applyForJob(jobId, coverLetter);
            console.log('Application response:', response);
            
            this.showAlert('Application submitted successfully!', 'success');
            
            // Refresh job listings to update applied status
            this.showDashboardSection('jobs');
            
        } catch (error) {
            console.error('=== JOB APPLICATION SUBMISSION FAILED ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            
            // Show specific error messages
            let errorMsg = error.message || 'Failed to apply for job';
            
            if (errorMsg.includes('already applied')) {
                errorMsg = 'You have already applied for this job.';
            } else if (errorMsg.includes('not found') || errorMsg.includes('not active')) {
                errorMsg = 'This job is no longer available.';
            } else if (errorMsg.includes('Only workers')) {
                errorMsg = 'Only workers can apply for jobs.';
            } else if (errorMsg.includes('Access token')) {
                errorMsg = 'Please log in again and try.';
            }
            
            this.showAlert(errorMsg, 'error');
            
            // Reset button state
            const confirmBtn = document.getElementById('modalConfirmBtn');
            if (confirmBtn) {
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }
        }
    }

    async viewJobDetails(jobId) {
        try {
            const response = await apiService.getJobById(jobId);
            const job = response.job;
            
            const jobDetailsHTML = `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                    <p><i class="fas fa-clock"></i> ${job.job_type}</p>
                    <p><i class="fas fa-money-bill"></i> RWF ${job.salary_range_min || 'Negotiable'}${job.salary_range_max ? ` - ${job.salary_range_max}` : ''}/month</p>
                    <p><i class="fas fa-building"></i> Posted by: ${job.employer_name}</p>
                    
                    <div class="job-description">
                        <h4>Job Description</h4>
                        <p>${job.description}</p>
                    </div>
                    
                    ${job.requirements ? `
                        <div class="job-requirements">
                            <h4>Requirements</h4>
                            <p>${job.requirements}</p>
                        </div>
                    ` : ''}
                    
                    <div class="job-actions">
                        <button class="btn btn-primary" onclick="authSystem.applyForJob('${job.id}')">
                            <i class="fas fa-paper-plane"></i> Apply Now
                        </button>
                        <button class="btn btn-secondary" onclick="authSystem.getAvailableJobsSection()">
                            <i class="fas fa-arrow-left"></i> Back to Jobs
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('dashboardContent').innerHTML = jobDetailsHTML;
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    filterJobs() {
        const location = document.getElementById('jobSearchLocation').value.toLowerCase();
        const jobType = document.getElementById('jobSearchType').value;
        const jobCards = document.querySelectorAll('.job-card');
        
        jobCards.forEach(card => {
            const cardLocation = card.querySelector('.fa-map-marker-alt').parentElement.textContent.toLowerCase();
            const cardType = card.querySelector('.fa-clock').parentElement.textContent.toLowerCase().trim();
            
            const locationMatch = !location || cardLocation.includes(location);
            const typeMatch = !jobType || cardType.includes(jobType);
            
            card.style.display = locationMatch && typeMatch ? 'block' : 'none';
        });
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add color styles based on type
        switch(type) {
            case 'success':
                alertDiv.style.background = '#d1fae5';
                alertDiv.style.color = '#065f46';
                alertDiv.style.border = '1px solid #10b981';
                break;
            case 'error':
                alertDiv.style.background = '#fee2e2';
                alertDiv.style.color = '#991b1b';
                alertDiv.style.border = '1px solid #ef4444';
                break;
            default:
                alertDiv.style.background = '#dbeafe';
                alertDiv.style.color = '#1e40af';
                alertDiv.style.border = '1px solid #3b82f6';
        }
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Add animation styles if not already present
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Mobile sidebar toggle function
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    const body = document.body;
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('mobile-open');
        body.classList.toggle('sidebar-open');
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Test function for alerts (call from browser console: testAlerts())
window.testAlerts = function() {
    console.log('Testing alert system...');
    authSystem.showAlert('Success message test!', 'success');
    setTimeout(() => {
        authSystem.showAlert('Error message test!', 'error');
    }, 1000);
    setTimeout(() => {
        authSystem.showAlert('Info message test!', 'info');
    }, 2000);
};

// Test registration function (call from browser console: testRegistration())
window.testRegistration = async function() {
    console.log('Testing registration...');
    try {
        const result = await authSystem.register({
            name: 'Test User',
            email: 'test' + Date.now() + '@example.com',
            phone: '0755123456',
            password: 'password123'
        }, 'worker');
        console.log('Registration result:', result);
        authSystem.showAlert(result.message, result.success ? 'success' : 'error');
    } catch (error) {
        console.error('Registration error:', error);
        authSystem.showAlert(error.message, 'error');
    }
};

// Image preview function
function previewImage(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: 8px;">`;
        }
        reader.readAsDataURL(file);
    }
}
