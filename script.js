// ===========================
// Theme Toggle (Dark/Light)
// ===========================
(function() {
    var toggle = document.getElementById('themeToggle');
    var root = document.documentElement;

    // Restore saved preference, default to dark
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
        root.setAttribute('data-theme', 'light');
    }

    if (toggle) {
        toggle.addEventListener('click', function() {
            var isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) {
                root.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                root.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
})();

// ===========================
// Smooth Scrolling Navigation
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = 80;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) navLinks.classList.remove('active');
        }
    });
});

// ===========================
// Mobile Menu Toggle
// ===========================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// ===========================
// Scroll Animations
// ===========================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .timeline-item, .use-case-card, .setup-step, .stat-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ===========================
// Navbar Scroll Effect
// ===========================
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = '';
    }
}, { passive: true });

// ===========================
// Prevent Layout Shift on Hover
// ===========================
document.querySelectorAll('.feature-card, .use-case-card, .stat-card, .setup-step, .timeline-item').forEach(card => {
    card.style.willChange = 'transform';
});
