class Map {

    constructor(infoPanel) {
        this.projection = d3.geoPatterson();
        this.infoPanel = infoPanel;
    }

    drawMap(year) {
        let path = d3.geoPath()
            .projection(this.projection);

        let years = [-2000, -1000, -500, -323, -200, -1, 400, 600, 800, 1000, 1279, 1492, 1530, 1650, 1715, 1783, 1815, 1880, 1914, 1920, 1938, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1968, 1970, 1971, 1972, 1973, 1974, 1976, 1977, 1979, 1980, 1981, 1984, 1985, 1986, 1987, 1991, 1992, 1993, 1994, 1995, 2000, 2001, 2003, 2007, 2009, 2011, 2012, 2015];
			
        let i = 0;
        for (; i < years.length - 1; ++i) {
            if (years[i+1] > year) {
                break;
            }
        }

        year = years[i];
		let filename = "data/cntry" + year + ".json"

        d3.json(filename, function (geoData) {

            d3.select("#map")
				.html("")
				.append("g")
                .selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .classed("countries", true);
				
            d3.select("#map")
				.append("g")
                .selectAll("text")
                .data(geoData.features)
                .enter()
                .append("text")
                .text(function (d) {
                    let str = "name" in d.properties ? d.properties.name : d.properties.NAME;
                    if (str == "unclaimed") str = "";
                    if (path.area(d) <600) str = "";
                    return str;
                }.bind(this))
				.attr("x", d => path.centroid(d)[0])
				.attr("y", d => path.centroid(d)[1])
                .classed("countryLabel", true);

            let graticule = d3.geoGraticule();
            d3.select("#map")
                .append('path')
                .datum(graticule)
                .attr('class', "grat")
                .attr('d', path)
                .attr('fill', 'none')
                .on("click", function(d){
                    console.log(d);
                });

        });


    }
}
