// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Check for saved theme preference or default to dark mode
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Smooth scroll for same-page anchors (like contact section on home page)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add background blur effect when scrolling
    if (scrollTop > 50) {
        header.style.backgroundColor = 'var(--bg-primary)';
        header.style.backdropFilter = 'blur(20px)';
        header.style.boxShadow = 'var(--shadow-sm)';
    } else {
        header.style.backgroundColor = 'var(--bg-primary)';
        header.style.backdropFilter = 'none';
        header.style.boxShadow = 'none';
    }
    
    lastScrollTop = scrollTop;
});

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to cards and sections
const animatedElements = document.querySelectorAll(
    '.featured-project-card, .experience-overview-card, .project-card, .achievement-card, .timeline-item, .skill-category, .hero-content'
);
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Active navigation highlighting for multi-page navigation
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        
        // Handle different page matches
        if (
            (currentPage === 'index.html' && linkHref === 'index.html') ||
            (currentPage === 'projects.html' && linkHref === 'projects.html') ||
            (currentPage === 'experience.html' && linkHref === 'experience.html') ||
            (currentPage === '' && linkHref === 'index.html') // For root path
        ) {
            link.classList.add('active');
        }
    });
}

// Set active navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // ESC key to close any open modals or reset focus
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }
    
    // Enter or Space on theme toggle
    if ((e.key === 'Enter' || e.key === ' ') && e.target === themeToggle) {
        e.preventDefault();
        themeToggle.click();
    }
});

// Enhanced external link handling
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', (e) => {
        // Add small delay for better UX
        e.preventDefault();
        setTimeout(() => {
            window.open(link.href, '_blank', 'noopener,noreferrer');
        }, 150);
    });
});

// Email link functionality
const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
emailLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // You can customize this to show a notification or copy email to clipboard
        console.log('Opening email client...');
    });
});

// Preload images for better performance
function preloadImages() {
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
        const imageLoader = new Image();
        imageLoader.src = img.src;
    });
}

// Page transition effect for better UX
function addPageTransition() {
    const pageLinks = document.querySelectorAll('a[href$=".html"]');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only apply to internal links, not external ones
            if (link.hostname === window.location.hostname) {
                e.preventDefault();
                const href = link.href;
                
                // Add fade out effect
                document.body.style.opacity = '0.8';
                document.body.style.transition = 'opacity 0.2s ease';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 200);
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    addPageTransition();
    
    // Add smooth entrance animation to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Add CSS for active navigation state and page transitions
const style = document.createElement('style');
style.textContent = `
    .nav-links a.active {
        color: #38bdf8 !important;
    }
    
    .nav-links a.active::after {
        width: 100% !important;
    }
    
    /* Smooth page transitions */
    body {
        transition: opacity 0.2s ease;
    }
    
    /* Loading state for better perceived performance */
    main {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    main.loaded {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style); 