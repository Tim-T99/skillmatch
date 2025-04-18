import express from "express";
import { deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController";

const router = express.Router()

router.get('/', (req, res) => {
  res.send('Auth route');
});
//create the routes
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router
