import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';  // Replace with your backend API URL

  constructor(private http: HttpClient) { }

  // Sign up new user
  signup(firstName: string, secondName: string, email: string, telephone1: string, telephone2: string, address: string, postalCode: string, companyName: string, companyAddress: string, companyPostalCod: string, password: string): Observable<any> {
    const body = { name, email, password };
    return this.http.post(`${this.apiUrl}/auth/register`, body);  // HTTP POST request to backend API
  }

  // Log in user
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/auth/login`, body);  // HTTP POST request to backend API
  }

  // Get the user role (for example purposes, this is a placeholder)
  getUserRole(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user-role`);  // HTTP GET request to get user role
  }
}
