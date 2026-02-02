from django.db import models
import uuid

# This function generates a unique 8-character ID (e.g., PADI-9X2A)


def generate_ticket_id():
    return f"PADI-{str(uuid.uuid4())[:4].upper()}"


class Order(models.Model):
    # --- Choices (Dropdowns) ---
    STATUS_CHOICES = [
        ('RECEIVED', 'Received'),
        ('PROCESSING', 'Processing'),
        ('READY', 'Ready'),
        ('COMPLETED', 'Completed'),
    ]

    SERVICE_CHOICES = [
        ('DL', 'Drivers License'),
        ('VEHICLE', 'Vehicle Renewal'),
        ('NEW_PLATE', 'New Number Plate'),
    ]

    # --- Core Fields ---
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_id = models.CharField(
        max_length=20, default=generate_ticket_id, unique=True, editable=False)

    # --- Client Info ---
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    # --- Service Details ---
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    vehicle_details = models.TextField(
        blank=True, null=True, help_text="Car Model, Year, Plate Number")

    # --- Processing ---
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='RECEIVED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ticket_id} - {self.full_name}"
