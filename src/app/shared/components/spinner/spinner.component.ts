import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    @if (shouldShow()) {
      <div class="spinner-overlay" [class.global]="isGlobal()">
        <div class="spinner-container">
          <div class="spinner" [style.width.px]="size()" [style.height.px]="size()"></div>
          @if (message()) {
            <p class="spinner-message">{{ message() }}</p>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  private readonly loadingService = inject(LoadingService);

  // Inputs del componente
  size = input<number>(40);
  message = input<string>('');
  isGlobal = input<boolean>(true);
  forceShow = input<boolean>(false);

  // Lógica para mostrar el spinner
  shouldShow = () => {
    return this.forceShow() || this.loadingService.isLoading();
  };
}
