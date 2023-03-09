from django.urls import path

from api.views import *
from medipack.views import *

urlpatterns = [
    path('', ProductView.as_view(), name="main"),
    path('products/', ProductView.as_view(), name="products"),
    path('sales/', SalesView.as_view(), name="sales"),
    path('purchase/', PurchaseView.as_view(), name="purchase"),
    path('accounts/', AccountsView.as_view(), name="accounts"),
    path('service/', ServiceView.as_view(), name="service"),
]