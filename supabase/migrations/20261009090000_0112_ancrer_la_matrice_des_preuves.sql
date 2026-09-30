-- =============================================================================
-- AIGMS — 0112 — La matrice des preuves s'ancre sur des exigences qui existent
-- =============================================================================
-- « Surveillance continue et dérive » est CRITIQUE pour un utilisateur métier :
-- c'est la première ligne de sa carte « Preuves attendues ». Elle n'était
-- rattachée à aucun contrôle, et le prospect qui cliquait « Déposer » ne savait
-- pas sur quoi.
--
-- La cause n'est pas dans le produit : elle est dans la matrice. DRIFT citait
-- ISO/IEC 42001 A.10.5 et A.10.6. Le chapitre A.10 de l'annexe A s'intitule
-- « Relations avec les tiers et les clients » et s'arrête à A.10.4. Ces deux
-- références N'EXISTENT PAS — ni dans la norme, ni dans notre table des
-- exigences. La jointure typologie -> exigence -> contrôle ne trouvait rien,
-- et se taisait.
--
-- L'ancre juste existait pourtant, et le contrôle qui la sert aussi :
--   A.6.2.6 « Exploitation et surveillance » — « le système en service est
--   surveillé selon une cadence définie, avec des seuils d'alerte […] LA DÉRIVE
--   DE PERFORMANCE… » — que sert AIGMS-MON-004 « Détection de la dérive ».
--
-- Cette migration ne change aucune structure. Elle corrige des données de
-- référence, typologie par typologie, en disant pourquoi. Un test tient
-- désormais la règle : toute référence ISO de la matrice doit exister dans
-- `requirement`, faute de quoi la prochaine référence inventée passerait
-- inaperçue comme celle-ci l'a fait pendant un mois.
--
-- Ce qui n'est PAS corrigé ici : les références à l'AI Act, que la matrice
-- écrit « Art. 14 » là où le référentiel de contrôles écrit « Art. 14 (contrôle
-- humain) ». Aucune ne joint, pour les huit typologies. C'est un défaut de
-- normalisation, pas d'ancrage : il se traite à part.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ce qu'on retire : des références fausses, ou qui parlent d'autre chose
-- -----------------------------------------------------------------------------
-- Chaque ligne dit ce que la référence désigne réellement dans l'annexe A, et
-- pourquoi elle ne convient pas à la typologie.
delete from public.evidence_typology_reference tr
using public.evidence_typology t
where tr.typology_id = t.id
  and tr.framework_code = 'ISO_IEC_42001'
  and (t.code, tr.reference) in (
    -- N'existent pas : A.10 s'arrête à A.10.4.
    ('DRIFT',  'A.10.5'),
    ('DRIFT',  'A.10.6'),
    -- A.10.2 « Répartition des responsabilités » et A.10.4 « Clients »
    -- traitent des relations contractuelles, non de l'explicabilité.
    ('XAI',    'A.10.2'),
    ('XAI',    'A.10.4'),
    -- A.7.3 « Acquisition des données » et A.7.4 « Qualité des données » ne
    -- disent rien du cloisonnement des calculs.
    ('ISOL',   'A.7.3'),
    ('ISOL',   'A.7.4'),
    -- A.8.4 « Communication des incidents » n'a aucun rapport avec la
    -- consommation énergétique.
    ('GREEN',  'A.8.4'),
    -- A.6.2.3 « Documentation de conception » documente des choix ; elle ne
    -- démontre pas qu'on a testé la résistance aux attaques.
    ('CYBER',  'A.6.2.3')
  );

-- -----------------------------------------------------------------------------
-- 2. Ce qu'on pose : l'exigence qui porte vraiment la typologie
-- -----------------------------------------------------------------------------
insert into public.evidence_typology_reference (typology_id, framework_code, framework_version, reference)
select t.id, 'ISO_IEC_42001', '2023', v.reference
from (values
  -- La dérive, nommément, et le journal qui trace les arbitrages humains.
  ('DRIFT', 'A.6.2.6'),   -- Exploitation et surveillance
  ('DRIFT', 'A.6.2.8'),   -- Journalisation des événements
  -- Ce qu'un tiers doit pouvoir comprendre, et ce que l'utilisateur doit savoir.
  ('XAI',   'A.6.2.7'),   -- Documentation technique
  ('XAI',   'A.8.2'),     -- Documentation du système et information des utilisateurs
  -- L'infrastructure de calcul, sa localisation, ses conditions d'exploitation.
  ('ISOL',  'A.4.5'),     -- Ressources système et de calcul
  ('GREEN', 'A.4.5'),     -- même exigence, autre lecture : l'énergie s'y mesure
  -- Les tests qui valident avant mise en service — y compris contradictoires.
  ('CYBER', 'A.6.2.4'),   -- Vérification et validation
  ('ALIGN', 'A.6.2.4'),   -- l'alignement se démontre par la validation
  -- L'équité se juge sur les personnes affectées, pas seulement sur les données.
  ('FAIR',  'A.5.4')      -- Impacts sur les personnes et les groupes
) as v(code, reference)
join public.evidence_typology t on t.code = v.code
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- 3. Garde-fou : une référence inventée ne s'installe pas en silence
-- -----------------------------------------------------------------------------
-- La contrainte ne peut pas être déclarative — `requirement` est chargée par
-- une autre migration, et un référentiel peut légitimement être cité avant
-- d'être chargé (le volet « Références que le référentiel ne porte pas » le dit
-- à l'écran). Mais sur l'ANNEXE A d'ISO/IEC 42001, qui EST chargée, une
-- référence absente est une faute de saisie, pas une lacune assumée.
--
-- La vérification se borne donc aux références en « A.x ». Le corps de la norme
-- — 6.1.2, 8.4, 9.3 — n'est délibérément pas chargé (migration 0022) : ALIGN
-- cite 6.1.2 en toute légitimité, et cette citation n'est pas une faute.
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
  'Les références à l''annexe A d''ISO/IEC 42001 que la matrice cite sans qu''elles existent. Doit rendre zéro ligne : une référence inventée y apparaît (0112).';

grant execute on function app.orphan_typology_references() to authenticated;

do $$
declare v_orphelines integer;
begin
  select count(*) into v_orphelines from app.orphan_typology_references();
  if v_orphelines > 0 then
    raise exception 'La matrice des preuves cite % référence(s) ISO qui n''existent pas.', v_orphelines
      using errcode = 'check_violation';
  end if;
end $$;
