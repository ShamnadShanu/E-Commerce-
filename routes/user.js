const { response } = require('express');
var express = require('express');
const producthelpers = require('../helpers/producthelpers');
var router = express.Router();
var userHelpers=require('../helpers/userHelpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  producthelpers.getAllproducts().then((products)=>{
    res.render('user/home',{user:req.session.userLoggedin,products,User:true}); 
  }).catch(()=>{
    console.log('errrr');
  })
});
router.get('/shop',(req,res)=>{
  producthelpers.getAllproducts().then((products)=>{
    res.render('user/Shop',{User:true,products})
  }).catch(()=>{
    console.log('errrr');
  })
});
router.get('/login',(req,res)=>{
    res.render('user/login',{logginError:req.session.logginError,User:true})
    req.session.logginError=false
});
router.post('/login',(req,res)=>{
  userHelpers.dologin(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedin=true
      res.redirect('/')
    }
    else{
      req.session.logginError='Invalid Username or password'
      res.redirect('/login')
    }
  })
});
router.get('/signup',(req,res)=>{
    if(req.session.existEmail){
      res.render('user/signup',{
        exist:req.session.existEmail
        ,User:true
      })
      req.session.existEmail=false
    }else{
      res.render('user/signup',{User:true})
    }
  });
router.post('/signup',(req,res)=>{
  console.log(req.body);
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.userLoggedin=true
res.redirect('/')
  }).catch((err)=>{
    req.session.existEmail=true
    res.redirect('/signup')
  })
});
router.get('/logout',(req,res)=>{
  req.session.userLoggedin=false
  req.session.user=false
  res.redirect('/')
})
router.get('/single/:id',(req,res)=>{
  let product=req.params.id
  producthelpers.getOneproduct(product).then((Product)=>{
    res.render('user/single',{Product,User:true})
  })
});
router.get('/category/:id',(req,res)=>{
  console.log('haihfsdf');
  console.log(req.params.id);
  producthelpers.category(req.params.id).then((products)=>{
    res.render('user/shop',{User:true,products,current:req.params})
  })
});
router.get('/subcategory',(req,res)=>{
  var category=req.query.category
  console.log(req.query);
  var subcategory=req.query.subcategory
  console.log(category);
  console.log(subcategory);
  producthelpers.subCategory(category,subcategory).then((products)=>{
    res.render('user/shop',{User:true,products})
  })
})


module.exports = router;
