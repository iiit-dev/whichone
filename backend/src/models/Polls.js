import { DataTypes } from 'sequelize';

const Polls = (sequelize) => {
    const Polls = sequelize.define('Polls', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false
        },
        option_a_text: {
            type: DataTypes.STRING,
            allowNull: true
        },
        option_b_text: {
            type: DataTypes.STRING,
            allowNull: true
        },
        option_a_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        option_b_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        max_votes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10 // Default free poll limit
        },
        time_limit: {
            type: DataTypes.INTEGER, // In minutes
            allowNull: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'CLOSED'),
            defaultValue: 'ACTIVE'
        },
        votes_count_a: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        votes_count_b: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // Enhanced payment and reward features
        poll_fee: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        reward_pool: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        reward_per_voter: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        max_rewarded_voters: {
            type: DataTypes.INTEGER,
            defaultValue: 50 // First 50 respondents get rewards
        },
        demographic_filters: {
            type: DataTypes.JSON, // Store demographic requirements
            allowNull: true
        },
        // Analytics tracking
        views_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        shares_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
        {
            timestamps: false
        }
    );

    return Polls;
};

export default Polls; 