class Map {

    constructor() {
        this.projection = d3.geoPatterson();

    }

    drawMap() {
        let path = d3.geoPath()
            .projection(this.projection);

        d3.json("data/cntry1945.json", function (geoData) {

            d3.select("#map")
                .selectAll("path")
                .data(geoData.features)
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
