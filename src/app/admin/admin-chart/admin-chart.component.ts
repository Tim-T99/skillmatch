import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../../services/dashboard.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-chart.component.html',
  styleUrls: ['./admin-chart.component.css'],
})
export class AdminChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  selectedFilter: string = 'All';
  selectedTimeframe: string = 'Daily';

  private labelsMap: { [key: string]: string[] } = {
    Daily: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12'],
    Weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    Annually: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  };

  private yAxisMaxMap: { [key: string]: number } = {
    Daily: 300,
    Weekly: 1500,
    Annually: 6000,
  };

  private chartData: number[] = [];

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngAfterViewInit(): void {
    this.createChart();
    this.fetchChartData();
  }

  createChart(): void {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#ff4900');
    gradient.addColorStop(1, 'rgba(255, 73, 0, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labelsMap[this.selectedTimeframe],
        datasets: [
          {
            label: 'Users',
            data: this.chartData,
            fill: true,
            backgroundColor: gradient,
            borderColor: '#000d1c',
            pointBackgroundColor: '#ff4900',
            pointBorderColor: '#f0f0f0',
            pointHoverBackgroundColor: '#f0f0f0',
            pointHoverBorderColor: '#000d1c',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#000d1c',
            titleFont: { size: 14, weight: 'normal' },
            bodyFont: { size: 14 },
            titleColor: '#f0f0f0',
            bodyColor: '#f0f0f0',
            borderColor: '#ff4900',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { color: '#e5e5e5' },
            ticks: { color: '#000d1c' },
          },
          y: {
            min: 0,
            max: this.yAxisMaxMap[this.selectedTimeframe],
            ticks: {
              stepSize: this.yAxisMaxMap[this.selectedTimeframe] / 5,
              color: '#000d1c',
              callback: (value) => (value === 0 ? '0' : `${Number(value) / 1000}k`),
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.labelsMap[this.selectedTimeframe];
      this.chart.data.datasets[0].data = this.chartData;
      this.chart.options.scales!['y']!.max = this.yAxisMaxMap[this.selectedTimeframe];
      (this.chart.options.scales!['y']!.ticks as any).stepSize = this.yAxisMaxMap[this.selectedTimeframe] / 5;
      this.chart.update();
    }
  }

  fetchChartData(): void {
    this.dashboardService.getChartData(this.selectedFilter, this.selectedTimeframe).subscribe({
      next: (data) => {
        this.chartData = data;
        this.updateChart();
      },
      error: (err) => {
        console.error('Error fetching chart data:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.fetchChartData();
  }

  onTimeframeChange(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    this.fetchChartData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}