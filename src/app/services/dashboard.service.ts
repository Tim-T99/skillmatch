import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

interface DashboardMetrics {
  applications: number;
  interviewsScheduled: number;
  jobOpenings: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard`, {
      headers: this.getHeaders(),
    });
  }

  getChartData(filter: string, timeframe: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/dashboard/chart`, {
      headers: this.getHeaders(),
      params: { filter, timeframe },
    });
  }
}