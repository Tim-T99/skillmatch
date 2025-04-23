import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service'; 
import { HttpClientModule } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css'],
})
export class AdminUserManagementComponent implements OnInit {
  dashboardStats = { applications: 0, interviews: 0, jobOpenings: 0 };
  users: User[] = [];
  filterForm: FormGroup;
  userForm: FormGroup;
  selectedUser: User | null = null;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.filterForm = this.fb.group({
      roleFilter: ['All'],
      searchQuery: [''],
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.filterForm.valueChanges.subscribe(() => {
      this.loadUsers();
    });
    this.loadUsers();
  }

  loadDashboardStats(): void {
    this.userService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => console.error('Error loading dashboard stats:', error),
    });
  }

  loadUsers(): void {
    const { roleFilter, searchQuery } = this.filterForm.value;
    this.userService.getUsers(roleFilter, searchQuery).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error('Error loading users:', error),
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      roleFilter: 'All',
      searchQuery: '',
    });
  }

  openModal(user: User, mode: 'view' | 'edit'): void {
    this.selectedUser = { ...user };
    this.isModalOpen = true;
    this.isEditMode = mode === 'edit';

    this.userForm.patchValue({
      name: this.selectedUser.name,
      role: this.selectedUser.role,
      status: this.selectedUser.status,
    });

    if (!this.isEditMode) {
      this.userForm.disable();
    } else {
      this.userForm.enable();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.isEditMode = false;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid && this.selectedUser) {
      const updatedUser = { ...this.selectedUser, ...this.userForm.value };
      this.userService.updateUser(this.selectedUser.id, updatedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => console.error('Error updating user:', error),
      });
    }
  }

  viewUser(user: User) {
    this.openModal(user, 'view');
  }

  editUser(user: User) {
    this.openModal(user, 'edit');
  }

  deleteUser(user: User) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error deleting user:', error),
      });
    }
  }
}