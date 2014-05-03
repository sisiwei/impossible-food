import requests
import json

#finds a returns values that are in all three datasets
#groups livestock and crops under production

urls = {}

urls['crops'] = "http://faostat3.fao.org/faostat-api/rest/procedures/items/faostat/QC/E"
urls['livestock'] = "http://faostat3.fao.org/faostat-api/rest/procedures/items/faostat/QL/E"
urls['trade'] = "http://faostat3.fao.org/faostat-api/rest/procedures/items/faostat/TM/E"

production = []
trade = {}

shared_items = {}

for key in urls:
    response = requests.get(urls[key]).json()    
    for res in response:
        if key != 'trade':
            production.append(res[0])
        else:
            trade[str(res[0])] = res[1]

for prod in production:
    if prod in trade:
        shared_items[str(prod)] = trade[str(prod)]

output = open('shared_items.json','wb')

output.write(json.dumps(shared_items))

output.close




