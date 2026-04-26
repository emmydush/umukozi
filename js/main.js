// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize language switcher
    initLanguageSwitcher();
    
    // Check authentication state
    checkAuthState();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    // Create mobile menu button if it doesn't exist
    if (!document.querySelector('.mobile-menu-btn')) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.appendChild(mobileMenuBtn);
            
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }
    }
}

function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const headerRight = document.querySelector('.header-right');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
        if (nav) nav.classList.toggle('mobile-active');
        if (headerRight) headerRight.classList.toggle('mobile-active');
        
        const icon = mobileMenuBtn.querySelector('i');
        const isActive = nav && nav.classList.contains('mobile-active');
        
        if (isActive) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
}

// Unified Dashboard Sidebar Toggle
window.toggleMobileSidebar = function() {
    const sidebar = document.querySelector('.app-sidebar') || document.querySelector('.dashboard-sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }
}

// Check authentication state
function checkAuthState() {
    // Don't interfere with authSystem - let it handle dashboard display
    // Only update the homepage auth buttons if we're on the homepage
    setTimeout(() => {
        if (authSystem.currentUser && document.getElementById('app').style.display !== 'none') {
            updateAuthUI(true);
        }
    }, 500); // Give authSystem time to initialize
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        if (isLoggedIn && authSystem.currentUser) {
            const user = authSystem.currentUser;
            authButtons.innerHTML = `
                <span class="user-welcome">Welcome, ${user.name}</span>
                <button class="btn btn-outline" onclick="authSystem.logout()">Logout</button>
                <button class="btn btn-primary" onclick="authSystem.showDashboard()">Dashboard</button>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn btn-outline" onclick="showLogin()">Login</button>
                <button class="btn btn-primary" onclick="showRegister()">Register</button>
            `;
        }
    }
}

// Modal functions
function showModal(content) {
    const modal = document.getElementById('authModal');
    const authContent = document.getElementById('authContent');
    
    if (modal && authContent) {
        authContent.innerHTML = content;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Show login form
function showLogin() {
    const loginHTML = `
        <div class="auth-form">
            <h2>Login</h2>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full">Login</button>
            </form>
            
            <p class="auth-switch">
                Don't have an account? 
                <a href="#" onclick="showRegister()">Register here</a>
            </p>
        </div>
    `;
    
    showModal(loginHTML);
}

// Show registration form
function showRegister() {
    const registerHTML = `
        <div class="auth-form">
            <h2>Register</h2>
            <form id="registerForm" onsubmit="handleRegister(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="registerName">Full Name</label>
                        <input type="text" id="registerName" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerPhone">Phone Number</label>
                        <input type="tel" id="registerPhone" name="phone" placeholder="e.g., 0788123456" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" name="password" required minlength="6">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="userType">I am a:</label>
                    <select id="userType" name="userType" required>
                        <option value="">Select user type</option>
                        <option value="worker">Household Worker</option>
                        <option value="employer">Employer</option>
                    </select>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full">Register</button>
            </form>
            
            <p class="auth-switch">
                Already have an account? 
                <a href="#" onclick="showLogin()">Login here</a>
            </p>
        </div>
    `;
    
    showModal(registerHTML);
}

// Show worker registration form
function showWorkerRegister() {
    showRegister();
    // Pre-select worker type
    setTimeout(() => {
        const userTypeSelect = document.getElementById('userType');
        if (userTypeSelect) {
            userTypeSelect.value = 'worker';
        }
    }, 100);
}

// Show employer registration form
function showEmployerRegister() {
    showRegister();
    // Pre-select employer type
    setTimeout(() => {
        const userTypeSelect = document.getElementById('userType');
        if (userTypeSelect) {
            userTypeSelect.value = 'employer';
        }
    }, 100);
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('Attempting login with:', email);
    
    try {
        const result = await authSystem.login(email, password);
        console.log('Login result:', result);
        
        if (result.success) {
            closeModal();
            authSystem.showAlert(result.message, 'success');
            updateAuthUI(true);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                authSystem.showDashboard();
            }, 1000);
        } else {
            authSystem.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        authSystem.showAlert(error.message || 'Login failed. Please try again.', 'error');
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
    };
    
    const userType = formData.get('userType');
    
    console.log('Attempting registration:', { ...userData, userType });
    
    try {
        const result = await authSystem.register(userData, userType);
        console.log('Registration result:', result);
        
        if (result.success) {
            closeModal();
            authSystem.showAlert(result.message, 'success');
            
            // Auto-login after registration
            setTimeout(() => {
                updateAuthUI(true);
                authSystem.showDashboard();
            }, 1500);
        } else {
            authSystem.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        authSystem.showAlert(error.message || 'Registration failed. Please try again.', 'error');
    }
}

// Dashboard section switching
window.showDashboardSection = async function(section) {
    const buttons = document.querySelectorAll('.dashboard-nav button');
    
    // Deactivate all buttons
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Activate the button that matches the requested section
    const activeButton = Array.from(buttons).find(btn => {
        const clickAttr = btn.getAttribute('onclick') || '';
        return clickAttr.includes(`'${section}'`);
    });
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    const dashboardContent = document.getElementById('dashboardContent');
    const user = authSystem.currentUser;
    
    if (user.userType === 'worker') {
        switch(section) {
            case 'overview':
                dashboardContent.innerHTML = `
                    <div class="overview-page">
                        <div class="overview-welcome">
                            <div class="overview-avatar">${user.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <h2>Welcome back, ${user.name.split(' ')[0]}! 👋</h2>
                                <p>Here's a quick overview of your Umukozi account.</p>
                            </div>
                        </div>
                        <div class="overview-cards">
                            <div class="ov-card" onclick="showDashboardSection('profile')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#eff6ff;color:#2563eb"><i class="fas fa-user-circle"></i></div>
                                <div class="ov-body"><span class="ov-label">My Profile</span><span class="ov-hint">View &amp; edit your details</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('jobs')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#f0fdf4;color:#16a34a"><i class="fas fa-briefcase"></i></div>
                                <div class="ov-body"><span class="ov-label">Available Jobs</span><span class="ov-hint">Browse open positions</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('applications')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fff7ed;color:#ea580c"><i class="fas fa-paper-plane"></i></div>
                                <div class="ov-body"><span class="ov-label">My Applications</span><span class="ov-hint">Track your job applications</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('stats')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fdf4ff;color:#9333ea"><i class="fas fa-chart-line"></i></div>
                                <div class="ov-body"><span class="ov-label">Statistics</span><span class="ov-hint">Profile views &amp; activity</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                        </div>
                    </div>`;
                break;
            case 'profile':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading profile...</div>';
                if (authSystem.currentUser.profileComplete) {
                    dashboardContent.innerHTML = await authSystem.getWorkerProfileSection();
                } else {
                    dashboardContent.innerHTML = authSystem.getWorkerProfileForm();
                }
                break;
            case 'jobs':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Finding jobs...</div>';
                dashboardContent.innerHTML = await authSystem.getAvailableJobsSection();
                break;
            case 'applications':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading applications...</div>';
                dashboardContent.innerHTML = authSystem.getApplicationsSection();
                break;
            case 'stats':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Calculating stats...</div>';
                dashboardContent.innerHTML = authSystem.getWorkerStatsSection();
                break;
        }
    } else {
        switch(section) {
            case 'overview':
                dashboardContent.innerHTML = `
                    <div class="overview-page">
                        <div class="overview-welcome">
                            <div class="overview-avatar">${user.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <h2>Welcome back, ${user.name.split(' ')[0]}! 👋</h2>
                                <p>Here's a quick overview of your employer account.</p>
                            </div>
                        </div>
                        <div class="overview-cards">
                            <div class="ov-card" onclick="showDashboardSection('search')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#eff6ff;color:#2563eb"><i class="fas fa-users"></i></div>
                                <div class="ov-body"><span class="ov-label">Find Workers</span><span class="ov-hint">Search available workers</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('post')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#f0fdf4;color:#16a34a"><i class="fas fa-plus-circle"></i></div>
                                <div class="ov-body"><span class="ov-label">Post a Job</span><span class="ov-hint">Create a new job listing</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('manage')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fff7ed;color:#ea580c"><i class="fas fa-tasks"></i></div>
                                <div class="ov-body"><span class="ov-label">Manage Jobs</span><span class="ov-hint">Edit or deactivate listings</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('applications')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fdf4ff;color:#9333ea"><i class="fas fa-inbox"></i></div>
                                <div class="ov-body"><span class="ov-label">Applications</span><span class="ov-hint">Review incoming applications</span></div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                        </div>
                    </div>`;
                break;
            case 'search':
                dashboardContent.innerHTML = authSystem.getEmployerSearchSection();
                break;
            case 'post':
                dashboardContent.innerHTML = getPostJobSection();
                break;
            case 'applications':
                dashboardContent.innerHTML = getEmployerApplicationsSection();
                break;
            case 'manage':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading jobs…</div>';
                dashboardContent.innerHTML = await getManageJobsSection();
                break;
        }
    }
}


// Additional dashboard sections (placeholders for now)
function getAvailableJobsSection() {
    return `
        <div class="jobs-section">
            <h2>Available Jobs</h2>
            <div class="job-listings">
                <div class="job-card">
                    <h3>Housekeeper Needed</h3>
                    <p><i class="fas fa-map-marker-alt"></i> Kiyovu, Kigali</p>
                    <p><i class="fas fa-clock"></i> Full Time</p>
                    <p><i class="fas fa-money-bill"></i> RWF 60,000/month</p>
                    <button class="btn btn-primary">Apply Now</button>
                </div>
                
                <div class="job-card">
                    <h3>Nanny/Babysitter</h3>
                    <p><i class="fas fa-map-marker-alt"></i> Nyarutarama, Kigali</p>
                    <p><i class="fas fa-clock"></i> Part Time</p>
                    <p><i class="fas fa-money-bill"></i> RWF 40,000/month</p>
                    <button class="btn btn-primary">Apply Now</button>
                </div>
            </div>
        </div>
    `;
}

function getApplicationsSection() {
    return `
        <div class="applications-section">
            <h2>My Applications</h2>
            <p>You haven't applied to any jobs yet.</p>
        </div>
    `;
}

function getPostJobSection() {
    return `
        <div class="post-job-page">
            <div class="pj-header">
                <h2><i class="fas fa-plus-circle"></i> Post a New Job</h2>
                <p>Reach out to thousands of skilled workers in Kigali</p>
            </div>
            
            <div class="pj-container">
                <form id="postJobForm" onsubmit="postJob(event)" class="pj-form">
                    <div class="pj-grid">
                        <div class="form-group">
                            <label for="jobTitle">Job Title</label>
                            <div class="pj-input-wrap">
                                <i class="fas fa-heading pj-icon"></i>
                                <input type="text" id="jobTitle" class="pj-input" placeholder="e.g., Housekeeper, Nanny, Cook" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="jobLocation">Location</label>
                            <div class="pj-input-wrap">
                                <i class="fas fa-map-marker-alt pj-icon"></i>
                                <input type="text" id="jobLocation" class="pj-input" placeholder="e.g., Kiyovu, Kigali" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="jobType">Job Type</label>
                            <div class="pj-input-wrap">
                                <i class="fas fa-clock pj-icon"></i>
                                <select id="jobType" class="pj-select" required>
                                    <option value="">Select job type</option>
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="weekends">Weekends Only</option>
                                    <option value="flexible">Flexible</option>
                                    <option value="live-in">Live-in</option>
                                    <option value="go-home">Go After Work</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="jobSalary">Expected Salary (RWF/month)</label>
                            <div class="pj-input-wrap">
                                <i class="fas fa-coins pj-icon"></i>
                                <input type="number" id="jobSalary" class="pj-input" placeholder="e.g., 50000">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="jobDescription">Job Description</label>
                        <div class="pj-input-wrap pj-input-wrap--textarea">
                            <i class="fas fa-align-left pj-icon"></i>
                            <textarea id="jobDescription" class="pj-textarea" placeholder="Describe the job requirements, responsibilities, and any specific skills needed..." required></textarea>
                        </div>
                    </div>
                    
                    <div class="pj-actions">
                        <button type="submit" class="btn btn-primary pj-submit-btn">
                            <i class="fas fa-paper-plane"></i> Post Job Listing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function postJob(event) {
    event.preventDefault();
    
    const formElement = event.target;
    
    const title = document.getElementById('jobTitle').value.trim();
    const location = document.getElementById('jobLocation').value.trim();
    const job_type = document.getElementById('jobType').value;
    const description = document.getElementById('jobDescription').value.trim();
    const salary = document.getElementById('jobSalary').value;
    
    // Explicit validation as per user requirement
    if (!title || !location || !job_type || !description) {
        authSystem.showAlert('Title, description, location, and job type are required.', 'error');
        return;
    }
    
    const jobData = {
        title,
        location,
        job_type,
        salary_range_min: salary,
        description,
        employer_name: authSystem.currentUser?.name || 'Anonymous Employer'
    };
    
    try {
        const response = await apiService.createJob(jobData);
        
        // Show success message
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert('Job posted successfully!', 'success');
        } else {
            alert('Job posted successfully!');
        }
        
        // Clear form and redirect to manage jobs
        formElement.reset();
        showDashboardSection('manage');
        
    } catch (error) {
        // Show error message
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert(error.message, 'error');
        } else {
            alert('Error posting job: ' + error.message);
        }
    }
}

async function getManageJobsSection() {
    try {
        const response = await apiService.getEmployerJobs();
        const jobs = response.jobs || [];
        
        if (jobs.length === 0) {
            return `
                <div class="manage-jobs-section">
                    <h2>Manage My Jobs</h2>
                    <p>You haven't posted any jobs yet. <a href="#" onclick="showDashboardSection('post')">Post your first job</a> to start hiring!</p>
                </div>
            `;
        }
        
        const jobsHTML = jobs.map(job => `
            <div class="job-card ${job.is_active ? '' : 'inactive'}">
                <div class="job-header">
                    <h3>${job.title}</h3>
                    <span class="job-status ${job.is_active ? 'active' : 'inactive'}">
                        ${job.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                <p><i class="fas fa-clock"></i> ${job.job_type}</p>
                <p><i class="fas fa-money-bill"></i> RWF ${job.salary_range_min || 'Negotiable'}${job.salary_range_max ? ` - ${job.salary_range_max}` : ''}/month</p>
                <div class="job-description">
                    <p>${(job.description || '').substring(0, 100)}${(job.description || '').length > 100 ? '...' : ''}</p>
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="editJob('${job.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn ${job.is_active ? 'btn-warning' : 'btn-success'}" onclick="toggleJobStatus('${job.id}', ${!job.is_active})">
                        <i class="fas fa-${job.is_active ? 'pause' : 'play'}"></i> ${job.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteJob('${job.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="manage-jobs-section">
                <h2>Manage My Jobs</h2>
                <div class="job-stats">
                    <div class="stat-card">
                        <h3>${jobs.length}</h3>
                        <p>Total Jobs</p>
                    </div>
                    <div class="stat-card">
                        <h3>${jobs.filter(job => job.is_active).length}</h3>
                        <p>Active Jobs</p>
                    </div>
                    <div class="stat-card">
                        <h3>${jobs.filter(job => !job.is_active).length}</h3>
                        <p>Inactive Jobs</p>
                    </div>
                </div>
                <div class="job-listings">
                    ${jobsHTML}
                </div>
            </div>
        `;
    } catch (error) {
        return `
            <div class="manage-jobs-section">
                <h2>Manage My Jobs</h2>
                <div class="alert alert-error">Failed to load jobs. Please try again.</div>
            </div>
        `;
    }
}

function getEmployerApplicationsSection() {
    return `
        <div class="apps-page">

            <!-- Page Header -->
            <div class="apps-header">
                <div>
                    <h2><i class="fas fa-inbox"></i> Job Applications</h2>
                    <p class="apps-sub">Review and manage applications from workers for your job postings</p>
                </div>
            </div>

            <!-- Stat Cards -->
            <div class="apps-stats">
                <div class="apps-stat-card apps-stat-total">
                    <div class="apps-stat-icon"><i class="fas fa-layer-group"></i></div>
                    <div class="apps-stat-body">
                        <span class="apps-stat-num">0</span>
                        <span class="apps-stat-label">Total Received</span>
                    </div>
                </div>
                <div class="apps-stat-card apps-stat-pending">
                    <div class="apps-stat-icon"><i class="fas fa-hourglass-half"></i></div>
                    <div class="apps-stat-body">
                        <span class="apps-stat-num">0</span>
                        <span class="apps-stat-label">Awaiting Review</span>
                    </div>
                </div>
                <div class="apps-stat-card apps-stat-accepted">
                    <div class="apps-stat-icon"><i class="fas fa-user-check"></i></div>
                    <div class="apps-stat-body">
                        <span class="apps-stat-num">0</span>
                        <span class="apps-stat-label">Shortlisted</span>
                    </div>
                </div>
                <div class="apps-stat-card apps-stat-rejected">
                    <div class="apps-stat-icon"><i class="fas fa-user-times"></i></div>
                    <div class="apps-stat-body">
                        <span class="apps-stat-num">0</span>
                        <span class="apps-stat-label">Declined</span>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div class="apps-list">
                <div class="apps-empty">
                    <div class="apps-empty-art">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3>Your Inbox is Empty</h3>
                    <p>No applications have been received yet.<br>Post a new job or activate an existing listing to start receiving applications from workers.</p>
                    <button class="btn btn-primary" onclick="showDashboardSection('post')">
                        <i class="fas fa-plus-circle"></i> Post a New Job
                    </button>
                </div>
            </div>

        </div>
    `;
}

// Job management functions
async function editJob(jobId) {
    try {
        const response = await apiService.getJobById(jobId);
        const job = response.job;
        
        const editFormHTML = `
            <div class="post-job-section">
                <h2>Edit Job</h2>
                <form id="editJobForm" onsubmit="handleEditJob(event, '${jobId}')">
                    <div class="form-group">
                        <label for="editJobTitle">Job Title</label>
                        <input type="text" id="editJobTitle" value="${job.title}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editJobLocation">Location</label>
                        <input type="text" id="editJobLocation" value="${job.location}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editJobType">Job Type</label>
                        <select id="editJobType" required>
                            <option value="full-time" ${job.job_type === 'full-time' ? 'selected' : ''}>Full Time</option>
                            <option value="part-time" ${job.job_type === 'part-time' ? 'selected' : ''}>Part Time</option>
                            <option value="weekends" ${job.job_type === 'weekends' ? 'selected' : ''}>Weekends Only</option>
                            <option value="flexible" ${job.job_type === 'flexible' ? 'selected' : ''}>Flexible</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editJobSalary">Salary (RWF/month)</label>
                        <input type="number" id="editJobSalary" value="${job.salary_range_min || ''}" placeholder="e.g., 50000">
                    </div>
                    
                    <div class="form-group">
                        <label for="editJobDescription">Job Description</label>
                        <textarea id="editJobDescription" required>${job.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editJobRequirements">Requirements</label>
                        <textarea id="editJobRequirements" placeholder="List any specific requirements...">${job.requirements || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Update Job</button>
                        <button type="button" class="btn btn-secondary" onclick="showDashboardSection('manage')">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('dashboardContent').innerHTML = editFormHTML;
    } catch (error) {
        authSystem.showAlert('Failed to load job details', 'error');
    }
}

async function handleEditJob(event, jobId) {
    event.preventDefault();
    
    const title = document.getElementById('editJobTitle').value.trim();
    const location = document.getElementById('editJobLocation').value.trim();
    const job_type = document.getElementById('editJobType').value;
    const description = document.getElementById('editJobDescription').value.trim();
    const salary = document.getElementById('editJobSalary').value;
    const requirements = document.getElementById('editJobRequirements').value.trim();
    
    // Explicit validation
    if (!title || !location || !job_type || !description) {
        authSystem.showAlert('Title, description, location, and job type are required.', 'error');
        return;
    }
    
    const jobData = {
        title,
        location,
        job_type,
        salary_range_min: salary,
        description,
        requirements,
        is_active: true
    };
    
    try {
        await apiService.updateJob(jobId, jobData);
        authSystem.showAlert('Job updated successfully!', 'success');
        showDashboardSection('manage');
    } catch (error) {
        authSystem.showAlert(error.message, 'error');
    }
}

async function toggleJobStatus(jobId, isActive) {
    try {
        await apiService.updateJob(jobId, { isActive });
        authSystem.showAlert(`Job ${isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
        showDashboardSection('manage');
    } catch (error) {
        authSystem.showAlert(error.message, 'error');
    }
}

async function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        try {
            await apiService.deleteJob(jobId);
            authSystem.showAlert('Job deleted successfully!', 'success');
            showDashboardSection('manage');
        } catch (error) {
            authSystem.showAlert(error.message, 'error');
        }
    }
}

// Add CSS for mobile responsiveness
const mobileCSS = `
@media (max-width: 768px) {
    .mobile-menu-btn {
        display: block;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #2563eb;
        cursor: pointer;
    }
    
    .nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .nav.mobile-active {
        display: flex;
    }
    
    .nav-link {
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .user-welcome {
        display: none;
    }
    
    .auth-buttons {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .btn {
        font-size: 0.9rem;
        padding: 0.6rem 1.2rem;
    }
}

@media (min-width: 769px) {
    .mobile-menu-btn {
        display: none;
    }
}
`;

// Language Switcher Functionality
function initLanguageSwitcher() {
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    const langDisplay = document.getElementById('langDisplay');
    const langOptions = document.querySelectorAll('.lang-option');
    
    // Toggle language menu
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        langMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function() {
        langMenu.classList.remove('active');
    });
    
    // Handle language selection
    langOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');
            const selectedText = this.textContent;
            
            // Update display
            langDisplay.textContent = selectedLang.toUpperCase();
            
            // Store preference
            localStorage.setItem('selectedLanguage', selectedLang);
            
            // Close menu
            langMenu.classList.remove('active');
            
            // Here you would typically implement actual language switching
            console.log('Language switched to:', selectedLang);
            
            // For now, just show a notification
            showNotification(`Language switched to ${selectedText}`);
        });
    });
    
    // Load saved language preference
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
        langDisplay.textContent = savedLang.toUpperCase();
    }
}

// Simple notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'language-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Inject mobile CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileCSS;
document.head.appendChild(styleSheet);
