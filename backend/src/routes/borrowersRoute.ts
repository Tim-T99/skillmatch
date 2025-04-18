import express from "express";
import { createBorrower, deleteBorrower, getBorrowerById, getBorrowers, updateBorrower } from "../controllers/borrowerController";

const router = express.Router()

//create the routes
router.post("/", createBorrower)
router.get("/", getBorrowers);
router.get("/:id", getBorrowerById);
router.put("/:id", updateBorrower);
router.delete("/:id", deleteBorrower);

export default router
