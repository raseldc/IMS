from api.models import ProductDetails, Report
from api.utils.api_enums import Inventory


def create_product_details(data):
    product_list = []
    for item in data:
        product_list.append(
            ProductDetails(
                product=item["name"],
                code=item['code'],
                purchase_price=item["purchasePrice"],
                purchase_quantity = item['quantity'],
                new_quantity= int(item['quantity']) + int(item['availableQuantity']),
                description="none"
            )
        )

    result = ProductDetails.objects.bulk_create(product_list)
    print(result)
    return None


def update_availability(engine):
    product_details = ProductDetails.objects.get(engine_no=engine)
    product_details.is_available = False
    product_details.save()


def update_report(total, due, type):
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