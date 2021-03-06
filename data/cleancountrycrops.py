import json

records = json.loads(open('all-countries-crops-2011.json','rb').read())
rows = []
for record in records:
    country = record[3]
    crop = record[5]
    category = record[6]
    amount = record[10]
    if 'Production' not in category:
    	continue
    if not amount:
      continue
    rows.append({'crop':crop,'country':country,'amount':float(amount.replace(',',''))})
   



output=open('clean/all-countries-domestic-crops.json','wb')

output.write(json.dumps(rows))

output.close()
