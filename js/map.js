class Map {

    constructor(infoPanel) {
        this.curData = null;
        this.svgBounds = d3.select("#middleWare").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgWidth/875*500;
        this.projection = d3.geoPatterson().scale(this.svgWidth/875*130).translate([this.svgBounds.width/2, this.svgWidth/875*250]);
        this.path = d3.geoPath()
            .projection(this.projection);		
        this.infoPanel = infoPanel;
        let mapSvg = d3.select("#map")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.svgDefs = mapSvg.append("defs");
        this.svgPath = mapSvg.append("g");
        this.svgGra = mapSvg.append("g");
        this.svgText = mapSvg.append("g");
        let mapZoom = d3.zoom()
            .scaleExtent([1, 16])
            .on("zoom", this.zoomed.bind(this));
        mapSvg.call(mapZoom);
        this.currentMouse = null;
        this.curScale = 1;
        this.svgCurYear = mapSvg.append("text").attr("x", 50).attr("y", 600).style("font-size", "100px").style("opacity", "0.5").style("fill", "black");
    }

    zoomed() {
        d3.select("#map").selectAll("g").style("stroke-width", 1.5 / d3.event.transform.k + "px");
        d3.select("#map").selectAll("g").attr("transform", d3.event.transform); 
        this.curScale = d3.event.transform.k;
        this.updateText();
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
    
    updateText() {
        if (this.curData == null) return;
        let lCntry = this.curData.features.filter(function (d) {
            if (this.path.area(d) < 400 / this.curScale) return false;
            let box = this.getPath(d);
            let l = 0.9*this.calc_dist(box);
            if ("NAME" in d.properties){
                let str = d.properties.NAME;
                let w = str.length;
                return l/w > 4 / this.curScale;
            }
            return false;
        }.bind(this));
        this.drawText(lCntry);
    }

    drawText(lCntry) {
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
        .style("fill", "black")
        .style("fill-opacity", ".4")
            .style("font-size", function (d, i, n) {
                let node = d3.select(n[i]);
                let l = node.attr("textLength");
                let w = node.text().length;
                let r = l/w;
                if (r < 2) return "1px";
                if (r < 3) return "2px";
                if (r < 4) return "4px";
                if (r < 5) return "6px";
                if (r < 6) return "8px";
                if (r < 9) return "10px";
                if (r < 12) return "12px";
                if (r < 15) return "14px";
                if (r < 20) return "18px";
                if (r < 30) return "20px";
                if (r < 40) return "30px";
                return "40px";
            }.bind(this))
        ;
    }

    drawMap(year) {

        if (year > 0) {
            this.svgCurYear.text(year);
        }
        else {
            this.svgCurYear.text(-year + " BC");
        }

        let filename = "data/map/cntry" + year + ".json"

            d3.json(filename, function (geoData) {

                this.curData = geoData;

                this.svgPath
                    .html("")
                    .selectAll("path")
                    .data(geoData.features)
                    .enter()
                    .append("path")
                    .attr("d", this.path)
                    .classed("countries", true)
                    .on("mouseover", function(d, i, n) {
                        let map = window.map;
                        if (map.currentMouse != null) {
                            d3.select(map.currentMouse).classed("cntryMouseOver", false);
                        }
                        if (d.properties.NAME != "unclaimed") {
                            map.currentMouse = this;
                            d3.select(this).classed("cntryMouseOver", true);
                        }
                        else {
                            map.currentMouse = null;
                        }

                    })
                    .on("mouseout", function(d) {
                        let map = window.map;
                        if (map.currentMouse != null) {
                            d3.select(map.currentMouse).classed("cntryMouseOver", false);
                            map.currentMouse = null;
                        }
                    })
                    .on("click", function(d){
                        if (d.properties.NAME != "unclaimed") {
                            this.svgPath.selectAll("path").classed("selected", d1 => d1.properties.wikidata === d.properties.wikidata);
                            this.svgText.selectAll("textPath").style("fill-opacity", d1 => d1.properties.wikidata === d.properties.wikidata ? 1 : 0.4);
                            this.infoPanel.updateInfo(d.properties, year);
                        }
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

                this.updateText();

           

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

