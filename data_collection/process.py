import json

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




for i in range(1946, 2017):

    try:

        d = json.loads(open("cntry%d.json" % i, "r", encoding="utf-8").read())
        
        for j in d["geo"]["features"]:
            jp = j["properties"]
            jid = jp["id"]
            jd = d["data"][str(jid)][0]
            jp["NAME"] = jd["name"]
            jp["wikidata"] = jd["wikidata"]

        nf = d["geo"]
        for j in nf["features"]:
            jp = j["properties"]
            jl = calc(j)
            jp["x1"] = jl[0][0]
            jp["y1"] = jl[0][1]
            jp["x2"] = jl[1][0]
            jp["y2"] = jl[1][1]
            jp["c1"] = jl[2][0]
            jp["c2"] = jl[2][1]

        fn = "after\cntry%d.json" % i
         
        of = open(fn, "w")
        json.dump(nf, of)


    except FileNotFoundError:
        continue


