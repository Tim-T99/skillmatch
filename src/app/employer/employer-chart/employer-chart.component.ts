import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Chart, ChartConfiguration } from 'chart.js';
import { ChartService, ChartData } from '../../services/chart.service';

@Component({
  selector: 'app-employer-chart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employer-chart.component.html',
  styleUrls: ['./employer-chart.component.css'],
})
export class EmployerChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  filterControl = new FormControl<'Applicants' | 'Jobs'>('Applicants');
  timeframeControl = new FormControl<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  isLoading: boolean = false;
  chartData: ChartData | null = null;
  errorMessage: string | null = null;

  private labelsMap: { [key in 'Daily' | 'Weekly' | 'Monthly']: string[] } = {
    Daily: Array.from({ length: 12 }, (_, i) => `Day ${i + 1}`),
    Weekly: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
    Monthly: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  };

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.loadChartData();
    // Subscribe to form control changes
    this.filterControl.valueChanges.subscribe(filter => {
      if (filter) this.updateChart();
    });
    this.timeframeControl.valueChanges.subscribe(timeframe => {
      if (timeframe) this.updateChart();
    });
  }

  ngAfterViewInit(): void {
    // Chart creation is handled in loadChartData callback
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  loadChartData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.chartService.getEmployerChart().subscribe({
      next: (data) => {
        this.chartData = data;
        this.isLoading = false;
        if (this.lineChartCanvas) {
          this.createChart();
        }
      },
      error: (err) => {
        console.error('Error fetching chart data:', err);
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to load chart data. Please try again.';
      },
    });
  }

  createChart(): void {
    if (!this.lineChartCanvas || !this.chartData) return;

    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Calculate dynamic y-axis max
    const selectedFilter = this.filterControl.value || 'Applicants';
    const selectedTimeframe = this.timeframeControl.value || 'Weekly';
    const data = this.chartData[selectedFilter][selectedTimeframe];
    const maxDataValue = Math.max(...data, 0);
    const yAxisMax = Math.ceil(maxDataValue * 1.2) || 10; // Add 20% padding, default to 10 if no data
    const stepSize = Math.ceil(yAxisMax / 5);

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#000d1c');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.labelsMap[selectedTimeframe],
        datasets: [
          {
            label: selectedFilter,
            data: data,
            fill: true,
            backgroundColor: gradient,
            borderColor: '#000d1c',
            pointBackgroundColor: '#ff4900',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4B5EAA',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#000d1c',
            titleFont: { size: 14, weight: 'normal' },
            bodyFont: { size: 14 },
            titleColor: '#f0f0f0',
            bodyColor: '#f0f0f0',
            borderColor: '#4B5EAA',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: '#e5e7eb',
            },
            ticks: {
              color: '#A0A0A0',
            },
          },
          y: {
            min: 0,
            max: yAxisMax,
            ticks: {
              stepSize: stepSize,
              color: '#A0A0A0',
              callback: (value: string | number) => {
                const numValue = Number(value);
                if (numValue === 0) return '0';
                return numValue >= 1000 ? `${numValue / 1000}k` : numValue.toString();
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    };

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(ctx, config);
  }

  updateChart(): void {
    if (!this.chart || !this.chartData) return;

    const selectedFilter = this.filterControl.value || 'Applicants';
    const selectedTimeframe = this.timeframeControl.value || 'Weekly';
    const data = this.chartData[selectedFilter][selectedTimeframe];
    const maxDataValue = Math.max(...data, 0);
    const yAxisMax = Math.ceil(maxDataValue * 1.2) || 10;
    const stepSize = Math.ceil(yAxisMax / 5);

    this.chart.data.labels = this.labelsMap[selectedTimeframe];
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].label = selectedFilter;
    this.chart.options!.scales!['y']!.max = yAxisMax;
    (this.chart.options!.scales!['y']!.ticks as any).stepSize = stepSize;
    this.chart.options!.scales!['y']!.ticks = {
      ...this.chart.options!.scales!['y']!.ticks,
      callback: (value: string | number) => {
        const numValue = Number(value);
        if (numValue === 0) return '0';
        return numValue >= 1000 ? `${numValue / 1000}k` : numValue.toString();
      },
    };
    this.chart.update();
  }
}