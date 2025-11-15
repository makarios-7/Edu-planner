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
    const taskListElement = document.getElementById('taskList');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const filters = document.querySelectorAll('.filters button');
    const sortSelect = document.getElementById('sortTasks');
    const emptyState = document.getElementById('emptyState');
    
    let tasks = JSON.parse(localStorage.getItem('eduPlannerTasks')) || [];
    let currentFilter = 'all';
    const saveTasks = () => {
        localStorage.setItem('eduPlannerTasks', JSON.stringify(tasks));
    };

    const isOverdue = (deadline) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const taskDate = new Date(deadline).setHours(0, 0, 0, 0);
        return taskDate < today;
    };
    const renderTasks = () => {
        let filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'pending') return !task.completed && !isOverdue(task.deadline);
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'overdue') return !task.completed && isOverdue(task.deadline);
            return true;
        });
        
        const sortValue = sortSelect.value;
        filteredTasks.sort((a, b) => {
            if (sortValue === 'priority_desc') {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            if (sortValue === 'deadline_asc') {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            if (sortValue === 'added_desc') {
                return b.id - a.id; 
            }
            return 0;
        });

        taskListElement.innerHTML = '';
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item', `priority-${task.priority}`);
            taskItem.setAttribute('data-id', task.id);

            if (task.completed) {
                taskItem.classList.add('completed');
            }
            if (!task.completed && isOverdue(task.deadline)) {
                taskItem.classList.add('overdue');
            }
            
            const deadlineDate = new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            taskItem.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="complete-checkbox">
                
                <div class="task-details">
                    <strong>${task.name}</strong>
                    <span class="task-meta">${task.type} | Subject: ${task.subject}</span>
                    ${task.description ? `<p style="font-size: 0.85em; margin: 5px 0 0; opacity: 0.8;">${task.description.substring(0, 50)}...</p>` : ''}
                </div>
                
                <div class="task-date">${isOverdue(task.deadline) && !task.completed ? 'OVERDUE!' : deadlineDate}</div>
                
                <div class="task-priority-tag tag-${task.priority}">
                    ${task.priority}
                </div>
                
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}" title="Edit Task"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" data-id="${task.id}" title="Delete Task"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            taskListElement.appendChild(taskItem);
        });
    };
    addTaskBtn.addEventListener('click', () => {
        const name = document.getElementById('taskName').value.trim();
        const subject = document.getElementById('taskSubject').value.trim();
        const deadline = document.getElementById('taskDate').value;
        const type = document.getElementById('taskType').value;
        const priority = document.getElementById('taskPriority').value;
        const description = document.getElementById('taskDescription').value.trim();

        if (name && deadline && subject) {
            const newTask = {
                id: Date.now(), 
                name,
                subject,
                deadline,
                type,
                priority,
                description,
                completed: false
            };

            tasks.push(newTask);
            saveTasks();         
            document.getElementById('taskName').value = '';
            document.getElementById('taskSubject').value = '';
            document.getElementById('taskDate').value = '';
            document.getElementById('taskDescription').value = '';
            
            renderTasks();
        } else {
            alert('Please enter a Task Title, Subject, and Deadline.');
        }
    });

    taskListElement.addEventListener('change', (e) => {
        if (e.target.classList.contains('complete-checkbox')) {
            const taskId = parseInt(e.target.dataset.id);
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = e.target.checked;
                saveTasks();
                renderTasks();
            }
        }
    });

    taskListElement.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const taskId = parseInt(e.target.closest('.delete-btn').dataset.id);
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        }
        
        if (e.target.closest('.edit-btn')) {
            const taskId = parseInt(e.target.closest('.edit-btn').dataset.id);
            openEditModal(taskId);
        }
    });
    filters.forEach(button => {
        button.addEventListener('click', () => {
            filters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    sortSelect.addEventListener('change', renderTasks);
    const modal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close-btn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    let editingTaskId = null;

    closeModal.onclick = () => { modal.style.display = "none"; };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    const openEditModal = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        editingTaskId = taskId;
        
        document.getElementById('editName').value = task.name;
        document.getElementById('editSubject').value = task.subject;
        document.getElementById('editDate').value = task.deadline;
        document.getElementById('editType').value = task.type;
        document.getElementById('editPriority').value = task.priority;
        document.getElementById('editDescription').value = task.description;

        modal.style.display = "block";
    };

    saveEditBtn.addEventListener('click', () => {
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex === -1) return;

        tasks[taskIndex].name = document.getElementById('editName').value.trim();
        tasks[taskIndex].subject = document.getElementById('editSubject').value.trim();
        tasks[taskIndex].deadline = document.getElementById('editDate').value;
        tasks[taskIndex].type = document.getElementById('editType').value;
        tasks[taskIndex].priority = document.getElementById('editPriority').value;
        tasks[taskIndex].description = document.getElementById('editDescription').value.trim();

        saveTasks();
        renderTasks();
        modal.style.display = "none";
    });
    renderTasks();
});