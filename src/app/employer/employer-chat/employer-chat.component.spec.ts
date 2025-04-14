import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerChatComponent } from './employer-chat.component';

describe('EmployerChatComponent', () => {
  let component: EmployerChatComponent;
  let fixture: ComponentFixture<EmployerChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
