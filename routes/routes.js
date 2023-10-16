const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const bcrypt = require("bcryptjs");




// registration api starts
router.post("/register", async (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const number = req.body.number
    const password = req.body.password
    const confPassword = req.body.confPassword
    const token = uuidv4();

    const errors = [];

    if (!name) {
        errors.push("Please enter a name");
    }
    if (!email) {
        errors.push("Please enter an email");
    }
    if (!number) {
        errors.push("Please enter a password");
    }
    if (!confPassword) {
        errors.push("Please enter a password");
    }
    if(number.length !== 10){
        errors.push("Number should be 10 digits long");
    }
    if (!password) {
        errors.push("Please enter a password");
    }
    if(password !== confPassword){
        errors.push("Password and Confirm Password should be same");
    }
    if (!validator.isEmail(email)) {
        errors.push("Please enter a valid email");
    }
    if (password.length < 8) {
        errors.push("Password should be atleast 8 characters long");
    }

    if (errors.length > 0) {
        res.status(400).json({ errors })
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 8);
            const user = new User({
                name,
                email,
                number,
                hashedPassword,
                token,
            });
            const savedUser = await user.save();

            if (!savedUser) {
                res.status(500).send({ message: "Error occured" });
            } else {
                res.status(200).send({ message: "Successful" });
            }
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
                res.status(409).json({ message: "Email is already in use, please enter a unique email" }); // Use 409 Conflict
            } else {
                console.error(error);
                res.status(500).json({ message: "Error in catch" }); // Use 500 Internal Server Error
            }
        }
    }
});
// ends



// login api
router.get("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sessionStorage = req.session.userInfo;

    const errors = [];

    if (!email) {
        errors.push("Please provide the email");
    }
    if (!password) {
        errors.push("Please provide the password");
    }
    if(!validator.isEmail(email)){
        errors.push("Please enter a valid email");
    }
    if(sessionStorage){
        errors.push("You are already logged in");
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }
    const user = await User.findOne({ email });

    if (!user) {
        errors.push("This email is not registered");
        res.status(400).json({ errors });
        return;
    } else {
        const checkPassword = await bcrypt.compare(password, user.hashedPassword);

        if (!checkPassword) {
            errors.push("Wrong password");
            res.status(400).json({ errors });
            return;
        }
        else {
            const userData = user;
            req.session.userInfo = {userToken: user.token, userEmail: user.email};
            res.status(201).send({ userData, message: "Logged in" });
        }
    }
});
// ends



// logout api
router.get("/logout", (req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            res.status(401).json({err})
        }else{
            res.status(200).send({message:"Successfully logged out"});
        }
    })
})
// ends


// api to print sessions
router.get("/getsession", (req, res)=>{
    const user = req.session.userInfo;
    if(user){
        console.log(user);
    }else{
        res.status(200).json({message:"No session"});
    }
})
// ends here










module.exports = router;