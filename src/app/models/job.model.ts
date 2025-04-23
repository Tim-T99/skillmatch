export interface Job {
  id: number;
  company_id: number;
  title: string;
  status: string;
  description: string;
  requirements?: string;
  job_type?: string;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
  applicants: Candidate[];
  interviews: Interview[];
}

export interface Candidate {
  id: string;
  name: string;
  score: number;
  skills: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  date: string;
  meetingLink: string;
}