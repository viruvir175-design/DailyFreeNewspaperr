// Download counter management
let downloadCount = parseInt(localStorage.getItem('totalDownloads')) || 12847;

// Update download count on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('download-count').textContent = downloadCount.toLocaleString();
});

// Language switching functionality
function showLanguage(language) {
    const englishSection = document.getElementById('english-newspapers');
    const hindiSection = document.getElementById('hindi-newspapers');
    const englishBtn = document.getElementById('english-btn');
    const hindiBtn = document.getElementById('hindi-btn');
    
    if (language === 'english') {
        englishSection.classList.remove('hidden');
        hindiSection.classList.add('hidden');
        englishBtn.classList.add('active');
        hindiBtn.classList.remove('active');
    } else {
        hindiSection.classList.remove('hidden');
        englishSection.classList.add('hidden');
        hindiBtn.classList.add('active');
        englishBtn.classList.remove('active');
    }
}

// Download functionality
function downloadNewspaper(name) {
    // Show loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Downloading...';
    button.disabled = true;
    
    // Simulate download (replace with actual PDF file)
    setTimeout(() => {
        // Create a dummy PDF download
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,JVBERi0xLjMKJcfs...'; // This would be actual PDF data
        link.download = `${name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download counter
        downloadCount++;
        localStorage.setItem('totalDownloads', downloadCount.toString());
        document.getElementById('download-count').textContent = downloadCount.toLocaleString();
        
        // Show success message
        showToast(`${name} downloaded successfully!`, 'success');
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

// Open external newspaper links
function openNewspaper(url) {
    // Update download counter for external links too
    downloadCount++;
    localStorage.setItem('totalDownloads', downloadCount.toString());
    document.getElementById('download-count').textContent = downloadCount.toLocaleString();
    
    // Open in new tab
    window.open(url, '_blank');
    
    showToast('Opening newspaper site...', 'info');
}

// Privacy policy toggle
function togglePrivacy() {
    const content = document.getElementById('privacy-content');
    const button = event.target;
    
    if (content.classList.contains('show')) {
        content.classList.remove('show');
        button.textContent = '🛡️ Privacy Policy';
    } else {
        content.classList.add('show');
        button.textContent = '🛡️ Hide Privacy Policy';
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Smooth scrolling for internal links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add loading animation for buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('download-btn') || e.target.classList.contains('contact-btn')) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language to English
    showLanguage('english');
    
    // Add some animations
    const cards = document.querySelectorAll('.newspaper-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});