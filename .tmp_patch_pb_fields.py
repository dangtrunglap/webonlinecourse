import requests

base='http://127.0.0.1:8090'
a=requests.post(base+'/api/collections/_superusers/auth-with-password',json={'identity':'integration@onlinecourse.local','password':'PbIntegration@2026'})
a.raise_for_status()
h={'Authorization':'Bearer '+a.json()['token']}

def get_collection(name):
    r=requests.get(base+f'/api/collections/{name}',headers=h)
    r.raise_for_status()
    return r.json()

def ensure_field(name, field_obj):
    col=get_collection(name)
    fields=col.get('fields',[])
    if any(f.get('name')==field_obj.get('name') for f in fields):
        print(name, field_obj['name'], 'exists')
        return
    fields.append(field_obj)
    payload={
        'name': col['name'],
        'type': col['type'],
        'listRule': col.get('listRule'),
        'viewRule': col.get('viewRule'),
        'createRule': col.get('createRule'),
        'updateRule': col.get('updateRule'),
        'deleteRule': col.get('deleteRule'),
        'fields': fields,
        'indexes': col.get('indexes',[])
    }
    r=requests.patch(base+f"/api/collections/{col['id']}",headers=h,json=payload)
    print(name, field_obj['name'], 'patch', r.status_code)
    if not r.ok:
        print(r.text)
        r.raise_for_status()

ensure_field('users', {'name':'role','type':'select','required':True,'maxSelect':1,'values':['Student','Instructor','Admin']})
ensure_field('courses', {'name':'price','type':'number','required':True})
ensure_field('courses', {'name':'instructorId','type':'text','required':False})
ensure_field('courses', {'name':'instructorName','type':'text','required':False})

print('done')
