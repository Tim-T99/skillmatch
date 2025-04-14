import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core'; // Add OnInit
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { passwordMatcher } from '../validators/password-matcher.validator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seeker-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './seeker-signup.component.html',
  styleUrls: ['./seeker-signup.component.css'] // Fix styleUrl to styleUrls (array)
})
export class SeekerSignupComponent implements OnInit { // Implement OnInit
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private existingUsernames = ['john_doe', 'jane_smith', 'admin', 'librarian'];

  signupForm = this.fb.group({
    firstName: ['', [Validators.required]],
    secondName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone1: ['', [Validators.required]],
    telephone2: ['', [Validators.required]],
    address: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    edLevel: ['', [Validators.required]],
    institution: ['', [Validators.required]],
    skills: this.fb.array([]),
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatcher('password', 'confirmPassword') });

  get skills(): FormArray<FormControl> {
    return this.signupForm.get('skills') as FormArray<FormControl>;
  }

  ngOnInit() {
    this.addSkill(); // Add one skill input by default
  }

  addSkill() {
    this.skills.push(this.fb.control('', Validators.required));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onSubmit() {
    this.router.navigate(['/seeker'])
  //   if (this.signupForm.valid) {
  //     const formData = this.signupForm.value;

  //     const firstName = formData.firstName as string;
  //     const secondName = formData.secondName as string; // Fix: was firstName
  //     const email = formData.email as string;
  //     const telephone1 = formData.telephone1 as string; // Fix: was firstName
  //     const telephone2 = formData.telephone2 as string; // Fix: was firstName
  //     const address = formData.address as string; // Fix: was firstName
  //     const postalCode = formData.postalCode as string; // Fix: was firstName
  //     const edLevel = formData.edLevel as string; // Fix: was firstName
  //     const institution = formData.institution as string; // Fix: was firstName
  //     const skills = formData.skills as string[];
  //     const password = formData.password as string;

  //     this.authService.signup(firstName, secondName, email, telephone1, telephone2, address, postalCode, companyName, companyAddress, skills, password).subscribe({
  //       next: () => {
  //         window.alert('Data submitted!');
  //         this.signupForm.reset();
  //         this.router.navigate(['/home']);
  //       },
  //       error: (error) => {
  //         console.error('Error saving data:', error);
  //         if (error.status === 400 && error.error.message === 'User already exists') {
  //           window.alert('User already exists.');
  //           this.signupForm.reset();
  //         } else {
  //           window.alert('An error occurred. Please try again later.');
  //         }
  //       }
  //     });
  //     */
  //   } else {
  //     window.alert('Please fill all fields');
  //   }
  }
}