import gspread
import os
from oauth2client.service_account import ServiceAccountCredentials
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import send_mail
from .models import Order, Client, Agent
from django.template.loader import render_to_string
from django.utils.html import strip_tags

# --- GOOGLE SHEETS CONNECTION ---


def get_sheet_tab(tab_name):
    try:
        # OLD LINE (Delete this):
        # creds_path = os.path.join(settings.BASE_DIR, 'credentials.json')

        # NEW LINE (Use this):
        # This tells the app: "Look where the environment variable tells you to look"
        creds_path = os.getenv('GOOGLE_CREDS_PATH')

        scope = ['https://spreadsheets.google.com/feeds',
                 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            creds_path, scope)
        client = gspread.authorize(creds)
        return client.open("Paepar Database").worksheet(tab_name)
    except Exception as e:
        print(f"Sheet Error: {e}")
        return None

# --- SYNC & NOTIFY ENGINE ---


@receiver(post_save, sender=Order)
def handle_order_post_save(sender, instance, created, **kwargs):
    sheet = get_sheet_tab("Orders")

    # 1. PREPARE DATA
    status_label = instance.get_status_display()
    row_data = [
        str(instance.ticket_id),
        str(instance.created_at.strftime("%d/%m/%Y %H:%M")),
        status_label,
        instance.service_type,
        instance.client.full_name,
        instance.client.phone,
        instance.delivery_method,
        "Yes" if instance.fee_acknowledged else "No"
    ]

    # 2. SYNC TO GOOGLE SHEETS
    if sheet:
        if created:
            if len(sheet.get_all_values()) == 0:
                sheet.append_row(["Ticket ID", "Date", "Status",
                                 "Service", "Client", "Phone", "Delivery", "Fee Ack"])
            sheet.append_row(row_data)
        else:
            try:
                cell = sheet.find(str(instance.ticket_id))
                cell_range = f"A{cell.row}:H{cell.row}"
                sheet.update(cell_range, [row_data])
            except:
                pass

    # 3. HANDLE EMAILS
    context = {
        'full_name': instance.client.full_name,
        'ticket_id': instance.ticket_id,
        'service_type': instance.get_service_type_display(),
        'delivery_method': instance.delivery_method,
        'site_url': os.getenv('SITE_DOMAIN', 'http://localhost:3000')
    }

    try:
        if created:
            # CASE A: Welcome Email
            html_message = render_to_string(
                'emails/order_confirmation.html', context)
            send_mail(f"Order Received: {instance.ticket_id}", strip_tags(
                html_message), settings.DEFAULT_FROM_EMAIL, [instance.client.email], html_message=html_message)
            # Admin Notification
            send_mail(f"🚨 New Order: {instance.ticket_id}", f"New {instance.service_type} from {instance.client.full_name}.",
                      settings.DEFAULT_FROM_EMAIL, ['praisecookie3@gmail.com'])

        elif instance.status == 'READY':
            # CASE B: Ready for Delivery
            html_message = render_to_string('emails/order_ready.html', context)
            send_mail(f"Your Paepar Request is Ready! ({instance.ticket_id})", strip_tags(
                html_message), settings.DEFAULT_FROM_EMAIL, [instance.client.email], html_message=html_message)

        elif instance.status == 'DELIVERED':
            # CASE C: Successfully Delivered
            html_message = render_to_string(
                'emails/order_delivered.html', context)
            send_mail(f"Service Completed: {instance.ticket_id}", strip_tags(
                html_message), settings.DEFAULT_FROM_EMAIL, [instance.client.email], html_message=html_message)

    except Exception as e:
        print(f"Email Error: {e}")

# --- 4. SYNC CLIENTS ---


@receiver(post_save, sender=Client)
def sync_client_to_sheet(sender, instance, created, **kwargs):
    if created:
        sheet = get_sheet_tab("Clients")
        if sheet:
            row = [
                instance.full_name, instance.phone, instance.email,
                instance.state_of_origin, instance.lga_of_origin,
                instance.residential_address, str(instance.dob)
            ]
            if len(sheet.get_all_values()) == 0:
                sheet.append_row(
                    ["Full Name", "Phone", "Email", "State", "LGA", "Address", "DOB"])
            sheet.append_row(row)

# --- 5. SYNC AGENTS ---


@receiver(post_save, sender=Agent)
def sync_agent_to_sheet(sender, instance, created, **kwargs):
    if created:
        sheet = get_sheet_tab("Agents")
        if sheet:
            services_str = ", ".join(
                instance.services_offered) if instance.services_offered else ""
            row = [
                instance.full_name, instance.phone, instance.email,
                instance.state_of_practice, "Yes" if instance.is_licensed else "No",
                services_str
            ]
            if len(sheet.get_all_values()) == 0:
                sheet.append_row(
                    ["Agent Name", "Phone", "Email", "State", "Licensed?", "Services"])
            sheet.append_row(row)
