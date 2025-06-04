import { DataTypes } from 'sequelize';

const WalletTransactions = (sequelize) => {
    const WalletTransactions = sequelize.define('WalletTransactions', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        poll_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Polls',
                key: 'id'
            }
        },
        transaction_type: {
            type: DataTypes.ENUM('DEPOSIT', 'WITHDRAWAL', 'POLL_PAYMENT', 'VOTE_REWARD', 'REFUND'),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        balance_before: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        balance_after: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reference_id: {
            type: DataTypes.STRING,
            allowNull: true // External payment reference
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
            defaultValue: 'COMPLETED'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    return WalletTransactions;
};

export default WalletTransactions; 