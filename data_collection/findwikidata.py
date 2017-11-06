from SPARQLWrapper import SPARQLWrapper, JSON
sparql = SPARQLWrapper("https://query.wikidata.org/bigdata/namespace/wdq/sparql")
sparql.setQuery("""SELECT ?child
WHERE
{
  ?child wdt:P901 ?code.
  FILTER (?code = "CY").
}""")
sparql.setReturnFormat(JSON)
results = sparql.query().convert()

print(results)

print(results["results"]["bindings"][0]["child"]["value"])

"""

import json

f = open("cntry1000.json")
data = json.loads(f.read())
features = data["features"][0]["properties"]

print(features)

"""

"""
SELECT distinct ?child ?childLabel
WHERE
{
  {?child wdt:P31 [wdt:P279 wd:Q6256]} union {?child wdt:P31 wd:Q6256} union {?child wdt:P31 [wdt:P279 wd:Q7275]}.
  ?child  rdfs:label ?childLabel
          
  filter (lang(?childLabel) = "en").
  
  FILTER(contains(?childLabel, "Roman")).
}
"""
