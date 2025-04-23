import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
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
  details: {
    description: string;
    requirements: string[];
    skills: string[];
    postedDate: string;
  };
}

interface RecommendedCareer {
  position: string;
  jobsAvailable: number;
  relatedJobs: Job[];
}

interface SeekerStats {
  applications: number;
  interviews: number;
  jobOpenings: number;
}

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './seeker-dashboard.component.html',
  styleUrls: ['./seeker-dashboard.component.css'],
})
export class SeekerDashboardComponent implements OnInit {
  jobs: Job[] = [];
  recommendedCareers: RecommendedCareer[] = [];
  stats: SeekerStats = { applications: 0, interviews: 0, jobOpenings: 0 };
  filterForm: FormGroup<{
    statusFilter: FormControl<string | null>;
    searchQuery: FormControl<string | null>;
  }>;
  selectedJob: Job | null = null;
  selectedCareer: RecommendedCareer | null = null;
  isJobModalOpen: boolean = false;
  isCareerModalOpen: boolean = false;
  applicationError: string | null = null;
  applicationSuccess: string | null = null;

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
    this.fetchStats();
    this.fetchJobs();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  fetchStats(): void {
    this.http
      .get<SeekerStats>(`${environment.apiUrl}/seeker-stats`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (error) => {
          console.error('Error fetching stats:', error);
        },
      });
  }

  fetchJobs(): void {
    this.http
      .get<{ jobs: Job[]; recommendedCareers: RecommendedCareer[] }>(
        `${environment.apiUrl}/allSeeker-jobs`,
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: (data) => {
          this.jobs = data.jobs;
          this.recommendedCareers = data.recommendedCareers;
        },
        error: (error) => {
          console.error('Error fetching jobs:', error);
        },
      });
  }

  applyFilters(): void {
    const { statusFilter, searchQuery } = this.filterForm.value;

    let filteredJobs = [...this.jobs];

    if (statusFilter && statusFilter !== 'All') {
      filteredJobs = filteredJobs.filter((job) => job.status === statusFilter);
    }

    if (searchQuery?.trim()) {
      filteredJobs = filteredJobs.filter(
        (job) =>
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
    this.applicationError = null;
    this.applicationSuccess = null;
  }

  openCareerModal(career: RecommendedCareer): void {
    this.selectedCareer = career;
    this.isCareerModalOpen = true;
  }

  closeModal(): void {
    this.isJobModalOpen = false;
    this.isCareerModalOpen = false;
    this.selectedJob = null;
    this.selectedCareer = null;
    this.applicationError = null;
    this.applicationSuccess = null;
  }

  applyJob(job: Job): void {
    if (!job.id) {
      this.applicationError = 'Job ID is missing.';
      return;
    }

    this.http
      .post(
        `${environment.apiUrl}/apply-job`,
        { jobId: job.id },
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: (response: any) => {
          this.applicationSuccess = 'Application submitted successfully!';
          this.fetchStats();
        },
        error: (error) => {
          console.error('Error applying for job:', error);
          this.applicationError =
            error.status === 400
              ? error.error.message
              : 'An error occurred while applying. Please try again.';
        },
      });
  }
}