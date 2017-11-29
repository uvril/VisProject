import requests  
import re
from html.parser import HTMLParser
import json
parser = HTMLParser()

def query(country, wd, data):
	
	pn = 1
	cur_pn = 1
	while cur_pn <= pn:
		html = requests.get('https://www.onthisday.com/countries/%s?p=%d' % (country, cur_pn))
		cur_pn += 1
	
		for line in html.text.split('\n'):
			if line == """<header class="section__heading"><h2>Famous Birthdays</h2></header>""":
				break
			findre = re.findall(r'(\d\d\d\d-\d\d-\d\d)', line)
			if len(findre) > 0:
				str = line[:]
				str = re.sub(r'<script>[^<]+</script>', "", str)
				str = re.sub('<[^<]+>', "", str)
				str = parser.unescape(str)
				
				if len(re.findall(r' BC ', str)) == 0:
					yy = int(str[:4])
					if yy>1940:
						ee = str[11:]
						eed = {"wd" : wd, "event" : ee}
						if not yy in data:
							data[yy] = [eed]
						else:
							data[yy].append(eed)
			s = re.findall("""<a href="/countries/%s\?p=[\d]+""" % country, line)
			if len(s) > 0:
				t_pn = int(re.findall("[\d]+", s[0])[0])
				if t_pn > pn:
					pn = t_pn
	

cl = open("cl.txt", "r")
data = {}
for cll in cl:
	acl = cll.strip().split()
	cn = acl[0]
	wd = int(acl[1])
	query(cn, wd, data)

f = open("events.txt", "w", encoding="utf-8")
json.dump(data, f)
f.close()