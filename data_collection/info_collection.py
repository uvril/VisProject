import json
import os
import os.path
from SPARQLWrapper import SPARQLWrapper, JSON

from osgeo import ogr

sparql = SPARQLWrapper("https://query.wikidata.org/bigdata/namespace/wdq/sparql")
dat = {}
errf = open("errf", "w")

def query(q):
    global sparql
    global errf
    sparql.setQuery(q)
    sparql.setReturnFormat(JSON)
    try:
        results = sparql.query().convert()["results"]["bindings"]
        return results
    except:
        errf.write(q)
        errf.write("\n")
    return []

def articleQuery(wd):
    q = """
        SELECT ?url WHERE {
            ?url schema:about wd:Q%d.
            ?url schema:isPartOf <https://en.wikipedia.org/>. }
        """ % wd
    res = query(q)
    ret = []
    for i in res:
        ret.append(i["url"]["value"])
    return ret

def labelQuery(wd, dom):
    q = """
        SELECT ?name WHERE {
        wd:Q%d wdt:P%d ?link.
        ?link rdfs:label ?name.
        filter (lang(?name) = "en"). }
        """ % (wd, dom)
    res = query(q)
    ret = []
    for i in res:
        ret.append(i["name"]["value"])
    return ret

def statsQuery(wd, dom):
    q = """
        SELECT ?stats ?year WHERE {
        wd:Q%d p:P%d ?link.
        ?link ps:P%d ?stats.
        ?link pq:P585 ?date.
        bind (year(?date) as ?year) }
        """ % (wd, dom, dom)
    res = query(q)
    ret = []
    s = {}
    for i in res:
        yy = i["year"]["value"]
        dd = i["stats"]["value"]
        if not yy in s:
            s[yy] = 1
            ret.append({"year":yy, "stats":dd})
    return ret


for root, dirs, files in os.walk("."):
    for osfn in files:
        if not osfn.endswith(".json"):
            continue
        print(osfn)
        d = json.loads(open(osfn, "r", encoding="utf-8").read())

        for j in d["features"]:
            jp = j["properties"]
            try:
                wd = int(jp["wikidata"])
                fn = "..\\stat\\%d.json" % wd
                if wd>0:
                    if not os.path.isfile(fn):
                        rec = {}
                        rec["wiki"] = articleQuery(wd)
                        rec["capital"] = labelQuery(wd, 36)
                        rec["continent"] = labelQuery(wd, 30)
                        rec["headState"] = labelQuery(wd, 35)
                        rec["headGov"] = labelQuery(wd, 6)
                        rec["pop"] = statsQuery(wd, 1082)
                        rec["hdi"] = statsQuery(wd, 1081)
                        print(jp["NAME"])
                        f = open(fn, "w")
                        json.dump(rec, f)
                        f.close()
            except:
                errf.write(jp["NAME"])
                errf.write(jp["wikidata"])
                errf.write("\n")
                continue

errf.close()
