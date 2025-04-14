import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
      text: 'Hello! I’m your admin assistant. Ask about users, jobs, or system analytics, and I’ll help once Gemini is integrated!',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  constructor(private fb: FormBuilder) {
    this.chatForm = this.fb.group({
      message: new FormControl<string | null>('', { nonNullable: true })
    });
  }

  ngOnInit(): void {
    // Placeholder for Gemini connection (e.g., initialize API client)
    // TODO: Initialize Gemini client when integrated
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

    // Simulate bot response (placeholder for Gemini)
    this.handleBotResponse(text);
  }

  private handleBotResponse(userMessage: string): void {
    // TODO: Replace with Gemini API call to query database
    // Example: const response = await gemini.query(userMessage, { db: 'users' });
    const botMessage = this.generateMockResponse(userMessage);

    setTimeout(() => {
      this.messages.push({
        text: botMessage,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 500); // Simulate API delay
  }

  private generateMockResponse(userMessage: string): string {
    // Mock responses tailored for admin tasks
    if (userMessage.toLowerCase().includes('user') || userMessage.toLowerCase().includes('account')) {
      return 'I’ll soon manage user accounts via the database! Try asking to list users or update a status.';
    } else if (userMessage.toLowerCase().includes('job') || userMessage.toLowerCase().includes('posting')) {
      return 'I can handle job postings once Gemini is connected. Ask about active jobs or analytics!';
    } else if (userMessage.toLowerCase().includes('analytics') || userMessage.toLowerCase().includes('report')) {
      return 'System analytics will be available with Gemini. Ask for user activity or job stats!';
    } else {
      return 'I’m preparing to assist with Gemini. Try asking about users, jobs, or analytics!';
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}