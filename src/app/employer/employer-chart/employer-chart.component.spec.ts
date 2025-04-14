import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerChartComponent } from './employer-chart.component';

describe('EmployerChartComponent', () => {
  let component: EmployerChartComponent;
  let fixture: ComponentFixture<EmployerChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
