import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-seeker-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './seeker-sidebar.component.html',
  styleUrl: './seeker-sidebar.component.css'
})
export class SeekerSidebarComponent {

}
