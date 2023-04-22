CREATE MIGRATION m1ilshbguq5x4onaiey356rjl62vbfioslppi63pjqgkmfxhkehg2a
    ONTO m1757nh65jzxqqa3dqabpkcazdybqb5zuzuwpu2nhfcxjmk27wnzwq
{
  CREATE TYPE default::AuthToken {
      CREATE REQUIRED LINK user -> default::User;
      CREATE REQUIRED PROPERTY token -> std::str;
  };
  ALTER TYPE default::User {
      ALTER PROPERTY username {
          RENAME TO nickname;
      };
  };
};
