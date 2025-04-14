import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-employer-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employer-chat.component.html',
  styleUrl: './employer-chat.component.css'
})
export class EmployerChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  chatForm: FormGroup<{
    message: FormControl<string | null>;
  }>;
  messages: ChatMessage[] = [
    {
      text: 'Hello! I’m your employer assistant. Ask about candidates or job postings, and I’ll help once Gemini is integrated!',
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

    // Add employer message
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
    // Example: const response = await gemini.query(userMessage, { db: 'candidates' });
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
    // Mock responses tailored for employers
    if (userMessage.toLowerCase().includes('candidate') || userMessage.toLowerCase().includes('developer')) {
      return 'I’ll soon search for candidates in the database! Try specifying skills like Python or experience level.';
    } else if (userMessage.toLowerCase().includes('job') || userMessage.toLowerCase().includes('posting')) {
      return 'I can help manage job postings once Gemini is connected. Ask about creating a new job!';
    } else {
      return 'I’m getting ready to assist with Gemini. Ask about candidates or job postings for now!';
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