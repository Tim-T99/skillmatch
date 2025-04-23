import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerChartComponent } from '../employer-chart/employer-chart.component';
import { ChartService, MetricsData } from '../../services/chart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, EmployerChartComponent],
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.css'],
})
export class EmployerDashboardComponent implements OnInit {
  metrics: MetricsData = { applications: 0, interviews: 0, jobOpenings: 0 };
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private chartService: ChartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 2) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.chartService.getEmployerMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching metrics:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load metrics. Please try again.';
      },
    });
  }
}