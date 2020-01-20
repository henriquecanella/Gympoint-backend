import Sequelize from 'sequelize';

import databaseConfig from '../config/database';

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
  }
}

export default new Database();
