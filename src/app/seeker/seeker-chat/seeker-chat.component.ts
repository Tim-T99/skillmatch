import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-seeker-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seeker-chat.component.html',
  styleUrl: './seeker-chat.component.css'
})
export class SeekerChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  chatForm: FormGroup<{
    message: FormControl<string | null>;
  }>;
  messages: ChatMessage[] = [
    {
      text: 'Hello! I’m your job assistant. Ask me about jobs, and I’ll help once Gemini is integrated!',
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
    // Placeholder for initial Gemini connection (e.g., authenticate API)
    // TODO: Initialize Gemini client when integrated
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const messageControl = this.chatForm.controls.message;
    const text = messageControl.value?.trim();

    if (!text) return;

    // Add user message
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
    // Example: const response = await gemini.query(userMessage, { db: 'jobs' });
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
    // Mock responses until Gemini is integrated
    if (userMessage.toLowerCase().includes('job')) {
      return 'I’ll soon be able to search jobs in the database! Try asking about specific roles or locations.';
    } else if (userMessage.toLowerCase().includes('interview')) {
      return 'Interview details will come from the database once Gemini is connected. Ask about a job ID!';
    } else {
      return 'I’m not sure about that yet, but I’ll get smarter with Gemini. Ask about jobs or interviews!';
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