import json
import sys
from multiprocessing import Pool

DOMAIN = "TM"

def read_file(year):
  data = []
  with open("%s-%s.json" % (DOMAIN, year), 'rb') as f:
    j = json.loads(f.read())
    for row in j:
      data.append({
        'domain': row[1],
        'country': row[2],
        'country_code': int(row[3]),
        'item': row[4],
        'item_code': int(row[5]),
        'element': row[6],
        'element_code': int(row[7]),
        'year': int(row[8]),
        'units': row[9],
        'value': row[10],
        'flag': row[11]
      })
    print j[0]

  #print year, len(data)
  #print data[100]
  return data

if __name__ == "__main__":
  pool = Pool(processes=3)
  #datas = pool.map(read_file, (2011, 2009, 2008))
  datas = []
  for year in (2011, 2009, 2008):
    datas.append(read_file(year))
  data = reduce(lambda a, b: a+b, datas)
