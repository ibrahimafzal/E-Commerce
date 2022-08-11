const jwt = require("jsonwebtoken");
const USER = require("../models/userSchema");
const secretkey = process.env.KEY;

const authenticate = async(req,res,next) => {
    try {
        //here we will get cookie
        const token = req.cookies.Amazonweb;

        //Here we will verify cookies and secretKey
        const verifyToken = jwt.verify(token,secretkey);
        console.log("Verify Cookies" + verifyToken);

        //Here we will find User by {id} which produce verifyCookie
        const findUser = await USER.findOne({_id:verifyToken._id,"tokens.token":token});
        console.log("Find User" + findUser);

        if(!findUser){throw new Error("User not found")};

        req.token = token;
        req.findUser = findUser;
        req.userID = findUser._id

        next();

    } catch (error) {
        
        res.status(401).send("No token provided")
        console.log(error)
    }
}

module.exports = authenticate;
