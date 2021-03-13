let db=require('../config/mongodb')
let collections=require('../config/collections')
const { reject, resolve } = require('promise')
const objectId= require('mongodb').ObjectID
const ThenPromise = require('promise')


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
            product_name:updates.product_name,product_price:updates.product_price,sub_category:updates.sub_category,product_category:updates.product_category,product_description:updates.product_description
        }}).then((data)=>{
            // console.log(data);
            let id=objectId(product)
            resolve(id)
        })
        })
    },
    category:(category)=>{
        console.log('hai guys');
        return new Promise (async(resolve,reject)=>{
            let result=await db.get().collection(collections.PODUCT_COLLECTIONS).find({product_category:category}).toArray()
            console.log(result);
            resolve(result)
        })
    },
    subCategory:(category,subCategory)=>{
        
    return new Promise(async(resolve,reject)=>{
    //   let  products=await db.get().collection(collections.PODUCT_COLLECTIONS).find({},{ projection:{
    //       product_category:category,sub_category:subCategory,product_name:1,product_price:1,product_description:1
    //   }}).toArray()
    //   console.log(products);
    //   resolve(products)
    let products=await db.get().collection(collections.PODUCT_COLLECTIONS).find({$and:[{product_category:category},{sub_category:subCategory}]}).toArray()
    console.log(products);
    resolve(products)

    })
    },
    add_category:(category)=>{
        console.log('haaai');
return new Promise((resolve,reject)=>{
    db.get().collection(collections.CATEGORY).insertOne(category).then((data)=>{
        resolve(data)
        console.log(data.ops[0]);
    })
})
    },
    add_subCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY).updateOne({product_category:category.product_category},{
                $push:{sub_category:category.sub_category}
            }).then(()=>{
                resolve()
            })
        })
            },
    getAll:()=>{
        return new Promise(async(resolve,reject)=>{
 let category=await db.get().collection(collections.CATEGORY).find().toArray()
 resolve(category)
 console.log( category[0]
    );
        })
    },
    getAllSUB:()=>{
        return new Promise(async(resolve,reject)=>{
 let category=await db.get().collection(collections.SUBCATEGORY).find().toArray()
 resolve(category)
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
db.get().collection(collections.CATEGORY).updateOne({_id:objectId(id)},{product_category:false}).then(()=>{
resolve()
})
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
db.get().collection(collections.CATEGORY).removeOne({_id:objectId(id)}).then((data)=>{
resolve(data)
})
        })
    }
}