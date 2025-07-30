import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faBoxes,
  faUsers,
  faMoneyBillWave,
  faCreditCard,
  faTruck,
  faReceipt,
  faClipboardList,
  faUser,
  faChartBar,
  faBox,
  faBars,
  faSignOutAlt,
  faChevronDown,
  faChevronRight,
  faSync,
  faExclamationTriangle,
  faCheckCircle,
  faEye,
  faStore,
  faTag,
  faCircle,
  faExclamationCircle,
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp as fabWhatsapp } from '@fortawesome/free-brands-svg-icons';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      // Orden importante: loading -> auth -> error
      loadingInterceptor,
      authInterceptor,
      errorInterceptor,
    ])),
    {
      provide: FaIconLibrary,
      useFactory: () => {
        const library = new FaIconLibrary();
        library.addIcons(
          faHome,
          faBoxes,
          faUsers,
          faMoneyBillWave,
          faCreditCard,
          faTruck,
          faReceipt,
          faClipboardList,
          faUser,
          faChartBar,
          faBox,
          faBars,
          faSignOutAlt,
          faChevronDown,
          faChevronRight,
          fabWhatsapp,
          faSync,
          faExclamationTriangle,
          faCheckCircle,
          faEye,
          faStore,
          faTag,
          faCircle,
          faExclamationCircle,
          faPlus,
          faSearch,
          faEdit,
          faTrash,
          faToggleOn,
          faToggleOff,
          faTimesCircle,
          fabWhatsapp
        );
        return library;
      },
      deps: []
    }
  ]
};
