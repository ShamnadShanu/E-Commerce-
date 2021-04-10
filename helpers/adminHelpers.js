let db=require('../config/mongodb')
let collections=require('../config/collections')
const objectId= require('mongodb').ObjectID
var voucher_codes = require('voucher-code-generator')


let moment=require('moment')
const { resolve, reject } = require('promise')
const { response } = require('express')

module.exports={
    doLogin:(adminData)=>{
        let response={}
    
        return new Promise((resolve,reject)=>{
            let adminDefined={Email:'admin@gmail.com',Password:'1234'}
            console.log('adminDefined',adminDefined);
            if(adminData.Email==adminDefined.Email&&adminData.Password==adminDefined.Password){
                response.admin=adminDefined
                response.status=true
                resolve(response)
            }else{
                resolve({status:false})
            }
        })
    },
    allOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find({date:moment(new Date()).format('L')}).toArray()
            resolve(orders)
        })
    },
    AllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find().toArray()
            resolve(orders)
        })
    },
    changeOrderStatus:(data)=>{
        console.log("data",data);
        return new Promise(async(resolve,reject)=>{
          let result=  await db.get().collection(collections.ORDER_COLLECTIONS).updateOne({_id:objectId(data.id)},
           { $set:{
                status:data.status
            }})
            resolve(result)
        })
    },
    getOrderId:(id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.ORDER_COLLECTIONS).findOne({_id:objectId(id)}).then((data)=>{
                if(data){
                    resolve(data)
                }else{
                    reject()
                }
            })
        })
    },
    getUsername:(data)=>{
        return new Promise(async(resolve,response)=>{
let userId=await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
    {
$project:{
    userId:'$userId'
}    },{
    $lookup:{
        from:collections.USER_COLLECTION,
        localField:'userId',
        foreignField:'_id',
        as:'User'
    }
},{
    $project:{
        _id:0,
        user:'$User'
    }
}
]).toArray()
console.log(userId);
resolve(userId)
        })
    },
    salesReport:(start,end)=>{
        return new Promise(async(resolve,reject)=>{
            let report =await db.get().collection('order').aggregate([
                {
                    $match:{
                        date:{
                            $gte:start,$lte:end
                        }
                    }
                },
                {
                    $project:{
                        totalAmount:1,
                        paymentMethod:1,
                        status:1,
                        date:1,
                        deliveryDetails:1
                    }
                }
            ]).toArray()
            resolve(report)
        })
    },
    getAlluser:()=>{
        return new Promise(async(resolve,reject)=>{
         let user=await   db.get().collection(collections.USER_COLLECTION).find().toArray()
         console.log(user.length);
         resolve({lenght:user.length,User:user})
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find().toArray()
            resolve(orders.length)
        })
    },
    getAllplaced:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find({status:'Placed'}).toArray()
            console.log(orders);
            resolve(orders.length)
        })
    },
    getAlldelivered:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find({status:'Deliver'}).toArray()
            console.log(orders);
            resolve(orders.length)
        })
    },
    getallShiped:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTIONS).find({status:'Ship'}).toArray()
            console.log(orders);
            resolve(orders.length)
        })
    },
    addOffer:(proId,offer,price,fromDate,toDate)=>{
        let offerPrice=price-(price*offer)/100
        console.log('sga');
     return new Promise((resolve,reject)=>{
        db.get().collection(collections.PODUCT_COLLECTIONS).updateOne({_id:objectId(proId)},{
            $set:{
                offer:offer,
                product_price:offerPrice,
                actual_price:price,
                ValidFrom:fromDate,
                ValidTo:toDate
            }
        }).then((response)=>{
            resolve()
        })
     })
    },
    catOffer:(category,offer,fromDate,toDate)=>{
        console.log('sga');
     return new Promise((resolve,reject)=>{
      db.get().collection(collections.PODUCT_COLLECTIONS).find({product_category:category}).toArray().then((products)=>{
          let length=products.length
          console.log(length);
          for(i=0;i<length;i++){
              if(products[i].actual_price){
                let product_price=products[i].actual_price
                console.log(product_price);
              db.get().collection(collections.PODUCT_COLLECTIONS).updateOne({_id:objectId(products[i]._id)},{
                          $set:{
                              offer:offer,
                              product_price:product_price-(product_price*offer)/100,
                              actual_price:product_price,
                              ValidFrom:fromDate,
                              ValidTo:toDate
                          }
                      })
              }else{
                let product_price=products[i].product_price
                console.log(product_price);
              db.get().collection(collections.PODUCT_COLLECTIONS).updateOne({_id:objectId(products[i]._id)},{
                          $set:{
                              offer:offer,
                              product_price:product_price-(product_price*offer)/100,
                              actual_price:product_price
                          }
                      })
              }
             
          }
          resolve()
      })
   
     })
    },
    generate:(discount)=>{
        return new Promise(async(resolve,reject)=>{
            let cod=await voucher_codes.generate();
            let convert=cod[0]
            let Data={
                couponCod:convert,
                discount:discount,
                status:"Active"
            }

            db.get().collection(collections.COUPON_COLLECTION).insertOne(Data)
        })
    },
    geAllCoupons:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.COUPON_COLLECTION).find().toArray().then((response)=>{
                resolve(response)
            })
        })
    },
    expireOffer:() => {
        return new Promise(async (resolve, reject) => {
            let allProducts = await db.get().collection(collections.PODUCT_COLLECTIONS).find().toArray()
            let length = allProducts.length
            for (let i = 0; i < length; i++) {
                if (allProducts[i].offer) {

                    let current_date = moment(new Date()).format("MM/DD/YYYY");

                    current_date = Date.parse(current_date)
                    console.log(current_date);
                    
                    let valid_date = Date.parse(allProducts[i].ValidTo)
                    console.log(valid_date,"valid");
                    if (current_date > valid_date) {
                        db.get().collection(collections.PODUCT_COLLECTIONS).updateOne({ _id: objectId(allProducts[i]._id) }, {
                            $set: {
                                product_price: parseInt(allProducts[i].actual_price)
                            },
                            $unset: {
                                offer: 1,
                                actual_price: 1,
                                ValidFrom: 1,
                                ValidTo: 1
                            }
                        })
                    }
                }
            }
            resolve()

        })
    } ,
    removeCoupon:(Id)=>{
return new Promise((resolve,reject)=>{
db.get().collection(collections.COUPON_COLLECTION).removeOne({_id:objectId(Id)}).then(()=>{
resolve()
})
})
    }
}
