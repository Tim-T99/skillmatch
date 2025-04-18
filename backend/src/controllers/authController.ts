import { NextFunction, Request, Response } from 'express';
import asyncHandler from "../middlewares/asyncHandler"
import pool from '../config/db.config';
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/helpers/generateToken';
import * as jwt from 'jsonwebtoken';


export const createUser = asyncHandler(  async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password} = req.body

        //check if email exists
        const emailCheck = await pool.query("SELECT email FROM users WHERE email = $1", [email])

        if (emailCheck.rows.length > 0) {
            res.status(400).json({
                message: "User already exists"
            })
            return
        }

          //before inserting into users, we need to hash the passwords
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //insert the user 
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING *", [name, email, hashedPassword]
        )
        //generate JWT token for user access 
    // generateToken(res, newUser.rows[0].id, newUser.rows[0].role_id)
    const accessToken = generateToken(
        res, 
        String(newUser.rows[0].id),  
        Number(newUser.rows[0].role_id) 
      );
      
      const refreshToken = generateToken(
        res, 
        String(newUser.rows[0].id),  
        Number(newUser.rows[0].role_id)
      );


    res.status(201).json({
        message: "User registered successfully",
        user: newUser.rows[0]
    });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

export const createEmployer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      first_name,
      second_name,
      email,
      password,
      telephone_1,
      telephone_2,
      address,
      postal_code,
      company_name,
      company_address,
      company_postal_code
    } = req.body;

    // Validate required fields
    if (!first_name || !second_name || !email || !password || !company_name) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Check email across all tables
    const emailCheckAdmin = await pool.query('SELECT email FROM admin WHERE email = $1', [email]);
    const emailCheckEmployer = await pool.query('SELECT email FROM employer WHERE email = $1', [email]);
    const emailCheckSeeker = await pool.query('SELECT email FROM seeker WHERE email = $1', [email]);

    if (
      emailCheckAdmin.rows.length > 0 ||
      emailCheckEmployer.rows.length > 0 ||
      emailCheckSeeker.rows.length > 0
    ) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Start a transaction
    await pool.query('BEGIN');

    // Insert into company table
    const newCompany = await pool.query(
      'INSERT INTO company (name, address, postal_code) VALUES ($1, $2, $3) RETURNING id',
      [company_name, company_address || null, company_postal_code || null]
    );
    const companyId = newCompany.rows[0].id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into employer table
    const newEmployer = await pool.query(
      `INSERT INTO employer (
        role_id, company_id, email, password, first_name, second_name, 
        telephone_1, telephone_2, address, postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id, email, first_name, second_name, role_id, company_id`,
      [2, companyId, email, hashedPassword, first_name, second_name, telephone_1 || null, telephone_2 || null, address || null, postal_code || null]
    );

    // Commit transaction
    await pool.query('COMMIT');

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: newEmployer.rows[0].id, role_id: 2 },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: newEmployer.rows[0].id, role_id: 2 },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Employer registered successfully',
      user: {
        id: newEmployer.rows[0].id,
        email: newEmployer.rows[0].email,
        first_name: newEmployer.rows[0].first_name,
        second_name: newEmployer.rows[0].second_name,
        role_id: newEmployer.rows[0].role_id,
        company: {
          id: companyId,
          name: company_name,
          address: company_address,
          postal_code: company_postal_code
        }
      },
      accessToken
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating employer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Simple URL validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createSeeker = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      first_name,
      second_name,
      email,
      password,
      telephone_1,
      telephone_2,
      address,
      postal_code,
      education_level,
      institution,
      skills,
      cv 
    } = req.body;

    // Validate required fields
    const missingFields = [];

if (!first_name) missingFields.push('first_name');
if (!second_name) missingFields.push('second_name');
if (!email) missingFields.push('email');
if (!password) missingFields.push('password');
if (!education_level) missingFields.push('education_level');
if (!institution) missingFields.push('institution');

if (missingFields.length > 0) {
  res.status(400).json({ 
    message: 'Missing required fields', 
    missing: missingFields 
  });
  return;
}


    // Validate cv as URL if provided
    if (cv && !isValidUrl(cv)) {
      res.status(400).json({ message: 'Invalid CV URL' });
      return;
    }

    // Check email across all tables
    const emailCheckAdmin = await pool.query('SELECT email FROM admin WHERE email = $1', [email]);
    const emailCheckEmployer = await pool.query('SELECT email FROM employer WHERE email = $1', [email]);
    const emailCheckSeeker = await pool.query('SELECT email FROM seeker WHERE email = $1', [email]);

    if (
      emailCheckAdmin.rows.length > 0 ||
      emailCheckEmployer.rows.length > 0 ||
      emailCheckSeeker.rows.length > 0
    ) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Start transaction
    await pool.query('BEGIN');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert seeker
    const newSeeker = await pool.query(
      `INSERT INTO seeker (
        role_id, email, password, first_name, second_name, 
        telephone_1, telephone_2, address, postal_code, 
        education_level, institution, cv
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, email, first_name, second_name, role_id, cv`,
      [
        3, // role_id for seeker
        email,
        hashedPassword,
        first_name,
        second_name,
        telephone_1 || null,
        telephone_2 || null,
        address || null,
        postal_code || null,
        education_level,
        institution,
        cv || null
      ]
    );
    const seekerId = newSeeker.rows[0].id;

    // Insert skills
    const insertedSkills: { id: number; name: string }[] = [];
    if (Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        let skillResult = await pool.query('SELECT id FROM skills WHERE name = $1', [skillName]);
        let skillId: number;

        if (skillResult.rows.length === 0) {
          skillResult = await pool.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
          skillId = skillResult.rows[0].id;
        } else {
          skillId = skillResult.rows[0].id;
        }

        await pool.query(
          'INSERT INTO seeker_skills (seeker_id, skill_id, proficiency_level) VALUES ($1, $2, $3)',
          [seekerId, skillId, 3]
        );

        insertedSkills.push({ id: skillId, name: skillName });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: seekerId, role_id: 3 },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: seekerId, role_id: 3 },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Seeker registered successfully',
      user: {
        id: newSeeker.rows[0].id,
        email: newSeeker.rows[0].email,
        first_name: newSeeker.rows[0].first_name,
        second_name: newSeeker.rows[0].second_name,
        role_id: newSeeker.rows[0].role_id,
        education_level,
        institution,
        skills: insertedSkills.map(s => s.name),
        cv: newSeeker.rows[0].cv
      },
      accessToken
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating seeker:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    // Query all tables for the email
    const adminQuery = await pool.query(
      'SELECT id, email, password, role_id, first_name, second_name FROM admin WHERE email = $1',
      [email]
    );
    const employerQuery = await pool.query(
      `SELECT id, email, password, role_id, first_name, second_name, company_id 
       FROM employer WHERE email = $1`,
      [email]
    );
    const seekerQuery = await pool.query(
      `SELECT id, email, password, role_id, first_name, second_name, cv 
       FROM seeker WHERE email = $1`,
      [email]
    );

    let user: any = null;
    let role_id: number | null = null;
    let table: string | null = null;

    // Check results
    if (adminQuery.rows.length > 0) {
      user = adminQuery.rows[0];
      role_id = user.role_id;
      table = 'admin';
    } else if (employerQuery.rows.length > 0) {
      user = employerQuery.rows[0];
      role_id = user.role_id;
      table = 'employer';
    } else if (seekerQuery.rows.length > 0) {
      user = seekerQuery.rows[0];
      role_id = user.role_id;
      table = 'seeker';
    }

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, role_id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, role_id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Prepare response
    const responseUser: any = {
      id: user.id,
      email: user.email,
      role_id,
      name: `${user.first_name || ''} ${user.second_name || ''}`.trim()
    };

    // Include company details for employer
    if (table === 'employer') {
      const companyQuery = await pool.query('SELECT id, name FROM company WHERE id = $1', [
        user.company_id
      ]);
      if (companyQuery.rows.length > 0) {
        responseUser.company = {
          id: companyQuery.rows[0].id,
          name: companyQuery.rows[0].name
        };
      }
    }

    // Include cv for seeker
    if (table === 'seeker') {
      responseUser.cv = user.cv;
    }

    // Include role_name
    const roleQuery = await pool.query('SELECT name FROM role WHERE id = $1', [role_id]);
    responseUser.role_name = roleQuery.rows[0]?.name || '';

    res.status(200).json({
      message: 'Login successful',
      user: responseUser,
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    //We need to immedietly invalidate the access token and the refreh token 
    res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env['NODE_ENV'] !== "development",
        sameSite: "strict",
        expires: new Date(0) // Expire immediately
    });

    res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env['NODE_ENV'] !== "development",
        sameSite: "strict",
        expires: new Date(0) // Expire immediately
    });

    res.status(200).json({ message: "User logged out successfully" });
});

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

