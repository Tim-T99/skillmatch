import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { passwordMatcher } from '../validators/password-matcher.validator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seeker-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seeker-signup.component.html',
  styleUrls: ['./seeker-signup.component.css']
})
export class SeekerSignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm = this.fb.group(
    {
      firstName: ['', Validators.required],
      secondName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone1: [''],
      telephone2: [''],
      address: [''],
      postalCode: [''],
      edLevel: ['', Validators.required],
      institution: ['', Validators.required],
      cv: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)]], // Optional URL
      skills: this.fb.array([]),
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required,]
    },
    { validators: passwordMatcher('password', 'confirmPassword') }
  );

  errorMessage: string | null = null;

  get skills(): FormArray<FormControl> {
    return this.signupForm.get('skills') as FormArray<FormControl>;
  }

  ngOnInit() {
    this.addSkill();
  }

  addSkill() {
    this.skills.push(this.fb.control('', Validators.required));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.errorMessage = null;
      const {
        firstName,
        secondName,
        email,
        telephone1,
        telephone2,
        address,
        postalCode,
        edLevel,
        institution,
        cv,
        skills,
        password
      } = this.signupForm.value;

      this.authService
        .signupSeeker(
          firstName!,
          secondName!,
          email!,
          telephone1 || '',
          telephone2 || '',
          address || '',
          postalCode || '',
          edLevel!,
          institution!,
          skills as string[],
          password!,
          cv || ''
        )
        .subscribe({
          next: () => {
            window.alert('Success!')
            this.router.navigate(['/seeker/seekerDash']);
            this.signupForm.reset();
          },
          error: (error) => {
            console.error('Signup error:', error);
            this.errorMessage =
              error.status === 400 ? error.error.message : 'An error occurred. Please try again later.';
              window.alert('An error occurred')
          }
        });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      window.alert("Please fill all fields")
    }
  }
}