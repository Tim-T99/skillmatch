import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface User {
  name: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css']
})
export class AdminUserManagementComponent implements OnInit {
  private originalUsers: User[] = [
    { name: 'Avery Lin', role: 'Employer', status: 'Active' },
    { name: 'Luke Skywalker', role: 'Seeker', status: 'Inactive' },
    { name: 'Diana Prince', role: 'Seeker', status: 'Active' },
    { name: 'Natasha Romanoff', role: 'Seeker', status: 'Inactive' },
    { name: 'Peter Quill', role: 'Employer', status: 'Active' },
    { name: 'Steve Rogers', role: 'Seeker', status: 'Inactive' },
    { name: 'Clint Barton', role: 'Employer', status: 'Active' },
    { name: 'Wade Wilson', role: 'Seeker', status: 'Active' },
    { name: 'Wanda Maximoff', role: 'Employer', status: 'Inactive' },
    { name: 'Hal Jordan', role: 'Seeker', status: 'Suspended' },
    { name: 'Arthur Lin', role: 'Employer', status: 'Suspended' }
  ];

  users: User[] = [];
  filterForm: FormGroup;
  userForm: FormGroup;
  selectedUser: User | null = null;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {
    // Filter form for role and search
    this.filterForm = this.fb.group({
      roleFilter: ['All'],
      searchQuery: ['']
    });

    // User form for editing user details
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.users = [...this.originalUsers].sort((a, b) => a.name.localeCompare(b.name));

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const { roleFilter, searchQuery } = this.filterForm.value;

    let filteredUsers = [...this.originalUsers].sort((a, b) => a.name.localeCompare(b.name));

    if (roleFilter !== 'All') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }

    if (searchQuery.trim()) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    this.users = filteredUsers;
  }

  clearFilters(): void {
    this.filterForm.reset({
      roleFilter: 'All',
      searchQuery: ''
    });
  }

  openModal(user: User, mode: 'view' | 'edit'): void {
    this.selectedUser = { ...user }; // Create a copy to avoid direct mutation
    this.isModalOpen = true;
    this.isEditMode = mode === 'edit';

    // Populate the form with user data
    this.userForm.patchValue({
      name: this.selectedUser.name,
      role: this.selectedUser.role,
      status: this.selectedUser.status
    });

    // Disable form in view mode
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
      const userIndex = this.originalUsers.findIndex(user => user.name === this.selectedUser!.name);
      if (userIndex !== -1) {
        this.originalUsers[userIndex] = updatedUser;
      }
      this.applyFilters(); // Reapply filters to update the table
      this.closeModal();
    }
  }

  viewUser(user: User) {
    this.openModal(user, 'view');
  }

  editUser(user: User) {
    this.openModal(user, 'edit');
  }

  deleteUser(user: User) {
    this.originalUsers = this.originalUsers.filter(u => u.name !== user.name);
    this.applyFilters();
  }
}