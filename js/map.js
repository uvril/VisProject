class Map {

    constructor() {
        this.projection = d3.geoPatterson();

    }

    drawMap(year) {
        let path = d3.geoPath()
            .projection(this.projection);
			
		let filename = "data/cntry" + year + ".json"

        d3.json(filename, function (geoData) {

            d3.select("#map")
				.html("")
                .selectAll("path")
                .data(geoData["geo"].features)
                .enter()
                .append("path")
                .attr("d", path)
                .classed("countries", true);

            let graticule = d3.geoGraticule();
            d3.select("#map")
                .append('path')
                .datum(graticule)
                .attr('class', "grat")
                .attr('d', path)
                .attr('fill', 'none');

        });


    }
}
