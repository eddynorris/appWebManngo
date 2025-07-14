import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-our-story-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './our-story-modal.component.html',
  styleUrl: './our-story-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurStoryModalComponent {
  visible = input.required<boolean>();
  close = output<void>();

  handleClose(): void {
    this.close.emit();
  }
}