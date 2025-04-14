import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-account',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-account.component.html',
  styleUrl: './admin-account.component.css'
})
export class AdminAccountComponent {
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  })

  onSubmit(){
    window.alert('Password updated successfully')
  }
}
