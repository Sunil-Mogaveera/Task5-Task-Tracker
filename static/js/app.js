/**
 * YRNovatech Task Tracker - Frontend Application
 * Handles API integration, client/server validation, reactive UI, 
 * search, filtering, pagination, and modals.
 */

(function () {
    'use strict';

    // =========================================================================
    // Application State
    // =========================================================================
    const state = {
        currentPage: 1,
        searchQuery: '',
        statusFilter: '',
        priorityFilter: '',
        sortOrder: '-created_at',
        pageSize: 6,
        totalPages: 1,
        totalTasks: 0,
        activeDeleteId: null,
        activeDeleteTitle: ''
    };

    // =========================================================================
    // DOM Elements Cache
    // =========================================================================
    const elements = {
        // Stats
        statTotal: document.getElementById('stat-total'),
        statPending: document.getElementById('stat-pending'),
        statInProgress: document.getElementById('stat-in-progress'),
        statCompleted: document.getElementById('stat-completed'),
        statCompletionRate: document.getElementById('stat-completion-rate'),
        statProgressFill: document.getElementById('stat-progress-fill'),

        // Search & Filters
        searchInput: document.getElementById('search-input'),
        searchClearBtn: document.getElementById('search-clear-btn'),
        filterStatus: document.getElementById('filter-status'),
        filterPriority: document.getElementById('filter-priority'),
        sortOrder: document.getElementById('sort-order'),
        btnResetFilters: document.getElementById('btn-reset-filters'),

        // Tasks Grid & States
        tasksGrid: document.getElementById('tasks-grid'),
        tasksLoading: document.getElementById('tasks-loading'),
        tasksEmpty: document.getElementById('tasks-empty'),
        emptyStateMsg: document.getElementById('empty-state-message'),
        btnEmptyCreate: document.getElementById('btn-empty-create'),

        // Pagination
        paginationNav: document.getElementById('pagination-nav'),
        paginationInfo: document.getElementById('pagination-info'),
        paginationControls: document.getElementById('pagination-controls'),

        // Theme Toggle
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),

        // Create / Edit Modal
        taskModal: document.getElementById('task-modal'),
        taskForm: document.getElementById('task-form'),
        modalTitle: document.getElementById('modal-title'),
        taskIdInput: document.getElementById('task-id'),
        taskTitleInput: document.getElementById('task-title'),
        taskDescInput: document.getElementById('task-description'),
        taskStatusSelect: document.getElementById('task-status'),
        taskPrioritySelect: document.getElementById('task-priority'),
        taskDueDateInput: document.getElementById('task-due-date'),
        titleCounter: document.getElementById('title-counter'),
        descCounter: document.getElementById('desc-counter'),
        btnOpenCreateModal: document.getElementById('btn-open-create-modal'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        btnCancelModal: document.getElementById('btn-cancel-modal'),
        btnSaveTask: document.getElementById('btn-save-task'),
        saveBtnText: document.getElementById('save-btn-text'),
        saveSpinner: document.getElementById('save-spinner'),
        formGeneralError: document.getElementById('form-general-error'),

        // Delete Modal
        deleteModal: document.getElementById('delete-modal'),
        deleteTaskTitle: document.getElementById('delete-task-title'),
        btnCancelDelete: document.getElementById('btn-cancel-delete'),
        btnConfirmDelete: document.getElementById('btn-confirm-delete'),
        deleteSpinner: document.getElementById('delete-spinner'),

        // Toasts
        toastContainer: document.getElementById('toast-container')
    };

    // =========================================================================
    // Security: CSRF Helper for Django
    // =========================================================================
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function getCsrfToken() {
        const inputCsrf = document.querySelector('[name=csrfmiddlewaretoken]');
        return inputCsrf ? inputCsrf.value : getCookie('csrftoken');
    }

    // =========================================================================
    // Utilities & Escaping
    // =========================================================================
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        if (!dateString) return null;
        try {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const date = new Date(parts[0], parts[1] - 1, parts[2]);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
            return dateString;
        } catch (e) {
            return dateString;
        }
    }

    // Debounce function
    function debounce(func, delay = 350) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // =========================================================================
    // Toast Notification System
    // =========================================================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconClass = 'ri-checkbox-circle-fill';
        if (type === 'error') iconClass = 'ri-error-warning-fill';
        if (type === 'info') iconClass = 'ri-information-fill';

        toast.innerHTML = `
            <i class="${iconClass} toast-icon"></i>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close-btn" aria-label="Dismiss toast">
                <i class="ri-close-line"></i>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close-btn');
        closeBtn.addEventListener('click', () => {
            dismissToast(toast);
        });

        elements.toastContainer.appendChild(toast);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            dismissToast(toast);
        }, 4000);
    }

    function dismissToast(toast) {
        if (!toast || toast.dataset.dismissing) return;
        toast.dataset.dismissing = 'true';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // =========================================================================
    // API Client
    // =========================================================================
    async function apiRequest(url, method = 'GET', data = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const csrfToken = getCsrfToken();
        if (csrfToken && method !== 'GET') {
            headers['X-CSRFToken'] = csrfToken;
        }

        const options = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (response.status === 204) {
            return { ok: true, data: null };
        }

        let responseData = null;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = null;
        }

        if (!response.ok) {
            const error = new Error('API Request Failed');
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        return { ok: true, data: responseData };
    }

    // =========================================================================
    // Fetch and Render Tasks
    // =========================================================================
    async function loadTasks() {
        showLoading(true);

        const params = new URLSearchParams();
        params.append('page', state.currentPage);
        params.append('page_size', state.pageSize);

        if (state.searchQuery.trim()) {
            params.append('search', state.searchQuery.trim());
        }
        if (state.statusFilter) {
            params.append('status', state.statusFilter);
        }
        if (state.priorityFilter) {
            params.append('priority', state.priorityFilter);
        }
        if (state.sortOrder) {
            params.append('ordering', state.sortOrder);
        }

        try {
            const { data } = await apiRequest(`/api/tasks/?${params.toString()}`);
            state.totalTasks = data.count || 0;
            state.totalPages = data.total_pages || 1;
            state.currentPage = data.current_page || 1;

            renderTasks(data.results || []);
            renderPagination(data);
        } catch (err) {
            console.error('Failed to load tasks:', err);
            showToast('Failed to fetch tasks. Please check your connection.', 'error');
            elements.tasksGrid.innerHTML = '';
            elements.tasksEmpty.classList.remove('hidden');
            elements.emptyStateMsg.textContent = 'An error occurred while loading tasks.';
        } finally {
            showLoading(false);
        }
    }

    async function loadStats() {
        try {
            const { data } = await apiRequest('/api/tasks/stats/');
            elements.statTotal.textContent = data.total;
            elements.statPending.textContent = data.pending;
            elements.statInProgress.textContent = data.in_progress;
            elements.statCompleted.textContent = data.completed;

            const rate = data.completion_rate || 0;
            elements.statCompletionRate.textContent = `${rate}%`;
            elements.statProgressFill.style.width = `${rate}%`;
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }

    function showLoading(isLoading) {
        if (isLoading) {
            elements.tasksLoading.classList.remove('hidden');
            elements.tasksGrid.classList.add('hidden');
            elements.tasksEmpty.classList.add('hidden');
        } else {
            elements.tasksLoading.classList.add('hidden');
            elements.tasksGrid.classList.remove('hidden');
        }
    }

    function renderTasks(tasks) {
        elements.tasksGrid.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            elements.tasksEmpty.classList.remove('hidden');
            if (state.searchQuery || state.statusFilter || state.priorityFilter) {
                elements.emptyStateMsg.textContent = 'No tasks matched your filter criteria.';
            } else {
                elements.emptyStateMsg.textContent = 'Get started by creating your first task!';
            }
            return;
        }

        elements.tasksEmpty.classList.add('hidden');

        tasks.forEach(task => {
            const card = createTaskCardElement(task);
            elements.tasksGrid.appendChild(card);
        });
    }

    function createTaskCardElement(task) {
        const card = document.createElement('div');
        const statusClass = task.status ? task.status.toLowerCase().replace('_', '-') : 'pending';
        card.className = `task-card task-${statusClass}`;
        card.dataset.id = task.id;

        const isCompleted = task.status === 'COMPLETED';
        const formattedDueDate = formatDate(task.due_date);
        const overdueBadge = task.is_overdue
            ? `<span class="badge badge-overdue"><i class="ri-alarm-warning-line"></i> Overdue</span>`
            : '';

        const prioKey = (task.priority || 'medium').toLowerCase();
        const statusKey = (task.status || 'pending').toLowerCase();

        card.innerHTML = `
            <div>
                <div class="task-card-header">
                    <div class="task-badges">
                        <span class="badge badge-${statusKey}">
                            ${task.status_display || task.status}
                        </span>
                        <span class="badge badge-${prioKey}">
                            <i class="ri-flag-fill"></i> ${task.priority_display || task.priority}
                        </span>
                        ${overdueBadge}
                    </div>
                </div>

                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            </div>

            <div>
                <div class="task-meta">
                    ${formattedDueDate ? `
                        <div class="task-meta-item" title="Due date">
                            <i class="ri-calendar-event-line"></i>
                            <span>Due ${formattedDueDate}</span>
                        </div>
                    ` : `
                        <div class="task-meta-item text-muted">
                            <i class="ri-calendar-line"></i> No due date
                        </div>
                    `}
                </div>

                <div class="task-actions">
                    <button class="btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-toggle-status" data-id="${task.id}" title="${isCompleted ? 'Mark Pending' : 'Mark Completed'}">
                        <i class="${isCompleted ? 'ri-arrow-go-back-line' : 'ri-check-line'}"></i>
                        <span>${isCompleted ? 'Reopen' : 'Done'}</span>
                    </button>

                    <div class="task-actions-right">
                        <button class="btn btn-icon btn-sm btn-edit-task" data-id="${task.id}" title="Edit Task" aria-label="Edit task">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="btn btn-icon btn-sm btn-delete-task" data-id="${task.id}" data-title="${escapeHtml(task.title)}" title="Delete Task" aria-label="Delete task">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners for card action buttons
        const toggleBtn = card.querySelector('.btn-toggle-status');
        toggleBtn.addEventListener('click', () => handleToggleStatus(task.id));

        const editBtn = card.querySelector('.btn-edit-task');
        editBtn.addEventListener('click', () => openEditModal(task));

        const deleteBtn = card.querySelector('.btn-delete-task');
        deleteBtn.addEventListener('click', () => openDeleteModal(task.id, task.title));

        return card;
    }

    // =========================================================================
    // Pagination Controls
    // =========================================================================
    function renderPagination(data) {
        const count = data.count || 0;
        const totalPages = data.total_pages || 1;
        const currentPage = data.current_page || 1;
        const pageSize = state.pageSize;

        if (count === 0) {
            elements.paginationInfo.textContent = 'No tasks to display';
            elements.paginationControls.innerHTML = '';
            return;
        }

        const start = ((currentPage - 1) * pageSize) + 1;
        const end = Math.min(currentPage * pageSize, count);
        elements.paginationInfo.textContent = `Showing ${start}–${end} of ${count} tasks`;

        elements.paginationControls.innerHTML = '';

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.disabled = !data.previous;
        prevBtn.innerHTML = '<i class="ri-arrow-left-s-line"></i>';
        prevBtn.title = 'Previous Page';
        prevBtn.addEventListener('click', () => {
            if (data.previous) {
                state.currentPage--;
                loadTasks();
            }
        });
        elements.paginationControls.appendChild(prevBtn);

        // Page Number Buttons
        for (let page = 1; page <= totalPages; page++) {
            // Keep pagination buttons clean for large numbers of pages
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page-btn ${page === currentPage ? 'active' : ''}`;
                pageBtn.textContent = page;
                pageBtn.addEventListener('click', () => {
                    if (page !== state.currentPage) {
                        state.currentPage = page;
                        loadTasks();
                    }
                });
                elements.paginationControls.appendChild(pageBtn);
            } else if (
                (page === currentPage - 2 && page > 1) ||
                (page === currentPage + 2 && page < totalPages)
            ) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-btn';
                ellipsis.style.border = 'none';
                ellipsis.style.background = 'none';
                ellipsis.textContent = '...';
                elements.paginationControls.appendChild(ellipsis);
            }
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.disabled = !data.next;
        nextBtn.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
        nextBtn.title = 'Next Page';
        nextBtn.addEventListener('click', () => {
            if (data.next) {
                state.currentPage++;
                loadTasks();
            }
        });
        elements.paginationControls.appendChild(nextBtn);
    }

    // =========================================================================
    // Quick Status Toggle Action
    // =========================================================================
    async function handleToggleStatus(taskId) {
        try {
            const { data } = await apiRequest(`/api/tasks/${taskId}/toggle/`, 'PATCH');
            showToast(`Task status updated to "${data.status_display}"`, 'success');
            loadTasks();
            loadStats();
        } catch (err) {
            console.error('Failed to toggle status:', err);
            showToast('Failed to update task status.', 'error');
        }
    }

    // =========================================================================
    // Modal & Form Management (Create / Edit)
    // =========================================================================
    function openCreateModal() {
        clearFormErrors();
        elements.taskForm.reset();
        elements.taskIdInput.value = '';
        elements.modalTitle.textContent = 'Create New Task';
        elements.saveBtnText.textContent = 'Create Task';
        updateCharacterCounters();
        elements.taskModal.classList.remove('hidden');
        setTimeout(() => elements.taskTitleInput.focus(), 100);
    }

    function openEditModal(task) {
        clearFormErrors();
        elements.taskIdInput.value = task.id;
        elements.taskTitleInput.value = task.title || '';
        elements.taskDescInput.value = task.description || '';
        elements.taskStatusSelect.value = task.status || 'PENDING';
        elements.taskPrioritySelect.value = task.priority || 'MEDIUM';
        elements.taskDueDateInput.value = task.due_date || '';
        elements.modalTitle.textContent = 'Edit Task';
        elements.saveBtnText.textContent = 'Update Task';
        updateCharacterCounters();
        elements.taskModal.classList.remove('hidden');
        setTimeout(() => elements.taskTitleInput.focus(), 100);
    }

    function closeTaskModal() {
        elements.taskModal.classList.add('hidden');
        clearFormErrors();
    }

    function updateCharacterCounters() {
        const titleLen = elements.taskTitleInput.value.length;
        const descLen = elements.taskDescInput.value.length;
        elements.titleCounter.textContent = `${titleLen}/200`;
        elements.descCounter.textContent = `${descLen}/1000`;
    }

    function clearFormErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
        elements.formGeneralError.classList.add('hidden');
        elements.formGeneralError.textContent = '';
    }

    function displayFieldErrors(errors) {
        clearFormErrors();
        let hasErrors = false;

        for (const [field, messages] of Object.entries(errors)) {
            const errorElement = document.getElementById(`error-${field}`);
            const inputElement = document.getElementById(`task-${field.replace('_', '-')}`);

            if (errorElement) {
                errorElement.textContent = Array.isArray(messages) ? messages.join(' ') : messages;
                hasErrors = true;
            }
            if (inputElement) {
                inputElement.classList.add('is-invalid');
            }
        }

        if (errors.non_field_errors || errors.detail) {
            elements.formGeneralError.textContent = errors.non_field_errors
                ? errors.non_field_errors.join(' ')
                : errors.detail;
            elements.formGeneralError.classList.remove('hidden');
            hasErrors = true;
        }

        return hasErrors;
    }

    // Client-side validation
    function validateClientForm() {
        clearFormErrors();
        let isValid = true;
        const title = elements.taskTitleInput.value.trim();

        if (!title) {
            document.getElementById('error-title').textContent = 'Title is required and cannot be blank.';
            elements.taskTitleInput.classList.add('is-invalid');
            isValid = false;
        } else if (title.length < 3) {
            document.getElementById('error-title').textContent = 'Title must be at least 3 characters long.';
            elements.taskTitleInput.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    // Submit handler (handles both create and update)
    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateClientForm()) {
            return;
        }

        const id = elements.taskIdInput.value;
        const payload = {
            title: elements.taskTitleInput.value.trim(),
            description: elements.taskDescInput.value.trim(),
            status: elements.taskStatusSelect.value,
            priority: elements.taskPrioritySelect.value,
            due_date: elements.taskDueDateInput.value || null
        };

        // Loading state
        elements.btnSaveTask.disabled = true;
        elements.saveSpinner.classList.remove('hidden');

        try {
            if (id) {
                // Update (PUT)
                await apiRequest(`/api/tasks/${id}/`, 'PUT', payload);
                showToast('Task updated successfully!', 'success');
            } else {
                // Create (POST)
                await apiRequest('/api/tasks/', 'POST', payload);
                showToast('Task created successfully!', 'success');
                // Return to first page on creation to see the newest task
                state.currentPage = 1;
            }

            closeTaskModal();
            loadTasks();
            loadStats();
        } catch (err) {
            console.error('Save task error:', err);
            if (err.data) {
                displayFieldErrors(err.data);
            } else {
                showToast('An unexpected server error occurred.', 'error');
            }
        } finally {
            elements.btnSaveTask.disabled = false;
            elements.saveSpinner.classList.add('hidden');
        }
    }

    // =========================================================================
    // Delete Confirmation Modal
    // =========================================================================
    function openDeleteModal(taskId, taskTitle) {
        state.activeDeleteId = taskId;
        state.activeDeleteTitle = taskTitle;
        elements.deleteTaskTitle.textContent = `"${taskTitle}"`;
        elements.deleteModal.classList.remove('hidden');
    }

    function closeDeleteModal() {
        elements.deleteModal.classList.add('hidden');
        state.activeDeleteId = null;
        state.activeDeleteTitle = '';
    }

    async function handleConfirmDelete() {
        if (!state.activeDeleteId) return;

        elements.btnConfirmDelete.disabled = true;
        elements.deleteSpinner.classList.remove('hidden');

        try {
            await apiRequest(`/api/tasks/${state.activeDeleteId}/`, 'DELETE');
            showToast('Task deleted successfully.', 'info');
            closeDeleteModal();

            // If we deleted the only task on the page and page > 1, go back one page
            if (elements.tasksGrid.children.length === 1 && state.currentPage > 1) {
                state.currentPage--;
            }

            loadTasks();
            loadStats();
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Failed to delete task. Please try again.', 'error');
        } finally {
            elements.btnConfirmDelete.disabled = false;
            elements.deleteSpinner.classList.add('hidden');
        }
    }

    // =========================================================================
    // Dark / Light Theme Toggle
    // =========================================================================
    function initTheme() {
        const savedTheme = localStorage.getItem('taskTrackerTheme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskTrackerTheme', theme);
        if (theme === 'dark') {
            elements.themeIcon.className = 'ri-sun-line';
        } else {
            elements.themeIcon.className = 'ri-moon-line';
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    }

    // =========================================================================
    // Event Listeners Registration
    // =========================================================================
    function bindEventListeners() {
        // Theme Toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Modals Open / Close
        elements.btnOpenCreateModal.addEventListener('click', openCreateModal);
        elements.btnEmptyCreate.addEventListener('click', openCreateModal);
        elements.btnCloseModal.addEventListener('click', closeTaskModal);
        elements.btnCancelModal.addEventListener('click', closeTaskModal);

        elements.btnCancelDelete.addEventListener('click', closeDeleteModal);
        elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

        // Click outside modal to close
        elements.taskModal.addEventListener('click', (e) => {
            if (e.target === elements.taskModal) closeTaskModal();
        });
        elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === elements.deleteModal) closeDeleteModal();
        });

        // Keyboard navigation (Escape key closes modals)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeTaskModal();
                closeDeleteModal();
            }
        });

        // Form submission
        elements.taskForm.addEventListener('submit', handleFormSubmit);

        // Character counting
        elements.taskTitleInput.addEventListener('input', updateCharacterCounters);
        elements.taskDescInput.addEventListener('input', updateCharacterCounters);

        // Search Input (debounced)
        const debouncedSearch = debounce(() => {
            state.searchQuery = elements.searchInput.value;
            state.currentPage = 1;
            loadTasks();
        }, 300);

        elements.searchInput.addEventListener('input', () => {
            if (elements.searchInput.value) {
                elements.searchClearBtn.classList.remove('hidden');
            } else {
                elements.searchClearBtn.classList.add('hidden');
            }
            debouncedSearch();
        });

        elements.searchClearBtn.addEventListener('click', () => {
            elements.searchInput.value = '';
            elements.searchClearBtn.classList.add('hidden');
            state.searchQuery = '';
            state.currentPage = 1;
            loadTasks();
        });

        // Filters
        elements.filterStatus.addEventListener('change', () => {
            state.statusFilter = elements.filterStatus.value;
            state.currentPage = 1;
            loadTasks();
        });

        elements.filterPriority.addEventListener('change', () => {
            state.priorityFilter = elements.filterPriority.value;
            state.currentPage = 1;
            loadTasks();
        });

        elements.sortOrder.addEventListener('change', () => {
            state.sortOrder = elements.sortOrder.value;
            state.currentPage = 1;
            loadTasks();
        });

        // Reset Filters
        elements.btnResetFilters.addEventListener('click', () => {
            elements.searchInput.value = '';
            elements.searchClearBtn.classList.add('hidden');
            elements.filterStatus.value = '';
            elements.filterPriority.value = '';
            elements.sortOrder.value = '-created_at';

            state.searchQuery = '';
            state.statusFilter = '';
            state.priorityFilter = '';
            state.sortOrder = '-created_at';
            state.currentPage = 1;

            loadTasks();
            showToast('Filters have been reset', 'info');
        });
    }

    // =========================================================================
    // Initialization
    // =========================================================================
    function init() {
        initTheme();
        bindEventListeners();
        loadTasks();
        loadStats();
    }

    // Launch application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
