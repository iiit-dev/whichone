import { DataTypes } from 'sequelize';

const PollFilters = (sequelize) => {
    const PollFilters = sequelize.define('PollFilters', {
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
        filter_type: {
            type: DataTypes.ENUM('age', 'location', 'interests'),
            allowNull: false
        },
        filter_value: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    return PollFilters;
};

export default PollFilters; 