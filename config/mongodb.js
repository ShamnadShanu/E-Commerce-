const MongoCliend=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=(done)=>{
const url='mongodb://localhost:27017'
const dbname='fs'
MongoCliend.connect(process.env.MONGO_CONNECT_URL,(err,data)=>{
    if(err)return done(err)
    state.db=data.db(dbname)
    done()
})
}
module.exports.get=function(){
    return state.db
}