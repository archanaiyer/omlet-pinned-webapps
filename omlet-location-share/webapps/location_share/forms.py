from django import forms
from models import *
        
class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        exclude = (
            'conversation_id',
            'center_lat',
            'center_lng',
            'zoom',
        )

class MarkerForm(forms.ModelForm):
    class Meta:
        model = Marker
        exclude = (
            'omlet_id',
        )
        