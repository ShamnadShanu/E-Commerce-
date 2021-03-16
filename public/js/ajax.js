const { response } = require("express");

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
            }else{
                window.location.href ="/login"
            }
                  }
    })
}