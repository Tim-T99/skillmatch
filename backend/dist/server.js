"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const import_aliases_1 = require("import-aliases");
(0, import_aliases_1.setupAliases)();
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("@app/routes/authRoutes"));
const usersRoute_1 = __importDefault(require("@app/routes/usersRoute"));
const booksRoute_1 = __importDefault(require("@app/routes/booksRoute"));
const borrowersRoute_1 = __importDefault(require("@app/routes/borrowersRoute"));
const errorMiddlewares_1 = require("@app/middlewares/errorMiddlewares");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:4200', 'http://skillmatch25.s3-website.eu-north-1.amazonaws.com'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log('Request Origin:', origin); // Log origin
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
    optionsSuccessStatus: 204
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", usersRoute_1.default);
app.use("/api/books", booksRoute_1.default);
app.use("/api/borrowers", borrowersRoute_1.default);
app.use((0, cookie_parser_1.default)());
app.use(errorMiddlewares_1.notFound);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port: ${PORT}`);
});
