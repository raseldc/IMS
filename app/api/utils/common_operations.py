from api.models import Products, Invoice, Report
from api.utils.api_enums import Inventory


def add_quantity(list):
    for item in list:
        product = Products.objects.get(name=item['name'])
        product.unit = int(product.unit) + int(item['quantity'])
        product.save()


def minus_quantity(name,quantity):
    print(id)
    product = Products.objects.get(name=name)
    product.unit = int(product.unit) - int(quantity)
    product.save()


def invoice_number():
    last_invoice = Invoice.objects.all().order_by('id').last()
    if not last_invoice:
        Invoice.objects.create(invoice='BCAFE0001')
        return 'BCAFE0001'
    invoice_no = last_invoice.invoice
    invoice_int = int(invoice_no.split('BCAFE')[-1])
    new_invoice_int = invoice_int + 1
    new_invoice_no = 'BCAFE' + str(new_invoice_int)
    Invoice.objects.create(invoice=new_invoice_no)
    return new_invoice_no


def update_report(total, due, type):
    print(type)
    if type == Inventory.PURCHASE:
        try:
            report = Report.objects.get(id=1)
            report.total_purchase = int(report.total_purchase) + total
            report.total_purchase_due = int(report.total_purchase_due) + due
            report.save()
        except Report.DoesNotExist:
            Report.objects.create(
                total_purchase=total,
                total_purchase_due=due
            )

    if type == Inventory.SALES:
        try:
            report = Report.objects.get(id=1)
            report.total_sales = int(report.total_sales) + total
            report.total_sales_due = int(report.total_purchase_due) + due
            report.save()
        except Report.DoesNotExist:
            Report.objects.create(
                total_sales=total,
                total_sales_due=due
            )

    if type == Inventory.EXPENSE:
        try:
            report = Report.objects.get(id=1)
            report.total_expense = int(report.total_expense) + total
            report.total_purchase_due = int(report.total_expense) + due
            report.save()
        except Report.DoesNotExist:
            Report.objects.create(
                total_expense=total,
                total_expense_due=due
            )
