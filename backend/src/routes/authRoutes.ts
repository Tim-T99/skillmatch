import express from 'express'
import { createEmployer, createSeeker, createUser, deleteUser, loginUser, logoutUser } from '../controllers/authController'
import { adminGuard } from '../middlewares/auth/roleMiddleWare'
import { protect } from '../middlewares/auth/protect' 
import { updateUser } from '../controllers/userController' 

const router = express.Router()

//public routes 
router.post("/register/admin", createUser)
router.post('/register', createEmployer);
router.post('/register/seeker', createSeeker);
router.post('/login', loginUser);
router.post("/logout", logoutUser)
router.post("/delete/:id", protect, adminGuard, deleteUser)
router.post("/update/:id", protect, adminGuard, updateUser)



export default router