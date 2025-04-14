import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmployerSidebarComponent } from "../employer-sidebar/employer-sidebar.component";

@Component({
  selector: 'app-employer-layout',
  imports: [CommonModule, RouterOutlet, EmployerSidebarComponent],
  templateUrl: './employer-layout.component.html',
  styleUrl: './employer-layout.component.css'
})
export class EmployerLayoutComponent {
  isSidebarOpen = false;

 toggleSidebar(){
  this.isSidebarOpen = !this.isSidebarOpen
 }
}
