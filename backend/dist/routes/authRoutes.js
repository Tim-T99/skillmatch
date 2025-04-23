"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const protect_1 = require("../middlewares/auth/protect");
const seekerController_1 = require("../controllers/seekerController");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('Auth route');
});
// Public routes
router.post('/register/admin', authController_1.createUser);
router.post('/register', authController_1.createEmployer);
router.post('/register/seeker', authController_1.createSeeker);
router.post('/login', authController_1.loginUser);
router.post('/logout', authController_1.logoutUser);
// Protected routes
router.get('/employerProfile', protect_1.protect, authController_1.getEmployer);
router.post('/update/employer', protect_1.protect, authController_1.updateEmployer);
router.get('/seekerProfile', protect_1.protect, seekerController_1.getSeekerProfile);
router.post('/seekerUpdate', protect_1.protect, seekerController_1.updateSeekerProfile);
exports.default = router;
