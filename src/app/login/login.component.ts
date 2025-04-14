import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms'
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService)
  private router = inject(Router)

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  },
);

  onSubmit(){
    this.router.navigate(['/admin']);
    // if (this.loginForm.valid) {
    //   const formData = this.loginForm.value;
  
    //   const email = formData.email as string;
    //   const password = formData.password as string;
  
    //   this.authService.login( email, password).subscribe({
    //     next: () => {
    //       this.loginForm.reset()
    //       this.router.navigate(['/home']);
    //     },
    //     error: (error) => {console.error('Error saving data:', error)

    //       if (error.status === 401 && error.error.message === 'Invalid email or password') {
    //         window.alert('Invalid email or password');
    //         this.loginForm.reset()
    //       } else {
    //         window.alert('An error occurred. Please try again later.');
    //       }
    //     }
    //   });
    // } else {
    //   console.log('Form is invalid');
    // }
  }
}
