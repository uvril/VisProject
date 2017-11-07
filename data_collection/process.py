import json

for i in range(1946, 2016):
    try:
        d = json.loads(open("../data/cntry%d.json" % i, "r", encoding="utf-8").read())
        for j in d["geo"]["features"]:
            jp = j["properties"]
            jid = jp["id"]
            jd = d["data"][str(jid)][0]
            jp["NAME"] = jd["name"]
            jp["wikidata"] = jd["wikidata"]

        nf = d["geo"]

        of = open("cntry%d.json" % i, "w")
        json.dump(nf, of)
    except:
        pass



