class Map {

    constructor(infoPanel) {
        this.curData = null;
        this.mapContainer = d3.select("#mapContainer");
        this.svgBounds = this.mapContainer.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - 40;
        this.svgHeight = this.svgWidth/875*500;
        this.projection = d3.geoPatterson().scale(this.svgWidth/875*130).translate([this.svgBounds.width/2, this.svgWidth/875*250]);
        this.path = d3.geoPath()
            .projection(this.projection);		
        this.infoPanel = infoPanel;
        let mapSvg = d3.select("#map")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        let legendHeight = 150;
        this.mapLegend =  d3.select("#map-legend")
                            .attr("width", this.svgWidth)
                            .attr("height", legendHeight)
                            .append("g")
                            .attr("class", "legendQuantile")
                            .attr("transform", "translate(0,0)");
        this.svgDefs = mapSvg.append("defs");
        this.svgPath = mapSvg.append("g");
        this.svgGra = mapSvg.append("g");
        this.svgText = mapSvg.append("g");
        let mapZoom = d3.zoom()
            .scaleExtent([1, 16])
            .on("zoom", function () {
                this.curScale = d3.event.transform;
                this.zoomed();
            }.bind(this));
        mapSvg.call(mapZoom);
        this.currentMouse = null;
        this.curScale = d3.zoomIdentity;
        
        this.mapContainer.select("#zoom-in")
            .on("click", function() {
                mapSvg.call(mapZoom.scaleBy, 1.2);
            }.bind(this));
        this.mapContainer.select("#zoom-out")
            .on("click", function() {
                mapSvg.call(mapZoom.scaleBy, 1/1.2);
            }.bind(this));
        this.mapContainer.select("#reset")
            .on("click", function() {
                this.curScale.k = 1;
                this.curScale.x = 0;
                this.curScale.y = -20;
                this.zoomed();
            }.bind(this));
        this.category = null;
        this.layers = d3.select("#map-bnt");
        //d.properties.wikidata
        this.layers.selectAll("#map-pop")
            .on("click", function() {
                this.category = "pop";
                this.mapLegend.html("");
                this.addLayer();
            }.bind(this));
        this.layers.selectAll("#map-gdp")
            .on("click", function() {
                this.category = "gdp";
                this.mapLegend.html("");
                this.addLayer();
            }.bind(this));
        this.layers.selectAll("#map-ori")
            .on("click", function() {
                this.category = null;
                this.mapLegend.html("");
                this.drawMap(this.year);
            }.bind(this));
        this.domain = {};
        this.domain.pop = [0, 1e6, 1e7, 1e8, 1e9];
        this.domain.gdp = [0, 1e10, 1e11, 1e12, 1e13];
        this.colorScale = null;
        this.data = null;
        this.year = null;
        this.clickedCountry = null;
        this.clickedColor = "95c5de";
    }

    addLayer() {
        this.data = window.dataset[this.category][this.year];
        let domain = this.domain[this.category];
        console.log(domain+"!!!");
        //let range = this.generateColor("#E0F2D4", "#192F0A", domain.length);
        let range = ["#F2F2F2", "#E0F2D4", "#A3D77F", "#66BC29", "#537E35"]
        this.colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
        let colNum = 5, linePadding = 15, rectHeight = 20, colPadding =5;
        let legendG = this.mapLegend.selectAll("g")
                        .data(domain)
                        .enter().append("g")
        legendG.append("rect")
                .attr("x", (d, i)=>i%colNum*(this.svgWidth/colNum))
                .attr("y", (d, i)=>Math.floor(i/colNum)*(linePadding+rectHeight))
                .attr("width", this.svgWidth/colNum-colPadding)
                .attr("height", rectHeight)
                .style("fill", d=>this.colorScale(d));
        legendG.append("text")
        		.attr("x", (d, i)=>i%colNum*(this.svgWidth/colNum)+this.svgWidth/colNum/2)
        		.attr("y", (d, i)=>Math.floor(i/colNum)*(linePadding+rectHeight)+rectHeight+13)
        		.text(function(d, i){
        			if (i == 0) return "Less than "+d3.format(".2s")(domain[1]);
        			else if (i == domain.length-1) return "More than "+d3.format(".2s")(domain[domain.length-1]);
        			return d3.format(".2s")(d)+" to "+d3.format(".2s")(domain[i+1]);
        		})
        		.style("text-anchor", "middle");
        this.svgPath.selectAll("path")
            .style("fill", function(outThis) {
                    return function(d){
                        //console.log(d.properties.NAME, data[d.properties.wikidata], colorScale((+data[d.properties.wikidata])));
                        if (d.properties.wikidata === outThis.clickedCountry)
                            return outThis.clickedColor;
                        return outThis.colorScale((+outThis.data[d.properties.wikidata]));
                    }
            }(this));
    }

    generateColor(startColor, endColor, numIntervals){
        function colorToHex(color) {
            let rgbToHex = function (rgb) { 
              var hex = Number(rgb).toString(16);
              if (hex.length < 2) {
                   hex = "0" + hex;
              }
              return hex;
            };
            if (color.substr(0, 1) === '#') {
                return color;
            }
            let digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
            let red = rgbToHex(parseInt(digits[2]));
            let green = rgbToHex(parseInt(digits[3]));
            let blue = rgbToHex(parseInt(digits[4]));
            return digits[1] + '#' + red+green+blue;
        };
        let list = [];
        let tmp = d3.scaleLinear()
                    .domain([0, numIntervals-1])
                    .range([startColor, endColor]);
        for (let i = 0; i < numIntervals; ++i) {
            list.push(colorToHex(tmp(i)));
        }
        return list;
    }

    zoomed() {
        d3.select("#map").selectAll("g").style("stroke-width", 1.5 / this.curScale.k + "px");
        d3.select("#map").selectAll("g").attr("transform", this.curScale);
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
            if (this.path.area(d) < 400 / this.curScale.k) return false;
            let box = this.getPath(d);
            let l = 0.9*this.calc_dist(box);
            if ("NAME" in d.properties){
                let str = d.properties.NAME;
                let w = str.length;
                return l/w > 4 / this.curScale.k;
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
        .style("fill-opacity", ".9")
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
        this.year = year;
        if (this.category != null)
            this.data = window.dataset[this.category][year];
        let filename = "data/map/cntry" + year + ".json";

        d3.json(filename, function (geoData) {

			for (let i = 0; i < geoData.features.length; ++i) {
				if (geoData.features[i].properties.wikidata === "212429") {
					geoData.features[i].properties.wikidata = "142";
				}
			}
		
            this.curData = geoData;

            this.svgPath
                .html("")
                .selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("d", this.path)
                .classed("countries", true)
                .style("fill", function(outThis) {
                    return function(d) {
                        if (d.properties.wikidata === outThis.clickedCountry) return outThis.clickedColor;
                        else {
                            if (outThis.category != null) return outThis.colorScale(+outThis.data[d.properties.wikidata]);
                            else return null;
                        }
                    }
                }(this))
                .on("mouseover", function(d, i, n) {
                    let map = window.map;
                    /*if (map.currentMouse != null) {
                        d3.select(map.currentMouse).style("fill", d=>this.category != null? this.colorScale(+this.data[d.properties.wikidata]): null);
                    }*/
                    if (d.properties.NAME != "unclaimed") {
                        map.currentMouse = this;
                        d3.select(this).style("fill", "d5e8f2");
                    }
                    else {
                        map.currentMouse = null;
                    }

                })
                .on("mouseout", function(outThis) {
                        return function(d) {
                            let map = window.map;
                            if (map.currentMouse != null) {
                                if (d.properties.wikidata != outThis.clickedCountry) {
                                    d3.select(map.currentMouse)
                                    .style("fill", d=>outThis.category != null? outThis.colorScale(+outThis.data[d.properties.wikidata]): null);
                                    map.currentMouse = null;
                                }
                                else {
                                    d3.select(map.currentMouse)
                                    .style("fill", outThis.clickedColor);
                                }
                            }
                       } 
                }(this))
                .on("click", function(outThis) {
                        return function(d){
                            if (d.properties.NAME != "unclaimed") {
                                outThis.svgPath.selectAll("path")
                                                .style("fill", function(d1){
                                                    if (d1.properties.wikidata === d.properties.wikidata) {
                                                        outThis.clickedCountry = d1.properties.wikidata;
                                                        return outThis.clickedColor;
                                                    }
                                                    else if (outThis.category != null) {
                                                        return outThis.colorScale(+outThis.data[d1.properties.wikidata]);
                                                    }
                                                    else return null;
                                                    
                                                });
                                outThis.svgText.selectAll("textPath").style("fill-opacity", d1 => d1.properties.wikidata === d.properties.wikidata ? 1 : 0.4);
                                outThis.infoPanel.updateInfo(d.properties, year);
                            }
                        }
                }(this));

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

            }.bind(this));
    }

}

