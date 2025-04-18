import { Request, Response } from 'express';
import asyncHandler from "../middlewares/asyncHandler"
import pool from '../config/db.config';


// Create users


//Get All users 
export const getUsers = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY user_id ASC ")
        res.status(200).json(result.rows)
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//Get single user
export const getUserById = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("SELECT * FROM public.users WHERE user_id = $1", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//update user 
export const updateUser = asyncHandler(   async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, email, password } = req.body

        const checkUser = await pool.query("SELECT * FROM public.users WHERE user_id = $1", [id])
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        const result = await pool.query(
            "UPDATE users SET name=$1, email=$2, password=$3, updated_at=NOW() WHERE user_id=$4 RETURNING *",
            [name, email, password, id]
        );
        res.json({ message: "User updated", user: result.rows[0] });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//delete user  
export const deleteUser = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const checkUser = await pool.query("SELECT * FROM public.users WHERE user_id = $1", [id])
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        await pool.query("DELETE FROM public.users WHERE user_id = $1", [id]);
        res.json({ message: "User deleted successful" });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})