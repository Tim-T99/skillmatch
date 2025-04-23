import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekerSidebarComponent } from './seeker-sidebar.component';

describe('SeekerSidebarComponent', () => {
  let component: SeekerSidebarComponent;
  let fixture: ComponentFixture<SeekerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeekerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeekerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
