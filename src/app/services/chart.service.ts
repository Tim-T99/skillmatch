import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environment';

export interface ChartData {
  Applicants: { Daily: number[]; Weekly: number[]; Monthly: number[] };
  Jobs: { Daily: number[]; Weekly: number[]; Monthly: number[] };
}

export interface MetricsData {
  applications: number;
  interviews: number;
  jobOpenings: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getEmployerChart(): Observable<ChartData> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.get<ChartData>(`${this.apiUrl}/charts`, { headers: this.getHeaders() });
  }

  getEmployerMetrics(): Observable<MetricsData> {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      throw new Error('User is not an employer or not logged in');
    }
    return this.http.get<MetricsData>(`${this.apiUrl}/metrics`, { headers: this.getHeaders() });
  }
}