var express = require('express');
var router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Set the destination folder for uploaded files (create the 'uploads' folder)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Set a unique file name for each uploaded file
    }
});
const upload = multer({ storage: storage });



const admincontroller=require("../controllers/admincontroller")
const bannercontroller=require('../controllers/bannercontroller')
const categorycontroller=require('../controllers/categorycontroller')
const ordercontroller=require('../controllers/ordercontroller')
const productcontroller=require('../controllers/productcontroller')
const couponcontroller=require('../controllers/couponcontroller')
const chartcontroller=require('../controllers/chartcontroller')
const offercontroller=require('../controllers/offercontroller')

const adminauthenticaton = require("../middlewares/adminAuthentication")

 
//admin
router.get('/login',admincontroller.login)
router.post('/loginpost',admincontroller.loginpost)
router.get('/dashboard',adminauthenticaton.adminauthenticaton,adminauthenticaton.adminauthenticaton,admincontroller.dashboard)
router.get('/adminlogout',adminauthenticaton.adminauthenticaton,admincontroller.adminlogout)




//user
router.get('/userDetails',adminauthenticaton.adminauthenticaton,adminauthenticaton.adminauthenticaton, admincontroller.userDetails);
router.post('/blockUser/:id',adminauthenticaton.adminauthenticaton, admincontroller.blockUser);
router.post('/unblockUser/:id',adminauthenticaton.adminauthenticaton, admincontroller.unblockUser);




//product
router.get('/addproduct',adminauthenticaton.adminauthenticaton,productcontroller.addproduct)
router.post('/addproductpost',adminauthenticaton.adminauthenticaton, upload.fields([{
  name: 'image', maxCount: 1
}, {
  name: 'additionalImages', maxCount: 4
}]), productcontroller.addproductpost);
router.get('/showproducts',adminauthenticaton.adminauthenticaton, productcontroller.showProducts);
router.get('/editproduct/:id',adminauthenticaton.adminauthenticaton, productcontroller.editProduct);
router.post('/editproductpost/:id',adminauthenticaton.adminauthenticaton, upload.fields([{
  name: 'image', maxCount: 1
}, {
  name: 'additionalImages', maxCount: 4
}]), productcontroller.updateProduct);





//category 
router.get('/categorymanagement',adminauthenticaton.adminauthenticaton,categorycontroller.categoryManagement);
router.get('/deletecategory/:id',adminauthenticaton.adminauthenticaton, categorycontroller.deleteCategory);
router.get('/addcategoryform',adminauthenticaton.adminauthenticaton,categorycontroller.showAddCategoryForm);
router.post('/addcategory', adminauthenticaton.adminauthenticaton,categorycontroller.addCategory)
router.get('/editcategory/:id', adminauthenticaton.adminauthenticaton,categorycontroller.editCategory);
router.post('/editcategorypost/:id', adminauthenticaton.adminauthenticaton,categorycontroller.editCategoryPost);
 




//order
router.post('/acceptreturn',adminauthenticaton.adminauthenticaton,ordercontroller.acceptreturn) 
router.post('/rejectreturn',adminauthenticaton.adminauthenticaton,ordercontroller.rejectreturn) 
router.get('/OrderManagement',adminauthenticaton.adminauthenticaton,ordercontroller.showOrderManagement)
router.get("/viewdetails/:orderId", adminauthenticaton.adminauthenticaton,ordercontroller.viewdetails);
router.post("/updateOrderStatus/:orderId/:newStatus",adminauthenticaton.adminauthenticaton,ordercontroller.updateOrderStatus)
router.post('/toggleproductavailability/:id', adminauthenticaton.adminauthenticaton,ordercontroller.toggleProductAvailability);





//coupons 
router.get("/coupons", adminauthenticaton.adminauthenticaton, couponcontroller.getCoupon);
router.get("/addCoupons",adminauthenticaton.adminauthenticaton,couponcontroller.getaddCoupon)
router.post("/addCoupons",adminauthenticaton.adminauthenticaton,couponcontroller.addCoupon)
router.get('/delete-coupon/:couponId',adminauthenticaton.adminauthenticaton, couponcontroller.deleteCoupon);





//offer
router.post('/applyOffer',adminauthenticaton.adminauthenticaton, offercontroller.applyOffer);
router.get('/sendCategoryOffer', adminauthenticaton.adminauthenticaton,offercontroller.sendCategoryOffer);





//charts
router.get('/charts',adminauthenticaton.adminauthenticaton, chartcontroller.charts);
router.get("/chartData",adminauthenticaton.adminauthenticaton,chartcontroller.chart)





//banner
router.get('/banners',adminauthenticaton.adminauthenticaton, bannercontroller.getbanner);
router.get('/addBanner',adminauthenticaton.adminauthenticaton, bannercontroller.addBanner);
router.post('/addBanner',adminauthenticaton.adminauthenticaton, upload.single('image'), bannercontroller.addBannerPost);
router.post('/deleteBanner/:id', adminauthenticaton.adminauthenticaton,bannercontroller.deleteBanner);  





//error
router.get('/error',admincontroller.getError)
 

 

module.exports = router;

