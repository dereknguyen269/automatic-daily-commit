// ===========================
// Data Visualization Logic
// ===========================

class CommitVisualizer {
    constructor() {
        this.logData = [];
        this.stats = {
            totalCommits: 0,
            currentStreak: 0,
            longestStreak: 0,
            busiestDay: 'Mon'
        };
        this.dayMap = {
            '0': 'Sun',
            '1': 'Mon',
            '2': 'Tue',
            '3': 'Wed',
            '4': 'Thu',
            '5': 'Fri',
            '6': 'Sat'
        };
    }

    async initialize() {
        try {
            await this.loadLogData();
            this.calculateStats();
            this.updateVisualizations();
            this.setupRefreshInterval();
        } catch (error) {
            console.error('Failed to initialize visualization:', error);
            this.showErrorMessage();
        }
    }

    async loadLogData() {
        try {
            const response = await fetch('daily-log.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            this.parseLogData(text);
        } catch (error) {
            console.error('Failed to load daily-log.txt:', error);
            throw error;
        }
    }

    parseLogData(text) {
        const lines = text.split('\n').filter(line => line.trim());
        this.logData = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip header lines
            if (line.includes('Daily Auto-Commit Log') || line.includes('====================') ||
                line.includes('This file is automatically updated by the GitHub Actions workflow') ||
                line.includes('Each day, a new timestamp entry is added below') ||
                line.includes('Initial setup:')) {
                continue;
            }

            // Parse daily update lines
            if (line.startsWith('Daily update:')) {
                const match = line.match(/Daily update: (.+)$/);
                if (match) {
                    const timestamp = match[1].trim();
                    try {
                        const date = new Date(timestamp);
                        if (!isNaN(date.getTime())) {
                            this.logData.push({
                                timestamp,
                                date,
                                dayOfWeek: date.getDay().toString(),
                                dateString: date.toISOString().split('T')[0]
                            });
                        }
                    } catch (e) {
                        console.warn('Could not parse timestamp:', timestamp);
                    }
                }
            }
        }

        // Sort by date (newest first)
        this.logData.sort((a, b) => b.date - a.date);
    }

    calculateStats() {
        if (this.logData.length === 0) {
            this.stats = {
                totalCommits: 0,
                currentStreak: 0,
                longestStreak: 0,
                busiestDay: 'Mon'
            };
            return;
        }

        // Count total commits
        this.stats.totalCommits = this.logData.length;

        // Find current streak
        this.stats.currentStreak = this.calculateCurrentStreak();

        // Find longest streak
        this.stats.longestStreak = this.calculateLongestStreak();

        // Find busiest day
        this.stats.busiestDay = this.findBusiestDay();
    }

    calculateCurrentStreak() {
        if (this.logData.length === 0) return 0;

        const sortedLogs = [...this.logData].sort((a, b) => a.date - b.date);
        let currentStreak = 0;
        let lastDate = null;

        for (const log of sortedLogs) {
            if (!lastDate) {
                currentStreak = 1;
                lastDate = log.date;
                continue;
            }

            const diffTime = log.date.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }

            lastDate = log.date;
        }

        return currentStreak;
    }

    calculateLongestStreak() {
        if (this.logData.length === 0) return 0;

        const sortedLogs = [...this.logData].sort((a, b) => a.date - b.date);
        let longestStreak = 0;
        let currentStreak = 0;
        let lastDate = null;

        for (const log of sortedLogs) {
            if (!lastDate) {
                currentStreak = 1;
                lastDate = log.date;
                continue;
            }

            const diffTime = log.date.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }

            lastDate = log.date;
        }

        return longestStreak;
    }

    findBusiestDay() {
        const dayCounts = {};

        for (const log of this.logData) {
            const day = log.dayOfWeek;
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        }

        if (Object.keys(dayCounts).length === 0) return 'Mon';

        let busiestDay = 'Mon';
        let maxCount = 0;

        for (const [day, count] of Object.entries(dayCounts)) {
            if (count > maxCount) {
                maxCount = count;
                busiestDay = day;
            }
        }

        return this.dayMap[busiestDay] || busiestDay;
    }

    updateVisualizations() {
        const stats = this.stats;

        // Update total commits
        document.getElementById('totalCommits').textContent = stats.totalCommits.toLocaleString();

        // Update current streak
        document.getElementById('currentStreak').textContent = stats.currentStreak.toLocaleString();

        // Update longest streak
        document.getElementById('longestStreak').textContent = stats.longestStreak.toLocaleString();

        // Update busiest day
        document.getElementById('busiestDay').textContent = stats.busiestDay;
    }

    setupRefreshInterval() {
        // Refresh data every 5 minutes (300000ms)
        setInterval(async () => {
            try {
                await this.loadLogData();
                this.calculateStats();
                this.updateVisualizations();
            } catch (error) {
                console.error('Failed to refresh visualization data:', error);
            }
        }, 300000);
    }

    showErrorMessage() {
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="error-message">
                    <p>Unable to load commit statistics. Please check if daily-log.txt is available.</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize the visualizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new CommitVisualizer();
    visualizer.initialize();
});

// Export for global access
window.CommitVisualizer = CommitVisualizer;
