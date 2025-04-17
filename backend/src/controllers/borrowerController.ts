import { Request, Response } from 'express';
import asyncHandler from "../middlewares/asyncHandler"
import pool from '../config/db.config';


// Create borrower
export const createBorrower = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const { user_id, book_id, librarian_who_processed, borrow_date, return_date, status } = req.body

        //check if borrower exists
        const userCheck = await pool.query("SELECT user_id FROM borrowers WHERE user_id = $1", [user_id])

        if (userCheck.rows.length > 0) {
            res.status(400).json({
                message: "Borrower already exists"
            })
            return
        }
        //insert the borrower
        const userResult = await pool.query(
            "INSERT INTO borrowers (user_id, book_id, librarian_who_processed, borrow_date, return_date, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [user_id, book_id, librarian_who_processed, borrow_date, return_date, status]
        )
        res.status(201).json({
            message: "Borrower successfully created",
            user: userResult.rows[0]
        })
    } catch (error) {
        console.error("Error creating borrower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//Get all borrowers
export const getBorrowers = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM borrowers ORDER BY user_id ASC ")
        res.status(200).json(result.rows)
    } catch (error) {
        console.error("Error getting borrowers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//Get single borrower 
export const getBorrowerById = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("SELECT * FROM public.borrowers WHERE borrow_id = $1", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error("Error getting borower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//update borrower
export const updateBorrower = asyncHandler(   async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { user_id, book_id, librarian_who_processed, borrow_date, return_date, status } = req.body

        const checkUser = await pool.query("SELECT * FROM public.borrowers WHERE borrow_id = $1", [id])
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "Borrower not found" });
            return
        }
        const result = await pool.query(
            "UPDATE borrowers SET user_id=$1, book_id=$2, librarian_who_processed=$3, borrow_date=$4, return_date=$5, status=$6 RETURNING *",
            [user_id, book_id, librarian_who_processed, borrow_date, return_date, status]
        );
        res.json({ message: "Borrower updated", user: result.rows[0] });

    } catch (error) {
        console.error("Error updating borrower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//delete user  
export const deleteBorrower = asyncHandler(  async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const checkUser = await pool.query("SELECT * FROM public.borrowers WHERE user_id = $1", [id])
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "Borrower not found" });
            return
        }
        await pool.query("DELETE FROM public.borrowers WHERE user_id = $1", [id]);
        res.json({ message: "Borrower deleted successful" });

    } catch (error) {
        console.error("Error deleting borrower:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})