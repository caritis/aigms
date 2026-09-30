-- =============================================================================
-- AIGMS — 0115 — Les articles de l'AI Act se rejoignent enfin
-- =============================================================================
-- Aucun contrôle n'a jamais été rattaché à un article du règlement. Soixante-dix
-- correspondances existent pourtant dans le catalogue, et deux articles sont
-- chargés comme exigences — Art. 14 (contrôle humain) et Art. 50 (transparence).
-- Elles ne se rencontraient pas, pour deux raisons tenaces :
--
--   1. Le catalogue nomme le référentiel « AI_ACT », la table des exigences
--      « EU_AI_ACT ». Deux noms pour un règlement.
--   2. Le catalogue écrit « Art. 14 (contrôle humain) », « Art. 14 §4 d)
--      (passer outre, inverser) », « Art. 15 (exactitude, robustesse) ». La
--      table des exigences écrit « Art. 14 ». L'instanciation comparait les
--      deux chaînes à l'identique : elles ne l'étaient jamais.
--
-- Le libellé long n'est pas un défaut : il dit à quel titre le contrôle répond
-- à l'article, et c'est une information qu'un auditeur lit. On ne le réécrit
-- donc pas. On NORMALISE AU MOMENT DE LA JOINTURE : le nom du référentiel, et
-- l'article — le premier cité, celui que la correspondance désigne.
--
-- Conséquence directe pour la Déclaration d'Applicabilité : « Contrôle humain »
-- et « Obligations de transparence » cessent d'être non couvertes alors que
-- neuf contrôles les servent.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Un règlement, un nom
-- -----------------------------------------------------------------------------
create or replace function app.normalize_framework_code(p_code text)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select case upper(btrim(coalesce(p_code, '')))
    when 'AI_ACT'    then 'EU_AI_ACT'
    when 'EU AI ACT' then 'EU_AI_ACT'
    when 'AIACT'     then 'EU_AI_ACT'
    when 'RGPD'      then 'GDPR'
    else upper(btrim(coalesce(p_code, '')))
  end;
$$;

comment on function app.normalize_framework_code is
  'Le nom sous lequel un référentiel est chargé. Le catalogue dit « AI_ACT », la table des exigences « EU_AI_ACT » : c''est le même règlement (0115).';

-- -----------------------------------------------------------------------------
-- 2. Un article, sa référence courte
-- -----------------------------------------------------------------------------
-- « Art. 14 §4 d) (passer outre, inverser) » désigne l'article 14. Le reste
-- précise à quel titre, et cette précision reste écrite dans le catalogue : on
-- ne la perd pas, on ne s'en sert pas pour joindre.
--
-- Les annexes d'ISO/IEC 42001 sont déjà écrites à l'identique des deux côtés
-- (« A.6.2.6 ») : elles traversent sans être touchées.
create or replace function app.normalize_requirement_reference(p_framework text, p_reference text)
returns text
language plpgsql
immutable
set search_path = app, pg_catalog
as $$
declare
  v_ref text := btrim(coalesce(p_reference, ''));
  v_num text;
begin
  if app.normalize_framework_code(p_framework) <> 'EU_AI_ACT' then
    return v_ref;
  end if;
  -- Le PREMIER article cité : c'est celui que la correspondance désigne.
  v_num := substring(v_ref from '^\s*[Aa]rt\.?\s*([0-9]+)');
  if v_num is null then
    return v_ref;
  end if;
  return 'Art. ' || v_num;
end;
$$;

comment on function app.normalize_requirement_reference is
  'La référence courte d''un article, pour joindre le catalogue à la table des exigences. Le libellé long du catalogue dit à quel titre le contrôle répond : il est conservé, il ne sert pas à joindre (0115).';

-- -----------------------------------------------------------------------------
-- 3. L'instanciation joint sur la référence normalisée
-- -----------------------------------------------------------------------------
-- La fonction est reprise TELLE QUELLE de 0042 — contrôle des rôles compris —
-- et deux lignes seulement y changent : celles qui joignent. Une signature
-- réécrite de mémoire aurait créé une SURCHARGE, et Postgres aurait refusé
-- d'appeler l'une ou l'autre : « function is not unique ».
create or replace function app.instantiate_catalog_control(
  p_organization_id     uuid,
  p_catalog_control_id  uuid,
  p_code                text default null,
  p_owner_user_id       uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare
  v_org      public.organization;
  v_cc       public.catalog_control;
  v_version  public.catalog_version;
  v_code     text;
  v_control  uuid;
  v_mapped   integer := 0;
  v_unmapped text[] := '{}';
  m          jsonb;
  v_req      uuid;
begin
  select * into v_org from public.organization where id = p_organization_id;
  if v_org.id is null then
    raise exception 'Organisation introuvable' using errcode = 'no_data_found';
  end if;
  if not app.has_organization_role(p_organization_id, app.roles_write_governance()) then
    raise exception 'Instancier un contrôle relève des rôles de gouvernance.' using errcode = 'insufficient_privilege';
  end if;

  select * into v_cc from public.catalog_control where id = p_catalog_control_id;
  if v_cc.id is null then
    raise exception 'Contrôle-type introuvable' using errcode = 'no_data_found';
  end if;
  select * into v_version from public.catalog_version where id = v_cc.version_id;
  if not app.catalog_visible(v_version.framework_id) then
    raise exception 'Ce référentiel n''est pas visible de votre tenant.' using errcode = 'insufficient_privilege';
  end if;
  if v_version.status <> 'published' then
    raise exception 'Seule une version publiée s''instancie (statut : %).', v_version.status using errcode = 'check_violation';
  end if;

  -- Un contrôle-type ne s'instancie qu'une fois par organisation : deux
  -- instances du même modèle se contrediraient dans la couverture.
  if exists (select 1 from public.control c
              where c.organization_id = p_organization_id and c.catalog_control_id = p_catalog_control_id) then
    raise exception 'Le contrôle-type % est déjà instancié chez cette organisation.', v_cc.control_code
      using errcode = 'unique_violation';
  end if;

  v_code := coalesce(nullif(btrim(p_code), ''), v_cc.control_code);

  insert into public.control (
    tenant_id, organization_id, code, name, objective, owner_user_id,
    status, is_mandatory, frequency, catalog_control_id
  ) values (
    v_org.tenant_id, p_organization_id, v_code, v_cc.title, v_cc.objective, p_owner_user_id,
    'proposed',
    coalesce(v_cc.applicability ->> 'default', '') = 'mandatory',
    v_cc.review_frequency,
    v_cc.id
  )
  returning id into v_control;

  -- Les correspondances vers des exigences chargées dans AIGMS deviennent des
  -- rattachements. Celles vers un référentiel absent sont nommées, pas perdues.
  for m in select * from jsonb_array_elements(coalesce(v_cc.framework_mappings, '[]'::jsonb)) loop
    select r.id into v_req
    from public.requirement r
    join public.framework f on f.id = r.framework_id
    where f.code = app.normalize_framework_code(m ->> 'framework')
      and (m ->> 'version' is null or f.version = m ->> 'version')
      and r.requirement_reference
          = app.normalize_requirement_reference(m ->> 'framework', m ->> 'reference');
    if v_req is not null then
      insert into public.control_requirement_map (tenant_id, control_id, requirement_id, coverage_note)
      values (v_org.tenant_id, v_control, v_req,
              format('Correspondance du référentiel %s — %s', v_cc.control_code, m ->> 'reference'))
      on conflict do nothing;
      v_mapped := v_mapped + 1;
    else
      v_unmapped := v_unmapped || format('%s %s', m ->> 'framework', m ->> 'reference');
    end if;
    v_req := null;
  end loop;

  return jsonb_build_object(
    'control_id', v_control,
    'code', v_code,
    'mapped_requirements', v_mapped,
    'unmapped_references', to_jsonb(v_unmapped)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. Les contrôles déjà retenus rattrapent ce qui leur manquait
-- -----------------------------------------------------------------------------
-- Sans cela, la correction ne vaudrait que pour les contrôles retenus APRÈS
-- elle : une organisation déjà installée resterait devant une Déclaration qui
-- annonce « non couverte » ce que ses contrôles servent depuis des semaines.
insert into public.control_requirement_map (tenant_id, control_id, requirement_id, coverage_note)
select distinct c.tenant_id, c.id, r.id,
       format('Correspondance du référentiel %s — %s (rattrapage 0115)', cc.control_code, m ->> 'reference')
from public.control c
join public.catalog_control cc on cc.id = c.catalog_control_id
cross join lateral jsonb_array_elements(coalesce(cc.framework_mappings, '[]'::jsonb)) m
join public.framework f on f.code = app.normalize_framework_code(m ->> 'framework')
join public.requirement r
  on r.framework_id = f.id
 and r.requirement_reference = app.normalize_requirement_reference(m ->> 'framework', m ->> 'reference')
where not exists (
  select 1 from public.control_requirement_map x
  where x.control_id = c.id and x.requirement_id = r.id
)
on conflict do nothing;
