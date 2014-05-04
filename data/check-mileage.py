import json
import os
import csv
import re



rows = [["Item","Miles","Imports","Exports","Domestic"]]
for dirname, dirnames, filenames in os.walk('./mileage'):
    for filename in filenames:
        fooditem = json.loads(open(os.path.join(dirname,filename),'rb').read())
        itemname = re.sub("231-","",filename)
        itemname = re.sub("\.json","",itemname)
        row = [itemname,fooditem['miles'],fooditem['imports'],fooditem['exports'],fooditem['domestic']]
        rows.append(row)


with open('mileage.csv','wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerows(rows)


