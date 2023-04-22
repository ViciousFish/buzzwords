CREATE MIGRATION m1gxbbmjlzekdo57zoepr23mbayhzubxe5xlrjqigrn7pfuiemaina
    ONTO m1ilshbguq5x4onaiey356rjl62vbfioslppi63pjqgkmfxhkehg2a
{
  ALTER TYPE default::User {
      CREATE MULTI LINK authTokens := (default::User.<user[IS default::AuthToken]);
  };
};
