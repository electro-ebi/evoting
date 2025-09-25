import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Election from "./Election.js";

const Candidate = sequelize.define(
  "candidate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    party: { type: DataTypes.STRING },
    electionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "elections", key: "id" },
      onDelete: "CASCADE",
    },
  },
  { tableName: "candidates" }
);

Candidate.belongsTo(Election, { foreignKey: "electionId" });
Election.hasMany(Candidate, { foreignKey: "electionId" });

export default Candidate;
