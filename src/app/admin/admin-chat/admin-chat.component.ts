import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-chat.component.html',
  styleUrl: './admin-chat.component.css',
})
export class AdminChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  chatForm: FormGroup<{
    message: FormControl<string | null>;
  }>;
  messages: ChatMessage[] = [
    {
      text: 'Hello! I’m your admin assistant. Ask about users, jobs, or analytics, and I’ll query the database with Gemini!',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.chatForm = this.fb.group({
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 1) {
      console.error('User not logged in or not an admin');
      this.messages.push({
        text: 'Please log in as an admin to use the chat.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      this.chatForm.disable();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.chatForm.invalid || this.isLoading) return;

    const message = this.chatForm.value.message?.trim();
    if (!message) return;

    // Add admin message
    this.messages.push({
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Clear input
    this.chatForm.reset();

    // Send to Gemini via backend
    this.isLoading = true;
    this.chatService.sendQuery(message).subscribe({
      next: (response) => {
        this.messages.push({
          text: response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending query:', error);
        const errorMessage =
          error.status === 401 ? 'Please log in again.' : 'Failed to process query. Try again later.';
        this.messages.push({
          text: `Error: ${errorMessage}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
    });
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}