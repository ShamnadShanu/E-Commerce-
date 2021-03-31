let db=require('../config/mongodb')
let collections=require('../config/collections')
const { reject, resolve } = require('promise')
const objectId= require('mongodb').ObjectID
const { response } = require('express')
let moment=require('moment')

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
         resolve(user.length)
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
    }
}