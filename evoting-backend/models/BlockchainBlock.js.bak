import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const BlockchainBlock = sequelize.define(
  "blockchain_block",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blockIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    previousHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    nonce: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
  },
  { 
    tableName: "blockchain_blocks",
    indexes: [
      {
        fields: ['blockIndex'],
        name: 'blockchain_blocks_index'
      },
      {
        fields: ['hash'],
        name: 'blockchain_blocks_hash'
      }
    ]
  }
);

export default BlockchainBlock;
