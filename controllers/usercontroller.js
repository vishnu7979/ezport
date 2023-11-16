const collection = require("../models/user");
const Product = require("../models/product");
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

const secret_Id = "rzp_test_waFdN3ZvExWNh1";
const secret_Key = "b42Dwol4Dbl9W0tbplVQuqH8";

const nodemailer = require("nodemailer");

const landing = async (req, res) => {
  const msg1 = req.session.user;
  const isLoggedIn = !!msg1; // Check if user is logged in
  console.log("this is landing page");
  console.log(msg1);
  const product = await Product.find();
  res.render("user/landing", { msg1, isLoggedIn, product });
};

const login = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  res.render("user/login", { msg: "" });
};


const logout = (req, res) => {
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
      res.send("An error occurred while processing your request.");
    }
  } else {
    const msg = "Email is already Registered";
    res.render("user/signup", { msg });
  }
};

// const loginpost = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const check = await collection.findOne({ email: req.body.email });
//     const result = await bcrypt.compare(req.body.password,check.password)
//     if (check) {
//       if (req.body.email===check.email&& result) {
//         const otp = generateOTP();
//         console.log(otp);
//         if (check.isblocked) {
//           res.render("user/login", { error:"you are blocked by admin !!!" });
//         }
//         //might
//         // req.session.userId = user._id;
//         req.session.user = req.body.email;
//         req.session.otp = otp; // Store OTP in session
//         req.session.requestedOTP = true;
//         // Send the OTP to the user (you may use a notification library or email)
//         await sendOTPByEmail(email, otp);
//         res.render("user/otp", {
//           msg: "Please enter the OTP sent to your email",
//         });
//       } else {
//         res.render("user/login", { error: "Wrong Password !!!" });
//       }
//     } else {
//       res.render("user/login", { error1: "User not found !!!" });
//     }
//   } catch (error) {
//     console.error(error);
//     console.error(error.message);

//     res.send("An error occurred while processing your request.");
//   }

// };

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
      user: process.env.EMAIL,
      pass: process.env.PASS,
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
        <p>Please use this OTP to log in to your account.</p>
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
    res.send("An error occurred while processing your request.");
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
    res.send("An error occurred while processing your request.");
  }
};

const viewProductDetails = async (req, res) => {
  console.log("Inside viewProductDetails"); // to Check if this is printed
  const productId = req.params.id;
  console.log("Product ID:", productId); // to check

  const product = await Product.findById(productId);
  const products = await Product.find();

  res.render("user/product_details", { product, products });
  // Product.findById(productId, (err, product) => {
  //     if (err) {
  //         console.error(err);
  //         return res.status(500).send('Internal Server Error');
  //     }
  //     if (!product) {
  //         return res.status(404).send('Product not found');
  //     }

  //     console.log('Product found:', product); // Add this line
  //     console.log("Rendering product_details.ejs"); //
  //     res.render('user/product_details', { product }); // Check if the view file name is correct
  // });
};

const displayProducts = async (req, res) => {
  try {
    const page = req.query.page || 1; // Get the requested page from the query parameter
    const itemsPerPage = 6; // Number of items to display per page

    const delCat = await categoryCollection.find(
      { isDeleted: true },
      { _id: 0, name: 1 }
    );
    let arr = [];
    for (let each of delCat) {
      arr.push(each.name);
    }

    // Calculate the number of items to skip based on the page number
    const skip = (page - 1) * itemsPerPage;

    const products = await Product.find({
      isDeleted: { $in: [false, null] },
      category: { $nin: arr },
    })
      .skip(skip)
      .limit(itemsPerPage);

    const deletedProducts = await Product.find({ isDeleted: true });
    const activeCategories = await categoryCollection.find({
      isDeleted: false,
    });

    const totalProducts = await Product.countDocuments({
      isDeleted: { $in: [false, null] },
      category: { $nin: arr },
    });

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    res.render("user/product", {
      products,
      deletedProducts,
      activeCategories,
      page,
      totalPages, // Pass the total number of pages to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const showProducts = async (req, res) => {
  try {
    const page = req.query.page || 1; // Get the requested page from the query parameter
    const itemsPerPage = 6; // Number of items to display per page

    const delCat = await categoryCollection.find(
      { isDeleted: true },
      { _id: 0, name: 1 }
    );
    let arr = [];
    for (let each of delCat) {
      arr.push(each.name);
    }

    // Calculate the number of items to skip based on the page number
    const skip = (page - 1) * itemsPerPage;

    let products;

    if (req.query.searchQuery) {
      products = await Product.find({
        isDeleted: { $in: [false, null] },
        category: { $nin: arr },
        $or: [
          { name: { $regex: req.query.searchQuery, $options: "i" } },
          { category: { $regex: req.query.searchQuery, $options: "i" } },
        ],
      })
        .skip(skip)
        .limit(itemsPerPage);
    } else {
      products = await Product.find({
        isDeleted: { $in: [false, null] },
        category: { $nin: arr },
      })
        .skip(skip)
        .limit(itemsPerPage);
    }

    const deletedProducts = await Product.find({ isDeleted: true });
    const activeCategories = await categoryCollection.find({
      isDeleted: false,
    });

    const totalProducts = await Product.countDocuments({
      isDeleted: { $in: [false, null] },
      category: { $nin: arr },
    });

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    res.render("user/product", {
      products,
      deletedProducts,
      activeCategories,
      searchQuery: req.query.searchQuery,
      page,
      totalPages, // Pass the total number of pages to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addToCart = async (req, res) => {
  if (req.session.user) {
    const { productId } = req.body;

    const user = await collection.findOne({ email: req.session.user });
    try {
      const existingCartItem = await CartItem.findOne({
        userId: user._id,
        productId,
      });

      if (existingCartItem) {
        existingCartItem.quantity += 1;
        await existingCartItem.save();
      } else {
        const cartItem = await CartItem.create({ userId: user._id, productId });
      }

      res.redirect("/cart");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login");
  }
};

// const viewCart = async (req, res) => {
//   try {
//     if (req.session.user) {
//       const user = await collection.findOne({ email: req.session.user });
//       const cartItems = await CartItem.find({ userId: user._id }).populate(
//         "productId"
//       );

//       const product = await Product.find();

//       let totalPrice = 0;
//       for (const item of cartItems) {
//         totalPrice += item?.productId?.price * item.quantity;
//       }

//       req.session.totalPrice = totalPrice;

//       res.render("user/cart", { cartItems, totalPrice, product });
//     } else {
//       res.redirect("/login");
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

const viewCart = async (req, res) => {
  console.log('show cart');
  try {
    if (req.session.user) {
      console.log('user');
      const user = await collection.findOne({ email: req.session.user });
      const product = await Product.find()
      const coupons = await coupon.find();

      const cartItems = await CartItem.aggregate([
        {
          $match: { userId: user._id }
        },
        {
          $lookup: {
            from: 'products',  
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            productId: '$product._id',
            quantity: 1,  
            price: '$product.price',
            name: '$product.name',
            description: '$product.description',
            image: '$product.image'
          }
        }
      ]);

      // Calculate the total price
      let totalPrice = 0;

      // Iterate through the cart items and calculate the total price
      for (const cartItem of cartItems) {
        totalPrice += cartItem.quantity * cartItem.price;
      }

      req.session.totalPrice = totalPrice;

      res.render('user/cart', { cartItems, totalPrice, user, coupons,product});

    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

 

const updateCartItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const newQuantity = req.body.quantity;

    // Find the cart item by its ID
    const cartItem = await CartItem.findById(itemId).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Find the corresponding product in the product collection
    const product = cartItem.productId;
    const collectionProduct = await Product.findById(product._id);

    if (!collectionProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const collectionProductQuantity = collectionProduct.quantity;

    // Check if the requested quantity exceeds the available quantity
    if (newQuantity > collectionProductQuantity) {
      return res.status(400).json({ message: 'Out Of Stock' });
    }

    // Update the quantity of the cart item
    const itemPrice = product.price;
    cartItem.quantity = newQuantity;
    cartItem.totalPrice = itemPrice * newQuantity;
    const newTotalPrice = cartItem.totalPrice;
    console.log("newTotalPrice:", newTotalPrice);
    // Save the updated cart item
    await cartItem.save();
    req.session.totalPrice = newTotalPrice;
    res.json({ success: true, newQuantity, newTotalPrice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const removeCartItem = async (req, res) => {
  const itemId = req.params.itemId;

  try {
    await CartItem.findByIdAndDelete(itemId);
    res.redirect("/cart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const viewAddress = (req, res) => {
  const userId = req.session.userId;
  res.render("user/address");
};

const storeAddress = async (req, res) => {
  console.log(req.body);
  console.log("req.body");
  const { userName, street, city, state, zip } = req.body;
  const user = await collection.findOne({ email: req.session.user });
  console.log(user);
  try {
    const address = await Address.create({
      userId: user._id,
      userName,
      street,
      city,
      state,
      zip,
    });
    res.redirect("/orderConfirmAll");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server address Error");
  }
};

const displayAddress = async (req, res) => {
  if (req.session.user) {
    try {
      const user = await collection.findOne({ email: req.session.user });
      console.log("b4 user");
      console.log(user);

      const productId = req.params.productId;

      const addresses = await Address.find({ userId: user._id });
      console.log(addresses);
      res.render("user/displayAddress", { addresses, productId });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login");
  }
};

const editAddress = async (req, res) => {
  const addressId = req.params.id;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).send("Address not found");
    }
    console.log(address);
    res.render("user/edit_adress", { address });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const updateAddress = async (req, res) => {
  const addressId = req.params.id;
  const { userName, street, city, state, zip } = req.body;

  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        userName,
        street,
        city,
        state,
        zip,
      },
      { new: true }
    );

    // res.redirect('/displayaddress');
    res.redirect("/displayaddress");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const showPaymentMethod = async (req, res) => {
  try {
    console.log("get");
    updatedTprice = req.session.updatedprice;
    res.render("user/paymentMethod", { updatedTprice });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const showPaymentMethodpost = async (req, res) => {
  try {
    const updatedTprice = req.body.totalPrice;
    console.log(updatedTprice, "kjkhyfhdr");
    req.session.updatedprice = updatedTprice;

    res.redirect("/paymentMethod");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const makePayment = async (req, res) => {
  try {
    console.log("am i here????");
    const { paymentOption, updatedTprice } = req.body;
    // const totalPrice = req.session.totalPrice;
    const addressDetails = req.session.addressDetails;
    const productDetails = req.session.productDetails;
    const userDetails = req.session.userDetails;

    if (!Array.isArray(productDetails)) {
      const order = await Order.create({
        userId: userDetails._id,
        paymentMethod: paymentOption,
        addressId: addressDetails._id,
        products: [{ productId: productDetails._id }],
        totalPrice: productDetails.price,
        orderDate: new Date(),
      });
    }

    const order = await Order.create({
      userId: userDetails._id,
      paymentMethod: paymentOption,
      addressId: addressDetails._id,
      products: productDetails.map((product) => ({
        productId: product.productId._id,
        quantity: product.quantity,
      })),
      totalPrice: updatedTprice,
      orderDate: new Date(),
    });

    res.json({
      success: true,
      message: "Payment successful",
      orderId: order._id,
    });

    res.render("user/confirm");
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const showOrderConfirmation = async (req, res) => {
  try {
    console.log("reached here");
    console.log(req.params);

    const user = await collection.findOne({ email: req.session.user });
    req.session.userDetails = user; // Store user details in session

    const addressId = req.params.addressId;
    const addresses = await Address.findById(addressId);
    req.session.addressDetails = addresses;

    const productId = req.params.productId;
    console.log(productId);
    const product = await Product.findById(productId);
    // console.log(product)
    req.session.productDetails = product;

    res.render("user/orderConfirm", { user, address: addresses, product });
  } catch (error) {
    console.log("testing", error);
    res.status(400).send("Internal Server Error testing");
  }
}; 

const showOrderConfirmationAll = async (req, res) => {
  try {

    console.log("object");
    const user = await collection.findOne({ email: req.session.user });
    req.session.userDetails = user;

    const cartItems = await CartItem.find({ userId: user._id }).populate(
      "productId"
    );
    req.session.productDetails = cartItems;
    const products = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const address = await Address.find({ userId: user._id });
    const totalPrice = req.session.totalPrice;
    const grandTotal=totalPrice;
    const coupons = await coupon.find({ appliedUsers: { $nin: [user._id] } });

    // Check if cartItems is empty
    if (cartItems.length === 0) {
      // Redirect to cart page with alert message
      return res.redirect("/cart?alert=emptyCart");
    }
    

    const grantTotal = totalPrice;
    console.log("user is",user)
    console.log("products is:",products)
    console.log("total pricee",totalPrice)
    console.log("addresses is ",address)
    console.log("coupouns",coupons)
    console.log("grandtotal is:",grantTotal)

    res.render("user/orderConfirmAll", {
      user,
      products,
      totalPrice,
      address,
      coupons,
      grantTotal,
    });
  } catch (error) {
    console.log(error);
    res.render('error') 
 }
};

const getUserOrders = async (req, res) => {
  try {
    if (req.session.user) {
      console.log("here i am ");
      const user = await collection.findOne({ email: req.session.user });
      const userId = user._id;
      const orders = await Order.find({ userId }).populate(
        "products.productId"
      );
      console.log(orders);
      orders.sort((a, b) => b.orderDate - a.orderDate);

      res.render("user/myorders", { orders });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.render('error') 
  }
};


const feedback = (req, res) => {
  const orderId = req.params.orderId;

  const order = {
    orderId: orderId,
  };

  res.render("user/feedback", { order });
};

const confirm = (req, res) => {
  res.render("user/confirm");
};

// const cancelOrder = async (req, res) => {
//   const orderId = req.params.id;
//   console.log("id of the order to cancel", orderId);

//   try {
//     const order = await Order.findById(orderId);

//     if (!order) {
//       throw new Error("Order not found");
//     }

//     // Loop through the products in the order
//     for (const productInfo of order.products) {
//       const productId = productInfo.productId;
//       const quantity = productInfo.quantity;

//       // Find the product and update the quantity
//       const product = await Product.findById(productId);

//       if (!product) {
//         throw new Error(`Product with ID ${productId} not found`);
//       }

//       // Update the quantity of the product
//       product.quantity += quantity;
//       await product.save();
//     }

//     // Update order status to 'Canceled'
//     order.status = "Canceled";
//     await order.save();

//     const user = await collection
//       .findOne({ email: req.session.user })
//       .populate("wallet");

//     if (user) {
//       const totalPrice = order.totalPrice;

//       if (user.wallet) {
//         if (order.paymentMethod !== "cashOnDelivery") {
//           user.wallet.balance += totalPrice;
//         }
//         await user.wallet.save();
//       } else {
//         const newWallet = new Wallet({ balance: totalPrice });
//         await newWallet.save();
//         user.wallet = newWallet;
//       }

//       await user.save();
//     }

//     res.redirect("/myorders");
//   } catch (err) {
//     console.log(err);
//     res.send("internal server error");
//   }
// };


const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  console.log("id of the order to cancel", orderId);

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }
    if (req.method === 'POST') {
      const cancelReason = req.body.cancelReason;
      
      order.cancelReason = cancelReason;
  }
    // Loop through the products in the order
    for (const productInfo of order.products) {
      const productId = productInfo.productId;
      const quantity = productInfo.quantity;

      // Find the product and update the quantity
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Update the quantity of the product
      product.quantity += quantity;
      await product.save();
    }

    // Update order status to 'Canceled'
    order.status = "Canceled";
    await order.save();

    const user = await collection
      .findOne({ email: req.session.user })
      .populate("wallet");

    if (user) {
      const totalPrice = order.totalPrice;

      if (user.wallet) {
        if (order.paymentMethod !== "cashOnDelivery") {
          user.wallet.balance += totalPrice;
        }
        await user.wallet.save();
      } else {
        const newWallet = new Wallet({ balance: totalPrice });
        await newWallet.save();
        user.wallet = newWallet;
      }

      await user.save();
    }

    res.redirect("/myorders");
  } catch (err) {
    console.log(err);
    res.render('error')
  }
};



const submitFeedback = async (req, res) => {
  const { orderId, rating, comment } = req.body;

  const user = await collection.findOne({ email: req.session.user });
  userId = user._id;

  console.log(userId);
  console.log(orderId);
  console.log(rating);
  console.log(comment);

  try {
    const feedback = await Feedback.create({
      userId,
      orderId,
      rating: parseInt(rating),
      comment,
    });

    await feedback.save();

    res.json({ success: true });
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

// const returnOrder = async (req, res) => {
//   const orderId = req.params.id;
//    console.log(orderId);

//   try {
//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       { $set: { isReturned: true } },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.redirect("/myorders");
//   } catch (error) {
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


const returnOrder = async (req, res) => {
  const orderId = req.params.id;
  console.log(orderId);

  try {
      const order = await Order.findById(orderId);

      if (!order) {
          return res.status(404).json({ message: "Order not found" });
      }

      // If it's a POST request, update order with return reason
      if (req.method === 'POST') {
          const returnReason = req.body.returnReason;
          // Validate and handle return reason as needed

          // Update order with return reason
          order.returnReason = returnReason;
      }

      // Update order status to 'Returned'
      order.isReturned = true;
      await order.save();

      res.redirect("/myorders");
  } catch (error) {
    res.render('error') 
  }
};


const profile = async (req, res) => {
  if (req.session.user) {
    try {
      const user = await collection.findOne({ email: req.session.user });
      console.log(user);
      const address = await Address.find({ userId: user._id });
      console.log(address);
      const returnedOrders = await Order.find({
        userId: user._id,
        isReturned: true,
      });

      const userWallet = await Wallet.findById(user.wallet);

      const userId = user._id;
      const orders = await Order.find({ userId }).populate(
        "products.productId"
      );
      orders.sort((a, b) => b.orderDate - a.orderDate);

      const reference = await Reference.findOne({ userId: user._id });

      res.render("user/profile", {
        user,
        address,
        orders,
        userWallet,
        returnedOrders,
        reference,
      });
    } catch (error) {
      console.error(error);
res.render('error')
    }
  } else {
    res.redirect("/login");
  }
};

const getMyReturnsPage = async (req, res) => {
  try {
    const user = await collection.findOne({ email: req.session.user });
    const returnedOrders = await Order.find({
      userId: user._id,
      isReturned: true,
    });
    console.log(returnedOrders);
    res.render("user/MyReturns", { returnedOrders });
  } catch (error) {
    console.error(error);
    res.render('error') 
  }
};

const forgotpassword = (req, res) => {
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

const changepassword = (req, res) => {
  console.log("hek");
  res.render("user/changepassword");
};
 

const changepasswordpost = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  const bcryptednewPass = await passwordcrypt(newPassword)
  try {
    const user = await collection.findOne({ email: req.session.user });
    const result = await bcrypt.compare(req.body.currentPassword, user.password)


    if (user) {
      if (result) {
        await collection.updateOne({ email: req.session.user }, { $set: { password: bcryptednewPass } });
        res.redirect('/profile');
      }
      else {
        // Set error message
        const errorMessage = "Current password is incorrect";
        console.log(errorMessage);
        res.render("user/changepassword", { errorMessage }); // Pass the errorMessage to the template
      }
    } else {
      res.redirect("/login")
    }
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request.");
  }
};

const shop = (req, res) => {
  res.render("user/shop");
};
 



let order;

const processOrder = async (req, res) => {
  try {
    console.log("inside the processOrder function");
    const user = await collection
      .findOne({ email: req.session.user })
      .populate("wallet");
    const userId = user._id;

    const { address, paymentMethod, totalPrice, grantTotal, couponDiscount } =
      req.body;

    console.log(grantTotal);
    console.log(couponDiscount);

    const cartItems = await CartItem.find({ userId: user._id }).populate(
      "productId"
    );

    const products = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    order = new Order({
      userId,
      paymentMethod,
      addressId: address,
      products,
      totalPrice,
      grantTotal,
      couponDiscount,
    });

    if (paymentMethod === "netBanking") {
      var instance = new Razorpay({
        key_id: secret_Id,
        key_secret: secret_Key,
      });

      var options = {
        amount: Math.round(totalPrice * 100), // amount in paise (smallest currency unit)
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error("Razorpay order creation error:", err);
          res
            .status(500)
            .json({ success: false, message: "Error creating Razorpay order" });
        } else {
          res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
          });
        }
      });
    } else if (paymentMethod == "cashOnDelivery") {
      await order.save();

      const cartItems = await CartItem.find({ userId: user._id }).populate(
        "productId"
      );

      const products = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      for (const productInfo of products) {
        const productId = productInfo.productId;
        const quantity = productInfo.quantity;

        // Find the product and update the quantity
        const product = await Product.findById(productId);
        console.log(productId);

        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        // Update the quantity of the product
        product.quantity -= quantity;
        await product.save();
      }

      await CartItem.deleteMany({ userId: user._id });

      await CartItem.deleteMany({ userId: user._id });
      res.json({ success: true, redirectUrl: "/confirm" });
    } 
    
    else if (paymentMethod === "wallet") {

      console.log("hello inside wallet");
      console.log(order.grantTotal);
      console.log(user.wallet.balance);

      if (order.grantTotal <= user.wallet.balance) {
        console.log("inside if");
        await order.save();

        user.wallet.balance -= grantTotal;

        await user.wallet.save();

        const cartItems = await CartItem.find({ userId: user._id }).populate(
          "productId"
        );

        const products = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        for (const productInfo of products) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;

          // Find the product and update the quantity
          const product = await Product.findById(productId);
          console.log(productId);

          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }

          // Update the quantity of the product
          product.quantity -= quantity;
          await product.save();
        }

        await CartItem.deleteMany({ userId: user._id });
console.log("above confirm");
        res.json({ success: true, redirectUrl: "/confirm" });
      } else {
        console.log("inside else");
        // res.json("insufficient balance");
        return res.redirect("/orderConfirmAll")
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while processing the order",
      });
  }
};



const saveOrder = async (req, res) => {
  console.log("the order is :", order);
  await order.save();
 
  console.log("order saved and cart is emptyed");
 
  const user = await collection.findOne({ email: req.session.user });

  console.log("user is :", user);

  const cartItems = await CartItem.find({ userId: user._id }).populate(
    "productId"
  );

  const products = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  for (const productInfo of products) {
    const productId = productInfo.productId;
    const quantity = productInfo.quantity; 
    const product = await Product.findById(productId);
    console.log(productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    // Update the quantity of the product
    product.quantity -= quantity;
    await product.save();
  }

  await CartItem.deleteMany({ userId: user._id });
  res.redirect("/confirm");
};



const orderdetails = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Get orderId from URL parameters

    // Find the order by its ID
    const order = await Order.findById(orderId)
      .populate("products.productId")
      .populate("addressId");
    console.log(order);
    if (!order) {
      return res.status(404).send("Order not found"); // Handle case where order is not found
    }

    // Render the EJS template and pass the order data
    res.render("user/orderdetails", { order });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const applyCoupon = async (req, res) => {
  try {
     
    const couponCode = req.body.couponCode;

    const totalprice = req.body.totalPrice;

    const couponData = await coupon.findOne({ couponName: couponCode });

    console.log(couponData);

    const couponDiscount = Math.floor(
      (totalprice * couponData.couponValue) / 100
    );
    console.log(couponDiscount);
    const grantTotal = totalprice - couponDiscount;

    
    const user = await collection.findOne({ email: req.session.user });
    const userId = user._id;  

    if (!couponData.appliedUsers.includes(userId)) {
      
      couponData.appliedUsers.push(userId);
 
      await couponData.save();
    }

    res.json({ grantTotal, couponDiscount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



const claimReferenceCode = async (req, res) => {
  try {
    const { referenceCode } = req.body;
    const reference = await Reference.findOne({ referenceCode });

    if (!reference) {
      return res.status(400).json({ message: "Invalid reference code" });
    }

    const user = await collection
      .findOne({ email: req.session.user })
      .populate("wallet");

    if (!user) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Check if the reference code has already been used by the current user
    if (reference.usedBy.includes(user._id)) {
      return res.status(400).json({ message: "Reference code already used" });
    }

    // Mark the reference code as used by the current user
    reference.usedBy.push(user._id);
    await reference.save();

    // Increase wallet balances
    if (user.wallet) {
      user.wallet.balance += 100; // Increase user's wallet by 100 rupees
      await user.wallet.save();
    } else {
      const newWallet = new Wallet({ balance: 100 });
      await newWallet.save();
      user.wallet = newWallet;
    }

    // Increase session user's wallet balance
    const referenceuser = await collection
      .findById(reference.userId)
      .populate("wallet");

    if (referenceuser.wallet) {
      referenceuser.wallet.balance += 100; // Increase user's wallet by 100 rupees
      await referenceuser.wallet.save();
    } else {
      const newWallet = new Wallet({ balance: 100 });
      await newWallet.save();
      referenceuser.wallet = newWallet;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Reference code claimed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const downloadInvoice=async (req, res) => {
  try {
    console.log("inside download invoice");
    const orderId = req.params.orderId;
    console.log("order is is:",orderId);
    const order = await Order.findById(orderId).populate('userId').populate('addressId').populate('products.productId');
     console.log("invoice order is :",order);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
     
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// const filterProducts = async (req, res) => {
//   try {
//     const selectedCategory = req.query.category;

//     // Query products based on the selected category
//     const filteredProducts = await Product.find({
//       isDeleted: { $in: [false, null] },
//       category: selectedCategory,
//     }).limit(6); // Limit the number of products per page, adjust as needed

//     // Render the product partial and send it back to the client
//     res.render('partials/productPartial', { products: filteredProducts }, (err, html) => {
//       if (err) {
//         console.error('Error rendering product partial:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         res.send(html);
//       }
//     });
//   } catch (error) {
//     console.error('Error filtering products:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };


// const filterProducts = async (req, res) => {
//   try {
//     const selectedCategory = req.query.category;
//     const searchQuery = req.query.searchQuery;
//     const page = req.query.page || 1;
//     const itemsPerPage = 6;

//     let filter = {
//       isDeleted: { $in: [false, null] },
//     };

//     if (selectedCategory) {
//       filter.category = selectedCategory;
//     }

//     if (searchQuery) {
//       filter.$or = [
//         { name: { $regex: searchQuery, $options: 'i' } },
//         { category: { $regex: searchQuery, $options: 'i' } },
//       ];
//     }

//     const totalProducts = await Product.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / itemsPerPage);

//     const skip = (page - 1) * itemsPerPage;

//     const filteredProducts = await Product.find(filter)
//       .skip(skip)
//       .limit(itemsPerPage);

//     // Render the product partial and send it back to the client
//     res.render('partials/productPartial', { products: filteredProducts }, (err, productHtml) => {
//       if (err) {
//         console.error('Error rendering product partial:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         // Render the pagination partial and send it back to the client
//         res.render('partials/paginationPartial', { page, totalPages }, (err, paginationHtml) => {
//           if (err) {
//             console.error('Error rendering pagination partial:', err);
//             res.status(500).send('Internal Server Error');
//           } else {
//             res.json({ products: productHtml, pagination: paginationHtml });
//           }
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error filtering products:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };

const filterProducts = async (req, res) => {
  try {
    const selectedCategory = req.query.category;
    const searchQuery = req.query.searchQuery;
    const priceRange = req.query.priceRange; // Add this line to get the selected price range
    const page = req.query.page || 1;
    const itemsPerPage = 6;

    let filter = {
      isDeleted: { $in: [false, null] },
    };

    if (selectedCategory) {
      filter.category = selectedCategory;
    }

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    if (priceRange) {
      // Handle the selected price range
      switch (priceRange) {
        case 'below500':
          filter.price = { $lt: 500 };
          break;
        case '500-1000':
          filter.price = { $gte: 500, $lte: 1000 };
          break;
        case '1000-2000':
          filter.price = { $gte: 1000, $lte: 2000 };
          break;
        case 'above2000':
          filter.price = { $gt: 2000 };
          break;
      }
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const skip = (page - 1) * itemsPerPage;

    // Only fetch products for the current page, not all products
    const filteredProducts = await Product.find(filter)
      .skip(skip)
      .limit(itemsPerPage);

    // Render the product partial and send it back to the client
    res.render('partials/productPartial', { products: filteredProducts }, (err, productHtml) => {
      if (err) {
        console.error('Error rendering product partial:', err);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the pagination partial and send it back to the client
        res.render('partials/paginationPartial', { page, totalPages }, (err, paginationHtml) => {
          if (err) {
            console.error('Error rendering pagination partial:', err);
            res.status(500).send('Internal Server Error');
          } else {
            res.json({ products: productHtml, pagination: paginationHtml });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).send('Internal Server Error');
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
  displayProducts,
  viewProductDetails,
  showProducts,
  addToCart,
  viewCart,
  updateCartItem,
  removeCartItem,
  viewAddress,
  storeAddress,
  displayAddress,
  editAddress,
  updateAddress,
  showPaymentMethod,
  makePayment,
  showOrderConfirmation,
  showPaymentMethodpost,
  showOrderConfirmationAll,
  getUserOrders,
  feedback,
  cancelOrder,
  returnOrder,
  submitFeedback,
  confirm,
  wallet,
  profile,
  getMyReturnsPage,
  forgotpassword,
  forgotpasswordpost,
  changepassword,
  changepasswordpost,
  shop,
  processOrder,
  orderdetails,
  applyCoupon,
  claimReferenceCode,
  saveOrder,
  downloadInvoice,
  filterProducts
};
