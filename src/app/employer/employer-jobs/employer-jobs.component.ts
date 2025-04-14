import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Candidate {
  id: string;
  name: string;
  score: number;
  skills: string[];
}

interface Interview {
  candidateId: string;
  jobId: string;
  date: string; // YYYY-MM-DD
  meetingLink: string;
}

interface Job {
  id: string;
  position: string;
  status: 'Active' | 'Interviewing' | 'Closed';
  applicants: Candidate[];
  interviews: Interview[];
  details: {
    description: string;
    requirements: string[];
    skills: string[];
    postedDate: string;
  };
}

@Component({
  selector: 'app-employer-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employer-jobs.component.html',
  styleUrl: './employer-jobs.component.css'
})
export class EmployerJobsComponent implements OnInit {
  private originalJobs: Job[] = [
    {
      id: '1',
      position: 'Software Engineer',
      status: 'Active',
      applicants: [
        { id: 'c1', name: 'Avery Lin', score: 4.5, skills: ['Angular', 'TypeScript'] },
        { id: 'c2', name: 'Luke Skywalker', score: 4.0, skills: ['React', 'JavaScript'] }
      ],
      interviews: [
        {
          candidateId: 'c1',
          jobId: '1',
          date: '2025-04-20',
          meetingLink: 'https://zoom.us/j/1234567890'
        }
      ],
      details: {
        description: 'Develop web applications using Angular and Node.js',
        requirements: ['3+ years experience', 'TypeScript', 'Agile methodology'],
        skills: ['Angular', 'Node.js', 'REST APIs', 'Git'],
        postedDate: '2025-03-15'
      }
    },
    {
      id: '2',
      position: 'Data Scientist',
      status: 'Interviewing',
      applicants: [
        { id: 'c3', name: 'Diana Prince', score: 4.2, skills: ['Python', 'SQL'] }
      ],
      interviews: [],
      details: {
        description: 'Analyze large datasets to drive business decisions',
        requirements: ['Python', 'SQL', 'Machine Learning'],
        skills: ['Python', 'R', 'Tableau', 'Pandas'],
        postedDate: '2025-03-20'
      }
    },
    {
      id: '3',
      position: 'UX Designer',
      status: 'Closed',
      applicants: [
        { id: 'c4', name: 'Natasha Romanoff', score: 3.8, skills: ['Figma', 'Sketch'] },
        { id: 'c5', name: 'Peter Quill', score: 4.1, skills: ['Figma', 'Prototyping'] }
      ],
      interviews: [],
      details: {
        description: 'Create user-friendly interfaces for mobile apps',
        requirements: ['Figma', 'User Research', '2+ years experience'],
        skills: ['Figma', 'Sketch', 'Prototyping', 'Wireframing'],
        postedDate: '2025-02-10'
      }
    }
  ];

  jobs: Job[] = [];
  selectedJob: Job | null = null;
  selectedInterview: Interview | null = null;
  selectedCandidate: Candidate | null = null;
  jobForm: FormGroup;
  interviewForm: FormGroup;
  isViewModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isInterviewModalOpen: boolean = false;
  isCandidateModalOpen: boolean = false;
  isSchedulingInterview: boolean = false;

  constructor(private fb: FormBuilder) {
    this.jobForm = this.fb.group({
      position: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      skills: ['', Validators.required],
      postedDate: ['', Validators.required]
    });

    this.interviewForm = this.fb.group({
      date: ['', Validators.required],
      meetingLink: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.jobs = [...this.originalJobs];
  }

  // Jobs Table Actions
  viewJob(job: Job): void {
    this.selectedJob = { ...job };
    this.isViewModalOpen = true;
  }

  editJob(job: Job): void {
    this.selectedJob = { ...job };
    this.isEditModalOpen = true;
    this.jobForm.patchValue({
      position: job.position,
      status: job.status,
      description: job.details.description,
      requirements: job.details.requirements.join(', '),
      skills: job.details.skills.join(', '),
      postedDate: job.details.postedDate
    });
  }

  deleteJob(job: Job): void {
    this.originalJobs = this.originalJobs.filter(j => j.id !== job.id);
    this.jobs = [...this.originalJobs];
  }

  saveJob(): void {
    if (this.jobForm.valid && this.selectedJob) {
      const formValue = this.jobForm.value;
      const updatedJob: Job = {
        ...this.selectedJob,
        position: formValue.position,
        status: formValue.status,
        details: {
          description: formValue.description,
          requirements: formValue.requirements.split(',').map((r: string) => r.trim()),
          skills: formValue.skills.split(',').map((s: string) => s.trim()),
          postedDate: formValue.postedDate
        }
      };
      const jobIndex = this.originalJobs.findIndex(j => j.id === this.selectedJob!.id);
      if (jobIndex !== -1) {
        this.originalJobs[jobIndex] = updatedJob;
      }
      this.jobs = [...this.originalJobs];
      this.closeModal();
    }
  }

  // View Modal Actions
  viewCandidate(candidate: Candidate): void {
    this.selectedCandidate = { ...candidate };
    this.isCandidateModalOpen = true;
  }

  startSchedulingInterview(candidate: Candidate): void {
    this.selectedCandidate = { ...candidate };
    this.isSchedulingInterview = true;
    this.interviewForm.reset();
  }

  scheduleInterview(): void {
    if (this.interviewForm.valid && this.selectedJob && this.selectedCandidate) {
      const formValue = this.interviewForm.value;
      const newInterview: Interview = {
        candidateId: this.selectedCandidate.id,
        jobId: this.selectedJob.id,
        date: formValue.date,
        meetingLink: formValue.meetingLink
      };
      this.selectedJob.interviews.push(newInterview);
      const jobIndex = this.originalJobs.findIndex(j => j.id === this.selectedJob!.id);
      if (jobIndex !== -1) {
        this.originalJobs[jobIndex] = { ...this.selectedJob };
      }
      this.jobs = [...this.originalJobs];
      this.isSchedulingInterview = false;
      this.interviewForm.reset();
    }
  }

  // Interviews Table Action
  viewInterview(interview: Interview): void {
    this.selectedInterview = { ...interview };
    this.isInterviewModalOpen = true;
  }

  getAllInterviews(): Interview[] {
    return this.jobs.flatMap(job => job.interviews);
  }
  getJobById(jobId: string): Job | undefined {
    return this.jobs.find(job => job.id === jobId);
  }
  getCandidateById(candidateId: string, jobId: string): Candidate | undefined {
    const job = this.jobs.find(job => job.id === jobId);
    return job?.applicants.find(c => c.id === candidateId);
  }
  
  closeModal(): void {
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.isInterviewModalOpen = false;
    this.isCandidateModalOpen = false;
    this.isSchedulingInterview = false;
    this.selectedJob = null;
    this.selectedInterview = null;
    this.selectedCandidate = null;
    this.jobForm.reset();
    this.interviewForm.reset();
  }
}