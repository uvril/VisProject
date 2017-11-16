
class YearChart {

    constructor (mapChart) {

        this.mapChart = mapChart;

        let svg = d3.select("#yearChart")
            .append("svg")
            .attr("height", d3.select("#yearChartRow").node().getBoundingClientRect().height)
            .attr("width", d3.select("#yearChartRow").node().getBoundingClientRect().width);


        let years = [-2000, -1000, -500, -323, -200, -1, 400, 600, 800, 1000, 1279, 1492, 1530, 1650, 1715, 1783, 1815, 1880, 1914, 1920, 1938, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1968, 1970, 1971, 1972, 1973, 1974, 1976, 1977, 1979, 1980, 1981, 1984, 1985, 1986, 1987, 1991, 1992, 1993, 1994, 1995, 2000, 2001, 2003, 2007, 2009, 2011, 2012, 2015];

        var 
        margin = {top: 20, right: 20, bottom: 100, left: 40},
            width = +svg.attr("width") - margin.left - margin.right,
            height = 20,
            height2 = 60,
            hh = 10;


        let x = d3.scaleLinear()
            .domain(d3.extent(years))
            .range([0, width]);
        let x2 = d3.scaleLinear()
            .domain(x.domain())
            .range(x.range());

        var xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
            xAxis2 = d3.axisBottom(x2).tickFormat(d3.format("d"));

        var brush = d3.brushX()
            .extent([[0, height2 - hh], [width, height2 + hh]])
            .on("brush end", brushed);

        var zoom = d3.zoom()
            .scaleExtent([1, 400])
            .translateExtent([[0, 0], [width, height-hh]])
            .extent([[0, 0], [width, height-hh]])
            .on("zoom", zoomed);

        svg.append("rect")
            .attr("transform", "translate("+margin.left+", 0)")
            .attr("class", "yearZoom")
            .attr("y", height - hh)
            .attr("width", width)
            .attr("height", hh * 2)
            .call(zoom)
        ;

        var focus = svg.append("g")
            .attr("transform", "translate("+margin.left+", 0)")
            .attr("class", "yearFocus");

        var context = svg.append("g")
            .attr("transform", "translate("+margin.left+", 0)")
            .attr("class", "yearContext");

        context.selectAll("circle")
            .data(years)
            .enter()
            .append("circle")
            .attr("class", "yearContextCircle")
            .attr("cx", x2)
            .attr("cy", height2);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.selectAll("circle")
            .data(years)
            .enter()
            .append("circle")
            .attr("class", "yearCircle")
            .attr("cx", x)
            .attr("cy", height)
            .on("click", function (d, i, n) {
                svg.select(".yearFocus").selectAll("circle").attr("class", "yearCircle");
                d3.select(n[i]).attr("class", "yearCircleSelected");
                this.mapChart.drawMap(d);
            }.bind(this));

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [x(1945), x.range()[1]]);

        focus.selectAll("circle").filter(d => d === 2015).attr("class", "yearCircleSelected");
        this.mapChart.drawMap(2015);

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));
            focus.selectAll("circle").attr("cx", x);
            focus.select(".axis--x").call(xAxis);
            svg.select(".yearZoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focus.selectAll("circle").attr("cx", x);
            focus.select(".axis--x").call(xAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }
    };


};
