var db=require('../config/mongodb')
var collections=require('../config/collections')
const { resolve, reject } = require('promise')
var bcrypt=require('bcrypt')
const { response } = require('express')
const { fstat } = require('fs')
const { use } = require('../routes/User')
const objectId= require('mongodb').ObjectID

module.exports={
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
  }else{
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
}

}