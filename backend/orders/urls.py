from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_order, name='create_order'),
    path('status/<str:ticket_id>/', views.check_status, name='check_status'),
]
