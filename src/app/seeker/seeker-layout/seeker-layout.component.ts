import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeekerSidebarComponent } from '../seeker-sidebar/seeker-sidebar.component';

@Component({
  selector: 'app-seeker-layout',
  imports: [CommonModule, RouterOutlet, SeekerSidebarComponent],
  templateUrl: './seeker-layout.component.html',
  styleUrl: './seeker-layout.component.css'
})
export class SeekerLayoutComponent {
  isSidebarOpen = false;

  toggleSidebar(){
   this.isSidebarOpen = !this.isSidebarOpen
  }
}
