# Aurelia Platform

## Reglas de Desarrollo

### Seguridad en SaaS
- **NUNCA exponer información técnica o IDs en entornos SaaS**
- No mostrar IDs de templates, agentes, clientes, o cualquier identificador interno
- No mostrar información de base de datos como timestamps, UUIDs, o metadatos técnicos
- Solo mostrar información que el usuario final necesita ver
- En SaaS, el usuario solo debe ver su configuración personalizada, no detalles técnicos

### Estructura de Archivos
- Usar TypeScript para todo el código
- Componentes en `src/components/`
- Páginas en `src/app/`
- API routes en `src/app/api/`
- Utilidades en `src/lib/`
- Tipos en `src/domain/`

### Convenciones de Nomenclatura
- Componentes: PascalCase (`UserProfile.tsx`)
- Archivos: kebab-case (`user-profile.tsx`)
- Variables: camelCase (`userName`)
- Constantes: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Estilo de Código
- Usar Prettier para formateo
- ESLint para linting
- Preferir funciones sobre clases
- Usar hooks de React cuando sea posible
- Documentar funciones complejas

### Base de Datos
- Usar Prisma como ORM
- Migraciones en `prisma/migrations/`
- Schema en `prisma/schema.prisma`
- Siempre validar datos de entrada

### API
- Usar tRPC para type-safe APIs
- Validar inputs con Zod
- Manejar errores apropiadamente
- Documentar endpoints complejos

### UI/UX
- Usar Tailwind CSS para estilos
- Componentes de UI en `src/components/ui/`
- Responsive design por defecto
- Accesibilidad (ARIA labels, etc.)

### Testing
- Tests unitarios para utilidades
- Tests de integración para APIs
- Tests E2E para flujos críticos

### Performance
- Lazy loading para componentes pesados
- Optimizar imágenes
- Minimizar bundle size
- Usar React.memo cuando sea apropiado

### Seguridad
- Validar todos los inputs
- Sanitizar datos de salida
- Usar HTTPS en producción
- Implementar rate limiting
- **NUNCA exponer información técnica en SaaS**