import {apiGetRequest} from '../apiRequest.js'

$(document).ready(function(){


//  let baseUrl = 'https://pos.bikerscafebd.com/api/'
    let baseUrl = 'http://0.0.0.0:8001/api/'

    let dataSave = ""
    let salesId = ""
    let purchaseId = ""
    let salesData;

    getSales(baseUrl+'sales',"")

    let reportResponse = apiGetRequest(baseUrl+'accounts')

    reportResponse.success(function(data){
        $("#total-purchase").text(data.report.total_purchase)
        $("#total-purchase-due").text(data.report.total_purchase_due)
        $("#total-sales").text(data.report.total_sales)
        $("#total-sales-due").text(data.report.total_sales_due)
        $("#total-expense").text(data.report.total_expense)
        $("#total-expense-due").text(data.report.total_expense_due)
    })

    $(".btn-purchase").on("click", function(){
        getPurchaseData()
    })

    $(".btn-bill-create").on("click", function(){
        dataSave = "CREATE_EXPENSE"
        createBillDialog()
    })



    $(".btn-expense").on("click", function(){
        showExpenseData()
    })

    /* Sales Functions */

    $(".btn-sales").on("click", function(){
        getSalesData()
    })

    $("#sales-body").on('click','.button-view',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        productDetails(id)
    })

    $("#sales-body").on('click','.button-print',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        getSales(baseUrl+'sales/'+id)
    })

    $("#sales-body").on('click','.button-edit',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        salesId = id
        productDetailsEdit(id)
    })

    $(".btn-sales-report").on('click',function(){
        alert(`fromDate - ${$("#sales-from-date").val()}\nToDate - ${$("#sales-to-date").val()}`)
    })

    /* Purchase Functions */

    $(".btn-purchase-report").on('click',function(){
//        alert(`fromDate - ${$("#purchase-from-date").val()}\nToDate - ${$("#purchase-to-date").val()}`)
        let response = apiGetRequest(`${baseUrl}purchase/report/${$("#purchase-from-date").val()}/${$("#purchase-to-date").val()}`)

        response.success(function(data){
            appendToPurchase(data)
        })
    })


    $("#purchase-body").on('click','.button-view',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        purchaseDetails(id,"VIEW")
    })

    $("#purchase-body").on('click','.print-purchase',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        purchaseDetails(id,"PRINT")
    })

    $(".btn-purchase-report").on('click',function(){
        alert(`fromDate - ${$("#purchase-from-date").val()}\nToDate - ${$("#purchase-to-date").val()}`)
    })

    $("#purchase-body").on('click','.button-edit',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        purchaseId = id
        dataSave = "PURCHASE_EDIT"
        purchaseDetails(id,"EDIT")
    })

    $("#myModal").on('click', '.save', function(){

        console.log(dataSave)

        if(dataSave == "EDIT"){
            updateSalesDue(baseUrl+'sales/'+salesId)
        }
        if(dataSave == "PURCHASE_EDIT"){
            updateSalesDue(baseUrl+'purchase/'+purchaseId)
        }
        if(dataSave == "CREATE_EXPENSE"){
            let data = JSON.stringify({
                "name": $(".bill-name").val().trim(),
                "mobile": $(".bill-mobile").val().trim(),
                "description" : $(".bill-description").val().trim(),
                "type" : $(".bill-type option:selected").text().trim(),
                "amount": $(".bill-amount").val().trim(),
                "custom_date" : $(".input-date").val().trim()
            })

            apiPostRequest(baseUrl+'accounts/', data)
        }
    })

    function salesDetails(endpoint,id){

    }

    $("#myModal").on('click', '.close', function(){
        $('#myModal').modal('hide')
    })

    function showExpenseData(){
        $(".purchase").removeClass("d-block").addClass("d-none")
        $(".sales").removeClass("d-block").addClass("d-none")
        $(".expense").removeClass("d-none").addClass("d-block")

        getExpense(baseUrl+'accounts/')
    }

    function getSalesData(){
        $(".purchase").removeClass("d-block").addClass("d-none")
        $(".expense").removeClass("d-block").addClass("d-none")
        $(".sales").removeClass("d-none").addClass("d-block")

        getSales(baseUrl+'sales')
    }

    function getPurchaseData(){
        $(".sales").removeClass("d-block").addClass("d-none")
        $(".purchase").removeClass("d-none").addClass("d-block")
        $(".expense").removeClass("d-block").addClass("d-none")

        getPurchase()
    }


    function createBillDialog(){

        let body = `
            <div class="Col-12">
                <div class="row d-flex justify-content-around">
                    <input class="col-sm-12 col-md-3 col-lg-3 bill-name" type="text" placeholder="Bill Name"/>
                    <input class="col-sm-12 col-md-3 col-lg-3 mx-1 bill-mobile" type="text" placeholder="Mobile Number"/>

                    <select class="col-sm-12 col-md-4 col-lg-3 bill-type" name="cars" id="cars">
                      <option class="text-muted" value="1">Bill Type</option>
                      <option value="3">Transport</option>
                      <option value="4">Office Expense</option>
                      <option value="5">Others</option>
                    </select>


                </div>

                <div class="row d-flex justify-content-end p-4">
                    <textarea class="form-control col-8 bill-description" id="exampleFormControlTextarea1" rows="3" cols="2" placeholder="Bill Description"></textarea>
                    <input class="col-sm-12 col-md-3 col-lg-3 my-1 input-date mx-1" type="date"/>
                    <input class="col-sm-12 col-md-3 col-lg-3 my-1 bill-amount" type="number" placeholder="Amount" min="0"/>
                </div>

            </div>
        `

        $(".modal-dialog").addClass("modal-lg")
        $('.modal-title').text("Create Bill")
        $('.modal-body').empty().append(body)

        $('#myModal').modal('show')
    }

//    $("#purchase-body").on('click','.button-view',function(){
//        let id = $(this).closest("tr").find("td").eq(0).text()
//        productDetails(id)
//    })

    $("#myModal").on('click', '.close', function(){
        $('#myModal').modal('hide')
    })

//    $("#btn-search-sales").on('click', function(){
//        let value = $(".input-search").val()
//        console.log(value)
//        if(value != ""){
//            getProducts(baseUrl+'search/products/'+value)
//        }
//    })

    function getPurchase(){
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'purchase/',

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
            console.log(data)
               appendToPurchase(data)
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function getExpense(endpoint){
        $.ajax({
            // Our sample url to make request
            url:endpoint,

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
               appendToExpense(data)
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function apiPostRequest(endpoint,data){

        $.ajax({
            // Our sample url to make request
            url: endpoint,

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'POST',
            method: 'POST',
            dataType: 'json',
            data:data,

            // Function to call when to
            // request is ok
            success: function (data) {
               $('#myModal').modal('hide')
               alert('Bill Created Successfully')
               showExpenseData()
            },

            // Error handling
            error: function (error) {
                $('#myModal').modal('hide')
            }
        });
    }

    function updateSalesDue(endpoint){

        $.ajax({
            // Our sample url to make request
            url: endpoint,

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'PUT',
            dataType: 'json',
            data:JSON.stringify({
                "due": $(".input-due").val().trim(),
            }),

            // Function to call when to
            // request is ok
            success: function (data) {
               $('#myModal').modal('hide')
               alert(data['message'])
               if(dataSave == "EDIT"){
                  getSalesData()
               }else{
                  getPurchaseData()
               }

               salesId = ""
            },

            // Error handling
            error: function (error) {
                $('#myModal').modal('hide')
            }
        });
    }

    function getSales(endpoint) {
        $.ajax({
            // Our sample url to make request
            url: endpoint,

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
                if(endpoint == baseUrl + 'sales'){
                    appendToSales(data)
                }else{
                    salesData = data
                    printInvoice(data)
                }

            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function getPurchaseDetails(endpoint) {
        $.ajax({
            // Our sample url to make request
            url: endpoint,

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
                if(endpoint == baseUrl + 'purchase'){
                    appendToSales(data)
                }else{
                    salesData = data
                    printInvoice(data)
                }

            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }


    function appendToPurchase(data){
        $("#purchase-body").empty()
        $.each(data, function( key, value ) {
            let body = `<tr>
                        <td>${data[key]['id']}</td>
                        <td>Rancon</td>
                        <td>${data[key]['invoice']}</td>
                        <td>${data[key]['discount']}</td>
                        <td>${data[key]['dues']}</td>
                        <td>${data[key]['payment']}</td>
                        <td>${data[key]['total']}</td>
                        <td>${data[key]['custom_date']}</td>
                        <td class="button d-flex justify-content-center">
                            <button type="button" class="button-edit"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button type="button" class="button-view"><i class="fa-solid fa-eye"></i></button>
                            <button type="button" class="button-print print-purchase"><i class="fa fa-print" aria-hidden="true"></i></button>

                        </td>
                      </tr>`

            $("#purchase-body").append(body)

        })

    }

    function appendToExpense(data){
        console.log(data);
        $("#expense-body").empty()
        $.each(data, function( key, value ) {
            let body = `<tr>
                        <td>${data[key]['id']}</td>
                        <td>${data[key]['name']}</td>
                        <td>${data[key]['mobile']}</td>
                        <td>${data[key]['type']}</td>
                        <td>${data[key]['description']}</td>
                        <td>${data[key]['amount']}</td>
                        <td>${data[key]['custom_date']}</td>

                        <td class="button d-flex justify-content-center">
                            <button type="button" class="button-edit"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button type="button" class="button-view"><i class="fa-solid fa-eye"></i></button>
                        </td>
                      </tr>`

            $("#expense-body").append(body)

        })

    }

    function appendToSales(data){
        console.log(data);
        $("#sales-body").empty()
        $.each(data, function( key, value ) {
            let body = `<tr>
                        <td>${data[key]['id']}</td>
                        <td>${data[key].invoice}</td>
                        <td>Contact</td>
                        <td>${data[key]['discount']}</td>
                        <td>${data[key]['dues']}</td>
                        <td>${data[key]['payment']}</td>
                        <td>${data[key]['total']}</td>
                        <td>${data[key]['custom_date']}</td>
                        <td class="button d-flex justify-content-center">
                            <button type="button" class="button-edit"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button type="button" class="button-view"><i class="fa-solid fa-eye"></i></button>
                            <button type="button" class="button-print"><i class="fa fa-print" aria-hidden="true"></i></button>

                        </td>
                      </tr>`

            $("#sales-body").append(body)

        })

    }

    function productDetails(id){
        loading()
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'sales/'+id,

            // Type of Request
            type: "GET",

            // Function to call when to
            // request is ok
            success: function (data) {
                cancelLoading()
                showDetails(data)
            },

            // Error handling
            error: function (error) {
                cancelLoading()
                console.log(`Error ${error}`);
            }
        });
    }

    function productDetailsEdit(id){
        loading()
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'sales/'+id,

            // Type of Request
            type: "GET",

            // Function to call when to
            // request is ok
            success: function (data) {
                cancelLoading()
                showDetailsEdit(data)
            },

            // Error handling
            error: function (error) {
                cancelLoading()
                console.log(`Error ${error}`);
            }
        });
    }

    function purchaseDetails(id,options){
        loading()
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'purchase/'+id,

            // Type of Request
            type: "GET",

            // Function to call when to
            // request is ok
            success: function (data) {
                cancelLoading()
                if(options == "EDIT"){
                    showPurchaseDetailsEdit(data)
                }else if(options == "PRINT"){
                    printPurchaseInvoice(data)
                }else{
                    showPurchaseDetails(data)
                }

            },

            // Error handling
            error: function (error) {
                cancelLoading()
                console.log(`Error ${error}`);
            }
        });
    }

    function showDetails(data) {

        dataSave = "VIEW"
        let customer = stringToJson(data.customer)
        let products = stringToJson(data.products)


        let body = `
            <table class="table table-borderless">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Mobile</th>
                        <th>Address</th>
                        <th>Nid</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${customer.name}</td>
                            <td>${customer.mobile}</td>
                            <td>${customer.address}</td>
                            <td>${customer.nid}</td>
                            <td>${data.invoice}</td>
                        </tr>

                    </tbody>
                  </table>

                  <table class="table table-borderless mt-2">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Info</th>

                      </tr>
                    </thead>
                    <tbody id="table-data">


                    </tbody>
                  </table>
        `


        $('.modal-body').empty().append(body)

//        $.each(products, function( key, value ){
//
//        })

        console.log(products)
        let pbody = `
                <tr>
                    <td>Product Model</td>
                    <td>${products.model}</td>
                </tr>
                <tr>
                    <td>Engine No</td>
                    <td>${products.engine_no}</td>
                </tr>
                <tr>
                    <td>Chassis No</td>
                    <td>${products.chassis_no}</td>
                </tr>
                <tr>
                    <td>Color</td>
                    <td>${products.color}</td>
                </tr>
                <tr>
                    <td>Origin</td>
                    <td>${products.origin}</td>
                </tr>
                <tr>
                    <td>Due</td>
                    <td>${products.due}</td>
                </tr>
                <tr>
                    <td><b>Price</b></td>
                    <td><b>${data.total}</b></td>
                </tr>

            `
            $('#table-data').empty().append(pbody)

        $(".modal-dialog").addClass("modal-lg")
        $('.modal-title').text("Sales Details")
        $('#myModal').modal('show')
    }

    function showDetailsEdit(data) {
        dataSave = "EDIT"
        let customer = stringToJson(data.customer)
        let products = stringToJson(data.products)


        let body = `
            <table class="table table-borderless">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Mobile</th>
                        <th>Address</th>
                        <th>Nid</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${customer.name}</td>
                            <td>${customer.mobile}</td>
                            <td>${customer.address}</td>
                            <td>${customer.nid}</td>
                            <td>${data.invoice}</td>
                        </tr>

                    </tbody>
                  </table>

                  <table class="table table-borderless mt-2">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Info</th>

                      </tr>
                    </thead>
                    <tbody id="table-data">


                    </tbody>
                  </table>
        `


        $('.modal-body').empty().append(body)

//        $.each(products, function( key, value ){
//
//        })

        console.log(products)
        let pbody = `
                <tr>
                    <td>Product Model</td>
                    <td>${products.model}</td>
                </tr>
                <tr>
                    <td>Engine No</td>
                    <td>${products.engine_no}</td>
                </tr>
                <tr>
                    <td>Chassis No</td>
                    <td>${products.chassis_no}</td>
                </tr>
                <tr>
                    <td>Color</td>
                    <td>${products.color}</td>
                </tr>
                <tr>
                    <td>Origin</td>
                    <td>${products.origin}</td>
                </tr>
                <tr>
                    <td>Due</td>
                    <td><input class="form-control text-center input-due" min="${data.dues}" max="${data.dues}" type="number" value="${data.dues}"/></td>
                </tr>
                <tr>
                    <td><b>Price</b></td>
                    <td><b>${data.total}</b></td>
                </tr>

            `
            $('#table-data').empty().append(pbody)

        $(".modal-dialog").addClass("modal-lg")
        $('.modal-title').text("Sales Details")
        $('#myModal').modal('show')
    }

    function showPurchaseDetails(data) {

        let products = stringToJson(data.products)

        let body = `
            <table class="table table-borderless">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Payment</th>
                        <th>Due</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rancon Group</td>
                            <td>${data.payment}</td>
                            <td>${data.dues}</td>
                            <td>${data.total}</td>
                        </tr>

                    </tbody>
                  </table>

                  <table class="table table-borderless mt-2">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody id="table-data">


                    </tbody>
                  </table>
        `


        $('.modal-body').empty().append(body)

        $.each(products, function( key, value ){
            let body = `
                <tr>
                    <td>${products[key].name}</td>
                    <td>${products[key].price}</td>
                    <td>${products[key].quantity}</td>
                </tr>
            `
            $('#table-data').empty().append(body)
        })


        $(".modal-dialog").addClass("modal-lg")
        $('.modal-title').text("Sales Details")
        $('#myModal').modal('show')
    }

    function showPurchaseDetailsEdit(data) {

        let products = stringToJson(data.products)

        let body = `
            <table class="table table-borderless">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Payment</th>
                        <th>Due</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rancon Group</td>
                            <td>${data.payment}</td>
                            <td><input class="form-control col-2 text-center input-due" min="${data.dues}" max="${data.dues}" type="number" value="${data.dues}"/></td>
                            <td>${data.total}</td>
                        </tr>

                    </tbody>
                  </table>

                  <table class="table table-borderless mt-2">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody id="table-data">


                    </tbody>
                  </table>
        `


        $('.modal-body').empty().append(body)

        $.each(products, function( key, value ){
            let body = `
                <tr>
                    <td>${products[key].name}</td>
                    <td>${products[key].price}</td>
                    <td>${products[key].quantity}</td>
                </tr>
            `
            $('#table-data').empty().append(body)
        })


        $(".modal-dialog").addClass("modal-lg")
        $('.modal-title').text("Sales Details")
        $('#myModal').modal('show')
    }

    function loading(){
        $(".loader").removeClass("d-none").addClass("d-block")
        $(".content-body").removeClass("d-block").addClass("d-none")
    }

    function cancelLoading(){
        $(".content-body").removeClass("d-none").addClass("d-block")
        $(".loader").removeClass("d-block").addClass("d-none")
    }

    function getSalesDetails(products){

        $.each(products, function( key, value ) {
            let body = `<tr>
                <td>${products[key].name}</td>
                <td>Price</td>
                <td>Quantity</td>
            </tr>`

            $("#table-data").append(body)
        })
    }



    function printInvoice(data){
        let winPrint = window.open();
        var body = invoiceBody(data)
        winPrint.document.write(body);
        winPrint.print();
    }

    function invoiceBody(data){
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

                hr{
                    margin-top: 250px;
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


                <div class="center"><h3></h3></div>
                <div class="center"><h5></h5></div>
                <div class="center"><h5></h4></div>
                <hr>

                <table>

                  <thead>

                  </thead>
                  <tbody class="bill-details">
                        ${invoiceDetails(data)}
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
                        ${bikeDetails(data)}
                  </tbody>
                </table>


            </div>
        `

            return body;
    }

    function bikeDetails(data){
        console.log(data.products);

        let products = stringToJson(data.products);

        let body = ``
        console.log(data.products)
        $(products).each(function(index,tr){
             body += `<tr class="col-12">
                       <td>${products[index].name}</td>
                       <td>${products[index].code}</td>
                       <td>${products[index].quantity}</td>
                       <td>PCs</td>
                       <td>${products[index].sellingPrice}</td>
                       <td>${products[index].total}</td>

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

                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Discount</td>
                       <td>${data.discount}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Payment</td>
                       <td>${data.payment}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Due</td>
                       <td>${data.dues}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <th>Total</th>
                       <th>${data.total}</th>
                </tr>`

        return body;
    }

    function purchaseProductDetails(data){
        console.log(data.products);

        let products = stringToJson(data.products);

        let body = ``
        console.log(data.products)
        $(products).each(function(index,tr){
             body += `<tr class="col-12">
                       <td>${products[index].name}</td>
                       <td>${products[index].code}</td>
                       <td>${products[index].quantity}</td>
                       <td>PCs</td>
                       <td>${products[index].purchasePrice}</td>
                       <td>${products[index].purchasePrice / products[index].quantity}</td>

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

                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Sub Total</td>
                       <td>${data.discount}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Discount</td>
                       <td>${data.discount}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Payment</td>
                       <td>${data.payment}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <td>Due</td>
                       <td>${data.dues}</td>
                </tr>
                <tr class="col-12">
                       <td></td>
                       <td></td>
                       <td></td>
                       <td></td>
                       <th>Total</th>
                       <th>${data.total}</th>
                </tr>`

        return body;
    }

    function invoiceDetails(data){

        let customer = stringToJson(data.customer)
        let body = `<tr class="col-12">
                    <th>Customer Name</th>

                    <th>Mobile</td>

                    <th>Address</td>

                </tr>
                <tr>
                <td>${customer.name}</th>
                <td>${customer.mobile}</td>
                <td>${customer.address}</td>
                </tr>`



        return body;
    }

    function printPurchaseInvoice(data){
        let winPrint = window.open();
        var body = purchaseBody(data);
        winPrint.document.write(body);
        winPrint.print();
    }

    function purchaseBody(data){
        console.log(data)
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

                hr{
                    margin-top: 250px;
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


                <div class="center"><h3></h3></div>
                <div class="center"><h5></h5></div>
                <div class="center"><h5></h4></div>
                <hr>



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
                        ${purchaseProductDetails(data)}
                  </tbody>
                </table>


            </div>
        `

            return body;
    }

    function stringToJson(data){
        return JSON.parse(data.replaceAll("\'","\""));
    }
})