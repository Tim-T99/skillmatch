import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-employer-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './employer-sidebar.component.html',
  styleUrl: './employer-sidebar.component.css'
})
export class EmployerSidebarComponent {

}
