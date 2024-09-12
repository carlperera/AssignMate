CREATE OR REPLACE FUNCTION validate_project_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new project name already exists for the same team
  IF EXISTS (
    SELECT 1 FROM project WHERE proj_name = NEW.proj_name AND team_id = NEW.team_id
  ) THEN
    RAISE EXCEPTION 'Project name "%s" already exists for team ID %s.', NEW.proj_name, NEW.team_id
      USING ERRCODE = 'unique_violation';
  END IF;

  -- Example: Check if the new project name is too short
  IF LENGTH(NEW.proj_name) < 2 THEN
    RAISE EXCEPTION 'Project name "%s" is too short. It must be at least 3 characters long.', NEW.proj_name
      USING ERRCODE = 'check_violation';
  END IF;

--   -- Example: Check if the project description is null (if it's required)
--   IF NEW.proj_desc IS NULL THEN
--     RAISE EXCEPTION 'Project description cannot be null.'
--       USING ERRCODE = 'not_null_violation';
--   END IF;

  -- Add more conditions as necessary

  -- If no errors, allow the update
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;