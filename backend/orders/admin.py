from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'full_name',
                    'service_type', 'status', 'created_at')
    # Prevent editing the auto-generated ID
    readonly_fields = ('ticket_id', 'id')
