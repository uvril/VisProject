class Map {

    constructor(infoPanel) {
        this.projection = d3.geoPatterson();
        this.path = d3.geoPath()
            .projection(this.projection);		
        this.infoPanel = infoPanel;
        this.svg = d3.select("#map");
        this.svgDefs = this.svg.append("defs");
        this.svgPath = this.svg.append("g");
        this.svgGra = this.svg.append("g");
        this.svgText = this.svg.append("g");
    }

    calc_dist(c) {
        let d1 = Math.sqrt(Math.pow(c[0][0]-c[2][0], 2)+Math.pow(c[0][1]-c[2][1], 2));
        let d2 = Math.sqrt(Math.pow(c[1][0]-c[2][0], 2)+Math.pow(c[1][1]-c[2][1], 2));
        return d1 + d2;
    }

    getPath(d) {
        var geom=d.geometry; 
        var props=d.properties;
        var p1 = this.projection([+props.x1, +props.y1]);
        var p2 = this.projection([+props.x2, +props.y2]);
        var c = this.projection([+props.c1, +props.c2]);
        return [p1, p2, c];
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

                let lCntry = geoData.features.filter(function (d) {
                    if (this.path.area(d) < 400) return false;
                    let box = this.getPath(d);
                    let l = 0.9*this.calc_dist(box);
                    if ("NAME" in d.properties){
                        let str = d.properties.NAME;
                        let w = str.length;
                        return l/w > 4;
                    }
                    return false;
                }.bind(this));


                this.svgDefs
                    .html("")
                    .selectAll("path")
                    .data(lCntry)
                    .enter()
                    .append("path")
                    .attr("id", d => d.properties.wikidata)
                    .attr("d", function (d) {
                        let p = this.getPath(d);
                        let line = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveCatmullRom.alpha(0.5));
                        return line([p[0], p[2], p[1]]);
                    }.bind(this));


                this.svgPath
                    .html("")
                    .selectAll("path")
                    .data(geoData.features)
                    .enter()
                    .append("path")
                    .attr("d", this.path)
                    .classed("countries", true)
                    .on("click", function(d){
                        this.svgPath.selectAll("path").classed("selected", d1 => d1.properties.wikidata === d.properties.wikidata);
                        this.infoPanel.updateInfo(d.properties, year);
                    }.bind(this));

                let graticule = d3.geoGraticule();

                this.svgGra
                    .html("")
                    .append('path')
                    .attr("id", "grat")
                    .datum(graticule)
                    .attr('class', "grat")
                    .attr('d', this.path)
                    .attr('fill', 'none'); 

                this.svgText
                    .html("")
                    .selectAll("text")
                    .data(lCntry)
                    .enter()
                    .append("text")
                    .attr("transform", "translate(0,0)")
                    //.style("text-anchor", "middle")				
                    .append("textPath")
                    .attr("xlink:href", d => "#"+d.properties.wikidata)				
                    .attr("textLength", function (d) {
                        let box = this.getPath(d);
                        return 0.9*this.calc_dist(box);
                    }.bind(this))
                .text(function (d) {
                    let str = d.properties.NAME;
                    if (str == "unclaimed") str = "";
                    return str.toUpperCase();
                }.bind(this))
                .attr("startOffset", "5%")
                    .style("fill", "#777")
                    .style("fill-opacity", ".8")
                    .style("font-size", function (d) {
                        let node = d3.select(this);
                        let l = node.attr("textLength");
                        let w = node.text().length;

                        let r = l/w;
                        if (r < 5) return "6px";
                        if (r < 6) return "8px";
                        if (r < 9) return "10px";
                        if (r < 12) return "12px";
                        if (r < 15) return "14px";
                        if (r < 20) return "18px";
                        if (r < 30) return "20px";
                        if (r < 40) return "30px";
                        return "40px";
                    });

                //this.arrangeLabels();

            }.bind(this));
    }

    arrangeLabels() {
        var move = 1;
        console.log(d3.select("#map").selectAll("text"));
        while(move > 0) {
            move = 0;
            d3.select("#map").selectAll("text")
                .each(function() {
                    var that = this,
                    a = this.getBoundingClientRect();
                    d3.select("#map").selectAll("text")
                        .each(function() {
                            if(this != that) {
                                var b = this.getBoundingClientRect();
                                if((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
                                        (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
                                    // overlap, move labels
                                    var dx = (Math.max(0, a.right - b.left) +
                                            Math.min(0, a.left - b.right)) * 0.001,
                                    dy = (Math.max(0, a.bottom - b.top) +
                                            Math.min(0, a.top - b.bottom)) * 0.002,
                                    tt = d3.select(this).attr("transform"),
                                    to = d3.select(that).attr("transform");
                                    move += Math.abs(dx) + Math.abs(dy);

                                    let ton = " translate(" + dx + "," + dy + ")";
                                    let ttn = " translate(" + -dx + "," + -dy + ")";
                                    d3.select(this).attr("transform", tt + ttn);
                                    d3.select(that).attr("transform", to + ton);
                                    a = this.getBoundingClientRect();
                                }
                            }
                        });
                });
        }
    }
}

