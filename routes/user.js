const { response } = require('express');
var express = require('express');
const producthelpers = require('../helpers/producthelpers');
var router = express.Router();
var userHelpers=require('../helpers/userHelpers')
var verifyloggin=(req,res,next)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  if(req.session.userLoggedin){
next()
  }else{
    res.redirect('/login')
  }
}
let blockCheck=(req,res,next)=>{
  userHelpers.blockCheck(req.session.user).then((response)=>{
      req.session.userLoggedin=false
      next()
  }).catch(()=>{
    next()
  })
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let Cartcount=null

  if(req.session.user){
    Cartcount= await userHelpers.getCount(req.session.user._id)

  }
  producthelpers.getAllproducts().then((full)=>{
    
    let products=full.products
    console.log(Cartcount);
    res.render('user/home',{Cartcount,user:req.session.userLoggedin,products,User:true}); 
  }).catch(()=>{
    console.log('errrr');
  })
});
router.get('/addtocart/:id',(req,res)=>{
  console.log('dvjihifu');
userHelpers.addTocart(req.params.id,req.session.user._id).then(()=>{

let response={
}
response.status=true
if(req.session.userLoggedin){
  response.user=true
}
  res.json(response)
})
})
router.get('/shop',(req,res)=>{ 
  producthelpers.getAllproducts().then((full)=>{
    let count=null
    let products=full.products
    let categories=full.category
    req.session.category=categories
    console.log('hio');
    if(req.session.user){
      count=req.session.cartCount
    }
    res.render('user/Shop',{User:true,count,products,user:req.session.userLoggedin,categories})
  }).catch(()=>{
    console.log('errrr');
  })
});
router.get('/login',(req,res)=>{
    res.render('user/login',{logginError:req.session.logginError,block:req.session.block, User:true})
    req.session.block=false
    req.session.logginError=false
});
router.post('/login',(req,res)=>{
  userHelpers.dologin(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      console.log(response.status);
      if(response.userBlock){
      req.session.block=response.userBlock
      res.redirect('/login')
      }
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
    req.session.user=response
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
  let count=null
  let product=req.params.id
  if(req.session.user){
    count=req.session.cartCount
  }

  producthelpers.getOneproduct(product).then((Product)=>{
    res.render('user/single',{Product,count,user:req.session.userLoggedin,User:true})
  })
});
router.get('/category/:id',(req,res)=>{
  let count=null
  console.log('haihfsdf');
  console.log(req.params.id);
  if(req.session.user){
    count=req.session.cartCount
  }
  producthelpers.category(req.params.id).then((products)=>{
    res.render('user/shop',{User:true,count,products,user:req.session.userLoggedin,categories:req.session.category,current:req.params})
  })
});
router.get('/cart',verifyloggin,(req,res)=>{
  let count=null
  userHelpers.getCart(req.session.user._id).then((data)=>{
    if(data){
      if(req.session.user){
        count=req.session.cartCount
      }
      console.log(data);
      res.render('user/cart',{count,User:true,data})
    }
   

  })
});
router.get('/subcategory',(req,res)=>{
  var category=req.query.category
  console.log(req.query);
  var subcategory=req.query.subcategory
  console.log(category);
  console.log(subcategory);
  producthelpers.subCategory(category,subcategory).then((products)=>{
    res.render('user/shop',{User:true,user:req.session.userLoggedin,products})
  })
})


module.exports = router;
