import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

export interface PGModels {
  Game: ModelCtor<Model<any, any>>;
  Cell: ModelCtor<Model<any, any>>;
  User: ModelCtor<Model<any, any>>;
}

export const createModels = async (sequelize: Sequelize): Promise<PGModels> => {
  const User = sequelize.define("User", {
    ulid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  });

  const Game = sequelize.define("Game", {
    ulid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    turn: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gameOver: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    winner: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
  });

  const Cell = sequelize.define("Cell", {
    q: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    r: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    capital: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: {
        min: 0,
        max: 2,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  // FK on Cell that points to Game
  Game.hasMany(Cell);
  Cell.belongsTo(Game);

  // FKs on Game that point to users
  Game.belongsTo(User, {
    foreignKey: {
      name: "player1",
      allowNull: false,
    },
  });
  Game.belongsTo(User, {
    foreignKey: {
      name: "player2",
      allowNull: true,
    },
  });
  User.hasMany(Game);

  await User.sync();
  await Game.sync();
  await Cell.sync();

  return {
    Game,
    Cell,
    User,
  };
};
