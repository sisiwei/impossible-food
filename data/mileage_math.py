from __future__ import division
import json

UNITED_STATES = 231

#i=>importer, e=>exporter, c=>productcode, a=>amount in tonnes

matrix = json.loads(open('clean/trade-matrix-2011.json','rb').read())

items = json.loads(open('clean/items-by-code.json','rb').read())

countries = json.loads(open('clean/countries-by-code.json','rb').read())

distances = json.loads(open('clean/distances.json','rb').read())

local_prod = json.loads(open('clean/all-countries-domestic-crops.json','rb').read())

us_products = set({})
us_imports = {}
us_exports = {}

for record in matrix:
    pcode = record['c']
    importer = record['i']
    exporter = record['e']
    amount = record['a']
    #if not amount:
    #    continue
    if importer == UNITED_STATES:
        us_products.add(pcode)
        if pcode not in us_imports:
          us_imports[pcode] = {exporter: amount}
        else:
          us_imports[pcode][exporter] = amount
    if exporter == UNITED_STATES:
        us_products.add(pcode)
        if pcode not in us_exports:
          us_exports[pcode] = {importer: amount}
        else:
          us_exports[pcode][importer] = amount

production = {}
for row in local_prod:
  k = (row['country'], row['crop'])
  production[k] = row['amount']

DISTANCE_K = {
  '41':'351',#china
  '96':'351',#hong kong (-> china)
  '46':'250',#congo
  '128':'351',#macao (-> china)
  '299':'105', #occupied palestinian territory
  '151':'55', #netherlands antilles (approx to dominica)
}

for product_code in us_products:
  product_name = items[str(product_code)]

  production_key = ("231", str(product_code))

  try:
    exports = us_exports[product_code]
  except KeyError:
    exports = {}
  try:
    imports = us_imports[product_code]
  except KeyError:
    imports = {}

  total_exported = sum(exports.values())
  total_imported = sum(imports.values())
  try:
    total_produced = float(production[production_key])
  except KeyError:
    total_produced = 0

  supply = (total_produced + total_imported)

  if supply == 0:
    continue

  discount = (supply-total_exported) / supply

  countries_numerator = []
  skipped_tonnage = 0
  for country_id in imports.keys():
    try:
      dist_key = "%s-231" % DISTANCE_K.get(str(country_id), country_id)
      countries_numerator.append(discount * imports[country_id] * distances[dist_key])
    except:
      skipped_tonnage += imports[country_id] * discount
      continue
  total_imported -= skipped_tonnage
  unweighted_distance =  sum(countries_numerator)/(total_imported*discount)
  distance = sum(countries_numerator)/((total_imported+total_produced)*discount)

  print "%45s (%3s) - %7.2f miles (%7.2f unweighted)" % (product_name, product_code, distance, unweighted_distance)
  #print "\t%s tonne-miles / %s tonnes" % (sum(countries_numerator), total_imported)
  #print "\t%s tonne-miles / (%s + %s) tonnes " % (sum(countries_numerator), total_imported, total_produced)
  print "\timported: %11.2f (skipped %s)" % (total_imported, skipped_tonnage)
  print "\tproduced: %11.2f" % total_produced
  print "\tSUPPLY:   %11.2f" % (total_produced + total_imported)
  print "\tEXPORTS:  %11.2f" % total_exported
