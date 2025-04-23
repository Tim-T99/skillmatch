import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

interface AdminProfile {
  firstName: string;
  secondName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(profile: AdminProfile & { password?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profile, {
      headers: this.getHeaders(),
    });
  }
}