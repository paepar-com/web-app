from django.contrib import admin
from .models import Order, Client, Agent, OrderStatusHistory, OrderDocument

# Allow uploading multiple files directly in Admin


class DocumentInline(admin.TabularInline):
    model = OrderDocument
    extra = 1

# Show the timeline directly in the Order page


class HistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    readonly_fields = ('timestamp', 'status', 'notes')
    extra = 0
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'client', 'service_type',
                    'status', 'created_at')
    list_filter = ('status', 'service_type')
    search_fields = ('ticket_id',)
    # <--- This adds the "Power Features"
    inlines = [DocumentInline, HistoryInline]


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone')


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'state_of_practice', 'is_licensed')
    list_filter = ('is_licensed', 'state_of_practice')
