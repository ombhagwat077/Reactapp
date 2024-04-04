import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Specify extended option for urlencoded

app.use(cors());

mongoose.connect("mongodb://localhost:27017/loginreg", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          if (password === user.password) {
            res.send({ message: "Login Successful", user: user, redirect: "http://127.0.0.1:5500/index1.html" });
          } else {
            res.send({ message: "Password didn't Match" });
          }
        } else {
          res.send({ message: "User Not Registered" });
        }
      })
      .catch(err => {
        res.status(500).send({ message: "Internal Server Error" });
      });
  });
  
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    // Check if a user with the same email already exists
    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                // If user already exists, send an error message
                res.status(400).json({ message: "User already registered with this email" });
            } else {
                // If user doesn't exist, create a new user and save it to the database
                const newUser = new User({
                    name,
                    email,
                    password
                });
                newUser.save()
                    .then(() => {
                        // Send success message if user is successfully registered
                        res.status(201).json({ message: "Successfully Registered" });
                    })
                    .catch(err => {
                        // Send error if there's any issue during user creation
                        console.error(err);
                        res.status(500).json({ message: "Internal Server Error" });
                    });
            }
        })
        .catch(err => {
            // Send error if there's any issue with database query
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        });
});

app.listen(9002, () => {
  console.log("Backend server started at port 9002");
});
