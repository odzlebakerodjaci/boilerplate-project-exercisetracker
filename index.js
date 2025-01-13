const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const users = [];

app.post('/api/users', function (req, res) {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid username!' });
  }

  const newUser = {
    username,
    _id: uuidv4(), 
  };

  users.push(newUser);

  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users.map(({ username, _id }) => ({ username, _id }))); 
});

app.post('/api/users/:_id/exercises', function(req,res){
  const {_id} = req.params;
  const {description, duration, date} = req.body;

  if(!description || typeof description !== 'string'){
    return res.status(400).json({error: 'Invalid description!'})
  }
  if(!duration || typeof duration !== 'string'){
    return res.status(400).json({error: 'Invalid duration!'})
  }
  const user = users.find((user)=> user._id === _id);
  if(!user){
    return res.status(404).json({ error: 'User not found!' });
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date? new Date(date).toDateString() : new Date().toDateString()
  }

  user.exercises.push(newExercise);
  res.json({
    username: user.username,
    _id: user._id,
    ...newExercise
  });
});

app.get('/api/users/:_id/logs', function(req,res){
  const {id} = req.params;
  const {from, to, limit} = req.query;

  const user = users.find((u)=> u._id === _id);
  if(!user){
    return res.status(404).json({error: "User not found"})
  }
  
  let exercises = [...user.exercises];

  if(from){
    const fromDate = new Date(from);
    exercises = exercises.filter((exercise)=> new Date(exercise.date) >= fromDate);
  }
  if(to){
    const toDate = new Date(to);
    exercises = exercises.filter((exercise)=> new Date(exercise.date) <= toDate);
  }
  if(limit){
    exercises = exercises.slice(0, parseInt(limit, 10))
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: exercises.length,
    log: exercises
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
