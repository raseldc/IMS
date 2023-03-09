
from django.db import connection
from django.http import JsonResponse
from django.shortcuts import  get_object_or_404

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.db.products import create_product_details, update_availability
from api.db.purchase import purchase_report
from api.models import Products, Supplier, Customer, ProductPurchase, ProductSales, Services, ProductDetails, \
    CustomBilling, Report
from api.serializer import ProductSerializer, SupplierSerializer, CustomerSerializer, PurchaseSerializer, \
    SalesSerializer, ServiceSerializer, ProductDetailsSerializer, CustomBillings, ReportSerializer
from api.utils.api_enums import Inventory
from api.utils.common_operations import add_quantity, minus_quantity, invoice_number, update_report


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


class ProductAPI(APIView):

    def get(self, request, pk=None):

        if pk is not None:
            # product = get_object_or_404(Products, name=pk)
            # product_details = ProductSerializer(product, many=False).data
            # return Response(product_details)
            with connection.cursor() as cursor:
                data = cursor.execute('SELECT id,name,code FROM api_products WHERE name LIKE %s', tuple([pk]))
                data = dictfetchall(cursor)

                return Response(data)
        else:
            # queryset = Products.objects.all()
            # product_list = ProductSerializer(queryset, many=True).data
            # return Response(product_list)

            with connection.cursor() as cursor:
                data = cursor.execute("SELECT id,name,code FROM api_products")
                row = dictfetchall(cursor)
                return Response(row)


@csrf_exempt
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def product(request, pk=None):

    if request.method == "GET":
        if pk is not None:
            if pk.isnumeric():
                print("1")
                product = get_object_or_404(Products, id=pk)
                product_details = ProductSerializer(product, many=False).data

                return Response(product_details)
            else:
                print("2")
                product = Products.objects.raw('select * from api_products where name=\'{}\''.format(pk))

                product_details = ProductSerializer(product, many=True).data

                return Response(product_details)
        else:

            queryset = Products.objects.raw('select * from api_products where is_active is TRUE')
            product_list = ProductSerializer(queryset, many=True).data
            return Response(product_list)
    elif request.method == "POST":
        if pk is None:
            product_serializer = ProductSerializer(data=request.data)
            if product_serializer.is_valid(raise_exception=True):
                product_serializer.save()
                return Response({"data": product_serializer.data, "message": "Product Created"}, status=200)
        elif pk is not None:
            medicine = Products.objects.filter(name__startswith=pk)
            titles = list()
            for title in medicine:
                titles.append(title.name)
            return JsonResponse(titles, safe=False)

    elif request.method == 'PUT' and pk is not None:

        product = get_object_or_404(Products, id=pk)
        if product is not None:
            product_serializer = ProductSerializer(product, data=request.data, partial=True)
            if product_serializer.is_valid(raise_exception=True):
                product_serializer.save()
                return Response({"data": product_serializer.data, "message": "Product Created"}, status=201)

            return product_serializer.errors
    elif request.method == "DELETE" and pk is not None:
        product = get_object_or_404(Products, id=pk)
        temp = product
        product.is_active = False
        product.save()
        return Response({"id": temp.id, "name": temp.name, "status": "Deleted"})

    return Response(data={"message": "Not Found", "status": 402}, status=400)


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def supplier(request, pk=None):
    if request.method == "GET":
        if pk is not None:
            supplier = get_object_or_404(Supplier, mobile=pk)
            supplier_details = ProductSerializer(supplier, many=False).data
            return Response(supplier_details)
        else:
            queryset = Supplier.objects.all()
            supplier_list = SupplierSerializer(queryset, many=True).data
            return Response(supplier_list)
    elif request.method == "POST" and pk is None:
        data = request.data
        print(data)
        supplier_serializer = SupplierSerializer(data=data)
        if supplier_serializer.is_valid(raise_exception=True):
            product = supplier_serializer.save()
            return Response(supplier_serializer.data)

    elif request.method == "PUT" and pk is not None:
        supplier = get_object_or_404(Supplier, mobile=pk)

        if supplier is not None:
            supplier_serializer = SupplierSerializer(supplier, data=request.data)
            if supplier_serializer.is_valid(raise_exception=True):
                supplier_serializer.save()
                return Response(supplier_serializer.data)

    return Response(data={"message": "Not Found", "status": 402}, status=400)


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def customer(request, pk=None):
    if request.method == "GET":
        if pk is not None:
            customer = get_object_or_404(Customer, mobile=pk)
            customer_details = CustomerSerializer(customer, many=False).data
            return Response(customer_details)
        else:
            queryset = Customer.objects.all()
            customer_list = CustomerSerializer(queryset, many=True).data
            return Response(customer_list)
    elif request.method == "POST":
        customer_serializer = CustomerSerializer(data=request.data)
        if customer_serializer.is_valid(raise_exception=True):
            customer_serializer.save()
            return Response(customer_serializer.data)

    elif request.method == "PUT" and pk is not None:
        customer = get_object_or_404(Customer, mobile=pk)

        if customer is not None:
            customer_serializer = CustomerSerializer(data=request.data)
            if customer_serializer.is_valid(raise_exception=True):
                product = customer_serializer.save()
                return Response(customer_serializer.data)

    return Response(data={"message": "Not Found", "status": 402}, status=400)


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def purchase(request, pk=None, report=None, from_date=None, to_date=None):
    if request.method == "POST":
        data = request.data
        purchase = ProductPurchase.objects.create(
            products=data['products'],
            discount=data['discount'],
            total=data['total'],
            payment=data['payment'],
            dues=int(data['due']),
            invoice=data['invoice'],
            custom_date=data['custom_date']
        )
        add_quantity(data['products'])

        update_report(int(data['total']), int(data['due']), Inventory.PURCHASE)

        create_product_details(data["products_details"])

        return Response({"message": "Purchase Completed Successfully From Rancon", "status": 201})

    elif request.method == "GET":

        if pk is not None:
            if pk == Inventory.report.name and (from_date is not None and to_date is not None):
                report_data = purchase_report(from_date, to_date)
                return Response(report_data, status=201)
            else:
                product = get_object_or_404(ProductPurchase, id=pk)
                product_details = PurchaseSerializer(product, many=False).data
                return Response(product_details)
        else:
            queryset = ProductPurchase.objects.all().order_by('-id')
            product_list = PurchaseSerializer(queryset, many=True).data
            return Response(product_list)

    elif request.method == "PUT":
        if pk is not None:
            try:
                data = request.data
                print(data)
                product_sales = ProductPurchase.objects.get(id=pk)

                new_payment = int(product_sales.payment) + int(data["due"])
                print(new_payment)

                if new_payment <= int(product_sales.total):
                    product_sales.dues = int(product_sales.dues) - int(data["due"])
                    product_sales.payment= new_payment
                    id = product_sales.save(update_fields=['dues','payment'])
                    print(id)
                    return Response({"message": "Due Cleared", "status": 201})
                else:
                    return Response({"message": "You are Paying {} greater Than Total".format(data["due"]), "status": 201})
            except ProductSales.DoesNotExist:
                return Response({"message": "Already exist","status":204})


    return Response(data={"message": "Success", "status": 200}, status=204)


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def sales(request, pk=None):
    if request.method == "POST":
        if Inventory.PURCHASE.name == pk:
            print(pk)

        if pk is None:
            data = request.data
            purchase = ProductSales.objects.create(
                        customer=data['customer'],
                        products=data['salesList'],
                        discount=data['discount'],
                        total=data['total'],
                        payment=data['payment'],
                        dues=int(data["due"]),
                        invoice=data['invoice'],
                        custom_date=data['custom_date']
                    )
            update_report(int(data['total']), int(data['due']), Inventory.SALES)

            for item in data['salesList']:
                minus_quantity(item["name"], item['quantity'])

            # update_availability(data['products']["engine_no"])
            #
            sales = SalesSerializer(purchase, many=False).data
            #
            return Response({"message": "Sales Completed Successfully To {}".format(data['customer']['name']), "status": 201, "data": sales})

    elif request.method == "GET":
        if pk is not None:
            product = get_object_or_404(ProductSales, id=pk)
            product_details = SalesSerializer(product, many=False).data
            print(product_details)
            return Response(product_details)
        else:
            queryset = ProductSales.objects.all().order_by('-id')
            product_list = SalesSerializer(queryset, many=True).data
            return Response(product_list)

    elif request.method == "PUT":
        if pk is not None:

            try:
                data = request.data
                print(data)
                product_sales = ProductSales.objects.get(id=pk)

                new_payment = int(product_sales.payment) + int(data["due"])
                print(new_payment)

                if new_payment <= int(product_sales.total):
                    product_sales.dues = int(product_sales.dues) - int(data["due"])
                    product_sales.payment= new_payment
                    id = product_sales.save(update_fields=['dues','payment'])
                    print(id)
                    return Response({"message": "Due Cleared", "status": 201})
                else:
                    return Response({"message": "You are Paying {} greater Than Total".format(data["due"]), "status": 201})

            except ProductSales.DoesNotExist:
                return Response({"message": "Already exist","status":201})


    return Response({"message": "Success", "status": 200})


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def service(request, pk=None):
    if request.method == "POST":
        print(request.data)
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        else:
            print(serializer.errors)
            return Response(serializer.errors)
    elif request.method == "GET":
        if pk is not None:
            product = get_object_or_404(Services, id=pk)
            product_details = ServiceSerializer(product, many=False).data
            return Response(product_details)
        else:
            queryset = Services.objects.all().order_by('-id')
            product_list = ServiceSerializer(queryset, many=True).data
            return Response(product_list)


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def accounts(request, pk=None):
    if request.method == "POST":
        serializer = CustomBillings(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({"data": serializer.data,"status": 201})
        else:
            return Response({"data": serializer.errors,"status": 204})

    if request.method == "GET":
        if pk is not None:
            product = get_object_or_404(CustomBilling, id=pk)
            product_details = CustomBillings(product, many=False).data
            return Response(product_details)
        else:
            queryset = CustomBilling.objects.all().order_by('-id')
            report = get_object_or_404(Report,id=1)
            product_list = CustomBillings(queryset, many=True).data
            report_data = ReportSerializer(report, many=False).data
            return JsonResponse({"products": product_list, "report": report_data})
    return Response({"data": "Pijush"})


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def search_products(request, pk=None):
    if request.method == "GET":
        qs = Products.objects.filter(name__istartswith='{}'.format(pk), is_active=True)
        data = ProductSerializer(qs, many=True).data
        return Response(data)
    return Response({"products": None, "status": 400})


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def search_engine(request, pk=None):
    if request.method == "GET":
        qs = Products.objects.filter(name__istartswith='{}'.format(pk), is_active=True)
        data = ProductSerializer(qs, many=True).data
        return Response(data)
    return Response({"products": None, "status": 400})

@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def invoice(request):
    return Response({'invoice': invoice_number()})\


@csrf_exempt
@api_view(["GET", "POST", "PUT"])
def available_bikes(request):
    if request.method == "GET":
        qs = ProductDetails.objects.filter(is_active=True, is_available=True)
        data = ProductDetailsSerializer(qs, many=True).data
        return Response(data)
    # return Response({"products": None, "status": 400})
    return Response({'invoice': invoice_number()})








