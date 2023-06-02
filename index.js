const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const { Schema } = mongoose;
const userSchema = new Schema({
  username: { type: String, required: true }
});
const exersizeSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: Number,
  date: Date
});
const User = mongoose.model('User', userSchema);
const Exersize = mongoose.model('Exersize', exersizeSchema);



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//create a new user
app.post('/api/users', async (req, res) => {
  const username = req.body.username;
  if (!username) {
    res.json({ error: 'username is required' });
    return;
  }
  //check if username is already in the database
  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      res.json({ username: existingUser.username, _id: existingUser._id });
      return;
    }
  } catch (err) {
    console.log(err);
  }
  //create a new user
  try {
    const newUser = new User({ username: username });
    const savedUser = await newUser.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    console.log(err);
  }
});
//get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.log(err);
  }
});
//add an exersize
app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  //check if userId is valid
  try {
    existingUser = await User.findById(userId);
    if (!existingUser) {
      res.json({ error: 'userId is not valid' });
      return;
    }
  } catch (err) {
    console.log(err);
  }
  //create a new exersize
  const newExersize = new Exersize({
    userId: userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date) : new Date()
  });
  try {
    const savedExersize = await newExersize.save();
    let response = {
     username: existingUser.username,
      description: savedExersize.description,
      duration: savedExersize.duration,
      date: savedExersize.date.toDateString(),
      _id: existingUser._id
    };

    console.log(JSON.stringify(response));
    res.json({
      response
    });
  } catch (err) {
    console.log(err);
  }
});
//get all exersized for a user
app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  //check if userId is valid
  try {
    const existingUser  = await User.findById(userId);
    if (!existingUser) {
      res.json({ error: 'userId is not valid' });
      return;
    } 
  } catch (err) {
    console.log(err);
  }
  //get all exersizes for the user given the query parameters
 const { from, to, limit } = req.query;
 let dateFilter = {};
  if (from) {
    dateFilter.$gte = new Date(from);
  }
  if (to) {
    dateFilter.$lte = new Date(to);
  }
  let filter = {
    userId: userId
  }
  if (from || to) {
    filter.date = dateFilter;
  }
try {
  const exersizes = await Exersize.find(filter).limit(parseInt(limit));
  res.json({
    username: existingUser.username,
    _id: existingUser._id,
    count: exersizes.length,
    log: exersizes.map(exersize => {
      return {
        description: exersize.description,
        duration: exersize.duration,
        date: exersize.date.toDateString()
      }
    }
    )
  });
} catch (err) {
  console.log(err);

}


});





  //







const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
