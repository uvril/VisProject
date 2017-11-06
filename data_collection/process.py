import json

for i in range(1946, 2015):
    d = json.loads(open("../data/cntry%d.json" % i, "r", encoding="utf-8").read())
    """
    i = d["data"]["1"][0]
    n = i["name"]
    w = i["wikidata"]
    """
    for j in d["geo"]["features"]:
        jp = j["properties"]
        jid = jp["id"]
        jd = d["data"][str(jid)][0]
        jp["name"] = jd["name"]
        jp["wikidata"] = jd["wikidata"]

    nf = d["geo"]

    of = open("cntry%d.json" % i, "w")
    json.dump(nf, of)


