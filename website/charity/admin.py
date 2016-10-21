from django.contrib import admin
from charity.models.charity_profile import CharityProfile
from charity.models.user_profile import UserProfile
from charity.models.user_role import UserRole

# Register your models here.
admin.site.register(UserRole)
admin.site.register(CharityProfile)
admin.site.register(UserProfile)