class RankView {
	constructor() {
		this.svgWidth = 400;
		this.svgHeight = 400;
		this.rankView = d3.select("#rankView")
							.attr("width", this.svgWidth)
							.attr("height", this.svgHeight);
		this.category = "gdp";
        this.rankTip = d3.select("body").append("div")
        				.attr("class", "agg-tooltip")
        				.style("opacity", 0);

	}

	update(clikedCountry, wdMap) {
		let wd = clikedCountry.properties.wikidata, countryName = clikedCountry.properties.NAME;
		let data = window.dataset[this.category]["2014"];
		let metaInfo = [];
		let barWidth = 8, barHeight = 120;
		
		for (let i in data) {
			metaInfo.push({
				wd: i,
				stats: data[i]
			})
		}
		metaInfo.sort(function(a, b) { return d3.descending(a.stats, b.stats); });
		metaInfo = metaInfo.splice(0, 41);
		let thisRank = -1;
		for (let i in metaInfo) {
			if (metaInfo[i].wd === wd) thisRank = +i+1;
			metaInfo[i].rank = +i+1;
		}
		let maxData = d3.max(metaInfo, d=>d.stats);
		//console.log(metaInfo);
		let groups = this.rankView.selectAll("g")
									.data([metaInfo])
									.enter().append("g")
									.attr("transform", "translate(0,0)");

		let tipShow = function(event) {
            this.rankTip.transition()
                .duration(200)
                .style("opacity", .9);
            this.rankTip.html(wdMap[metaInfo[Math.floor(event.layerY/barWidth)].wd])
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY-28) + "px");
		}.bind(this);

		let tipUnshow = function() {
            this.rankTip.transition()
                .duration(500)
                .style("opacity", 0);
		}.bind(this);

		groups.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", barWidth*metaInfo.length)
				.attr("width", barHeight)
				.style("fill", "AliceBlue")
				.on("mousemove", function(){
					tipShow(d3.event);
				})
				.on("mouseout", function(){
					tipShow(d3.event);
				});

		let areaGenerator = d3.area()
								.x0(0)
								.x1(function(d){
									//console.log(d.stats/maxData*barHeight);
									return d.stats/maxData*barHeight;
								})
								.y(function(d, i){
									//console.log(i*barWidth, i);
									return i*barWidth;
								});

		groups.append("path")
				.style("fill", "CornflowerBlue")
				.attr("d", areaGenerator)
				.on("mousemove", function(){
					tipShow(d3.event);
				})
				.on("mouseout", function(){
					tipUnshow(d3.event);
				});

		groups.append("circle")
				.attr("cx", metaInfo[thisRank-1].stats/maxData*barHeight)
				.attr("cy", (thisRank-1)*barWidth)
				.attr("r", 5)
				.style("fill", "yellow")
				.style("fill-opacity", 0.5)
				.style("stroke", "black")
				.on("mousemove", function(){
					tipShow(d3.event);
				})
				.on("mouseout", function(){
					tipShow(d3.event);
				});

		groups.append("line")
				.attr("x1", 0)
				.attr("x2", metaInfo[thisRank-1].stats/maxData*barHeight-5)
				.attr("y1", (thisRank-1)*barWidth)
				.attr("y2", (thisRank-1)*barWidth)
				.style("stroke", "black")
				.style("stroke-width", "2px")
				.on("mousemove", function(){
					tipShow(d3.event);
				})
				.on("mouseout", function(){
					tipShow(d3.event);
				});
	}
}
