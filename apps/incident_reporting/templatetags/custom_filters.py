# apps/common/templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter
def length_is(value, arg):
    """Mimics old length_is filter behavior for Django >= 5"""
    try:
        return len(value) == int(arg)
    except Exception:
        return False
