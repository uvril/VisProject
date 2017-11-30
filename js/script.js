function fYear(year) {
    let years = window.dataset.years;
    for (let i = 0; i < years.length - 1; ++i) {
        if (years[i] <= year && years[i+1] > year) {
            return years[i];
        }
    }
    return years[years.length - 1];
}
function getYearText(year) {
    if (year > 0) {
        return year.toString();
    }
    else {
        return (-year).toString + " BC";
    }
}
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
function push_data(dataName, d) {

	window.dataset[dataName] = d;
}
	
window.wdmap = {}
window.dataset = {}
window.dataset.years = [-2000, -1000, -500, -323, -200, -1, 400, 600, 800, 1000, 1279, 1492, 1530, 1650, 1715, 1783, 1815, 1880, 1914, 1920, 1938, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1968, 1970, 1971, 1972, 1973, 1974, 1976, 1977, 1979, 1980, 1981, 1984, 1985, 1986, 1987, 1991, 1992, 1993, 1994, 1995, 2000, 2001, 2003, 2007, 2009, 2011, 2012, 2015];
d3.json("data/pop.json", function(err, popdata) { 
	push_data("pop", popdata);
    d3.json("data/gdp.json", function(err, gdpdata){
		push_data("gdp", gdpdata);
        d3.json("data/cpi.json", function(err, cpidata){
			push_data("cpi", cpidata);
            d3.json("data/events.json", function(err, evtdata){
			    push_data("events", evtdata);
                let aggPanel = new AggPanel();
                let infoPanel = new InfoPanel(aggPanel);
                let map = new Map(infoPanel);
                let yearChart = new YearChart(map); 
            })
        })
    })
});
