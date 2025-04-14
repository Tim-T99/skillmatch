import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms'
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { passwordMatcher } from '../validators/password-matcher.validator';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService)
  private router = inject(Router)
  private existingUsernames = ['john_doe', 'jane_smith', 'admin', 'librarian'];

  signupForm = this.fb.group({
    firstName: ['', [Validators.required]],
    secondName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone1: ['', [Validators.required]],
    telephone2: ['', [Validators.required]],
    address: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    companyName: ['', [Validators.required]],
    companyAddress: ['', [Validators.required]],
    companyPostalCode: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  },
  {validators: passwordMatcher('password', 'confirmPassword')}
);

onSubmit(){
  this.router.navigate(['/employer'])
//   if (this.signupForm.valid) {
//     const formData = this.signupForm.value;
    
//     const firstName = formData.firstName as string;
//     const secondName = formData.firstName as string;
//     const email = formData.email as string;
//     const telephone1 = formData.firstName as string;
//     const telephone2 = formData.firstName as string;
//     const address = formData.firstName as string;
//     const postalCode = formData.firstName as string;
//     const companyName = formData.firstName as string;
//     const companyAddress = formData.firstName as string;
//     const companyPostalCode = formData.firstName as string;
//     const password = formData.password as string;

//     this.authService.signup(firstName, secondName, email, telephone1, telephone2, address, postalCode, companyName, companyAddress, companyPostalCode, password).subscribe({
//       next: () => {
//         window.alert('Data submitted!');
//         this.signupForm.reset()
//         this.router.navigate(['/home']);
//       },
//       error: (error) => {console.error('Error saving data:', error)
//         if (error.status === 400 && error.error.message === 'User already exists') {
//           window.alert('User already exists.');
//           this.signupForm.reset()
//         } else {
//           window.alert('An error occurred. Please try again later.');
//         }
//       }
//     });
//   } else {
//     window.alert('Please fill all fields')
//   }
}
}
