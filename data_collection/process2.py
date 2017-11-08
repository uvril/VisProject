import json
import os
from SPARQLWrapper import SPARQLWrapper, JSON

from osgeo import ogr

def get_dist(p1, p2):
    xd = p1[0] - p2[0]
    yd = p1[1] - p2[1]
    return (xd ** 2) + (yd ** 2)

def calc(d):
    geom = d["geometry"]
    propos = d["properties"]
    gg = ogr.CreateGeometryFromJson(json.dumps(geom))
    maxg = gg
    maxa = 0
    if (gg.GetGeometryType() == ogr.wkbMultiPolygon):

        for i in range(gg.GetGeometryCount()):
            cur_g = gg.GetGeometryRef(i)
            cur_a = cur_g.GetArea()
            if (cur_a > maxa):
                maxa = cur_a
                maxg = cur_g

    cen = maxg.Centroid().GetPoint()
    maxg =maxg.GetGeometryRef(0) 
                
    pt = []
    for i in range(maxg.GetPointCount()):
        pt.append(maxg.GetPoint(i))

    max_dist = 0
    max_pt = None
    for i in range(len(pt)):
        for j in range(i+1, len(pt)):
            dist = get_dist(pt[i], pt[j])
            if dist > max_dist:
                max_dist = dist
                max_pt = [pt[i], pt[j]]
    if max_pt[0][0] > max_pt[1][0]:
        max_pt = [max_pt[1], max_pt[0]]
    max_pt.append(cen)
    return max_pt


dd = {
    "Cyprus" : 229,
    "unclaimed" : -1,
    "Puerto Rico" : 1183,
    "Greenland" : 223,
    "Antarctica" : 51,
    "Sardinia" : 1462,
    "Hainan" : 42200,
    "Aragon" : 199442,
    "Expansionist Kingdom of Merina" : 1071439,
    "Teutonic Knights" : 156020,
    "Sinhalese kingdom" : 7524320,
    "Shoa" : 971375,
    "Bornu-Kanem" : 1139762,
    "Sicily" : 188586
    }


for root, dirs, files in os.walk("."):
    for osfn in files:
        if not osfn.endswith(".json"):
            continue
        print(osfn)
        d = json.loads(open(osfn, "r", encoding="utf-8").read())

        sparql = SPARQLWrapper("https://query.wikidata.org/bigdata/namespace/wdq/sparql")
        cnt = -2
        for j in d["features"]:
            jp = j["properties"]
            jp["wikidata"] = str(cnt)
            cnt -= 1
            name = jp["NAME"]

            if name in dd:
                jp["wikidata"] = str(dd[name])
            else:

                q = """SELECT ?child ?childLabel
                WHERE {
              ?child wdt:P31 wd:Q6256.
              ?child  rdfs:label ?childLabel.
              filter (lang(?childLabel) = "en").
              filter (contains(?childLabel, """

                q += '"%s")).}' % name

                sparql.setQuery(q)
                sparql.setReturnFormat(JSON)
                results = sparql.query().convert()["results"]["bindings"]

                if (len(results) == 1):
                    ddname = results[0]["child"]["value"][31:]
                    dd[name] = ddname
                    jp["wikidata"] = ddname
                elif (len(results) == 0):
                    q = """SELECT ?child ?childLabel
                    WHERE {
                  {?child wdt:P31 [wdt:P279 wd:Q6256]} union {?child wdt:P31 wd:Q6256} union {?child wdt:P31 [wdt:P279 wd:Q7275]}.
                  ?child  rdfs:label ?childLabel.
                  filter (lang(?childLabel) = "en").
                  filter (contains(?childLabel, """

                    q += '"%s")).}' % name

                    sparql.setQuery(q)
                    sparql.setReturnFormat(JSON)
                    results = sparql.query().convert()["results"]["bindings"]
                    if (len(results) == 1):
                        ddname = results[0]["child"]["value"][31:]
                        dd[name] = ddname
                        jp["wikidata"] = ddname
                    else:
                        print("Oops %s" % name)

                else:
                    print("Oops %s" % name)


            jl = calc(j)
            jp["x1"] = jl[0][0]
            jp["y1"] = jl[0][1]
            jp["x2"] = jl[1][0]
            jp["y2"] = jl[1][1]
            jp["c1"] = jl[2][0]
            jp["c2"] = jl[2][1]

        fn = "..\\after\\" + osfn
         
        of = open(fn, "w")
        json.dump(d, of)

