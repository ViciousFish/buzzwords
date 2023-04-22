module default {  
  type AuthToken {
    required property token -> str;
    required link user -> User;
  }

  type User {
    required property nickname -> str;
    property googleId -> str;
    multi link authTokens := User.<user[is AuthToken];
  }
}
