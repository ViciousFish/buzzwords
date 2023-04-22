CREATE MIGRATION m1kzpewbssxy22c7u6fzgnbpwqmexcywknpuqhjndkgi3cbxcmkzua
    ONTO m1hrfou6yyxcsyasjj3q7hfya2fvychbirt7zgf6l4kg4w2ihrr7ha
{
  ALTER TYPE default::User {
      CREATE MULTI LINK games := (default::User.<users[IS default::Game]);
  };
};
