"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const borrowerController_1 = require("../controllers/borrowerController");
const router = express_1.default.Router();
//create the routes
router.post("/", borrowerController_1.createBorrower);
router.get("/", borrowerController_1.getBorrowers);
router.get("/:id", borrowerController_1.getBorrowerById);
router.put("/:id", borrowerController_1.updateBorrower);
router.delete("/:id", borrowerController_1.deleteBorrower);
exports.default = router;
