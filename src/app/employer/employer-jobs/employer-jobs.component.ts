import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService, Job, Candidate, Interview } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employer-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employer-jobs.component.html',
  styleUrls: ['./employer-jobs.component.css'],
})
export class EmployerJobsComponent implements OnInit {
  jobs: Job[] = [];
  selectedJob: Job | null = null;
  selectedInterview: Interview | null = null;
  selectedCandidate: Candidate | null = null;
  jobForm: FormGroup;
  interviewForm: FormGroup;
  isViewModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isCreateModalOpen: boolean = false;
  isInterviewModalOpen: boolean = false;
  isCandidateModalOpen: boolean = false;
  isSchedulingInterview: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Active', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location_type: [''],
      requirements: [''],
      skills: [''],
    });

    this.interviewForm = this.fb.group({
      date: ['', Validators.required],
      meetingLink: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load jobs. Please try again.';
        if (err.status === 401 || err.status === 403) {
          window.alert('Session expired. Please log in again.');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  createJob(): void {
    this.jobForm.reset({
      title: '',
      status: 'Active',
      description: '',
      location_type: '',
      requirements: '',
      skills: '',
    });
    this.isCreateModalOpen = true;
  }

  saveNewJob(): void {
    if (this.jobForm.invalid) {
      this.errorMessage = 'Please fill out all required fields correctly.';
      this.jobForm.markAllAsTouched();
      return;
    }

    const formValue = this.jobForm.value;
    const newJob: Partial<Job> = {
      title: formValue.title,
      status: formValue.status,
      description: formValue.description,
      location_type: formValue.location_type,
      requirements: formValue.requirements ? formValue.requirements.split(',').map((r: string) => r.trim()) : [],
      skills: formValue.skills,
    };

    console.log('Sending job data:', newJob); // Debug log

    this.jobService.createJob(newJob).subscribe({
      next: (job) => {
        this.jobs.push(job);
        this.closeModal();
        window.alert('Job created successfully.');
      },
      error: (err) => {
        console.error('Error creating job:', err);
        this.errorMessage = err.error?.message || 'Failed to create job. Please try again.';
        if (err.status === 401 || err.status === 403) {
          window.alert('Session expired. Please log in again.');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  viewJob(job: Job): void {
    this.selectedJob = { ...job };
    this.isViewModalOpen = true;
  }

  editJob(job: Job): void {
    this.selectedJob = { ...job };
    this.isEditModalOpen = true;
    this.jobForm.patchValue({
      title: job.title,
      status: job.status,
      description: job.description,
      location_type: job.location_type || '',
      requirements: job.requirements?.join(', ') || '',
      skills: job.skills || '',
    });
  }

  deleteJob(job: Job): void {
    if (confirm(`Are you sure you want to delete ${job.title}?`)) {
      this.jobService.deleteJob(job.id.toString()).subscribe({
        next: () => {
          this.jobs = this.jobs.filter((j) => j.id !== job.id);
        },
        error: (err) => {
          console.error('Error deleting job:', err);
          this.errorMessage = 'Failed to delete job. Please try again.';
          if (err.status === 401 || err.status === 403) {
            window.alert('Session expired. Please log in again.');
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        },
      });
    }
  }

  saveJob(): void {
    if (this.jobForm.invalid || !this.selectedJob) {
      this.errorMessage = 'Please fill out all required fields correctly.';
      this.jobForm.markAllAsTouched();
      return;
    }

    const formValue = this.jobForm.value;
    const updatedJob: Job = {
      ...this.selectedJob,
      title: formValue.title,
      status: formValue.status,
      description: formValue.description,
      location_type: formValue.location_type,
      requirements: formValue.requirements ? formValue.requirements.split(',').map((r: string) => r.trim()) : [],
      skills: formValue.skills,
    };

    this.jobService.updateJob(updatedJob).subscribe({
      next: (job) => {
        const jobIndex = this.jobs.findIndex((j) => j.id === job.id);
        if (jobIndex !== -1) {
          this.jobs[jobIndex] = job;
        }
        this.closeModal();
      },
      error: (err) => {
        console.error('Error updating job:', err);
        this.errorMessage = 'Failed to update job. Please try again.';

      },
    });
  }

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
    if (this.interviewForm.invalid || !this.selectedJob || !this.selectedCandidate) {
      this.errorMessage = 'Please fill out all required fields.';
      this.interviewForm.markAllAsTouched();
      return;
    }

    const formValue = this.interviewForm.value;
    const newInterview: Interview = {
      id: Math.random().toString(36).substring(2, 15),
      candidateId: this.selectedCandidate.id,
      jobId: this.selectedJob.id.toString(),
      date: formValue.date,
      meetingLink: formValue.meetingLink,
    };

    this.jobService.scheduleInterview(newInterview).subscribe({
      next: (interview) => {
        const jobIndex = this.jobs.findIndex((j) => j.id === this.selectedJob!.id);
        if (jobIndex !== -1) {
          this.jobs[jobIndex].interviews.push(interview);
        }
        this.isSchedulingInterview = false;
        this.interviewForm.reset();
      },
      error: (err) => {
        console.error('Error scheduling interview:', err);
        this.errorMessage = 'Failed to schedule interview. Please try again.';
      },
    });
  }

  viewInterview(interview: Interview): void {
    this.selectedInterview = { ...interview };
    this.isInterviewModalOpen = true;
  }

  getAllInterviews(): Interview[] {
    return this.jobs.flatMap((job) => job.interviews);
  }

  getJobById(jobId: string): Job | undefined {
    return this.jobs.find((job) => job.id.toString() === jobId);
  }

  getCandidateById(candidateId: string, jobId: string): Candidate | undefined {
    const job = this.jobs.find((job) => job.id.toString() === jobId);
    return job?.applicants.find((c) => c.id === candidateId);
  }

  closeModal(): void {
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.isCreateModalOpen = false;
    this.isInterviewModalOpen = false;
    this.isCandidateModalOpen = false;
    this.isSchedulingInterview = false;
    this.selectedJob = null;
    this.selectedInterview = null;
    this.selectedCandidate = null;
    this.jobForm.reset({
      status: 'Active',
    });
    this.interviewForm.reset();
    this.errorMessage = null;
  }
}