"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.logoutUser = exports.loginUser = exports.createSeeker = exports.updateEmployer = exports.getEmployer = exports.createEmployer = exports.createUser = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/helpers/generateToken");
const jwt = __importStar(require("jsonwebtoken"));
exports.createUser = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        //check if email exists
        const emailCheck = await db_config_1.default.query("SELECT email FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            res.status(400).json({
                message: "User already exists"
            });
            return;
        }
        //before inserting into users, we need to hash the passwords
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        //insert the user 
        const newUser = await db_config_1.default.query("INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING *", [name, email, hashedPassword]);
        //generate JWT token for user access 
        // generateToken(res, newUser.rows[0].id, newUser.rows[0].role_id)
        const accessToken = (0, generateToken_1.generateToken)(res, String(newUser.rows[0].id), Number(newUser.rows[0].role_id));
        const refreshToken = (0, generateToken_1.generateToken)(res, String(newUser.rows[0].id), Number(newUser.rows[0].role_id));
        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0]
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createEmployer = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const { first_name, second_name, email, password, telephone_1, telephone_2, address, postal_code, company_name, company_address, company_postal_code } = req.body;
        // Validate required fields
        if (!first_name || !second_name || !email || !password || !company_name) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        // Check email across all tables
        const emailCheckAdmin = await db_config_1.default.query('SELECT email FROM admin WHERE email = $1', [email]);
        const emailCheckEmployer = await db_config_1.default.query('SELECT email FROM employer WHERE email = $1', [email]);
        const emailCheckSeeker = await db_config_1.default.query('SELECT email FROM seeker WHERE email = $1', [email]);
        if (emailCheckAdmin.rows.length > 0 ||
            emailCheckEmployer.rows.length > 0 ||
            emailCheckSeeker.rows.length > 0) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        // Start a transaction
        await db_config_1.default.query('BEGIN');
        // Insert into company table
        const newCompany = await db_config_1.default.query('INSERT INTO company (name, address, postal_code) VALUES ($1, $2, $3) RETURNING id', [company_name, company_address || null, company_postal_code || null]);
        const companyId = newCompany.rows[0].id;
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Insert into employer table
        const newEmployer = await db_config_1.default.query(`INSERT INTO employer (
        role_id, company_id, email, password, first_name, second_name, 
        telephone_1, telephone_2, address, postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id, email, first_name, second_name, role_id, company_id`, [2, companyId, email, hashedPassword, first_name, second_name, telephone_1 || null, telephone_2 || null, address || null, postal_code || null]);
        // Commit transaction
        await db_config_1.default.query('COMMIT');
        // Generate JWT tokens
        const accessToken = jwt.sign({ id: newEmployer.rows[0].id, role_id: 2 }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: newEmployer.rows[0].id, role_id: 2 }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
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
    }
    catch (error) {
        await db_config_1.default.query('ROLLBACK');
        console.error('Error creating employer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getEmployer = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        // Use req.user.id from protect middleware
        const id = req.user?.id;
        if (!id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Start a transaction
        await db_config_1.default.query('BEGIN');
        // Fetch employer details
        const employerQuery = `
      SELECT id, email, first_name, second_name, telephone_1, telephone_2, 
             address, postal_code, company_id
      FROM employer 
      WHERE id = $1;
    `;
        const employerResult = await db_config_1.default.query(employerQuery, [id]);
        if (employerResult.rows.length === 0) {
            await db_config_1.default.query('ROLLBACK');
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const employer = employerResult.rows[0];
        // Fetch company details
        const companyQuery = `
      SELECT id, name, address, postal_code
      FROM company 
      WHERE id = $1;
    `;
        const companyResult = await db_config_1.default.query(companyQuery, [employer.company_id]);
        if (companyResult.rows.length === 0) {
            await db_config_1.default.query('ROLLBACK');
            res.status(404).json({ message: 'Associated company not found' });
            return;
        }
        const company = companyResult.rows[0];
        // Commit transaction
        await db_config_1.default.query('COMMIT');
        // Format response to match Angular form expectations
        const response = {
            firstName: employer.first_name,
            secondName: employer.second_name,
            email: employer.email,
            telephone1: employer.telephone_1,
            telephone2: employer.telephone_2,
            address: employer.address,
            postalCode: employer.postal_code,
            companyName: company.name,
            companyAddress: company.address,
            companyPostalCode: company.postal_code
        };
        res.status(200).json(response);
    }
    catch (error) {
        await db_config_1.default.query('ROLLBACK');
        console.error('Error fetching employer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateEmployer = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        // Use req.user.id from protect middleware
        const id = req.user?.id;
        if (!id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { firstName, secondName, email, telephone1, telephone2, address, postalCode, companyName, companyAddress, companyPostalCode, password } = req.body;
        // Validate required fields
        if (!firstName || !secondName || !email || !telephone1 || !telephone2 || !address || !postalCode || !companyName || !companyAddress || !companyPostalCode) {
            res.status(400).json({ message: 'All fields except password are required' });
            return;
        }
        // Check if employer exists
        const checkEmployer = await db_config_1.default.query('SELECT * FROM employer WHERE id = $1', [id]);
        if (checkEmployer.rows.length === 0) {
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const employer = checkEmployer.rows[0];
        // Start a transaction
        await db_config_1.default.query('BEGIN');
        // Update company details
        const updateCompanyQuery = `
      UPDATE company
      SET name = $1, address = $2, postal_code = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
        const companyResult = await db_config_1.default.query(updateCompanyQuery, [
            companyName,
            companyAddress,
            companyPostalCode,
            employer.company_id
        ]);
        if (companyResult.rows.length === 0) {
            await db_config_1.default.query('ROLLBACK');
            res.status(404).json({ message: 'Company not found' });
            return;
        }
        // Prepare employer update query
        let updateEmployerQuery = `
      UPDATE employer
      SET first_name = $1, second_name = $2, email = $3, telephone_1 = $4, telephone_2 = $5,
          address = $6, postal_code = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *;
    `;
        let queryParams = [
            firstName,
            secondName,
            email,
            telephone1,
            telephone2,
            address,
            postalCode,
            id
        ];
        // Include password update if provided
        if (password) {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            updateEmployerQuery = `
        UPDATE employer
        SET first_name = $1, second_name = $2, email = $3, telephone_1 = $4, telephone_2 = $5,
            address = $6, postal_code = $7, password = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING *;
      `;
            queryParams = [
                firstName,
                secondName,
                email,
                telephone1,
                telephone2,
                address,
                postalCode,
                hashedPassword,
                id
            ];
        }
        // Update employer details
        const employerResult = await db_config_1.default.query(updateEmployerQuery, queryParams);
        // Commit transaction
        await db_config_1.default.query('COMMIT');
        res.json({
            message: 'Employer updated successfully',
            employer: employerResult.rows[0],
            company: companyResult.rows[0]
        });
    }
    catch (error) {
        await db_config_1.default.query('ROLLBACK');
        console.error('Error updating employer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Simple URL validation
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.createSeeker = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const { first_name, second_name, email, password, telephone_1, telephone_2, address, postal_code, education_level, institution, skills, cv } = req.body;
        // Validate required fields
        const missingFields = [];
        if (!first_name)
            missingFields.push('first_name');
        if (!second_name)
            missingFields.push('second_name');
        if (!email)
            missingFields.push('email');
        if (!password)
            missingFields.push('password');
        if (!education_level)
            missingFields.push('education_level');
        if (!institution)
            missingFields.push('institution');
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
        const emailCheckAdmin = await db_config_1.default.query('SELECT email FROM admin WHERE email = $1', [email]);
        const emailCheckEmployer = await db_config_1.default.query('SELECT email FROM employer WHERE email = $1', [email]);
        const emailCheckSeeker = await db_config_1.default.query('SELECT email FROM seeker WHERE email = $1', [email]);
        if (emailCheckAdmin.rows.length > 0 ||
            emailCheckEmployer.rows.length > 0 ||
            emailCheckSeeker.rows.length > 0) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        // Start transaction
        await db_config_1.default.query('BEGIN');
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Insert seeker
        const newSeeker = await db_config_1.default.query(`INSERT INTO seeker (
        role_id, email, password, first_name, second_name, 
        telephone_1, telephone_2, address, postal_code, 
        education_level, institution, cv
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, email, first_name, second_name, role_id, cv`, [
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
        ]);
        const seekerId = newSeeker.rows[0].id;
        // Insert skills
        const insertedSkills = [];
        if (Array.isArray(skills) && skills.length > 0) {
            for (const skillName of skills) {
                let skillResult = await db_config_1.default.query('SELECT id FROM skills WHERE name = $1', [skillName]);
                let skillId;
                if (skillResult.rows.length === 0) {
                    skillResult = await db_config_1.default.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
                    skillId = skillResult.rows[0].id;
                }
                else {
                    skillId = skillResult.rows[0].id;
                }
                await db_config_1.default.query('INSERT INTO seeker_skills (seeker_id, skill_id, proficiency_level) VALUES ($1, $2, $3)', [seekerId, skillId, 3]);
                insertedSkills.push({ id: skillId, name: skillName });
            }
        }
        // Commit transaction
        await db_config_1.default.query('COMMIT');
        // Generate JWT tokens
        const accessToken = jwt.sign({ id: seekerId, role_id: 3 }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: seekerId, role_id: 3 }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
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
    }
    catch (error) {
        await db_config_1.default.query('ROLLBACK');
        console.error('Error creating seeker:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.loginUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        // Check seeker table (role_id: 3)
        let userQuery = await db_config_1.default.query(`SELECT id, email, first_name, second_name, password, role_id
       FROM seeker
       WHERE email = $1`, [email]);
        let user = userQuery.rows[0];
        // If not found in seeker, check employer or admin tables
        if (!user) {
            userQuery = await db_config_1.default.query(`SELECT id, email, first_name, second_name, password, role_id
         FROM employer
         WHERE email = $1`, [email]);
            user = userQuery.rows[0];
        }
        if (!user) {
            userQuery = await db_config_1.default.query(`SELECT id, email, first_name, second_name, password, role_id
         FROM admin
         WHERE email = $1`, [email]);
            user = userQuery.rows[0];
        }
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Verify password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate access token
        const accessToken = jwt.sign({ id: user.id, role_id: user.role_id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' } // Extended to 1 hour
        );
        res.status(200).json({
            accessToken,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.second_name}`,
                role_id: user.role_id
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.logoutUser = (0, asyncHandler_1.default)(async (req, res, next) => {
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
exports.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        const checkUser = await db_config_1.default.query("SELECT * FROM public.users WHERE id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        await db_config_1.default.query("DELETE FROM public.users WHERE id = $1", [id]);
        res.json({ message: "User deleted successful" });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
