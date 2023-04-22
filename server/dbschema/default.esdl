module default {
  type `Move` {
    required property move_number -> int32;
    required property shuffle -> bool;
    required property pass -> bool;
    required property forfeit -> bool;
    required property date -> datetime {
      default := (SELECT datetime_current());
    };
    required link user -> User;
    required multi link cells -> Cell;
    required multi link coords -> MoveCoord;
    property word -> str;
  }

  # user's selection in a move
  type MoveCoord {
    required property q -> int16;
    required property r -> int16;
    required property index -> int16;
  }
  type Cell {
    required property q -> int16;
    required property r -> int16;
    required property value -> str;
    required property capital -> bool;
    required property owner -> int16;
  }
  type Game {
    property turn -> int32;
    property game_over -> bool;
    property deleted -> bool;
    property winner -> int16;
    property vs_ai -> bool;
    property difficulty -> int16;
    multi link users -> User;
    property created_date -> datetime {
      default := (SELECT datetime_current());
    };
    multi link cells -> Cell;
    multi link moves -> `Move`;
  }

  type AuthToken {
    required property token -> str;
    required link user -> User;
  }

  type User {
    required property nickname -> str;
    property googleId -> str;
    multi link authTokens := User.<user[is AuthToken];
    multi link games := User.<users[is Game];
  }
}
