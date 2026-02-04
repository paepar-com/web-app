from django.urls import path
from . import views

urlpatterns = [
    path('agent/create/', views.create_agent, name='create_agent'),  # New
    path('client/save/', views.create_or_update_client, name='save_client'),
    path('client/get/<str:phone>/', views.get_client, name='get_client'),
    path('create/', views.create_order, name='create_order'),
    path('status/<str:ticket_id>/', views.check_status, name='check_status'),
]
