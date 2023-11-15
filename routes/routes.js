const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const Restro = require("../models/restroInfo");
const Table = require("../models/tables");

const storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});

const upload = multer({storage:storage});

// cloudinary configs

cloudinary.config({
    cloud_name: 'djrh8oflc',
    api_key: '544113442678141',
    api_secret: 'G6AKEYGFz2eiEcVHXg-4myu5cXg'
});

// ends here



// registration api starts
router.post("/register", async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const number = req.body.number
        const password = req.body.password
        const role = req.body.role
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
        if (number.length !== 10) {
            errors.push("Number should be 10 digits long");
        }
        if (!password) {
            errors.push("Please enter a password");
        }
        if (!role) {
            errors.push("Please enter your role");
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
                    role,
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
    } catch (error) {
        console.error(error);
        res.status(401).json({ error })
    }

});
// ends



// login api
router.post("/login", async (req, res) => {
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
    if (!validator.isEmail(email)) {
        errors.push("Please enter a valid email");
    }
    if (sessionStorage) {
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
            req.session.userInfo = { userToken: user.token, userEmail: user.email };
            res.status(201).send({ userData, message: "Logged in" });
        }
    }
});
// ends



// logout api
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(401).json({ err })
        } else {
            res.status(200).send({ message: "Successfully logged out" });
        }
    })
})
// ends



// api to print sessions
router.get("/getsession", (req, res) => {
    const user = req.session.userInfo;
    if (user) {
        console.log(user);
    } else {
        res.status(200).json({ message: "No session" });
    }
})
// ends here

// api to add restro info
router.post("/addRestroInfo", upload.single("restroImage"), async (req, res)=>{
    try {
        
        const restroName = req.body.restroName;
        const restroAddress = req.body.restroAddress;
        const restroTableCount = req.body.restroTableCount;
        const restroImage = req.file.path;
        const restroToken = uuidv4();
    
        const errors = [];
    
        if(!restroName){
            errors.push("Please provide Restaurant Name");
            return res.status(401).json({errors});
        }
        if(!restroAddress){
            errors.push("Please provide Restaurant Address");
            return res.status(401).json({errors});
        }
        if(!restroTableCount){
            errors.push("Please provide Restaurant Table Count");
            return res.status(401).json({errors});
        }
        if(!restroImage){
            errors.push("Please provide Restaurant Image");
            return res.status(401).json({errors});
        }
    
        const cloudinaryImageResult = await cloudinary.uploader.upload(restroImage, {folder:"restro_image"}, function(err, result){
            if(err){
                res.status(401).json({err});
            }
        });
    
        imageURL = cloudinaryImageResult.secure_url;
        const restroSave = new Restro({
            restroName,
            restroAddress,
            restroTableCount,
            restroImage:imageURL,
            restroToken
        })
    
        const saveRestro = await restroSave.save();
    
        if(saveRestro){
            res.status(200).json({message:"Restro information has been saved"});
        }else{
            res.status(400).json({message:"Restro Information has not been saved"});
        }
    } catch (error) {
        res.status(401).json({error});
    }
})


// ends here


// api to fetch all restros

router.get("/allRestros", (req, res)=>{
    Restro.find()
    .exec()
    .then((data)=>{
        res.status(200).json({data});
    })
    .catch((error)=>{
        res.status(401).json({error});
    })
})
// ends here


// api to fetch restro Info

router.get("/restroByInfo/:token", async (req, res)=>{
    const token = req.params.token;

    const restroInfo = await Restro.find({restroToken:token})

    if(restroInfo){
        res.status(200).json({restroInfo});
    }else{
        res.status(401).json({message:"No restro"});
    }
})

// ends here


// api to book tables

router.post("/bookTable/:token/:tableNumber", async (req, res)=>{
    try {
        const restroToken = req.params.token
        const tableNumber = req.params.tableNumber;
        const status = req.body.status;
        const bookedBy = req.body.bookedBy;
    
        const tableBook = new Table({
            restroToken,
            tableNumber,
            status,
            bookedBy
        });
    
        const bookedTable = await tableBook.save();
    
        if(bookedTable){
            res.status(200).json({message:"Your table has been successfully booked"});
        }else{
            res.status(401).json({message:"Your table has not been booked due to some problems"});
        }
    } catch (error) {
        res.status(401).json({error});
    };





})

// ends here




module.exports = router;