# 🧠 Soy Aurelia – CRM Conversacional

Este repositorio contiene el código fuente del CRM conversacional de Soy Aurelia, pensado para brindar a nuestros clientes una plataforma ágil, personalizable y escalable para gestionar sus asistentes virtuales y conversaciones automatizadas.


## 📁 Estructura general del proyecto

La estructura está basada en el enfoque modular que propone Next.js App Router, con una clara separación entre contextos funcionales y lógica compartida.
``` estructura de carpetas
/
├── app/
│ ├── (web)/ # Sitio público de marketing
│ ├── (auth)/ # Autenticación y login
│ ├── (crm)/ # CRM privado del cliente
│ └── (dashboard)/ # Vista administrativa para gestionar clientes
│ └── [feature]/ # Cada feature tiene su subcarpeta
│ └── _components/ # Componentes visuales propios del feature
│
├── components/ # Componentes reutilizables globales (UI, layout, etc.)
├── domain/ # Entidades centrales del sistema (Cliente, Usuario, Asistente, etc.)
├── services/ # Conexiones a APIs
├── server/ # Lógica del lado del servidor
│ ├── auth/ # Módulos de autenticación (ej: middleware, sesiones)
│ ├── api/ # Endpoints TRPC
│ ├── actions/ # Server actions de Next.js
│ └── db.ts # Cliente de base de datos (Prisma)
│
├── lib/ # Funciones utilitarias y helpers
├── store/ # Estado global del frontend (ej: Zustand, Jotai)
├── hooks/ # Custom hooks (ej: useClient, useSession, etc.)
├── styles/ # Archivos CSS globales y tokens de diseño
├── trpc/ # Configuración de TRPC (routers, context, etc.)
└── README.md
```

## 🧱 Principios de arquitectura

- **Modularidad por contexto**: cada carpeta en `app/(...)` representa una unidad funcional independiente (sitio web, CRM, auth, dashboard).

- **Componentes locales por feature**: cada ruta contiene su propia carpeta `_components` para mantener el UI acotado al dominio que lo necesita.

- **Separación de responsabilidades**:
  - `domain/` define el **modelo y reglas del negocio** (sin conexión a librerías externas).
  - `services/` implementa la **conexión con datos y servicios externos**.
  - `server/` contiene lógica segura que **solo corre del lado del servidor**.
  
- **Código reutilizable en `components/`, `hooks/`, `lib/`, `store/`**, para evitar duplicación.

---