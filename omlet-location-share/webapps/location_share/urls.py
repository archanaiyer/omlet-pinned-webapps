from django.conf.urls import patterns, include, url
urlpatterns = patterns('',

    url(r'^group$', 'location_share.views.group', name = 'group'),
    url(r'^group/(?P<group_id>\w+)$', 'location_share.views.group_id', name = 'group-id'),

    url(r'^marker$', 'location_share.views.marker', name = 'marker'),
    url(r'^marker/(?P<marker_id>\w+)$', 'location_share.views.marker_id', name = 'marker-id'),

    url('^$', 'location_share.views.home', name = 'home')
)
