-- Permiso para que los admins puedan eliminar registros desde /admin/registrados.
-- Corre esto en Supabase: SQL Editor > New query.

-- 1) Mira las políticas que ya existen (para copiar la condición de admin de la de lectura).
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('registros', 'asistencias')
order by tablename, cmd;

-- 2) Política para borrar registros.
--    Usa la MISMA condición que tu política de lectura (SELECT) de admins en "registros".
--    Elige UNA de las variantes y reemplaza la condición si hace falta.

drop policy if exists "Admins pueden borrar registros" on public.registros;

-- Variante A: tabla de admins (ajusta el nombre de la tabla y la columna).
create policy "Admins pueden borrar registros"
  on public.registros
  for delete
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Variante B: solo si en tu proyecto TODOS los usuarios con sesión son admins
-- (con el registro de usuarios desactivado en Authentication). Si no, NO uses esta.
-- create policy "Admins pueden borrar registros"
--   on public.registros
--   for delete
--   to authenticated
--   using (true);

-- 3) Recomendado: que al borrar un registro se borren solas sus asistencias.
--    (Si no lo haces, el panel igual las borra primero, pero esto lo deja más limpio.)
do $$
declare c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.asistencias'::regclass
    and confrelid = 'public.registros'::regclass
    and contype = 'f';
  if c is not null then
    execute format('alter table public.asistencias drop constraint %I', c);
  end if;
  alter table public.asistencias
    add constraint asistencias_registro_id_fkey
    foreign key (registro_id) references public.registros (id) on delete cascade;
end $$;
