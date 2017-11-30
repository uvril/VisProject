class AggPanel {
	constructor	() {
        this.trans = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);
        let aggRow = d3.select("#aggPanelRow");
        this.aggRow = aggRow;
        this.aggList = $('#aggPanelList').DataTable({paging:false, searching:false, info:false});
		this.svgBounds = aggRow.select("#aggPanelDiv").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgWidth/875*500;
        let aggSvg = aggRow.select("#aggPanel")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.selectedCountry = {};
		this.dataset = [];
        this.startYear = 1960;
        this.endYear = 2016;						
        this.panelWidth = this.svgWidth*0.8;
        this.panelHeight = this.svgHeight;
        this.panelMargin = 35;
        this.panel = aggSvg
        	.append("g")
        	.attr("id", "panel")
            .attr("transform", "translate(" + this.panelWidth*0.01 + ", 0)");
        this.aggtip = d3.select("body").append("div")
        				.attr("class", "agg-tooltip")
        				.style("opacity", 0);
        this.eventtip = d3.select("body").append("div")
                        .attr("class", "event-tooltip")
                        .style("opacity", 0);
        this.showEvents = false;
        aggRow.select("#showEvents").on("click", function() {
            this.showEvents = !this.showEvents;
            this.eventG.transition(this.trans).style("opacity", d => this.showEvents ? 1 : 0.1)
            this.pathG.transition(this.trans).style("opacity", d => this.showEvents ? 0.1 : 1)
            this.circleG.transition(this.trans).style("opacity", d => this.showEvents ? 0.1 : 1)
            this.yAxisG.transition(this.trans).style("opacity", d => this.showEvents ? 0.1 : 1)
        }.bind(this));
        this.xScale = d3.scaleLinear()
            .domain([this.startYear, this.endYear])
            .range([this.panelMargin, this.panelWidth-this.panelMargin]);
        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([this.panelHeight-this.panelMargin, this.panelMargin]).nice(); 				
		this.xAxisG = this.panel.append("g")
		            .attr("transform", "translate(0, " + this.yScale.range()[0]+")")
					.style("fill", "none")
					.style("stroke", "black");
		this.yAxisG = this.panel.append("g")
		        	.attr("transform", "translate(" + this.xScale.range()[0] +", 0)")
					.style("fill", "none")
					.style("stroke", "black");
		this.pathG = this.panel.append("g");
		this.circleG = this.panel.append("g");			
        this.eventG = this.panel.append("g").style("opacity", "0.1");
        this.legend = aggSvg
        	.append("g")
        	.attr("id", "legend")
            .attr("transform", "translate(" + (this.panelWidth*1.02-this.panelMargin) + ", 0)");
        this.startYear = 1960;
        this.endYear = 2016;
        $("#yearRange").slider({ id: "yearSlider", min: 1960, max: 2016, range: true, value: [1960, 2016] });
        $("#yearRange").on("slide", function(event) {
            this.updateYearText(event.value[0], event.value[1]);
        }.bind(this));
        $("#yearRange").on("slideStop", function(event) {
            this.startYear = +event.value[0];
            this.endYear = +event.value[1];
            this.updateRange(event.value[0], event.value[1]);
        }.bind(this));
        //this.updateRange(1960, 2016);
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisRight();
        this.xAxis.scale(this.xScale)
            .tickFormat(d3.format("d"));
        this.yAxis.scale(this.yScale)
			.tickSize(this.svgWidth)
            .tickFormat(d3.format(".2s"));
        this.colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];	
		this.selectedColor = [];
		for (let i in this.colors) this.selectedColor.push(false);
        this.lineGenerator = d3.line()
            .x(d=>this.xScale(+d.year))
            .y(d=>this.yScale(+d.stats));
        this.category = "pop";
        aggRow.select("#agg-pop").on("click", function(){
			aggRow.selectAll(".nav-link").classed("active", false);
			aggRow.select("#agg-pop").classed("active", true);
        	this.category = "pop";
        	this.updateRange(this.startYear, this.endYear);
        }.bind(this));
        aggRow.select("#agg-gdp").on("click", function(){
			aggRow.selectAll(".nav-link").classed("active", false);
			aggRow.select("#agg-gdp").classed("active", true);			
        	this.category = "gdp";
        	this.updateRange(this.startYear, this.endYear);
        }.bind(this));
        aggRow.select("#agg-cpi").on("click", function(){
			aggRow.selectAll(".nav-link").classed("active", false);
			aggRow.select("#agg-cpi").classed("active", true);			
        	this.category = "cpi";
        	this.updateRange(this.startYear, this.endYear);
        }.bind(this));
        this.aggList.on("click", 'i', function(outerThis) {
				return function(d) {
                    let wd = parseInt($(this).attr("data-wd"));
					outerThis.selectedColor[outerThis.selectedCountry[wd].index] = false;
					delete outerThis.selectedCountry[wd];
					//console.log(outerThis.selectedCountry);
//if user removes one country, chart will change to the original one.
					outerThis.updateDataset();
                    outerThis.aggList
                    .row( $(this).parents('tr') )
                    .remove()
                    .draw();
					outerThis.update();
				}
			}(this));
	}

	updateYearText(startYear, endYear) {
        this.aggRow.select("#yearRangeStartText").text(startYear);
        this.aggRow.select("#yearRangeEndText").text(endYear);
	}

    updateRange(startYear, endYear) {
        this.startYear = startYear;
        this.endYear = endYear;
        this.xScale.domain([startYear, endYear]).nice();
        this.dataset = [];
        this.aggList.rows().every( function (outerThis) {
            return function (rowIdx, tableLoop, rowLoop ) {
                let countryName = this.data()[0];
                let wd = window.wdmap[countryName];
                let datStart = queryData(window.dataset[outerThis.category], wd, outerThis.startYear, outerThis.startYear);
                datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
                let datEnd = queryData(window.dataset[outerThis.category], wd, outerThis.endYear, outerThis.endYear);
                datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
				let ico = "<i class=\"fa fa-times\" data-wd=\""+wd+"\"aria-hidden=\"true\"></i>"
                let data = [countryName, datStart, datEnd, ico];
                this.data(data);
            }
        }(this));
        let h1 = $(this.aggList.column(1).header());
        h1.html(startYear)
        let h2 = $(this.aggList.column(2).header());
        h2.html(endYear)
        this.aggList.draw();
        this.updateDataset();
		this.update();
    }

	insertCountry(countryName, wd) {
		if (this.selectedCountry.hasOwnProperty(wd)) return;
//Using this.selcetedCountry, every selected coutry will have the index as its primary key while the index also choose
//color for it.
		let index = 0;
		for (; index < this.selectedColor.length; ++index)
			if (this.selectedColor[index] == false) 
				break;
		this.selectedCountry[wd] = {"index": index, "countryName": countryName};
		this.selectedColor[index] = true;
//aggList part
        window.wdmap[countryName] = wd;
		let datStart = queryData(window.dataset[this.category], wd, this.startYear, this.startYear);
        datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
		let datEnd = queryData(window.dataset[this.category], wd, this.endYear, this.endYear);
        datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
		let ico = "<i class=\"fa fa-times\" data-wd=\""+wd+"\"aria-hidden=\"true\"></i>"
        this.aggList.row.add([countryName, datStart, datEnd, ico]).draw();
        this.updateDataset();
		this.update();
	}

//update dataset, xscale and yscale
	updateDataset () {

		this.dataset = []
		let popMin = 99999999999, popMax = -1, extent = 0;
       	for (let index in this.selectedCountry) {
			let data = queryData(window.dataset[this.category], index, this.startYear, this.endYear);
			data.forEach(d=>d.disabled = false);
			//console.log(data);
			this.dataset.push([this.selectedCountry[index].index, data]);
			extent = d3.extent(data, d => +d.stats);
			popMin = extent[0] < popMin? extent[0] : popMin;
			popMax = extent[1] > popMax? extent[1] : popMax;
       	}
       	if (this.dataset.length == 0) {
			this.xScale.domain([]).nice();
			this.yScale.domain([]).nice();
       	}
       	else {
	       	this.yScale.domain([popMin, popMax]).nice();
	       	this.xScale.domain([this.startYear, this.endYear]).nice();
       	}
	}

	update() {
        let eventData = [];
        for (let i = this.startYear; i <= this.endYear; ++i) {
            let curEventData = window.dataset.events[i];
            curEventData = curEventData.filter(function (d) {
                return d.wd in this.selectedCountry;
            }.bind(this));
            eventData.push([i, curEventData]);
        }
        let eventGSel = this.eventG.selectAll("g")
        .data(eventData);
        eventGSel.exit().remove();
        eventGSel = eventGSel.enter().append("g").merge(eventGSel);
	    eventGSel.attr("data-year", d => d[0]);
		let eventSel = eventGSel.selectAll("circle").data(d => d[1]);
        eventSel.exit().remove();
        eventSel = eventSel.enter().append("circle").merge(eventSel);
        eventSel.transition(this.trans).attr("cx", function (d, i, n) {
                    	let year = +n[i].parentNode.getAttribute("data-year");
                    	return this.xScale(year);
                	}.bind(this))
        .attr("cy", (d, i) => 30 + i * 10)
        .attr("r", 3)
            .style("fill", function (d) {
                return this.colors[this.selectedCountry[d.wd].index];
            }.bind(this));
        eventSel 
	        	.on("mouseover", function(d, i, n) {
                    if (!this.showEvents) return;
                    d3.select(n[i])
                        .transition()
                        .duration(200)
                        .attr("r", 5)
                        .style("opacity", 0.5);
                    this.eventtip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    this.eventtip.html(d.event)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY-28) + "px");
	        	}.bind(this))
	        	.on("mouseout", function(d, i, n) {
                    if (!this.showEvents) return;
                    d3.select(n[i])
                        .transition()
                        .duration(500)
                        .attr("r", 3)
                        .style("opacity", 1);
                    this.eventtip.transition()
                        .duration(500)
                        .style("opacity", 0);
	        	}.bind(this));

        eventGSel.attr("transform", function(d, i, n) {
            let nc = n[i].childNodes.length;
            return "translate(0," + (200 - nc*5) + ")";
        });
//add hovoring over line and legend
		let lineThick = 2, lineThin = 1, legendFontBig = 10, legendFontSmall = 8;
		let setStroke = function(id, lineSize, lineOpacity, legendFontSize) {
			if (d3.select("#"+id.toString()).style("opacity") == "0") return;
			d3.select("#"+id.toString())
				.style("stroke-width", lineSize)
				.style("opacity", lineOpacity);
    		d3.select("#l" + id.toString())
    			.select("text")
    			.style("font-size", legendFontSize);
		};
//add paths		
		//console.log(this.dataset);
		let pathSel = this.pathG.selectAll("path").data(this.dataset);
		pathSel.exit().remove();
		pathSel = pathSel.enter().append("path").merge(pathSel);
			pathSel.transition(this.trans)
            .attr("d", d => this.lineGenerator(d[1]))
			.style("fill", "none")
			.style("stroke", (d, i) => this.colors[d[0]])
			.style("stroke-width", lineThin)
			.style("opacity", "0.5");
        pathSel
			.attr("id", (d, i) => "path"+i.toString())
			.on("mouseover", function(d){
				if (d.disabled == true) return;
				setStroke(d3.event.target.id, (lineThin+0.5)+"px", "1", legendFontBig+"px");
			}.bind(this))
			.on("mouseout", function(d){
				if (d.disabled == true) return;
				setStroke(d3.event.target.id, lineThin+"px", "0.5", legendFontSmall+"px");
			}.bind(this));
//add circles on paths	
		let cirGSel = this.circleG.selectAll("g").data(this.dataset);
		cirGSel.exit().remove();
		cirGSel = cirGSel.enter().append("g").merge(cirGSel);
	    cirGSel.attr("id", (d, i) => "cpath"+i.toString())
                .attr("data-cnt", (d, i) => d[0]);
		let cirSel = cirGSel.selectAll("circle").data(d => d[1]);
        cirSel.exit().remove();
		cirSel = cirSel.enter().append("circle").merge(cirSel);
	    cirSel.transition(this.trans).attr("cx", d=>this.xScale(+d.year))
	        	.attr("cy", d=>this.yScale(+d.stats))
	        	.attr("r", 2)
	        	.style("opacity", 1)
                .style("fill", function(outerThis) {
                	return function (d, i) {
                    	let cnt = this.parentNode.getAttribute("data-cnt");
                    	return outerThis.colors[cnt];
                	}
                }(this));
        cirSel
	        	.on("mouseover", function(setStroke, trans, tip){
					return function(d) {
						if (d.disabled == true) return;
						let pathid = this.parentNode.id.slice(1);
						d3.select(this)
							.transition()
							.duration(200)
							.attr("r", 4)
							.style("opacity", 0.5);
						setStroke(pathid, (lineThin+0.5)+"px", "1", legendFontBig+"px");
						tip.transition()
							.duration(200)
							.style("opacity", .9);
						tip.html("year:"+d.year+"<br>"+"stats:"+d3.format(",d")(d.stats))
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY-28) + "px");
					}
	        	}(setStroke, this.trans, this.aggtip))
	        	.on("mouseout", function(setStroke, trans, tip){
					return function(d) {
						if (d.disabled == true) return;
						let pathid = this.parentNode.id.slice(1);
						d3.select(this)
							.transition()
							.duration(500)
							.attr("r", 2)
							.style("opacity", 1);
						setStroke(pathid, lineThin+"px", "0.5", legendFontSmall+"px");	
						tip.transition()
							.duration(500)
							.style("opacity", 0);
					}
	        	}(setStroke, this.trans, this.aggtip));			

		let wds = [];
		for (let i in this.selectedCountry) wds.push(i);
//add lengend
		let legendGSel = this.legend.selectAll("g").data(wds)
		legendGSel.exit().remove();
		legendGSel = legendGSel.enter().append("g").merge(legendGSel);
		legendGSel.attr("id", (d, i) => "lpath" + i.toString())
					.attr("data-cnt", (d,i) => i);
		legendGSel.on("click", function(outerThis) {
						return function(j, i){
						let pathid = this.id.slice(1);
						let selectedpath = outerThis.pathG.select("#"+pathid);
						let selectedcircle = outerThis.circleG.select("#c"+pathid).selectAll("circle");
	        			if (this.childNodes[1].style.fill == "white") {
	        				this.childNodes[1].style.fill = outerThis.colors[outerThis.selectedCountry[j].index];
	        				selectedpath.style("opacity", function(d){
	        										d[1].disabled = !d[1].disabled;
	        										return 0.5;
	        									});
							selectedcircle.style("opacity", function(d){
	        										d.disabled = !d.disabled;
	        										return 1;
	        									});
	        			}
	        			else {
	        				this.childNodes[1].style.fill = "white"
	        				selectedpath.style("opacity", function(d){
	        										d[1].disabled = !d[1].disabled;
	        										return 0;
	        									});
							selectedcircle.style("opacity", function(d){
	        										d.disabled = !d.disabled;
	        										return 0;
	        									});
	        			}
//filter disabled paths and circles and show the others.(click on the legend circle not remove)
        				let years = outerThis.circleG.selectAll("circle").filter(d=>!d.disabled).data()
        								.map(d=>d.year);
        				let stats = outerThis.circleG.selectAll("circle").filter(d=>!d.disabled).data()
        								.map(d=>d.stats);
        				let otherCir = outerThis.circleG.selectAll("circle").filter(d=>!d.disabled);
        				let otherPath = outerThis.pathG.selectAll("path").filter(d=>!d[1].disabled);
        				//console.log(otherPath);
       	        		//outerThis.yScale.ticks();
	        			//outerThis.yAxis.ticks();
        				outerThis.xScale.domain(d3.extent(years)).nice();
        				outerThis.yScale.domain(d3.extent(stats)).nice();
        				if (years.length != 0)
	        				outerThis.updatePanel(otherCir, otherPath);
	        			//console.log(outerThis.yScale.domain());
	        			outerThis.updateAxis();
        			}
        		}(this));

		let lTextSel = legendGSel.selectAll("text").data(d => [d]);
		lTextSel.exit().remove();
		lTextSel = lTextSel.enter().append("text").merge(lTextSel);
		lTextSel.attr("x", 10)
				.attr("y", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return legendFontBig*(parseInt(cnt)+1);
				})
				.text(d=>this.selectedCountry[d].countryName)
				.style("stroke", function(outerThis) {
					return d=>outerThis.colors[outerThis.selectedCountry[d].index];
				}(this))
				.style("fill", "none")
        		.style("font-size", legendFontSmall);
	    lTextSel.on("mouseover", function(){
	        		let pathid = this.parentNode.id.slice(1);
	        		setStroke(pathid, (lineThin+0.5)+"px", "1", (legendFontSmall+2)+"px");
	        	})
	        	.on("mouseout", function(){
	        		let pathid = this.parentNode.id.slice(1);
	        		setStroke(pathid, lineThin+"px", "0.5", legendFontSmall+"px");
	        	});

	    let lCirSel = legendGSel.selectAll("circle").data(d => [d]);
	    lCirSel.exit().remove();
	    lCirSel = lCirSel.enter().append("circle").merge(lCirSel);
	    lCirSel.attr("cx", 3)
				.attr("cy", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return legendFontBig*(parseInt(cnt)+1);
				})
				.attr("r", 3)
				.style("stroke", function(outerThis) {
					return d=>outerThis.colors[outerThis.selectedCountry[d].index];
				}(this))
				.style("fill", function(outerThis) {
					return d=>outerThis.colors[outerThis.selectedCountry[d].index];
				}(this))
		this.updateAxis();
	}

	updatePanel(cirSel, pathSel) {
	    cirSel.transition(this.trans).attr("cx", d=>this.xScale(+d.year))
	        	.attr("cy", d=>this.yScale(+d.stats));
		pathSel.transition(this.trans)
            .attr("d", d => this.lineGenerator(d[1]))
	}

	updateAxis() {
        this.xAxisG
            .call(function (g) {
			  g.call(this.xAxis);
			  g.select(".domain").remove();
			}.bind(this));
        this.yAxisG
            .transition(this.trans)
            .call(function (g) {
			  var s = g.selection ? g.selection() : g;
			  g.call(this.yAxis);
			  s.select(".domain").remove();
			  s.selectAll(".tick line").filter(Number).attr("stroke", "#777").attr("stroke-dasharray", "2,2");
			  s.selectAll(".tick text").attr("x", 4).attr("dy", -4);
			  if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
			}.bind(this));
	}
}
