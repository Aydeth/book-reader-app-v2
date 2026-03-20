const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false  // Эта опция игнорирует самоподписанный сертификат
    }
  },
  logging: false
});

module.exports = sequelize;