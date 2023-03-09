import {getValid} from '../utils.js'
import {apiGetRequest,apiPostRequest} from '../apiRequest.js'

$(document).ready(function(){

    //  let baseUrl = 'https://pos.bikerscafebd.com/api/'
    let baseUrl = 'http://0.0.0.0:8001/api/'

    getProducts()


    $("#btn-search").on('click', function(){
        let value = $(".input-search").val()
        console.log(value)
        if(value != ""){
            getProducts(baseUrl+'search/products/'+value)
        }
    })

    $("#create-product").on("click",function(){
        let body = `
            <input class="form-control form-control-sm mt-1" type="text" id="product-name" name="firstname" placeholder="Product Name">
            <select class="form-control form-control-sm mt-1" name="cars" id="unit">
              <option value="PCS">Pcs</option>
              <option value="KG">Kg</option>
              <option value="LITRE">Litre</option>
              <option value="BOX">Box</option>
            </select>
            <input class="form-control form-control-sm mt-1" type="text" id="product-company-name" name="firstname" placeholder="Product company name">
        `

        $('.modal-body').empty().append(body)
        $('.modal-title').empty().append(`<p>Create Product</p>`)
        $('#myModal').modal('show')
    })

    $("#myModal").on('click', '.save', function(){
           createProduct()
    })

    $(".btn-available").on('click',function(){
        showAvailableBikes()
    })

    $(".btn-inventory").on('click',function(){
        showInventoryBikes()
    })



    $("#myModal").on('click', '.close', function(){
        $('#myModal').modal('hide')
    })

    $("#product-body").on('click','.button-view',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        productDetails(id)
    })

    //new today

    $("#product-body").on('click','.button-edit',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        productDetails(id)
    })

    // new today
    $("#product-body").on('click','.button-delete',function(){
        let id = $(this).closest("tr").find("td").eq(0).text()
        deleteProduct(id)
    })

    function showAvailableBikes(){
        $('.available-bikes').removeClass("d-none").addClass("d-block")
        $('.inventory').removeClass("d-block").addClass("d-none")
        getAvailableBikes()
    }

    function showInventoryBikes(){
        $('.available-bikes').removeClass("d-block").addClass("d-none")
        $('.inventory').removeClass("d-none").addClass("d-block")
        getProducts()
    }


    function appendToBody(data){
        $("#product-body").empty()
        $.each(data, function( key, value ) {

          let body = `<tr>
                <td><a>${data[key]['id']}</a></td>
                <td>${data[key]['name']}</td>
                <td>${data[key]['company_name']}</td>
                <td>${data[key]['selling_price']}</td>
                <td class="">${data[key]['type']}</td>
                <td class="">${data[key]['unit']}</td>


                <td class="button d-flex justify-content-center">
                    <button type="button" class="button-edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button type="button" class="button-view"><i class="fa-solid fa-eye"></i></button>
                    <button type="button" class="button-delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`

          $("#product-body").append(body)
        });

    }

    function createProduct(){

        console.log(getValid($("#unit option:selected").text()))

        if(getValid($("#product-name").val()) != 0 && getValid($("#unit option:selected").text()) != 0){
            let data = JSON.stringify({
                'name' : $("#product-name").val(),
                'type' : $("#unit option:selected").text(),
                'company_name' : $('#product-company-name').val(),
            });

            let response = apiPostRequest(baseUrl+'products/',data)
            response.success(function(data){
               $('#myModal').modal('hide')
               alert("success")
               location.reload()
            })
        }else{
            alert("Please give all data to create product")
        }

    }

    function getAvailableBikes(){
        loading()
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'available_bikes/',

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
                cancelLoading()
               appendToAvailable(data)

            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function appendToAvailable(data){
        $("#available-bike-body").empty()
        $.each(data, function( key, value ) {

          let body = `<tr>
                <td><a>${data[key]['id']}</a></td>
                <td>${data[key]['product']}</td>
                <td>${data[key]['model']}</td>
                <td>${data[key]['engine_no']}</td>
                <td>${data[key]['chassis_no']}</td>
                <td>${data[key]['color']}</td>
                <td>${data[key]['battery_no']}</td>
                <td class="">${data[key]['key_no']}</td>
                <td class="">${data[key]['origin']}</td>
                <td class="">${data[key]['purchase_price']}</td>
                <td class="">${data[key]['selling_price']}</td>

            </tr>`

          $("#available-bike-body").append(body)
        });

    }

    function getProducts(){

        loading()
        apiGetRequest(baseUrl+'products/').success(function(data){
            cancelLoading()
            console.log(data)
            appendToBody(data)
        })

        apiGetRequest(baseUrl+'products/').error(function(data){
            cancelLoading()
            alert(data)
        })
    }


    function productDetails(id){
        loading()
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'products/'+id,

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

    function deleteProduct(id){
        loading()
        $.ajax({
            // Our sample url to make request
            url:baseUrl+'products/'+id,

            // Type of Request
            type: "DELETE",

            // Function to call when to
            // request is ok
            success: function (data) {
                cancelLoading()
                alert(data['name']+" Deleted Successfully")
                location.reload()
            },

            // Error handling
            error: function (error) {
                cancelLoading()
                console.log(`Error ${error}`);
            }
        });
    }

    function showDetails(data) {

        console.log(data)
        let body = `
            <table class="table table-borderless">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Information</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>${data.name}</td>
                        </tr>
                        <tr>
                            <td>Company</td>
                            <td>${data.company}</td>
                        </tr>
                        <tr>
                            <td>Purchase Price</td>
                            <td><input class="form-control form-control-sm mt-1 text-center" type="text" id="purchase-price" name="firstname" placeholder="Product Color" value="${data.purchase_price}"></td>
                        </tr>
                        <tr>
                            <td>Selling Price</td>
                            <td><input class="form-control form-control-sm mt-1 text-center" type="text" id="selling-price" name="firstname" placeholder="Product Color" value="${data.selling_price}"></td>
                        </tr>
                        <tr>
                            <td>Quantity</td>
                            <td>${data.unit}</td>
                        </tr>

                        <tr>
                            <td>Color</td>
                            <td><input class="form-control form-control-sm mt-1 text-center" type="text" id="color" name="firstname" placeholder="Product Color" value="${data.color}"></td>
                        </tr>

                        <tr>
                            <td>Model</td>
                            <td>${data.model}</td>
                        </tr>

                        <tr>
                            <td>Chasis No</td>
                            <td>${data.unit}</td>
                        </tr>

                        <tr>
                            <td>Lifetime Sale</td>
                            <td>0</td>
                        </tr>

                        <tr>
                            <td>Lifetime Income</td>
                            <td>0</td>
                        </tr>


                    </tbody>
                  </table>
        `

        $('.modal-body').empty().append(body)
        $('.modal-title').text("Product Details")
        $('#myModal').modal('show')
    }

    function loading(){
        $(".loader").removeClass("d-none").addClass("d-block")
        $(".content-body").removeClass("d-block").addClass("d-none")
    }

    function cancelLoading(){
        console.log("loading")
        $(".content-body").removeClass("d-none").addClass("d-block")
        $(".loader").removeClass("d-block").addClass("d-none")
    }

    function showDialog(title,message) {

        let body = `
            <p>${message}</p>
        `

        $('.modal-body').empty().append(body)
        $('.modal-title').text(title)
        $('#myModal').modal('show')
    }

});



