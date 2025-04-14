import { Component } from '@angular/core';
import { EmployerSidebarComponent } from "../employer-sidebar/employer-sidebar.component";
import { EmployerChartComponent } from "../employer-chart/employer-chart.component";

@Component({
  selector: 'app-employer-dashboard',
  imports: [EmployerChartComponent],
  templateUrl: './employer-dashboard.component.html',
  styleUrl: './employer-dashboard.component.css'
})
export class EmployerDashboardComponent {

}
