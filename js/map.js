class Map {

    constructor(infoPanel) {
        this.projection = d3.geoPatterson();
        this.path = d3.geoPath()
            .projection(this.projection);		
        this.infoPanel = infoPanel;
		this.svg = d3.select("#map");
    }
	
	getPath(d) {
		if (d.properties.wikidata === "159" || d.properties.wikidata === "15180") return [[550,95], [900, 75]];
		let box = this.path.bounds(d);
					
		let c = this.path.centroid(d);
		if (box[1][1] - box[1][0] <= box[0][1] - box[0][0]) {
			return [[box[0][0], c[1]], [box[1][0], c[1]]];
		}
		return box;
	}

    drawMap(year) {

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


		
            this.svg
				.html("");
				
			let lCntry = geoData.features.filter(d => this.path.area(d) >= 700);

			this.svg
				.append("defs")
				.selectAll("path")
				.data(lCntry)
				.enter()
				.append("path")
				.attr("id", d => d.properties.wikidata)
				.attr("d", function (d) {
					let p = this.getPath(d);
					return "M " + p.join(" L ");
				}.bind(this));
				
			this.svg
				.append("g")
                .selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("d", this.path)
                .classed("countries", true)
                .on("click", function(d){
                    this.infoPanel.updateInfo(d.properties, year);
                }.bind(this));
				
            let graticule = d3.geoGraticule();
            this.svg
                .append('path')
                .attr("id", "grat")
                .datum(graticule)
                .attr('class', "grat")
                .attr('d', this.path)
                .attr('fill', 'none'); 
		
            this.svg
				.append("g")
                .selectAll("text")
                .data(lCntry)
                .enter()
                .append("text")
				//.style("text-anchor", "middle")				
				.append("textPath")
				.attr("xlink:href", d => "#"+d.properties.wikidata)				
				.attr("textLength", function (d) {
					let box = this.getPath(d);
					return 0.9*Math.sqrt(Math.pow(box[0][0]-box[1][0], 2)+Math.pow(box[0][1]-box[1][1], 2));
				}.bind(this))
                .text(function (d) {
                    let str = "name" in d.properties ? d.properties.name : d.properties.NAME;
                    if (str == "unclaimed") str = "";
                    return str;
                }.bind(this))
				.attr("startOffset", "5%")
				.style("fill", "#777")
				.style("fill-opacity", ".8")
				.style("font-size", function (d) {
					let node = d3.select(this);
					let l = node.attr("textLength");
					let w = node.text().length;
					
					let r = l/w;
					console.log(r);
					console.log(node.text());
					console.log(d.properties.wikidata);
					if (r < 3) return "6px";
					if (r < 4) return "8px";
					if (r < 6) return "10px";
					if (r < 7) return "12px";
					if (r < 20) return "15px";
					if (r < 30) return "20px";
					if (r < 40) return "30px";
					return "50px";
				});


        }.bind(this));
    }
}


				
		
			/*

.countryLabel {
	
    fill: #777;
    fill-opacity: .8;
	
    font-size: 20px;
    font-width: 300;
	
    text-anchor: middle;
}
					
			
			this.svg.append("use")
			.attr("xlink:href", "#148")
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width", "1");
			*/
