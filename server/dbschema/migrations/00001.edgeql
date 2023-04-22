CREATE MIGRATION m1757nh65jzxqqa3dqabpkcazdybqb5zuzuwpu2nhfcxjmk27wnzwq
    ONTO initial
{
  CREATE FUTURE nonrecursive_access_policies;
  CREATE TYPE default::User {
      CREATE PROPERTY googleId -> std::str;
      CREATE REQUIRED PROPERTY username -> std::str;
  };
};
