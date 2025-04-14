import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { passwordMatcher } from '../../validators/password-matcher.validator';

@Component({
  selector: 'app-seeker-account',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './seeker-account.component.html',
  styleUrl: './seeker-account.component.css'
})
export class SeekerAccountComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService)
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

onSubmit(){
window.alert('Updated successfully')
}
}