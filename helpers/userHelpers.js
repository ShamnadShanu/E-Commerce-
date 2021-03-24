var db=require('../config/mongodb')
var collections=require('../config/collections')
const { resolve, reject } = require('promise')
var bcrypt=require('bcrypt')
const { response } = require('express')
const { fstat } = require('fs')
const { use } = require('../routes/User')
const objectId= require('mongodb').ObjectID
const { count } = require('console')
const { NONAME, promises } = require('dns')
const { checkServerIdentity } = require('tls')
const Razorpay=require('razorpay')
const { cpuUsage } = require('process')
var instance = new Razorpay({
    key_id: 'rzp_test_ngthi084Y8vNMx',
    key_secret: 'PsMhKzaBExqvsDyD1qmj7BAA',
  });module.exports={
doSignup:(Data)=>{
return new Promise(async(resolve,reject)=>{
    let exist=await db.get().collection(collections.USER_COLLECTION).findOne({Email:Data.Email})
    if(!exist){
        Data.Password=await bcrypt.hash(Data.Password,10)
        console.log(Data.Password);
        db.get().collection(collections.USER_COLLECTION).insertOne(Data).then((response)=>{
            resolve(response.ops[0])
                })
    }else{
        reject()
    }
    
})
},dologin:(Data)=>{
              return new Promise(async(resolve,reject)=>{
   let response={}
  let user= await db.get().collection(collections.USER_COLLECTION).findOne({Email:Data.Email})
  console.log(user);
  if(user){
      console.log(user.status);
      if(user.status){
          response.userBlock='You Are Blocked Becuase Some Malicious Activity'
          
    }
        bcrypt.compare(Data.Password,user.Password).then((status)=>{
            if(status){
                console.log('login success');
              response.user=user
              response.status=true
              resolve(response)
            }else{
        console.log('login failed');
        resolve({status:false})
     }
        })
    
      }
     else{
console.log('user invalid');
resolve({status:false})  }
})
},
getAlluser:()=>{
    return new Promise(async(resolve,reject)=>{
        let Users=await db.get().collection(collections.USER_COLLECTION).find().toArray()
        resolve(Users)
    })
},
removeUser:(id)=>{
return new Promise((resolve,reject)=>{
    db.get().collection(collections.USER_COLLECTION).removeOne({_id:objectId(id)}).then(()=>{
        resolve()
    })
})
},
blockUser:(user)=>{
return new Promise(async(resolve,reject)=>{
        db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(user)},{$set:{status:true}}).then(()=>{
            resolve()
        })
})
},
unblockUser:(user)=>{
    return new Promise(async(resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(user)},{$set:{status:false}}).then(()=>{
                resolve()
            })
    })
    },
    blockCheck:(Data)=>{
return new Promise(async(resolve,reject)=>{
   let user=await db.get().collection(collections.USER_COLLECTION).findOne({Email:Data.Email})
   if(user.status){
       resolve()
   }else{
       reject()
   }

})
    },
    addTocart:(proId,userId)=>{
        let= prodObj={
            item:objectId(proId),
            quantity:1

        }
        console.log(prodObj);
return new Promise(async(resolve,reject)=>{
    cart=await db.get().collection(collections.CART).findOne({user:objectId(userId)})

    if(cart){
        let proExist=cart.products.findIndex(product=>product.item==proId)
            console.log(proExist);
            if(proExist!=-1){
                 db.get().collection(collections.CART)
                .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                {
                    $inc:{"products.$.quantity":1}
                }
                )  
            }else{
                db.get().collection(collections.CART)
                .updateOne({user:objectId(userId)},
                {
                    $push:{products:prodObj}
                }
                )
                 .then((response)=>{
                    resolve()
                })
            }

            }else{
    let CART={
        user:objectId(userId),
        products:[prodObj]
    }
    db.get().collection(collections.CART).insertOne(CART).then((data)=>{
        resolve(data.ops[0])
    })
    }
})
    },
    getCart:(user)=>{
        return new Promise(async(resolve,reject)=>{
          let data=await db.get().collection(collections.CART).aggregate([{
              $match:{user:objectId(user)}
          },
          {
              $unwind:'$products'
          },{
              $project:{
                  item:'$products.item',
                  quantity:'$products.quantity'
              }
          },
          {
              $lookup:{
                  from:collections.PODUCT_COLLECTIONS,
                  localField:'item',
                  foreignField:'_id',
                  as:'product'
              }
          },{
              $project:{
                  item:1,quantity:1,products:{$arrayElemAt:['$product',0]}
              }
          },{
            $project:{
                item:1,quantity:1,products:1,sub:{$multiply:['$quantity','$products.product_price']}
            }
        }
        ]).toArray()
          if(data){
console.log(data);
            resolve(data)
          }else{
              resolve()
          }
        })
    },
    getCount:(userId)=>{
        let empty=0
return new Promise(async(resolve,reject)=>{
 let user=await db.get().collection(collections.CART).findOne({user:objectId(userId)})
 if(user){
    length=user.products.length
    resolve(length)
 }else{
     resolve(empty)
 }
 
})
    },
    changeProductQuantity:(Data)=>{
        let quantity=parseInt(Data.quantity)
       let  count=parseInt(Data.count)
        return new Promise(async(resolve,reject)=>{
            if(count==-1 && quantity==1){
                db.get().collection(collections.CART)
                .updateOne({_id:objectId(Data.cart)},
                {
                    $pull:{products:{item:objectId(Data.product)}}
                }
                ).then(()=>{
resolve({remove:true})
                })
            }else{

            }
           let data=await db.get().collection(collections.CART)
            .updateOne({_id:objectId(Data.cart),'products.item':objectId(Data.product)},
            {
                $inc:{"products.$.quantity":count}
            }
            )
                  resolve({status:true}) 
            
        })
} ,
 total:(user,product)=>{
     if(product){
        return new Promise(async(resolve,reject)=>{
    let total=await db.get().collection(collections.CART).aggregate([{
                   $match:{user:objectId(user)}
               },
               {
                   $unwind:'$products'
               },{
                   $project:{
                       item:'$products.item',
                       quantity:'$products.quantity'
                   }
               },
               {
                   $lookup:{
                       from:collections.PODUCT_COLLECTIONS,
                       localField:'item',
                       foreignField:'_id',
                       as:'products'
                   }
               },{
                   $project:{
                       item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                   },
               },{
                   $group:{
                     _id:null,
                       total:{$sum:{$multiply:['$quantity','$products.product_price']}}
                   }
               }
             ]).toArray()
            let hai=total[0].total
              resolve(hai)
              
             })
     }
   
},
placeOrder:(order,products,total)=>{
return new Promise((resolve,reject)=>{
console.log(order,products,total);
let status=order['payment-method']==='COD'?'placed':'pending'
let orderObj={
    deliveryDetails:{
        mobile:order.mobile,
        address:order.address,
        pincode:order.pincode,
        city:order.town,
        email:order.email 
    },
    userId:objectId(order.user),
    paymentMethod:order['payment-method'],
    products:products,  
    totalAmount:total,
    status:status,
    date:new Date()
}
db.get().collection(collections.ORDER_COLLECTIONS).insertOne(orderObj).then((response)=>{
    db.get().collection(collections.CART).removeOne({user:objectId(order.user)})
    console.log();
    resolve(response.ops[0]._id)
})
})
},
getCartProductList:(user)=>{
    return new Promise(async(resolve,reject)=>{
        let cart=await db.get().collection(collections.CART).findOne({user:objectId(user)})
        resolve(cart.products)
    })
},
allOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find({userId:objectId(userId)}).toArray()
        console.log('Odd',orders);
        resolve(orders)
    })
},
getOrderdetails:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let data=await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([{
            $match:{_id:objectId(orderId)}
        },
        {
            $unwind:'$products'
        },{
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:collections.PODUCT_COLLECTIONS,
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
        },{
            $project:{
                item:1,quantity:1,products:{$arrayElemAt:['$product',0]}
            }
        }
      ]).toArray()
console.log(data);
resolve(data)
      })
  },
  generateRazorpay:(orderId,total)=>{
      return new Promise((resolve,reject)=>{
        var options = {
            amount: total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+orderId
          };
          instance.orders.create(options, function(err, order) {
            console.log('iigjorder',order);
resolve(order)
          }); 

      })
  },
  verifyPayment:(details)=>{

    console.log(details);
      return new Promise((resolve,reject)=>{
          const crypto=require('crypto'); 
         let hmac=crypto.createHmac('sha256','PsMhKzaBExqvsDyD1qmj7BAA') 
         hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
         hmac=hmac.digest('hex')
         console.log(hmac)
         console.log(details['payment[razorpay_signature]'])
         if(hmac===details['payment[razorpay_signature]']){
             resolve()
         }else{
             reject()
         }
        })
     
  },
  changePaymentStatus:(orderId)=>{
      console.log(orderId);
      return new Promise((resolve,reject)=>{
          db.get().collection(collections.ORDER_COLLECTIONS)
          .updateOne({_id:objectId(orderId)}, 
          {
              $set:{
                  status:'placed'
              }
          }
          ).then((response)=>{
              resolve()
          })
      })
  },
  addAddress:(details,userId)=>{
      details.user=objectId(userId)
      return new Promise((resolve,reject)=>{
db.get().collection(collections.ADDRESS_COLLECTIONS).insertOne(details).then((response)=>{
    resolve()
})
      }
      )
  },
  getAddress:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let address=await db.get().collection(collections.ADDRESS_COLLECTIONS).find({user:objectId(userId)}).toArray()
        resolve(address)
      })
  },
  deleteAddress:(order)=>{
      console.log(order);
      return new Promise((resolve,reject)=>{
        db.get().collection(collections.ADDRESS_COLLECTIONS).removeOne({_id:objectId(order)}).then(()=>{
            resolve()
        })
})
  },
  generatePaypal:()=>{
      return new Promise((resolve,reject)=>{
        var paypal = require('paypal-rest-sdk');
            paypal.configure({
            'mode': 'sandbox', //sandbox or live
            'client_id': 'AUSBmZwITazqRokMv_tUKYcSkVBy6OxWo4ZNKeVj-W9SYbcq5xkIQPkCF2DliMSF1Rgi87mUY78I8bzp',
            'client_secret': 'EKCrRJFoBByPyAd0_5IGh8PNw9GodmhvNFFh7J2CvB7MOxz07Yi_6XXosgpg1y5Wzi7SJ6mzIbmJJYN3'
          });

      })
  },

}