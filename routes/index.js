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


router.get('/login',admincontroller.login)
router.post('/loginpost',admincontroller.loginpost)
router.get("/chartData",admincontroller.chart)
 
router.get('/dashboard',admincontroller.dashboard)
router.get('/adminlogout',admincontroller.adminlogout)
router.get('/userDetails', admincontroller.userDetails);
router.post('/blockUser/:id', admincontroller.blockUser);
router.post('/unblockUser/:id', admincontroller.unblockUser);
router.get('/addproduct',admincontroller.addproduct)
router.post('/addproductpost', upload.fields([{
    name: 'image', maxCount: 1
  }, {
    name: 'additionalImages', maxCount: 4
  }]), admincontroller.addproductpost);
router.get('/showproducts', admincontroller.showProducts);
 

router.get('/editproduct/:id', admincontroller.editProduct);
router.post('/editproductpost/:id', upload.fields([{
    name: 'image', maxCount: 1
  }, {
    name: 'additionalImages', maxCount: 4
  }]), admincontroller.updateProduct);
// router.post('/softdeleteproduct/:id', admincontroller.softDeleteProduct);
router.get('/categorymanagement',admincontroller.categoryManagement);
router.get('/deletecategory/:id', admincontroller.deleteCategory);

router.get('/addcategoryform',admincontroller.showAddCategoryForm);
router.post('/addcategory', admincontroller.addCategory)
router.get('/editcategory/:id', admincontroller.editCategory);
router.post('/editcategorypost/:id', admincontroller.editCategoryPost);
//  might
router.post('/toggleproductavailability/:id', admincontroller.toggleProductAvailability);
router.get('/OrderManagement',admincontroller.showOrderManagement)
//  router.post('/updateOrderStatus', admincontroller.updateOrderStatus);
router.post("/updateOrderStatus/:orderId/:newStatus",admincontroller.updateOrderStatus)

router.post('/acceptreturn',admincontroller.acceptreturn) 
router.post('/rejectreturn',admincontroller.rejectreturn) 
router.get('/sendCategoryOffer', admincontroller.sendCategoryOffer);
 
router.get("/viewdetails/:orderId", admincontroller.viewdetails);
router.get("/coupons", admincontroller.getCoupon);
router.get("/addCoupons",admincontroller.getaddCoupon)
router.post("/addCoupons",admincontroller.addCoupon)
router.get('/delete-coupon/:couponId', admincontroller.deleteCoupon);
router.post('/applyOffer', admincontroller.applyOffer);
router.get('/charts', admincontroller.charts);
router.get('/banners', admincontroller.getbanner);
router.get('/addBanner', admincontroller.addBanner);
router.post('/addBanner', upload.single('image'), admincontroller.addBannerPost);
router.post('/deleteBanner/:id', admincontroller.deleteBanner); // Add this line

 

 

module.exports = router;

