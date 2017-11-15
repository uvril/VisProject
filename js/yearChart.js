
class YearChart {

    constructor (mapChart) {

        this.mapChart = mapChart;

        this.svg = d3.select("#yearChart")
            .append("svg")
            .attr("height", d3.select("#yearChartRow").node().getBoundingClientRect().height)
            .attr("width", d3.select("#yearChartRow").node().getBoundingClientRect().width);

        this.margin = {right:50, left:50, top:50, bottom:50};
        this.width = this.svg.attr("width") - this.margin.left - this.margin.right;
        this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;
        this.years = [];
        for (let i = -2001; i <= 2017; i++) this.years.push(i);

    };

    update() {
        this.mapChart.drawMap(2015);

        let xScale = d3.scaleLinear()
            .domain(d3.extent(this.years))
            .range([0, this.width])
            .clamp(true);

        window.yearChart.curScale = xScale;

        let yearText = d3.select("#currentYear")
            .attr("x", 20)
            .attr("y", 20)
            .text(xScale.domain()[1]);

        let zoom = d3.zoom()
            .scaleExtent([1, 100])
            .translateExtent([[0, 0], [this.width, this.height]])
            .extent([[0, 0], [this.width, this.height]])
            .on("zoom", zoomed);

        let xAxis = d3.axisBottom();
        xAxis.scale(xScale)
            .ticks(30)
            .tickFormat(d3.format("d"));

        let focus = this.svg.append("g")
                            .attr("class", "xAxis")
                            .attr("transform", "translate(50, 100)")
                            .style("fill", "none")
                            .style("stroke", "black")        
                            .call(xAxis);

        this.svg.append("g")
                .append("rect")
                .attr("class", "zoom")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
                .call(zoom)
                .on("click", onclick.bind(this));

        this.svg.append("g")
                .attr("id", "mouseclick")
                .style("display", "none");
        let clickrect = d3.select("#mouseclick")
                .append("rect") 
                .attr("width", 5)
                .attr("height", this.height);

        function zoomed() {
                let yearChart = window.yearChart;
                yearChart.curScale = d3.event.transform.rescaleX(xScale);
                focus.call(xAxis.scale(yearChart.curScale));
        }

        function onclick() {
                let tmp = d3.event;
                d3.select("#mouseclick")
                    .style("display", null);
                let bisectorDate = d3.bisector(function(d) { return d.year; }).left;
                let yearChart = window.yearChart;
                let selectedYear = Math.round(yearChart.curScale.invert(tmp.clientX));
                d3.select("#currentYear").text(selectedYear);
                this.mapChart.drawMap(selectedYear);
                clickrect.attr("x", tmp.clientX)
                        .attr("y", this.margin.top);

        }
    }


};
