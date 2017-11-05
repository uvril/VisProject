#!/bin/bash
for k in $( seq 1946 2017 )
do
	wget http://api.thenmap.net/v1/world-2/geo/${k}
	mv ${k} cntry${k}.json
done
