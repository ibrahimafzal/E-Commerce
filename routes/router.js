const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate")




//get productdata API
router.get("/getproducts", async (req, res) => {
    try {
        const productsdata = await Products.find()
        res.status(201).json(productsdata)
    } catch (error) {
        console.log("error" + error.message)
    }
});

//get individual data
router.get("/getproductsone/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const individualdata = await Products.findOne({ id: id });

        res.status(201).json(individualdata)

    } catch (error) {
        res.status(400).json(individualdata)
        console.log("error" + error.message);
    }
});


// register data

router.post("/register", async (req, res) => {
    // console.log(req.body);

    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "Fill the all details" })
        console.log("no data available");
    } else {
        try {
            const preuser = await USER.findOne({ email: email });

            if (preuser) {
                res.status(422).json({ error: "This user is already present" })
            } else if (password !== cpassword) {
                res.status(422).json({ error: "Password and cpassword not match" })
            } else {
                const finalUser = new USER({
                    fname, email, mobile, password, cpassword
                });

                //password hasing process


                const storedata = await finalUser.save();
                console.log("User successfully added ::", storedata);
                res.status(201).json(storedata)
            }
        } catch (error) {
            console.log("error: ", error);
            res.status(400).json({ message: "Bad request" })
        }
    }
});

//login user API
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "Fill the all data" })
    };

    try {
        const userLogin = await USER.findOne({ email: email });
        console.log("User Login details" + userLogin);
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);
            console.log(isMatch);

// hellow this is test changes

            if (!isMatch) {
                res.status(400).json({ error: "Password not match" })
            } else {
                //Token generate
                const token = await userLogin.generateAuthtoken();
                console.log(token);

                res.cookie("Amazonweb", token, {
                    expires: new Date(Date.now() + 1800000),
                    httpOnly: true
                });
                res.status(201).json(userLogin)
            }
        } else {
            res.status(400).json({ error: "Invalid details" })
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid details" })
    }
})

//Adding data into cart
router.post("/addcart/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log("Cart value" + cart);

        const UserContact = await USER.findOne({ _id: req.userID });
        console.log("user Contact" + UserContact);

        if (UserContact) {
            const cartData = await UserContact.addcartdata(cart);
            await UserContact.save();
            console.log(cartData);
            res.status(201).json(UserContact);
        } else {
            res.status(401).json({ error: "invalid user" });
        }

    } catch (error) {
        res.status(401).json({ error: "invalid user" });
    }
})

//get carts details
router.get("/cartdetails", authenticate, async (req, res) => {
    try {
        const buyuser = await USER.findOne({ _id: req.userID });
        res.status(201).json(buyuser);
    } catch (error) {
        console.log("error" + error)
    }
})

//get valid user
router.get("/validuser", authenticate, async (req, res) => {
    try {
        const validuserone = await USER.findOne({ _id: req.userID });
        res.status(201).json(validuserone);
    } catch (error) {
        console.log("error" + error)
    }
})

//remove item from shopping carts page
router.delete("/remove/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        req.findUser.carts = req.findUser.carts.filter((current) => {
            return current.id != id;
        });

        req.findUser.save();
        res.status(201).json(req.findUser);
        console.log("item removed")
    } catch (error) {
        console.log("error" + error);
        res.status(400).json(req.findUser);

    }
})

//for User Logout
router.get("/logout", authenticate, (req, res) => {
    try {
        req.findUser.tokens = req.findUser.tokens.filter((currentEle) => {
            return currentEle.token !== req.token
        });

        res.clearCookie("Amazonweb", { path: "/" });

        req.findUser.save();
        res.status(201).json(req.findUser.tokens)
        console.log("user logout");

    } catch (error) {
        console.log("error for user logout")
    }
})



module.exports = router;
