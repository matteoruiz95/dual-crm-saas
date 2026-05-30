# Dual Taskia CRM SaaS

CRM SaaS multiempresa para gestionar leads, prospectos, clientes, tareas comerciales, pipeline Kanban, reportes y recordatorios diarios por WhatsApp.

## Stack

- Next.js App Router
- React + TypeScript
- Vercel
- Supabase PostgreSQL + Supabase Auth
- Row Level Security por `tenant_id`
- Vercel Cron Jobs para recordatorios diarios
- WhatsApp Cloud API para notificaciones

## Flujo comercial

```text
Lead → Prospecto → Cliente
```

Estados comerciales:

```text
Nuevo
Contactado
Reunión agendada
Propuesta enviada
Negociación
Ganado
Perdido
```

## Roles

```text
admin             = Administrador
commercial_lead   = Líder comercial
seller            = Vendedor
```

Reglas principales:

- Cada empresa es un `tenant`.
- Cada registro tiene `tenant_id`.
- Administrador y líder comercial ven todo lo de su empresa.
- Vendedor solo ve leads creados por él.
- La IA no está incluida en el MVP.
- Los recordatorios por WhatsApp se envían todos los días a las 8:00 a.m. Colombia.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre:

```text
http://localhost:3000
```

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. Copia `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
3. Copia `SUPABASE_SERVICE_ROLE_KEY` únicamente para uso servidor.
4. Ejecuta en Supabase SQL Editor:

```text
supabase/migrations/001_initial_schema.sql
```

5. Crea un usuario desde Supabase Auth.
6. Ejecuta el seed:

```text
supabase/seed/seed_dual.sql
```

Antes de ejecutar el seed, reemplaza:

```text
REPLACE_WITH_AUTH_USER_ID
```

por el UUID real del usuario creado en Supabase Auth.

## Deploy en Vercel

1. Sube este proyecto a GitHub.
2. Importa el repositorio desde Vercel.
3. Configura las variables de entorno.
4. Despliega.

## Cron diario

El archivo `vercel.json` ejecuta:

```text
/api/cron/daily-task-reminders
```

a las 13:00 UTC, equivalente a 8:00 a.m. Colombia.

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-task-reminders",
      "schedule": "0 13 * * *"
    }
  ]
}
```

## Pendientes recomendados después del MVP

- WhatsApp bidireccional.
- Formularios públicos para captura automática de leads.
- Integración con calendario.
- Adjuntos por lead.
- IA para resumen, próxima acción y redacción de correos.
- Exportación a Excel.
