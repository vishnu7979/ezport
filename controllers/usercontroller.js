const collection = require("../models/user");
const Product = require("../models/product");
const banner = require("../models/banner");
const categoryCollection = require("../models/category");
const CartItem = require("../models/cart");
const Address = require("../models/address");
const Order = require("../models/order");
const Feedback = require("../models/feedbackModel");
const Wallet = require("../models/wallet");
const coupon = require("../models/coupon");
const Reference = require("../models/Reference");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const mongoose=require('mongoose')
const secret_Id = process.env.secret_Id;
const secret_Key = process.env.secret_Key;



const nodemailer = require("nodemailer");


const landing = async (req, res) => {
  const msg1 = req.session.user;
  const isLoggedIn = !!msg1; // Check if user is logged in
  console.log("this is landing page");
  console.log(msg1);
  // const banners = await banner.find();
  const banners = await banner.find({ isDeleted: false });
  const product = await Product.find();
  res.render("user/landing", { msg1, isLoggedIn, product,banners });
};

const login = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  res.render("user/login", { msg: "" });
};



const logout = (req, res) => {

// Set cache control headers to prevent caching
 
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
};

const myorders = (req, res) => {
  res.render("user/myorders", { msg: "" });
};
const products = (req, res) => {
  res.render("user/products", { msg: "" });
};
const clients = (req, res) => {
  res.render("user/clients", { msg: "" });
};
const contact = (req, res) => {
  res.render("user/contact", { msg: "" });
};
const signup = (req, res) => {
  res.render("user/signup", { msg: "" });
};

const passwordcrypt = function (password) {
  const bcryptPass = bcrypt.hash(password, 8);
  return bcryptPass;
};

function generateRandomReferenceCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

const signuppost = async (req, res) => {
  let email = req.body.email;
  const userFound = await collection.findOne({ email });
  console.log(userFound);
  if (!userFound) {
    const pass = req.body.password;
    const bcryptedPass = await passwordcrypt(pass);
    req.body.password = bcryptedPass;

    const data = {
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };
    await collection.create(data);

    try {
      const { email } = req.body;
      const check = await collection.findOne({ email: req.body.email });
      if (check) {
        const referenceCode = generateRandomReferenceCode(8);
        await Reference.create({
          userId: check._id,
          referenceCode: referenceCode,
        });

        // Create a wallet for the user with default balance of 0
        const newWallet = new Wallet();
        await newWallet.save();
        check.wallet = newWallet;
        await check.save();

        if (check.password == req.body.password) {
          const otp = generateOTP();
          console.log(otp);
          if (check.isblocked) {
            res.render("user/login", { error: "you are blocked by admin !!!" });
          }
          req.session.user = req.body.email;
          req.session.otp = otp;
          req.session.requestedOTP = true;
          await sendOTPByEmail(email, otp);
          res.render("user/otp", {
            msg: "Please enter the OTP sent to your email",
          });
        } else {
          res.render("user/login", { error: "Wrong Password !!!" });
        }
      } else {
        res.render("user/login", { error1: "User not found !!!" });
      }
    } catch (error) {
      console.error(error);
      res.render('error') 
    }
  } else {
    const msg = "Email is already Registered";
    res.render("user/signup", { msg });
  }
};

 

const loginpost = async (req, res) => {
  try {
    const { email } = req.body;
    const check = await collection.findOne({ email: req.body.email });

    if (check) {
      const result = await bcrypt.compare(req.body.password, check.password);
      if (result) {
        // Passwords match, perform the rest of your logic
        const otp = generateOTP();
        console.log(otp);
        if (check.isblocked) {
          res.render("user/login", { error: "you are blocked by admin !!!" });
        }
        req.session.user = req.body.email;
        req.session.otp = otp;
        req.session.requestedOTP = true;
        await sendOTPByEmail(email, otp);
        res.render("user/otp", {
          msg: "Please enter the OTP sent to your email",
        });
      } else {
        // Passwords do not match
        res.render("user/login", { error: "Wrong Password !!!" });
      }
    } else {
      // User with the provided email was not found
      res.render("user/login", { error1: "User not found !!!" });
    }
  } catch (error) {
    console.error(error);

    // Log the specific error message
    console.error(error.message);

    // Render an error page or send an appropriate error message
    res.render("error", {
      errorMessage: "An error occurred while processing your request.",
    });
  }
};



const generateOTP = () => {
  // Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000);
};

const sendOTPByEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL1,
      pass: process.env.PASS1,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL1, // Your email address
    to: email,
    subject: "OTP Verification",
    // text: `Your OTP for verification is: ${otp}`,
    html: `
        <h1>OTP Verification</h1>
        <p>Your OTP for verification is:</p>
        <h2 style="font-size: 24px">${otp}</h2>
        <p>Please use this OTP to log in to your agorts account.</p>
        <p>If you didn't request this OTP, ignore this email.</p>
        `,
  };

  try {
    const info = await transporter.sendMail(
      mailOptions,
      function (error, info) {
        if (error) {
          console.error(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error(error);
  }
};


const verifyOTP = async (req, res) => {
  const enteredOTP = req.body.otp;
  const storedOTP = req.session.otp;

  try {
    const user = await collection.findOne({ email: req.session.user });

    if (!user) {
      return res.render("user/otp", { msg: "User not found" });
    }

    if (user.blocked) {
      return res.render("error", {
        error: "Your account has been blocked. Please contact support.",
      });
    }

    if (enteredOTP == storedOTP) {
      console.log("i am in otp");
      // OTP is correct, proceed with further actions
      res.redirect("/");
    } else {
      // OTP is incorrect, show an error message
      res.render("user/otp", { msg: "Invalid OTP. Please try again" });
    }
  } catch (error) {
    console.error(error);
    res.render('error') 
  }
};

const resendOTP = async (req, res) => {
  const userEmail = req.session.user;

  if (req.session.requestedOTP) {
    const otp = generateOTP();
    console.log("resend otp :",otp)
    req.session.otp = otp;
    await sendOTPByEmail(userEmail, otp);
    res.json({ msg: "OTP has been resent to your email." });
  } else {
    res.json({ msg: "Can't resend OTP." });
  }
};

const sendOTP = async (req, res) => {
  const userEmail = req.body.email;

  try {
    const user = await collection.findOne({ email: userEmail });

    if (!user) {
      return res.render("user/login", { error1: "User not found !!!" });
    }

    const otp = generateOTP();
    req.session.otp = otp;
    sendOTPByEmail(userEmail, otp);

    res.render("user/otp", { msg: "Please enter the OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.render('error') 
  }
};

 
 

 
 
 
const wallet = async (req, res) => {
  try {
    const user = await collection.findOne({ email: req.session.user });

    const userWallet = await Wallet.findById(user.wallet);

    if (!userWallet) {
      return res.render("user/wallet", {
        msg: "No wallet found.",
        walletBalance: null,
      });
    }

    
    const walletBalance = userWallet.balance;

    res.render("user/wallet", { msg: "", walletBalance: walletBalance });
  } catch (error) {
    res.render("user/wallet", {
      msg: "Error fetching wallet balance.",
      walletBalance: null,
    });
  }
};

 


const shop = (req, res) => {
  res.render("user/shop");
};
 


const forgotpassword = (req, res) => {
  console.log("inside forgotpassword");
  res.render("user/forgotpassword", { msg: "" });
};

const forgotpasswordpost = async (req, res) => {
  const email = req.body.email;
  console.log(email);
  try {
    const { email } = req.body;
    const check = await collection.findOne({ email: req.body.email });
    if (check) {
      const otp = generateOTP();
      console.log(otp);
      if (check.isblocked) {
        res.render("user/login", { error: "you are blocked by admin !!!" });
      }
      req.session.user = req.body.email;
      req.session.otp = otp; // Store OTP in session
      req.session.requestedOTP = true;
      // Send the OTP to the user (you may use a notification library or email)

      await sendOTPByEmail(email, otp);
      res.render("user/otp", {
        msg: "Please enter the OTP sent to your email",
      });
    } else {
      res.render("user/login", { error1: "User not found !!!" });
    }
  } catch (error) {
    console.error(error);
    res.render('error') 
  }
};

 

module.exports = {
  landing,
  login,
  myorders,
  products,
  clients,
  contact,
  signup,
  signuppost,
  loginpost,
  logout,
  verifyOTP,
  sendOTP,
  resendOTP,
  wallet,
  shop,
  forgotpasswordpost,
  forgotpassword,
 
};
