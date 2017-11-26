class AggPanel {
	constructor	() {
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
        this.aggtip = this.aggRow.append("div")
        				.attr("class", "agg-tooltip")
        				.style("opacity", 0);
        this.xScale = d3.scaleLinear()
            .domain([this.startYear, this.endYear])
            .range([this.panelMargin, this.panelWidth-this.panelMargin]);
        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([this.panelHeight-this.panelMargin, this.panelMargin]); 				
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
        this.legend = aggSvg
        	.append("g")
        	.attr("id", "legend")
            .attr("transform", "translate(" + (this.panelWidth*1.02-this.panelMargin) + ", 0)");
        this.remove = aggSvg
        	.append("g")
        	.attr("id", "remove")
            .attr("transform", "translate(" + (this.panelWidth*1.1-this.panelMargin) + ", 0)");
        $("#yearRange").slider({ id: "yearSlider", min: 1960, max: 2016, range: true, value: [1960, 2016] });
        $("#yearRange").on("slide", function(event) {
            this.updateRange(event.value[0], event.value[1]);
        }.bind(this));
        this.trans = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);
        //this.updateRange(1960, 2016);
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisRight();
        this.xAxis.scale(this.xScale)
            .ticks(5)
            .tickFormat(d3.format("d"));
        this.yAxis.scale(this.yScale)
			.tickSize(this.svgWidth)
            .ticks(5)
            .tickFormat(d3.format(".2s"));
        this.colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];	
		this.selectedColor = [];
		for (let i in this.colors) this.selectedColor.push(false);
	}

    updateRange(startYear, endYear) {
        this.startYear = startYear;
        this.endYear = endYear;
        this.xScale.domain([startYear, endYear]).nice();
        this.aggRow.select("#yearRangeStartText").text(this.startYear);
        this.aggRow.select("#yearRangeEndText").text(this.endYear);
        this.dataset = [];
        this.aggList.rows().every( function (outerThis) {
            return function (rowIdx, tableLoop, rowLoop ) {
                let countryName = this.data()[0];
                let wd = window.wdmap[countryName];
                let datStart = queryData(window.dataset.pop, wd, outerThis.startYear, outerThis.startYear);
                datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
                let datEnd = queryData(window.dataset.pop, wd, outerThis.endYear, outerThis.endYear);
                datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
                let data = [countryName, datStart, datEnd];
                this.data(data);
			    outerThis.dataset.push(queryData(window.dataset.pop, wd, outerThis.startYear, outerThis.endYear));
            }
        }(this));
        let h1 = $(this.aggList.column(1).header());
        h1.html(startYear)
        let h2 = $(this.aggList.column(2).header());
        h2.html(endYear)
        this.aggList.draw();
		this.update();
    }

	insertCountry(countryName, wd) {
		if (this.selectedCountry.hasOwnProperty(wd)) return;
		let index = 0;
		for (; index < this.selectedColor.length; ++index)
			if (this.selectedColor[index] == false) 
				break;
		this.selectedCountry[wd] = {"index": index, "countryName": countryName};
		this.selectedColor[index] = true;
        window.wdmap[countryName] = wd;
		let datStart = queryData(window.dataset.pop, wd, this.startYear, this.startYear);
        datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
		let datEnd = queryData(window.dataset.pop, wd, this.endYear, this.endYear);
        datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
        this.aggList.row.add([countryName, datStart, datEnd]).draw();
        this.updateDataset();
		this.update();
	}

	updateDataset () {
		this.dataset = []
		let popMin = 99999999999, popMax = -1, extent = 0;
       	for (let index in this.selectedCountry) {
			let data = queryData(window.dataset.pop, index, this.startYear, this.endYear);
			data.forEach(d=>d.disabled = false);
			//console.log(data);
			this.dataset.push([this.selectedCountry[index].index, data]);
			extent = d3.extent(data, d => +d.stats);
			popMin = extent[0] < popMin? extent[0] : popMin;
			popMax = extent[1] > popMax? extent[1] : popMax;
       	}
       	this.yScale.domain([popMin, popMax]).nice();
       	this.xScale.domain([this.startYear, this.endYear]).nice();
       	if (this.dataset.length == 0) {
			this.xScale.domain([]).nice();
			this.yScale.domain([]).nice();
       	}
	}

	update() {
        let lineGenerator = d3.line()
            .x(d=>this.xScale(+d.year))
            .y(d=>this.yScale(+d.stats));
//add lines and legends
		let cnt = 0;
		let setStroke = function(id, lineSize, lineOpacity, legendFontSize) {
			if (d3.select("#"+id.toString()).style("opacity") == "0") return;
			d3.select("#"+id.toString())
				.style("stroke-width", lineSize)
				.style("opacity", lineOpacity);
    		d3.select("#l" + id.toString())
    			.select("text")
    			.style("font-size", legendFontSize);
		};
		let lineThick = 2, lineThin = 1, legendFontBig = 10, legendFontSmall = 8;
		console.log(this.dataset);
		let pathSel = this.pathG.selectAll("path").data(this.dataset);
		pathSel.exit().remove();
		pathSel = pathSel.enter().append("path").merge(pathSel);
			pathSel.transition(this.trans)
            .attr("d", d => lineGenerator(d[1]))
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
							.attr("r", 4)
							.style("opacity", 0.5);
						setStroke(pathid, (lineThin+0.5)+"px", "1", legendFontBig+"px");
						tip.transition()
							.duration(200)
							.style("opacity", .9);
						tip.html("year:"+d.year+"<br>"+"stats:"+d.stats)
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY-28) + "px");
					}
	        	}(setStroke, this.trans, this.aggtip))
	        	.on("mouseout", function(setStroke, trans, tip){
					return function(d) {
						if (d.disabled == true) return;
						let pathid = this.parentNode.id.slice(1);
						d3.select(this)
							.attr("r", 2)
							.style("opacity", 1);
						setStroke(pathid, lineThin+"px", "0.5", legendFontSmall+"px");	
						tip.transition()
							.duration(500)
							.style("opacity", 0);
					}
	        	}(setStroke, this.trans, this.aggtip));			
		
		let names = [], wds = [];
		for (let i in this.selectedCountry) {
			names.push(this.selectedCountry[i].countryName);
			wds.push(i)
		}
		let removeT = this.remove.selectAll("text").data(wds);
		removeT.exit().remove();
		removeT = removeT.enter().append("text").merge(removeT);
		removeT.attr("x", 3)
			.attr("y", (d, i)=>legendFontBig*(i+1))
			.text("remove")
			.on("click", function(outerThis) {
				return function(d) {
					outerThis.selectedColor[outerThis.selectedCountry[d].index] = false;
					delete outerThis.selectedCountry[d];
					console.log(outerThis.selectedCountry);
					outerThis.updateDataset();
					outerThis.update();
					outerThis.updateAxis();
				}
			}(this))

		let legendGSel = this.legend.selectAll("g").data(wds)
		legendGSel.exit().remove();
		legendGSel = legendGSel.enter().append("g").merge(legendGSel);
		legendGSel.attr("id", (d, i) => "lpath" + i.toString())
					.attr("data-cnt", (d,i) => i);
		legendGSel.on("click", function(outerThis) {
						return function(j, i){
						let pathid = this.id.slice(1);
	        			if (this.childNodes[1].style.fill == "white") {
	        				this.childNodes[1].style.fill = outerThis.colors[outerThis.selectedCountry[j].index];
	        				let selectedpath = outerThis.pathG.select("#"+pathid)
	        									.style("opacity", function(d){
	        										d[1].disabled = !d[1].disabled;
	        										return 0.5;
	        									});
							let selectedcircle = outerThis.circleG.select("#c"+pathid)
												.selectAll("circle")
	        									.style("opacity", function(d){
	        										d.disabled = !d.disabled;
	        										return 1;
	        									});
	        			}
	        			else {
	        				this.childNodes[1].style.fill = "white"
	        				let selectedpath = outerThis.pathG.select("#"+pathid)
	        									.style("opacity", function(d){
	        										d[1].disabled = !d[1].disabled;
	        										return 0;
	        									});
							let selectedcircle = outerThis.circleG.select("#c"+pathid)
												.selectAll("circle")
	        									.style("opacity", function(d){
	        										d.disabled = !d.disabled;
	        										return 0;
	        									});
	        			}
        				let years = outerThis.circleG.selectAll("circle").filter(d=>!d.disabled).data()
        								.map(d=>d.year);
        				let stats = outerThis.circleG.selectAll("circle").filter(d=>!d.disabled).data()
        								.map(d=>d.stats);
        				let selectionCir = outerThis.circleG.selectAll("circle").filter(d=>!d.disabled);
        				let selectedPath = outerThis.pathG.selectAll("path").filter(d=>!d[1].disabled);
        				console.log(selectedPath);
        				outerThis.xScale.domain(d3.extent(years)).nice();
        				outerThis.yScale.domain(d3.extent(stats)).nice();
        				if (years.length != 0)
	        				outerThis.updatePanel(selectionCir, selectedPath);
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
					return function(d) {
                    	let cnt = this.parentNode.getAttribute("data-cnt");
                   		return outerThis.colors[outerThis.selectedCountry[d].index];
                	}
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
					return function(d) {
                    	let cnt = this.parentNode.getAttribute("data-cnt");
                   		return outerThis.colors[outerThis.selectedCountry[d].index];
                	}
				}(this))
				.style("fill", function(outerThis) {
					return function(d) {
                    	let cnt = this.parentNode.getAttribute("data-cnt");
                   		return outerThis.colors[outerThis.selectedCountry[d].index];
                	}
				}(this))
		this.updateAxis();
	}

	updatePanel(cirSel, pathSel) {
        let lineGenerator = d3.line()
            .x(d=>this.xScale(+d.year))
            .y(d=>this.yScale(+d.stats));
	    cirSel.transition(this.trans).attr("cx", d=>this.xScale(+d.year))
	        	.attr("cy", d=>this.yScale(+d.stats));
		pathSel.transition(this.trans)
            .attr("d", d => lineGenerator(d[1]))
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
