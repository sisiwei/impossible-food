import io
import json
import requests
import sys
import os.path
from pprint import pprint

if __name__ == "__main__":
  DOMAIN = "TM"

  fn = "groups-and-domains.json"
  if not os.path.exists(fn):
    gd_response = requests.get("http://faostat3.fao.org/faostat-api/rest/groupsanddomains/faostat/E")
    print "%s: %s" % (gd_response.status_code, gd_response.url)
    domain_data = map(lambda d: (d[0], d[1]), gd_response.json())
    with open(fn, 'wb') as f:
      f.write(gd_response.text.encode('utf-8'))
  
  fn = "%s-countries.json" % DOMAIN
  if not os.path.exists(fn):
    c_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/countries/faostat/%s/E" % DOMAIN)
    print "%s: %s" % (c_response.status_code, c_response.url)
    country_codes = map(lambda c: c[0], c_response.json())
    with open(fn, 'wb') as f:
      f.write(c_response.text.encode('utf-8'))
  else:
    with open(fn, 'rb') as f:
      country_codes = map(lambda c: c[0], json.loads(f.read()))


  fn = "%s-special-groups.json" % DOMAIN
  if not os.path.exists(fn):
    s_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/countries/faostat/%s/E" % DOMAIN)
    print "%s: %s" % (s_response.status_code, s_response.url)
    specialgroup_codes = map(lambda c: c[0], s_response.json())
    with open(fn, 'wb') as f:
      f.write(s_response.text.encode('utf-8'))
  else:
    with open(fn, 'rb') as f:
      specialgroup_codes = map(lambda c: c[0], json.loads(f.read()))

  fn = "%s-items.json" % DOMAIN
  if not os.path.exists(fn):
    i_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/items/faostat/%s/E" % DOMAIN)
    print "%s: %s" % (i_response.status_code, i_response.url)
    item_codes = map(lambda c: c[0], i_response.json())
    with open(fn, 'wb') as f:
      f.write(i_response.text.encode('utf-8'))
  else:
    with open(fn, 'rb') as f:
      item_codes = map(lambda c: c[0], json.loads(f.read()))

  fn = "%s-elements.json" % DOMAIN
  if not os.path.exists(fn):
    e_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/elements/faostat/%s/E" % DOMAIN)
    print "%s: %s" % (e_response.status_code, e_response.url)
    element_codes = map(lambda c: c[0], e_response.json())
    with open(fn, 'wb') as f:
      f.write(e_response.text.encode('utf-8'))
  else:
    with open(fn, 'rb') as f:
      element_codes = map(lambda c: c[0], json.loads(f.read()))

  fn = "%s-years.json" % DOMAIN
  if not os.path.exists(fn):
    y_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/years/faostat/TM")
    print "%s: %s" % (y_response.status_code, y_response.url)
    year_codes = map(lambda c: int(c[0]), y_response.json())
    with open(fn, 'wb') as f:
      f.write(y_response.text.encode('utf-8'))
  else:
    with open(fn, 'rb') as f:
      year_codes = map(lambda c: int(c[0]), json.loads(f.read()))

  for y in [2011,]: #year_codes:
    data = {
      "datasource" : "faostat",
      "domainCode" : DOMAIN,
      "lang" : "E",
      "areaCodes" : ["231",], #country_codes,
      "itemCodes" : item_codes,
      "elementListCodes" : element_codes,
      "years" : [y],
      "flags" : True,
      "codes" : True,
      "units" : True,
      "nullValues" : True,
      "thousandSeparator" : ",",
      "decimalSeparator" : ".",
      "decimalPlaces" : 2,
      "limit" : -1
    }
    data_str = json.dumps(data)

    #pprint(data_str)

    response = requests.post(
      "http://faostat3.fao.org/faostat-api/rest/procedures/data",
      data={"payload": data_str}
    )
    print "%s: %s - %s" % (response.status_code, y, response.url)
    with io.BytesIO(response.content) as i:
      with io.open("%s-%s.json" % (DOMAIN, y), 'wb') as f:
        data=i.read(16384)
        while data:
          f.write(data)
          data=i.read(16384)
