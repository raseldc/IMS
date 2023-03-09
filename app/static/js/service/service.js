$(document).ready(function(){

    let cartList = []
    let salesList = []
    let serviceList = []

    $(".btn-service").on("click", function(){
        $(".sales").removeClass("d-block").addClass("d-none")
        $(".service").removeClass("d-none").addClass("d-block")
        $(".service-list").removeClass("d-block").addClass("d-none")
    })
    $(".btn-service-list").on("click", function(){
        $(".sales").removeClass("d-block").addClass("d-none")
        $(".service").removeClass("d-block").addClass("d-none")
        $(".service-list").removeClass("d-none").addClass("d-block")

        getServices()
    })

    $(".btn-sales").on("click", function(){
        $(".service").removeClass("d-block").addClass("d-none")
        $(".sales").removeClass("d-none").addClass("d-block")
        $(".service-list").removeClass("d-block").addClass("d-none")
    })




    $(".btn-create-service").on("click", function(){
        serviceList = []
        let sum = 0
        $("#service-body>tr").each(function(index,tr){
            let name = $(this).closest("tr").find("td").eq(0).find("input").val()
            let description = $(this).closest("tr").find("td").eq(2).find("input").val()
            let price = $(this).closest("tr").find("td").eq(1).find("input").val()

            if(name!='' && price!=''){
                let item = {
                    "name" : name,
                    "description" : description,
                    "price" : price,
                }
                serviceList.push(item)

                sum = sum + parseInt(price)
            }

        })

        createService(sum)

    })

    $(".btn-add-item").on("click", function(){
        let body = `
            <tr>
                <td><input class="form-control form-control-sm mt-1 input-service-item" type="text" placeholder="item Name"/></td>
                <td><input class="form-control form-control-sm mt-1 input-service-price" type="number" placeholder="Service price"/></td>
                <td><input class="form-control form-control-sm mt-1 input-service-price" type="text" placeholder="item description"/></td>
                <td class="button"><button type="button" class="button-delete"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `
        $("#service-body").append(body)
    })

    $("#btn-search").on("click", function(){
        getProductList()
    })

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

    $("#btn-confirm").on("click", function(){
        calculateTotal()
    })

    $(".btn-purchase").on("click", function(){
       purchase()
    })

    $('.input-discount').on('input', function(){
        $(".total").text(parseInt($(".total").text()) - getValid(parseInt(this.value)))
    });

    $('.input-vat').on('input', function(){
        console.log(getValid(parseInt(this.value)))
        $(".total").text(parseInt($(".total").text()) + getValid(parseInt(this.value)))
    });


    $("#search-body").on("click",'.button-edit', function(){
        var name = $(this).closest("tr").find("td").eq(0).html();
        var price = $(this).closest("tr").find("td").eq(1).html();
        var rowId = $(this).closest("tr").attr('id');


        if(cartList.includes(rowId)){
            alert("Already Product Added")
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

    function getProductList(){
        $.ajax({
            // Our sample url to make request
            url:'http://0.0.0.0:8001/api/search/products/',

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'POST',
            dataType: 'json',
            data : JSON.stringify({
                'term' : $("#search").val(),
            }),

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

        $("#search-body").empty()
        $.each(data.products, function( key, value ) {
            let body = `<tr id="${data.products[key].id}">
                        <td>${data.products[key].name}</td>
                        <td>${data.products[key].selling_price}</td>

                        <td class="button d-flex justify-content-center">
                            <button type="button" class="button-edit"  data-toggle="tooltip" data-placement="bottom" title="add product"><i class="fa-solid fa-plus"></i></button>
                            <button type="button" class="button-delete"><i class="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>`

            $("#search-body").append(body)
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
        $("#cart-body>tr").each(function(index,tr){
            let name = $(this).closest("tr").find("td").eq(0).text()
            let quantity = $(this).closest("tr").find("td").eq(2).find("input").val()
            let price = $(this).closest("tr").find("td").eq(1).text()
            let totalPrice = getIsNan(parseInt(price)) * getIsNan(parseInt(quantity))

            let item = {
                "name" : name,
                "quantity" : quantity,
                "price" : price,
                "totalPrice" : totalPrice
            }
            sum = sum + (totalPrice)
            addToSales(item)

        })

        $(".sub-total").text(sum)
        $(".total").text(sum)
    }

    function addToSales(data){
        salesList.push(data)
    }

    function purchase(){
        let body = JSON.stringify({
                'products' : salesList,
                'total' : getValid($(".total").text()),
                'discount' : getValid($(".input-discount").val()),
                'vat' : getValid($(".input-vat").val()),
                'supplier' : getValid($("#mobile-number").val()),
                'payment' : getValid($(".input-payment").val())
            })

        $.ajax({
            // Our sample url to make request
            url:'http://0.0.0.0:8001/api/sales/',

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
               alert(data)
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
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
            url:'http://0.0.0.0:8001/api/customer/',

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

    function createService(sum){
        $.ajax({
            // Our sample url to make request
            url:'http://0.0.0.0:8001/api/service/',

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'POST',
            dataType: 'json',
            data : JSON.stringify({
                'name' : $(".input-service-name").val(),
                'services' : JSON.stringify(serviceList),
                'description' : $(".service-description").val(),
                'total' : sum
            }),

            // Function to call when to
            // request is ok
            success: function (data) {
               alert("success")
               serviceList = []
               $("#service-body").empty()
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function getServices(){
        $.ajax({
            // Our sample url to make request
            url:'http://0.0.0.0:8001/api/service/',

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
                console.log(data);
               appendToService(data)
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
            }
        });
    }

    function appendToService(data){
        console.log(data);
        $("#service-table-body").empty()
        $.each(data, function( key, value ) {
            let body = `<tr>
                        <td>${data[key]['id']}</td>
                        <td>${data[key]['name']}</td>
                        <td>${data[key]['total']}</td>
                        <td>${data[key]['description']}</td>
                        <td class="button d-flex justify-content-center">
                            <button type="button" class="button-edit"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button type="button" class="button-view"><i class="fa-solid fa-eye"></i></button>
                        </td>
                      </tr>`

            $("#service-table-body").append(body)

        })

    }
})
