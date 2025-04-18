"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
const protect_1 = require("../middlewares/auth/protect");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
//public routes 
router.post("/register/admin", authController_1.createUser);
router.post('/register', authController_1.createEmployer);
router.post('/register/seeker', authController_1.createSeeker);
router.post('/login', authController_1.loginUser);
router.post("/logout", authController_1.logoutUser);
router.post("/delete/:id", protect_1.protect, roleMiddleWare_1.adminGuard, authController_1.deleteUser);
router.post("/update/:id", protect_1.protect, roleMiddleWare_1.adminGuard, userController_1.updateUser);
exports.default = router;
