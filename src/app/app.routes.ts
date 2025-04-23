import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { SeekerSignupComponent } from './seeker-signup/seeker-signup.component';
import { RoleSelectComponent } from './role-select/role-select.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminUserManagementComponent } from './admin/admin-user-management/admin-user-management.component';
import { AdminAccountComponent } from './admin/admin-account/admin-account.component';
import { AdminChatComponent } from './admin/admin-chat/admin-chat.component';
import { AdminSystemComponent } from './admin/admin-system/admin-system.component';
import { EmployerLayoutComponent } from './employer/employer-layout/employer-layout.component';
import { EmployerDashboardComponent } from './employer/employer-dashboard/employer-dashboard.component';
import { EmployerAccountComponent } from './employer/employer-account/employer-account.component';
import { EmployerChatComponent } from './employer/employer-chat/employer-chat.component';
import { EmployerJobsComponent } from './employer/employer-jobs/employer-jobs.component';
import { SeekerLayoutComponent } from './seeker/seeker-layout/seeker-layout.component';
import { SeekerChatComponent } from './seeker/seeker-chat/seeker-chat.component';
import { SeekerAccountComponent } from './seeker/seeker-account/seeker-account.component';
import { SeekerDashboardComponent } from './seeker/seeker-dashboard/seeker-dashboard.component';
import { SeekerJobsComponent } from './seeker/seeker-jobs/seeker-jobs.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'seeker-signup', component: SeekerSignupComponent },
  { path: 'role-select', component: RoleSelectComponent },
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [AuthGuard], // Protect parent
    canActivateChild: [AuthGuard], // Protect children
    children: [
      { path: 'adminDash', component: AdminDashboardComponent },
      { path: 'adminUserMgmt', component: AdminUserManagementComponent },
      { path: 'adminAccount', component: AdminAccountComponent },
      { path: 'adminChat', component: AdminChatComponent },
      { path: 'adminSystem', component: AdminSystemComponent },
      { path: '', redirectTo: 'adminDash', pathMatch: 'full' }
    ]
  },
  { 
    path: 'employer', 
    component: EmployerLayoutComponent, 
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'employerDash', component: EmployerDashboardComponent },
      { path: 'employerJobs', component: EmployerJobsComponent },
      { path: 'employerAccount', component: EmployerAccountComponent },
      { path: 'employerChat', component: EmployerChatComponent },
      { path: '', redirectTo: 'employerDash', pathMatch: 'full' }
    ]
  },
  { 
    path: 'seeker', 
    component: SeekerLayoutComponent, 
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'seekerDash', component: SeekerDashboardComponent },
      { path: 'seekerJobs', component: SeekerJobsComponent },
      { path: 'seekerAccount', component: SeekerAccountComponent },
      { path: 'seekerChat', component: SeekerChatComponent },
      { path: '', redirectTo: 'seekerDash', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Fallback to landing
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}