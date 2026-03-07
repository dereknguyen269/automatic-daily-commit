class CommitVisualizer {
    constructor() {
        this.logData = [];
        this.commitsByDate = {};
        this.stats = { totalCommits: 0, currentStreak: 0, longestStreak: 0, busiestDay: '-' };
        this.dayMap = { '0':'Sun','1':'Mon','2':'Tue','3':'Wed','4':'Thu','5':'Fri','6':'Sat' };
        this.monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    }

    async initialize() {
        try {
            await this.loadLogData();
        } catch (err) {
            console.warn('Using demo data:', err.message);
            this.generateDemoData();
        }
        this.buildCommitMap();
        this.calculateStats();
        this.updateCards();
        this.renderHeatmap();
    }

    async loadLogData() {
        var r = await fetch('daily-log.txt');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        this.parseLogData(await r.text());
        if (this.logData.length === 0) throw new Error('No entries');
    }

    parseLogData(text) {
        this.logData = [];
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var m = lines[i].trim().match(/^Daily update:\s*(.+)$/);
            if (!m) continue;
            var d = new Date(m[1].trim());
            if (!isNaN(d.getTime())) {
                this.logData.push({
                    date: d,
                    dayOfWeek: d.getDay().toString(),
                    dateString: d.toISOString().split('T')[0]
                });
            }
        }
    }

    generateDemoData() {
        this.logData = [];
        var s = new Date('2026-01-01T10:30:00Z');
        var e = new Date('2026-03-07T10:30:00Z');
        var c = new Date(s);
        while (c <= e) {
            this.logData.push({
                date: new Date(c),
                dayOfWeek: c.getDay().toString(),
                dateString: c.toISOString().split('T')[0]
            });
            c.setDate(c.getDate() + 1);
        }
    }

    buildCommitMap() {
        this.commitsByDate = {};
        for (var i = 0; i < this.logData.length; i++) {
            var ds = this.logData[i].dateString;
            this.commitsByDate[ds] = (this.commitsByDate[ds] || 0) + 1;
        }
    }

    calculateStats() {
        var dates = Object.keys(this.commitsByDate).sort();
        if (dates.length === 0) {
            this.stats = { totalCommits: 0, currentStreak: 0, longestStreak: 0, busiestDay: '-' };
            return;
        }
        this.stats.totalCommits = this.logData.length;

        // Current streak (from newest backwards)
        var streak = 1;
        for (var i = dates.length - 1; i > 0; i--) {
            if (Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000) === 1) {
                streak++;
            } else {
                break;
            }
        }
        this.stats.currentStreak = streak;

        // Longest streak
        var longest = 1, cur = 1;
        for (var j = 1; j < dates.length; j++) {
            if (Math.round((new Date(dates[j]) - new Date(dates[j - 1])) / 86400000) === 1) {
                cur++;
                if (cur > longest) longest = cur;
            } else {
                cur = 1;
            }
        }
        this.stats.longestStreak = longest;

        // Busiest day of week
        var dc = {}, best = '1', max = 0;
        for (var k = 0; k < this.logData.length; k++) {
            var dw = this.logData[k].dayOfWeek;
            dc[dw] = (dc[dw] || 0) + 1;
        }
        for (var day in dc) {
            if (dc[day] > max) { max = dc[day]; best = day; }
        }
        this.stats.busiestDay = this.dayMap[best] || best;
    }

    updateCards() {
        var s = this.stats;
        var el = function(id) { return document.getElementById(id); };
        if (el('totalCommits'))  el('totalCommits').textContent = s.totalCommits.toLocaleString();
        if (el('currentStreak')) el('currentStreak').textContent = s.currentStreak.toLocaleString();
        if (el('longestStreak')) el('longestStreak').textContent = s.longestStreak.toLocaleString();
        if (el('busiestDay'))    el('busiestDay').textContent = s.busiestDay;
    }

    // =============================
    // GitHub-style Contribution Grid
    // =============================
    renderHeatmap() {
        var grid = document.getElementById('heatmapGrid');
        var monthsRow = document.getElementById('heatmapMonths');
        var titleEl = document.getElementById('heatmapTitle');
        var tooltip = document.getElementById('heatmapTooltip');
        if (!grid || !monthsRow) return;

        grid.innerHTML = '';
        monthsRow.innerHTML = '';

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start on the Sunday 52 weeks before this week's Sunday
        var startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // this week's Sunday
        startDate.setDate(startDate.getDate() - 52 * 7);            // 52 weeks back

        var totalWeeks = 53;
        var totalContributions = 0;
        var lastMonth = -1;
        var currentDate = new Date(startDate);
        var self = this;

        for (var week = 0; week < totalWeeks; week++) {
            // Month labels
            var weekStart = new Date(currentDate);
            if (weekStart.getMonth() !== lastMonth) {
                var label = document.createElement('span');
                label.className = 'heatmap-month-label';
                label.textContent = this.monthNames[weekStart.getMonth()];
                label.style.gridColumn = String(week + 1);
                monthsRow.appendChild(label);
                lastMonth = weekStart.getMonth();
            }

            for (var day = 0; day < 7; day++) {
                var cell = document.createElement('span');
                cell.className = 'heatmap-cell';

                if (currentDate > today) {
                    cell.classList.add('level-0');
                    cell.style.visibility = 'hidden';
                } else {
                    var ds = currentDate.getFullYear() + '-' +
                        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
                        String(currentDate.getDate()).padStart(2, '0');
                    var commits = this.commitsByDate[ds] || 0;
                    var level = commits === 0 ? 0 : commits <= 1 ? 1 : commits <= 3 ? 2 : commits <= 5 ? 3 : 4;

                    cell.classList.add('level-' + level);
                    cell.dataset.date = ds;
                    cell.dataset.commits = commits;
                    totalContributions += commits;

                    cell.addEventListener('mouseenter', function(evt) {
                        self.showTooltip(tooltip, evt);
                    });
                    cell.addEventListener('mouseleave', function() {
                        self.hideTooltip(tooltip);
                    });
                }

                grid.appendChild(cell);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        if (titleEl) {
            titleEl.textContent = totalContributions.toLocaleString() +
                ' contribution' + (totalContributions !== 1 ? 's' : '') +
                ' in the last year';
        }
    }

    showTooltip(tooltip, evt) {
        var cell = evt.target;
        if (!cell.dataset.date) return;

        var commits = parseInt(cell.dataset.commits, 10);
        var date = new Date(cell.dataset.date + 'T12:00:00');
        var fmt = date.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });

        tooltip.textContent = commits === 0
            ? 'No contributions on ' + fmt
            : commits + ' contribution' + (commits !== 1 ? 's' : '') + ' on ' + fmt;

        tooltip.classList.add('visible');

        var rect = cell.getBoundingClientRect();
        var tipW = tooltip.offsetWidth;
        tooltip.style.left = (rect.left + rect.width / 2 - tipW / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    }

    hideTooltip(tooltip) {
        tooltip.classList.remove('visible');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new CommitVisualizer().initialize();
});
window.CommitVisualizer = CommitVisualizer;
