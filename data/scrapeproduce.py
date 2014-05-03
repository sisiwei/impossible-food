import io
import json
import requests
import sys
import os.path
from pprint import pprint

produce_list = json.loads(open('shared_items.json','rb').read())

produce = {'crops':{'domain':'QC','items':[],'elements':[]},'livestock':{'domain':'QL','items':[],'elements':[]}}

produce['crops']['items'] = produce_list['crops'].keys()
produce['livestock']['items'] = produce_list['livestock'].keys()

elements_url = "http://faostat3.fao.org/faostat-api/rest/procedures/elements/faostat/"


crops_elements = []
livestock_elements = []

for key in produce:
    response = requests.get("%s%s/E" % (elements_url, produce[key]['domain']))
    for res in response.json():
        produce[key]['elements'].append(res[0])


years = [2011]

for year in years:
    for key in produce:
        data = {
          "datasource" : "faostat",
          "domainCode" : produce[key]['domain'],
          "lang" : "E",
          "areaCodes" : ["231",], #country_codes,
          "itemCodes" : produce[key]['items'],
          "elementListCodes" : produce[key]['elements'],
          "years" : [year],
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
        response = requests.post(
          "http://faostat3.fao.org/faostat-api/rest/procedures/data",
          data={"payload": data_str}
        )
        print "%s: %s - %s" % (response.status_code, year, response.url)
        with io.BytesIO(response.content) as i:
          with io.open("%s-%s.json" % (key, year), 'wb') as f:
            data=i.read(16384)
            while data:
              f.write(data)
              data=i.read(16384)