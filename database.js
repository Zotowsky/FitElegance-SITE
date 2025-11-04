const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        const dbPath = path.join(__dirname, 'fitelegance.db');
        
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('✅ Connected to SQLite database');
                this.createTables();
            }
        });
    }

    createTables() {
        console.log('Creating tables...');
        
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                phone TEXT,
                subscription_type TEXT DEFAULT 'single',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS trainers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                specialty TEXT NOT NULL,
                bio TEXT,
                experience_years INTEGER,
                image_url TEXT,
                certifications TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                trainer_id INTEGER,
                trainer_name TEXT NOT NULL,
                day TEXT NOT NULL,
                time TEXT NOT NULL,
                duration INTEGER DEFAULT 60,
                capacity INTEGER DEFAULT 10,
                booked INTEGER DEFAULT 0,
                price DECIMAL(10,2) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                booking_date DATE NOT NULL,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                weight DECIMAL(5,2),
                height DECIMAL(5,2),
                measurements TEXT,
                notes TEXT,
                progress_date DATE DEFAULT CURRENT_DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        let completed = 0;
        
        tables.forEach((tableSQL, index) => {
            this.db.run(tableSQL, (err) => {
                if (err) {
                    console.error(`❌ Error creating table ${index + 1}:`, err.message);
                } else {
                    console.log(`✅ Table ${index + 1} created successfully`);
                }
                completed++;
                
                if (completed === tables.length) {
                    this.checkAndInsertSampleData();
                }
            });
        });
    }

    checkAndInsertSampleData() {
        console.log('Checking for existing data...');
        
        this.db.get("SELECT COUNT(*) as count FROM trainers", async (err, row) => {
            if (err) {
                console.error('Error checking data:', err.message);
                return;
            }
            
            if (row.count === 0) {
                console.log('Inserting sample data...');
                await this.insertSampleData();
            } else {
                console.log('✅ Database already contains data');
                this.displaySampleCredentials();
            }
        });
    }

    async insertSampleData() {
        try {
            await this.insertTrainers();
            await this.insertClasses();
            await this.insertAdminUser();
            console.log('✅ Sample data inserted successfully');
            this.displaySampleCredentials();
        } catch (error) {
            console.error('Error inserting sample data:', error);
        }
    }

    async insertTrainers() {
        return new Promise((resolve, reject) => {
            const trainers = [
                ['Анна Иванова', 'Йога, Стретчинг', 'Сертифицированный инструктор по йоге с 8-летним опытом. Специализируется на хатха йоге и виньяса флоу.', 8, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face', 'RYT 500, Yoga Alliance International, Pilates Mat Certification'],
                ['Мария Петрова', 'Пилатес, Функциональный тренинг', 'Специалист по реабилитации и коррекции осанки. Опыт работы 6 лет.', 6, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=face', 'STOTT PILATES Certified, Functional Training Specialist'],
                ['Дмитрий Смирнов', 'Функциональный тренинг', 'Мастер спорта по легкой атлетике, опыт работы 6 лет. Специализируется на функциональном тренинге и TRX.', 6, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', 'NSCA Certified Personal Trainer, TRX Suspension Training Course'],
                ['Елена Козлова', 'Стретчинг, Пилатес', 'Сертифицированный инструктор по стретчингу и пилатесу. Помогает достичь гибкости и улучшить осанку.', 5, 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400&h=400&fit=crop&crop=face', 'Flexibility Training Specialist, Balanced Body Pilates']
            ];

            const stmt = this.db.prepare(`INSERT INTO trainers (name, specialty, bio, experience_years, image_url, certifications) VALUES (?, ?, ?, ?, ?, ?)`);
            
            let inserted = 0;
            trainers.forEach(trainer => {
                stmt.run(trainer, (err) => {
                    if (err) {
                        console.error('Error inserting trainer:', err.message);
                    } else {
                        inserted++;
                    }
                    
                    if (inserted === trainers.length) {
                        stmt.finalize();
                        resolve();
                    }
                });
            });
        });
    }

    async insertClasses() {
        return new Promise((resolve, reject) => {
            const classes = [
                // Monday
                ['Утренняя йoga', 'Начало дня с мягкой йогой', 'yoga', 1, 'Анна Иванова', 'monday', '07:00', 60, 15, 8, 800],
                ['Пилатес для начинающих', 'Основы пилатеса для новичков', 'pilates', 2, 'Мария Петрова', 'monday', '09:00', 60, 10, 6, 800],
                ['Функциональный тренинг', 'Силовая тренировка всего тела', 'functional', 3, 'Дмитрий Смирнов', 'monday', '17:00', 60, 8, 5, 800],
                ['Стретчинг', 'Растяжка для всех уровней', 'stretching', 4, 'Елена Козлова', 'monday', '19:00', 60, 12, 7, 800],

                // Tuesday
                ['Йога для продвинутых', 'Продвинутые асаны и практики', 'yoga', 1, 'Анна Иванова', 'tuesday', '08:00', 75, 12, 9, 1000],
                ['Пилатес на реформере', 'Интенсивный пилатес на оборудовании', 'pilates', 2, 'Мария Петрова', 'tuesday', '10:00', 60, 6, 4, 1200],
                ['TRX тренировка', 'Функциональный тренинг с TRX', 'functional', 3, 'Дмитрий Смирнов', 'tuesday', '18:00', 60, 8, 6, 1000],
                ['Глубокий стретчинг', 'Работа с глубокими мышцами', 'stretching', 4, 'Елена Козлова', 'tuesday', '20:00', 60, 10, 5, 800],

                // Wednesday
                ['Виньяса флоу', 'Динамическая йога в потоке', 'yoga', 1, 'Анна Иванова', 'wednesday', '07:30', 75, 15, 11, 800],
                ['Пилатес для спины', 'Укрепление мышц спины и корсета', 'pilates', 2, 'Мария Петрова', 'wednesday', '09:30', 60, 10, 7, 800],
                ['Функциональный круг', 'Круговая тренировка', 'functional', 3, 'Дмитрий Смирнов', 'wednesday', '17:30', 60, 8, 6, 800],
                ['Растяжка для шпагата', 'Целевая работа на гибкость', 'stretching', 4, 'Елена Козлова', 'wednesday', '19:30', 60, 12, 8, 800],

                // Thursday
                ['Хатха йога', 'Классическая йога для гармонии', 'yoga', 1, 'Анна Иванова', 'thursday', '08:30', 60, 12, 8, 800],
                ['Пилатес + Стретчинг', 'Комбинированное занятие', 'pilates', 2, 'Мария Петрова', 'thursday', '10:30', 75, 8, 5, 1000],
                ['Силовой тренинг', 'Развитие силы и выносливости', 'functional', 3, 'Дмитрий Смирнов', 'thursday', '18:30', 60, 6, 4, 1000],
                ['Йога для релаксации', 'Расслабляющая практика', 'yoga', 1, 'Анна Иванова', 'thursday', '20:30', 60, 15, 9, 800],

                // Friday
                ['Аштанга йога', 'Динамичный стиль йоги', 'yoga', 1, 'Анна Иванова', 'friday', '07:00', 75, 12, 7, 1000],
                ['Пилатес для продвинутых', 'Сложные упражнения и последовательности', 'pilates', 2, 'Мария Петрова', 'friday', '09:00', 60, 8, 6, 1000],
                ['Функциональный интервал', 'Интервальная тренировка', 'functional', 3, 'Дмитрий Смирнов', 'friday', '17:00', 45, 10, 8, 800],
                ['Суставная гимнастика', 'Улучшение мобильности суставов', 'stretching', 4, 'Елена Козлова', 'friday', '19:00', 60, 15, 10, 800],

                // Saturday
                ['Йога для начинающих', 'Основы йоги для новичков', 'yoga', 1, 'Анна Иванова', 'saturday', '10:00', 60, 15, 12, 800],
                ['Утренний пилатес', 'Энергичное начало дня', 'pilates', 2, 'Мария Петрова', 'saturday', '11:30', 60, 10, 8, 800],
                ['Функциональный выходной', 'Тренировка в расслабленном темпе', 'functional', 3, 'Дмитрий Смирнов', 'saturday', '13:00', 60, 8, 5, 800],
                ['Стретчинг всего тела', 'Комплексная растяжка', 'stretching', 4, 'Елена Козлова', 'saturday', '15:00', 60, 12, 9, 800],

                // Sunday
                ['Йога Нидра', 'Практика глубокого расслабления', 'yoga', 1, 'Анна Иванова', 'sunday', '11:00', 90, 20, 15, 1000],
                ['Воскресный стретчинг', 'Расслабляющая растяжка', 'stretching', 4, 'Елена Козлова', 'sunday', '13:00', 60, 15, 11, 800]
            ];

            const stmt = this.db.prepare(`INSERT INTO classes (name, description, type, trainer_id, trainer_name, day, time, duration, capacity, booked, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            
            let inserted = 0;
            classes.forEach(classData => {
                stmt.run(classData, (err) => {
                    if (err) {
                        console.error('Error inserting class:', err.message);
                    } else {
                        inserted++;
                    }
                    
                    if (inserted === classes.length) {
                        stmt.finalize();
                        resolve();
                    }
                });
            });
        });
    }

    async insertAdminUser() {
        return new Promise((resolve, reject) => {
            bcrypt.hash('admin123', 10, (err, passwordHash) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                this.db.run(
                    `INSERT OR IGNORE INTO users (name, email, password_hash, phone, subscription_type) VALUES (?, ?, ?, ?, ?)`,
                    ['Администратор', 'admin@fitelegance.ru', passwordHash, '+79991234567', 'unlimited'],
                    (err) => {
                        if (err) {
                            console.error('Error inserting admin user:', err.message);
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        });
    }

    displaySampleCredentials() {
        console.log('\n=== ТЕСТОВЫЕ УЧЕТНЫЕ ЗАПИСИ ===');
        console.log('Email: admin@fitelegance.ru');
        console.log('Password: admin123');
        console.log('==============================\n');
    }

    
    createUser(userData) {
        return new Promise((resolve, reject) => {
            const { name, email, password_hash, phone, subscription_type } = userData;
            
            this.db.run(
                `INSERT INTO users (name, email, password_hash, phone, subscription_type) VALUES (?, ?, ?, ?, ?)`,
                [name, email, password_hash, phone, subscription_type],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, name, email, phone, subscription_type, created_at FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    
    getAllClasses() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM classes ORDER BY day, time',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    getClassById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM classes WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    
    createBooking(bookingData) {
        return new Promise((resolve, reject) => {
            const { user_id, class_id, booking_date } = bookingData;
            
            this.db.run(
                'INSERT INTO bookings (user_id, class_id, booking_date) VALUES (?, ?, ?)',
                [user_id, class_id, booking_date],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    getUserBookings(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT b.id, b.booking_date, b.status, b.created_at,
                        c.name as class_name, c.time as class_time, c.trainer_name,
                        t.specialty as trainer_specialty
                 FROM bookings b
                 JOIN classes c ON b.class_id = c.id
                 JOIN trainers t ON c.trainer_id = t.id
                 WHERE b.user_id = ? AND b.status = 'active'
                 ORDER BY b.booking_date, c.time`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    cancelBooking(bookingId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE bookings SET status = 'cancelled' 
                 WHERE id = ? AND user_id = ?`,
                [bookingId, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }

    
    updateClassBookedCount(classId, change) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE classes SET booked = booked + ? WHERE id = ?',
                [change, classId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }

    
    getAllTrainers() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM trainers ORDER BY name',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

if (require.main === module) {
    console.log('🚀 Initializing FitElegance database...');
    new Database();
}

module.exports = Database;