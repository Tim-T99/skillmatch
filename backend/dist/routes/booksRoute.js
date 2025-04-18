"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookController_1 = require("../controllers/bookController");
const roleMiddleWare_1 = require("@app/middlewares/auth/roleMiddleWare");
const router = express_1.default.Router();
router.post("/", roleMiddleWare_1.adminLibGuard, bookController_1.createBook);
router.get("/", roleMiddleWare_1.borrowerGuard, bookController_1.getBooks);
router.get("/:id", roleMiddleWare_1.borrowerGuard, bookController_1.getBookById);
router.put("/:id", roleMiddleWare_1.librarianGuard, bookController_1.updateBook);
router.delete("/:id", roleMiddleWare_1.adminGuard, bookController_1.deleteBook);
exports.default = router;
