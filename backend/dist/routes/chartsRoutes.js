"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chartController_1 = require("../controllers/chartController");
const protect_1 = require("../middlewares/auth/protect");
const router = express_1.default.Router();
router.get('/charts', protect_1.protect, chartController_1.getEmployerChart);
router.get('/metrics', protect_1.protect, chartController_1.getEmployerMetrics);
exports.default = router;
