-- =============================================================================
-- AIGMS — 0111 — La typologie d'outillage s'entretient sans migration
-- =============================================================================
-- Les 67 familles sont arrivées par migration, depuis un classeur. Ajouter une
-- famille — et il en manquera toujours une — supposait donc d'écrire du SQL et
-- de déployer. Ce n'est pas tenable pour un référentiel qui suit l'état de
-- l'art : le marquage des contenus n'existait pas dans le classeur de départ,
-- et la prochaine famille manquante n'y sera pas davantage.
--
-- Les lignes de l'ÉDITEUR (`tenant_id is null`) ne sont écrites par aucune
-- politique RLS — c'est voulu : une organisation ne modifie pas le référentiel
-- qu'elle reçoit. L'import passe donc par une fonction en SECURITY DEFINER,
-- réservée à l'administrateur de plateforme, qui est le seul à répondre du
-- contenu livré.
--
-- Elle AJOUTE et MET À JOUR, elle ne supprime jamais : une famille retirée du
-- fichier resterait, parce qu'un produit peut y être déclaré et un contrôle
-- s'y rattacher. Retirer se fait à la main, en connaissance de cause.
-- =============================================================================

create or replace function app.import_catalog_tools(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = app, public, pg_catalog
as $$
declare
  v_ajoutees integer := 0;
  v_majs     integer := 0;
  v_liens    integer := 0;
  v_row      jsonb;
  v_code     text;
  v_existe   boolean;
  v_id       uuid;
begin
  if not exists (
    select 1 from public.user_profile p
     where p.id = app.current_user_id() and p.is_platform_admin
  ) then
    raise exception 'Le référentiel d’outillage est entretenu par l’administrateur de la plateforme.'
      using errcode = 'insufficient_privilege';
  end if;

  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Import invalide : un tableau de familles est attendu.' using errcode = 'check_violation';
  end if;

  for v_row in select * from jsonb_array_elements(p_rows) loop
    v_code := btrim(v_row ->> 'code');
    if v_code is null or v_code = '' then
      raise exception 'Une ligne sans code : chaque famille se désigne par son code.' using errcode = 'check_violation';
    end if;
    if btrim(coalesce(v_row ->> 'tool_service', '')) = '' then
      raise exception 'La famille % n’a pas de nom (colonne tool_service).', v_code using errcode = 'check_violation';
    end if;
    if coalesce(v_row ->> 'scope', 'it_support') not in ('ai_core', 'it_support') then
      raise exception 'La famille % porte un rang inconnu : %. Attendu « ai_core » ou « it_support ».',
        v_code, v_row ->> 'scope' using errcode = 'check_violation';
    end if;

    select id into v_id from public.catalog_tool where tenant_id is null and code = v_code;
    v_existe := v_id is not null;

    if v_existe then
      update public.catalog_tool set
        scope             = coalesce(v_row ->> 'scope', scope),
        phase             = coalesce(nullif(v_row ->> 'phase', '')::app.aigms_phase, phase),
        domain            = coalesce(nullif(v_row ->> 'domain', ''), domain),
        acronym           = coalesce(nullif(v_row ->> 'acronym', ''), acronym),
        tool_service      = v_row ->> 'tool_service',
        definition        = coalesce(nullif(v_row ->> 'definition', ''), definition),
        tool_examples     = coalesce(v_row -> 'tool_examples', tool_examples),
        controlled_object = coalesce(nullif(v_row ->> 'controlled_object', ''), controlled_object),
        control_question  = coalesce(nullif(v_row ->> 'control_question', ''), control_question),
        expected_evidence = coalesce(v_row -> 'expected_evidence', expected_evidence),
        nature            = coalesce(nullif(v_row ->> 'nature', ''), nature),
        automation        = coalesce(nullif(v_row ->> 'automation', ''), automation),
        frequency         = coalesce(nullif(v_row ->> 'frequency', ''), frequency),
        owner_role        = coalesce(nullif(v_row ->> 'owner_role', ''), owner_role),
        risk_addressed    = coalesce(nullif(v_row ->> 'risk_addressed', ''), risk_addressed),
        iso42001_refs     = coalesce(v_row -> 'iso42001_refs', iso42001_refs),
        iso27001_refs     = coalesce(v_row -> 'iso27001_refs', iso27001_refs),
        other_frameworks  = coalesce(v_row -> 'other_frameworks', other_frameworks),
        priority          = coalesce(nullif(v_row ->> 'priority', ''), priority),
        applicability     = coalesce(nullif(v_row ->> 'applicability', ''), applicability),
        updated_at        = now()
      where id = v_id;
      v_majs := v_majs + 1;
    else
      insert into public.catalog_tool (
        tenant_id, code, scope, phase, domain, acronym, tool_service, definition, tool_examples,
        controlled_object, control_question, expected_evidence, nature, automation, frequency,
        owner_role, risk_addressed, iso42001_refs, iso27001_refs, other_frameworks, priority,
        applicability
      ) values (
        null, v_code, coalesce(v_row ->> 'scope', 'it_support'),
        nullif(v_row ->> 'phase', '')::app.aigms_phase,
        nullif(v_row ->> 'domain', ''), nullif(v_row ->> 'acronym', ''), v_row ->> 'tool_service',
        nullif(v_row ->> 'definition', ''), coalesce(v_row -> 'tool_examples', '[]'::jsonb),
        nullif(v_row ->> 'controlled_object', ''), nullif(v_row ->> 'control_question', ''),
        coalesce(v_row -> 'expected_evidence', '[]'::jsonb),
        nullif(v_row ->> 'nature', ''), nullif(v_row ->> 'automation', ''),
        nullif(v_row ->> 'frequency', ''), nullif(v_row ->> 'owner_role', ''),
        nullif(v_row ->> 'risk_addressed', ''),
        coalesce(v_row -> 'iso42001_refs', '[]'::jsonb), coalesce(v_row -> 'iso27001_refs', '[]'::jsonb),
        coalesce(v_row -> 'other_frameworks', '[]'::jsonb),
        nullif(v_row ->> 'priority', ''), nullif(v_row ->> 'applicability', '')
      ) returning id into v_id;
      v_ajoutees := v_ajoutees + 1;
    end if;

    -- Les rattachements aux contrôles-types, par CODE : ils survivent aux
    -- versions du référentiel. Le fichier fait foi pour cette famille — ce
    -- qu'il ne nomme plus est délié, sinon un lien retiré ne partirait jamais.
    if v_row ? 'control_codes' then
      delete from public.catalog_tool_control where tool_id = v_id;
      insert into public.catalog_tool_control (tool_id, framework_code, control_code)
      select v_id, 'AIGMS-CF', btrim(c)
        from jsonb_array_elements_text(v_row -> 'control_codes') c
       where btrim(c) <> ''
      on conflict do nothing;
      v_liens := v_liens + (select count(*) from public.catalog_tool_control where tool_id = v_id);
    end if;
  end loop;

  return jsonb_build_object('ajoutees', v_ajoutees, 'mises_a_jour', v_majs, 'rattachements', v_liens);
end;
$$;

comment on function app.import_catalog_tools is
  'Ajoute et met à jour la typologie d''outillage de l''éditeur depuis un fichier. Réservée à l''administrateur de plateforme ; ne supprime aucune famille (0111).';

create or replace function public.import_catalog_tools(p_rows jsonb)
returns jsonb language sql security definer
set search_path = app, public, pg_catalog
as $$ select app.import_catalog_tools(p_rows); $$;

grant execute on function public.import_catalog_tools(jsonb) to authenticated;
