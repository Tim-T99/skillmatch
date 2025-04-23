import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seeker-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './seeker-sidebar.component.html',
  styleUrl: './seeker-sidebar.component.css'
})
export class SeekerSidebarComponent {
  private authService = inject(AuthService)
  private router = inject(Router)
  logout(){
    this.authService.logout();
    this.router.navigate(['landing'])

  }
}
