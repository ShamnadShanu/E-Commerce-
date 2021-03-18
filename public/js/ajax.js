const { response } = require("express");
const { fchmod } = require("fs");

function addToCart(proId){
    $.ajax({ 
        url:'/addtocart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.user){
                if(response.status){
                    let count=$('#cart-count').html()
                    count=parseInt(count)+1
                    $("#cart-count").html(count )
                }
            }
            else{
                window.location.href ="/login"
            }
                  }
    })
}
function change(cartId,proId,count){
  let  quantity=parseInt(document.getElementById(proId).innerHTML)
  count=parseInt(count)
 $.ajax({
     url:'/change',
     data:{
         cart:cartId,
         product:proId,
         count:count,
         quantity:quantity
     },
     method:'post',
     success:(response)=>{
     if(response.remove){
         location.reload()
     }else{
         document.getElementById(proId).innerHTML=quantity+count
     }


     }
 })
}