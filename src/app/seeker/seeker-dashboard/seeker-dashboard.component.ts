import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface Job {
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

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seeker-dashboard.component.html',
  styleUrl: './seeker-dashboard.component.css'
})
export class SeekerDashboardComponent implements OnInit {
  private originalJobs: Job[] = [
    {
      position: 'Software Engineer',
      organization: 'Tech Corp',
      location: 'San Francisco, CA',
      status: 'Active',
      score: 4.5,
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
      details: {
        description: 'Analyze large datasets to drive business decisions',
        requirements: ['Python', 'SQL', 'Machine Learning'],
        skills: ['Python', 'R', 'Tableau', 'Pandas'],
        postedDate: '2025-03-20'
      }
    },
    {
      position: 'UX Designer',
      organization: 'Design Co',
      location: 'Remote',
      status: 'Closed',
      score: 3.8,
      details: {
        description: 'Create user-friendly interfaces for mobile apps',
        requirements: ['Figma', 'User Research', '2+ years experience'],
        skills: ['Figma', 'Sketch', 'Prototyping', 'Wireframing'],
        postedDate: '2025-02-10'
      }
    },
    {
      position: 'Frontend Developer',
      organization: 'WebWorks',
      location: 'Austin, TX',
      status: 'Active',
      score: 4.3,
      details: {
        description: 'Build responsive web interfaces using modern JavaScript frameworks',
        requirements: ['React', 'TypeScript', '3+ years experience'],
        skills: ['React', 'Next.js', 'CSS', 'Webpack'],
        postedDate: '2025-04-01'
      }
    },
    {
      position: 'Backend Engineer',
      organization: 'CloudNet',
      location: 'Seattle, WA',
      status: 'Interviewing',
      score: 4.0,
      details: {
        description: 'Develop scalable APIs and microservices for cloud applications',
        requirements: ['Node.js', 'Docker', '4+ years experience'],
        skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
        postedDate: '2025-03-28'
      }
    },
    {
      position: 'Product Manager',
      organization: 'Innovate Solutions',
      location: 'Chicago, IL',
      status: 'Active',
      score: 4.7,
      details: {
        description: 'Lead cross-functional teams to deliver SaaS products',
        requirements: ['Agile', 'Stakeholder Management', '3+ years experience'],
        skills: ['Scrum', 'JIRA', 'Roadmapping', 'Analytics'],
        postedDate: '2025-03-10'
      }
    },
    {
      position: 'DevOps Engineer',
      organization: 'TechTrend',
      location: 'Remote',
      status: 'Active',
      score: 3.9,
      details: {
        description: 'Optimize CI/CD pipelines and infrastructure for high availability',
        requirements: ['Kubernetes', 'Terraform', '2+ years experience'],
        skills: ['Kubernetes', 'Jenkins', 'Terraform', 'Linux'],
        postedDate: '2025-02-20'
      }
    },
    {
      position: 'Mobile Developer',
      organization: 'AppCraft',
      location: 'Los Angeles, CA',
      status: 'Active',
      score: 4.4,
      details: {
        description: 'Create cross-platform mobile apps for iOS and Android',
        requirements: ['Flutter', 'Dart', '2+ years experience'],
        skills: ['Flutter', 'React Native', 'Firebase', 'UI Design'],
        postedDate: '2025-04-05'
      }
    }
  ];

  recommendedCareers: RecommendedCareer[] = [
    {
      position: 'Software Engineer',
      jobsAvailable: 25,
      relatedJobs: [
        this.originalJobs[0],
        {
          position: 'Frontend Developer',
          organization: 'Web Solutions',
          location: 'Austin, TX',
          status: 'Active',
          score: 4.3,
          details: {
            description: 'Build responsive web interfaces',
            requirements: ['React', 'CSS', 'JavaScript'],
            skills: ['React', 'TypeScript', 'Webpack', 'Jest'],
            postedDate: '2025-04-01'
          }
        }
      ]
    },
    {
      position: 'Data Scientist',
      jobsAvailable: 15,
      relatedJobs: [
        this.originalJobs[1],
        {
          position: 'Machine Learning Engineer',
          organization: 'AI Labs',
          location: 'Boston, MA',
          status: 'Interviewing',
          score: 4.6,
          details: {
            description: 'Develop AI models for predictive analytics',
            requirements: ['TensorFlow', 'Python', 'PhD preferred'],
            skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Docker'],
            postedDate: '2025-03-25'
          }
        }
      ]
    }
  ];

  jobs: Job[] = [];
  filterForm: FormGroup<{
    statusFilter: FormControl<string | null>;
    searchQuery: FormControl<string | null>;
  }>;
  selectedJob: Job | null = null;
  selectedCareer: RecommendedCareer | null = null;
  isJobModalOpen: boolean = false;
  isCareerModalOpen: boolean = false;

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

  openJobModal(job: Job): void {
    this.selectedJob = job;
    this.isJobModalOpen = true;
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
  }
}