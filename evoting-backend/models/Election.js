import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Election = sequelize.define(
  "election",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "elections" }
);

export default Election;
