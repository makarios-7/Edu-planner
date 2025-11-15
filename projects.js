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
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.querySelector('i').classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
    });

    const projectsListElement = document.getElementById('projectsList');
    const projectModal = document.getElementById('projectModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.querySelector('.modal-content .close-btn');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const projectFilter = document.getElementById('projectFilter');
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');
    
    let projects = JSON.parse(localStorage.getItem('eduPlannerProjects')) || [];
    let editingProjectId = null;
    const saveProjects = () => {
        localStorage.setItem('eduPlannerProjects', JSON.stringify(projects));
    };

    const calculateProgress = (project) => {
        if (!project.subtasks || project.subtasks.length === 0) return 0;
        const completedCount = project.subtasks.filter(t => t.completed).length;
        return Math.round((completedCount / project.subtasks.length) * 100);
    };
    const resetModal = () => {
        document.getElementById('modalTitle').textContent = 'Add New Project';
        document.getElementById('projectId').value = '';
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';
        document.getElementById('projectDeadline').value = '';
        document.getElementById('projectStatus').value = 'Planning';
        document.getElementById('projectType').value = 'Team';
        document.getElementById('subtasksList').innerHTML = '';
        document.getElementById('newSubtaskName').value = '';
        editingProjectId = null;
    };
    
    const openModal = (project = null) => {
        resetModal();
        
        if (project) {
            document.getElementById('modalTitle').textContent = 'Edit Project: ' + project.name;
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectDeadline').value = project.deadline;
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectType').value = project.type;
            editingProjectId = project.id;
            renderSubtasks(project.subtasks);
        }

        projectModal.style.display = 'block';
    };

    const closeModal = () => {
        projectModal.style.display = 'none';
        resetModal();
    };
    
    openModalBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.onclick = (event) => {
        if (event.target == projectModal) {
            closeModal();
        }
    };


    const renderSubtasks = (subtasks) => {
        const list = document.getElementById('subtasksList');
        list.innerHTML = '';
        
        if (subtasks && subtasks.length > 0) {
            subtasks.forEach(task => {
                const item = document.createElement('div');
                item.classList.add('subtask-item');
                if (task.completed) item.classList.add('completed');
                item.setAttribute('data-subtask-id', task.id);
                
                item.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="complete-subtask">
                    <span class="subtask-name">${task.name}</span>
                    <button class="delete-subtask" data-id="${task.id}"><i class="fa-solid fa-xmark"></i></button>
                `;
                list.appendChild(item);
            });
        } else {
            list.innerHTML = '<p style="text-align: center; opacity: 0.5; padding: 10px;">No milestones added yet.</p>';
        }
    };

    const getCurrentProject = () => {
        if (editingProjectId) {
            return projects.find(p => p.id === editingProjectId);
        }
        return { subtasks: [] }; 
    }

    addSubtaskBtn.addEventListener('click', () => {
        const newSubtaskName = document.getElementById('newSubtaskName').value.trim();
        const currentProject = getCurrentProject();

        if (newSubtaskName) {
            const newSubtask = {
                id: Date.now() + Math.random(),
                name: newSubtaskName,
                completed: false
            };
            if (editingProjectId) {
                currentProject.subtasks.push(newSubtask);
                saveProjects();
            } else {
                currentProject.subtasks.push(newSubtask);
            }

            document.getElementById('newSubtaskName').value = '';
            renderSubtasks(currentProject.subtasks);
        }
    });

    document.getElementById('subtasksArea').addEventListener('click', (e) => {
        const currentProject = getCurrentProject();
        const subtaskId = e.target.closest('button, input').dataset.id ? parseFloat(e.target.closest('button, input').dataset.id) : null;
        
        if (!subtaskId) return;

        const subtaskIndex = currentProject.subtasks.findIndex(t => t.id === subtaskId);
        if (subtaskIndex === -1) return;

        if (e.target.classList.contains('complete-subtask')) {
            currentProject.subtasks[subtaskIndex].completed = e.target.checked;
        } else if (e.target.closest('.delete-subtask')) {
            currentProject.subtasks.splice(subtaskIndex, 1); 
        }

        if (editingProjectId) {
            saveProjects();
        }
        
        renderSubtasks(currentProject.subtasks);
    });


    saveProjectBtn.addEventListener('click', () => {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const deadline = document.getElementById('projectDeadline').value;
        const status = document.getElementById('projectStatus').value;
        const type = document.getElementById('projectType').value;

        if (!name || !deadline) {
            alert('Project Name and Deadline are required.');
            return;
        }
        
        const currentSubtasks = getCurrentProject().subtasks;

        if (editingProjectId) {
            const projectIndex = projects.findIndex(p => p.id === editingProjectId);
            projects[projectIndex] = {
                ...projects[projectIndex],
                name,
                description,
                deadline,
                status,
                type,
                subtasks: currentSubtasks 
            };
        } else {
            const newProject = {
                id: Date.now(),
                name,
                description,
                deadline,
                status,
                type,
                subtasks: currentSubtasks 
            };
            projects.push(newProject);
        }

        saveProjects();
        renderProjects();
        closeModal();
    });

    const deleteProject = (id) => {
        if (confirm('Are you sure you want to delete this project and all its subtasks?')) {
            projects = projects.filter(p => p.id !== id);
            saveProjects();
            renderProjects();
        }
    };
    const renderProjects = () => {
        const filterValue = projectFilter.value;
        let filteredProjects = projects;
        
        if (filterValue !== 'all') {
            filteredProjects = projects.filter(p => p.status === filterValue);
        }

        projectsListElement.innerHTML = '';
        if (filteredProjects.length === 0) {
            projectsListElement.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 50px;">No projects found. Try adding one!</p>';
            return;
        }

        filteredProjects.forEach(project => {
            const progress = calculateProgress(project);
            const statusClass = project.status.replace(/\s/g, '_'); 
            
            const card = document.createElement('div');
            card.classList.add('project-card');
            
            const deadlineDate = new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            card.innerHTML = `
                <div class="project-header">
                    <div>
                        <h4 class="project-title">${project.name}</h4>
                        <span class="project-meta">${project.type} | Due: ${deadlineDate}</span>
                    </div>
                    <div class="project-actions">
                        <button class="edit-project" data-id="${project.id}" title="Edit Project"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete-project" data-id="${project.id}" title="Delete Project"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <p style="font-size: 0.9em; margin-bottom: 15px; opacity: 0.9;">${project.description.substring(0, 100)}...</p>
                
                <div class="project-status status-${statusClass}">${project.status}</div>

                <div class="progress-info">
                    <span>Progress:</span>
                    <span>${progress}%</span>
                </div>
                <div class="project-progress-bar">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
            `;
            
            projectsListElement.appendChild(card);
        });
    };

    projectsListElement.addEventListener('click', (e) => {
        const id = e.target.closest('button')?.dataset.id;
        if (!id) return;
        
        const projectId = parseInt(id);
        const project = projects.find(p => p.id === projectId);

        if (e.target.closest('.edit-project')) {
            openModal(project);
        } else if (e.target.closest('.delete-project')) {
            deleteProject(projectId);
        }
    });
    
    projectFilter.addEventListener('change', renderProjects);

    renderProjects();
});