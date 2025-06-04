import { DataTypes } from 'sequelize';

const Users = (sequelize) => {
    const Users = sequelize.define('Users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        email: { 
            type: DataTypes.STRING, 
            unique: true,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            defaultValue: null
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        wallet_balance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        // Enhanced demographic fields for analytics and filtering
        age: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'non-binary', 'prefer-not-to-say'),
            allowNull: true
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true
        },
        occupation: {
            type: DataTypes.STRING,
            allowNull: true
        },
        education_level: {
            type: DataTypes.ENUM('high-school', 'bachelor', 'master', 'phd', 'other'),
            allowNull: true
        },
        income_range: {
            type: DataTypes.ENUM('under-25k', '25k-50k', '50k-75k', '75k-100k', 'over-100k'),
            allowNull: true
        },
        interests: {
            type: DataTypes.JSON, // Array of interest categories
            allowNull: true
        },
        // Analytics and engagement
        total_votes_cast: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_polls_created: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_earnings: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        reputation_score: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 5.00 // Out of 10
        },
        last_active: {
            type: DataTypes.DATE,
            allowNull: true
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

    return Users;
};

export default Users;