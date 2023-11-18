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

const banner = require('../models/banner');
const admincontroller=require("../controllers/admincontroller")
const adminauthenticaton = require("../middlewares/adminAuthentication")









router.get('/login',admincontroller.login)
router.post('/loginpost',admincontroller.loginpost)
router.get("/chartData",adminauthenticaton.adminauthenticaton,admincontroller.chart)
 
router.get('/dashboard',adminauthenticaton.adminauthenticaton,adminauthenticaton.adminauthenticaton,admincontroller.dashboard)
router.get('/adminlogout',adminauthenticaton.adminauthenticaton,admincontroller.adminlogout)
router.get('/userDetails',adminauthenticaton.adminauthenticaton,adminauthenticaton.adminauthenticaton, admincontroller.userDetails);
router.post('/blockUser/:id',adminauthenticaton.adminauthenticaton, admincontroller.blockUser);
router.post('/unblockUser/:id',adminauthenticaton.adminauthenticaton, admincontroller.unblockUser);
router.get('/addproduct',adminauthenticaton.adminauthenticaton,admincontroller.addproduct)
router.post('/addproductpost',adminauthenticaton.adminauthenticaton, upload.fields([{
    name: 'image', maxCount: 1
  }, {
    name: 'additionalImages', maxCount: 4
  }]), admincontroller.addproductpost);
router.get('/showproducts',adminauthenticaton.adminauthenticaton, admincontroller.showProducts);
 

router.get('/editproduct/:id',adminauthenticaton.adminauthenticaton, admincontroller.editProduct);
router.post('/editproductpost/:id',adminauthenticaton.adminauthenticaton, upload.fields([{
    name: 'image', maxCount: 1
  }, {
    name: 'additionalImages', maxCount: 4
  }]), admincontroller.updateProduct);
// router.post('/softdeleteproduct/:id', admincontroller.softDeleteProduct);
router.get('/categorymanagement',adminauthenticaton.adminauthenticaton,admincontroller.categoryManagement);
router.get('/deletecategory/:id',adminauthenticaton.adminauthenticaton, admincontroller.deleteCategory);

router.get('/addcategoryform',adminauthenticaton.adminauthenticaton,admincontroller.showAddCategoryForm);
router.post('/addcategory', adminauthenticaton.adminauthenticaton,admincontroller.addCategory)
router.get('/editcategory/:id', adminauthenticaton.adminauthenticaton,admincontroller.editCategory);
router.post('/editcategorypost/:id', adminauthenticaton.adminauthenticaton,admincontroller.editCategoryPost);
//  might
router.post('/toggleproductavailability/:id', adminauthenticaton.adminauthenticaton,admincontroller.toggleProductAvailability);
router.get('/OrderManagement',adminauthenticaton.adminauthenticaton,admincontroller.showOrderManagement)
//  router.post('/updateOrderStatus', admincontroller.updateOrderStatus);
router.post("/updateOrderStatus/:orderId/:newStatus",adminauthenticaton.adminauthenticaton,admincontroller.updateOrderStatus)

router.post('/acceptreturn',adminauthenticaton.adminauthenticaton,admincontroller.acceptreturn) 
router.post('/rejectreturn',adminauthenticaton.adminauthenticaton,admincontroller.rejectreturn) 
router.get('/sendCategoryOffer', adminauthenticaton.adminauthenticaton,admincontroller.sendCategoryOffer);
 
router.get("/viewdetails/:orderId", adminauthenticaton.adminauthenticaton,admincontroller.viewdetails);
router.get("/coupons", adminauthenticaton.adminauthenticaton,admincontroller.getCoupon);
router.get("/addCoupons",adminauthenticaton.adminauthenticaton,admincontroller.getaddCoupon)
router.post("/addCoupons",adminauthenticaton.adminauthenticaton,admincontroller.addCoupon)
router.get('/delete-coupon/:couponId',adminauthenticaton.adminauthenticaton, admincontroller.deleteCoupon);
router.post('/applyOffer',adminauthenticaton.adminauthenticaton, admincontroller.applyOffer);
router.get('/charts',adminauthenticaton.adminauthenticaton, admincontroller.charts);

//banner
router.get('/banners',adminauthenticaton.adminauthenticaton, admincontroller.getbanner);
router.get('/addBanner',adminauthenticaton.adminauthenticaton, admincontroller.addBanner);
router.post('/addBanner',adminauthenticaton.adminauthenticaton, upload.single('image'), admincontroller.addBannerPost);
router.post('/deleteBanner/:id', adminauthenticaton.adminauthenticaton,admincontroller.deleteBanner); // Add this line


//error
router.get('/error',admincontroller.getError)
 

 

module.exports = router;

