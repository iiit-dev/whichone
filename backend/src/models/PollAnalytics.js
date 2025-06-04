import { DataTypes } from 'sequelize';

const PollAnalytics = (sequelize) => {
    const PollAnalytics = sequelize.define('PollAnalytics', {
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
        // Demographic breakdown
        age_groups: {
            type: DataTypes.JSON, // {"18-25": {"A": 10, "B": 5}, "26-35": {"A": 8, "B": 12}}
            defaultValue: {}
        },
        gender_breakdown: {
            type: DataTypes.JSON, // {"male": {"A": 15, "B": 8}, "female": {"A": 12, "B": 18}}
            defaultValue: {}
        },
        location_breakdown: {
            type: DataTypes.JSON, // {"US": {"A": 20, "B": 15}, "UK": {"A": 10, "B": 8}}
            defaultValue: {}
        },
        // Timing analytics
        vote_timeline: {
            type: DataTypes.JSON, // Hourly vote counts for trend analysis
            defaultValue: {}
        },
        peak_voting_hour: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        // Engagement metrics
        avg_time_to_vote: {
            type: DataTypes.DECIMAL(8, 2), // Average seconds from view to vote
            defaultValue: 0.00
        },
        bounce_rate: {
            type: DataTypes.DECIMAL(5, 2), // Percentage who viewed but didn't vote
            defaultValue: 0.00
        },
        // Social metrics
        share_sources: {
            type: DataTypes.JSON, // {"facebook": 10, "twitter": 5, "direct": 20}
            defaultValue: {}
        },
        viral_coefficient: {
            type: DataTypes.DECIMAL(5, 2), // Average shares per voter
            defaultValue: 0.00
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    return PollAnalytics;
};

export default PollAnalytics; 