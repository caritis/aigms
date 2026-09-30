-- =============================================================================
-- AIGMS — 0113 — Le garde-fou de la matrice ne vise que l'annexe A
-- =============================================================================
-- La migration 0112 vérifiait TOUTE référence à ISO/IEC 42001. Or le corps de
-- la norme — 6.1.2, 8.4, 9.3 — n'est délibérément pas chargé : la migration
-- 0022 ne porte que l'annexe A, et le dit. La typologie « Alignement, garde-fous
-- et validation du modèle » cite la clause 6.1.2 en toute légitimité ; cette
-- citation n'est pas une faute de saisie, c'est une lacune assumée, et le volet
-- « Références que le référentiel chargé ne porte pas » l'annonce à l'écran.
--
-- Le garde-fou se borne donc aux références en « A.x », celles dont l'absence
-- ne peut signifier qu'une invention — comme A.10.5 et A.10.6, qui ont valu à
-- « Surveillance continue et dérive » de n'être rattachée à rien.
--
-- 0112 étant déjà appliquée sur la base distante, cette migration y porte la
-- correction. Sur une base neuve, elle repasse sans effet.
-- =============================================================================

create or replace function app.orphan_typology_references()
returns table (typology_code text, framework_code text, reference text)
language sql
stable
security definer
set search_path = app, public, pg_catalog
as $$
  select t.code, tr.framework_code, tr.reference
  from public.evidence_typology_reference tr
  join public.evidence_typology t on t.id = tr.typology_id
  where tr.framework_code = 'ISO_IEC_42001'
    and tr.reference like 'A.%'
    and not exists (
      select 1
      from public.requirement r
      join public.framework f on f.id = r.framework_id
      where f.code = tr.framework_code
        and f.version = tr.framework_version
        and r.requirement_reference = tr.reference
    )
  order by t.code, tr.reference;
$$;

comment on function app.orphan_typology_references is
  'Les références à l''annexe A d''ISO/IEC 42001 que la matrice des preuves cite sans qu''elles existent. Doit rendre zéro ligne : une référence inventée y apparaît (0112, 0113).';

grant execute on function app.orphan_typology_references() to authenticated;
