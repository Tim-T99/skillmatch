import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getJobs(): Observable<Job[]> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`, { headers: this.getHeaders() });
  }

  createJob(job: Partial<Job>): Observable<Job> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.post<Job>(`${this.apiUrl}/jobs`, job, { headers: this.getHeaders() });
  }

  updateJob(job: Job): Observable<Job> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.put<Job>(`${this.apiUrl}/jobs/${job.id}`, job, { headers: this.getHeaders() });
  }

  deleteJob(jobId: string): Observable<void> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.delete<void>(`${this.apiUrl}/jobs/${jobId}`, { headers: this.getHeaders() });
  }

  scheduleInterview(interview: Interview): Observable<Interview> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.post<Interview>(`${this.apiUrl}/interviews`, interview, { headers: this.getHeaders() });
  }
}

export interface Job {
  id: number;
  company_id: number;
  employer_id: number;
  title: string;
  status: string;
  description: string;
  location_type?: string;
  requirements?: string[];
  skills?: string;
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