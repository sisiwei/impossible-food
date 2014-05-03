import json

UNITED_STATES = 231

#i=>importer, e=>exporter, c=>productcode, a=>amount in tonnes

matrix = json.loads(open('clean/trade-matrix-2011.json','rb').read())

items = json.loads(open('clean/items-by-code.json','rb').read())

countries = json.loads(open('clean/countries-by-code.json','rb').read())

products = {}

for key in items:
    products[int(key)] = {'imported_from':{}, 'exported_to':{}}

for record in matrix:
    pcode = record['c']
    importer = record['i']
    exporter = record['e']
    amount = record['a']
    if importer != UNITED_STATES and exporter != UNITED_STATES:
        # US not involved in this
        continue
    if not amount:
        continue
    if importer == UNITED_STATES:
        products[pcode]['imported_from'][exporter] = amount
    if exporter == UNITED_STATES:
        products[pcode]['exported_to'][importer] = amount

deleteme = []
for key in products:
    if (not products[key]['imported_from']) and (not products[key]['exported_to']):
        deleteme.append(key)
for k in deleteme:
    del products[k]



from random import choice
for _ in range(10):
    item = choice(products.keys())
    item_name = items[str(item)]
    exports = products[item]['exported_to']
    imports = products[item]['imported_from']

    country = choice(exports.keys())
    amount = products[item]['exported_to'][country]
    cname = countries[str(country)]

    print "US exported %s tons of %s to %s" % (amount, item_name, cname)

output = open('cleaned-matrix.json','wb')

output.write(json.dumps(products))
output.close