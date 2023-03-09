from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


# Create your models here.
class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("User must have an email Address")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)

        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, name, mobile, password, **other_fields):
        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_active", True)
        if other_fields.get("is_staff") is not True:
            raise ValueError("Super User must have to be is_staff=True")
        if other_fields.get("is_superuser") is not True:
            raise ValueError("Super User must have to be is_superuser=True")
        if mobile == "":
            raise ValueError("Super User must have mobile number")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.save()

        return user


class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=255, default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'mobile']

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.email


class Products(models.Model):
    name = models.CharField(max_length=100, unique=True, null=False)
    code = models.CharField(max_length=100, unique=False, blank=True)
    company_name = models.CharField(max_length=100, blank=True)
    purchase_price = models.FloatField(default=0, blank=True)
    selling_price = models.FloatField(default=0, blank=True)
    unit = models.IntegerField(default=0, blank=True)
    color = models.CharField(max_length=50,default="Black", blank=True)
    engine = models.CharField(max_length=100, default=0, blank=True)
    chasis_no = models.CharField(max_length=100, default=0,blank=True)
    model = models.CharField(max_length=50,default=0, blank=True)
    type = models.CharField(max_length=50, default="Parts")
    is_active = models.BooleanField(default=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class ProductDetails(models.Model):
    product = models.CharField(max_length=100, null=True)
    code = models.CharField(max_length=100, default=0)
    engine_no = models.CharField(max_length=100, default=0,)
    chassis_no = models.CharField(max_length=100,default=0,)
    color = models.CharField(max_length=100, default="Black")
    battery_no = models.CharField(max_length=100, default=0)
    key_no = models.CharField(max_length=100, default=0)
    purchase_price = models.FloatField(default=0, blank=True)
    selling_price = models.FloatField(default=0, blank=True)
    origin = models.CharField(null=True, max_length=40)
    purchase_quantity = models.IntegerField(null=True, blank=True,default=0)
    new_quantity = models.IntegerField(null=True, blank=True, default=0)
    description = models.TextField(default=0,blank=True)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class Supplier(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=25, unique=True)
    nid = models.CharField(max_length=25, blank=True)
    company_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class Customer(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=25, unique=True)
    nid = models.CharField(max_length=25, blank=True)
    company_name = models.CharField(max_length=100, null=True,blank=True)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class CustomerDetails(models.CharField):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=25)
    total = models.FloatField(default=0)
    due = models.FloatField(default=0)
    discount = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class SupplierDetails(models.CharField):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=25)
    total = models.FloatField(default=0)
    due = models.FloatField(default=0)
    discount = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class ProductsDetails(models.CharField):
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    purchase = models.FloatField(default=0)
    dose = models.CharField(max_length=50,default=0)
    quantity = models.IntegerField(default=0)
    selling_price = models.FloatField(default=0)
    expires_date = models.CharField(max_length=100)
    self_number = models.CharField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class ProductPurchase(models.Model):
    supplier = models.ForeignKey(Supplier,on_delete=models.CASCADE, null=True, blank=True)
    products = models.TextField(null=True,blank=True)
    prices = models.CharField(max_length=1000, null=False,blank=True)
    quantities = models.CharField(max_length=1000, null=False,blank=True)
    dues = models.FloatField(default=0)
    discount = models.FloatField(default=0)
    payment = models.FloatField(default=0)
    expires = models.CharField(max_length=1000, null=False,blank=True)
    invoice = models.CharField(max_length=100,blank=True,unique=True)
    total = models.FloatField(default=0)
    is_active = models.BooleanField(default=True,blank=True)
    custom_date = models.CharField(max_length=50, null=True,blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class ProductSales(models.Model):
    customer = models.TextField(null=True)
    products = models.TextField(null=False)
    prices = models.CharField(max_length=1000, null=False,blank=True)
    quantities = models.CharField(max_length=1000, null=False,blank=True)
    dues = models.FloatField(default=0)
    discount = models.FloatField(default=0)
    payment = models.FloatField(default=0)
    invoice = models.CharField(max_length=100,unique=True)
    total = models.FloatField(default=0)
    invoice_by = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    custom_date = models.CharField(max_length=50, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class CustomerPrice(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL,null=True)
    product = models.ForeignKey(Products, on_delete=models.SET_NULL,null=True)
    price = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('customer', 'product')


class Services(models.Model):
    name = models.CharField(max_length=100, unique=True)
    services = models.TextField(null=False)
    description = models.TextField(blank=True,null=True)
    total = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class Invoice(models.Model):
    invoice = models.CharField(max_length=100, unique=True)
    invoice_by = models.CharField(max_length=100, blank=True)
    invoice_for = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    amount = models.FloatField(default=0)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class CustomBilling(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15,null=True,blank=True)
    description = models.TextField()
    amount = models.FloatField(default=0)
    type = models.CharField(max_length=40)
    custom_date = models.CharField(max_length=50,null=True,blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)

class Report(models.Model):
    total_purchase = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    total_purchase_due = models.IntegerField(default=0)
    total_sales_due = models.IntegerField(default=0)
    total_expense = models.IntegerField(default=0)
    total_expense_due = models.IntegerField(default=0)


class Category(models.Model):
    category_name = models.CharField(max_length=150,null=True)
    tags = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)


class Prod(models.Model):
    name = models.CharField(max_length=100, null=False)
    category = models.TextField()
    tags = models.TextField()











