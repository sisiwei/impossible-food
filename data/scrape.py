import io
import json
import requests
import sys
from cStringIO import StringIO

if __name__ == "__main__":
  DOMAIN = "TA"


  gd_response = requests.get("http://faostat3.fao.org/faostat-api/rest/groupsanddomains/faostat/E")
  print "%s: %s" % (gd_response.status_code, gd_response.url)
  domain_data = map(lambda d: (d[0], d[1]), gd_response.json())
  with open("groups-and-domains.json", 'wb') as f:
    f.write(gd_response.text.encode('utf-8'))
  

  c_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/countries/faostat/%s/E" % DOMAIN)
  print "%s: %s" % (c_response.status_code, c_response.url)
  country_data = map(lambda d: (d[0], d[1]), c_response.json())
  country_codes = map(lambda c: c[0], country_data)
  with open("%s-countries.json" % DOMAIN, 'wb') as f:
    f.write(c_response.text.encode('utf-8'))

  i_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/items/faostat/%s/E" % DOMAIN)
  print "%s: %s" % (i_response.status_code, i_response.url)
  item_data = map(lambda d: (d[0], d[1]), i_response.json())
  item_codes = map(lambda c: c[0], item_data)
  with open("%s-items.json" % DOMAIN, 'wb') as f:
    f.write(i_response.text.encode('utf-8'))

  e_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/elements/faostat/%s/E" % DOMAIN)
  print "%s: %s" % (e_response.status_code, e_response.url)
  element_data = map(lambda d: (d[0], d[1]), e_response.json())
  element_codes = map(lambda c: c[0], element_data)
  with open("%s-elements.json" % DOMAIN, 'wb') as f:
    f.write(e_response.text.encode('utf-8'))

  y_response = requests.get("http://faostat3.fao.org/faostat-api/rest/procedures/years/faostat/TM")
  print "%s: %s" % (y_response.status_code, y_response.url)
  year_codes = map(lambda c: int(c[0]), y_response.json())

  for y in year_codes:
    data = {
      "datasource" : "faostat",
      "domainCode" : DOMAIN,
      "lang" : "E",
      "areaCodes" : country_codes,
      "itemCodes" : item_codes,
      "elementListCodes" : element_codes,
      "years" : [y],
      "flags" : True,
      "codes" : True,
      "units" : True,
      "nullValues" : False,
      "thousandSeparator" : ",",
      "decimalSeparator" : ".",
      "decimalPlaces" : 2,
      "limit" : -1
    }
    data_str = json.dumps(data)

    #print data_str
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
