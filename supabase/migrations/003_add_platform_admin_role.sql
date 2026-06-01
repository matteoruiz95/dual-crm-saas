-- =====================================================
-- ADD PLATFORM ADMIN ROLE
-- Ejecutar primero y separado de las demás migraciones
-- =====================================================

alter type app_role add value if not exists 'platform_admin';