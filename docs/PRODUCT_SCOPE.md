# Alcance funcional MVP — Dual Taskia CRM SaaS

## Objetivo

Crear un CRM SaaS multiempresa para que cada compañía gestione su proceso comercial desde lead hasta cliente, con tareas asociadas, pipeline visual y recordatorios diarios por WhatsApp.

## Incluye

- Login con Supabase Auth.
- Multiempresa por `tenant_id`.
- Roles: administrador, líder comercial y vendedor.
- CRUD inicial de leads.
- Conversión por estado: Lead → Prospecto → Cliente.
- Tareas por lead.
- Pipeline Kanban.
- Dashboard comercial.
- Reportes básicos.
- Recordatorio diario por WhatsApp a las 8:00 a.m.
- RLS para separación de datos por empresa y visibilidad por rol.

## No incluye en MVP

- IA.
- WhatsApp bidireccional.
- Integración con calendario.
- Adjuntos.
- Exportación avanzada a Excel.
- Integración con LinkedIn, Apollo o Metricool.
