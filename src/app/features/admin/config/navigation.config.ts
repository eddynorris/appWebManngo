import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faFileInvoiceDollar,
    faChartBar,
    faMoneyBillWave,
    faTruck,
    faCreditCard,
    faReceipt,
    faUsers,
    faWarehouse,
    faClipboardList,
    faExchangeAlt,
    faBox,
    faCogs,
    faUser,
    faBoxes
} from '@fortawesome/free-solid-svg-icons';

/**
 * Representa un item de submenú en la navegación
 */
export interface NavigationSubmenuItem {
    label: string;
    route: string;
    icon: IconDefinition;
    permissions?: string[];
    exactMatch?: boolean;
}

/**
 * Representa un item de navegación principal
 */
export interface NavigationItem {
    label: string;
    icon: IconDefinition;
    route?: string;
    hasSubmenu?: boolean;
    submenu?: NavigationSubmenuItem[];
    permissions?: string[];
}

/**
 * Configuración de navegación del panel administrativo
 * Organizada por categorías lógicas de funcionalidad
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        label: 'Dashboard',
        icon: faFileInvoiceDollar,
        hasSubmenu: true,
        submenu: [
            {
                label: 'Deuda de Clientes',
                route: '/admin/dashboard',
                icon: faChartBar
            },
            {
                label: 'Proyección de Ventas',
                route: '/admin/proyecciones',
                icon: faMoneyBillWave
            },
            {
                label: 'Reporte',
                route: '/admin/reporte-unificado',
                icon: faChartBar
            }
        ]
    },
    {
        label: 'Operaciones',
        icon: faFileInvoiceDollar,
        hasSubmenu: true,
        submenu: [
            {
                label: 'Ventas',
                route: '/admin/ventas',
                icon: faMoneyBillWave
            },
            {
                label: 'Pagos',
                route: '/admin/pagos',
                icon: faCreditCard,
                exactMatch: true
            },
            {
                label: 'Cuadrar Egresos',
                route: '/admin/pagos/cierre-caja',
                icon: faReceipt
            },
            {
                label: 'Depósitos',
                route: '/admin/pagos/depositos',
                icon: faMoneyBillWave
            },
            {
                label: 'Gastos',
                route: '/admin/gastos',
                icon: faReceipt
            }
        ]
    },
    {
        label: 'Clientes',
        icon: faUsers,
        hasSubmenu: true,
        submenu: [
            {
                label: 'Clientes',
                route: '/admin/clientes',
                icon: faUsers
            },
            {
                label: 'Proveedores',
                route: '/admin/proveedores',
                icon: faTruck
            }
        ]
    },
    {
        label: 'Inventario',
        icon: faWarehouse,
        hasSubmenu: true,
        submenu: [
            {
                label: 'Inventarios',
                route: '/admin/inventarios',
                icon: faClipboardList
            },
            {
                label: 'Transferencias',
                route: '/admin/inventarios/transferencias',
                icon: faExchangeAlt
            }
        ]
    },

    {
        label: 'Producción',
        icon: faCogs,
        hasSubmenu: true,
        submenu: [
            {
                label: 'Registro de Producción',
                route: '/admin/produccion/produccion',
                icon: faClipboardList
            },
            {
                label: 'Gestión de Recetas',
                route: '/admin/produccion/recetas',
                icon: faBox
            }
        ]
    },
    {
        label: 'Administración',
        icon: faCogs,
        hasSubmenu: true,
        submenu: [
            {
                label: 'Usuarios',
                route: '/admin/users',
                icon: faUser
            },
            {
                label: 'Productos',
                route: '/admin/products',
                icon: faBoxes
            },
            {
                label: 'Presentaciones',
                route: '/admin/presentaciones',
                icon: faBox
            },
            {
                label: 'Lotes',
                route: '/admin/lotes',
                icon: faBox
            }
        ]
    }
];
