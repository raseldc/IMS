import {apiGetRequest} from '../apiRequest.js'

$(document).ready(function(){

    //  let baseUrl = 'https://pos.bikerscafebd.com/api/'
    let baseUrl = 'http://0.0.0.0:8001/api/'

    let cartList = []
    let salesList = []
    let searchProductList = []

    $("#btn-search").on("click", function(){
        let searchedProduct = apiGetRequest(baseUrl+'products/'+$("#search").val())
        searchedProduct.success(function(data){
            if(data.length < 1){
                showDialog("Not Available","This Product is Not Available")
            }else{
                appendToSearchBody(data)
                $("#search").val("")
            }
        })
    })

    $( "#search" ).on('input',function(){

        let products = apiGetRequest(baseUrl+'search/engine/'+$("#search").val())
        products.success(function(data){
            searchProductList = []
            data.forEach(function(item,i){
                searchProductList.push(data[i].name)
            })

            $( "#search" ).autocomplete({
              source: searchProductList
            });

        })

    });



    $(".btn-supplier").on("click", function(){
        let body = `
            <input class="form-control form-control-sm mt-1" type="text" id="supplier-name" name="firstname" placeholder="Customer Name">
            <input class="form-control form-control-sm mt-1" type="text" id="company-name" name="firstname" placeholder="Company Name">
            <input class="form-control form-control-sm mt-1" type="number" id="company-number" name="firstname" placeholder="Contact number">
        `

        $('.modal-body').empty().append(body)
        $('.modal-title').text("Create Customer")
        $('#myModal').modal('show')
    })

    $("#myModal").on('click', '.save', function(){
           createSupplier()
    })

    $("#btn-print").on("click", function(){
        console.log(salesList.length)
        if(salesList.length > 0){
            printInvoice()
        }else{
            showDialog("Print Error","Please Add items to cart and fill up everything and press \"Confirm\" Button then Press Print")
        }

    })

    $("#btn-confirm").on("click", function(){
        $('.input-discount').val("0")
        $('.input-payment').val("0")
        calculateTotal()
        let invoice = apiGetRequest(baseUrl+'invoice/')
        invoice.success(function(data){
            $(".input-invoice").val(data['invoice'])
        })
    })

    $(".btn-purchase").on("click", function(){
       purchase()
    })

    $('.input-discount').on('input', function(){
        $(".total").text(parseInt($(".sub-total").text()) - getValid(parseInt(this.value)) + parseInt(getValid($(".input-vat").val())))
    });

    $('.input-payment').on('input', function(){
        $(".input-vat").val(parseInt($(".total").text()) - parseInt(getValid(this.value)))
    });

    $("#myModal").on('click', '.save', function(){
        location.reload();
    })

    $("#myModal").on('click', '.close', function(){
        location.reload();
    })


    $("#search-body").on("click",'.button-edit', function(){
        var name = $(this).closest("tr").find("td").eq(0).html();
        var price = $(this).closest("tr").find("td").eq(1).html();
        var quantity = $(this).closest("tr").find("td").eq(2).html();
        var rowId = $(this).closest("tr").attr('id');


        if(cartList.includes(rowId)){
            alert("Already Product Added")
        }else if(parseInt(quantity) <= 0){
            showDialog("Quantity Error",name+" is not Available")
        }else{
            let data = {
                "id" : rowId,
                "name" : name,
                "price" : price
            }
            cartList.push(rowId)
            appendToCartBody(data)
        }

    })

    function appendToSearchBody(data) {

        $.each(data, function( key, value ) {
            if(!cartList.includes(data[key].id) || cartList.length == 0) {
                cartList.push(data[key].id);
                let body = `<tr class="col-12">

                    <td>${data[key].id}</td>
                    <td>${data[key].name}</td>
                    <td>${data[key].unit}</td>
                    <td><input class="table-input " type="number" min="0" max="${data[key].unit}"/></td>
                    <td><input class="table-input " type="text"/></td>
                    <td>${data[key].purchase_price}</td>
                    <td><input class="table-input " type="number"/></td>
                    <td></td>
                    <td></td>
                    <td class="button">
                        <button type="button" class="button-delete" data-toggle="tooltip" data-placement="bottom" title="add product"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`

                $("#cart-body").append(body)
            }

        })
    }

    function appendToCartBody(data){
        let body = `<tr class="col-12">
            <td>${data.name}</td>
            <td>${data.price}</td>
            <td class="col-4"><input class="form-control form-control-sm text-center" type="number"/></td>
            <td class="button">
                <button type="button" class="button-delete" data-toggle="tooltip" data-placement="bottom" title="add product"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`

        $("#cart-body").append(body)
    }


    function calculateTotal(){
        let sum = 0
        let price = ""
        let totalBillAmount = 0

        $("#cart-body>tr").each(function(index,tr){
            let id = $(this).closest("tr").find("td").eq(0).text()
            let name = $(this).closest("tr").find("td").eq(1).text()
            let stockQuantity = $(this).closest("tr").find("td").eq(2).text()

            let quantity = parseInt($(this).closest("tr").find("td").eq(3).find("input").val())
            let code = $(this).closest("tr").find("td").eq(4).find("input").val()
            let sellingPrice = parseFloat($(this).closest("tr").find("td").eq(6).find("input").val())
            let purchasePrice = parseInt($(this).closest("tr").find("td").eq(5).text())

            let profit = quantity * purchasePrice
            let total = quantity * sellingPrice

            $(this).closest("tr").find("td").eq(8).text(profit)
            $(this).closest("tr").find("td").eq(7).text(total)

            totalBillAmount += total

            let item = {
               "id" : id,
               "name" : name,
               "stockQuantity" : stockQuantity,
               "quantity" : quantity,
               "code" : code,
               "sellingPrice" : sellingPrice,
               "purchasePrice" : purchasePrice,
               "total" :  total,
               "profit" : profit
            }

            addToSales(item)

        })

        console.log(salesList)

        $(".sub-total").text(totalBillAmount)
        $(".total").text(totalBillAmount)
    }

    function addToSales(data){
        salesList.push(data)
    }

    function purchase(){

        let customer = customerInfo()

        if(validatePurchase()){
            let body = JSON.stringify({
                "customer": customer,
                "products" : cartList,
                "salesList" : salesList,
                "total" : getValid($(".total").text()),
                "discount" : getValid($(".input-discount").val()),
                "due" : getValid($(".input-vat").val()),
                "payment" : getValid($(".input-payment").val()),
                "invoice" : $(".input-invoice").val(),
                "custom_date": $(".input-date").val()
            })

            $.ajax({
                // Our sample url to make request
                url:baseUrl+'sales/',

                // Type of Request
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=utf-8',
                },
                method: 'POST',
                dataType: 'json',
                data : body,

                // Function to call when to
                // request is ok
                success: function (data) {
                   clearOnSuccess(data.status)
                   showDialog("Sales Status",data['message'])
                },

                // Error handling
                error: function (error) {
                    console.log(`Error ${error}`);
                }
            });
        }
    }


    function getValid(data){
        if(data == "Nan" || isNaN(data) || data == "" || data == 'undefined' || data == '0' || data == 0 || parseInt(data) < 0){
            return 0
        }else{
            return data
        }
    }

    function getIsNan(data){
        if(isNaN(data)){
            return 1
        }

        return data
    }

    function createSupplier(){
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'customer/',

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'POST',
            dataType: 'json',
            data : JSON.stringify({
                'name' : $("#supplier-name").val(),
                'company_name' : $("#company-name").val(),
                'mobile' : $("#company-number").val()
            }),

            // Function to call when to
            // request is ok
            success: function (data) {
               $('#myModal').modal('hide')
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function showDialog(title,message) {
        let body = `
            <p>${message}</p>
        `

        $('.modal-body').empty().append(body)
        $('.modal-title').text(title)
        $('#myModal').modal('show');
    }

    function validatePurchase(){
        if(getValid($(".input-mobile").val()) == 0){
            showDialog("Customer Number","Customer Number Required")
            return false
        }else if(cartList.length == 0){
            showDialog("Purchase List","Purchase List is Empty")
            return false
        }else{
            return true
        }

    }

//    <------------- Clearing Page Data -------------------->
    function clearOnSuccess(status){
        if(status == 201){
            salesList = []
            cartList = []
            $("#search-body").empty()
            $("#cart-body").empty()
            $(".sub-total").text("0")
            $(".total").text("0")
            $('.input-discount').val(0)
            $('.input-vat').val(0)
            $('.input-payment').val(0)
            $(".input-name").val('')
            $(".input-mobile").val('')
            $(".input-address").val('')
            $(".input-nid-drive").val('')
        }
    }

    function customerInfo(){
        return {
            "name" : $(".input-name").val(),
            "mobile" : $(".input-mobile").val(),
            "address" : $(".input-address").val(),
            "nid" : $(".input-nid-drive").val(),
        }
    }


    function printInvoice(){
        let winPrint = window.open('', '', width=800,height=600,toolbar=0);
        var body = invoiceBody()
        winPrint.document.write(body);
        winPrint.print();
    }

    function invoiceBody(){
        let body = `
            <style>
                .center{
                    text-align: center;
                }
                .image{
                    display: block;
                      margin-left: auto;
                      margin-right: auto;
                      width: 20%;
                }
                th {
                  background-color: #EEEEEE;
                  color: black;
                }

                table,th {
                  border: 1px solid #ddd;
                  text-align: left;
                }

                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-top: 15px;
                }

                th{
                  padding: 2px;
                }
            </style>
            <div>


                <div class="center"><h3>Medipack</h3></div>
                <div class="center"><h5>Best Medical Products</h5></div>
                <div class="center"><h5>Phone - </h4></div>
                <hr>

                <table>

                  <thead>

                  </thead>
                  <tbody class="bill-details">
                        ${invoiceDetails()}
                  </tbody>
                </table>

                <table>
                  <thead>
                    <tr>
                       <td>Product Information</td>
                    </tr
                    <tr>
                       <th>Item Name</th>
                       <th>Lot No</th>
                       <th>Quantity</th>
                       <th>Unit</th>
                       <th>Price</th>
                       <th>Total</th>
                    </tr>
                  </thead>
                  <tbody id="bike-details">
                        ${bikeDetails()}
                  </tbody>
                </table>


            </div>
        `

            return body;
    }

    function bikeDetails(){
        let body = ``
        $("#cart-body>tr").each(function(index,tr){
             body += `<tr class="col-12">
                       <td>${$(this).closest("tr").find("td").eq(1).text()}</td>
                       <td>${$(this).closest("tr").find("td").eq(4).find("input").val()}</td>
                       <td>${$(this).closest("tr").find("td").eq(3).find("input").val()}</td>
                       <td>PCs</td>
                       <td>${$(this).closest("tr").find("td").eq(6).find("input").val()}</td>
                       <td>${$(this).closest("tr").find("td").eq(7).text()}</td>

                </tr>`
        })

        body += `<tr class="col-12" style="border: 1px solid #ddd;
                  text-align: left;">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                </tr>
                <tr>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Sub Total</td>
                       <td>${$(".sub-total").text()}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Discount</td>
                       <td>${$('.input-discount').val()}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Payment</td>
                       <td>${$('.input-payment').val()}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Due</td>
                       <td>${$('.input-due').val()}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <th>Total</th>
                       <th>${$('.total').text()}</th>
                </tr>`

        return body;
    }

    function billDetails(){
        let body = `<tr class="col-12">
                    <td>${$('.input-discount').val()}</td>
                    <td>${$('.input-payment').val()}</td>
                    <td>${parseInt($(".total").text()) - $('.input-payment').val()}</td>
                    <td>15%</td>
                    <td>${parseInt($(".total").text())}</td>
                </tr>`

        return body;
    }

    function invoiceDetails(){

            $(".input-mobile").val('')

            $(".input-nid-drive").val('')
        let customer = customerInfo()
        let body = `<tr class="col-12">
                    <th>Customer Name</th>

                    <th>Mobile</td>

                    <th>Address</td>

                </tr>
                <tr>
                <td>${$(".input-name").val()}</th>
                <td>${$(".input-mobile").val()}</td>
                <td>${$(".input-address").val()}</td>
                </tr>`



        return body;
    }
})
