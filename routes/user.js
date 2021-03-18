const { response } = require('express');
const e = require('express');
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
router.get('/',async function(req, res, next) {  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount=0
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
router.get('/addtocart/:id',verifyloggin,(req,res)=>{
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
router.get('/shop',async(req,res)=>{   res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount=0
  if(req.session.user){
    Cartcount= await userHelpers.getCount(req.session.user._id)
  }

  producthelpers.getAllproducts().then((full)=>{
    let products=full.products
    let categories=full.category
    req.session.category=categories
    if(req.session.user){
    }
    res.render('user/Shop',{User:true,Cartcount,products,user:req.session.userLoggedin,categories})
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
    if(response.status){
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
router.get('/single/:id',async(req,res)=>{  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount=0
  if(req.session.user){
    Cartcount= await userHelpers.getCount(req.session.user._id)
  }  let product=req.params.id
  if(req.session.user){
  }

  producthelpers.getOneproduct(product).then((Product)=>{
    res.render('user/single',{Cartcount,Product,user:req.session.userLoggedin,User:true})
  })
});
router.get('/category/:id',async(req,res)=>{  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount=0
  if(req.session.user){
    Cartcount= await userHelpers.getCount(req.session.user._id)
  }  console.log('haihfsdf');
  console.log(req.params.id);
  if(req.session.user){
  }
  producthelpers.category(req.params.id).then((products)=>{
    res.render('user/shop',{User:true,Cartcount,products,user:req.session.userLoggedin,categories:req.session.category,current:req.params})
  })
});
router.get('/cart',verifyloggin,async(req,res)=>{ 
   res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

  let Cartcount=0
  if(req.session.user){
    Cartcount= await userHelpers.getCount(req.session.user._id)
  }  userHelpers.getCart(req.session.user._id).then((data)=>{
    if(data){
      if(req.session.user){
      }
      console.log(data);
      res.render('user/cart',{Cartcount,User:true,data,user:req.session.userLoggedin})
    }else{
      res.render('user/emCart',{User:true,user:req.session.userLoggedin})
    }
  })
});
router.get('/subcategory',(req,res)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  var category=req.query.category
  console.log(req.query);
  var subcategory=req.query.subcategory
  console.log(category);
  console.log(subcategory);
  producthelpers.subCategory(category,subcategory).then((products)=>{
    res.render('user/shop',{User:true,user:req.session.userLoggedin,products})
  })
}),
router.post('/change',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    res.json(response)
  })
});
router.get('/removecart/',(req,res)=>{  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')

producthelpers.removecart(req.query).then(()=>{
  res.redirect('/cart')
})
})


module.exports = router;
