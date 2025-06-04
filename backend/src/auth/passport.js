import passport from 'passport'
import passportJwt from "passport-jwt";
import UsersModel from '../models/Users.js';
import sequelize from '../database/index.js';
import dotenv from 'dotenv';
import authConfig from '../config/auth.config.js';
// Load environment variables
dotenv.config();
const Users = UsersModel(sequelize);
const ExtractJwt = passportJwt.ExtractJwt; 
const JwtStrategy = passportJwt.Strategy;
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: authConfig.jwtSecret,
        },
        function (jwtPayload, done) {
            console.log('Jwt Payload : ', jwtPayload);
            return Users.findOne({ where: { id: jwtPayload.id } })
                .then((user) => {
                    return done(null, user);
                })
                .catch((err) => {
                    return done(err);
                });
        }
    )
);