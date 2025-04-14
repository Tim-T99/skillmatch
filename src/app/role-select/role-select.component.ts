import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-select.component.html',
  styleUrl: './role-select.component.css'
})
export class RoleSelectComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  roleForm = this.fb.group({
    role: ['employer'] 
  });

  onSubmit() {
    const selectedRole = this.roleForm.get('role')?.value;
    if (selectedRole === 'employer') {
      this.router.navigate(['/signup']);
    } else if (selectedRole === 'seeker') {
      this.router.navigate(['/seeker-signup']);
    }
  }
}
