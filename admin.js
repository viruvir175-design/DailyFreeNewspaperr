// Admin credentials (in production, this should be server-side)
const ADMIN_PASSWORD = 'admin123';

// Mock database for newspapers (in production, this would connect to a real database)
let newspapers = [
    {
        id: 1,
        name: 'The Hindu',
        description: 'National daily newspaper with comprehensive coverage of politics, business, sports, and international news.',
        language: 'english',
        isUploadedFile: true,
        fileName: 'the-hindu-today.pdf',
        fileSize: '12.5 MB',
        downloadUrl: null,
        isActive: true,
        addedDate: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Times of India',
        description: 'India\'s largest selling English daily with latest news, business updates, and entertainment coverage.',
        language: 'english',
        isUploadedFile: false,
        fileName: null,
        fileSize: null,
        downloadUrl: 'https://epaper.timesgroup.com/',
        isActive: true,
        addedDate: new Date().toISOString()
    },
    {
        id: 3,
        name: 'दैनिक जागरण',
        description: 'हिंदी का सबसे बड़ा दैनिक समाचार पत्र जो राष्ट्रीय और स्थानीय समाचारों का व्यापक कवरेज प्रदान करता है।',
        language: 'hindi',
        isUploadedFile: false,
        fileName: null,
        fileSize: null,
        downloadUrl: 'https://epaper.jagran.com/',
        isActive: true,
        addedDate: new Date().toISOString()
    }
];

// Load newspapers from localStorage if available
function loadNewspapers() {
    const saved = localStorage.getItem('newspapers');
    if (saved) {
        newspapers = JSON.parse(saved);
    }
}

// Save newspapers to localStorage
function saveNewspapers() {
    localStorage.setItem('newspapers', JSON.stringify(newspapers));
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadNewspapers();
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
    
    // Login form handler
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Add newspaper form handler
    document.getElementById('add-newspaper-form').addEventListener('submit', handleAddNewspaper);
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        errorElement.textContent = '';
        showDashboard();
    } else {
        errorElement.textContent = 'Invalid password. Please try again.';
    }
}

// Show admin dashboard
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').classList.add('show');
    loadNewspapersList();
}

// Logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-dashboard').classList.remove('show');
    document.getElementById('password').value = '';
}

// Toggle upload method
function toggleUploadMethod() {
    const method = document.getElementById('upload-method').value;
    const fileUpload = document.getElementById('file-upload');
    const urlInput = document.getElementById('url-input');
    
    if (method === 'file') {
        fileUpload.style.display = 'block';
        urlInput.style.display = 'none';
        document.getElementById('pdf-file').required = true;
        document.getElementById('download-url').required = false;
    } else if (method === 'url') {
        fileUpload.style.display = 'none';
        urlInput.style.display = 'block';
        document.getElementById('pdf-file').required = false;
        document.getElementById('download-url').required = true;
    } else {
        fileUpload.style.display = 'none';
        urlInput.style.display = 'none';
        document.getElementById('pdf-file').required = false;
        document.getElementById('download-url').required = false;
    }
}

// Handle add newspaper
function handleAddNewspaper(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const successElement = document.getElementById('add-success');
    const errorElement = document.getElementById('add-error');
    
    // Clear previous messages
    successElement.textContent = '';
    errorElement.textContent = '';
    
    try {
        const newspaper = {
            id: Date.now(), // Simple ID generation
            name: formData.get('name'),
            description: formData.get('description'),
            language: formData.get('language'),
            isUploadedFile: formData.get('uploadMethod') === 'file',
            fileName: null,
            fileSize: null,
            downloadUrl: null,
            isActive: true,
            addedDate: new Date().toISOString()
        };
        
        if (newspaper.isUploadedFile) {
            const file = formData.get('pdfFile');
            if (file && file.size > 0) {
                newspaper.fileName = file.name;
                newspaper.fileSize = formatFileSize(file.size);
                // In a real application, you would upload the file to a server here
                // For this demo, we'll just store the file name
            } else {
                throw new Error('Please select a PDF file');
            }
        } else {
            newspaper.downloadUrl = formData.get('downloadUrl');
            if (!newspaper.downloadUrl) {
                throw new Error('Please provide a download URL');
            }
        }
        
        // Add to newspapers array
        newspapers.push(newspaper);
        saveNewspapers();
        
        // Reset form
        e.target.reset();
        toggleUploadMethod();
        
        // Show success message
        successElement.textContent = 'Newspaper added successfully!';
        
        // Reload newspapers list
        loadNewspapersList();
        
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

// Load newspapers list
function loadNewspapersList() {
    const container = document.getElementById('newspapers-container');
    
    if (newspapers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No newspapers added yet.</p>';
        return;
    }
    
    container.innerHTML = newspapers.map(newspaper => `
        <div class="newspaper-item">
            <h3>${newspaper.name}</h3>
            <p><strong>Description:</strong> ${newspaper.description}</p>
            <p><strong>Language:</strong> ${newspaper.language === 'english' ? 'English' : 'हिंदी'}</p>
            <p><strong>Type:</strong> ${newspaper.isUploadedFile ? `File (${newspaper.fileName})` : 'External URL'}</p>
            <p><strong>Status:</strong> ${newspaper.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Added:</strong> ${new Date(newspaper.addedDate).toLocaleDateString()}</p>
            
            <div class="newspaper-actions">
                <button onclick="toggleStatus(${newspaper.id})" class="btn-secondary">
                    ${newspaper.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onclick="deleteNewspaper(${newspaper.id})" class="btn-danger">
                    Delete
                </button>
                ${newspaper.isUploadedFile ? '' : `
                    <button onclick="window.open('${newspaper.downloadUrl}', '_blank')" style="background: #10b981;">
                        Preview
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Toggle newspaper status
function toggleStatus(id) {
    const newspaper = newspapers.find(n => n.id === id);
    if (newspaper) {
        newspaper.isActive = !newspaper.isActive;
        saveNewspapers();
        loadNewspapersList();
    }
}

// Delete newspaper
function deleteNewspaper(id) {
    if (confirm('Are you sure you want to delete this newspaper?')) {
        newspapers = newspapers.filter(n => n.id !== id);
        saveNewspapers();
        loadNewspapersList();
    }
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export newspapers data (for backup)
function exportData() {
    const dataStr = JSON.stringify(newspapers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'newspapers_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import newspapers data (for restore)
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    newspapers = imported;
                    saveNewspapers();
                    loadNewspapersList();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid file format');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+L for logout
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        logout();
    }
    
    // Esc to close any modals or go back
    if (e.key === 'Escape') {
        // Add any modal closing logic here
    }
});

// Auto-save form data as user types (to prevent data loss)
function setupAutoSave() {
    const form = document.getElementById('add-newspaper-form');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            localStorage.setItem('draft_newspaper', JSON.stringify(data));
        });
    });
    
    // Load draft data on page load
    const draft = localStorage.getItem('draft_newspaper');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input && input.type !== 'file') {
                    input.value = data[key];
                }
            });
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
}

// Clear draft after successful submission
function clearDraft() {
    localStorage.removeItem('draft_newspaper');
}

// Initialize auto-save when page loads
document.addEventListener('DOMContentLoaded', setupAutoSave);