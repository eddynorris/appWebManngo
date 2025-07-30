import { ChangeDetectionStrategy, Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faRobot, faUser, faClose, faMessage, faMinus } from '@fortawesome/free-solid-svg-icons';

import { ChatService } from '../../services/chat.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './floating-chat.component.html',
  styleUrl: './floating-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingChatComponent implements AfterViewChecked {
  private readonly fb = inject(FormBuilder);
  private readonly chatService = inject(ChatService);
  private readonly notificationService = inject(NotificationService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // FontAwesome icons
  faPaperPlane = faPaperPlane;
  faRobot = faRobot;
  faUser = faUser;
  faClose = faClose;
  faMessage = faMessage;
  faMinus = faMinus;

  chatForm: FormGroup;
  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  isOpen = signal(false);
  isMinimized = signal(false);
  hasUnreadMessages = signal(false);
  private shouldScrollToBottom = false;

  constructor() {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
    });

    // Mensaje de bienvenida inicial
    this.initializeChat();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  initializeChat(): void {
    this.messages.set([
      {
        id: 'welcome',
        text: '¡Hola! Soy tu asistente IA de Manngo J&K. Puedo ayudarte con información sobre clientes, productos, ventas y más. ¿En qué puedo ayudarte?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }

  toggleChat(): void {
    if (this.isOpen()) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat(): void {
    this.isOpen.set(true);
    this.isMinimized.set(false);
    this.hasUnreadMessages.set(false);
    this.shouldScrollToBottom = true;
  }

  closeChat(): void {
    this.isOpen.set(false);
    this.isMinimized.set(false);
  }

  minimizeChat(): void {
    this.isMinimized.set(true);
  }

  maximizeChat(): void {
    this.isMinimized.set(false);
    this.shouldScrollToBottom = true;
  }

  onSubmit(): void {
    if (this.chatForm.invalid || this.isLoading()) {
      return;
    }

    const messageText = this.chatForm.get('message')?.value?.trim();
    if (!messageText) {
      this.chatForm.get('message')?.setValue('');
      return;
    }

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.update(messages => [...messages, userMessage]);
    this.chatForm.get('message')?.setValue('');
    this.shouldScrollToBottom = true;
    this.isLoading.set(true);

    // Enviar mensaje al servicio
    this.chatService.sendMessage(messageText)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const botMessage: ChatMessage = {
            id: this.generateId(),
            text: response.answer,
            isUser: false,
            timestamp: new Date()
          };
          this.messages.update(messages => [...messages, botMessage]);
          this.shouldScrollToBottom = true;
          
          // Si el chat está minimizado, mostrar notificación de mensaje no leído
          if (this.isMinimized()) {
            this.hasUnreadMessages.set(true);
          }
        },
        error: (error) => {
          console.error('Error en chat:', error);
          const errorMessage: ChatMessage = {
            id: this.generateId(),
            text: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
            isUser: false,
            timestamp: new Date()
          };
          this.messages.update(messages => [...messages, errorMessage]);
          this.shouldScrollToBottom = true;
          this.notificationService.showError('Error al enviar mensaje');
        }
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  clearChat(): void {
    this.initializeChat();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}