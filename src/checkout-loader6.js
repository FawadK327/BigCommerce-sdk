/******************* Including External CSS file Starts ******************/
// import 'bootstrap/dist/css/bootstrap.min.css';
var cssId = 'myCss';  // you could encode the css path itself to generate id..
if (!document.getElementById(cssId))
{
  var head  = document.getElementsByTagName('head')[0];
  var link  = document.createElement('link');
  link.id   = cssId;
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://qisstpaysnadbox-bigcommerce.s3.ap-southeast-1.amazonaws.com/bigCommerceOneClick.css';   //Path where external css file is deployed
  link.media = 'all';
  head.appendChild(link);
  /******************* Including Bootstrap link Starts ******************/
  var bootstrapLink = document.createElement('link');
  bootstrapLink.rel="stylesheet";
  bootstrapLink.href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css";
  bootstrapLink.crossorigin="anonymous";
  head.appendChild(bootstrapLink);
/******************* Including Bootstrap link Ends ******************/
}
/******************* Including External CSS file End ******************/

var el = document.createElement('script');  //getting the script element
var bigCommerce_checkout = null;
  el.onload = function(){                      //After the scrip loaded function starts
    checkoutKitLoader.load('checkout-sdk')   //From bigcommerce checkout package 
    .then(function (module) {
      var checkoutService = module.createCheckoutService();
      return checkoutService.loadCheckout(window.checkoutConfig.checkoutId);
    })
    .then(function (state) {
      console.log('Checkout SDK Quickstart', state.data.getCheckout()); 
      /********* Get all the products data included in checkout *********/
      var products = state.data.getCheckout().cart.lineItems.physicalItems;

      /************** Open Iframe function on checkout page **********/
      bigCommerce_checkout = qisstpay_open_checkout_cart(); 
      function qisstpay_open_checkout_cart() {
        var cartObj = [];
        var checkoutObj = state.data.getCheckout();
        var total_tax = checkoutObj.taxTotal;   //Total tax applied on recent checkout 
        var total_shipping = checkoutObj.shippingCostTotal; //Getting Total shipping Cost
        var shipping_method = checkoutObj.consignments.length ? checkoutObj.consignments[0].selectedShippingOption : [];   //Getting the selected shipping method 
        console.log('ShippingMethod : ',shipping_method);
        cartObj = checkoutObj.cart;    //Cart object including all the details of cart
        
        if(cartObj){
          
          let qisstpay_merchant_token = btoa(location.hostname);  //Merchant token generated on backend
          // let qisstpay_merchant_token = 'cWlzc3RwYXkubXliaWdjb21tZXJjZS5jb20=';
          //   console.log('hostname :',location.hostname,'url: ', 'https://'+location.hostname);
          var qisstpay_products = [];
          var totalPrice = cartObj.baseAmount;   //Cart total price after discount and shippingCost
          var items = cartObj.lineItems.physicalItems;  //Cart products
          
          if(items) {
            for(let i=0; i < items.length; i++){
              let prod = items[i];
              let attrs = [];
              let attr_ids = [];
              
              if(prod.options){
                let val = prod.options;
                
                for(let j=0; j < val.length; j++){
                  let attr = {
                    [val[j].name]: val[j].value,                        
                  };
                  let attribute_id = {
                    'attr_id' : val[j].nameId,
                    'attr_value_id' : val[j].valueId,
                  };
                  
                  attrs.push(attr);
                  attr_ids.push(attribute_id);
                  
                }
              }
              
              let src2 = prod ? prod.imageUrl : '';
              src2 = src2.indexOf('?') !== -1? src2.substring(0, src2.indexOf('?')): src2;
              //src2 = src2.replace('https:', '');
              //src2 = 'https::' + src2;
              
              let new_title = prod.name.replaceAll('&', '%26');
              
              let tempProd = {
                id: prod.productId,
                price: prod.salePrice,
                quantity: prod.quantity,
                src: src2,
                title: new_title,
                variant_id: prod.variantId,
                attribute: attrs,
                attribute_ids: attr_ids,
                
                sku:prod.sku
              }
              
              qisstpay_products.push(tempProd);
              
            }
          }
          /****************** Parameters to be passed in url *****************/
          queryUrl = btoa(unescape(encodeURIComponent(`products=`+JSON.stringify(qisstpay_products)+`&price=`+totalPrice+'&cartId='+cartObj.id+'&currency='+cartObj.currency.code+'&shipping_total='+total_shipping+'&tax='+total_tax+'&discountedAmount='+cartObj.discountAmount+'&shipping_methods='+JSON.stringify(shipping_method)+'&platForm=bigCommerce&url=https://'+location.hostname)));
          //*********************************************************************//
          
          url = `https://ms.tezcheckout.qisstpay.com/?identity-token=`+qisstpay_merchant_token+'&queryUrl='+queryUrl; //Url to be passed to the iframe src attribute
          qisstpay_modal = `
            <div id="qp-checkout-modal">
              <div class="qp8911_modal modal custom_modal_by_me" id="qp8911_bootstrapModal_checkout" role="dialog">
                <div class="qp8911_modal-dialog modal-dialog qp8911_modal-dialog-centered" role="document" >
                  <div class="qp8911_modal-content modal-content col-md-6 col-lg-4">
                    <!-- Modal Header -->
                    <!-- Modal Body -->
                    <div class="qp8911_modal-body modal-body teez" style="border-radius: 140px;">
                      <div class="qp-lds-roller" id="qp-lds-roller">
                        <lottie-player src="'.plugins_url( 'js/animation_qp_logo.json', __FILE__ ).'" background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player>
                      </div>
                      <iframe id="qisttpayifram" class="qisttpayifram" width="100%" height="600"  src='`+url+`'  frameborder="0" allowpaymentrequest allowfullscreen style="background: #FFFFFF;border-radius: 22px;padding: 0px;" ></iframe>
                    </div>                      
                  </div>
                </div>
              </div>
            </div>`;
    
          /********** Appending and Displaying Iframe on the site starts **********/
          qisstpay_modal = htmlToElement(qisstpay_modal);
          document.getElementsByTagName('body')[0].appendChild(qisstpay_modal);
    
          document.getElementById('qp8911_bootstrapModal_checkout').style.display = 'block';
          document.getElementsByTagName('body')[0].style.position = 'fixed';
          document.getElementsByTagName('body')[0].style.width = '100%';
          /********** Appending and Displaying Iframe on the site Ends **********/
        }
            
      }
              
    });
  }
  el.src = 'https://checkout-sdk.bigcommerce.com/v1/loader.js';   //Loading checkout sdk in script tag
  document.head.appendChild(el);

  /***************** Creating HTML starts ******************/
  function htmlToElement(html) {
      var template = document.createElement('template');
      html = html.trim(); // Never return a text node of whitespace as the result
      template.innerHTML = html;
      return template.content.firstChild;
  }
  /***************** Creating HTML Ends ******************/
