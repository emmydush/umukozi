// API Service for connecting to backend
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
    }

    // Get current token from storage
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug authentication for applications endpoint
        if (endpoint.includes('applications')) {
            console.log('=== API REQUEST DEBUG ===');
            console.log('Endpoint:', endpoint);
            console.log('Token exists:', !!token);
            console.log('Token length:', token ? token.length : 0);
            console.log('Authorization header:', config.headers.Authorization ? 'Present' : 'Missing');
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Backend server is not available. Please ensure the backend is running on port 3001.');
            }
            throw error;
        }
    }

    // Generic specific upload request method
    async uploadImage(fileData) {
        const url = `${this.baseURL}/upload/image`;
        const token = this.getToken();
        const config = {
            method: 'POST',
            body: fileData
        };

        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }

        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }
        return await response.json();
    }

    // Authentication methods
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        
        return response;
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        
        return response;
    }

    async verifyToken() {
        try {
            const response = await this.request('/auth/verify');
            return response.user;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    // User profile methods
    async getUserProfile() {
        return await this.request('/users/profile');
    }

    async updateUserProfile(userData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Worker profile methods
    async saveWorkerProfile(profileData) {
        return await this.request('/workers/profile', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    }

    async getWorkerProfile() {
        return await this.request('/workers/profile');
    }

    async updateWorkerProfile(profileData) {
        return await this.request('/workers/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async searchWorkers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/workers/search?${queryString}`);
    }

    async getWorkerById(id) {
        return await this.request(`/workers/${id}`);
    }

    // Jobs methods
    async getJobs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/jobs?${queryString}`);
    }

    async getJobById(id) {
        return await this.request(`/jobs/${id}`);
    }

    async createJob(jobData) {
        return await this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    async updateJob(id, jobData) {
        return await this.request(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    async deleteJob(id) {
        return await this.request(`/jobs/${id}`, {
            method: 'DELETE'
        });
    }

    async getEmployerJobs() {
        return await this.request('/jobs/employer/my-jobs');
    }

    // Application methods
    async applyForJob(jobId, coverLetter = '') {
        return await this.request('/applications', {
            method: 'POST',
            body: JSON.stringify({ jobId, coverLetter })
        });
    }

    async getMyApplications() {
        return await this.request('/applications/worker/my-applications');
    }

    async getJobApplications(jobId) {
        return await this.request(`/applications/employer/job/${jobId}`);
    }

    async applyForJob(jobId, coverLetter) {
        return await this.request('/applications', {
            method: 'POST',
            body: JSON.stringify({ jobId, coverLetter })
        });
    }

    async updateApplicationStatus(id, status) {
        return await this.request(`/applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Create global API service instance
const apiService = new ApiService();
