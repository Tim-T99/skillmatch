import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekerLayoutComponent } from './seeker-layout.component';

describe('SeekerLayoutComponent', () => {
  let component: SeekerLayoutComponent;
  let fixture: ComponentFixture<SeekerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeekerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeekerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
