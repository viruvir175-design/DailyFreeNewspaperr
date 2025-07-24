// Admin authentication
const ADMIN_PASSWORD = "admin123"; // Change this to a secure password

// Check if admin is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// Show login form
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    // Initialize form handlers after showing admin panel
    initializeFormHandlers();
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginForm();
    showLoginMessage('✅ Logged out successfully!', 'success');
}

// Show login message
function showLoginMessage(text, type) {
    const messageDiv = document.getElementById('loginMessage');
    messageDiv.innerHTML = `<div class="message ${type}" style="margin-top: 15px;">${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on page load
    checkAuth();
    
    // Login form handler
    document.getElementById('authForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
            showMessage('✅ Welcome Admin! Successfully logged in.', 'success');
            // Initialize admin panel
            displayNewspapers();
            setTimeout(() => {
                if (typeof loadFromFirebase === 'function') {
                    loadFromFirebase();
                }
            }, 500);
        } else {
            showLoginMessage('❌ Invalid password! Please try again.', 'error');
            document.getElementById('adminPassword').value = '';
        }
    });
});

// Toggle upload method visibility
function toggleUploadMethod() {
    const method = document.getElementById('uploadMethod').value;
    const fileGroup = document.getElementById('fileUploadGroup');
    const urlGroup = document.getElementById('urlGroup');
    
    if (method === 'file') {
        fileGroup.style.display = 'block';
        urlGroup.style.display = 'none';
        document.getElementById('downloadUrl').required = false;
        document.getElementById('pdfFile').required = true;
    } else if (method === 'url') {
        fileGroup.style.display = 'none';
        urlGroup.style.display = 'block';
        document.getElementById('downloadUrl').required = true;
        document.getElementById('pdfFile').required = false;
    } else {
        fileGroup.style.display = 'none';
        urlGroup.style.display = 'none';
        document.getElementById('downloadUrl').required = false;
        document.getElementById('pdfFile').required = false;
    }
}

// Convert file to base64 for storage
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Load newspapers from localStorage or use default data
let newspapers = JSON.parse(localStorage.getItem('newspapers')) || {
    english: [
        {
            id: 1,
            name: "The Hindu",
            description: "National daily newspaper",
            downloadUrl: "https://example.com/thehindu.pdf",
            isActive: true
        },
        {
            id: 2,
            name: "Indian Express", 
            description: "Leading English daily",
            downloadUrl: "https://example.com/indianexpress.pdf",
            isActive: true
        }
    ],
    hindi: [
        {
            id: 3,
            name: "दैनिक जागरण",
            description: "हिंदी दैनिक समाचार पत्र",
            downloadUrl: "https://example.com/dainikjagran.pdf",
            isActive: true
        }
    ]
};

// Save newspapers to localStorage and Firebase
async function saveNewspapers() {
    localStorage.setItem('newspapers', JSON.stringify(newspapers));
    
    // Save to Firebase Firestore
    try {
        if (window.firebaseDB && window.addDoc && window.collection) {
            await window.addDoc(window.collection(window.firebaseDB, "newspapers"), {
                data: newspapers,
                timestamp: new Date().toISOString(),
                lastUpdated: Date.now()
            });
            console.log("✅ Data saved to Firebase successfully!");
        }
    } catch (error) {
        console.error("❌ Error saving to Firebase:", error);
        showMessage('⚠️ Data saved locally but Firebase sync failed', 'error');
    }
    
    // Also save to a global variable that the main site can access
    window.parent.postMessage({
        type: 'updateNewspapers',
        data: newspapers
    }, '*');
}

// Show message to user
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

// Add new newspaper
async function addNewspaper(name, language, downloadUrl, description, pdfFile = null) {
    if (!newspapers[language]) {
        newspapers[language] = [];
    }
    
    let finalDownloadUrl = downloadUrl;
    let fileData = null;
    
    // Handle file upload
    if (pdfFile) {
        try {
            // Store file data as base64 for local storage
            fileData = await fileToBase64(pdfFile);
            // Use a simple identifier for the download URL
            finalDownloadUrl = `local-file-${Date.now()}`;
            
        } catch (error) {
            console.error('Error processing file:', error);
            showMessage('❌ Error processing PDF file!', 'error');
            return;
        }
    }
    
    const newPaper = {
        id: Date.now(),
        name: name,
        description: description || `Latest ${language} newspaper`,
        downloadUrl: finalDownloadUrl,
        isActive: true,
        addedDate: new Date().toLocaleDateString(),
        fileData: fileData, // Store base64 data if uploaded
        fileName: pdfFile ? pdfFile.name : null,
        fileSize: pdfFile ? (pdfFile.size / 1024 / 1024).toFixed(2) + ' MB' : null
    };
    
    newspapers[language].push(newPaper);
    await saveNewspapers();
    displayNewspapers();
    
    // Show success message
    showMessage(`✅ ${name} added successfully and synced to Firebase!`, 'success');
}

// Delete newspaper
async function deleteNewspaper(language, id) {
    if (confirm('Are you sure you want to delete this newspaper?')) {
        newspapers[language] = newspapers[language].filter(paper => paper.id !== id);
        await saveNewspapers();
        displayNewspapers();
        showMessage('🗑️ Newspaper deleted and synced to Firebase!', 'success');
    }
}

// Display newspapers in admin panel
function displayNewspapers() {
    const englishList = document.getElementById('englishList');
    const hindiList = document.getElementById('hindiList');
    
    // Display English newspapers
    englishList.innerHTML = newspapers.english.map(paper => `
        <div class="newspaper-item">
            <div class="newspaper-info">
                <h4>${paper.name}</h4>
                <p>${paper.description}</p>
                ${paper.fileData ? 
                    `<small>📁 File: ${paper.fileName} (${paper.fileSize})</small>` : 
                    `<small>🔗 URL: ${paper.downloadUrl}</small>`
                }
                <br><small>Added: ${paper.addedDate}</small>
            </div>
            <div>
                <button class="btn-danger" onclick="deleteNewspaper('english', ${paper.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
    
    // Display Hindi newspapers
    hindiList.innerHTML = newspapers.hindi.map(paper => `
        <div class="newspaper-item">
            <div class="newspaper-info">
                <h4>${paper.name}</h4>
                <p>${paper.description}</p>
                ${paper.fileData ? 
                    `<small>📁 File: ${paper.fileName} (${paper.fileSize})</small>` : 
                    `<small>🔗 URL: ${paper.downloadUrl}</small>`
                }
                <br><small>Added: ${paper.addedDate}</small>
            </div>
            <div>
                <button class="btn-danger" onclick="deleteNewspaper('hindi', ${paper.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Flag to prevent duplicate initialization
let formHandlersInitialized = false;

// Auth-protected function to add event listeners after login
function initializeFormHandlers() {
    if (formHandlersInitialized) return;
    formHandlersInitialized = true;
// Handle form submission
document.getElementById('addNewspaperForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const language = formData.get('language');
    const uploadMethod = formData.get('uploadMethod');
    const downloadUrl = formData.get('downloadUrl');
    const description = formData.get('description');
    const pdfFile = formData.get('pdfFile');
    
    // Validation
    if (!name || !language || !uploadMethod) {
        showMessage('❌ Please fill all required fields!', 'error');
        return;
    }
    
    if (uploadMethod === 'url' && !downloadUrl) {
        showMessage('❌ Please enter a download URL!', 'error');
        return;
    }
    
    if (uploadMethod === 'file' && (!pdfFile || pdfFile.size === 0)) {
        showMessage('❌ Please select a PDF file!', 'error');
        return;
    }
    
    // File size validation (100MB limit)
    if (pdfFile && pdfFile.size > 100 * 1024 * 1024) {
        showMessage('❌ File size must be less than 100MB!', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Saving newspaper data...', 'success');
        
        if (uploadMethod === 'file') {
            await addNewspaper(name, language, null, description, pdfFile);
        } else {
            await addNewspaper(name, language, downloadUrl, description);
        }
        
        // Reset form
        e.target.reset();
        toggleUploadMethod(); // Reset form visibility
    } catch (error) {
        console.error('Error adding newspaper:', error);
        showMessage('❌ Error adding newspaper. Please try again.', 'error');
    }
});

// Handle Firebase test form submission
document.getElementById('adminForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    
    try {
        if (window.firebaseDB && window.addDoc && window.collection) {
            await window.addDoc(window.collection(window.firebaseDB, "websiteData"), {
                title: title,
                timestamp: new Date().toISOString(),
                createdAt: Date.now()
            });
            
            showMessage('✅ Test data saved to Firebase successfully!', 'success');
            e.target.reset();
        } else {
            showMessage('❌ Firebase not initialized!', 'error');
        }
    } catch (error) {
        console.error('Firebase test error:', error);
        showMessage('❌ Error saving to Firebase!', 'error');
    }
});

// Load data from Firebase
async function loadFromFirebase() {
    try {
        if (window.firebaseDB && window.getDocs && window.collection) {
            const querySnapshot = await window.getDocs(window.collection(window.firebaseDB, "newspapers"));
            let latestData = null;
            let latestTimestamp = 0;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.lastUpdated && data.lastUpdated > latestTimestamp) {
                    latestTimestamp = data.lastUpdated;
                    latestData = data.data;
                }
            });
            
            if (latestData) {
                newspapers = latestData;
                localStorage.setItem('newspapers', JSON.stringify(newspapers));
                displayNewspapers();
                showMessage('✅ Data loaded from Firebase successfully!', 'success');
                console.log("✅ Data loaded from Firebase");
            }
        }
    } catch (error) {
        console.error("❌ Error loading from Firebase:", error);
        showMessage('⚠️ Using local data - Firebase connection failed', 'error');
    }
}



// Export data for backup
function exportData() {
    const dataStr = JSON.stringify(newspapers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'newspapers-backup.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Import data from backup
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            newspapers = importedData;
            await saveNewspapers();
            displayNewspapers();
            showMessage('✅ Data imported and synced to Firebase successfully!', 'success');
        } catch (error) {
            showMessage('❌ Invalid file format!', 'error');
        }
    };
    reader.readAsText(file);
}

} // End of initializeFormHandlers function
