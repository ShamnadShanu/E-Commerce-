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
function change(cartId,proId,userId,count){
  let  quantity=parseInt(document.getElementById(proId).innerHTML)
  let subtotal=parseInt(document.getElementById(proId+'1').innerHTML)
  count=parseInt(count)
 $.ajax({
     url:'/change',
     data:{
         user:userId,
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
         console.log(subtotal);
         document.getElementById(proId).innerHTML=quantity+count
         document.getElementById('total').innerHTML=response.total
         document.getElementById('total1').innerHTML=response.total
         if(count==1){
     document.getElementById(proId+'1').innerHTML=subtotal+response.pro
         }
         if(count==-1){
            document.getElementById(proId+'1').innerHTML=subtotal-response.pro
         }
     }
     }
 })
}
