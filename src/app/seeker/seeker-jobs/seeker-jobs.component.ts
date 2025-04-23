import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Job {
  id: number;
  position: string;
  organization: string;
  location: string;
  status: 'Active' | 'Interviewing' | 'Closed';
  score: number;
  applied: boolean;
  details: {
    description: string;
    requirements: string[];
    skills: string[];
    postedDate: string;
  };
}

interface Interview {
  id: number;
  position: string;
  organization: string;
  interview: {
    date: string;
    meetingLink: string | null;
  };
}

@Component({
  selector: 'app-seeker-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './seeker-jobs.component.html',
  styleUrls: ['./seeker-jobs.component.css'],
})
export class SeekerJobsComponent implements OnInit {
  jobs: Job[] = [];
  interviews: Interview[] = [];
  filterForm: FormGroup<{
    statusFilter: FormControl<string | null>;
    searchQuery: FormControl<string | null>;
  }>;
  selectedJob: Job | null = null;
  selectedInterview: Interview | null = null;
  isJobModalOpen: boolean = false;
  isInterviewModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      statusFilter: new FormControl<string | null>('All'),
      searchQuery: new FormControl<string | null>(''),
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 3) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.fetchJobs();
    this.fetchInterviews();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  fetchJobs(): void {
    this.http
      .get<{ jobs: Job[] }>(`${environment.apiUrl}/seeker-applied-jobs`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.jobs = data.jobs.map(job => ({
            ...job,
            applied: true,
          }));
        },
        error: (error) => {
          console.error('Error fetching applied jobs:', error);
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
            this.router.navigate(['/login']);
          } else {
            this.jobs = [];
          }
        },
      });
  }

  fetchInterviews(): void {
    this.http
      .get<{ interviews: Interview[] }>(`${environment.apiUrl}/seeker-interviews`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.interviews = data.interviews;
        },
        error: (error) => {
          console.error('Error fetching interviews:', error);
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
            this.router.navigate(['/login']);
          } else {
            this.interviews = [];
          }
        },
      });
  }

  get interviewJobs(): Interview[] {
    return this.interviews.filter(
      interview => interview.interview && interview.interview.date && interview.interview.meetingLink
    );
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  applyFilters(): void {
    const { statusFilter, searchQuery } = this.filterForm.value;

    let filteredJobs = [...this.jobs];

    if (statusFilter && statusFilter !== 'All') {
      filteredJobs = filteredJobs.filter(job => job.status === statusFilter);
    }

    if (searchQuery?.trim()) {
      filteredJobs = filteredJobs.filter(
        job =>
          job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.organization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    this.jobs = filteredJobs;
  }

  clearFilters(): void {
    this.filterForm.reset({ statusFilter: 'All', searchQuery: '' });
  }

  openJobModal(job: Job): void {
    this.selectedJob = job;
    this.isJobModalOpen = true;
  }

  openInterviewModal(interview: Interview): void {
    this.selectedInterview = interview;
    this.isInterviewModalOpen = true;
  }

  closeModal(): void {
    this.isJobModalOpen = false;
    this.isInterviewModalOpen = false;
    this.selectedJob = null;
    this.selectedInterview = null;
  }
}