import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage: string | null = null;

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.errorMessage = null;
      console.log('Attempting login with email:', email);
      this.authService.login(email!, password!).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login response:', response);
          console.log('localStorage after login:', {
            accessToken: localStorage.getItem('accessToken'),
            currentUser: localStorage.getItem('currentUser')
          });
          const roleId = response.user.role_id;
          this.navigateByRole(roleId);
          this.loginForm.reset();
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage =
            error.status === 401
              ? 'Invalid email or password.'
              : error.status === 400
              ? error.error.message
              : 'An error occurred. Please try again later.';
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields.';
      this.loginForm.markAllAsTouched();
    }
  }

  private navigateByRole(roleId: number) {
    console.log('Navigating for role:', roleId);
    switch (roleId) {
      case 1:
        this.router.navigate(['/admin/adminDash']);
        break;
      case 2:
        this.router.navigate(['/employer/employerDash']);
        break;
      case 3:
        this.router.navigate(['/seeker/seekerDash']);
        break;
      default:
        this.errorMessage = 'Invalid role. Please contact support.';
        console.error('Unknown role_id:', roleId);
    }
  }
}