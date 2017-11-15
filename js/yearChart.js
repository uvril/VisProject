
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
        /*var slider = this.svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + this.svg.attr("height") / 2 + ")");

        slider.append("line")
            .attr("class", "track")
            .attr("x1", this.x.range()[0])
            .attr("x2", this.x.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function() { slider.interrupt(); })
                .on("start drag", function() { this.changeYear(this.x.invert(d3.event.x)); }.bind(this)));

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(this.x.ticks(30))
            .enter().append("text")
            .attr("x", d => this.x(d))
            .attr("text-anchor", "middle")
            .text(d => d);

        this.handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("cx", this.x.range()[1])
            .attr("r", 9);*/

    };

    update() {
        this.mapChart.drawMap(2015);

        let xScale = d3.scaleLinear()
            .domain([-2001, 2017])
            .range([0, this.width])
            .clamp(true);

        let yearText = this.svg.append("text")
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

        this.svg.append("rect")
                .attr("class", "zoom")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
                .call(zoom);

        function zoomed() {
                let t = d3.event.transform;
                focus.call(xAxis.scale(t.rescaleX(xScale)));
        }
    }

    changeYear(h) {
        this.handle.attr("cx", this.x(h));
        let year = Math.round(h);
        this.yearText.text(year);
        this.mapChart.drawMap(year);
    };


};
