"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const protect_1 = require("../middlewares/auth/protect");
const geminiController_1 = require("../controllers/geminiController");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('Auth route');
});
router.post('/gemini/query', protect_1.protect, geminiController_1.processGeminiQuery);
router.get('/users', protect_1.protect, userController_1.getUsers);
router.put('/users/:id/:role_id', protect_1.protect, userController_1.updateUser);
router.delete('/users/:id/:role_id', protect_1.protect, userController_1.deleteUser);
router.get('/dashboard', protect_1.protect, userController_1.getDashboardStats);
exports.default = router;
