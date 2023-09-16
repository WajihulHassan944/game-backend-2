const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const { ObjectId } = require('mongodb');
const cors = require("cors");


app.use(express.json());
app.use(cors());



const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  age: String,
  height: String,
  weight: String

});
const Gameuser = new mongoose.model("Gameuser", userSchema);


const userSchema2 = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  creditCardInformation: String
});
const Gameuser2 = new mongoose.model("Gameuser2", userSchema2);


const userSchema555 = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const Gameuser555 = new mongoose.model("Gameuser555", userSchema555);


const cakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gameuser' },
  title: String,
  date: Date,
  description: String,
});
const Cake = mongoose.model("Cake", cakeSchema);



// Define the League schema
const leagueSchema = new mongoose.Schema({
  name: String,
  description: String,
  // Other league fields...
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gameuser2' }],
});

const League = mongoose.model('League', leagueSchema);

app.post('/api/create-league', async (req, res) => {
  const { name, description } = req.body;

  try {
      const newLeague = new League({
          name: name,
          description: description,
          users: [], // Initialize with an empty array of users
      });

      await newLeague.save();

      res.status(201).json({ message: 'League created successfully', league: newLeague });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch all leagues
app.get('/api/get-leagues', async (req, res) => {
  try {
      const leagues = await League.find({});
      res.json({ leagues });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching leagues' });
  }
});

const userLeagueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gameuser2' },
  leagueId: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
});

const UserLeague = mongoose.model('UserLeague', userLeagueSchema);

app.post('/api/join-league/:userId/:leagueId', async (req, res) => {
  const { userId, leagueId } = req.params;

  try {
      // Create a new UserLeague document to represent the user's league membership
      const userLeague = new UserLeague({
          userId: userId,
          leagueId: leagueId,
      });
      await userLeague.save();

      // Update the League document to add the user to the 'users' array
      await League.findByIdAndUpdate(leagueId, { $push: { users: userId } });

      res.status(200).json({ message: 'User joined the league successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/check-join-status/:userId/:leagueId', async (req, res) => {
  const { userId, leagueId } = req.params;

  try {
      const userLeague = await UserLeague.findOne({ userId: userId, leagueId: leagueId });

      if (userLeague) {
          res.status(200).json({ joined: true });
      } else {
          res.status(200).json({ joined: false });
      }
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Import required modules and set up your Express app

// Assuming you already have a League and UserLeague model

// Define a new route to get users who have joined a specific league
app.get('/api/get-league-users/:leagueId', async (req, res) => {
  const { leagueId } = req.params;

  try {
    // Find the league by its ID
    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    // Find user leagues associated with this league
    const userLeagues = await UserLeague.find({ leagueId: leagueId });

    if (!userLeagues || userLeagues.length === 0) {
      return res.status(200).json({ message: 'No users have joined this league', users: [] });
    }

    // Extract user IDs from user leagues
    const userIds = userLeagues.map(userLeague => userLeague.userId);

    // Find users by their IDs
    const users = await Gameuser2.find({ _id: { $in: userIds } });

    if (!users || users.length === 0) {
      return res.status(200).json({ message: 'No users found for this league', users: [] });
    }

    // Respond with the list of users who have joined this league
    res.status(200).json({ message: 'Users who have joined this league', users });
  } catch (error) {
    console.error('Error fetching league users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});










app.post('/users/:objectId/cakes', async (req, res) => {
  const { objectId } = req.params;
  const { title, date, description } = req.body;

  try {
    const user = await Gameuser.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cake = new Cake({
      userId: objectId,
      title,
      date,
      description,
    });

    await cake.save();
    res.status(200).json({ message: 'Data submitted successfully', cake });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
// ... (same code as before)

app.get('/users/:objectId/cakes', async (req, res) => {
  const { objectId } = req.params;

  try {
    const user = await Gameuser.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cakes = await Cake.find({ userId: objectId });
    res.status(200).json(cakes);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Gameuser.findOne({ email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const objectId = user._id.toString();
        res.status(200).json({ message: 'Login successful', objectId: objectId });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password , age , height , weight} = req.body;

  try {
    const existingUser = await Gameuser.findOne({ email: email });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = new Gameuser({
        name: name,
        email: email,
        password: hashedPassword,
        age: age,
        height: height,
        weight: weight, 
      });

      await newUser.save();
      res.status(200).json({ message: 'Registration successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/users/:objectId', async (req, res) => {
  const { objectId } = req.params;

  try {
    const user = await Gameuser.findById(objectId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to fetch all user data
app.get('/api/get-users', async (req, res) => {
  try {
    const users = await Gameuser.find({});
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});



//Routes for game users

//Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Gameuser2.findOne({ email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const objectId = user._id.toString();
        res.status(200).json({ message: 'Login successful', objectId: objectId });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password , creditCardInformation} = req.body;

  try {
    const existingUser = await Gameuser2.findOne({ email: email });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = new Gameuser2({
        name: name,
        email: email,
        password: hashedPassword,
        creditCardInformation:creditCardInformation, 
      });

      await newUser.save();
      res.status(200).json({ message: 'Registration successful', userName: name , userEmail: email });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/:objectId', async (req, res) => {
  const { objectId } = req.params;

  try {
    const user = await Gameuser2.findById(objectId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to fetch all user data
app.get('/api/get-game-users', async (req, res) => {
  try {
    const users = await Gameuser2.find({});
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

//Routes for games users end here


//Routes for game users

//Routes
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Gameuser555.findOne({ email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const objectId = user._id.toString();
        res.status(200).json({ message: 'Login successful', objectId: objectId });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
/// end for admin




app.post("/submit-welcome-note", (req, res) => {
  // Extract the form data from the request body
  const {  userName , userEmail} = req.body;
  console.log(userEmail);
  console.log(userName);
  console.log("test");

  // Send an email with the form details using Nodemailer or your preferred email library
  // Here's an example using Nodemailer
  const nodemailer = require("nodemailer");

// Create a transporter object for sending the email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vascularbundle43@gmail.com',
    pass: 'gxauudkzvdvhdzbg',
  },
});

const storeMailOptions = {
  from: userEmail,
  to: "vascularbundle43@gmail.com",
  subject: "Fantasy MMAdness",
  html: `
    <h2 style="color: #ff523b;">Fantasy MMAdness</h2>
    <hr style="border: 1px solid #ccc;">
    <p>Another user added</p>
  `,
};

const userMailOptions = {
  from: "wajih786hassan@gmail.com",
  to: userEmail,
  subject: "Fantasy MMAdness",
  html: `
  <h2 style="color: red;">Welcome to Fantasy MMAdness</h2>
  <p>Hello ${userName},</p>
  <p>Thank you for signing up for Fantasy MMAdness! We're excited to have you on board and join our community of MMA enthusiasts.</p>
  <p>With Fantasy MMAdness, you can create and manage your own fantasy MMA leagues, make predictions, and compete with others to prove your MMA knowledge.</p>
  <p>Your journey into the world of MMA fantasy gaming begins now. Get ready for some adrenaline-pumping action and fierce competition!</p>
  <p>If you have any questions or need assistance, don't hesitate to reach out to our support team at support@fantasymmadness.com.</p>
  <p>Once again, welcome to Fantasy MMAdness, ${userName}! Let the battles begin!</p>
  <p>Best regards,</p>
  <p>The Fantasy MMAdness Team</p> 
  `,
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});


const objectIdSchema = new mongoose.Schema({
  objectId: { type: String, unique: true },
  order: Number  // Add an order field
});

objectIdSchema.pre('save', async function (next) {
  try {
    const count = await mongoose.models.ObjectId.countDocuments();
    console.log('Current document count:', count);

    if (count >= 2) {
      console.log('Maximum limit of documents reached');
      throw new Error('Maximum limit of documents reached');
    }


 if (!this.order) {
    const count = await mongoose.models.ObjectId.countDocuments();
    this.order = count + 1;
  }



    console.log('Document count is below limit. Saving document...');
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error); // Call next with an error to propagate it to the save operation
  }


});
const ObjectIdModel = mongoose.model('ObjectId', objectIdSchema);

app.post('/storeObjectId', async (req, res) => {
  try {
    const { objectId } = req.body;

    const newObjectId = new ObjectIdModel({ objectId });
    await newObjectId.save();

    res.json({ success: true, message: 'Stored in MongoDB' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Maximum limit of documents reached') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
});




app.get('/retrieveObjectId', async (req, res) => {
  try {
    const objectIds = await ObjectIdModel.find({});

    res.json({ objectIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
});
app.get('/getLastObjectId', async (req, res) => {
  try {
    const lastObjectIdDocument = await ObjectIdModel.findOne().sort('-order');

    if (!lastObjectIdDocument) {
      return res.status(404).json({ success: false, error: 'No stored objectId found' });
    }

    const lastObjectId = lastObjectIdDocument.objectId;

    if (lastObjectIdDocument.order === 1) {
      // If lastObjectId is the first document, send a message
      res.json({ success: true, message: 'Last objectId is the first document' });
    } else {
      // If lastObjectId is the second document, send the lastObjectId
      res.json({ success: true, lastObjectId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
});

app.get('/getFirstObjectId', async (req, res) => {
  try {
    const firstObjectIdDocument = await ObjectIdModel.findOne().sort('order');

    if (!firstObjectIdDocument) {
      return res.status(404).json({ success: false, error: 'No stored objectId found' });
    }

    const firstObjectId = firstObjectIdDocument.objectId;

    res.json({ success: true, firstObjectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
});

app.delete('/deleteObjectId/:id', async (req, res) => {
  try {
    const objectIdToDelete = req.params.id;

    const result = await ObjectIdModel.deleteOne({ objectId: objectIdToDelete });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Object ID deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Object ID not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
});



// Define Schema
const scoreSchema = new mongoose.Schema({
  playerName: String,
  playerRound: Number,
  hpPrediction1: Number,
  hpPrediction2: Number,
  bpPrediction1: Number,
  bpPrediction2: Number,
  tpPrediction1: Number,
  tpPrediction2: Number,
  rwPrediction1: Number,
  rwPrediction2: Number,
  koPrediction1: Number,
  koPrediction2: Number,
});

const Score = mongoose.model('Score', scoreSchema);

app.post('/api/scores', async (req, res) => {
  try {
    const {
      playerName,
      playerRound,
      hpPrediction1,
      bpPrediction1,
      hpPrediction2,
      bpPrediction2,
      tpPrediction1,
      tpPrediction2,
      rwPrediction1,
      rwPrediction2,
      koPrediction1,
      koPrediction2,
    } = req.body;

    const score = new Score({
      playerName,
      playerRound,
      hpPrediction1,
      bpPrediction1,
      hpPrediction2,
      bpPrediction2,
      tpPrediction1,
      tpPrediction2,
      rwPrediction1,
      rwPrediction2,
      koPrediction1,
      koPrediction2,
    });

    await score.save();
    res.status(201).send(score);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.delete('/api/scores/:playerName', async (req, res) => {
  const playerName = req.params.playerName;

  try {
    const result = await Score.deleteMany({ playerName });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: `Deleted ${result.deletedCount} records for ${playerName}` });
    } else {
      res.status(404).json({ message: `No records found for ${playerName}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// API endpoint to retrieve scores
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Score.find();
    res.send(scores);
  } catch (error) {
    res.status(500).send(error);
  }
});
// API endpoint to delete a score by ID
app.delete('/api/scores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    // Find the score by ID and delete it
    const deletedScore = await Score.findByIdAndDelete(id);

    if (!deletedScore) {
      return res.status(404).send('Score not found');
    }

    res.status(200).send(deletedScore);
  } catch (error) {
    res.status(500).send(error);
  }
});







// for mma

const scoreSchemamma = new mongoose.Schema({
  playerName: String,
  playerRound: Number,
  stPrediction1: Number,
  stPrediction2: Number,
  kiPrediction1: Number,
  kiPrediction2: Number,
  knPrediction1: Number,
  knPrediction2: Number,
  elPrediction1: Number,
  elPrediction2: Number,
  spPrediction1: Number,
  spPrediction2: Number,
  rwPrediction1: Number,
  rwPrediction2: Number,
});

const ScoreMma = mongoose.model('ScoreMma', scoreSchemamma);

app.delete('/api/mma/scores/:playerName', async (req, res) => {
  const playerName = req.params.playerName;

  try {
    const result = await ScoreMma.deleteMany({ playerName });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: `Deleted ${result.deletedCount} records for ${playerName}` });
    } else {
      res.status(404).json({ message: `No records found for ${playerName}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to create MMA scores
app.post('/api/mma/scores', async (req, res) => {
  try {
    const {
      playerName,
      playerRound,
      stPrediction1,
      stPrediction2,
      kiPrediction1,
      kiPrediction2,
      knPrediction1,
      knPrediction2,
      elPrediction1,
      elPrediction2,
      spPrediction1,
      spPrediction2,
      rwPrediction1,
      rwPrediction2,
    } = req.body;

    const scoreMma = new ScoreMma({
      playerName,
      playerRound,
      stPrediction1,
      stPrediction2,
      kiPrediction1,
      kiPrediction2,
      knPrediction1,
      knPrediction2,
      elPrediction1,
      elPrediction2,
      spPrediction1,
      spPrediction2,
      rwPrediction1,
      rwPrediction2,
    });

    await scoreMma.save();
    res.status(201).send(scoreMma);
  } catch (error) {
    res.status(400).send(error);
  }
});

// API endpoint to retrieve MMA scores
app.get('/api/mma/scores', async (req, res) => {
  try {
    const scoresMma = await ScoreMma.find();
    res.send(scoresMma);
  } catch (error) {
    res.status(500).send(error);
  }
});


// for mma ends here



// Define the schema for round scores
const roundScoreSchema = new mongoose.Schema({
  HP: Number,
  BP: Number,
  TP: Number,
  RW: Number,
  RL: Number,
  KO: Number,
  SP: Number,
});

// Define the schema for rounds within a game
const roundSchema = new mongoose.Schema({
  roundNumber: Number,
  scores: roundScoreSchema,
});

// Define the schema for a game within an admin player
const gameSchema = new mongoose.Schema({
  gameNumber: Number,
  rounds: [roundSchema],
});

// Define the schema for round results associated with an admin player
const roundResultSchema = new mongoose.Schema({
  adminPlayerId: String,
  games: [gameSchema],
});

const RoundResult = mongoose.model('RoundResult', roundResultSchema);

// Endpoint to store round results in MongoDB
app.post('/api/storeRoundResults', async (req, res) => {
  const { adminPlayerId, gameNumber, roundNumber, scores } = req.body;

  try {
    const existingResult = await RoundResult.findOne({ adminPlayerId }).exec();
    if (existingResult) {
      // Admin player exists, update their data
      const gameIndex = existingResult.games.findIndex(game => game.gameNumber === gameNumber);
      if (gameIndex !== -1) {
        // Game exists, update round data
        const roundIndex = existingResult.games[gameIndex].rounds.findIndex(round => round.roundNumber === roundNumber);
        if (roundIndex !== -1) {
          existingResult.games[gameIndex].rounds[roundIndex].scores = scores;
        } else {
          // Round doesn't exist, create a new round
          existingResult.games[gameIndex].rounds.push({ roundNumber, scores });
        }
      } else {
        // Game doesn't exist, create a new game with the round
        existingResult.games.push({ gameNumber, rounds: [{ roundNumber, scores }] });
      }

      await existingResult.save();
    } else {
      // Admin player doesn't exist, create a new entry
      const roundResult = new RoundResult({
        adminPlayerId,
        games: [{ gameNumber, rounds: [{ roundNumber, scores }] }],
      });
      await roundResult.save();
    }

    res.sendStatus(201);
  } catch (error) {
    console.error('Error storing round results:', error);
    res.status(500).json({ error: 'Error storing round results' });
  }
});

// Endpoint to fetch round results from MongoDB
app.get('/api/fetchRoundResults', async (req, res) => {
  const { adminPlayerId } = req.query;

  try {
    const results = await RoundResult.findOne({ adminPlayerId }).exec();
    res.json(results);
  } catch (error) {
    console.error('Error fetching round results:', error);
    res.status(500).json({ error: 'Error fetching round results' });
  }
});
app.get('/fetchRoundResults', async (req, res) => {
  const { adminPlayerId, roundNumber } = req.query;

  try {
    const results = await RoundResult.findOne({ adminPlayerId }).exec();
    if (results) {
      // Modify this part to extract the round results for the specified round
      const game = results.games.find(game => game.rounds.some(round => round.roundNumber === parseInt(roundNumber)));
      
      if (game) {
        const round = game.rounds.find(round => round.roundNumber === parseInt(roundNumber));
        
        if (round) {
          // Respond with the round results
          res.json({ gameNumber: game.gameNumber, round: round });
        } else {
          res.status(404).json({ error: 'Round not found' });
        }
      } else {
        res.status(404).json({ error: 'Game not found' });
      }
    } else {
      res.status(404).json({ error: 'Admin player not found' });
    }
  } catch (error) {
    console.error('Error fetching round results:', error);
    res.status(500).json({ error: 'Error fetching round results' });
  }
});





// Define the schema for MMA round scores
const mmaRoundScoreSchema = new mongoose.Schema({
  ST: Number, // Strikes
  KI: Number, // Kicks
  KN: Number, // Knees
  El: Number, // Elbows
  RW: Number, // Round Winner
  RL: Number, // Round Loser
  KO: Number, // Knockout
  SP: Number, // Survival Points
});

// Define the schema for MMA rounds within a game
const mmaRoundSchema = new mongoose.Schema({
  roundNumber: Number,
  scores2: mmaRoundScoreSchema,
});

// Define the schema for a game within an admin player (for MMA)
const mmaGameSchema = new mongoose.Schema({
  gameNumber: Number,
  rounds: [mmaRoundSchema],
});

// Define the schema for round results associated with an admin player (for MMA)
const mmaRoundResultSchema = new mongoose.Schema({
  adminPlayerId: String,
  games: [mmaGameSchema],
});

const MMARoundResult = mongoose.model('MMARoundResult', mmaRoundResultSchema);

// Endpoint to store MMA round results in MongoDB
app.post('/api/storeMMARoundResults', async (req, res) => {
  const { adminPlayerId, gameNumber, roundNumber, scores2 } = req.body;

  try {
    const existingResult = await MMARoundResult.findOne({ adminPlayerId }).exec();
    if (existingResult) {
      // Admin player exists, update their data
      const gameIndex = existingResult.games.findIndex(game => game.gameNumber === gameNumber);
      if (gameIndex !== -1) {
        // Game exists, update round data
        const roundIndex = existingResult.games[gameIndex].rounds.findIndex(round => round.roundNumber === roundNumber);
        if (roundIndex !== -1) {
          existingResult.games[gameIndex].rounds[roundIndex].scores2 = scores2;
        } else {
          // Round doesn't exist, create a new round
          existingResult.games[gameIndex].rounds.push({ roundNumber, scores2 });
        }
      } else {
        // Game doesn't exist, create a new game with the round
        existingResult.games.push({ gameNumber, rounds: [{ roundNumber, scores2 }] });
      }

      await existingResult.save();
    } else {
      // Admin player doesn't exist, create a new entry
      const mmaRoundResult = new MMARoundResult({
        adminPlayerId,
        games: [{ gameNumber, rounds: [{ roundNumber, scores2 }] }],
      });
      await mmaRoundResult.save();
    }

    res.sendStatus(201);
  } catch (error) {
    console.error('Error storing MMA round results:', error);
    res.status(500).json({ error: 'Error storing MMA round results' });
  }
});

// Endpoint to fetch MMA round results from MongoDB
app.get('/api/fetchMMARoundResults', async (req, res) => {
  const { adminPlayerId } = req.query;
console.log(adminPlayerId, "as you requested");
  try {
    const results = await MMARoundResult.findOne({ adminPlayerId }).exec();
    res.json(results);
  } catch (error) {
    console.error('Error fetching MMA round results:', error);
    res.status(500).json({ error: 'Error fetching MMA round results' });
  }
});










// Create a Mongoose schema
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const Item = mongoose.model('Item', itemSchema);

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new item
app.post('/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/", (req,res) =>{
  res.send("Backend server has started running successfully...");
});




const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
