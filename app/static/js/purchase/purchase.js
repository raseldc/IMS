import {apiGetRequest} from '../apiRequest.js'

$(document).ready(function(){

    //  let baseUrl = 'https://pos.bikerscafebd.com/api/'
    let baseUrl = 'http://0.0.0.0:8001/api/'

    let totalPurchasePrice = 0
    let totalSellingPrice = 0

    let cartList = []
    let salesList = []
    let productSpecificationsList = []
    let searchBodyList = []
    let productList = []

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

    $("#search").on('input',function(){
        let searchProductList = []
        let products = apiGetRequest(baseUrl+'search/engine/'+$("#search").val())
        products.success(function(data){
            data.forEach(function(item,i){
                searchProductList.push(data[i].name)
            })

            $("#search").autocomplete({
              source: searchProductList
            });

        })

    });

    $("#btn-print").on("click", function(){
        printInvoice();
    })

    $(".btn-supplier").on("click", function(){
        let body = `
            <input class="form-control form-control-sm mt-1" type="text" id="supplier-name" name="firstname" placeholder="Supplier Name">
            <input class="form-control form-control-sm mt-1" type="text" id="company-name" name="firstname" placeholder="Company Name">
            <input class="form-control form-control-sm mt-1" type="number" id="company-number" name="firstname" placeholder="Contact number">
        `

        $('.modal-body').empty().append(body)
        $('.modal-title').text("Create Supplier")
        $('#myModal').modal('show')
    })

    $("#myModal").on('click', '.save', function(){
           createSupplier()
    })

    $("#btn-confirm").on("click", function(){
        $('.input-discount').val("0")
        $('.input-payment').val("0")
        calculateTotal()
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



//    <------------- Modal Button Click -------------------->

    $("#myModal").on('click', '.save', function(){
        location.reload();
    })

    $("#myModal").on('click', '.close', function(){
        $('#myModal').modal('hide')
    })

    $("#search-body").on("click",'.button-edit', function(){
        var name = $(this).closest("tr").find("td").eq(0).html();
        var price = $(this).closest("tr").find("td").eq(1).html();
        var quantity = $(this).closest("tr").find("td").eq(2).html();
        var purchaseQuantity = $(this).closest("tr").find("td").eq(3).find("input").val();
        var rowId = $(this).closest("tr").attr('id');


        if(cartList.includes(rowId)){
            alert("Already Product Added")
        }else{
            let data = {
                "id" : rowId,
                "name" : name,
                "price" : price,
                "quantity" : parseInt(purchaseQuantity)
            }
            cartList.push(rowId)
//            productList.push(data)
            appendToCartBody(data)

        }

    })

    function getProductList(){
        $.ajax({
            // Our sample url to make request
            url: baseUrl+'search/products/'+$("#search").val(),

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'GET',
            dataType: 'json',


            // Function to call when to
            // request is ok
            success: function (data) {
               appendToSearchBody(data)
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function appendToSearchBody(data) {

        $.each(data, function( key, value ) {
            if(!cartList.includes(data[key].id) || cartList.length == 0) {
                cartList.push(data[key].id);
                let body = `<tr id="${data[key].id}">
                            <td>${data[key].name}</td>
                            <td>${data[key].unit}</td>
                            <td class="col-1"><input class="mt-1" type="number" id="company-number" name="firstname" placeholder="Quantity"></td>
                            <td class="col-1"><input class="mt-1" type="number" id="company-number" name="firstname" placeholder="Lot Number / Code"></td>
                            <td class="col-1"><input class="mt-1" type="number" id="company-number" name="firstname" placeholder="Price"></td>

                            <td class="button d-flex justify-content-center">
                                <button type="button" class="button-edit"  data-toggle="tooltip" data-placement="bottom" title="add product"><i class="fa-solid fa-plus"></i></button>
                            </td>
                          </tr>`

                $("#search-body").append(body)
            }
        })
    }

    function appendToCartBody(data){


        for(i=0 ;i<data['quantity'] ;i++){
            console.log(data.name);
            let body = `<tr class="col-12">
                <td>${data.name}</td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td><input class="table-input " type="text"/></td>
                <td class="button">
                    <button type="button" class="button-delete" data-toggle="tooltip" data-placement="bottom" title="add product"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`

            $("#cart-body").append(body)

        }


    }

    function calculateTotal(){
        let sum = 0
        totalPurchasePrice = 0
        totalSellingPrice = 0
        searchBodyList = []
        salesList = []
        $("#search-body>tr").each(function(index,tr){
            let name = $(this).closest("tr").find("td").eq(0).text()
            let availableQuantity = $(this).closest("tr").find("td").eq(1).text()
            let code = $(this).closest("tr").find("td").eq(3).find("input").val()
            let quantity = $(this).closest("tr").find("td").eq(2).find("input").val()
            let sellingPrice = $(this).closest("tr").find("td").eq(4).find("input").val()

            totalPurchasePrice += getValid(parseInt(sellingPrice)) * getValid(parseInt(quantity))

            let item = {
                "name" : name,
                "purchasePrice" : getValid(parseInt(sellingPrice)) * getValid(parseInt(quantity)),
                "code": code,
                "availableQuantity" : availableQuantity,
                "quantity": quantity
            }
            productList.push(item);
            searchBodyList.push(item)
//            sum = sum + (totalPrice)
            addToSales(item)

        })
        $(".sub-total").text(totalPurchasePrice)
        $(".total").text(totalPurchasePrice)
    }

    function addToSales(data){
        salesList.push(data)
    }

    function purchase(){

        console.log(salesList);

        if(validatePurchase()){
            let body = JSON.stringify({
                "products" : productList,
                "products_details": searchBodyList,
                "total" : getValid($(".total").text()),
                "discount" : getValid($(".input-discount").val()),
                "due" : getValid($(".input-vat").val()),
                "supplier" : getValid($(".input-mobile").val()),
                "payment" : getValid($(".input-payment").val()),
                "invoice" : getValid($(".input-purchase-invoice").val()),
                "custom_date": $(".input-date").val()
            })

            $.ajax({
                // Our sample url to make request
                url:baseUrl+'purchase/',

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
                   showDialog("Purchase Status",data['message'])
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
            url:baseUrl+'supplier/',

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
               alert("success")
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
        $('#myModal').modal('show')
    }

    function validatePurchase(){
        if(getValid($(".input-mobile").val()) == 0){
            showDialog("Supplier Number","Supplier Number Required")
            return false
        }else if(salesList.length == 0){
            showDialog("Purchase List","Purchase List is Empty")
            return false
        }else{
            return true
        }

    }

    function clearOnSuccess(status){
        if(status == 201){
            salesList = []
            cartList = []
            productList = []
            searchBodyList = []
            $("#search-body").empty()
            $("#cart-body").empty()
            $(".sub-total").text("0")
            $(".total").text("0")
            $('.input-discount').val(0)
            $('.input-vat').val(0)
            $('.input-payment').val(0)
            $('.input-mobile').val(0)
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
                table, td, th {
                  border: 1px solid #ddd;
                  text-align: left;
                }

                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-top: 15px;
                }

                th, td {
                  padding: 5px;
                }
            </style>
            <div>
                <img class="image" src="http://0.0.0.0:8001/static/img/logo/bikers_cafe.png" %}" alt="Girl in a jacket" width="100" height="60">

                <div class="center"><h3>Bikers Cafe</h3></div>
                <div class="center"><h4>A complete Biker's Solution</h4></div>
                <hr>

                <table>
                  <caption>Supplier Summary</caption>
                  <thead>
                    <tr>
                        <th>Company</th>
                        <th>Purchase Invoice</th>
                        <th>System Invoice</th>
                        <th>Mobile</th>
                        <th>Total</th>
                      </tr>
                  </thead>
                  <tbody class="bill-details">
                        ${invoiceDetails()}
                  </tbody>
                </table>

                <table>
                  <caption>Bike Specification</caption>
                  <thead>
                    <tr>
                        <th>Name</th>
                        <th>Model</th>
                        <th>Engine No</th>
                        <th>Chassis No</th>
                        <th>Color</th>
                        <th>Battery</th>
                        <th>Key No</th>
                        <th>Purchase Price</th>
                      </tr>
                  </thead>
                  <tbody id="bike-details">
                        ${bikeDetails()}
                  </tbody>
                </table>

                <table>
                  <caption>Statement Summary</caption>
                  <thead>
                    <tr>
                        <th>Name</th>
                        <th>Discount</th>
                        <th>Payment</th>
                        <th>Due</th>
                        <th>Vat</th>
                        <th>Price</th>
                      </tr>
                  </thead>
                  <tbody class="bill-details">
                        ${billDetails()}
                  </tbody>
                </table>

                <div style="position: fixed;bottom: 0;width: 100%;">
                    <hr>
                    <h4 class="center">Jassore Road, Goalchamot,(Opposite of West Power Distribution Co.Ltd.) Faridpur.</h4>
                    <h4 class="center">E-mail: bikerscafefp.suzukimc22@gmail.com Mob: 01718-747802, 01840-790152, 01840-790153 </h4>
                </div>


            </div>
        `

            return body;
    }

    function bikeDetails(){
        let body = ``
        var data = searchBodyList
            console.log(data)
            for(i=0 ;i<data.length ;i++){

                body += `<tr class="col-12">
                    <td>${data[i].name}</td>
                    <td>${data[i].model}</td>
                    <td>${data[i].engine}</td>
                    <td>${data[i].chassis}</td>
                    <td>${data[i].color}</td>
                    <td>${data[i].battery}</td>
                    <td>${data[i].key}</td>
                    <td>${data[i].totalPurchasePrice}</td>
                </tr>`
            }

        return body;
    }

    function billDetails(){
        let body = `<tr class="col-12">
                    <td>Rancon Group</td>
                    <td>${$('.input-discount').val()}</td>
                    <td>${$('.input-payment').val()}</td>
                    <td>${parseInt($(".total").text()) - $('.input-payment').val()}</td>
                    <td>15%</td>
                    <td>${parseInt($(".total").text())}</td>
                </tr>`

        return body;
    }

    function invoiceDetails(){
        let body = `<tr class="col-12">
                    <td>Rancon Group</td>
                    <td>Rancon Group</td>
                    <td>Rancon Group</td>
                    <td>Rancon Group</td>
                </tr>`

        return body;
    }

    function loading(){
        $(".loader").removeClass("d-none").addClass("d-block")
        $(".content-body").removeClass("d-block").addClass("d-none")
    }

    function cancelLoading(){
        $(".content-body").removeClass("d-none").addClass("d-block")
        $(".loader").removeClass("d-block").addClass("d-none")
    }


})
