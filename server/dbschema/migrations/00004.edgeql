CREATE MIGRATION m1hrfou6yyxcsyasjj3q7hfya2fvychbirt7zgf6l4kg4w2ihrr7ha
    ONTO m1gxbbmjlzekdo57zoepr23mbayhzubxe5xlrjqigrn7pfuiemaina
{
  CREATE TYPE default::Cell {
      CREATE REQUIRED PROPERTY capital -> std::bool;
      CREATE REQUIRED PROPERTY owner -> std::int16;
      CREATE REQUIRED PROPERTY q -> std::int16;
      CREATE REQUIRED PROPERTY r -> std::int16;
      CREATE REQUIRED PROPERTY value -> std::str;
  };
  CREATE TYPE default::MoveCoord {
      CREATE REQUIRED PROPERTY index -> std::int16;
      CREATE REQUIRED PROPERTY q -> std::int16;
      CREATE REQUIRED PROPERTY r -> std::int16;
  };
  CREATE TYPE default::`Move` {
      CREATE REQUIRED MULTI LINK cells -> default::Cell;
      CREATE REQUIRED MULTI LINK coords -> default::MoveCoord;
      CREATE REQUIRED LINK user -> default::User;
      CREATE REQUIRED PROPERTY date -> std::datetime {
          SET default := (SELECT
              std::datetime_current()
          );
      };
      CREATE REQUIRED PROPERTY forfeit -> std::bool;
      CREATE REQUIRED PROPERTY move_number -> std::int32;
      CREATE REQUIRED PROPERTY pass -> std::bool;
      CREATE REQUIRED PROPERTY shuffle -> std::bool;
      CREATE PROPERTY word -> std::str;
  };
  CREATE TYPE default::Game {
      CREATE MULTI LINK cells -> default::Cell;
      CREATE MULTI LINK moves -> default::`Move`;
      CREATE MULTI LINK users -> default::User;
      CREATE PROPERTY created_date -> std::datetime {
          SET default := (SELECT
              std::datetime_current()
          );
      };
      CREATE PROPERTY deleted -> std::bool;
      CREATE PROPERTY difficulty -> std::int16;
      CREATE PROPERTY game_over -> std::bool;
      CREATE PROPERTY turn -> std::int32;
      CREATE PROPERTY vs_ai -> std::bool;
      CREATE PROPERTY winner -> std::int16;
  };
};
