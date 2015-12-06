from django.db import models

class Marker(models.Model):
    omlet_id = models.CharField(max_length=100, unique=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    creation_time = models.DateTimeField(auto_now_add=True)
    timestamp = models.DateTimeField(auto_now=True)
    def as_dict(self):
        return dict(
            omlet_id=self.omlet_id,
            lat=self.lat, 
            lng=self.lng,
            creation_time=self.creation_time.isoformat(),
            timestamp=self.timestamp.isoformat(),
        )

class Group(models.Model):
	conversation_id = models.CharField(max_length=100, unique=True)
	title = models.CharField(max_length=32)
	center_lat = models.FloatField(null=True, blank=True)
	center_lng = models.FloatField(null=True, blank=True)
	zoom = models.IntegerField(null=True, blank=True)
	markers = models.ManyToManyField(Marker, blank=True)
	creation_time = models.DateTimeField(auto_now_add=True)
	timestamp = models.DateTimeField(auto_now=True)
	def as_dict(self):
		return dict(
			conversation_id=self.conversation_id,
			title=self.title,
			center= dict(
				lat=self.center_lat, 
				lng=self.center_lng,
				),
			zoom=self.zoom,
			markers=[marker.as_dict() for marker in self.markers.all()],
			creation_time=self.creation_time.isoformat(),
			timestamp=self.timestamp.isoformat(),
		)

