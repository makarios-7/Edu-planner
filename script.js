document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('toggle-theme');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');

        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    });

    const mockTasks = [
        { id: 1, title: 'Finish Database Schema', subject: 'Database Systems', deadline: '2025-11-18', completed: false },
        { id: 2, title: 'Read Chapter 5 (OOP)', subject: 'Programming 101', deadline: '2025-11-15', completed: true },
        { id: 3, title: 'Prepare EduPlanner Presentation', subject: 'Project Management', deadline: '2025-11-20', completed: false },
        { id: 4, title: 'Review Calculus Notes', subject: 'Mathematics', deadline: '2025-11-25', completed: false },
    ];

    
    const getDaysDifference = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const deadlineDate = new Date(dateString);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    
    const formatDeadline = (days) => {
        if (days === 0) return 'Today!';
        if (days === 1) return 'Tomorrow';
        if (days < 0) return 'Overdue!';
        return `in ${days} days`;
    };


    const updateOverview = () => {
        const today = new Date().toISOString().split('T')[0];
        
        const tasksDueToday = mockTasks.filter(t => t.deadline === today && !t.completed).length;
        document.getElementById('tasks-today').textContent = tasksDueToday;

        const completedTasks = mockTasks.filter(t => t.completed).length;
        document.getElementById('completed-tasks').textContent = completedTasks;
        
        const totalTasks = mockTasks.length;
        const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        document.getElementById('completion-bar').style.width = `${completionPercentage}%`;
        
        const upcomingTasks = mockTasks
            .filter(t => !t.completed)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            
        if (upcomingTasks.length > 0) {
            const nextDeadline = upcomingTasks[0].deadline;
            const daysDiff = getDaysDifference(nextDeadline);
            document.getElementById('next-deadline').textContent = formatDeadline(daysDiff);
        }
        
    };

    const populateUpcomingTasks = () => {
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = ''; 
        
        const upcomingTasks = mockTasks
            .filter(t => !t.completed && getDaysDifference(t.deadline) >= 0) 
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5); 

        if (upcomingTasks.length === 0) {
            tasksList.innerHTML = '<li class="empty-state">No urgent tasks coming up! Enjoy the quiet.</li>';
            return;
        }

        upcomingTasks.forEach(task => {
            const daysDiff = getDaysDifference(task.deadline);
            const deadlineText = formatDeadline(daysDiff);

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="task-info">
                    <strong>${task.title}</strong>
                    <span>Subject: ${task.subject}</span>
                </div>
                <div class="task-deadline">${deadlineText}</div>
            `;
            tasksList.appendChild(li);
        });
    };

    const clickableCards = document.querySelectorAll('.clickable-card');
    clickableCards.forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    updateOverview();
    populateUpcomingTasks();
});