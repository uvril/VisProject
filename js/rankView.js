class RankView {
	constructor() {
		this.svgWidth = 400;
		this.svgHeight = 400;
		this.rankView = d3.select("#rankView")
							.attr("width", this.svgWidth)
							.attr("height", this.svgHeight);
		this.category = "gdp";
	}

	update() {
		let wd = "148";
		let data = window.dataset[this.category]["2014"];
		let metaInfo = [];
		let barWidth = 15, barHeight = 200;
		
		for (let i in data) {
			metaInfo.push({
				wd: i,
				stats: data[i]
			})
		}
		metaInfo.sort(function(a, b) { return d3.descending(a.stats, b.stats); });
		let wdRank = -1;
		metaInfo.forEach(function(d, i){
			if (d.wd === wd) wdRank = i+1;
			d.rank = i+1;
		});
		let maxData = d3.max(metaInfo, d=>d.stats);
		console.log(metaInfo);
		let groups = this.rankView.selectAll("g")
									.data([metaInfo])
									.enter().append("g")
									.attr("transform", "translate(0,0)");
		groups.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", barWidth*metaInfo.length)
				.attr("width", barHeight)
				.style("fill", "AliceBlue");

		let areaGenerator = d3.area()
								.x((d)=>d.stats/maxData*barHeight)
								.y1((d, i)=>i*barWidth);

		groups.append("path")
				.style("fill", "CornflowerBlue")
				.attr("d", areaGenerator)
				.on("mousemove", function(){
					console.log(d3.event, d3.event.mouseY/barWidth, metaInfo[Math.floor(d3.event.mouseY/barWidth)]);
				});


	}
}
