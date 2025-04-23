import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employer-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './employer-sidebar.component.html',
  styleUrl: './employer-sidebar.component.css'
})
export class EmployerSidebarComponent {
  private authService = inject(AuthService)
  private router = inject(Router)

  logout(){
    this.authService.logout();
    this.router.navigate(['landing'])
  }
}
