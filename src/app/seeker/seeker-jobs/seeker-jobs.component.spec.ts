import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekerJobsComponent } from './seeker-jobs.component';

describe('SeekerJobsComponent', () => {
  let component: SeekerJobsComponent;
  let fixture: ComponentFixture<SeekerJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeekerJobsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeekerJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
