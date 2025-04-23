CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES role(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    second_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employer (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES role(id),
    company_id INT NOT NULL REFERENCES company(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    second_name VARCHAR(100),
    telephone_1 VARCHAR(20),
    telephone_2 VARCHAR(20),
    address TEXT,
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seeker (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES role(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    second_name VARCHAR(100),
    telephone_1 VARCHAR(20),
    telephone_2 VARCHAR(20),
    address TEXT,
   postal_code VARCHAR(20),
   education_level VARCHAR(100),
    institution VARCHAR(255),   
    cv TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('active', 'interviewing', 'closed')) DEFAULT 'active',
    application_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE seeker_skills (
    seeker_id INT NOT NULL REFERENCES seeker(id),
    skill_id INT NOT NULL REFERENCES skills(id),
    proficiency_level INT CHECK (proficiency_level BETWEEN 1 AND 5),
    PRIMARY KEY (seeker_id, skill_id)
);

CREATE TABLE job_skills (
    job_id INT NOT NULL REFERENCES job(id),
    skill_id INT NOT NULL REFERENCES skills(id),
    required_proficiency INT CHECK (required_proficiency BETWEEN 1 AND 5),
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE application (
    id SERIAL PRIMARY KEY,
    seeker_id INT NOT NULL REFERENCES seeker(id),
    job_id INT NOT NULL REFERENCES job(id),
    status VARCHAR(50) CHECK (status IN ('submitted', 'under_review', 'interview_scheduled', 'accepted', 'rejected')) DEFAULT 'submitted',
    resume TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_seeker_matches (
    id SERIAL PRIMARY KEY,
    seeker_id INT NOT NULL REFERENCES seeker(id),
    job_id INT NOT NULL REFERENCES job(id),
    compatibility_score FLOAT NOT NULL,
    review_notes TEXT,
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (seeker_id, job_id)
);

CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INT NOT NULL REFERENCES application(id),
    interview_date TIMESTAMP NOT NULL,
    location TEXT,
    interview_type VARCHAR(20),
    outcome VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_admin_email ON admin(email);
CREATE UNIQUE INDEX idx_employer_email ON employer(email);
CREATE UNIQUE INDEX idx_seeker_email ON seeker(email);
CREATE INDEX idx_job_company_status ON job(company_id, status);
CREATE INDEX idx_application_seeker_job ON application(seeker_id, job_id);
CREATE INDEX idx_seeker_skills_skill_id ON seeker_skills(skill_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_timestamp
BEFORE UPDATE ON admin
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_employer_timestamp
BEFORE UPDATE ON employer
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_seeker_timestamp
BEFORE UPDATE ON seeker
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_timestamp
BEFORE UPDATE ON company
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_job_timestamp
BEFORE UPDATE ON job
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_application_timestamp
BEFORE UPDATE ON application
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_interviews_timestamp
BEFORE UPDATE ON interviews
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Alteration to match design
-- Alter job.status to match the interface
ALTER TABLE job
DROP CONSTRAINT job_status_check,
ADD CONSTRAINT job_status_check CHECK (status IN ('Active', 'Interviewing', 'Closed'));

-- Update existing status values (optional, if you want to migrate data)
UPDATE job
SET status = CASE
    WHEN status = 'open' THEN 'Active'
    WHEN status = 'draft' THEN 'Active' -- Or handle differently
    WHEN status = 'closed' THEN 'Closed'
END;

-- Add requirements column to job
ALTER TABLE job
ADD COLUMN requirements TEXT[];

-- Add meeting_link column to interviews
ALTER TABLE interviews
ADD COLUMN meeting_link VARCHAR(255);

ALTER TABLE job
ADD COLUMN employer_id INT NOT NULL REFERENCES employer(id);