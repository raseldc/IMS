
from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer

from api.models import Products, Supplier, Customer, CustomerPrice, ProductPurchase, ProductSales, Services, \
    ProductDetails, CustomBilling,Report

User = get_user_model()


class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'password')


class ProductSerializer(ModelSerializer):
    class Meta:
        model = Products
        fields = '__all__'


class SupplierSerializer(ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class CustomerSerializer(ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class CustomerPriceSerializer(ModelSerializer):
    class Meta:
        model = CustomerPrice
        fields = '__all__'


class PurchaseSerializer(ModelSerializer):
    supplier = SupplierSerializer(many=False)

    class Meta:
        model = ProductPurchase
        fields = '__all__'


class SalesSerializer(ModelSerializer):
    class Meta:
        model = ProductSales
        fields = '__all__'


class ServiceSerializer(ModelSerializer):
    class Meta:
        model = Services
        fields = '__all__'


class ProductDetailsSerializer(ModelSerializer):
    class Meta:
        model = ProductDetails
        fields = ['product','engine_no','color','chassis_no','key_no','origin','model','purchase_price','selling_price']


class CustomBillings(ModelSerializer):
    class Meta:
        model = CustomBilling
        fields = '__all__'


class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'