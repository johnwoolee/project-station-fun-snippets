const express = require('express')
const app = express()
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongo = require('./app/mongodb')
const usersService = require('./app/services/users.service')
const hasher = require('./app/utils/hasher')

dotenv.config()

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const router = require("./app/routes");

const port = process.env.PORT || process.env.port || 8080;

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true
}))

app.use(cookieParser())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});



const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/sabio";

mongo
  .connect(mongoUrl)
  .then(() => app.listen(port))
  .then(() => console.log(`Magic happens on port: ${port}`))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

  const mongodb = require("./app/mongodb");
  const conn = mongodb.connection;
  const ObjectId = mongodb.ObjectId;


//pre separation of concerns linkedin passport.js log in

const passport = require('passport')

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
app.use(passport.initialize());

function findAndModifyLinkedIn(profile) {
  return conn
    .db()
    .collection("users")
    .findAndModify(
      { "email": profile.emails[0].value },
      [['_id', 'asc']],
    {
      $set: { profileImageUrl: profile.photos[0].value,
              firstName: profile._json.firstName,
              lastName: profile._json.lastName,
              linkedIn: {
                linkedInId: profile.id
              }
      }
    },
    {
      new:true, 
      upsert:true
    },
  )
  .then(response => {
    return response;
  })  
}



var LINKEDIN_API_KEY = "placeholder";
var LINKEDIN_SECRET_KEY = "placeholder";

passport.use(new LinkedInStrategy({
  clientID: LINKEDIN_API_KEY,
  clientSecret: LINKEDIN_SECRET_KEY,
  callbackURL: "http://localhost:8080/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
}, 
function(accessToken, refreshToken, profile, done) {
  
  findAndModifyLinkedIn(profile)
  .then(req => {
    const loginCreds = { model: { email: req.value.email, password: req.value.password}}
    return usersService.login(loginCreds);
  })
  .then(data => {
    if (
      data &&
      data.approvalStatus &&
      data.approvalStatus !== "Approved"
    ) {
      res.status(500).send("Please contact an administrator.");
    } else {
      const roles = [];
      data.isBoardMember && roles.push("isBoardMember");
      data.isItAdmin && roles.push("isItAdmin");
      data.isProjectManager && roles.push("isProjectManager");
      data.isAdmin && roles.push("isAdmin");

      let hashedObject = hasher.hashString({ id: data._id, roles });
      const cookies = {
        auth: JSON.stringify({ id: data._id, roles }, { encode: String }),
        authHash: hashedObject
      }
      return cookies
    }
    return data
  })
  .then(profile => {
  return done(null, profile);
  })
  .catch(err => {
    console.log(err)
    return err
  })
  }
));


app.get('/auth/linkedin',
  passport.authenticate('linkedin'));

  app.get('/auth/linkedin/callback', function(req, res, next) {
    passport.authenticate('linkedin',  { session: false }, 
    function(err, user, info) {
      console.log(user);
      console.log(res);
      console.log(req);
      if (err) { return next(err); }
      if (!user) { 
        return res.redirect('http://localhost:3000/users/login'); }

      res.cookie("authHash", user.authHash)
      res.cookie("auth", user.auth)
      res.redirect('http://localhost:3000');

    
  })(req, res, next);
  console.log(res);
});

app.use(router);
