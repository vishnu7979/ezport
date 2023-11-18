var express = require('express');
var router = express.Router();

const usercontroller=require("../controllers/usercontroller")
const userauthentication=require('../middlewares/userAuthentication')



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
router.get('/showproducts',usercontroller.showProducts)
router.get('/user/products', usercontroller.displayProducts);

router.get('/product/:id', usercontroller.viewProductDetails);

router.post('/addtocart',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.addToCart);
router.get('/cart',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.viewCart);
router.post('/cart/update/:itemId',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.updateCartItem);
router.post('/cart/remove/:itemId',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.removeCartItem);
router.get('/address',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.viewAddress);
router.post('/storeaddress',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.storeAddress);
router.get('/displayaddress',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.displayAddress);

router.get('/displayaddress/:productId',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.displayAddress);
router.get('/editaddress/:id',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.editAddress);
router.post('/updateaddress/:id',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.updateAddress);
router.get('/paymentmethod',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.showPaymentMethod);
router.post('/paymentmethod',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.showPaymentMethodpost);

// router.post('/makepayment', usercontroller.makePayment);

// router.get('/orderconfirm/:addressId/:productId', usercontroller.showOrderConfirmation);
router.get('/orderConfirmAll',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.showOrderConfirmationAll);
router.get('/myorders', userauthentication.userauthentication,userauthentication.isBlock, usercontroller.getUserOrders);
// router.get('/feedback', usercontroller.feedback);
router.get('/feedback/:orderId', userauthentication.userauthentication,userauthentication.isBlock,usercontroller.feedback);

router.get('/profile',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.profile);
router.get('/myreturns',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.getMyReturnsPage);
router.post('/claimReference',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.claimReferenceCode);

router.post('/submitFeedback',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.submitFeedback);

router.get('/forgotpassword',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.forgotpassword);
router.post('/forgotpasswordpost',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.forgotpasswordpost);

router.get('/confirm',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.confirm);

router.get('/changepassword',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.changepassword);
router.post('/changepasswordpost',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.changepasswordpost);

router.get('/shop',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.shop);
router.get('/orderdetails/:orderId',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.orderdetails);

router.post('/cancelorder/:id',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.cancelOrder);
router.post('/returnOrder/:id',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.returnOrder);

router.post("/applyCoupon",userauthentication.userauthentication,userauthentication.isBlock, usercontroller.applyCoupon)

router.post('/processOrder', userauthentication.userauthentication,userauthentication.isBlock,usercontroller.processOrder);
router.post('/saveOrder',userauthentication.userauthentication,userauthentication.isBlock,usercontroller.saveOrder)

router.get('/downloadInvoice/:orderId',userauthentication.userauthentication,userauthentication.isBlock,usercontroller.downloadInvoice)
 
router.get('/filterproducts',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.filterProducts);

router.get('/wallethistory', userauthentication.userauthentication,userauthentication.isBlock,usercontroller.wallethistory)





module.exports = router;