var express = require('express');
var router = express.Router();

const usercontroller=require("../controllers/usercontroller")
const bannercontroller=require('../controllers/bannercontroller')
const categorycontroller=require('../controllers/categorycontroller')
const ordercontroller=require('../controllers/ordercontroller')
const productcontroller=require('../controllers/productcontroller')
const couponcontroller=require('../controllers/couponcontroller')
const cartcontroller=require('../controllers/cartcontroller')
const offercontroller=require('../controllers/offercontroller')
const walletcontroller=require('../controllers/walletcontroller')
const addresscontroller=require('../controllers/addresscontroller')
const profilecontroller=require('../controllers/profilecontroller')

const userauthentication=require('../middlewares/userAuthentication')



//user
router.get('/',usercontroller.landing)
router.get('/login',usercontroller.login)
router.get('/products',usercontroller.products)
router.get('/clients',userauthentication.userauthentication,userauthentication.isBlock,usercontroller.clients)
router.get('/contact',userauthentication.userauthentication,userauthentication.isBlock,usercontroller.contact)
router.get('/signup',usercontroller.signup)
router.get('/wallet',userauthentication.userauthentication,userauthentication.isBlock,usercontroller.wallet)
router.post('/signuppost',usercontroller.signuppost)
router.post('/loginpost',usercontroller.loginpost)
router.get('/logout',userauthentication.userauthentication,userauthentication.isBlock,usercontroller.logout)
router.post('/verifyOTP', usercontroller.verifyOTP);
router.post('/resendOTP', usercontroller.resendOTP);
router.get('/shop',  usercontroller.shop);
router.get('/forgotpassword',  usercontroller.forgotpassword);
router.post('/forgotpasswordpost',usercontroller.forgotpasswordpost);



//products
router.get('/showproducts',productcontroller.showProductss)
router.get('/user/products', productcontroller.displayProducts);
router.get('/product/:id', productcontroller.viewProductDetails);
router.get('/filterproducts',productcontroller.filterProducts);


//cart
router.post('/addtocart',userauthentication.userauthentication,userauthentication.isBlock, cartcontroller.addToCart);
router.get('/cart',userauthentication.userauthentication,userauthentication.isBlock, cartcontroller.viewCart);
router.post('/cart/update/:itemId',userauthentication.userauthentication,userauthentication.isBlock, cartcontroller.updateCartItem);
router.post('/cart/remove/:itemId',userauthentication.userauthentication,userauthentication.isBlock, cartcontroller.removeCartItem);


//address
router.get('/address',userauthentication.userauthentication,userauthentication.isBlock, addresscontroller.viewAddress);
router.post('/storeaddress',userauthentication.userauthentication,userauthentication.isBlock, addresscontroller.storeAddress);
router.get('/displayaddress',userauthentication.userauthentication,userauthentication.isBlock, addresscontroller.displayAddress);
router.get('/displayaddress/:productId',userauthentication.userauthentication,userauthentication.isBlock, addresscontroller.displayAddress);
router.get('/editaddress/:id',userauthentication.userauthentication,userauthentication.isBlock, addresscontroller.editAddress);
router.post('/updateaddress/:id',userauthentication.userauthentication,userauthentication.isBlock, addresscontroller.updateAddress);



//order
router.get('/downloadInvoice/:orderId',userauthentication.userauthentication,userauthentication.isBlock,ordercontroller.downloadInvoice)
router.get('/orderConfirmAll',userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.showOrderConfirmationAll);
router.get('/myorders', userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.getUserOrders);
router.get('/feedback/:orderId', userauthentication.userauthentication,userauthentication.isBlock,ordercontroller.feedback);
router.get('/myreturns',userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.getMyReturnsPage);
router.get('/orderdetails/:orderId',userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.orderdetails);
router.post('/cancelorder/:id',userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.cancelOrder);
router.post('/returnOrder/:id',userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.returnOrder);
router.post('/processOrder', userauthentication.userauthentication,userauthentication.isBlock,ordercontroller.processOrder);
router.post('/saveOrder',userauthentication.userauthentication,userauthentication.isBlock,ordercontroller.saveOrder)
router.get('/confirm',userauthentication.userauthentication,userauthentication.isBlock, ordercontroller.confirm);


//profile
router.get('/profile',userauthentication.userauthentication,userauthentication.isBlock, profilecontroller.profile);
router.post('/submitFeedback',userauthentication.userauthentication,userauthentication.isBlock, profilecontroller.submitFeedback);
router.get('/changepassword',userauthentication.userauthentication,userauthentication.isBlock, profilecontroller.changepassword);
router.post('/changepasswordpost',userauthentication.userauthentication,userauthentication.isBlock, profilecontroller.changepasswordpost);
router.get("/editProfile",userauthentication.isBlock,userauthentication.userauthentication,profilecontroller.getEditProfile)
router.post("/editProfile/:id",userauthentication.isBlock,userauthentication.userauthentication,profilecontroller.getEditProfilePost)

//offer
router.post('/claimReference',userauthentication.userauthentication,userauthentication.isBlock, offercontroller.claimReferenceCode);
router.post("/applyCoupon",userauthentication.userauthentication,userauthentication.isBlock, offercontroller.applyCoupon)
router.post("/removeCoupon",userauthentication.isBlock,userauthentication.userauthentication, offercontroller.removeCoupon)

//wallet
router.get('/wallethistory', userauthentication.userauthentication,userauthentication.isBlock,walletcontroller.wallethistory)
 
module.exports = router;