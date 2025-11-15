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
    const monthYearDisplay = document.getElementById('monthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const dailyEventsList = document.getElementById('dailyEventsList');
    const selectedDateText = document.getElementById('selectedDateText');
    const openTaskModalBtn = document.getElementById('openTaskModalBtn');

    let currentDate = new Date();
    let selectedDate = new Date();
    const getEvents = () => {
        const tasks = JSON.parse(localStorage.getItem('eduPlannerTasks')) || [];
        const projects = JSON.parse(localStorage.getItem('eduPlannerProjects')) || [];
        
        const taskEvents = tasks
            .filter(t => !t.completed) 
            .map(t => ({
                id: `T-${t.id}`,
                type: 'Task',
                title: t.name,
                date: t.deadline,
                priority: t.priority,
                subject: t.subject
            }));

        const projectEvents = projects
            .filter(p => p.status !== 'Completed') 
            .map(p => ({
                id: `P-${p.id}`,
                type: 'Project',
                title: p.name,
                date: p.deadline,
                priority: 'High', 
                subject: p.type
            }));
            
        
        return [...taskEvents, ...projectEvents];
    };
    

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthYearDisplay.textContent = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); 
        
        calendarGrid.innerHTML = '';
        const allEvents = getEvents();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'disabled');
            calendarGrid.appendChild(dayElement);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const date = new Date(year, month, day);

            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.setAttribute('data-date', dateString);
            const today = new Date().toISOString().split('T')[0];
            if (dateString === today) {
                dayElement.classList.add('current-day');
            }

            dayElement.innerHTML = `<span class="day-number">${day}</span>`;
            const eventsOnThisDay = allEvents.filter(event => event.date === dateString);
            
            eventsOnThisDay.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item', `priority-${event.priority}`, `event-${event.type.replace(/\s/g, '')}`);
                eventItem.textContent = `${event.title}`;
                eventItem.setAttribute('draggable', true);
                eventItem.setAttribute('data-event-id', event.id);
                eventItem.setAttribute('data-event-type', event.type);
                dayElement.appendChild(eventItem);
            });
            
            calendarGrid.appendChild(dayElement);
        }
        
        updateDailyEvents(selectedDate.toISOString().split('T')[0]);
    };
    
    
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    calendarGrid.addEventListener('click', (e) => {
        const dayElement = e.target.closest('.calendar-day');
        if (dayElement && dayElement.dataset.date) {
            const date = dayElement.dataset.date;
            selectedDate = new Date(date);
            
            document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
            dayElement.classList.add('selected'); 

            updateDailyEvents(date);
        }
    });
    
    const updateDailyEvents = (dateString) => {
        const events = getEvents().filter(event => event.date === dateString);
        dailyEventsList.innerHTML = '';
        
        const dateObj = new Date(dateString);
        selectedDateText.textContent = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        if (events.length === 0) {
            dailyEventsList.innerHTML = '<p style="opacity: 0.6; text-align: center;">No events or deadlines for this day.</p>';
            return;
        }

        events.forEach(event => {
            const item = document.createElement('div');
            item.classList.add('daily-event-item');
            
            let borderColor = '#9E9E9E'; 
            if (event.type === 'Exam') borderColor = '#64B5F6';
            else if (event.type === 'Appointment') borderColor = '#9575CD';
            else if (event.priority) {
                if (event.priority === 'High') borderColor = '#E57373';
                else if (event.priority === 'Medium') borderColor = '#FFB74D';
                else if (event.priority === 'Low') borderColor = '#81C784';
            }
            item.style.borderLeftColor = borderColor;

            item.innerHTML = `
                <div class="details">
                    <strong>${event.title}</strong>
                    <span>${event.type} | ${event.subject || 'N/A'}</span>
                </div>
                <div class="daily-event-actions">
                    <button class="view-details" data-id="${event.id}" title="View Details"><i class="fa-solid fa-eye"></i></button>
                </div>
            `;
            dailyEventsList.appendChild(item);
        });
    };
    
    const modal = document.getElementById('taskModal');
    const closeXBtn = document.querySelector('#taskModal .close-btn'); 
    const closeCancelBtn = document.getElementById('closeTaskModal'); 
    const saveEventBtn = document.getElementById('saveEventBtn');

    const closeModal = () => {
        modal.style.display = "none"; 
    };

    openTaskModalBtn.addEventListener('click', () => {
        document.getElementById('eventDate').value = selectedDate.toISOString().split('T')[0];
        modal.style.display = 'block';
    });
    
    if(closeXBtn) {
        closeXBtn.addEventListener('click', closeModal); 
    }
    
    if(closeCancelBtn) {
        closeCancelBtn.addEventListener('click', closeModal);
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
    
    saveEventBtn.addEventListener('click', () => {
        alert('Custom event saving functionality is a placeholder. Data is currently retrieved from Tasks/Projects pages.');
        closeModal(); 
    });   
    renderCalendar();
});