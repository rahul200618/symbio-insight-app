const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sequence = sequelize.define('Sequence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  header: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  sequence: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  length: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gcContent: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  orfDetected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  orfCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  orfs: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  nucleotideCounts: {
    type: DataTypes.JSON,
    defaultValue: { A: 0, T: 0, G: 0, C: 0 }
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  metrics: {
    type: DataTypes.JSON
  },
  interpretation: {
    type: DataTypes.TEXT
  },
  aiSummary: {
    type: DataTypes.TEXT
  },
  cached: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'sequences'
});

module.exports = Sequence;