import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { passwordMatcher } from '../../validators/password-matcher.validator';

interface Seeker {
  id: number;
  email: string;
  firstName: string;
  secondName: string;
  telephone1: string;
  telephone2: string;
  address: string;
  postalCode: string;
  educationLevel: string;
  institution: string;
  skills: string[];
}

@Component({
  selector: 'app-seeker-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './seeker-account.component.html',
  styleUrls: ['./seeker-account.component.css'],
})
export class SeekerAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm = this.fb.group({
    firstName: ['', [Validators.required]],
    secondName: ['', [Validators.required]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    telephone1: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
    telephone2: ['', [Validators.pattern(/^\+?\d{10,15}$/)]],
    address: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    edLevel: ['', [Validators.required]],
    institution: ['', [Validators.required]],
    skills: this.fb.array([]),
    password: ['', [Validators.minLength(8)]],
    confirmPassword: [''],
  }, { validators: passwordMatcher('password', 'confirmPassword') });

  errorMessage: string | null = null;
  successMessage: string | null = null;

  get skills(): FormArray<FormControl> {
    return this.signupForm.get('skills') as FormArray<FormControl>;
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 3) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getSeekerProfile().subscribe({
      next: (seeker: Seeker) => {
        this.signupForm.patchValue({
          firstName: seeker.firstName,
          secondName: seeker.secondName,
          email: seeker.email,
          telephone1: seeker.telephone1,
          telephone2: seeker.telephone2,
          address: seeker.address,
          postalCode: seeker.postalCode,
          edLevel: seeker.educationLevel,
          institution: seeker.institution,
        });

        // Populate skills
        seeker.skills.forEach(skill => {
          this.skills.push(this.fb.control(skill, Validators.required));
        });

        if (seeker.skills.length === 0) {
          this.addSkill(); // Add one empty skill input if none exist
        }
      },
      error: (error) => {
        console.error('Error loading seeker data:', error);
        window.alert('Failed to load seeker data.');
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  addSkill() {
    this.skills.push(this.fb.control('', Validators.required));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      window.alert('Please fill out all required fields correctly.');
      return;
    }

    const formValue = this.signupForm.getRawValue();
    const updateData = {
      firstName: formValue.firstName,
      secondName: formValue.secondName,
      telephone1: formValue.telephone1,
      telephone2: formValue.telephone2 || null,
      address: formValue.address,
      postalCode: formValue.postalCode,
      educationLevel: formValue.edLevel,
      institution: formValue.institution,
      skills: (formValue.skills as (string | null)[]).filter((skill): skill is string => !!skill && skill.trim().length > 0),
      ...(formValue.password && { password: formValue.password }),
    };

    this.authService.updateSeekerProfile(updateData).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.errorMessage = null;
        this.signupForm.get('password')?.reset();
        this.signupForm.get('confirmPassword')?.reset();
        window.alert('Updated successfully');
      },
      error: (error) => {
        console.error('Error updating seeker data:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.successMessage = null;
        window.alert('Failed to update seeker data.');
      },
    });
  }
}