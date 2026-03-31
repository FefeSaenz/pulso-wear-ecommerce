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
- `pages/`: Vistas principales (Home, Productos, ProductDetail) que orquestan los componentes y gestionan la fusión inteligente de datos.
- `context/`: Gestión de estado global (Carrito, Órdenes y centralización de datos del Backend).
- `components/`: Componentes organizados por responsabilidad (Layout, UI, Cart).
- `utils/mappers.ts`: Implementación del Adapter Pattern para transformar y normalizar datos crudos de la API en modelos de datos consistentes para la UI.
- `hooks/`: Lógica de negocio reutilizable y encapsulada (Custom Hooks) para el manejo de filtros y estados complejos.
- `MobileMenu/ (Pattern)`: Componente de navegación de pantalla completa aislado del Header para optimizar el rendimiento y la mantenibilidad de la UI móvil.
- `UI/ (Atomics)`: Evolución del átomo NavLink para soportar comportamientos polimórficos (Desktop con submenús vs Mobile brutalista).

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
- [x] **Product Detail Page (PDP) & Slugs:** Construcción de la vista individual de producto (`/product/:slug`) con selección dinámica de variantes, validación de stock y fallbacks visuales de data.
- [x] **Accesibilidad & SEO en Cards (WIP):** Refactorización semántica en las tarjetas de producto (`ProductCard`), aislando la navegación (`<Link>`) de las acciones de modal para habilitar el clic derecho nativo.
- [x] **Búsqueda Global (Single Source of Truth):** Refactorización del motor de búsqueda (`SearchOverlay`) para utilizar la URL como fuente única de verdad, redirigiendo y parametrizando consultas transversalmente desde cualquier página hacia el catálogo.
- [x] **Programación Defensiva & Tipado:** Blindaje del componente `ProductGrid` mediante propiedades opcionales (`?`) y renderizado condicional estricto, previniendo errores de ejecución (*crashes*) en vistas sin filtros activos como la Home.
- [x] **Cross-Selling & UI Responsiva:** Desarrollo del componente `ProductCarousel` con `scroll-snap` nativo para mobile y controles personalizados en desktop. Integración en la PDP para sugerir artículos relacionados ("Lo más buscado").
- [x] **Enriquecimiento de Producto (PDP):** Ampliación del mapeo de datos de la API (`base_sku`, `brand`, `material`) e implementación de UI responsiva avanzada (galerías adaptables desktop/mobile y etiquetas de descuento dinámicas superpuestas).
- [x] **Inyección de Dependencias (OutletContext):** Conexión eficiente del estado global de UI (`QuickViewModal`) hacia componentes anidados sin *prop drilling*, utilizando el contexto de React Router para una experiencia SPA ininterrumpida.
- [x] **Mobile-First Navigation**: Reestructuración completa del Header para dispositivos móviles siguiendo estándares de apps nativas (Layout: Hamburguesa/Lupa - Logo Central - Carrito).
- [x] **Brutalism Design System**: Implementación de un `MobileMenu` con *estética brutalista*, utilizando tipografías masivas, tracking negativo y espaciado compacto para una identidad de marca disruptiva.
- [x] **UX & Motion**: Integración de transiciones físicas sincronizadas en los paneles laterales (`Drawers`), permitiendo animaciones de entrada/salida fluidas mediante `translate-x y estados de visibilidad`.
- [x] **Refactorización de Átomos (NavLink)**: Desacoplamiento de estilos fijos en `NavLink.tsx`, permitiendo que el componente sea 100% flexible y se adapte a diferentes contextos de tamaño y peso visual sin conflictos de clases.
- [x] **Navegación Robusta (Mobile)**: Blindaje del ciclo de navegación en el menú móvil, asegurando el cierre automático del panel y el bloqueo del scroll del body al interactuar con el logo o categorías.
- [x] **Arquitectura de Datos:** Refactorización profunda de las interfaces `Order` y `CartItem`. Se implementó herencia de tipos (`Omit<Product>`) y se agregó el campo `variant_sku` para garantizar una trazabilidad exacta del stock (talle/color) en el sistema de gestión.
- [x] **Estructuración de Órdenes para Backend:** Rediseño del objeto de compra para incluir desgloses financieros (`summary`), logística (`shipping`), y datos del cliente preparados para integración con JWT/OAuth, eliminando datos hardcodeados.
- [x] **Evolución del CheckoutModal:** Creación de un flujo de compra robusto en 3 pasos (Información > Pago > Confirmación) que construye dinámicamente el objeto de la orden basado en el input del usuario.
- [x] **Validación de Formularios UX/UI:** Reemplazo de las clásicas y molestas alertas de navegador por un sistema de validación visual e inmersiva (estados de error en inputs) que bloquea el avance si faltan campos obligatorios.
- [x] **Resolución de Reglas de Hooks:** Corrección de la jerarquía de renderizado en React, asegurando que los Hooks (`useState`) se ejecuten correctamente antes de cualquier retorno condicional en los modales.
- [x] **Arquitectura de Interfaz Responsiva (FilterBar):** Refactorización del componente `FilterBar` para aislar la navegación de categorías en Desktop y transformar la vista Mobile en una botonera de comandos rápidos dividida (Filtrar / Ordenar).
- [x] **Mobile-First UX (Catálogo):** Implementación de un panel lateral (`Drawer`) para los filtros en la versión móvil de la página `Products`. Esto despeja el viewport inicial, permitiendo que el usuario vea la ropa inmediatamente al entrar, mejorando drásticamente la retención.

## 🛠️ Próximos Pasos
- [ ] **Refactorización DRY (Don't Repeat Yourself):** Extracción de lógica repetida de mapeo de catálogos hacia un custom hook (`useUnifiedCatalog`) y creación de componentes atómicos para estados de carga/vacíos.
- [ ] **Persistencia del Carrito:** Integrar `localStorage` para que el usuario no pierda los productos seleccionados si recarga o cierra la pestaña accidentalmente.
- [ ] **Autenticación (Autenticación Google/JWT):** Implementar el login de usuarios para reemplazar el `GUEST_ID` temporal y vincular las órdenes directamente con las cuentas reales de los clientes.
- [ ] **Integración con Pasarela de Pagos:** Conectar el paso 2 del checkout con la API de Mercado Pago (o similar) para procesar transacciones reales.
- [ ] **Conexión con Panel de Gestión:** Enviar el objeto `Order` finalizado mediante una petición POST al backend que maneja el panel de control del depósito.