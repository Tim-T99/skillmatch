import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekerAccountComponent } from './seeker-account.component';

describe('SeekerAccountComponent', () => {
  let component: SeekerAccountComponent;
  let fixture: ComponentFixture<SeekerAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeekerAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeekerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
