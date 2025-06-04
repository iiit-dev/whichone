import { Sequelize } from 'sequelize';
import Users from '../models/Users.js';
import Polls from '../models/Polls.js';
import PollFilters from '../models/PollFilters.js';
import Votes from '../models/Votes.js';
import Profile from '../models/Profile.js';
import WalletTransactions from '../models/WalletTransactions.js';
import PollAnalytics from '../models/PollAnalytics.js';

const sequelize = new Sequelize(
  'which-one',
  'admin',
  'Unread7-Facebook-Jump-Starlet',
  {
    dialect: 'mysql',
    host: 'database-06-04-2025-my-sql.cp404wgy0328.ap-south-1.rds.amazonaws.com',
    port: 3306,
  }
);

// Initialize models
const models = {
  Users: Users(sequelize),
  Polls: Polls(sequelize),
  PollFilters: PollFilters(sequelize),
  Votes: Votes(sequelize),
  Profile: Profile(sequelize),
  WalletTransactions: WalletTransactions(sequelize),
  PollAnalytics: PollAnalytics(sequelize)
};

// Define relationships
models.Polls.belongsTo(models.Users, { foreignKey: 'creator_id', as: 'creator' });
models.Users.hasMany(models.Polls, { foreignKey: 'creator_id', as: 'polls' });

models.PollFilters.belongsTo(models.Polls, { foreignKey: 'poll_id', as: 'poll' });
models.Polls.hasMany(models.PollFilters, { foreignKey: 'poll_id', as: 'filters' });

models.Votes.belongsTo(models.Polls, { foreignKey: 'poll_id', as: 'poll' });
models.Votes.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
models.Polls.hasMany(models.Votes, { foreignKey: 'poll_id', as: 'votes' });
models.Users.hasMany(models.Votes, { foreignKey: 'user_id', as: 'votes' });

// Add Profile relationship
models.Profile.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
models.Users.hasOne(models.Profile, { foreignKey: 'user_id', as: 'profile' });

// Add WalletTransactions relationships
models.WalletTransactions.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
models.WalletTransactions.belongsTo(models.Polls, { foreignKey: 'poll_id', as: 'poll' });
models.Users.hasMany(models.WalletTransactions, { foreignKey: 'user_id', as: 'transactions' });
models.Polls.hasMany(models.WalletTransactions, { foreignKey: 'poll_id', as: 'transactions' });

// Add PollAnalytics relationships
models.PollAnalytics.belongsTo(models.Polls, { foreignKey: 'poll_id', as: 'poll' });
models.Polls.hasOne(models.PollAnalytics, { foreignKey: 'poll_id', as: 'analytics' });

sequelize.sync({ force: false });
(async () => {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  })();

export { models };
export default sequelize;
