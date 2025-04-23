"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobsController_1 = require("../controllers/jobsController");
const protect_1 = require("../middlewares/auth/protect");
const router = express_1.default.Router();
router.post('/jobs', protect_1.protect, jobsController_1.createJob);
router.get('/jobs', protect_1.protect, jobsController_1.getJobs);
router.put('/jobs/:id', protect_1.protect, jobsController_1.updateJobs);
router.delete('/jobs/:id', protect_1.protect, jobsController_1.deleteJobs);
router.post('/interviews', protect_1.protect, jobsController_1.setInterview);
exports.default = router;
