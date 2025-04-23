import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminChartComponent } from '../admin-chart/admin-chart.component';
import { DashboardService } from '../../services/dashboard.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  metrics = {
    applications: 0,
    interviewsScheduled: 0,
    jobOpenings: 0,
  };

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.fetchMetrics();
  }

  fetchMetrics(): void {
    this.dashboardService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
      },
      error: (err) => {
        console.error('Error fetching metrics:', err);

      },
    });
  }
}