import requests
import json

#finds a returns values that are in all three datasets
#groups livestock and crops under production

urls = {}

urls['crops'] = "QC/E"
urls['livestock'] = "QL/E"
urls['trade'] = "TM/E"

base_url = "http://faostat3.fao.org/faostat-api/rest/procedures/items/faostat/"
production = []
trade = {}
shared_items = {'crops':{},'livestock':{}}

for key in urls:
    response = requests.get(base_url+urls[key]).json()    
    for res in response:
        if key != 'trade':
            production.append([res[0],key])
        else:
            trade[str(res[0])] = res[1]

for prod in production:
    if prod[0] in trade:
        shared_items[prod[1]][str(prod[0])] = trade[str(prod[0])]

output = open('shared_items.json','wb')

output.write(json.dumps(shared_items))

output.close




