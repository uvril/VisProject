class RankView {
	constructor() {
		this.svgWidth = 400;
		this.svgHeight = 400;
		this.rankView = d3.select("#rankView")
							.attr("width", this.svgWidth)
							.attr("height", this.svgHeight);
		this.category = "pop";
	}

	update() {
		let wd = "148";
		let data = window.dataset[this.category]["2015"];
		let metaInfo = [];
		
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
		console.log(maxData);
		let groups = this.rankView.selectAll("g")
									.data([metaInfo])
									.enter().append("g")
									.attr("transform", "translate(0,10)");
		groups.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", 200)
				.attr("width", 100)
				.style("fill", "grey");

		let areaGenerator = d3.area()
								.x((d, i)=>i+10)
								.y((d, i)=>i+10)

		groups.append("path")
				.attr("d", areaGenerator)
				.style("fill", "black")
				.style("stroke", "grey");


	}
}