"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const seekerController_1 = require("../controllers/seekerController");
const router = express_1.default.Router();
router.get('/seeker-stats', protect_1.protect, seekerController_1.getSeekerStats);
router.get('/allSeeker-jobs', protect_1.protect, seekerController_1.getAllSeekerJobs);
router.get('/seeker-jobs', protect_1.protect, seekerController_1.getSeekerJobs);
router.post('/apply-job', protect_1.protect, seekerController_1.applyJob);
router.get('/seeker-applied-jobs', protect_1.protect, seekerController_1.getSeekerAppliedJobs);
router.get('/seeker-interviews', protect_1.protect, seekerController_1.getSeekerInterviews);
exports.default = router;
