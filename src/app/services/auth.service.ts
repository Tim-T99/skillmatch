import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, SignupResponse, SeekerSignupResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://51.21.149.137:3000/api';
  private currentUser: { role_id: number; name?: string } | null = null;

  constructor(private http: HttpClient) {}

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
      password
    };
    return this.http.post<SignupResponse>(`${this.apiUrl}/auth/register`, body).pipe(
      tap(response => {
        this.currentUser = {
          role_id: response.user.role_id,
          name: `${response.user.first_name} ${response.user.second_name}`
        };
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
      cv
    };
    return this.http.post<SeekerSignupResponse>(`${this.apiUrl}/register/seeker`, body).pipe(
      tap(response => {
        this.currentUser = {
          role_id: response.user.role_id,
          name: `${response.user.first_name} ${response.user.second_name}`
        };
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, body).pipe(
      tap(response => {
        this.currentUser = {
          role_id: response.user.role_id,
          name: response.user.name
        };
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  getUserRole(): number | null {
    return this.currentUser ? this.currentUser.role_id : null;
  }

  logout(): void {
    this.currentUser = null;
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe();
  }
}