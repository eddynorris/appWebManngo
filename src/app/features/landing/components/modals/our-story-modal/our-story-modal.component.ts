import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSeedling, faBullseye, faEye, faStar, faTrophy, faHandshake, faLightbulb, faLeaf, faRocket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-our-story-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, FontAwesomeModule],
  templateUrl: './our-story-modal.component.html',
  styleUrl: './our-story-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurStoryModalComponent {
  visible = input.required<boolean>();
  close = output<void>();

  // FontAwesome icons
  faSeedling = faSeedling;
  faBullseye = faBullseye;
  faEye = faEye;
  faStar = faStar;
  faTrophy = faTrophy;
  faHandshake = faHandshake;
  faLightbulb = faLightbulb;
  faLeaf = faLeaf;
  faRocket = faRocket;

  handleClose(): void {
    this.close.emit();
  }
}