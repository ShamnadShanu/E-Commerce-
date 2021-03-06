var express = require('express');
var router = express.Router();
let productHelpers = require('../helpers/producthelpers');
var userHelpers = require('../helpers/userHelpers');
const adminHelpers = require('../helpers/adminHelpers')
const moment = require("moment");
var base64ToImage = require('base64-to-image');

const collections = require('../config/collections');
const isImageURL = require('image-url-validator').default;
const { response } = require('express');
const { TodayInstance } = require('twilio/lib/rest/api/v2010/account/usage/record/today');

var verifyloggin = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  if (req.session.adminLoggedin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}


/* GET users listing. */
router.get('/', verifyloggin, async (req, res, next) => {
  let shipped = await adminHelpers.getallShiped()
  let Delivered = await adminHelpers.getAlldelivered()
  let Placed = await adminHelpers.getAllplaced()
  let Orders = await adminHelpers.getAllOrders()
  let Users = await adminHelpers.getAlluser()
  Users=Users.lenght
  res.render('admin/index', { Admin: true, Users, Orders, Placed, Delivered, shipped })
});
router.get('/login', (req, res) => {
  if (req.session.adminLoggedin) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { adminError: req.session.adminError })
    req.session.adminError = false
  }
});
router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedin = true
      res.redirect('/admin')
    } else {
      console.log('rejected');
      req.session.adminError = 'invalid username or password'
      res.redirect('/admin/login')
    }
  })
});
router.get('/allproducts', verifyloggin, function (req, res, next) {
  productHelpers.getAllproductsad().then((Data) => {
    res.render('admin/allproducts', { Category: req.session.Category, Admin: true, Data })
  })
});
router.get('/allusers', verifyloggin, (req, res) => {
  adminHelpers.getAlluser().then((response) => {
    let Users=response.User
    console.log(Users);
    res.render('admin/allusers', { Admin: true,Users})
  })
});
router.get('/addproducts', verifyloggin, (req, res) => {
  if (req.session.wrong) {
    res.render('admin/addproducts', {wrong: req.session.wrong, Admin: true })
    req.session.wrong = false
  }
  productHelpers.getAll().then((categories) => {
    console.log('vzf');
    console.log(categories);
    res.render('admin/addproducts', { Admin: true, categories })
  })
})
router.post('/addproducts', (req, res) => {
  console.log(req.files.Image);
  productHelpers.addproduct(req.body).then(async (id) => {
    

    var base64Str1 = req.body.base1
    console.log('hihi');
    var path = "./public/productImages/";
    var optionalObj = { fileName: id, type: "jpg" };
    base64ToImage(base64Str1, path, optionalObj);

    var base64Str2 = req.body.base2
    var path = "./public/productImages/";
    var optionalObj = { fileName: id+'1', type: "jpg" };
    base64ToImage(base64Str2, path, optionalObj);

    var base64Str3 = req.body.base3
    var path = "./public/productImages/";
    var optionalObj = { fileName: id+'2', type: "jpg" };
    base64ToImage(base64Str3, path, optionalObj);

    // Image.mv('./public/productImages/'+id+'.jpg',(err,done)=>{
    //   Image1.mv('./public/productImages/'+id+1+'.jpg',(err,done)=>{
    //     Image2.mv('./public/productImages/'+id+2+'.jpg',(err,done)=>{
    //       if(!err){
    //         res.redirect('/admin/allproducts')
    //       }else{
    //         res.redirect('/admin/addproducts')
    //         req.session.wrong='something wrong please try again'
    //       }
    //     })
    //   })
    // })
    res.redirect('/admin/allproducts')


  })
});
router.get('/removeproduct/:id', verifyloggin, (req, res) => {
  let Data = req.params.id
  productHelpers.removeProduct(Data).then(() => {
    res.redirect('/admin/allproducts')
  })
});
router.get('/removeuser/:id', verifyloggin, (req, res) => {
  let Data = req.params.id
  userHelpers.removeUser(Data).then(() => {
    res.redirect('/admin/allusers')
  })

});
router.get('/editproduct/:id', verifyloggin, (req, res) => {
  productHelpers.getOneproduct(req.params.id).then((product) => {
    res.render('admin/editproduct', { product, Admin: true })
  })
})
router.post('/editproduct/:id', (req, res) => {
  let product = req.params.id
  productHelpers.editProduct(product, req.body).then((id) => {
     

    var base64Str1 = req.body.base1
    console.log('hihi');
    var path = "./public/productImages/";
    var optionalObj = { fileName: id, type: "jpg" };
    base64ToImage(base64Str1, path, optionalObj);

    var base64Str2 = req.body.base2
    var path = "./public/productImages/";
    var optionalObj = { fileName: id+'1', type: "jpg" };
    base64ToImage(base64Str2, path, optionalObj);

    var base64Str3 = req.body.base3
    var path = "./public/productImages/";
    var optionalObj = { fileName: id+'2', type: "jpg" };
    base64ToImage(base64Str3, path, optionalObj);
    res.redirect('/admin/allproducts')


   
  })
});
router.get('/blockuser/:id', verifyloggin, (req, res) => {
  userHelpers.blockUser(req.params.id).then(() => {
    console.log(req.params.id);
    res.redirect('/admin/allusers')
  })
});
router.get('/unblockuser/:id', verifyloggin, (req, res) => {
  userHelpers.unblockUser(req.params.id).then(() => {
    res.redirect('/admin/allusers')
  })
})
router.get('/logout', (req, res) => {
  req.session.adminLoggedin = false
  res.redirect('/admin')
});
router.get('/add_category', verifyloggin, (req, res) => {
  res.render('admin/addcategory'
    , { Admin: true })
});
router.post('/add_category', (req, res) => {
  console.log(req.body);
  productHelpers.add_category(req.body).then((data) => {
    res.redirect('/admin/categories')
  })
});
router.get('/add_subcategory', verifyloggin, (req, res) => {
  productHelpers.getAll().then((categories) => {
    res.render('admin/addsubcategory', { Admin: true, categories })
  })
});
router.post('/add_sub', (req, res) => {
  console.log(req.body);
  productHelpers.add_subCategory(req.body).then(() => {
    res.redirect('/admin/categories')
  })
});
router.get('/delete_category/:id', (req, res) => {
  productHelpers.deleteCategory(req.params.id).then(() => {
    res.redirect('/admin/categories')
  })
});
router.get('/edit_category/:id', verifyloggin, (req, res) => {
  console.log('hai');
  console.log(req.params.id);
  productHelpers.getOnecategory(req.params.id).then((result) => {
    console.log(result);
    res.render('admin/editcategory', { Admin: true, result })
  })
})
router.post('/edit_category/:id', (req, res) => {
  productHelpers.editCategory(req.params.id, req.body).then(() => {
    res.redirect('/admin/categories')
  })
})
router.get('/delete_subcategory/:id', (req, res) => {
  productHelpers.deletesubCategory(req.params.id).then(() => {
    res.redirect('/admin/categories')
  })
});

router.get('/categories', verifyloggin, (req, res) => {
  productHelpers.getAll().then(async (categories) => {
    if (categories[0]) {
      let Category = categories
      let sub = Category[0].sub_category;
      console.log(Category);
      console.log(sub);
      res.render('admin/categories', { Admin: true, Category, sub })

    } else {
      res.render('admin/categories', { Admin: true })

    }

  })
  // productHelpers.getAllcatrgories().then((category)=>{
  //   res.render('admin/categories',{Admin:true,category})
  // })
});
router.get('/all-orders', verifyloggin, (req, res) => {
  adminHelpers.AllOrders().then((orders) => {
    console.log(orders);
    res.render('admin/all-orders', { Admin: true, orders })
  })
});

router.post("/changeStatus", (req, res) => {
  adminHelpers.changeOrderStatus(req.body).then((response) => {
    adminHelpers
      .getOrderId(req.body.id)
      .then((order) => {
        res.json({ order });
      })
      .catch(() => {
        console.log("err");
      });
  });
});




router.get('/Salesreport',verifyloggin, async(req, res) => {
  adminHelpers.allOrders().then(async (data) => {
    var userName = await adminHelpers.getUsername(data)
    console.log(data);


    res.render('admin/salesReport', { Admin: true, data, userName })

  })
})
router.post("/salesReport",verifyloggin, (req, res) => {
  console.log(req.body);
  var start = moment(req.body.start).format("L");
  var end = moment(req.body.end).format("L");
  adminHelpers.salesReport(start, end).then((response) => {
    console.log(response);
    let data=response
res.render('admin/salesReport',{
  Admin:true,data})  });
});
router.post('/addOffer',verifyloggin,(req,res)=>{
  console.log(req.body);
  let proId=req.body.proId
  let offer=parseInt(req.body.offer)
  let price=parseInt(req.body.price)
  let fromDate=req.body.ValidFrom
 let  toDate=req.body.ValidTo
  adminHelpers.addOffer(proId,offer,price,fromDate,toDate).then(()=>{
    console.log('jai');
res.redirect('/admin/allproducts') 
 })
});
router.post('/catOffer',verifyloggin,(req,res)=>{
  console.log(req.body);
  let category=req.body.category
  let offer=parseInt(req.body.offer)
  let fromDate=req.body.ValidFrom
 let  toDate=req.body.ValidTo
  adminHelpers.catOffer(category,offer,fromDate,toDate).then(()=>{
    console.log('jai');
res.redirect('/admin/categories') 
 })
});
router.get('/all-coupons',verifyloggin,(req,res)=>{
  adminHelpers.geAllCoupons().then((response)=>{
    console.log(response);
    res.render('admin/allCoupons',{Admin:true,Coupons:response})

  })
});
router.post('/addCoupon',(req,res)=>{
  let Discount=req.body.Discount
  adminHelpers.generate(Discount)
  res.redirect('/admin/all-coupons')
})
router.get('/removeCoupon/:id',(req,res)=>{
  console.log(req.params.id);
  adminHelpers.removeCoupon(req.params.id).then(()=>{
    res.redirect("/admin/all-coupons")
  })
})
module.exports = router;
