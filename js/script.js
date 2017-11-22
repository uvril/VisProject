function queryData(d, wd, ys, ye) {
    let ret = []
    for (let y = ys; y <= ye; y++) {
        if (y in d) {
            let dy = d[y];
            if (wd in dy) {
                ret.push({"year" : +y, "stats" : +dy[wd]});
            }
        }
    }
    return ret;
}
window.dataset = {}
d3.json("data/pop.json", function(err, data) { 
	window.dataset.pop = data;
	let infoPanel = new InfoPanel();
	let map = new Map(infoPanel);
	let yearChart = new YearChart(map);
	let aggPanel = new AggPanel();
	aggPanel.updateAgg();
});
