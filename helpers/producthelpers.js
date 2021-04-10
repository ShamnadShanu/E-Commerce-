let db = require('../config/mongodb')
let collections = require('../config/collections')
const { reject, resolve } = require('promise')
const objectId = require('mongodb').ObjectID


module.exports = {
    addproduct: (Data) => {
        console.log(Data.product_price);
        Data.product_price = parseInt(Data.product_price)
        console.log(Data.product_price);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PODUCT_COLLECTIONS).insertOne(Data).then((data) => {
                resolve(data.ops[0]._id);
            })
        })

    },
    getAllproducts: () => {
        let full = {}
        return new Promise(async (resolve, reject) => {
            let Data = await db.get().collection(collections.PODUCT_COLLECTIONS).find().toArray()

            let categories = await db.get().collection(collections.CATEGORY).find().toArray()
            full.category = categories
            full.products = Data
            resolve(full)

        })

    },
    getAllproductsad: () => {
        return new Promise(async (resolve, reject) => {
            let Data = await db.get().collection(collections.PODUCT_COLLECTIONS).find().toArray()
            resolve(Data)

        })

    },
    removeProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PODUCT_COLLECTIONS).removeOne({ _id: objectId(id) }).then(() => {
                resolve()
            })
        })
    },

    getOneproduct: (productsdetails) => {
        return new Promise(async (resolve, reject) => {
            let Product = await db.get().collection(collections.PODUCT_COLLECTIONS).findOne({ _id: objectId(productsdetails) })
            resolve(Product)
        })
    },
    editProduct: (product, updates) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PODUCT_COLLECTIONS).updateOne({ _id: objectId(product) }, {
                $set: {
                    product_name: updates.product_name, product_price: parseInt(updates.product_price), sub_category: updates.sub_category, product_category: updates.product_category, product_description: updates.product_description
                }
            }).then((data) => {
                // console.log(data);
                let id = objectId(product)
                resolve(id)
            })
        })
    },
    category: (category) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collections.PODUCT_COLLECTIONS).find({ product_category: category }).toArray()
            console.log(result);
            resolve(result)
        })
    },
    subCategory: (category, subCategory) => {

        return new Promise(async (resolve, reject) => {
            //   let  products=await db.get().collection(collections.PODUCT_COLLECTIONS).find({},{ projection:{
            //       product_category:category,sub_category:subCategory,product_name:1,product_price:1,product_description:1
            //   }}).toArray()
            //   console.log(products);
            //   resolve(products)
            let products = await db.get().collection(collections.PODUCT_COLLECTIONS).find({ product_category: category }).toArray()
            console.log(products);
            resolve(products)

        })
    },
    add_category: (category) => {
        console.log('haaai');
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY).insertOne(category).then((data) => {
                resolve(data)
                console.log(data.ops[0]);
            })
        })
    },
    add_subCategory: (category) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY).updateOne({ product_category: category.product_category }, {
                $push: { sub_category: category.sub_category }
            }).then(() => {
                resolve()
            })
        })
    },
    getAll: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collections.CATEGORY).find().toArray()
            resolve(category)
            console.log(category[0]
            );
        })
    },
    getAllSUB: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collections.SUBCATEGORY).find().toArray()
            resolve(category)
        })
    },
    deletesubCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY).removeOne({ _id: objectId(id) }).then(() => {
                resolve()
            })
        })
    },
    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY).removeOne({ _id: objectId(id) }).then((data) => {
                resolve(data)
            })
        })
    },
    getOnecategory: (id) => {
        return new Promise(async (resolve, reject) => {
            let done = await db.get().collection(collections.CATEGORY).findOne({ _id: objectId(id) })
            resolve(done)
        })
    },
    editCategory: (id, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY).updateOne({ _id: objectId(id) }, {
                $set: {
                    product_category: data.product_category
                }
            }).then(() => {
                resolve()
            })
        })
    },
    removecart: (Data) => {
        console.log('fji');
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART)
                .updateOne({ _id: objectId(Data.cartId) },
                    {
                        $pull: { products: { item: objectId(Data.proId) } }
                    }
                ).then(() => {
                    resolve()
                })
        })
    },
    applyCoupon: (code) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ couponCod: code })
            let signupReward = await db.get().collection(collections.USER_COLLECTION).findOne({ signupreward:code })
            let forRefferal = await db.get().collection(collections.USER_COLLECTION).findOne({ forRefferal: code })
            console.log(coupon, "coup");
            console.log('signup', signupReward);
            if (coupon) {
                console.log('ll');
                if (coupon.status == 'Active') {
                    resolve({ discount: coupon.discount })
                } else {
                    resolve({ already: true })
                }
            } else if (signupReward) {
                resolve({ success: true })

            } else if (forRefferal) {
                resolve({ forRefferal: true })
            }
            else {
                reject()
            }

        })
    },


    changeCouponstatus: (COUPON, code) => {
        return new Promise((resolve, reject) => {
            if (COUPON == "admin-discount") {
                db.get().collection(collections.COUPON_COLLECTION).updateOne({ couponCod: code },
                    {
                        $set: {
                            status: 'Used'
                        }
                    }).then(() => {
                        resolve()
                    })
            } else if (COUPON == "for-reffering") {
                console.log(code+"[[[[[[[[[[[[[[[][][][][][][]df")
                db.get().collection(collections.USER_COLLECTION).updateOne({ forRefferal: code }, {
                    $pull: {forRefferal:code }
                }).then(() => {
                    resolve()
                })
            } else if (COUPON == "signup-reward") {
                db.get().collection(collections.USER_COLLECTION).updateOne({ signupreward: code }, {
                    $set:{ forRefferal:null}
                }).then(() => {
                    resolve()
                })
            } else {
resolve()
            }
        })
    }
}

















// db.get().collection(collections.USER_COLLECTION).updateOne({coupons:code},{
//     $set:{
//         coupons:false
//     }
//                 }).then(()=>{

//                 })







