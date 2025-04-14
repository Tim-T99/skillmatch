import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface Job {
  position: string;
  organization: string;
  location: string;
  status: 'Active' | 'Interviewing' | 'Closed';
  score: number;
  applied: boolean; // Added to track application status
  details: {
    description: string;
    requirements: string[];
    skills: string[];
    postedDate: string;
  };
  interview?: {
    date: string; // Format: YYYY-MM-DD
    meetingLink: string;
  };
}

@Component({
  selector: 'app-seeker-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seeker-jobs.component.html',
  styleUrl: './seeker-jobs.component.css'
})
export class SeekerJobsComponent implements OnInit {
  private originalJobs: Job[] = [
    {
      position: 'Software Engineer',
      organization: 'Tech Corp',
      location: 'San Francisco, CA',
      status: 'Active',
      score: 4.5,
      applied: true, // User has applied
      details: {
        description: 'Develop web applications using Angular and Node.js',
        requirements: ['3+ years experience', 'TypeScript', 'Agile methodology'],
        skills: ['Angular', 'Node.js', 'REST APIs', 'Git'],
        postedDate: '2025-03-15'
      }
    },
    {
      position: 'Data Scientist',
      organization: 'Data Inc',
      location: 'New York, NY',
      status: 'Interviewing',
      score: 4.2,
      applied: true, // User has applied
      details: {
        description: 'Analyze large datasets to drive business decisions',
        requirements: ['Python', 'SQL', 'Machine Learning'],
        skills: ['Python', 'R', 'Tableau', 'Pandas'],
        postedDate: '2025-03-20'
      },
      interview: {
        date: '2025-04-15',
        meetingLink: 'https://zoom.us/j/1234567890'
      }
    },
    {
      position: 'UX Designer',
      organization: 'Design Co',
      location: 'Remote',
      status: 'Closed',
      score: 3.8,
      applied: false, // User has not applied
      details: {
        description: 'Create user-friendly interfaces for mobile apps',
        requirements: ['Figma', 'User Research', '2+ years experience'],
        skills: ['Figma', 'Sketch', 'Prototyping', 'Wireframing'],
        postedDate: '2025-02-10'
      }
    },
    {
      position: 'Machine Learning Engineer',
      organization: 'AI Labs',
      location: 'Boston, MA',
      status: 'Interviewing',
      score: 4.6,
      applied: false, // User has not applied
      details: {
        description: 'Develop AI models for predictive analytics',
        requirements: ['TensorFlow', 'Python', 'PhD preferred'],
        skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Docker'],
        postedDate: '2025-03-25'
      },
      interview: {
        date: '2025-04-20',
        meetingLink: 'https://meet.google.com/xyz-123-abc'
      }
    }
  ];

  jobs: Job[] = [];
  filterForm: FormGroup<{
    statusFilter: FormControl<string | null>;
    searchQuery: FormControl<string | null>;
  }>;
  selectedJob: Job | null = null;
  selectedInterviewJob: Job | null = null;
  isJobModalOpen: boolean = false;
  isInterviewModalOpen: boolean = false;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      statusFilter: new FormControl<string | null>('All'),
      searchQuery: new FormControl<string | null>('')
    });
  }

  ngOnInit(): void {
    this.jobs = [...this.originalJobs];
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  get interviewJobs(): Job[] {
    return this.jobs.filter(
      job => job.applied && job.status === 'Interviewing' && job.interview
    );
  }

  applyFilters(): void {
    const { statusFilter, searchQuery } = this.filterForm.value;

    let filteredJobs = [...this.originalJobs];

    if (statusFilter && statusFilter !== 'All') {
      filteredJobs = filteredJobs.filter(job => job.status === statusFilter);
    }

    if (searchQuery?.trim()) {
      filteredJobs = filteredJobs.filter(job =>
        job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.organization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    this.jobs = filteredJobs;
  }

  clearFilters(): void {
    this.filterForm.reset({ statusFilter: 'All', searchQuery: '' });
  }

  applyJob(job: Job): void {
    job.applied = true;
    this.closeModal();
  }

  openJobModal(job: Job): void {
    this.selectedJob = job;
    this.isJobModalOpen = true;
  }

  openInterviewModal(job: Job): void {
    this.selectedInterviewJob = job;
    this.isInterviewModalOpen = true;
  }

  closeModal(): void {
    this.isJobModalOpen = false;
    this.isInterviewModalOpen = false;
    this.selectedJob = null;
    this.selectedInterviewJob = null;
  }
}