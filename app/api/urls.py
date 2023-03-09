from django.urls import path

from api.views import *

urlpatterns = [
    path('products/', product, name="product_create_or_list"),
    path('products/<str:pk>', product, name="product_create_or_list"),
    path('supplier/', supplier, name="supplier"),
    path('supplier/<str:pk>', supplier, name="supplier"),
    path('customer/', customer, name="customer"),
    path('customer/<str:pk>', customer, name="customer"),
    path('purchase/', purchase, name="purchase"),
    path('purchase/<str:pk>', purchase, name="purchase_details"),
    path('purchase/<str:pk>/<str:from_date>/<str:to_date>', purchase, name="purchase_report"),
    path('products_api/', ProductAPI.as_view(), name="products_api"),
    path('products_api/<str:pk>', ProductAPI.as_view(), name="products_api"),
    path('sales/', sales, name="sales"),
    path('sales/<str:pk>', sales, name="sales_details"),
    path('search/products/<str:pk>', search_products, name="search_products"),
    path('search/engine/<str:pk>', search_engine, name="search_engine"),
    path('service/', service, name="service"),
    path('invoice/', invoice, name="invoice"),
    path('accounts/', accounts, name="accounts"),
    path('available_bikes/', available_bikes, name="available_bikes"),
]
