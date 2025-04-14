import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekerChatComponent } from './seeker-chat.component';

describe('SeekerChatComponent', () => {
  let component: SeekerChatComponent;
  let fixture: ComponentFixture<SeekerChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeekerChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeekerChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
