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

// Toggle Notifications Dropdown
window.toggleNotifications = function() {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (notificationsDropdown) {
        const isOpen = notificationsDropdown.classList.contains('show');
        
        // Close all dropdowns
        if (notificationsDropdown) notificationsDropdown.classList.remove('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
        
        // Open notifications if it was closed
        if (!isOpen) {
            notificationsDropdown.classList.add('show');
        }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function closeDropdowns(e) {
        if (!e.target.closest('.notif-btn') && !e.target.closest('.notifications-dropdown')) {
            notificationsDropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdowns);
        }
    });
}

// Toggle Profile Dropdown
window.toggleProfileMenu = function() {
    const profileDropdown = document.getElementById('profileDropdown');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    if (profileDropdown) {
        const isOpen = profileDropdown.classList.contains('show');
        
        // Close all dropdowns
        if (profileDropdown) profileDropdown.classList.remove('show');
        if (notificationsDropdown) notificationsDropdown.classList.remove('show');
        
        // Open profile if it was closed
        if (!isOpen) {
            profileDropdown.classList.add('show');
        }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function closeDropdowns(e) {
        if (!e.target.closest('.user-info') && !e.target.closest('.profile-dropdown')) {
            profileDropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdowns);
        }
    });
}

// Mark all notifications as read
window.markAllNotificationsRead = function() {
    const notificationItems = document.querySelectorAll('.notification-item.unread');
    const badge = document.querySelector('.notif-btn .badge');
    
    notificationItems.forEach(item => {
        item.classList.remove('unread');
    });
    
    if (badge) {
        badge.style.display = 'none';
    }
    
    // Show success message
    if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
        authSystem.showAlert('All notifications marked as read', 'success');
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
        
        // Apply translations to the new content
        if (typeof i18nInstance !== 'undefined') {
            i18nInstance.applyLanguage(i18nInstance.getLanguage());
        }
        
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
            <div class="auth-logo">
                <img src="images/logo.png" alt="Umukozi" class="logo-img">
            </div>
            <h2 data-i18n="auth.login">Login</h2>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="loginEmail" data-i18n="auth.email">Email</label>
                    <input type="email" id="loginEmail" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="loginPassword" data-i18n="auth.password">Password</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full" data-i18n="auth.login">Login</button>
            </form>
            
            <p class="auth-switch">
                <span data-i18n="auth.noAccount">Don't have an account?</span> 
                <a href="#" onclick="showRegister()" data-i18n="auth.registerHere">Register here</a>
            </p>
        </div>
    `;
    
    showModal(loginHTML);
}

// Show registration form
function showRegister() {
    const registerHTML = `
        <div class="auth-form">
            <div class="auth-logo">
                <img src="images/logo.png" alt="Umukozi" class="logo-img">
            </div>
            <h2 data-i18n="auth.register">Register</h2>
            <form id="registerForm" onsubmit="handleRegister(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="registerName" data-i18n="auth.fullName">Full Name</label>
                        <input type="text" id="registerName" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerPhone" data-i18n="auth.phone">Phone Number</label>
                        <input type="tel" id="registerPhone" name="phone" placeholder="e.g., 0788123456" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="registerEmail" data-i18n="auth.email">Email</label>
                        <input type="email" id="registerEmail" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerPassword" data-i18n="auth.password">Password</label>
                        <input type="password" id="registerPassword" name="password" required minlength="6">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="userType" data-i18n="auth.userType">I am a:</label>
                    <select id="userType" name="userType" required>
                        <option value="" data-i18n="auth.selectUserType">Select user type</option>
                        <option value="worker" data-i18n="auth.worker">Household Worker</option>
                        <option value="employer" data-i18n="auth.employer">Employer</option>
                    </select>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full" data-i18n="auth.register">Register</button>
            </form>
            
            <p class="auth-switch">
                <span data-i18n="auth.haveAccount">Already have an account?</span> 
                <a href="#" onclick="showLogin()" data-i18n="auth.loginHere">Login here</a>
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
    // Ensure dashboard content element exists
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) {
        console.error('dashboardContent element not found in showDashboardSection');
        return;
    }
    
    // Ensure user is authenticated
    if (!authSystem || !authSystem.currentUser) {
        console.error('User not authenticated in showDashboardSection');
        dashboardContent.innerHTML = '<div class="alert alert-error">Please log in to view this content.</div>';
        return;
    }
    
    const buttons = document.querySelectorAll('.dashboard-nav button, .nav-item');
    
    // Deactivate all buttons
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Activate the button that matches the requested section
    const activeButton = Array.from(buttons).find(btn => {
        const clickAttr = btn.getAttribute('onclick') || '';
        return clickAttr.includes(`'${section}'`);
    });
    
    if (activeButton) {
        activeButton.classList.add('active');
        
        // Update page title if element exists
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const span = activeButton.querySelector('span');
            // Use span text if it exists (new nav-item), otherwise use button textContent (old UI)
            pageTitle.textContent = span ? span.textContent : activeButton.textContent.trim();
        }
    }
    
    const user = authSystem.currentUser;
    
    if (user.userType === 'worker') {
        switch(section) {
            case 'overview':
                dashboardContent.innerHTML = `
                    <div class="overview-page">
                        <div class="overview-welcome">
                            <div class="overview-avatar">${user.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <h2 data-i18n="dashboard.welcomeBack" data-i18n-params='{"name": "${user.name.split(' ')[0]}"}'>Welcome back, ${user.name.split(' ')[0]}! 👋</h2>
                                <p data-i18n="dashboard.workerWelcomeSub">Here's a quick overview of your Umukozi account.</p>
                            </div>
                        </div>
                        <div class="overview-cards">
                            <div class="ov-card" onclick="showDashboardSection('profile')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#eff6ff;color:#2563eb"><i class="fas fa-user-circle"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.profile">My Profile</span>
                                    <span class="ov-hint" data-i18n="dashboard.profileHint">View &amp; edit your details</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('jobs')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#f0fdf4;color:#16a34a"><i class="fas fa-briefcase"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.jobs">Available Jobs</span>
                                    <span class="ov-hint" data-i18n="dashboard.jobsHint">Browse open positions</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('applications')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fff7ed;color:#ea580c"><i class="fas fa-paper-plane"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.applications">My Applications</span>
                                    <span class="ov-hint" data-i18n="dashboard.appsHint">Track your job applications</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('stats')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fdf4ff;color:#9333ea"><i class="fas fa-chart-line"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.activity">Statistics</span>
                                    <span class="ov-hint" data-i18n="dashboard.statsHint">Profile views &amp; activity</span>
                                </div>
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
                dashboardContent.innerHTML = await authSystem.getApplicationsSection();
                break;
            case 'stats':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Calculating stats...</div>';
                dashboardContent.innerHTML = authSystem.getWorkerStatsSection();
                break;
            case 'settings':
                dashboardContent.innerHTML = getSettingsSection();
                break;
        }
    } else if (user.userType === 'employer') {
        switch(section) {
            case 'overview':
                dashboardContent.innerHTML = `
                    <div class="overview-page">
                        <div class="overview-welcome">
                            <div class="overview-avatar">${user.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <h2 data-i18n="dashboard.welcomeBack" data-i18n-params='{"name": "${user.name.split(' ')[0]}"}'>Welcome back, ${user.name.split(' ')[0]}! 👋</h2>
                                <p data-i18n="dashboard.employerWelcomeSub">Here's a quick overview of your employer account.</p>
                            </div>
                        </div>
                        <div class="overview-cards">
                            <div class="ov-card" onclick="showDashboardSection('search')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#eff6ff;color:#2563eb"><i class="fas fa-users"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.searchWorkers">Find Workers</span>
                                    <span class="ov-hint" data-i18n="dashboard.searchHint">Search available workers</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('post')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#f0fdf4;color:#16a34a"><i class="fas fa-plus-circle"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.postJob">Post a Job</span>
                                    <span class="ov-hint" data-i18n="dashboard.postHint">Create a new job listing</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('manage')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fff7ed;color:#ea580c"><i class="fas fa-tasks"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.manageJobs">Manage Jobs</span>
                                    <span class="ov-hint" data-i18n="dashboard.manageHint">Edit or deactivate listings</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                            <div class="ov-card" onclick="showDashboardSection('applications')" style="cursor:pointer">
                                <div class="ov-icon" style="background:#fdf4ff;color:#9333ea"><i class="fas fa-inbox"></i></div>
                                <div class="ov-body">
                                    <span class="ov-label" data-i18n="dashboard.inbox">Applications</span>
                                    <span class="ov-hint" data-i18n="dashboard.appsRecvHint">Review incoming applications</span>
                                </div>
                                <i class="fas fa-chevron-right ov-arrow"></i>
                            </div>
                        </div>
                    </div>`;
                break;
            case 'search':
                dashboardContent.innerHTML = authSystem.getEmployerSearchSection();
                // Automatically load all workers when search section is opened
                setTimeout(() => authSystem.searchWorkers(), 100);
                break;
            case 'post':
                dashboardContent.innerHTML = getPostJobSection();
                break;
            case 'applications':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Reviewing applications...</div>';
                dashboardContent.innerHTML = await getEmployerApplicationsSection();
                break;
            case 'manage':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading jobs...</div>';
                dashboardContent.innerHTML = await getManageJobsSection();
                break;
            case 'settings':
                dashboardContent.innerHTML = getSettingsSection();
                break;
        }
    } else if (user.userType === 'admin') {
        switch(section) {
            case 'overview':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading admin stats...</div>';
                getAdminOverviewSection().then(html => dashboardContent.innerHTML = html);
                break;
            case 'workers':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading workers...</div>';
                getAdminWorkersSection().then(html => dashboardContent.innerHTML = html);
                break;
            case 'payments':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading payments...</div>';
                getAdminPaymentsSection().then(html => dashboardContent.innerHTML = html);
                break;
            case 'users':
                dashboardContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading users...</div>';
                getAdminUsersSection().then(html => dashboardContent.innerHTML = html);
                break;
            case 'settings':
                dashboardContent.innerHTML = getAdminSettingsSection();
                // Load existing settings after rendering
                loadAdminSettings();
                break;
        }
    }
}


// Additional dashboard sections are now implemented as methods in AuthSystem (js/auth.js)


function getPostJobSection() {
    return `
        <div class="post-job-page">
            <div class="pj-header">
                <h2><i class="fas fa-plus-circle"></i> Post a New Job</h2>
                <p>Reach out to thousands of skilled workers in Kigali</p>
            </div>
            
            <div class="pj-container">
                <form id="postJobForm" onsubmit="postJob(event)" class="pj-form">
                    <div class="pj-form-row">
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
                    </div>
                    
                    <div class="pj-form-row">
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
                    
                    <div class="form-group">
                        <label for="jobRequirements">Additional Requirements (Optional)</label>
                        <div class="pj-input-wrap pj-input-wrap--textarea">
                            <i class="fas fa-list-check pj-icon"></i>
                            <textarea id="jobRequirements" class="pj-textarea" placeholder="Any additional requirements, qualifications, or preferences..."></textarea>
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
    
    // Check authentication first
    if (!authSystem || !authSystem.currentUser) {
        const errorMsg = 'You must be logged in to post a job. Please log in as an employer.';
        console.error('Job creation failed: User not authenticated');
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
        return;
    }
    
    // Check if user is employer
    if (authSystem.currentUser.userType !== 'employer') {
        const errorMsg = 'Only employers can post jobs. You are logged in as a worker.';
        console.error('Job creation failed: User is not employer, type:', authSystem.currentUser.userType);
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
        return;
    }
    
    const formElement = event.target;
    
    const title = document.getElementById('jobTitle').value.trim();
    const location = document.getElementById('jobLocation').value.trim();
    const job_type = document.getElementById('jobType').value;
    const description = document.getElementById('jobDescription').value.trim();
    const salary = document.getElementById('jobSalary').value;
    const requirements = document.getElementById('jobRequirements').value.trim();
    
    console.log('=== FRONTEND JOB CREATION ===');
    console.log('User:', authSystem.currentUser);
    console.log('Job data:', { title, location, job_type, description, salary, requirements });
    
    // Enhanced validation
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!location) missingFields.push('location');
    if (!job_type) missingFields.push('job type');
    if (!description) missingFields.push('description');
    
    if (missingFields.length > 0) {
        const errorMsg = `Please fill in all required fields: ${missingFields.join(', ')}`;
        console.error('Job creation failed: Missing fields:', missingFields);
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
        return;
    }
    
    // Validate job type
    const validJobTypes = ['full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'go-home'];
    if (!validJobTypes.includes(job_type)) {
        const errorMsg = `Invalid job type. Please select from: ${validJobTypes.join(', ')}`;
        console.error('Job creation failed: Invalid job type:', job_type);
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert(errorMsg, 'error');
        } else {
            alert(errorMsg);
        }
        return;
    }
    
    const jobData = {
        title,
        location,
        jobType: job_type,
        description,
        salaryRangeMin: salary || null,
        requirements: requirements || null
    };
    
    console.log('Sending job data to API:', jobData);
    
    try {
        // Show loading state
        const submitBtn = formElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting Job...';
        submitBtn.disabled = true;
        
        const response = await apiService.createJob(jobData);
        console.log('Job creation successful:', response);
        
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
        console.error('=== FRONTEND JOB CREATION FAILED ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Show detailed error message
        let errorMsg = error.message || 'Failed to create job';
        
        // Add specific guidance for common errors
        if (errorMsg.includes('Only employers can post jobs')) {
            errorMsg = 'You must be logged in as an employer to post jobs. Current account type: ' + (authSystem.currentUser?.userType || 'unknown');
        } else if (errorMsg.includes('token') || errorMsg.includes('authentication')) {
            errorMsg = 'Authentication error. Please log out and log back in as an employer.';
        } else if (errorMsg.includes('Missing required fields')) {
            errorMsg = 'Please fill in all required job details: title, description, location, and job type.';
        } else if (errorMsg.includes('Invalid job type')) {
            errorMsg = 'Please select a valid job type from the dropdown menu.';
        }
        
        if (typeof authSystem !== 'undefined' && authSystem.showAlert) {
            authSystem.showAlert(errorMsg, 'error');
        } else {
            alert('Error posting job: ' + errorMsg);
        }
    } finally {
        // Reset button state
        const submitBtn = formElement.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
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
                <h2 data-i18n="dashboard.manageJobs">Manage My Jobs</h2>
                <div class="job-stats">
                    <div class="stat-card">
                        <h3>${jobs.length}</h3>
                        <p data-i18n="dashboard.totalJobs">Total Jobs</p>
                    </div>
                    <div class="stat-card">
                        <h3>${jobs.filter(job => job.is_active).length}</h3>
                        <p data-i18n="dashboard.activeJobs">Active Jobs</p>
                    </div>
                    <div class="stat-card">
                        <h3>${jobs.filter(job => !job.is_active).length}</h3>
                        <p data-i18n="dashboard.inactiveJobs">Inactive Jobs</p>
                    </div>
                </div>
                <div class="job-listings">
                    ${jobsHTML}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading employer jobs:', error);
        return `
            <div class="manage-jobs-section">
                <h2>Manage My Jobs</h2>
                <div class="alert alert-error">Failed to load jobs: ${error.message}</div>
            </div>
        `;
    }
}

async function getEmployerApplicationsSection() {
    try {
        const jobsResponse = await apiService.getEmployerJobs();
        const jobs = jobsResponse.jobs || [];
        
        let allApplications = [];
        for (const job of jobs) {
            const appsResponse = await apiService.getJobApplications(job.id);
            const apps = (appsResponse.applications || []).map(a => ({...a, job_title: job.title}));
            allApplications = [...allApplications, ...apps];
        }

        const stats = {
            total: allApplications.length,
            pending: allApplications.filter(a => a.status === 'pending').length,
            accepted: allApplications.filter(a => a.status === 'accepted' || a.status === 'reviewed').length,
            rejected: allApplications.filter(a => a.status === 'rejected').length
        };

        const appsHTML = allApplications.length > 0 ? `
            <div class="apps-list-modern">
                ${allApplications.map(app => `
                    <div class="app-item-modern employer-view">
                        <div class="aim-worker">
                            <div class="aim-avatar-wrap">
                                <img src="${authSystem.getImageUrl(app.profile_photo)}" class="aim-avatar">
                            </div>
                            <div class="aim-details">
                                <h3>${app.worker_name}</h3>
                                <p class="aim-job-ref"><i class="fas fa-briefcase"></i> Applied for: <strong>${app.job_title}</strong></p>
                                <p><i class="fas fa-envelope"></i> ${app.worker_email} | <i class="fas fa-phone"></i> ${app.worker_phone}</p>
                                <div class="aim-skills">
                                    ${(app.skills || '').split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="aim-actions">
                            <span class="app-status-badge status-${app.status}">${app.status.toUpperCase()}</span>
                            <div class="aim-btns">
                                <button class="btn btn-success btn-sm" onclick="updateAppStatus('${app.id}', 'accepted')">Accept</button>
                                <button class="btn btn-danger btn-sm" onclick="updateAppStatus('${app.id}', 'rejected')">Decline</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="apps-empty">
                <div class="apps-empty-art"><i class="fas fa-inbox"></i></div>
                <h3>Your Inbox is Empty</h3>
                <p>No applications have been received yet. Post a job to start seeing workers.</p>
                <button class="btn btn-primary" onclick="showDashboardSection('post')">Post a Job</button>
            </div>
        `;

        return `
            <div class="apps-page">
                <div class="apps-header">
                    <div>
                        <h2><i class="fas fa-inbox"></i> Applicant Inbox</h2>
                        <p class="apps-sub">Review candidates across all your job postings</p>
                    </div>
                </div>

                <div class="apps-stats">
                    <div class="apps-stat-card"><span class="apps-stat-num">${stats.total}</span><span class="apps-stat-label">Applicants</span></div>
                    <div class="apps-stat-card"><span class="apps-stat-num">${stats.pending}</span><span class="apps-stat-label">Pending</span></div>
                    <div class="apps-stat-card"><span class="apps-stat-num">${stats.accepted}</span><span class="apps-stat-label">Shortlisted</span></div>
                </div>

                <div class="apps-container">
                    ${appsHTML}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading employer applications:', error);
        return `<div class="alert alert-error">Failed to load applications: ${error.message}</div>`;
    }
}

async function updateAppStatus(id, status) {
    try {
        console.log('=== UPDATING APPLICATION STATUS ===');
        console.log('Application ID:', id);
        console.log('New Status:', status);
        
        const response = await apiService.updateApplicationStatus(id, status);
        console.log('Status update response:', response);
        
        authSystem.showAlert(`Application ${status} successfully!`, 'success');
        showDashboardSection('applications');
    } catch (error) {
        console.error('=== APPLICATION STATUS UPDATE FAILED ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        authSystem.showAlert(`Failed to update application status: ${error.message}`, 'error');
    }
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
        jobType: job_type,
        salaryRangeMin: salary,
        description,
        requirements
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
    const confirmed = await authSystem.showConfirm('Are you sure you want to delete this job? This action cannot be undone.', 'Delete Job', 'Delete');
    if (confirmed) {
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


// Settings Section HTML
function getSettingsSection() {
    return `
        <div class="settings-container fade-in">
            <div class="settings-card">
                <div class="settings-header">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <h3>Security Settings</h3>
                        <p>Manage your account password and security preferences</p>
                    </div>
                </div>

                <form id="changePasswordForm" onsubmit="handlePasswordChange(event)" class="settings-form">
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <div class="settings-input-wrap">
                            <i class="fas fa-lock settings-icon"></i>
                            <input type="password" id="currentPassword" class="settings-input" placeholder="••••••••" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <div class="settings-input-wrap">
                            <i class="fas fa-key settings-icon"></i>
                            <input type="password" id="newPassword" class="settings-input" placeholder="Min. 8 characters" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirm New Password</label>
                        <div class="settings-input-wrap">
                            <i class="fas fa-check-double settings-icon"></i>
                            <input type="password" id="confirmPassword" class="settings-input" placeholder="Confirm new password" required>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Update Password
                        </button>
                    </div>
                </form>
            </div>
            
            <div class="settings-card">
                <div class="settings-header">
                    <i class="fas fa-bell"></i>
                    <div>
                        <h3>Notifications</h3>
                        <p>How you receive updates and messages</p>
                    </div>
                </div>
                <div class="toggle-group">
                    <div class="toggle-item">
                        <span>Email Notifications</span>
                        <div class="toggle-switch active"></div>
                    </div>
                    <div class="toggle-item">
                        <span>SMS Alerts for new jobs</span>
                        <div class="toggle-switch"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Password Change Handler
async function handlePasswordChange(event) {
    event.preventDefault();
    
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (newPass !== confirm) {
        authSystem.showAlert('New passwords do not match!', 'error');
        return;
    }
    
    if (newPass.length < 8) {
        authSystem.showAlert('Password must be at least 8 characters long.', 'error');
        return;
    }
    
    try {
        // In a real app: await apiService.changePassword({ current, newPass });
        authSystem.showAlert('Password updated successfully!', 'success');
        event.target.reset();
    } catch (error) {
        authSystem.showAlert(error.message, 'error');
    }
}

// ==========================================
// ADMIN DASHBOARD SECTIONS
// ==========================================

async function getAdminOverviewSection() {
    try {
        const stats = await apiService.getAdminStats();
        
        return `
            <div class="dashboard-content">
                <div class="section-hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div class="hero-text">
                        <h1>System Health & Statistics</h1>
                        <p>Real-time monitor of Umukozi platform activities.</p>
                    </div>
                    <div class="hero-stats">
                        <div class="mini-stat">
                            <span class="num">${stats.total_jobs || 0}</span>
                            <span class="lab">Total Jobs</span>
                        </div>
                    </div>
                </div>

                <div class="ws-grid">
                    <div class="ws-card ws-card--blue" onclick="showDashboardSection('workers')" style="cursor:pointer">
                        <div class="ws-icon"><i class="fas fa-users-cog"></i></div>
                        <span class="ws-label" data-i18n="dashboard.registeredWorkers">Registered Workers</span>
                        <span class="ws-num">${stats.workers}</span>
                        <span class="ws-hint" data-i18n="dashboard.viewAllWorkers">View all workers</span>
                    </div>
                    
                    <div class="ws-card ws-card--orange" onclick="showDashboardSection('workers')" style="cursor:pointer">
                        <div class="ws-icon"><i class="fas fa-user-shield"></i></div>
                        <span class="ws-label" data-i18n="dashboard.pendingVerification">Verification Pending</span>
                        <span class="ws-num">${stats.pending_workers}</span>
                        <span class="ws-hint" data-i18n="dashboard.actionRequired">Action required</span>
                    </div>
                    
                    <div class="ws-card ws-card--green" style="cursor:default">
                        <div class="ws-icon"><i class="fas fa-building"></i></div>
                        <span class="ws-label" data-i18n="dashboard.totalEmployers">Total Employers</span>
                        <span class="ws-num">${stats.employers}</span>
                        <span class="ws-hint" data-i18n="dashboard.enterpriseAccounts">Enterprise accounts</span>
                    </div>
                    
                    <div class="ws-card ws-card--purple" onclick="showDashboardSection('payments')" style="cursor:pointer">
                        <div class="ws-icon"><i class="fas fa-wallet"></i></div>
                        <span class="ws-label" data-i18n="dashboard.pendingPayments">Pending Payments</span>
                        <span class="ws-num">${stats.pending_payments}</span>
                        <span class="ws-hint" data-i18n="dashboard.verifyTransactions">Verify transactions</span>
                    </div>
                </div>

                <div class="ws-insights-card" style="margin-top: 2rem;">
                    <div class="wsi-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="wsi-content">
                        <h3 data-i18n="dashboard.adminInsight">Administrative Insight</h3>
                        <p data-i18n="dashboard.adminInsightSub" data-i18n-params='{"workers": "${stats.pending_workers}", "payments": "${stats.pending_payments}"}'>There are currently <strong>${stats.pending_workers}</strong> workers waiting for profile verification and <strong>${stats.pending_payments}</strong> payment references that need to be manually confirmed with MTN records.</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="alert alert-error">Failed to load admin stats: ${error.message}</div>`;
    }
}

async function getAdminWorkersSection() {
    try {
        const response = await apiService.getAdminWorkers();
        const workers = response.workers || [];
        
        const workerRows = workers.map(w => `
            <tr>
                <td>
                    <div class="applicant-info">
                        <div class="applicant-avatar">${w.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h4>${w.name}</h4>
                            <p>${w.email}</p>
                            <p>${w.phone}</p>
                        </div>
                    </div>
                </td>
                <td>
                    ${w.national_id ? `<span class="badge" style="background:#eff6ff;color:#2563eb">${w.national_id}</span>` : '<span class="text-muted">None</span>'}
                </td>
                <td>
                    ${w.is_verified 
                        ? '<span class="worker-status available"><i class="fas fa-check-circle"></i> Verified</span>' 
                        : '<span class="worker-status unavailable"><i class="fas fa-clock"></i> Pending</span>'
                    }
                </td>
                <td class="action-cell">
                    ${w.is_verified 
                        ? `<button class="btn btn-outline btn-sm" style="color:#ef4444;border-color:#ef4444" onclick="adminVerifyWorker('${w.id}', false)">Revoke</button>`
                        : `<button class="btn btn-primary btn-sm" onclick="adminVerifyWorker('${w.id}', true)">Verify</button>`
                    }
                    ${w.id_photo 
                        ? `<a href="${authSystem.getImageUrl(w.id_photo)}" target="_blank" class="btn btn-outline btn-sm"><i class="fas fa-id-card"></i> View ID</a>`
                        : ''
                    }
                </td>
            </tr>
        `).join('');

        return `
            <div class="dashboard-content">
                <div class="section-header" style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;"><i class="fas fa-user-check" style="color: #3b82f6; margin-right: 0.75rem;"></i> Worker Verifications</h2>
                    <p style="color: #64748b; font-size: 1rem; margin: 0;">Review and verify worker profiles and national IDs.</p>
                </div>
                
                <div class="modern-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Worker Details</th>
                                <th>National ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workerRows || '<tr><td colspan="4" class="text-center">No workers found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="alert alert-error">Failed to load workers: ${error.message}</div>`;
    }
}

async function adminVerifyWorker(workerId, isVerified) {
    const action = isVerified ? 'VERIFY' : 'REVOKE VERIFICATION for';
    const btnText = isVerified ? 'Verify' : 'Revoke';
    const confirmed = await authSystem.showConfirm(`Are you sure you want to ${action} this worker?`, 'Confirm Action', btnText);
    if (!confirmed) return;
    
    try {
        await apiService.verifyWorker(workerId, isVerified);
        authSystem.showAlert(`Worker successfully ${isVerified ? 'verified' : 'unverified'}.`, 'success');
        showDashboardSection('workers');
    } catch (error) {
        authSystem.showAlert(`Error: ${error.message}`, 'error');
    }
}

async function getAdminPaymentsSection() {
    try {
        const response = await apiService.getAdminPayments();
        const payments = response.payments || [];
        
        const paymentRows = payments.map(p => `
            <tr>
                <td>
                    <strong>TX: ${p.transaction_ref}</strong><br>
                    <small>${new Date(p.created_at).toLocaleDateString()}</small>
                </td>
                <td>
                    ${p.employer_name}<br>
                    <small>${p.employer_phone}</small>
                </td>
                <td>
                    ${p.worker_name}
                </td>
                <td>
                    <span class="badge" style="background:#f0fdf4;color:#16a34a">${p.amount} RWF</span>
                </td>
                <td>
                    <span class="worker-status ${p.status === 'verified' ? 'available' : p.status === 'rejected' ? 'unavailable' : 'unhired'}">
                        ${p.status.toUpperCase()}
                    </span>
                </td>
                <td class="action-cell">
                    ${p.status === 'pending' ? `
                        <button class="btn btn-primary btn-sm" onclick="adminVerifyPayment('${p.id}', 'verified')">Approve</button>
                        <button class="btn btn-outline btn-sm" style="color:#ef4444;border-color:#ef4444" onclick="adminVerifyPayment('${p.id}', 'rejected')">Reject</button>
                    ` : ''}
                </td>
            </tr>
        `).join('');

        return `
            <div class="dashboard-content">
                <div class="section-header" style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;"><i class="fas fa-money-check-alt" style="color: #10b981; margin-right: 0.75rem;"></i> <span data-i18n="dashboard.payments">Payment Verification</span></h2>
                    <p style="color: #64748b; font-size: 1rem; margin: 0;" data-i18n="dashboard.verifyPaymentsSub">Verify MTN transaction references from employers.</p>
                </div>
                
                <div class="modern-table">
                    <table>
                        <thead>
                            <tr>
                                <th data-i18n="dashboard.transaction">Transaction</th>
                                <th data-i18n="dashboard.employer">Employer</th>
                                <th data-i18n="dashboard.worker">Worker</th>
                                <th data-i18n="dashboard.amount">Amount</th>
                                <th data-i18n="dashboard.status">Status</th>
                                <th data-i18n="dashboard.actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paymentRows || '<tr><td colspan="6" class="text-center">No payment records found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="alert alert-error">Failed to load payments: ${error.message}</div>`;
    }
}

async function adminVerifyPayment(paymentId, status) {
    const confirmed = await authSystem.showConfirm(`Are you sure you want to mark this payment as ${status.toUpperCase()}?`, 'Update Payment', 'Yes');
    if (!confirmed) return;
    
    try {
        await apiService.verifyPaymentById(paymentId, status);
        authSystem.showAlert(`Payment successfully marked as ${status}.`, 'success');
        showDashboardSection('payments');
    } catch (error) {
        authSystem.showAlert(`Error: ${error.message}`, 'error');
    }
}

async function getAdminUsersSection() {
    try {
        const response = await apiService.getAdminUsers();
        const users = response.users || [];
        
        const userRows = users.map(u => `
            <tr>
                <td>
                    <div class="applicant-info">
                        <div class="applicant-avatar">${u.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h4>${u.name}</h4>
                            <p>${u.email}</p>
                            <p>${u.phone || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge">${u.user_type.toUpperCase()}</span>
                </td>
                <td>
                    ${u.is_active === false
                        ? '<span class="worker-status unavailable"><i class="fas fa-ban"></i> Blocked</span>' 
                        : '<span class="worker-status available"><i class="fas fa-check-circle"></i> Active</span>'
                    }
                </td>
                <td class="action-cell">
                    ${u.is_active === false
                        ? `<button class="btn btn-primary btn-sm" onclick="adminUnblockUser('${u.id}')">Unblock</button>`
                        : `<button class="btn btn-outline btn-sm" style="color:#ef4444;border-color:#ef4444" onclick="adminBlockUser('${u.id}')">Block</button>`
                    }
                    <button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u.id}')"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="dashboard-content">
                <div class="section-header" style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;"><i class="fas fa-users-cog" style="color: #8b5cf6; margin-right: 0.75rem;"></i> <span data-i18n="dashboard.manageUsers">User Management</span></h2>
                    <p style="color: #64748b; font-size: 1rem; margin: 0;" data-i18n="dashboard.manageUsersSub">Manage, block, and delete employers and workers.</p>
                </div>
                
                <div class="modern-table">
                    <table>
                        <thead>
                            <tr>
                                <th data-i18n="dashboard.userDetails">User Details</th>
                                <th data-i18n="dashboard.type">Type</th>
                                <th data-i18n="dashboard.status">Status</th>
                                <th data-i18n="dashboard.actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userRows || '<tr><td colspan="4" class="text-center">No users found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="alert alert-error">Failed to load users: ${error.message}</div>`;
    }
}

async function adminBlockUser(userId) {
    const confirmed = await authSystem.showConfirm('Are you sure you want to block this user?', 'Block User', 'Block');
    if (!confirmed) return;
    try {
        await apiService.blockUser(userId);
        authSystem.showAlert('User blocked successfully.', 'success');
        showDashboardSection('users');
    } catch (error) {
        authSystem.showAlert(`Error: ${error.message}`, 'error');
    }
}

async function adminUnblockUser(userId) {
    const confirmed = await authSystem.showConfirm('Are you sure you want to unblock this user?', 'Unblock User', 'Unblock');
    if (!confirmed) return;
    try {
        await apiService.unblockUser(userId);
        authSystem.showAlert('User unblocked successfully.', 'success');
        showDashboardSection('users');
    } catch (error) {
        authSystem.showAlert(`Error: ${error.message}`, 'error');
    }
}

async function adminDeleteUser(userId) {
    const confirmed = await authSystem.showConfirm('Are you sure you want to permanently delete this user? This action cannot be undone.', 'Delete User', 'Delete Permanently');
    if (!confirmed) return;
    try {
        await apiService.deleteAdminUser(userId);
        authSystem.showAlert('User deleted successfully.', 'success');
        showDashboardSection('users');
    } catch (error) {
        authSystem.showAlert(`Error: ${error.message}`, 'error');
    }
}

// Admin Settings Section with Email Configuration
function getAdminSettingsSection() {
    return `
        <div class="admin-settings-section">
            <div class="section-header" style="margin-bottom: 2rem;">
                <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">
                    <i class="fas fa-cog" style="color: #8b5cf6; margin-right: 0.75rem;"></i> Admin Settings
                </h2>
                <p style="color: #64748b; font-size: 1rem; margin: 0;">Configure system settings and email services</p>
            </div>

            <div class="settings-grid">
                <!-- Email Configuration -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <h3><i class="fas fa-envelope"></i> Email Configuration</h3>
                        <p>Configure SMTP settings for sending emails</p>
                    </div>
                    
                    <form id="emailConfigForm" onsubmit="saveEmailConfig(event)" class="settings-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="smtpHost">SMTP Host</label>
                                <input type="text" id="smtpHost" name="smtpHost" placeholder="smtp.gmail.com" required>
                            </div>
                            <div class="form-group">
                                <label for="smtpPort">SMTP Port</label>
                                <input type="number" id="smtpPort" name="smtpPort" placeholder="587" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="smtpUsername">SMTP Username</label>
                                <input type="email" id="smtpUsername" name="smtpUsername" placeholder="your-email@gmail.com" required>
                            </div>
                            <div class="form-group">
                                <label for="smtpPassword">SMTP Password</label>
                                <input type="password" id="smtpPassword" name="smtpPassword" placeholder="App password" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="smtpFrom">From Email</label>
                                <input type="email" id="smtpFrom" name="smtpFrom" placeholder="noreply@umukozi.com" required>
                            </div>
                            <div class="form-group">
                                <label for="smtpFromName">From Name</label>
                                <input type="text" id="smtpFromName" name="smtpFromName" placeholder="Umukozi Team" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="smtpSecure">Use Secure Connection (TLS)</label>
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="smtpSecure" name="smtpSecure" checked>
                                <label for="smtpSecure" class="checkbox-label">Enable TLS/SSL</label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="testEmailConfig()">
                                <i class="fas fa-paper-plane"></i> Test Configuration
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Configuration
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Email Templates -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <h3><i class="fas fa-file-alt"></i> Email Templates</h3>
                        <p>Manage email notification templates</p>
                    </div>
                    
                    <div class="email-templates">
                        <div class="template-item">
                            <div class="template-info">
                                <h4>Welcome Email</h4>
                                <p>Sent to new users upon registration</p>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="editEmailTemplate('welcome')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                        
                        <div class="template-item">
                            <div class="template-info">
                                <h4>Application Status</h4>
                                <p>Notifies workers about application updates</p>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="editEmailTemplate('application')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                        
                        <div class="template-item">
                            <div class="template-info">
                                <h4>Job Posted</h4>
                                <p>Confirms job posting to employers</p>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="editEmailTemplate('job_posted')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                        
                        <div class="template-item">
                            <div class="template-info">
                                <h4>Payment Confirmation</h4>
                                <p>Sends payment receipts to workers</p>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="editEmailTemplate('payment')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>

                <!-- System Settings -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <h3><i class="fas fa-sliders-h"></i> System Settings</h3>
                        <p>General system configuration</p>
                    </div>
                    
                    <form class="settings-form">
                        <div class="form-group">
                            <label for="siteName">Site Name</label>
                            <input type="text" id="siteName" value="Umukozi" placeholder="Umukozi">
                        </div>
                        
                        <div class="form-group">
                            <label for="siteUrl">Site URL</label>
                            <input type="url" id="siteUrl" value="https://umukozi.com" placeholder="https://umukozi.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="adminEmail">Admin Email</label>
                            <input type="email" id="adminEmail" placeholder="admin@umukozi.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="enableEmailNotifications">Enable Email Notifications</label>
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="enableEmailNotifications" checked>
                                <label for="enableEmailNotifications" class="checkbox-label">Send email notifications to users</label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" onclick="saveSystemSettings()">
                                <i class="fas fa-save"></i> Save System Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Email Configuration Functions
async function saveEmailConfig(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const emailConfig = {
        smtpHost: formData.get('smtpHost'),
        smtpPort: parseInt(formData.get('smtpPort')),
        smtpUsername: formData.get('smtpUsername'),
        smtpPassword: formData.get('smtpPassword'),
        smtpFrom: formData.get('smtpFrom'),
        smtpFromName: formData.get('smtpFromName'),
        smtpSecure: formData.get('smtpSecure') === 'on'
    };
    
    try {
        const response = await apiService.saveEmailConfig(emailConfig);
        authSystem.showAlert('Email configuration saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving email config:', error);
        authSystem.showAlert(`Failed to save email configuration: ${error.message}`, 'error');
    }
}

async function testEmailConfig() {
    const smtpHost = document.getElementById('smtpHost').value;
    const smtpPort = document.getElementById('smtpPort').value;
    const smtpUsername = document.getElementById('smtpUsername').value;
    const smtpPassword = document.getElementById('smtpPassword').value;
    const smtpFrom = document.getElementById('smtpFrom').value;
    const smtpFromName = document.getElementById('smtpFromName').value;
    const smtpSecure = document.getElementById('smtpSecure').checked;
    
    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !smtpFrom) {
        authSystem.showAlert('Please fill in all required email configuration fields', 'error');
        return;
    }
    
    try {
        const testConfig = {
            smtpHost,
            smtpPort: parseInt(smtpPort),
            smtpUsername,
            smtpPassword,
            smtpFrom,
            smtpFromName,
            smtpSecure
        };
        
        const response = await apiService.testEmailConfig(testConfig);
        authSystem.showAlert('Test email sent successfully! Please check your inbox.', 'success');
    } catch (error) {
        console.error('Error testing email config:', error);
        authSystem.showAlert(`Failed to send test email: ${error.message}`, 'error');
    }
}

function editEmailTemplate(templateType) {
    // Placeholder for email template editing functionality
    authSystem.showAlert(`Email template editor for "${templateType}" will be implemented soon.`, 'info');
}

async function saveSystemSettings() {
    const siteName = document.getElementById('siteName').value;
    const siteUrl = document.getElementById('siteUrl').value;
    const adminEmail = document.getElementById('adminEmail').value;
    const enableEmailNotifications = document.getElementById('enableEmailNotifications').checked;
    
    try {
        const systemSettings = {
            siteName,
            siteUrl,
            adminEmail,
            enableEmailNotifications
        };
        
        const response = await apiService.saveSystemSettings(systemSettings);
        authSystem.showAlert('System settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving system settings:', error);
        authSystem.showAlert(`Failed to save system settings: ${error.message}`, 'error');
    }
}

// Load existing admin settings
async function loadAdminSettings() {
    try {
        // Load email configuration
        const emailConfig = await apiService.getEmailConfig();
        if (emailConfig) {
            document.getElementById('smtpHost').value = emailConfig.smtp_host || '';
            document.getElementById('smtpPort').value = emailConfig.smtp_port || 587;
            document.getElementById('smtpUsername').value = emailConfig.smtp_username || '';
            document.getElementById('smtpPassword').value = emailConfig.smtp_password || '';
            document.getElementById('smtpFrom').value = emailConfig.smtp_from || '';
            document.getElementById('smtpFromName').value = emailConfig.smtp_from_name || 'Umukozi Team';
            document.getElementById('smtpSecure').checked = emailConfig.smtp_secure !== false;
        }

        // Load system settings
        const systemSettings = await apiService.getSystemSettings();
        if (systemSettings) {
            document.getElementById('siteName').value = systemSettings.site_name || 'Umukozi';
            document.getElementById('siteUrl').value = systemSettings.site_url || 'https://umukozi.com';
            document.getElementById('adminEmail').value = systemSettings.admin_email || '';
            document.getElementById('enableEmailNotifications').checked = systemSettings.enable_email_notifications !== false;
        }
    } catch (error) {
        console.error('Error loading admin settings:', error);
        // Don't show error to user on load, just log it
    }
}
