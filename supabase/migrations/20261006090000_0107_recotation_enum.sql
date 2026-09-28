-- =============================================================================
-- AIGMS — 0107 — Une acceptation caduque se dit
-- =============================================================================
-- L'ajout d'une valeur d'énumération vit dans sa propre migration : PostgreSQL
-- refuse de s'en servir dans la même transaction que sa création.
-- =============================================================================

alter type app.notification_kind add value if not exists 'risk_acceptance_void';
