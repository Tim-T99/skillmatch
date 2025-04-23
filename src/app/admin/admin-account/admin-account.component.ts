import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AdminService } from '../../services/admin.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-account.component.html',
  styleUrls: ['./admin-account.component.css'],
})
export class AdminAccountComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.loginForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        secondName: ['', Validators.required],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        password: ['', Validators.minLength(6)],
        confirmPassword: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.adminService.getProfile().subscribe({
      next: (profile) => {
        this.loginForm.patchValue({
          firstName: profile.firstName,
          secondName: profile.secondName,
          email: profile.email,
        });
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { firstName, secondName, email, password } = this.loginForm.value;
    const updateData: any = { firstName, secondName, email };
    if (password) {
      updateData.password = password;
    }

    this.adminService.updateProfile(updateData).subscribe({
      next: () => {
        window.alert('Profile updated successfully');
        this.loginForm.patchValue({ password: '', confirmPassword: '' });
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        window.alert('Failed to update profile: ' + err.error?.error || 'Unknown error');
      },
    });
  }
}