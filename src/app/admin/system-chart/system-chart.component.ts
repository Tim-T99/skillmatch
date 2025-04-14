import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-system-chart',
  imports: [CommonModule, FormsModule],
  templateUrl: './system-chart.component.html',
  styleUrl: './system-chart.component.css'
})
export class SystemChartComponent implements AfterViewInit{
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  // Filter states
  selectedFilter: string = 'Memory'; // Default to "Employers" as in the screenshot
  selectedTimeframe: string = 'Weekly'; // Default to "Annually" as in the screenshot

  // Sample data for different filters and timeframes
  private dataMap: { [key: string]: { [key: string]: number[] } } = {
    Memory: {
      Daily: [60, 42, 31, 10, 15, 14, 13, 70, 90, 80, 90, 70],
      Weekly: [50, 60, 55, 65, 70, 68, 62, 30, 45, 40, 55, 60],
      Annually: [90, 50, 22, 30, 35, 32, 80, 48, 20, 80, 50, 30]
    },
    CPU: {
      Daily: [50, 60, 55, 65, 75, 70, 65, 35, 45, 40, 55, 60],
      Weekly: [50, 30, 75, 35, 50, 40, 30, 50, 25, 20, 75, 30],
      Annually: [90, 70, 62, 30, 55, 62, 80, 48, 90, 80, 50, 30]
    }
  };

  // Labels for different timeframes
  private labelsMap: { [key: string]: string[] } = {
    Daily: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12'],
    Weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    Annually: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  };

  // Y-axis max values for different timeframes
  private yAxisMaxMap: { [key: string]: number } = {
    Daily: 100,
    Weekly: 100,
    Annually: 100
  };

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Create a gradient for the fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#000d1c');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labelsMap[this.selectedTimeframe],
        datasets: [
          {
            label: 'System',
            data: this.dataMap[this.selectedFilter][this.selectedTimeframe],
            fill: true,
            backgroundColor: gradient,
            borderColor: '#000d1c',
            pointBackgroundColor: '#ff4900',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4B5EAA',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#000d1c',
            titleFont: { size: 14, weight: 'normal' },
            bodyFont: { size: 14 },
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4B5EAA',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              display: true
            },
            ticks: {
              color: '#A0A0A0'
            }
          },
          y: {
            min: 0,
            max: this.yAxisMaxMap[this.selectedTimeframe],
            ticks: {
              stepSize: this.yAxisMaxMap[this.selectedTimeframe] / 5,
              color: '#A0A0A0',
              callback: (value) => {
                if (value === 0) return '0';
                return `${Number(value)}`;
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // Update chart when filter changes
  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.labelsMap[this.selectedTimeframe];
      this.chart.data.datasets[0].data = this.dataMap[this.selectedFilter][this.selectedTimeframe];
      this.chart.options.scales!['y']!.max = this.yAxisMaxMap[this.selectedTimeframe];
      (this.chart.options.scales!['y']!.ticks as any).stepSize = this.yAxisMaxMap[this.selectedTimeframe] / 5;
      this.chart.update();
    }
  }

  // Handle filter change
  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.updateChart();
  }

  // Handle timeframe change
  onTimeframeChange(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    this.updateChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

