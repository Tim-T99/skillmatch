import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environment'; 

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
  styleUrl: './admin-chat.component.css'
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.chatForm = this.fb.group({
      message: new FormControl<string | null>('', { nonNullable: true })
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getUserRole() !== 1) {
      console.error('User not logged in or not an admin');
      this.messages.push({
        text: 'Please log in as an admin to use the chat.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const messageControl = this.chatForm.controls.message;
    const text = messageControl.value?.trim();

    if (!text) return;

    // Add admin message
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Clear input
    messageControl.reset();

    // Send to Gemini via backend
    this.handleBotResponse(text);
  }

  private handleBotResponse(userMessage: string): void {
    if (!this.authService.isLoggedIn()) {
      this.messages.push({
        text: 'Error: You must be logged in to query the database.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    this.http.post(`${environment.apiUrl}/gemini/query`, { prompt: userMessage }).subscribe({
      next: (data: any) => {
        const responseText = this.formatResponse(data);
        this.messages.push({
          text: responseText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      },
      error: (err) => {
        console.error('Gemini query error:', err);
        this.messages.push({
          text: `Error: Failed to process query. ${err.status === 401 ? 'Please log in again.' : 'Try again later.'}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  }

  private formatResponse(data: any): string {
    if (Array.isArray(data)) {
      // SQL query results
      if (data.length === 0) return 'No results found.';
      return data.map(row => {
        if ('first_name' in row) {
          // User (employer/seeker) results
          return `User: ${row.first_name} ${row.second_name} (ID: ${row.id}, Email: ${row.email}, Role: ${row.role_id === 1 ? 'Admin' : row.role_id === 2 ? 'Employer' : 'Seeker'})`;
        } else if ('title' in row) {
          // Job results
          return `Job: ${row.title} (ID: ${row.id}, Status: ${row.status}, Employer ID: ${row.employer_id})`;
        } else if ('count' in row) {
          // Analytics results
          return `Analytics: ${JSON.stringify(row)}`;
        }
        return JSON.stringify(row);
      }).join('\n');
    } else if (data.match) {
      // Matching results (e.g., job/seeker matches for analytics)
      return data.match.map((item: any) => {
        if ('title' in item) {
          return `Job Match: ${item.title} (ID: ${item.id}, Score: ${item.score}%)`;
        } else {
          return `User Match: ${item.name} (ID: ${item.id}, Score: ${item.score}%)`;
        }
      }).join('\n');
    }
    return JSON.stringify(data);
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}