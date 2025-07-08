import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../shared/services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // URLs que no queremos que muestren el loading global
  const excludedUrls = [
    '/dashboard', // Dashboard se carga rápido y tiene su propio estado
    '/assets',    // Recursos estáticos
    '/ping',      // Health checks
  ];

  // Verificar si la URL está excluida
  const shouldShowLoading = !excludedUrls.some(url => req.url.includes(url));

  if (shouldShowLoading) {
    loadingService.startLoading();
  }

  return next(req).pipe(
    finalize(() => {
      if (shouldShowLoading) {
        loadingService.stopLoading();
      }
    })
  );
};
