import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, SignupResponse, SeekerSignupResponse } from '../models/auth.model';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/`;
  private currentUser: { role_id: number; name?: string; id?: string } | null = null;
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {
    this.accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  signup(
    firstName: string,
    secondName: string,
    email: string,
    telephone1: string,
    telephone2: string,
    address: string,
    postalCode: string,
    companyName: string,
    companyAddress: string,
    companyPostalCode: string,
    password: string
  ): Observable<SignupResponse> {
    const body = {
      first_name: firstName,
      second_name: secondName,
      email,
      telephone_1: telephone1,
      telephone_2: telephone2,
      address,
      postal_code: postalCode,
      company_name: companyName,
      company_address: companyAddress,
      company_postal_code: companyPostalCode,
      password,
    };
    return this.http.post<SignupResponse>(`${this.apiUrl}register`, body).pipe(
      tap(response => {
        this.currentUser = {
          role_id: response.user.role_id,
          name: `${response.user.first_name} ${response.user.second_name}`,
          id: response.user.id.toString(),
        };
        this.accessToken = response.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log('Signup successful, accessToken:', this.accessToken, 'currentUser:', this.currentUser);
      })
    );
  }

  signupSeeker(
    firstName: string,
    secondName: string,
    email: string,
    telephone1: string,
    telephone2: string,
    address: string,
    postalCode: string,
    edLevel: string,
    institution: string,
    skills: string[],
    password: string,
    cv: string
  ): Observable<SeekerSignupResponse> {
    const body = {
      first_name: firstName,
      second_name: secondName,
      email,
      telephone_1: telephone1,
      telephone_2: telephone2,
      address,
      postal_code: postalCode,
      education_level: edLevel,
      institution,
      skills,
      password,
      cv,
    };
    return this.http.post<SeekerSignupResponse>(`${this.apiUrl}register/seeker`, body).pipe(
      tap(response => {
        this.currentUser = {
          role_id: response.user.role_id,
          name: `${response.user.first_name} ${response.user.second_name}`,
          id: response.user.id.toString(),
        };
        this.accessToken = response.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log('Seeker signup successful, accessToken:', this.accessToken, 'currentUser:', this.currentUser);
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, body).pipe(
      tap({
        next: response => {
          localStorage.setItem('accessToken', response.accessToken);
          this.currentUser = {
            role_id: response.user.role_id,
            name: response.user.name,
            id: response.user.id.toString(),
          };
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        },
        error: error => console.error('Login failed:', error)
      })
    );
  }

  isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    const loggedIn = !!this.currentUser && !!accessToken;
    return loggedIn;
  }

  getUserRole(): number | null {
    const role = this.currentUser ? this.currentUser.role_id : null;
    return role;
  }

  getEmployerId(): string | null {
    return this.currentUser && this.currentUser.role_id === 2 ? this.currentUser.id || null : null;
  }

getAccessToken(): string | null {
  this.accessToken = localStorage.getItem('accessToken');
  return this.accessToken;
}

  logout(): void {
    this.currentUser = null;
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.http.post(`${this.apiUrl}logout`, {}).subscribe({
      error: error => console.error('Logout request failed:', error)
    });
    console.log('Logged out, localStorage cleared');
  }

  getUserProfile(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getAccessToken()}`,
    });
    return this.http.get(`${this.apiUrl}employerProfile`, { headers });
  }

  getSeekerProfile(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getAccessToken()}`,
    });
    return this.http.get(`${this.apiUrl}seekerProfile`, { headers });
  }

  updateUserProfile(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getAccessToken()}`,
    });
    return this.http.post(`${this.apiUrl}update/employer`, data, { headers });
  }
  updateSeekerProfile(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getAccessToken()}`,
    });
    return this.http.post(`${this.apiUrl}seekerUpdate`, data, { headers });
  }
}