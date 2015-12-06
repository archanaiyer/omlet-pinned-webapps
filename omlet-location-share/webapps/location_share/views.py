from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpResponseServerError
from django.db import transaction
from location_share.models import *
from location_share.forms import *
from json import dumps
import json
from django.views.decorators.csrf import csrf_exempt

def home(request):
	return render(request, 'location_share/index.html')

@csrf_exempt
@transaction.atomic
def group(request):
	try:
		if request.method == 'GET':
			groups = Group.objects.all()
			response_text = json.dumps([group.as_dict() for group in groups])
			return HttpResponse(response_text, content_type='application/json')
		elif request.method == 'POST':
			in_data = json.loads(request.body)
			if not Group.objects.filter(conversation_id=in_data.get('conversation_id')).exists():
				entry = Group(conversation_id=in_data.get('conversation_id'))
			else:
				entry = Group.objects.get(conversation_id=in_data.get('conversation_id'))
			form = GroupForm(data={'title': in_data.get('title')}, instance=entry)
			if form.is_valid():
				new_entry = form.save()
				marker_ids = in_data.get('markers')
				for marker_id in marker_ids: #create markers if not exist
					if not Marker.objects.filter(omlet_id=marker_id).exists():
						new_marker = Marker(omlet_id=marker_id)
						new_marker.save()
					else:
						new_marker = Marker.objects.get(omlet_id=marker_id)
					new_entry.markers.add(new_marker)
				response_text = json.dumps(new_entry.as_dict())
				return HttpResponse(response_text, content_type='application/json')
			else:
				errors = []
				errors.append('Woops! Something wrong.')
				return HttpResponseBadRequest(json.dumps({'errors':errors}), content_type='application/json')
	except Exception as inst:
		print inst
		return HttpResponseServerError(inst, content_type='application/json')

@csrf_exempt
@transaction.atomic
def group_id(request, group_id):
	try:
		group = Group.objects.get(conversation_id=group_id)  
		if request.method == 'GET':
			response_text = json.dumps(group.as_dict())
			return HttpResponse(response_text, content_type='application/json')
		# elif request.method == 'POST':
		# 	in_data = json.loads(request.body)
		# 	form = groupForm(data={'content': in_data.get('content')}, instance=group)
		# 	if form.is_valid():
		# 		new_entry = form.save()
		# 		response_text = json.dumps(new_entry.as_dict())		  
		# 		return HttpResponse(response_text, content_type='application/json')
		# 	else:
		# 		errors = []
		# 		errors.append('Woops! Something wrong.')
		# 		return HttpResponseBadRequest(json.dumps({'errors':errors}), content_type='application/json')
	except ObjectDoesNotExist:
		return HttpResponseNotFound('Group not found.', content_type='application/json')
	except Exception as inst:
		print inst
		return HttpResponseServerError(inst, content_type='application/json')

@csrf_exempt
@transaction.atomic
def marker(request):
	try:
		if request.method == 'GET':
			markers = Marker.objects.all()
			response_text = json.dumps([marker.as_dict() for marker in markers])
			return HttpResponse(response_text, content_type='application/json')
	except Exception as inst:
		print inst
		return HttpResponseServerError(inst, content_type='application/json')

@csrf_exempt
@transaction.atomic
def marker_id(request, marker_id):
	try:
		marker = Marker.objects.get(omlet_id=marker_id)  
		if request.method == 'POST':
			in_data = json.loads(request.body)
			print in_data
			form = MarkerForm(
				data={
					'lat': in_data.get('lat'), 
					'lng' : in_data.get('lng')}, 
				instance=marker)
			if form.is_valid():
				new_entry = form.save()
				response_text = json.dumps(new_entry.as_dict())		  
				return HttpResponse(response_text, content_type='application/json')
			else:
				errors = []
				errors.append('Woops! Something wrong.')
				return HttpResponseBadRequest(json.dumps({'errors':errors}), content_type='application/json')
	except ObjectDoesNotExist:
		return HttpResponseNotFound('Marker not found.', content_type='application/json')
	except Exception as inst:
		print inst
		return HttpResponseServerError(inst, content_type='application/json')

