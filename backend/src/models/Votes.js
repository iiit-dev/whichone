import { DataTypes } from 'sequelize';

const Votes = (sequelize) => {
    const Votes = sequelize.define('Votes', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        poll_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Polls',
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        selected_option: {
            type: DataTypes.ENUM('A', 'B'),
            allowNull: false
        },
        // Enhanced features for analytics and rewards
        vote_sequence: {
            type: DataTypes.INTEGER,
            allowNull: false // Track order of votes for reward eligibility
        },
        demographic_data: {
            type: DataTypes.JSON, // Store user demographics at time of vote
            allowNull: true
        },
        reward_earned: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        reward_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true // For analytics and fraud prevention
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true // For analytics
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    return Votes;
};

export default Votes; 