import wget
import os

for k in range(1946, 2017):
    url = "http://api.thenmap.net/v1/world-2/geo|data/%d?data_props=name|wikidata" % k
    wget.download(url);
    os.rename(str(k), "cntry%d.json" %k)

