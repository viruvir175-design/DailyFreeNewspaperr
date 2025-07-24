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
        },
        {
            id: 3,
            name: "Times of India",
            description: "Popular English newspaper",
            downloadUrl: "https://example.com/toi.pdf",
            isActive: true
        }
    ],
    hindi: [
        {
            id: 4,
            name: "दैनिक जागरण",
            description: "हिंदी दैनिक समाचार पत्र",
            downloadUrl: "https://example.com/dainikjagran.pdf",
            isActive: true
        },
        {
            id: 5,
            name: "नवभारत टाइम्स",
            description: "लोकप्रिय हिंदी अखबार",
            downloadUrl: "https://example.com/navbharattimes.pdf",
            isActive: true
        },
        {
            id: 6,
            name: "हिंदुस्तान",
            description: "राष्ट्रीय हिंदी दैनिक",
            downloadUrl: "https://example.com/hindustan.pdf",
            isActive: true
        }
    ]
};

// Listen for updates from admin panel
window.addEventListener('message', function(event) {
    if (event.data.type === 'updateNewspapers') {
        newspapers = event.data.data;
        localStorage.setItem('newspapers', JSON.stringify(newspapers));
        const activeLanguage = document.querySelector('.tab-btn.active').textContent.toLowerCase();
        loadNewspapers(activeLanguage === 'हिंदी' ? 'hindi' : 'english');
    }
});

// Show newspapers by language
function showLanguage(language) {
    // Hide all sections
    document.getElementById('english').style.display = 'none';
    document.getElementById('hindi').style.display = 'none';
    
    // Show selected section
    document.getElementById(language).style.display = 'block';
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load newspapers for selected language
    loadNewspapers(language);
}

// Load newspapers
function loadNewspapers(language) {
    // Refresh newspapers from localStorage
    const storedData = localStorage.getItem('newspapers');
    if (storedData) {
        newspapers = JSON.parse(storedData);
    }
    
    const container = document.getElementById(language + '-papers');
    const papers = newspapers[language] || [];
    
    if (papers.length === 0) {
        container.innerHTML = '<div class="loading">No newspapers available</div>';
        return;
    }
    
    container.innerHTML = papers.map(paper => `
        <div class="newspaper-card">
            <h3>${paper.name}</h3>
            <p>${paper.description}</p>
            ${paper.fileData ? 
                `<div style="margin-bottom: 10px;">
                    <small style="color: #666;">📁 ${paper.fileName} (${paper.fileSize})</small>
                </div>` : ''
            }
            <button class="download-btn" onclick="downloadPaper('${paper.id}', '${language}')">
                📱 Download PDF
            </button>
        </div>
    `).join('');
}

// Download paper function
function downloadPaper(paperId, language) {
    // Refresh newspapers from localStorage
    const storedData = localStorage.getItem('newspapers');
    if (storedData) {
        newspapers = JSON.parse(storedData);
    }
    
    const papers = newspapers[language] || [];
    const paper = papers.find(p => p.id == paperId);
    
    if (!paper) {
        alert('❌ Newspaper not found!');
        return;
    }
    
    if (paper.fileData) {
        // Handle uploaded file download
        try {
            // Create blob from base64 data
            const byteCharacters = atob(paper.fileData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = paper.fileName || `${paper.name}.pdf`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('❌ Error downloading file!');
        }
    } else {
        // Handle URL download
        window.open(paper.downloadUrl, '_blank');
    }
}

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
                const activeLanguage = document.querySelector('.tab-btn.active').textContent.toLowerCase();
                loadNewspapers(activeLanguage === 'हिंदी' ? 'hindi' : 'english');
                console.log("✅ Main site data loaded from Firebase");
            }
        }
    } catch (error) {
        console.error("❌ Error loading from Firebase:", error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadNewspapers('english');
    // Load latest data from Firebase
    loadFromFirebase();
    
    // Auto refresh every 5 minutes and sync with Firebase
    setInterval(() => {
        loadFromFirebase();
        const activeLanguage = document.querySelector('.tab-btn.active').textContent.toLowerCase();
        loadNewspapers(activeLanguage === 'हिंदी' ? 'hindi' : 'english');
    }, 300000);
});
