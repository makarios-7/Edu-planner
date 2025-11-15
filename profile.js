document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('toggle-theme');
    const body = document.body;
    const defaultThemeSelect = document.getElementById('defaultTheme');
    
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            body.classList.remove('dark-theme');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
        defaultThemeSelect.value = theme;
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    
    document.querySelector('.save-settings-btn').addEventListener('click', () => {
        const newDefaultTheme = defaultThemeSelect.value;
        const newCalendarStartDay = document.getElementById('calendarStart').value;
        
        localStorage.setItem('theme', newDefaultTheme);
        localStorage.setItem('calendarStartDay', newCalendarStartDay);
        
        applyTheme(newDefaultTheme);
        alert('✅ Settings saved!');
    });
    
    const loadData = () => {
        const tasks = JSON.parse(localStorage.getItem('eduPlannerTasks')) || [];
        const projects = JSON.parse(localStorage.getItem('eduPlannerProjects')) || [];
        return { tasks, projects };
    };

    const calculateAnalytics = (data) => {
        const { tasks, projects } = data;
        const now = new Date().setHours(0, 0, 0, 0); 

        const completedTasks = tasks.filter(t => t.completed).length;
        const pendingDeadlines = tasks.filter(t => !t.completed).length;

        const overdueItems = tasks.filter(t => 
            !t.completed && new Date(t.deadline).setHours(0, 0, 0, 0) < now
        ).length;

        const projectsInProgress = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
        
        const priorityData = { High: { completed: 0, pending: 0 }, Medium: { completed: 0, pending: 0 }, Low: { completed: 0, pending: 0 } };
        tasks.forEach(t => {
            if (t.priority in priorityData) {
                const status = t.completed ? 'completed' : 'pending';
                priorityData[t.priority][status]++;
            }
        });

        const subjectData = {};
        tasks.forEach(t => {
            const subject = t.subject || 'General';
            subjectData[subject] = (subjectData[subject] || 0) + 1;
        });

        return { completedTasks, pendingDeadlines, overdueItems, projectsInProgress, priorityData, subjectData };
    };

    // 7. Metric Display Function
    const displayMetrics = (analytics) => {
        document.getElementById('completedTasksCount').textContent = analytics.completedTasks;
        document.getElementById('pendingDeadlinesCount').textContent = analytics.pendingDeadlines;
        document.getElementById('projectsInProgressCount').textContent = analytics.projectsInProgress;
        document.getElementById('overdueCount').textContent = analytics.overdueItems;
    };
    
    const renderCharts = (analytics) => {
        
        const priorityCtx = document.getElementById('priorityChart').getContext('2d');
        const priorityLabels = Object.keys(analytics.priorityData);
        
        new Chart(priorityCtx, {
            type: 'bar',
            data: {
                labels: priorityLabels,
                datasets: [
                    {
                        label: 'Completed',
                        data: priorityLabels.map(p => analytics.priorityData[p].completed),
                        backgroundColor: '#4CAF50', 
                    },
                    {
                        label: 'Pending',
                        data: priorityLabels.map(p => analytics.priorityData[p].pending),
                        backgroundColor: '#FFB74D',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        const subjectCtx = document.getElementById('subjectChart').getContext('2d');
        const subjectLabels = Object.keys(analytics.subjectData);
        const subjectCounts = Object.values(analytics.subjectData);
        
        new Chart(subjectCtx, {
            type: 'doughnut',
            data: {
                labels: subjectLabels,
                datasets: [{
                    data: subjectCounts,
                    backgroundColor: [
                        '#64B5F6', 
                        '#81C784', 
                        '#FFB74D', 
                        '#9575CD', 
                        '#E57373', 
                        '#BDBDBD' 
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }; 
    
    document.getElementById('userNameDisplay').textContent = 'Student User';
    document.getElementById('userEmailDisplay').textContent = 'user@student.com';
    
    const data = loadData();
    const analytics = calculateAnalytics(data);
    displayMetrics(analytics);
    if (typeof Chart !== 'undefined') {
        renderCharts(analytics);
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            alert('Logged out successfully (Placeholder).');
            window.location.href = 'index.html'; 
        }
    });

});