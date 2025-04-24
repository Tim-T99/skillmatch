"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const geminiController_1 = require("../controllers/geminiController");
const router = express_1.default.Router();
router.get('/gemini', (req, res) => {
    res.send('gemini route');
});
router.post('/gemini/query', protect_1.protect, geminiController_1.processGeminiQuery);
exports.default = router;
