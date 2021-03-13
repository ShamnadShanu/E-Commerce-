const { response } = require('express');
var express = require('express');
var router = express.Router();
let productHelpers=require('../helpers/producthelpers');
const userHelpers = require('../helpers/userHelpers');
const adminHelpers=require('../helpers/adminHelpers')
const { route } = require('./User');
const e = require('express');
const collections = require('../config/collections');
var verifyloggin=(req,res,next)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  if(req.session.adminLoggedin){
next()
  }else{
    res.redirect('/admin/login')
  }
}


/* GET users listing. */
router.get('/',verifyloggin, function(req, res, next) {
  res.render('admin/index',{Admin:true})
});
router.get('/login',(req,res)=>{
  if(req.session.adminLoggedin){
    res.redirect('/admin')
  }else{
    res.render('admin/login',{adminError:req.session.adminError})
    req.session.adminError=false
  }
});
router.post('/login',(req,res)=>{
adminHelpers.doLogin(req.body).then((response)=>{
  console.log(req.body);
  if(response.status){
    req.session.adminLoggedin=true
    res.redirect('/admin')
  }else{
    console.log('rejected');
    req.session.adminError='invalid username or password'
    res.redirect('/admin/login')
  }
})
});
router.get('/allproducts',verifyloggin,function(req, res, next) {
  productHelpers.getAllproducts().then((Data)=>{
    console.log(Data);
    res.render('admin/allproducts',{Category:req.session.Category,Admin:true,Data})
  })
});
router.get('/allusers',verifyloggin,(req,res)=>{
userHelpers.getAlluser().then((Users)=>{
res.render('admin/allusers',{Admin:true,Users})
})
});
router.get('/addproducts',verifyloggin,(req,res)=>{
  if(req.session.wrong){
    res.render('admin/addproducts',{wrong:req.session.wrong,Admin:true})
    req.session.wrong=false
  }
  productHelpers.getAll().then((categories)=>{
    console.log('vzf');
    console.log(categories);
    res.render('admin/addproducts',{Admin:true,categories})
  })
})
router.post('/addproducts',(req,res)=>{
console.log(req.body);
productHelpers.addproduct(req.body).then((id)=>{
  console.log(id);
    let Image=req.files.Image
    Image.mv('./public/productImages/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect('/admin/allproducts')
      }else{
        res.redirect('/admin/addproducts')
        req.session.wrong='something wrong please try again'
      }
    })
})
});
router.get('/removeproduct/:id',verifyloggin,(req,res)=>{
 let Data=req.params.id
 productHelpers.removeProduct(Data).then(()=>{
   res.redirect('/admin/allproducts')
 })
});
router.get('/removeuser/:id',verifyloggin,(req,res)=>{
  let Data=req.params.id
  userHelpers.removeUser(Data).then(()=>{
    res.redirect('/admin/allusers')
  })
});
router.get('/editproduct/:id',verifyloggin,(req,res)=>{
  productHelpers.getOneproduct(req.params.id).then((product)=>{
    res.render('admin/editproduct',{product,Admin:true})
  })
})
router.post('/editproduct/:id',(req,res)=>{
  let product=req.params.id
  console.log('change cheythath',req.body);
  productHelpers.editProduct(product,req.body).then((id)=>{
    console.log('Image',id);
    if(req.files.image){
      let Image=req.files.image
      Image.mv('./public/productImages/'+id+'.jpg')
      res.redirect('/admin/allproducts')
    }else{
      res.redirect('/admin/allproducts')
    }
  })
});
router.get('/blockuser/:id',verifyloggin,(req,res)=>{
  userHelpers.blockUser(req.params.id).then(()=>{
    console.log(req.params.id);
    res.redirect('/admin/allusers')
  })
});
router.get('/unblockuser/:id',verifyloggin,(req,res)=>{
  userHelpers.unblockUser(req.params.id).then(()=>{
    res.redirect('/admin/allusers')
  })
})
router.get('/logout',(req,res)=>{
  req.session.adminLoggedin=false
  res.redirect('/admin')
});
router.get('/add_category',verifyloggin,(req,res)=>{
  res.render('admin/addcategory'
  ,{Admin:true})
});
router.post('/add_category',(req,res)=>{
console.log(req.body);
  productHelpers.add_category(req.body).then((data)=>{
    res.redirect('/admin/categories')
  })
});
router.get('/add_subcategory',verifyloggin,(req,res)=>{
  productHelpers.getAll().then((categories)=>{
  res.render('admin/addsubcategory',{Admin:true,categories})
  })
});
router.post('/add_sub',(req,res)=>{
  console.log(req.body);
  productHelpers.add_subCategory(req.body).then(()=>{
res.redirect('/admin/categories')
  })
});
router.get('/delete_category/:id',(req,res)=>{
productHelpers.deleteCategory(req.params.id).then(()=>{
  res.redirect('/admin/categories')
})
});
router.get('/delete_subcategory/:id',(req,res)=>{
  productHelpers.deletesubCategory(req.params.id).then(()=>{
    res.redirect('/admin/categories')
  })
  });

router.get('/categories',verifyloggin,(req,res)=>{
  productHelpers.getAll().then(async(categories)=>{
    if(categories[0]){
      let Category=categories
      let sub=Category[0].sub_category;
      console.log(Category);
    console.log(sub);
    res.render('admin/categories',{Admin:true,Category,sub})

    }else{
      res.render('admin/categories',{Admin:true})

    }


  })
  // productHelpers.getAllcatrgories().then((category)=>{
  //   res.render('admin/categories',{Admin:true,category})
  // })
})

module.exports = router;
