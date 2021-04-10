var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
const producthelpers = require('../helpers/producthelpers');
const twlio = require('../helpers/twlio');
var router = express.Router();
var userHelpers = require('../helpers/userHelpers');
let PHONE
const client = require('twilio')(twlio.accountSID, twlio.authToken)
var verifyloggin = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  if (req.session.userLoggedin) {
    next()
  } else {
    res.redirect('/login')
  }
}
let blockCheck = (req, res, next) => {
  userHelpers.blockCheck(req.session.user).then((response) => {
    req.session.userLoggedin = false
    next()
  }).catch(() => {
    next()
  })
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount = 0
  if (req.session.user) {
    Cartcount = await userHelpers.getCount(req.session.user._id)
    var details=userHelpers.getUserprofiles(req.session.user._id)
  }
  producthelpers.getAllproducts().then(async(full) => {

    let products = full.products
    console.log(Cartcount);
    console.log(req.session.coupon,"jjjj");
  await adminHelpers.expireOffer()
    res.render('user/home', { Cartcount, user: req.session.userLoggedin, products, User: true ,details});
  }).catch(() => {
    console.log('errrr');
  })
});
router.get('/addtocart/:id', verifyloggin, (req, res) => {
  userHelpers.addTocart(req.params.id, req.session.user._id).then(() => {
    let response = {
    }
    response.status = true
    if (req.session.userLoggedin) {
      response.user = true
    }
    res.json(response)
  })
})
router.get('/shop', async (req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount = 0
  if (req.session.user) {
    Cartcount = await userHelpers.getCount(req.session.user._id)
  }

  producthelpers.getAllproducts().then((full) => {
    let products = full.products
    let categories = full.category
    req.session.category = categories
    if (req.session.user) {
    }
    res.render('user/Shop', { User: true, Cartcount, products, user: req.session.userLoggedin, categories })
  }).catch(() => {
    console.log('errrr');
  })
});
router.get('/login', (req, res) => {
  res.render('user/login', { logginError: req.session.logginError, block: req.session.block, User: true })
  req.session.block = false
  req.session.logginError = false
});
router.post('/login', (req, res) => {
  userHelpers.dologin(req.body).then((response) => {
    if (response.status) {
      if (response.userBlock) {
        req.session.block = response.userBlock
        res.redirect('/login')
      }
      req.session.user = response.user
      req.session.userLoggedin = true
      res.redirect('/')
    }
    else {
      req.session.logginError = 'Invalid Username or password'
      res.redirect('/login')
    }
  })
});
router.get('/signup', (req, res) => {
  if (req.session.existEmail) {
    res.render('user/signup', {
      exist: req.session.existEmail
      , User: true
    })
    req.session.existEmail = false
  } else {
    res.render('user/signup', { User: true })
  }
})
router.post('/signup', (req, res) => {
  console.log(req.body);
  userHelpers.isEmail(req.body.Email).then((data) => {
    if (data) {
      console.log('errr', data);
      res.redirect('/sessionErrors')
    } else {
      console.log("fff", req.body.Phone);

      client
        .verify
        .services(twlio.serviceSID)
        .verificationChecks
        .create({
          to: "+91" + req.body.Phone,
          code: req.body.otp
        }).then((verification_check) => {
          console.log(verification_check.status)
          if (verification_check.status == 'approved') {
            userHelpers.doSignup(req.body).then((response) => {
              console.log(response);
              req.session.response=response
              res.redirect('/session')
            }).catch((err) => {
              req.session.existEmail = true
              res.redirect('/signup')
            })

          } else {
            console.log('potti');
            res.json({ thetti: true })
          }

        })
    }
  })


});
router.get('/logout', (req, res) => {
  req.session.userLoggedin = false
  req.session.user = false
  res.redirect('/')
})
router.get('/single/:id', async (req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount = 0
  if (req.session.user) {
    Cartcount = await userHelpers.getCount(req.session.user._id)
  } let product = req.params.id
  if (req.session.user) {
  }

  producthelpers.getOneproduct(product).then((Product) => {
    res.render('user/single', { Cartcount, Product, user: req.session.userLoggedin, User: true })
  })
});
router.get('/category/:id', async (req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount = 0
  if (req.session.user) {
    Cartcount = await userHelpers.getCount(req.session.user._id)
  } console.log('haihfsdf');
  console.log(req.params.id);
  if (req.session.user) {
  }
  producthelpers.category(req.params.id).then((products) => {
    res.render('user/shop', { User: true, Cartcount, products, user: req.session.userLoggedin, categories: req.session.category, current: req.params })
  })
});
router.get('/cart', verifyloggin, async (req, res) => {
  var hi = {
    Cartcount: 0
  }
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  userHelpers.getCart(req.session.user._id).then(async (data) => {
    if (data[0]) {
      hi.total = await userHelpers.total(req.session.user._id, true)
      if (req.session.user) {
        hi.Cartcount = await userHelpers.getCount(req.session.user._id)
      }
      hi.data = data
      req.session.productsss = data[0]
      res.render('user/cart', { User: true, hi, user: req.session.user })
    } else {
      res.render('user/emCart', { User: true, user: req.session.user })
    }
  })
});
router.get('/subcategory', (req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  var category = req.query.category
  console.log(req.query);
  var subcategory = req.query.subcategory
  console.log(category);
  console.log(subcategory);
  producthelpers.subCategory(category, subcategory).then((products) => {
    res.render('user/shop', { User: true, user: req.session.userLoggedin, products })
  })
}),
  router.post('/change', verifyloggin, (req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      let pro = await producthelpers.getOneproduct(req.body.product)
      response.pro = pro.product_price
      console.log(req.body.product);
      let veno = await userHelpers.getCart(req.body.user)
      console.log(veno);
      if (veno[0]) {
        response.total = await userHelpers.total(req.body.user, req.body.product)
      }
      res.json(response)
    })
  });
router.post('/remove',(req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  producthelpers.removecart(req.body).then(() => {
    res.json()
    res.redirect('/cart')
  })
});
router.get('/register', verifyloggin, async (req, res) => {
  let cartItems = await userHelpers.getCart(req.session.user._id)
  if (cartItems[0]) {
    var total = await userHelpers.total(req.session.user._id, req.session.productsss._id)
  }
  let address = await userHelpers.getAddress(req.session.user._id)
  console.log('xx', address);
  let coupon=await userHelpers.getAllCoupon(req.session.user._id)
  res.render('user/register', { User: true, total, user: req.session.user,coupon, cartItems, address })
});
router.post('/place-order', async (req, res) => {
  console.log(req.body);
  let products = await userHelpers.getCartProductList(req.body.user)
  userHelpers.placeOrder(req.body, products, req.body.total).then(async(orderId) => {
    await producthelpers.changeCouponstatus(req.body.whichCoupon,req.body.code)
    console.log(req.body['payment-method']);
    if (req.body['payment-method'] == 'COD') {
      res.json({ codSuccess: true })
    } else if (req.body['payment-method'] == 'paypal') {
      var total=req.body.total
      res.json({ paypal: true, total,orderId })
    } else {
      userHelpers.generateRazorpay(orderId, req.body.total).then((response) => {
        res.json(response)
      })
    }
  })
});
router.get('/', (req, res) => {
  res.render('users/all-orders')
});

router.get('/order-success', (req, res) => {
  res.render('user/successfull-page', { User: true })
});
router.get('/all-orders', verifyloggin, (req, res) => {
  userHelpers.allOrders(req.session.user._id).then((Orders) => {
    res.render('user/orders', { Orders, user: req.session.userLoggedin, User: true })
  })
});
router.get('/details/:id', (req, res) => {
  userHelpers.getOrderdetails(req.params.id).then((response) => {
    res.render('user/detailed-view', { user: req.session.userLoggedin, User: true, response })
  })
});
router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  console.log('ayilla');
  userHelpers.verifyPayment(req.body).then(() => {
    console.log('verifu ayi');
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    }).catch((err) => {
      res.json({ status: false })
    })
  }).catch(() => {
    console.log('rer');
  })
});
router.get('/add-address', verifyloggin, (req, res) => {
  res.render('user/add-address', { user: req.session.userLoggedin, User: true })
});
router.post('/add-address', (req, res) => {
  userHelpers.addAddress(req.body, req.session.user._id).then(() => {
    res.redirect('/register')
  })
}
);
router.get('/deleteAddress/:id', (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.user._id).then(() => {
    res.redirect('/register')
  })
});
router.get('/changeStatus/:id', (req, res) => {
  console.log(req.params.id);
  userHelpers.changePaymentStatus(req.params.id).then(() => {
    res.redirect('/order-success')
  })
})





router.post('/getOtp', (req, res) => {
  console.log('hhhhhh');
  PHONE = req.body.No
  userHelpers.OtpRequest(req.body.No).then((data) => {
    console.log(data);
    if (data) {
      res.json(true)

    } else {
      client.verify.services(twlio.serviceSID)
        .verifications
        .create({
          to: "+91" + req.body.No,
          channel: 'sms'
        })
        .then((verification) => {
          console.log(verification.sid);
        }).catch((err) => {
          console.log(err);
        })
    }
  }).catch((err) => {

    client.verify.services(twlio.serviceSID)
      .verifications
      .create({
        to: "+91" + req.body.No,
        channel: 'sms'
      })
      .then((verification) => {
        console.log(verification.sid);
      })

  })


});


router.post('/getLogin', (req, res) => {
  console.log('hbhh');
  console.log("hi", req.body.Phone);
  userHelpers.OtpRequest(req.body.Phone).then((data) => {
    console.log(data);
    if (data) {
      client.verify.services(twlio.serviceSID)
        .verifications
        .create({
          to: "+91" + req.body.Phone,
          channel: 'sms'
        })
        .then((verification) => {
          console.log(verification);
          console.log(verification.sid);
          res.json({ ok: true })
        }).catch((err) => {
          console.log(err);
        })
    } else {
      res.json({ err: true })

    }
  }).catch((err) => {
    res.json({ err: true })
  })





});
router.post('/checkOTP', (req, res) => {
  console.log(req.body.otp);
  console.log(req.body.Phone)
  client
    .verify
    .services(twlio.serviceSID)
    .verificationChecks
    .create({
      to: "+91" + req.body.Phone,
      code: req.body.otp
    }).then((verification_check) => {
      console.log(verification_check.status)
      if (verification_check.status == 'approved') {
        userHelpers.dologinwithNO(req.body).then((response) => {
          console.log(response);
          req.session.response = response
          res.redirect('/session')
        }).catch((err) => {
          res.redirect('/sessionErrors')
        })

      } else {
        console.log('potti');
        res.json({ thetti: true })
      }
    })
})


router.get('/sessionErrors', (req, res) => {
  req.session.existEmail = true
  res.json({ thetti: true })

});
router.get('/session', (req, res) => {
  req.session.user = req.session.response
  req.session.coupon=req.session.coupon
  req.session.userLoggedin = true
  res.json({ ok: true })
})

router.get('/profile', verifyloggin, (req, res) => {
  userHelpers.getUserprofiles(req.session.user._id).then((USER) => {
    res.render('user/userProfile', { User: true,USER})
  })
});
router.get('/profileAddress',verifyloggin,(req,res)=>{
userHelpers.getAddress(req.session.user._id).then(async(Address)=>{
  let USER=await userHelpers.getUserprofiles(req.session.user._id)
console.log(Address);
res.render('user/userProfileAddress',{User:true,Address,USER})
  })
})
router.get('/removeAddress/:id',verifyloggin,(req, res) => {
  userHelpers.removeAddress(req.params.id, req.session.user._id).then((response) => {
    res.redirect('/register')
  })
});
router.get('/editUser',verifyloggin,async(req,res)=>{
let USER=await userHelpers.getUserprofiles(req.session.user._id)
res.render('user/editProfile',{User:true,USER})
});
router.post('/editUser',(req,res)=>{
console.log(req.body);
userHelpers.editProfile(req.session.user._id,req.body).then((response)=>{
res.redirect('/profile')
})
});
router.get('/editAddress/:id',async(req,res)=>{
  let Address=await userHelpers.getAddressUser(req.params.id)
  console.log(Address);
  res.render('user/editAddress',{User:true,Address})
});
router.post('/Edit-address/:id',(req,res)=>{
 console.log(req.body);
 userHelpers.editAddress(req.params.id,req.body).then((response)=>{
   res.redirect('/profile')
 })
});
router.post('/profileUpload/:id',(req,res)=>{
  console.log(req.files.image);
  let id=req.params.id
  let image=req.files.image
  image.mv('./public/userImages/'+id+'.jpg')
  res.redirect('/profile')
});
router.get('/search',(req,res)=>{

res.render('user/moda',{User:true})
});
router.post('/applyCoupon',(req,res)=>{
producthelpers.applyCoupon(req.body.code).then((response)=>{
  console.log(response,"response");
  if(response.already){
    res.json({already:true})
  }else if(response.discount){
      res.json({discount:response.discount})

    }else if(response.success){
      res.json({success:true})

    }else if(response.forRefferal){
res.json({forRefferal:true})
    }
    else{
      res.json({err:true})
    }
}).catch(()=>{
res.json({err:true})
})
})
router.get('/changePassword',(req,res)=>{
let user=req.session.user
res.render('user/changePassword',{User:true,user,Error:req.session.oldPass})
req.session.oldPass=null
})
router.post('/changePassword',(req,res)=>{
userHelpers.changePassword(req.body.id,req.body.old,req.body.new).then(()=>{
  res.redirect('/profile')

}).catch(()=>{
req.session.oldPass="Password doesn't match"
res.redirect('/changePassword')
})
  })
module.exports = router;
