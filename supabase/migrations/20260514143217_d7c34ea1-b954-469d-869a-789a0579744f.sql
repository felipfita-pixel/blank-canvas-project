DROP TRIGGER IF EXISTS guard_user_roles_writes_trigger ON public.user_roles;
CREATE TRIGGER guard_user_roles_writes_trigger
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.guard_user_roles_writes();