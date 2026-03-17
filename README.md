# PULSO WEAR - Street Essentials Ecommerce

Ecommerce de indumentaria urbana con enfoque en diseño minimalista y alto rendimiento. Construido con una arquitectura de componentes atómicos y gestión de estado global para máxima escalabilidad.

## 🚀 Tecnologías
- **React 19** (TypeScript)
- **React Router 7** (Navegación SPA)
- **Context API** (State Management de Carrito y Configuración Global)
- **Tailwind CSS v4** (Styling)
- **Axios 1.13** (HTTP Client centralizado con interfaces de TypeScript)
- **Vite 6** (Build Tool)
- **Lucide / FontAwesome** (Icons)

## 🏗️ Arquitectura
El proyecto sigue una estructura modular y reactiva para facilitar su mantenimiento como plantilla base:
- `Layout/ (Pattern)`: Implementación de una estructura de contenedores globales que persiste la UI (Header, Footer, Modales) y gestiona el ciclo de vida de la navegación mediante Outlet.
- `types/`: Definición de interfaces para el contrato de la API (MenuItem, Banner, FrontConfig) y el modelo de dominio complejo (Variantes, Talles, Colores).
- `constants/`: Datos estáticos y configuraciones de negocio (MOCK_PRODUCTS, thresholds de envío).
- `api/`: Configuración de Axios para consumo de datos asíncronos.
- `styles/`: Sistema de diseño centralizado en globals.css (Tailwind v4 Layering).
- `pages/`: Vistas principales (Home, Productos) que orquestan los componentes y gestionan la fusión inteligente de datos.
- `context/`: Gestión de estado global (Carrito, Órdenes y centralización de datos del Backend).
- `components/`: Componentes organizados por responsabilidad (Layout, UI, Cart).
- `utils/mappers.ts`: Implementación del Adapter Pattern para transformar y normalizar datos crudos de la API en modelos de datos consistentes para la UI.
- `hooks/`: Lógica de negocio reutilizable y encapsulada (Custom Hooks) para el manejo de filtros y estados complejos.


## ✅ Logros y Avances
- [x] **Estado Global:** Migración exitosa a Context API para desacoplar la lógica del carrito de la UI.
- [x] **Conexión API:** Integración de Axios para consumo de datos dinámicos de backend.
- [x] **Refactorización Semántica:** Evolución de componentes (NavLink) para soportar navegación multinivel (Submenús) e iconos dinámicos.
- [x] **UX Improvements:** Sincronización reactiva de modales y flujos de usuario (QuickView & Cart). Pulido estético del Header con efectos de desenfoque y sombras integradas para una navegación fluida.
- [x] **Hero Dinámico (Carousel):** Implementación de un slider de alto impacto que consume el array de `banners` de la API.
- [x] **Experiencia de Usuario Pro:** Soporte nativo para navegación por teclado (flechas), gestos táctiles (*swipes*) en dispositivos móviles e indicadores lineales interactivos.
- [x] **Optimización de Renderizado:** Uso de `useCallback` y limpieza de efectos (`clearInterval`) para un rendimiento óptimo y sin fugas de memoria.
- [x] **Arquitectura v4:** Migración completa a Tailwind CSS v4 con integración nativa en Vite para compilación instantánea.
- [x] **Refactorización Senior:** Reorganización del árbol de archivos eliminando ruido en la raíz y centralizando la lógica en /src.
- [x] **Tipado Estricto:** Implementación de interfaces de TypeScript para todo el catálogo de productos y flujos de órdenes.
- [x] **Data Mapping & Resiliencia:** Implementación de un Mapper para estandarizar el contrato de la API y asegurar la integridad de la UI (solución de errores en QuickView).
- [x] **Arquitectura de Hooks:** Desacoplamiento de la lógica mediante el hook universal `useProductFilters`, permitiendo una UI 100% declarativa y reactiva.
- [x] **Full API Integration (Home):** Migración total de la Home de datos estáticos a consumo dinámico desde el backend.
- [x] **Navegación Robusta:** Implementación de React Router con configuración de `basename` para despliegues.
- [x] **Arquitectura de Layout Persistente:** Centralización de la UI global (Header, Footer, AnnouncementBar) permitiendo transiciones fluidas entre páginas sin pérdida de estado.
- [x] **Optimización de Branding:** Integración de activos locales con procesamiento de imagen optimizado (Logo y Banners de respaldo).
- [x] **Filtros por Facetas:** Implementación de filtrado multidimensional avanzado (Talle dependiente de Color, Categoría) sincronizado bidireccionalmente con URLSearchParams.
- [x] **Tienda Full (Products Page):** Construcción de la vista general de productos con arquitectura de Sidebar, grilla reactiva y estados vacíos amigables.
- [x] **Filtros por Facetas:** Implementación de filtrado multidimensional (Talle, Color, Categoría) sincronizado con URLSearchParams.
- [x] **Limpieza de Deuda Técnica (RIP Mocks):** Eliminación total de MOCK_PRODUCTS y hardcoding. El flujo de datos es ahora 100% dependiente de la API, manteniendo únicamente assets visuales locales como fallback estratégico.
- [x] **Menú Dinámico (Header):** Conexión de `NavLink.tsx` y el menú de navegación para renderizar las categorías directamente desde la API usando el componente `<Link>` de React Router.
- [x] **Router Dinámico & Categorías:** Desarrollo de rutas parametrizadas (`/category/:category` y `/offers`) en `App.tsx` con lectura mediante `useParams` para inyectar filtros automáticamente en la vista de Productos.
- [x] **Navegación SPA Fluida y UX:** Eliminación de recargas de página y aplicación del patrón global de "ScrollToTop" (`useLocation`) para reiniciar la posición del scroll en cada transición de ruta.

## 🛠️ Próximos Pasos
- [ ] Product Detail Page (PDP) & Slugs: Creación de la vista individual y detallada de producto basada en su Slug (`/product/:slug`).
- [ ] Persistencia & Checkout: Sincronización con localStorage, diseño del flujo de pago (Checkout) y validación final de órdenes.