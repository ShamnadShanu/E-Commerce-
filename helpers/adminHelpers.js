let db=require('../config/mongodb')
let collections=require('../config/collections')
const { reject, resolve } = require('promise')
const objectId= require('mongodb').ObjectID
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
    }
}