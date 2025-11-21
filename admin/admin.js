// Конфигурация
const CONFIG = {
    username: 'admin',
    password: 'admin123',
    storageKey: 'fitEleganceData'
};

// Инициализация данных
function initializeData() {
    if (!localStorage.getItem(CONFIG.storageKey)) {
        const initialData = {
            services: [
                { 
                    id: 1, 
                    title: "Персональные тренировки", 
                    description: "Индивидуальный подход к вашим фитнес-целям",
                    icon: "💪",
                    duration: "60 мин"
                },
                { 
                    id: 2, 
                    title: "Групповые занятия", 
                    description: "Тренировки в команде с опытным тренером",
                    icon: "👥",
                    duration: "45 мин"
                }
            ],
            trainers: [
                {
                    id: 1,
                    name: "Анна Иванова",
                    specialization: "Фитнес, Йога",
                    experience: "5 лет",
                    photo: "👩‍💼",
                    description: "Сертифицированный тренер по фитнесу и йоге"
                }
            ],
            schedule: [
                {
                    id: 1,
                    day: "Понедельник",
                    time: "09:00",
                    activity: "Йога",
                    trainer: "Анна Иванова",
                    maxParticipants: 15
                }
            ],
            pricing: [
                {
                    id: 1,
                    plan: "Базовый",
                    price: "2000",
                    period: "месяц",
                    features: ["4 занятия", "Групповые тренировки", "Фитнес-зона"]
                }
            ],
            leads: [],
            settings: {
                siteTitle: "FitElegance",
                contactPhone: "+7 (999) 999-99-99",
                contactEmail: "info@fitelegance.ru"
            }
        };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(initialData));
    }
}

// Утилиты
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
    notification.style.display = 'block';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Класс админ-панели
class AdminPanel {
    constructor() {
        this.currentTab = 'services';
        this.editingItem = null;
        this.init();
    }

    init() {
        initializeData();
        
        // Определяем на какой странице находимся
        const isLoginPage = window.location.pathname.includes('login.html') || 
                           document.getElementById('loginForm');
        
        if (isLoginPage) {
            this.setupLoginPage();
        } else {
            this.setupDashboard();
        }
    }

    setupLoginPage() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === CONFIG.username && password === CONFIG.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'index.html';
        } else {
            alert('Неверный логин или пароль!');
        }
    }

    setupDashboard() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadTabContent();
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Выход
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminLoggedIn');
                window.location.href = 'login.html';
            });
        }

        // Закрытие модального окна
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }
    }

    updateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleString('ru-RU');
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        this.loadTabContent();
    }

    async loadTabContent() {
        const contentArea = document.getElementById('tabContent');
        if (!contentArea) return;

        switch(this.currentTab) {
            case 'services':
                contentArea.innerHTML = await this.renderServicesTab();
                break;
            case 'trainers':
                contentArea.innerHTML = await this.renderTrainersTab();
                break;
            case 'schedule':
                contentArea.innerHTML = await this.renderScheduleTab();
                break;
            case 'pricing':
                contentArea.innerHTML = await this.renderPricingTab();
                break;
            case 'leads':
                contentArea.innerHTML = await this.renderLeadsTab();
                break;
            case 'settings':
                contentArea.innerHTML = await this.renderSettingsTab();
                break;
        }
    }

    // === СЕРВИСЫ ===
    async renderServicesTab() {
        const services = await this.getData('services');
        return `
            <h2>💪 Управление услугами</h2>
            <button class="add-btn" onclick="admin.openServiceModal()">+ Добавить услугу</button>
            
            <div class="items-grid">
                ${services.map(service => `
                    <div class="item-card">
                        <div style="font-size: 24px; margin-bottom: 10px;">${service.icon}</div>
                        <h3>${service.title}</h3>
                        <p>${service.description}</p>
                        <p><strong>Длительность:</strong> ${service.duration}</p>
                        <div class="item-actions">
                            <button class="btn-edit" onclick="admin.openServiceModal(${service.id})">✏️ Редактировать</button>
                            <button class="btn-delete" onclick="admin.deleteService(${service.id})">🗑️ Удалить</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    openServiceModal(serviceId = null) {
        this.editingItem = serviceId;
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (serviceId) {
            modalTitle.textContent = 'Редактировать услугу';
            this.loadServiceData(serviceId);
        } else {
            modalTitle.textContent = 'Добавить услугу';
            modalBody.innerHTML = this.getServiceForm();
        }
        
        this.showModal();
    }

    getServiceForm(service = null) {
        return `
            <form id="serviceForm">
                <div class="form-row">
                    <label>Название услуги:</label>
                    <input type="text" id="serviceTitle" value="${service ? service.title : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Описание:</label>
                    <textarea id="serviceDescription" required>${service ? service.description : ''}</textarea>
                </div>
                
                <div class="form-row">
                    <label>Иконка:</label>
                    <input type="text" id="serviceIcon" value="${service ? service.icon : '💪'}" required>
                </div>
                
                <div class="form-row">
                    <label>Длительность:</label>
                    <input type="text" id="serviceDuration" value="${service ? service.duration : '60 мин'}" required>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="admin.closeModal()">Отмена</button>
                    <button type="submit" class="btn-primary">Сохранить</button>
                </div>
            </form>
        `;
    }

    async loadServiceData(serviceId) {
        const services = await this.getData('services');
        const service = services.find(s => s.id === serviceId);
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = this.getServiceForm(service);
        
        const serviceForm = document.getElementById('serviceForm');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveService(serviceId);
            });
        }
    }

    async saveService(serviceId = null) {
        const title = document.getElementById('serviceTitle').value;
        const description = document.getElementById('serviceDescription').value;
        const icon = document.getElementById('serviceIcon').value;
        const duration = document.getElementById('serviceDuration').value;

        const services = await this.getData('services');
        
        if (serviceId) {
            // Редактирование
            const index = services.findIndex(s => s.id === serviceId);
            if (index !== -1) {
                services[index] = { ...services[index], title, description, icon, duration };
            }
        } else {
            // Добавление
            services.push({
                id: generateId(),
                title,
                description,
                icon,
                duration
            });
        }

        await this.saveData('services', services);
        this.closeModal();
        this.loadTabContent();
        showNotification('Услуга сохранена!');
    }

    async deleteService(serviceId) {
        if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
            const services = await this.getData('services');
            const filteredServices = services.filter(s => s.id !== serviceId);
            await this.saveData('services', filteredServices);
            this.loadTabContent();
            showNotification('Услуга удалена!');
        }
    }

    // === ОБЩИЕ МЕТОДЫ ДЛЯ РАБОТЫ С ДАННЫМИ ===
    async getData(type) {
        const data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
        return data[type] || [];
    }

    async saveData(type, newData) {
        const data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
        data[type] = newData;
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        return true;
    }

    showModal() {
        document.getElementById('modalOverlay').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        this.editingItem = null;
    }

    // === ТРЕНЕРЫ ===
    async renderTrainersTab() {
        const trainers = await this.getData('trainers');
        return `
            <h2>👥 Управление тренерами</h2>
            <button class="add-btn" onclick="admin.openTrainerModal()">+ Добавить тренера</button>
            
            <div class="items-grid">
                ${trainers.map(trainer => `
                    <div class="item-card">
                        <div style="font-size: 24px; margin-bottom: 10px;">${trainer.photo}</div>
                        <h3>${trainer.name}</h3>
                        <p><strong>Специализация:</strong> ${trainer.specialization}</p>
                        <p><strong>Опыт:</strong> ${trainer.experience}</p>
                        <p>${trainer.description}</p>
                        <div class="item-actions">
                            <button class="btn-edit" onclick="admin.openTrainerModal(${trainer.id})">✏️ Редактировать</button>
                            <button class="btn-delete" onclick="admin.deleteTrainer(${trainer.id})">🗑️ Удалить</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    openTrainerModal(trainerId = null) {
        this.editingItem = trainerId;
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (trainerId) {
            modalTitle.textContent = 'Редактировать тренера';
            this.loadTrainerData(trainerId);
        } else {
            modalTitle.textContent = 'Добавить тренера';
            modalBody.innerHTML = this.getTrainerForm();
        }
        
        this.showModal();
    }

    getTrainerForm(trainer = null) {
        return `
            <form id="trainerForm">
                <div class="form-row">
                    <label>Имя тренера:</label>
                    <input type="text" id="trainerName" value="${trainer ? trainer.name : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Специализация:</label>
                    <input type="text" id="trainerSpecialization" value="${trainer ? trainer.specialization : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Опыт работы:</label>
                    <input type="text" id="trainerExperience" value="${trainer ? trainer.experience : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Иконка:</label>
                    <input type="text" id="trainerPhoto" value="${trainer ? trainer.photo : '👨‍💼'}" required>
                </div>
                
                <div class="form-row">
                    <label>Описание:</label>
                    <textarea id="trainerDescription" required>${trainer ? trainer.description : ''}</textarea>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="admin.closeModal()">Отмена</button>
                    <button type="submit" class="btn-primary">Сохранить</button>
                </div>
            </form>
        `;
    }

    async loadTrainerData(trainerId) {
        const trainers = await this.getData('trainers');
        const trainer = trainers.find(t => t.id === trainerId);
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = this.getTrainerForm(trainer);
        
        const trainerForm = document.getElementById('trainerForm');
        if (trainerForm) {
            trainerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTrainer(trainerId);
            });
        }
    }

    async saveTrainer(trainerId = null) {
        const name = document.getElementById('trainerName').value;
        const specialization = document.getElementById('trainerSpecialization').value;
        const experience = document.getElementById('trainerExperience').value;
        const photo = document.getElementById('trainerPhoto').value;
        const description = document.getElementById('trainerDescription').value;

        const trainers = await this.getData('trainers');
        
        if (trainerId) {
            // Редактирование
            const index = trainers.findIndex(t => t.id === trainerId);
            if (index !== -1) {
                trainers[index] = { ...trainers[index], name, specialization, experience, photo, description };
            }
        } else {
            // Добавление
            trainers.push({
                id: generateId(),
                name,
                specialization,
                experience,
                photo,
                description
            });
        }

        await this.saveData('trainers', trainers);
        this.closeModal();
        this.loadTabContent();
        showNotification('Тренер сохранен!');
    }

    async deleteTrainer(trainerId) {
        if (confirm('Вы уверены, что хотите удалить этого тренера?')) {
            const trainers = await this.getData('trainers');
            const filteredTrainers = trainers.filter(t => t.id !== trainerId);
            await this.saveData('trainers', filteredTrainers);
            this.loadTabContent();
            showNotification('Тренер удален!');
        }
    }

    // === РАСПИСАНИЕ ===
    async renderScheduleTab() {
        const schedule = await this.getData('schedule');
        return `
            <h2>📅 Управление расписанием</h2>
            <button class="add-btn" onclick="admin.openScheduleModal()">+ Добавить занятие</button>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>День</th>
                        <th>Время</th>
                        <th>Занятие</th>
                        <th>Тренер</th>
                        <th>Участники</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedule.map(item => `
                        <tr>
                            <td>${item.day}</td>
                            <td>${item.time}</td>
                            <td>${item.activity}</td>
                            <td>${item.trainer}</td>
                            <td>до ${item.maxParticipants}</td>
                            <td>
                                <button class="btn-edit" onclick="admin.openScheduleModal(${item.id})">✏️</button>
                                <button class="btn-delete" onclick="admin.deleteSchedule(${item.id})">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    openScheduleModal(scheduleId = null) {
        this.editingItem = scheduleId;
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (scheduleId) {
            modalTitle.textContent = 'Редактировать занятие';
            this.loadScheduleData(scheduleId);
        } else {
            modalTitle.textContent = 'Добавить занятие';
            modalBody.innerHTML = this.getScheduleForm();
        }
        
        this.showModal();
    }

    getScheduleForm(schedule = null) {
        return `
            <form id="scheduleForm">
                <div class="form-row">
                    <label>День недели:</label>
                    <select id="scheduleDay" required>
                        <option value="Понедельник" ${schedule && schedule.day === 'Понедельник' ? 'selected' : ''}>Понедельник</option>
                        <option value="Вторник" ${schedule && schedule.day === 'Вторник' ? 'selected' : ''}>Вторник</option>
                        <option value="Среда" ${schedule && schedule.day === 'Среда' ? 'selected' : ''}>Среда</option>
                        <option value="Четверг" ${schedule && schedule.day === 'Четверг' ? 'selected' : ''}>Четверг</option>
                        <option value="Пятница" ${schedule && schedule.day === 'Пятница' ? 'selected' : ''}>Пятница</option>
                        <option value="Суббота" ${schedule && schedule.day === 'Суббота' ? 'selected' : ''}>Суббота</option>
                        <option value="Воскресенье" ${schedule && schedule.day === 'Воскресенье' ? 'selected' : ''}>Воскресенье</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <label>Время:</label>
                    <input type="time" id="scheduleTime" value="${schedule ? schedule.time : '09:00'}" required>
                </div>
                
                <div class="form-row">
                    <label>Занятие:</label>
                    <input type="text" id="scheduleActivity" value="${schedule ? schedule.activity : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Тренер:</label>
                    <input type="text" id="scheduleTrainer" value="${schedule ? schedule.trainer : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Макс. участников:</label>
                    <input type="number" id="scheduleMaxParticipants" value="${schedule ? schedule.maxParticipants : '15'}" required>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="admin.closeModal()">Отмена</button>
                    <button type="submit" class="btn-primary">Сохранить</button>
                </div>
            </form>
        `;
    }

    async loadScheduleData(scheduleId) {
        const schedule = await this.getData('schedule');
        const scheduleItem = schedule.find(s => s.id === scheduleId);
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = this.getScheduleForm(scheduleItem);
        
        const scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSchedule(scheduleId);
            });
        }
    }

    async saveSchedule(scheduleId = null) {
        const day = document.getElementById('scheduleDay').value;
        const time = document.getElementById('scheduleTime').value;
        const activity = document.getElementById('scheduleActivity').value;
        const trainer = document.getElementById('scheduleTrainer').value;
        const maxParticipants = document.getElementById('scheduleMaxParticipants').value;

        const schedule = await this.getData('schedule');
        
        if (scheduleId) {
            // Редактирование
            const index = schedule.findIndex(s => s.id === scheduleId);
            if (index !== -1) {
                schedule[index] = { ...schedule[index], day, time, activity, trainer, maxParticipants };
            }
        } else {
            // Добавление
            schedule.push({
                id: generateId(),
                day,
                time,
                activity,
                trainer,
                maxParticipants
            });
        }

        await this.saveData('schedule', schedule);
        this.closeModal();
        this.loadTabContent();
        showNotification('Занятие сохранено!');
    }

    async deleteSchedule(scheduleId) {
        if (confirm('Вы уверены, что хотите удалить это занятие?')) {
            const schedule = await this.getData('schedule');
            const filteredSchedule = schedule.filter(s => s.id !== scheduleId);
            await this.saveData('schedule', filteredSchedule);
            this.loadTabContent();
            showNotification('Занятие удалено!');
        }
    }

    // === ЦЕНЫ ===
    async renderPricingTab() {
        const pricing = await this.getData('pricing');
        return `
            <h2>💰 Управление ценами</h2>
            <button class="add-btn" onclick="admin.openPricingModal()">+ Добавить тариф</button>
            
            <div class="items-grid">
                ${pricing.map(plan => `
                    <div class="item-card">
                        <h3>${plan.plan}</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #667eea;">${plan.price} ₽</p>
                        <p>за ${plan.period}</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                        <div class="item-actions">
                            <button class="btn-edit" onclick="admin.openPricingModal(${plan.id})">✏️ Редактировать</button>
                            <button class="btn-delete" onclick="admin.deletePricing(${plan.id})">🗑️ Удалить</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    openPricingModal(pricingId = null) {
        this.editingItem = pricingId;
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (pricingId) {
            modalTitle.textContent = 'Редактировать тариф';
            this.loadPricingData(pricingId);
        } else {
            modalTitle.textContent = 'Добавить тариф';
            modalBody.innerHTML = this.getPricingForm();
        }
        
        this.showModal();
    }

    getPricingForm(pricing = null) {
        return `
            <form id="pricingForm">
                <div class="form-row">
                    <label>Название тарифа:</label>
                    <input type="text" id="pricingPlan" value="${pricing ? pricing.plan : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Цена (₽):</label>
                    <input type="number" id="pricingPrice" value="${pricing ? pricing.price : ''}" required>
                </div>
                
                <div class="form-row">
                    <label>Период:</label>
                    <input type="text" id="pricingPeriod" value="${pricing ? pricing.period : 'месяц'}" required>
                </div>
                
                <div class="form-row">
                    <label>Возможности (через запятую):</label>
                    <textarea id="pricingFeatures" required>${pricing ? pricing.features.join(', ') : ''}</textarea>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="admin.closeModal()">Отмена</button>
                    <button type="submit" class="btn-primary">Сохранить</button>
                </div>
            </form>
        `;
    }

    async loadPricingData(pricingId) {
        const pricing = await this.getData('pricing');
        const pricingItem = pricing.find(p => p.id === pricingId);
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = this.getPricingForm(pricingItem);
        
        const pricingForm = document.getElementById('pricingForm');
        if (pricingForm) {
            pricingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePricing(pricingId);
            });
        }
    }

    async savePricing(pricingId = null) {
        const plan = document.getElementById('pricingPlan').value;
        const price = document.getElementById('pricingPrice').value;
        const period = document.getElementById('pricingPeriod').value;
        const features = document.getElementById('pricingFeatures').value.split(',').map(f => f.trim()).filter(f => f);

        const pricing = await this.getData('pricing');
        
        if (pricingId) {
            // Редактирование
            const index = pricing.findIndex(p => p.id === pricingId);
            if (index !== -1) {
                pricing[index] = { ...pricing[index], plan, price, period, features };
            }
        } else {
            // Добавление
            pricing.push({
                id: generateId(),
                plan,
                price,
                period,
                features
            });
        }

        await this.saveData('pricing', pricing);
        this.closeModal();
        this.loadTabContent();
        showNotification('Тариф сохранен!');
    }

    async deletePricing(pricingId) {
        if (confirm('Вы уверены, что хотите удалить этот тариф?')) {
            const pricing = await this.getData('pricing');
            const filteredPricing = pricing.filter(p => p.id !== pricingId);
            await this.saveData('pricing', filteredPricing);
            this.loadTabContent();
            showNotification('Тариф удален!');
        }
    }

    // === ЗАЯВКИ ===
    async renderLeadsTab() {
        const leads = await this.getData('leads');
        return `
            <h2>📋 Заявки от клиентов</h2>
            ${leads.length === 0 ? 
                '<p>Заявок пока нет. Новые заявки из формы обратной связи будут появляться здесь.</p>' : 
                `<table class="data-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Телефон</th>
                            <th>Email</th>
                            <th>Дата</th>
                            <th>Сообщение</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leads.map(lead => `
                            <tr>
                                <td>${lead.name || '-'}</td>
                                <td>${lead.phone || '-'}</td>
                                <td>${lead.email || '-'}</td>
                                <td>${new Date(lead.date).toLocaleDateString('ru-RU')}</td>
                                <td>${lead.message || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`
            }
        `;
    }

    // === НАСТРОЙКИ ===
    async renderSettingsTab() {
        const settings = await this.getData('settings');
        return `
            <h2>⚙️ Настройки сайта</h2>
            <form id="settingsForm">
                <div class="form-row">
                    <label>Название сайта:</label>
                    <input type="text" id="siteTitle" value="${settings.siteTitle}" required>
                </div>
                
                <div class="form-row">
                    <label>Телефон для связи:</label>
                    <input type="text" id="contactPhone" value="${settings.contactPhone}" required>
                </div>
                
                <div class="form-row">
                    <label>Email для связи:</label>
                    <input type="email" id="contactEmail" value="${settings.contactEmail}" required>
                </div>
                
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Сохранить настройки</button>
                </div>
            </form>
        `;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminPanel();
});