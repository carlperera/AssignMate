CREATE OR REPLACE FUNCTION create_team_and_add_user(
  p_team_name TEXT,
  p_user_id UUID,
  p_user_role TEXT
) RETURNS TABLE (team_id UUID) AS $$
DECLARE
  v_team_id UUID;
BEGIN
  -- Create the team
  INSERT INTO team (team_name)
  VALUES (p_team_name)
  RETURNING team_id INTO v_team_id;

  -- Add the user to the team
  INSERT INTO user_team (user_id, team_id, user_team_role)
  VALUES (p_user_id, v_team_id, p_user_role::user_team_role);

  RETURN QUERY SELECT v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;