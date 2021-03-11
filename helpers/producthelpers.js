let db=require('../config/mongodb')
let collections=require('../config/collections')
const { reject, resolve } = require('promise')
const objectId= require('mongodb').ObjectID


module.exports={
    addproduct:(Data)=>{
        return new Promise((resolve,reject)=>{
            console.log('data');
            db.get().collection(collections.PODUCT_COLLECTIONS).insertOne(Data).then((data)=>{
                resolve(data.ops[0]._id);
            })
        })

    },
    getAllproducts:()=>{
        return new Promise(async(resolve,reject)=>{
          let Data=await db.get().collection(collections.PODUCT_COLLECTIONS).find().toArray()
                resolve(Data)
        
        })

    },
    removeProduct:(id)=>{
return new Promise((resolve,reject)=>{
    db.get().collection(collections.PODUCT_COLLECTIONS).removeOne({_id:objectId(id)}).then(()=>{
        resolve()
    })
})
    },
    
    getOneproduct:(productsdetails)=>{
        return new Promise(async(resolve,reject)=>{
            let Product=await db.get().collection(collections.PODUCT_COLLECTIONS).findOne({_id:objectId(productsdetails)})
            console.log(Product);
            resolve(Product)
        })
    },
    editProduct:(product,updates)=>{
        return new Promise((resolve,reject)=>{
        db.get().collection(collections.PODUCT_COLLECTIONS).updateOne({_id:objectId(product)},{$set:{
            product_name:updates.product_name,product_price:updates.product_price,product_category:updates.product_category,product_description:updates.product_description
        }}).then(()=>{
            let id=objectId(product)
            resolve(id)
        })
        })
    }
}