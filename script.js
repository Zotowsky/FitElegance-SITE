class FitEleganceApp {
    constructor() {
        this.currentUser = null;
        this.classes = [];
        this.bookings = [];
        this.trainers = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSchedule();
        this.loadTrainers();
        this.checkAuthStatus();
        this.setupScrollAnimations();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                this.closeMobileMenu();
            });
        });

        
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterModal());

        
        document.getElementById('startTrainingBtn').addEventListener('click', () => this.scrollToServices());
        document.getElementById('trialClassBtn').addEventListener('click', () => this.showRegisterModal());

        
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });
        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterSchedule(e.target));
        });

        
        document.querySelectorAll('.pricing-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePricingSelect(e.target));
        });

        
        document.querySelectorAll('.trainer-more').forEach(btn => {
            btn.addEventListener('click', (e) => this.showTrainerDetails(e.target.getAttribute('data-trainer')));
        });

        
        document.querySelector('.hamburger').addEventListener('click', () => this.toggleMobileMenu());

        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        
        window.addEventListener('scroll', () => this.handleScroll());
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        
        document.querySelectorAll('.about-item, .service-card, .trainer-card, .pricing-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        
        this.animateStats();
    }

    animateStats() {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target.querySelector('.stat-number');
                    const target = parseInt(statNumber.getAttribute('data-target'));
                    this.animateCounter(statNumber, target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-item').forEach(stat => {
            statObserver.observe(stat);
        });
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 20);
    }

    handleScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
    }

    async loadSchedule() {
        try {
            const response = await fetch('/api/classes');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            this.classes = await response.json();
            this.renderSchedule();
        } catch (error) {
            console.error('Error loading schedule:', error);
            this.showNotification('Ошибка загрузки расписания', 'error');
            this.useDemoScheduleData();
        }
    }

    useDemoScheduleData() {
        console.log('Using demo data for schedule');
        this.classes = [
            {
                id: 1,
                name: "Утренняя йога",
                type: "yoga",
                trainer: "Анна Иванова",
                trainer_name: "Анна Иванова",
                day: "monday",
                time: "07:00",
                capacity: 15,
                booked: 8,
                description: "Начало дня с мягкой йогой",
                price: 800
            },
            {
                id: 2,
                name: "Пилатес для начинающих",
                type: "pilates",
                trainer: "Мария Петрова",
                trainer_name: "Мария Петрова",
                day: "monday",
                time: "09:00",
                capacity: 10,
                booked: 6,
                description: "Основы пилатеса для новичков",
                price: 800
            },
            {
                id: 3,
                name: "Стретчинг",
                type: "stretching",
                trainer: "Елена Козлова",
                trainer_name: "Елена Козлова",
                day: "monday",
                time: "18:00",
                capacity: 12,
                booked: 7,
                description: "Растяжка для всех уровней",
                price: 800
            },
            {
                id: 4,
                name: "Функциональный тренинг",
                type: "functional",
                trainer: "Дмитрий Смирнов",
                trainer_name: "Дмитрий Смирнов",
                day: "tuesday",
                time: "08:00",
                capacity: 8,
                booked: 6,
                description: "Силовая тренировка всего тела",
                price: 800
            },
            {
                id: 5,
                name: "Йога для продвинутых",
                type: "yoga",
                trainer: "Анна Иванова",
                trainer_name: "Анна Иванова",
                day: "tuesday",
                time: "19:00",
                capacity: 12,
                booked: 9,
                description: "Продвинутые асаны и практики",
                price: 1000
            },
            {
                id: 6,
                name: "Пилатес на реформере",
                type: "pilates",
                trainer: "Мария Петрова",
                trainer_name: "Мария Петрова",
                day: "wednesday",
                time: "10:00",
                capacity: 6,
                booked: 5,
                description: "Интенсивный пилатес на оборудовании",
                price: 1200
            },
            {
                id: 7,
                name: "Виньяса флоу",
                type: "yoga",
                trainer: "Анна Иванова",
                trainer_name: "Анна Иванова",
                day: "wednesday",
                time: "18:30",
                capacity: 15,
                booked: 11,
                description: "Динамическая йога в потоке",
                price: 1000
            },
            {
                id: 8,
                name: "TRX тренировка",
                type: "functional",
                trainer: "Дмитрий Смирнов",
                trainer_name: "Дмитрий Смирнов",
                day: "thursday",
                time: "08:30",
                capacity: 8,
                booked: 6,
                description: "Функциональный тренинг с TRX",
                price: 1000
            }
        ];
        this.renderSchedule();
    }

    async loadTrainers() {
        try {
            const response = await fetch('/api/trainers');
            if (response.ok) {
                this.trainers = await response.json();
            }
        } catch (error) {
            console.error('Error loading trainers:', error);
        }
    }

    renderSchedule(filter = this.currentFilter) {
        const scheduleTable = document.getElementById('scheduleTable');
        
        if (!this.classes || this.classes.length === 0) {
            scheduleTable.innerHTML = '<div class="no-classes">Нет доступных занятий</div>';
            return;
        }

        const days = [
            { name: 'Понедельник', key: 'monday' },
            { name: 'Вторник', key: 'tuesday' },
            { name: 'Среда', key: 'wednesday' },
            { name: 'Четверг', key: 'thursday' },
            { name: 'Пятница', key: 'friday' },
            { name: 'Суббота', key: 'saturday' },
            { name: 'Воскресенье', key: 'sunday' }
        ];
        
        let scheduleHTML = '';
        let hasClasses = false;
        
        days.forEach(dayInfo => {
            const dayClasses = this.classes.filter(cls => {
                const matchesDay = cls.day === dayInfo.key;
                const matchesFilter = filter === 'all' || cls.type === filter;
                return matchesDay && matchesFilter;
            });
            
            if (dayClasses.length > 0) {
                hasClasses = true;
                scheduleHTML += `
                    <div class="schedule-day">
                        <h3>${dayInfo.name}</h3>
                        ${dayClasses.map(cls => `
                            <div class="class-item" data-class-id="${cls.id}">
                                <div class="class-info">
                                    <span class="class-time">${cls.time}</span>
                                    <div>
                                        <div class="class-name">${cls.name}</div>
                                        <div class="class-trainer">${cls.trainer_name || cls.trainer}</div>
                                        ${cls.description ? `<div class="class-description">${cls.description}</div>` : ''}
                                    </div>
                                </div>
                                <div class="class-actions">
                                    <span class="class-capacity">${cls.booked}/${cls.capacity}</span>
                                    ${this.currentUser ? 
                                        `<button class="btn-outline book-btn" ${cls.booked >= cls.capacity ? 'disabled' : ''}>
                                            ${cls.booked >= cls.capacity ? 'Мест нет' : 'Записаться'}
                                        </button>` :
                                        `<button class="btn-outline" onclick="app.showLoginModal()">Войти для записи</button>`
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        });

        if (!hasClasses) {
            scheduleHTML = `
                <div class="no-classes">
                    <p>Нет занятий по выбранному фильтру</p>
                    <button class="btn-outline" onclick="app.filterSchedule('all')">Показать все занятия</button>
                </div>
            `;
        }

        scheduleTable.innerHTML = scheduleHTML;

        document.querySelectorAll('.book-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classItem = e.target.closest('.class-item');
                const classId = classItem.getAttribute('data-class-id');
                this.showBookingModal(classId);
            });
        });
    }

    filterSchedule(button) {
        let filter;
        
        if (typeof button === 'string') {
            filter = button;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.getAttribute('data-filter') === filter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        } else {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filter = button.getAttribute('data-filter');
        }
        
        this.currentFilter = filter;
        this.renderSchedule(filter);
    }

    showLoginModal() {
        this.closeAllModals();
        document.getElementById('loginModal').style.display = 'block';
    }

    showRegisterModal() {
        this.closeAllModals();
        document.getElementById('registerModal').style.display = 'block';
    }

    showProfileModal() {
        this.closeAllModals();
        this.renderProfileContent();
        document.getElementById('profileModal').style.display = 'block';
    }

    showBookingModal(classId) {
        this.closeAllModals();
        const classData = this.classes.find(cls => cls.id == classId);
        if (classData) {
            this.renderBookingContent(classData);
            document.getElementById('bookingModal').style.display = 'block';
        }
    }

    showTrainerDetails(trainerId) {
        this.closeAllModals();
        const trainer = this.trainers.find(t => t.id == trainerId) || this.getDemoTrainer(trainerId);
        if (trainer) {
            this.renderTrainerContent(trainer);
            document.getElementById('trainerModal').style.display = 'block';
        }
    }

    getDemoTrainer(trainerId) {
        const demoTrainers = {
            1: {
                id: 1,
                name: "Анна Иванова",
                specialty: "Йога, Стретчинг",
                bio: "Сертифицированный инструктор по йоге с 8-летним опытом. Специализируется на хатха йоге и виньяса флоу. Помогает клиентам найти гармонию тела и разума через древние практики.",
                experience_years: 8,
                image_url: "img\anna.jpg",
                certifications: "RYT 500, Yoga Alliance International, Pilates Mat Certification, Mindfulness Meditation Teacher"
            },
            2: {
                id: 2,
                name: "Мария Петрова", 
                specialty: "Пилатес, Функциональный тренинг",
                bio: "Специалист по реабилитации и коррекции осанки с 6-летним опытом. Работает с клиентами над укреплением мышечного корсета и улучшением осанки.",
                experience_years: 6,
                image_url: "img\maria.jpg",
                certifications: "STOTT PILATES Certified, Functional Training Specialist, Rehabilitation Exercise Specialist"
            },
            3: {
                id: 3,
                name: "Дмитрий Смирнов",
                specialty: "Функциональный тренинг", 
                bio: "Мастер спорта по легкой атлетике с 6-летним опытом работы. Специализируется на функциональном тренинге и TRX. Помогает развить силу и выносливость.",
                experience_years: 6,
                image_url: "img\dima.png",
                certifications: "NSCA Certified Personal Trainer, TRX Suspension Training Course, Sports Nutrition Specialist"
            },
            4: {
                id: 4,
                name: "Елена Козлова",
                specialty: "Стретчинг, Пилатес",
                bio: "Сертифицированный инструктор по стретчингу и пилатесу с 5-летним опытом. Помогает достичь гибкости, улучшить осанку и снять мышечное напряжение.",
                experience_years: 5,
                image: "img\elena.jpg", 
                certifications: "Flexibility Training Specialist, Balanced Body Pilates, Myofascial Release Techniques"
            }
        };
        return demoTrainers[trainerId];
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    toggleMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    closeMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                this.currentUser = result.user;
                this.updateAuthUI();
                this.closeAllModals();
                this.showNotification('Успешный вход! Добро пожаловать!', 'success');
                this.loadSchedule(); 
            } else {
                this.showNotification(result.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            subscription_type: formData.get('subscription_type')
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                this.currentUser = result.user;
                this.updateAuthUI();
                this.closeAllModals();
                this.showNotification('Регистрация успешна! Добро пожаловать в FitElegance!', 'success');
                this.loadSchedule(); 
            } else {
                this.showNotification(result.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    this.currentUser = await response.json();
                    this.updateAuthUI();
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.nav-auth');
        if (this.currentUser) {
            authButtons.innerHTML = `
                <button class="btn-primary" onclick="app.showProfileModal()">Личный кабинет</button>
                <button class="btn-login" onclick="app.logout()">Выйти</button>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn-login" id="loginBtn">Войти</button>
                <button class="btn-register" id="registerBtn">Регистрация</button>
            `;
            
            document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
            document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterModal());
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.updateAuthUI();
        this.showNotification('Вы вышли из системы', 'success');
        this.loadSchedule(); 
    }

    renderProfileContent() {
        const profileContent = document.getElementById('profileContent');
        profileContent.innerHTML = `
            <div class="profile-info">
                <h3>Личная информация</h3>
                <div class="profile-details">
                    <p><strong>Имя:</strong> ${this.currentUser.name}</p>
                    <p><strong>Email:</strong> ${this.currentUser.email}</p>
                    <p><strong>Телефон:</strong> ${this.currentUser.phone}</p>
                    <p><strong>Абонемент:</strong> ${this.getSubscriptionName(this.currentUser.subscription_type)}</p>
                    <p><strong>Дата регистрации:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                </div>
            </div>
            <div class="booked-classes">
                <h3>Мои записи</h3>
                <div id="userBookings">
                    Загрузка...
                </div>
            </div>
            <div class="progress-section">
                <h3>Мой прогресс</h3>
                <div id="userProgress">
                    Загрузка...
                </div>
            </div>
        `;

        this.loadUserBookings();
        this.loadUserProgress();
    }

    async loadUserBookings() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bookings/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const bookings = await response.json();
                this.displayUserBookings(bookings);
            } else {
                this.displayUserBookings([]);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.displayUserBookings([]);
        }
    }

    displayUserBookings(bookings) {
        const bookingsContainer = document.getElementById('userBookings');
        
        if (bookings.length === 0) {
            bookingsContainer.innerHTML = '<p>У вас нет записанных занятий</p>';
            return;
        }

        const bookingsHTML = bookings.map(booking => `
            <div class="class-item">
                <div class="class-info">
                    <span class="class-time">${booking.class_time}</span>
                    <div>
                        <div class="class-name">${booking.class_name}</div>
                        <div class="class-trainer">${booking.trainer_name}</div>
                        <div class="class-description">${new Date(booking.booking_date).toLocaleDateString('ru-RU')}</div>
                    </div>
                </div>
                <div class="class-actions">
                    <button class="btn-outline cancel-btn" data-booking-id="${booking.id}">Отменить</button>
                </div>
            </div>
        `).join('');
        
        bookingsContainer.innerHTML = bookingsHTML;

        
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                this.cancelBooking(bookingId);
            });
        });
    }

    async loadUserProgress() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            let progressHTML = '';
            if (response.ok) {
                const progress = await response.json();
                if (progress.length > 0) {
                    progressHTML = progress.map(p => `
                        <div class="progress-item">
                            <p><strong>${new Date(p.date).toLocaleDateString('ru-RU')}:</strong> ${p.weight} кг</p>
                            <p>${p.notes}</p>
                        </div>
                    `).join('');
                } else {
                    progressHTML = '<p>Записей о прогрессе пока нет</p>';
                }
            } else {
                progressHTML = `
                    <p>Отслеживайте свой прогресс в тренировках</p>
                    <p>Вес: 65 кг (текущий)</p>
                    <p>Последняя тренировка: ${new Date().toLocaleDateString('ru-RU')}</p>
                `;
            }
            
            document.getElementById('userProgress').innerHTML = progressHTML;
        } catch (error) {
            document.getElementById('userProgress').innerHTML = `
                <p>Функция отслеживания прогресса скоро будет доступна</p>
                <p>Следите за обновлениями!</p>
            `;
        }
    }

    renderBookingContent(classData) {
        const bookingContent = document.getElementById('bookingContent');
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        bookingContent.innerHTML = `
            <div class="class-item">
                <div class="class-info">
                    <span class="class-time">${classData.time}</span>
                    <div>
                        <div class="class-name">${classData.name}</div>
                        <div class="class-trainer">${classData.trainer_name || classData.trainer}</div>
                        <div class="class-description">${classData.description}</div>
                    </div>
                </div>
            </div>
            <form id="bookingForm">
                <div class="form-group">
                    <label for="bookingDate">Дата занятия</label>
                    <input type="date" id="bookingDate" required 
                           min="${new Date().toISOString().split('T')[0]}" 
                           max="${nextWeek.toISOString().split('T')[0]}">
                </div>
                <button type="submit" class="btn-primary">Подтвердить запись</button>
            </form>
        `;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('bookingDate').value = tomorrow.toISOString().split('T')[0];

        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmBooking(classData.id);
        });
    }

    renderTrainerContent(trainer) {
        const trainerContent = document.getElementById('trainerContent');
        trainerContent.innerHTML = `
            <div class="trainer-details">
                <img src="${trainer.image_url}" alt="${trainer.name}">
                <h3>${trainer.name}</h3>
                <p class="trainer-specialty">${trainer.specialty}</p>
                <div class="trainer-experience">Опыт работы: ${trainer.experience_years} лет</div>
                <div class="trainer-bio-full">
                    <p>${trainer.bio}</p>
                </div>
                <div class="trainer-certifications">
                    <h4>Сертификаты и квалификации:</h4>
                    <p>${trainer.certifications}</p>
                </div>
            </div>
        `;
    }

    async confirmBooking(classId) {
        try {
            const token = localStorage.getItem('token');
            const bookingDate = document.getElementById('bookingDate').value;
            
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    class_id: classId,
                    booking_date: bookingDate
                })
            });

            if (response.ok) {
                this.closeAllModals();
                this.showNotification('Запись успешно оформлена! Ждем вас на занятии!', 'success');
                this.loadUserBookings();
                this.loadSchedule();
            } else {
                const result = await response.json();
                this.showNotification(result.error || 'Ошибка записи на занятие', 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Вы уверены, что хотите отменить запись?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.showNotification('Запись успешно отменена', 'success');
                this.loadUserBookings();
                this.loadSchedule();
            } else {
                this.showNotification('Ошибка отмены записи', 'error');
            }
        } catch (error) {
            console.error('Cancel booking error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    handlePricingSelect(button) {
        if (!this.currentUser) {
            this.showRegisterModal();
            const plan = button.getAttribute('data-plan');
            document.getElementById('registerSubscription').value = plan;
        } else {
            this.showNotification('У вас уже есть активный аккаунт', 'info');
        }
    }

    scrollToServices() {
        document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
    }

    getSubscriptionName(type) {
        const subscriptions = {
            'single': 'Разовый',
            'monthly': 'Месячный',
            'unlimited': 'Безлимитный'
        };
        return subscriptions[type] || type;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FitEleganceApp();
});