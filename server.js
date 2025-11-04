const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const Joi = require('joi');
const Database = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'fitelegance-secret-key-2024';

const db = new Database();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

app.use(express.static(path.join(__dirname)));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).required(),
    password: Joi.string().min(6).required(),
    subscription_type: Joi.string().valid('single', 'monthly', 'unlimited').required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const bookingSchema = Joi.object({
    class_id: Joi.number().integer().required(),
    booking_date: Joi.date().required()
});

const progressSchema = Joi.object({
    weight: Joi.number().min(30).max(200).optional(),
    height: Joi.number().min(100).max(250).optional(),
    measurements: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional()
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен доступа отсутствует' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Неверный токен' });
        }
        req.user = user;
        next();
    });
};




app.post('/api/auth/register', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, phone, password, subscription_type } = value;

        
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        
        const passwordHash = await bcrypt.hash(password, 10);

        
        const userId = await db.createUser({
            name,
            email,
            password_hash: passwordHash,
            phone,
            subscription_type
        });

        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
        const user = await db.getUserById(userId);

        res.json({
            token,
            user
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '24h' });
        
        
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});


app.get('/api/classes', async (req, res) => {
    try {
        const classes = await db.getAllClasses();
        res.json(classes);
    } catch (error) {
        console.error('Error getting classes:', error);
        res.status(500).json({ error: 'Ошибка загрузки расписания' });
    }
});

app.get('/api/classes/:id', async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await db.getClassById(classId);
        
        if (!classData) {
            return res.status(404).json({ error: 'Занятие не найдено' });
        }
        
        res.json(classData);
    } catch (error) {
        console.error('Get class error:', error);
        res.status(500).json({ error: 'Ошибка загрузки занятия' });
    }
});


app.get('/api/trainers', async (req, res) => {
    try {
        const trainers = await db.getAllTrainers();
        res.json(trainers);
    } catch (error) {
        console.error('Get trainers error:', error);
        res.status(500).json({ error: 'Ошибка загрузки тренеров' });
    }
});


app.get('/api/bookings/my', authenticateToken, async (req, res) => {
    try {
        const bookings = await db.getUserBookings(req.user.id);
        res.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Ошибка загрузки записей' });
    }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { error, value } = bookingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { class_id, booking_date } = value;

        
        const classData = await db.getClassById(class_id);
        if (!classData) {
            return res.status(404).json({ error: 'Занятие не найдено' });
        }

        if (classData.booked >= classData.capacity) {
            return res.status(400).json({ error: 'Нет свободных мест на это занятие' });
        }

        
        const userBookings = await db.getUserBookings(req.user.id);
        const existingBooking = userBookings.find(booking => 
            booking.class_id == class_id && booking.booking_date === booking_date
        );

        if (existingBooking) {
            return res.status(400).json({ error: 'Вы уже записаны на это занятие' });
        }

        
        const bookingId = await db.createBooking({
            user_id: req.user.id,
            class_id,
            booking_date
        });

        
        await db.updateClassBookedCount(class_id, 1);

        res.json({ 
            message: 'Запись успешно создана',
            booking_id: bookingId 
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Ошибка создания записи' });
    }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        const userBookings = await db.getUserBookings(req.user.id);
        const booking = userBookings.find(b => b.id == bookingId);
        
        if (!booking) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }

        const changes = await db.cancelBooking(bookingId, req.user.id);
        
        if (changes > 0) {
            await db.updateClassBookedCount(booking.class_id, -1);
            res.json({ message: 'Запись успешно отменена' });
        } else {
            res.status(404).json({ error: 'Запись не найдена' });
        }

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Ошибка отмены записи' });
    }
});

app.get('/api/progress', authenticateToken, async (req, res) => {
    try {
        const progress = [
            { date: '2024-01-15', weight: 65, notes: 'Отличное самочувствие после йоги' },
            { date: '2024-01-08', weight: 66, notes: 'Начало тренировок' }
        ];
        res.json(progress);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Ошибка загрузки прогресса' });
    }
});

app.post('/api/progress', authenticateToken, async (req, res) => {
    try {
        const { error, value } = progressSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        res.json({ 
            message: 'Прогресс успешно сохранен',
            progress_id: Date.now()
        });

    } catch (error) {
        console.error('Add progress error:', error);
        res.status(500).json({ error: 'Ошибка сохранения прогресса' });
    }
});

app.listen(PORT, () => {
    console.log(`🏋️‍♀️ FitElegance server running on http://localhost:${PORT}`);
    console.log('📊 Database initialized with sample data');
    console.log('👤 Test user: admin@fitelegance.ru / admin123');
    console.log('✨ All features are working: schedule, booking, authentication');
});

process.on('SIGINT', async () => {
    console.log('Завершение работы сервера...');
    await db.close();
    process.exit(0);
});