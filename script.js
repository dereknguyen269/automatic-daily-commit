// ===========================
// Smooth Scrolling Navigation
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = 100; // Account for fixed navbar
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
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

// ===========================
// Scroll Animations
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animate-able elements
document.querySelectorAll('.feature-card, .timeline-item, .use-case-card, .setup-step').forEach(el => {
    observer.observe(el);
});

// ===========================
// Copy to Clipboard
// ===========================
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const textToCopy = button.getAttribute('data-copy');
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Visual feedback
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            button.style.background = 'linear-gradient(135deg, #06B6D4, #0891B2)';
            
            // Reset after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    });
});

// ===========================
// Navbar Scroll Effect
// ===========================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow on scroll
    if (scrollTop > 50) {
        navbar.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = '';
    }
    
    lastScrollTop = scrollTop;
});

// ===========================
// Dynamic Stats Counter
// ===========================
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16); // 60fps
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    
    updateCounter();
};

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statElements = entry.target.querySelectorAll('.stat-value');
            statElements.forEach(stat => {
                const value = stat.textContent.replace(/[^0-9]/g, '');
                if (value) {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        animateCounter(stat, numValue);
                    }
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ===========================
// Reduce Motion Support
// ===========================
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for users who prefer reduced motion
    document.querySelectorAll('.hero-illustration').forEach(el => {
        el.style.animation = 'none';
    });
}

// ===========================
// Prevent Layout Shift on Hover
// ===========================
// Ensure hover effects don't cause layout shifts
document.querySelectorAll('.feature-card, .use-case-card').forEach(card => {
    card.style.willChange = 'transform';
});

// ===========================
// Commit Chart Generation
// ===========================
function generateCommitChart() {
    const chartGrid = document.getElementById('commitChart');
    if (!chartGrid) return;
    
    const today = new Date();
    const totalDays = 365; // Show last 365 days
    const weeks = 53;
    
    // Generate demo commit data (random for demonstration)
    const commitData = generateDemoCommitData(totalDays);
    
    // Create tooltip element
    const tooltip = createTooltip();
    
    // Generate the grid (7 rows for days of week, 53 columns for weeks)
    for (let week = 0; week < weeks; week++) {
        for (let day = 0; day < 7; day++) {
            const dayIndex = week * 7 + day;
            if (dayIndex >= totalDays) continue;
            
            const date = new Date(today);
            date.setDate(date.getDate() - (totalDays - dayIndex - 1));
            
            const commits = commitData[dayIndex] || 0;
            const level = getCommitLevel(commits);
            
            const dayElement = document.createElement('div');
            dayElement.className = `chart-day level-${level}`;
            dayElement.dataset.date = date.toISOString().split('T')[0];
            dayElement.dataset.commits = commits;
            
            // Add hover events for tooltip
            dayElement.addEventListener('mouseenter', (e) => {
                showTooltip(tooltip, e, date, commits);
            });
            
            dayElement.addEventListener('mouseleave', () => {
                hideTooltip(tooltip);
            });
            
            chartGrid.appendChild(dayElement);
        }
    }
    
    // Calculate and display stats
    updateChartStats(commitData);
}

function generateDemoCommitData(days) {
    const data = [];
    for (let i = 0; i < days; i++) {
        // Generate realistic commit pattern
        // More commits on weekdays, fewer on weekends
        const dayOfWeek = (new Date().getDay() - (days - i - 1)) % 7;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Create some pattern with random variations
        const baseRate = isWeekend ? 0.3 : 0.7;
        const random = Math.random();
        
        if (random < baseRate) {
            data[i] = Math.floor(Math.random() * 5) + 1; // 1-5 commits
        } else {
            data[i] = 0;
        }
    }
    return data;
}

function getCommitLevel(commits) {
    if (commits === 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 4) return 2;
    if (commits <= 6) return 3;
    return 4;
}

function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    document.body.appendChild(tooltip);
    return tooltip;
}

function showTooltip(tooltip, event, date, commits) {
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const commitText = commits === 1 ? 'commit' : 'commits';
    
    tooltip.innerHTML = `
        <div class="chart-tooltip-date">${dateStr}</div>
        <div class="chart-tooltip-commits">${commits} ${commitText}</div>
    `;
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 50}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    setTimeout(() => {
        tooltip.classList.add('active');
    }, 10);
}

function hideTooltip(tooltip) {
    tooltip.classList.remove('active');
}

function updateChartStats(commitData) {
    // Total commits
    const totalCommits = commitData.reduce((sum, val) => sum + val, 0);
    document.getElementById('totalCommits').textContent = totalCommits;
    
    // Current streak
    const currentStreak = calculateCurrentStreak(commitData);
    document.getElementById('currentStreak').textContent = currentStreak;
    
    // Longest streak
    const longestStreak = calculateLongestStreak(commitData);
    document.getElementById('longestStreak').textContent = longestStreak;
    
    // Busiest day of week
    const busiestDay = calculateBusiestDay(commitData);
    document.getElementById('busyDay').textContent = busiestDay;
}

function calculateCurrentStreak(data) {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] > 0) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function calculateLongestStreak(data) {
    let longest = 0;
    let current = 0;
    
    for (let i = 0; i < data.length; i++) {
        if (data[i] > 0) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 0;
        }
    }
    
    return longest;
}

function calculateBusiestDay(data) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    const today = new Date();
    for (let i = 0; i < data.length; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (data.length - i - 1));
        const dayOfWeek = date.getDay();
        dayCounts[dayOfWeek] += data[i];
    }
    
    const maxIndex = dayCounts.indexOf(Math.max(...dayCounts));
    return days[maxIndex];
}

// Initialize commit chart when page loads
document.addEventListener('DOMContentLoaded', generateCommitChart);

console.log('🚀 Automatic Daily Commit landing page loaded successfully!');
