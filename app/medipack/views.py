from django.shortcuts import render
from django.views.generic import TemplateView


# Create your views here.
class MainView(TemplateView):
    template_name = 'main.html'


class ProductView(TemplateView):
    template_name = 'products.html'


class SalesView(TemplateView):
    template_name = 'sales.html'


class PurchaseView(TemplateView):
    template_name = 'purchase.html'


class AccountsView(TemplateView):
    template_name = 'accounts.html'


class ServiceView(TemplateView):
    template_name = 'services.html'