"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_config_1 = __importDefault(require("./config/db.config"));
const usersRoute_1 = __importDefault(require("./routes/usersRoute"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const jobsRoute_1 = __importDefault(require("./routes/jobsRoute"));
const chartsRoutes_1 = __importDefault(require("./routes/chartsRoutes"));
const seekerRoutes_1 = __importDefault(require("./routes/seekerRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const geminiroute_1 = __importDefault(require("./routes/geminiroute"));
const errorMiddlewares_1 = require("./middlewares/errorMiddlewares");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:4200', 'http://skillmatch25.s3-website.eu-north-1.amazonaws.com'];
        console.log('Request Origin:', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
app.get('/', async (req, res, next) => {
    try {
        // Test RDS connection
        const result = await db_config_1.default.query('SELECT NOW()');
        res.status(200).json({
            message: 'Welcome to SkillMatch backend',
            databaseTime: result.rows[0].now
        });
    }
    catch (error) {
        console.error('Database error in root route:', error);
        next(error);
    }
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', authRoutes_1.default);
app.use('/api', jobsRoute_1.default);
app.use('/api', chartsRoutes_1.default);
app.use('/api', seekerRoutes_1.default);
app.use('/api', adminRoutes_1.default);
app.use('/api', usersRoute_1.default);
app.use('/api', geminiroute_1.default);
app.use(errorMiddlewares_1.notFound);
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: err.message || 'Internal server error',
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port: ${PORT}`);
});
