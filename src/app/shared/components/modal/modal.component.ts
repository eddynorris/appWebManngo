import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  signal,
  effect,
  Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() open: Signal<boolean> = signal(false);
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showCloseButton = true;
  @Input() closeOnOverlayClick = true;
  @Input() closeOnEscape = true;
  @Input() showHeader = true;
  @Input() showFooter = false;

  @Output() close = new EventEmitter<void>();
  @Output() afterOpen = new EventEmitter<void>();
  @Output() afterClose = new EventEmitter<void>();

  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;
  @ViewChild('closeButton', { static: false }) closeButton!: ElementRef;

  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor() {
    // Effect para manejar cambios en el estado open
    effect(() => {
      if (this.open()) {
        this.handleOpen();
      } else {
        this.handleClose();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.open()) {
      this.setupFocusTrap();
      this.focusFirstElement();
    }
  }

  ngOnDestroy(): void {
    this.restoreFocus();
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.open()) return;

    if (event.key === 'Escape' && this.closeOnEscape) {
      this.closeModal();
    }

    if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  private handleOpen(): void {
    // Guardar elemento activo antes de abrir el modal
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    // Setup focus trap después de que el DOM se actualice
    setTimeout(() => {
      this.setupFocusTrap();
      this.focusFirstElement();
      this.afterOpen.emit();
    });
  }

  private handleClose(): void {
    document.body.style.overflow = '';
    this.restoreFocus();
    this.afterClose.emit();
  }

  private setupFocusTrap(): void {
    if (!this.modalContent) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];

    this.focusableElements = Array.from(
      this.modalContent.nativeElement.querySelectorAll(focusableSelectors.join(','))
    ) as HTMLElement[];
  }

  private focusFirstElement(): void {
    if (this.closeButton && this.showCloseButton) {
      this.closeButton.nativeElement.focus();
    } else if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  private restoreFocus(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.closeModal();
    }
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  closeModal(): void {
    this.close.emit();
  }

  getSizeClass(): string {
    const sizeMap = {
      sm: 'modal-sm',
      md: 'modal-md',
      lg: 'modal-lg',
      xl: 'modal-xl'
    };
    return sizeMap[this.size];
  }
}
