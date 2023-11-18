var express = require('express');
var router = express.Router();

const usercontroller=require("../controllers/usercontroller")
const userauthentication=require('../middlewares/userAuthentication')



router.get('/',usercontroller.landing)
router.get('/login',usercontroller.login)
router.get('/products',usercontroller.products)
router.get('/clients',usercontroller.clients)
router.get('/contact',usercontroller.contact)
router.get('/signup',usercontroller.signup)
router.get('/wallet',usercontroller.wallet)
router.post('/signuppost',usercontroller.signuppost)
router.post('/loginpost',usercontroller.loginpost)
router.get('/logout',usercontroller.logout)
router.post('/verifyOTP', usercontroller.verifyOTP);
router.post('/resendOTP', usercontroller.resendOTP);
router.get('/showproducts',usercontroller.showProducts)
router.get('/user/products', usercontroller.displayProducts);

router.get('/product/:id', usercontroller.viewProductDetails);

router.post('/addtocart', usercontroller.addToCart);
router.get('/cart', usercontroller.viewCart);
router.post('/cart/update/:itemId', usercontroller.updateCartItem);
router.post('/cart/remove/:itemId', usercontroller.removeCartItem);
router.get('/address', usercontroller.viewAddress);
router.post('/storeaddress', usercontroller.storeAddress);
router.get('/displayaddress', usercontroller.displayAddress);

router.get('/displayaddress/:productId', usercontroller.displayAddress);
router.get('/editaddress/:id', usercontroller.editAddress);
router.post('/updateaddress/:id', usercontroller.updateAddress);
router.get('/paymentmethod', usercontroller.showPaymentMethod);
router.post('/paymentmethod', usercontroller.showPaymentMethodpost);

router.post('/makepayment', usercontroller.makePayment);

router.get('/orderconfirm/:addressId/:productId', usercontroller.showOrderConfirmation);
router.get('/orderConfirmAll', usercontroller.showOrderConfirmationAll);
router.get('/myorders', usercontroller.getUserOrders);
// router.get('/feedback', usercontroller.feedback);
router.get('/feedback/:orderId', usercontroller.feedback);

router.get('/profile',userauthentication.userauthentication,userauthentication.isBlock, usercontroller.profile);
router.get('/myreturns', usercontroller.getMyReturnsPage);
router.post('/claimReference', usercontroller.claimReferenceCode);

router.post('/submitFeedback', usercontroller.submitFeedback);

router.get('/forgotpassword', usercontroller.forgotpassword);
router.post('/forgotpasswordpost', usercontroller.forgotpasswordpost);

router.get('/confirm', usercontroller.confirm);

router.get('/changepassword', usercontroller.changepassword);
router.post('/changepasswordpost', usercontroller.changepasswordpost);

router.get('/shop', usercontroller.shop);
router.get('/orderdetails/:orderId', usercontroller.orderdetails);

router.post('/cancelorder/:id', usercontroller.cancelOrder);
router.post('/returnOrder/:id', usercontroller.returnOrder);

router.post("/applyCoupon", usercontroller.applyCoupon)

router.post('/processOrder', usercontroller.processOrder);
router.post('/saveOrder',usercontroller.saveOrder)

router.get('/downloadInvoice/:orderId',usercontroller.downloadInvoice)
 
router.get('/filterproducts', usercontroller.filterProducts);

router.get('/wallethistory',usercontroller.wallethistory)





module.exports = router;