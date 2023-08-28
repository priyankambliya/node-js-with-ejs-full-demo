
const LocalStrategy = require('passport-local').Strategy
const ADMIN = require('../models/adminModel')

const bcrypt = require('bcrypt')

module.exports = (passport) => {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        console.log(":------------", id);
        try {
            const admin = await ADMIN.findById(id).lean();
            if (admin) {
                done(null, admin);
            }
        } catch (error) {
            return done(error, false)
        }
    })

    passport.use(new LocalStrategy({
        usernameField: 'email'
    },
        async function (username, password, done) {
            try {
                const admin = await ADMIN.findOne({ email: username });
                const pass = await bcrypt.compare(password, admin.password)
                if (!pass) return done(null, false)
                if (admin) return done(null, admin);
            } catch (error) {
                return done(error, false);
            }
        }
    ));

}

