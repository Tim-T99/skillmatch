import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AdminChartComponent } from "../admin-chart/admin-chart.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

}
