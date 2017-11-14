class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
        this.humanIndex = d3.select("#humanIndex")
                            .attr("width", this.svgBounds.width)
                            .attr("height", 80);
        this.population = d3.select("#population")
                            .attr("width", this.svgBounds.width)
                            .attr("height", 260);
        this.remain = document.getElementById("details").innerHTML;
        this.colorScale = d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(['red', "yellow", 'green']);
    }

    updateInfo(oneCountryInfo, year) {
        console.log(oneCountryInfo);
        let wd = oneCountryInfo.wikidata;
        if (wd < 0) {
            document.getElementById("details").innerHTML = "<h1 id=\"country\"></h1>";
            document.getElementById("country").innerHTML = oneCountryInfo.NAME;
            return;
        }
        else {
             document.getElementById("details").innerHTML = this.remain;
        }

        document.getElementById("country").innerHTML = oneCountryInfo.NAME;
        console.log(wd);
        d3.json("data/stat/" + wd + ".json", function(err, data) { 
            console.log(data);
            document.getElementById("wikipage").setAttribute("src", data.wiki+"?printable=yes");
            document.getElementById("wikipage").setAttribute("height", this.svgHeight/2);
            document.getElementById("wikipage").setAttribute("width", this.svgWidth);			
//basicInfo
            let tableTitle = [{"title":"Capital", "value":"capital"}, {"title":"Continet", "value":"continent"}, {"title":"Head of State", "value":"headState"}, {"title":"Head of Gov", "value":"headGov"}];
            let basicInfo = []
            tableTitle.forEach(function(d){
                if (data[d.value].length != 0) {
                    if (d.value != "continent")
                        basicInfo.push({"title":d.title, "value":data[d.value]});
                    else
                        basicInfo.push({"title":d.title, "value":data[d.value].join(", ")});
                }
            });
            d3.select("#basicInfo")
                .append("tbody")
                .html("");
            d3.select("tbody")
                .selectAll("tr")
                .data(basicInfo)
                .enter().append("tr")
                .append("th")
                .text(d=>d.title)
                .style("font-size", "25px")
                .style("font-weight", "bold");
            d3.selectAll("tr")
                .append("td")
                .text(d=>d.value)
                .style("font-size", "20px")
                .style("font-weight", "normal");

            if (data.pop.length != 0) {
    //polulation
                d3.select("#popTitle")
                    .text("Population")
                    .style("font-size", "25px")
                    .style("font-weight", "bold");
    //population scale
                let popxScale = d3.scaleLinear()
                    .domain([d3.min(data.pop, d => +d.year), d3.max(data.pop, d => +d.year)])
                    .range([50, d3.select("#population").node().getBoundingClientRect().width-60]);
                let popyScale = d3.scaleLinear()
                    .domain([d3.min(data.pop, d => +d.stats), d3.max(data.pop, d => +d.stats)])
                    .range([d3.select("#population").node().getBoundingClientRect().height-30, 0]);
    //population line
                let lineGenerator = d3.line()
                                        .x(d=>popxScale(+d.year))
                                        .y(d=>popyScale(+d.stats));
                d3.select("#popShow")
                    .html("");
                let pop_s = data.pop.sort((a, b) => parseInt(a.year) - parseInt(b.year));
                d3.select("#popShow")
                    .append("path")
                    .attr("d", lineGenerator(pop_s))
                    .style("fill", "none")
                    .style("stroke", "steelblue")
                    .style("stroke-width", "2px");
    //population axes
                let xAxis = d3.axisBottom();
                xAxis.scale(popxScale)
                    .ticks(Math.min(data.pop.length,7))
                    .tickFormat(d3.timeFormat("%Y"));
                let yAxis = d3.axisLeft();
                yAxis.scale(popyScale)
                    .ticks(3, "s");
                d3.select("#popShow")
                    .append("g")
                    .attr("transform", "translate(0, 230)")
                    .style("fill", "none")
                    .style("stroke", "black")
                    .call(xAxis);
                d3.select("#popShow")
                    .append("g")
                    .attr("transform", "translate(50, 0)")
                    .style("fill", "none")
                    .style("stroke", "black")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Population");
    //population focus point
                let focus = d3.select("#population")
                                .append("g")
                                .attr("class", "focus")
                                .style("display", "none");
                focus.append("rect")
                    .attr("width", 2)
                    .attr("height", d3.select("#population").node().getBoundingClientRect().height-30);
                focus.append("circle")
                    .attr("r", 4);
                focus.append("text")
                    .attr("id", "pop_year")
                    .attr("dy", ".35em");
                focus.append("text")
                    .attr("id", "pop_stats")
                    .attr("dy", "1.35em");
                d3.select("#population")
                    .append("rect")
                    .attr("class", "overlay")
                    .attr("x", 80)
                    .attr("y", 5)
                    .attr("width", d3.select("#population").node().getBoundingClientRect().width-140)
                    .attr("height", d3.select("#population").node().getBoundingClientRect().height-30)
                    .on("mouseover", function() {focus.style("display", null);})
                    .on("mouseout", function() {focus.style("display", "none");})
                    .on("mousemove", mousemove);
                let bisectorDate = d3.bisector(function(d) { return d.year; }).left;
                function mousemove() {
                    let x0 = popxScale.invert(d3.mouse(this)[0]),
                        i = bisectorDate(pop_s, x0, 1),
                        d0 = pop_s[i-1],
                        d1 = pop_s[i],
                        d = d0;
                    if (i != pop_s.length)
                        d = x0 - d0.year > d1.year - x0? d1:d0;
                    focus.attr("transform", "translate(0,5)");
                    focus.select("circle")
                        .attr("cx", popxScale(d.year))
                        .attr("cy", popyScale(d.stats))
                    focus.select("rect")
                        .attr("x", popxScale(d.year)-1)
                        .attr("y", 0);
                    focus.select("#pop_year")
                        .attr("x", popxScale(d.year)+10)
                        .attr("y", d.year == d3.max(data.pop, d => +d.year)? popyScale(d.stats)+10:popyScale(d.stats))
                        .style("text-anchor", d.year == d3.max(data.pop, d => +d.year)? "end":"start")
                        .text(d.year);
                    focus.select("#pop_stats")
                        .attr("x", popxScale(d.year)+10)
                        .attr("y", d.year == d3.max(data.pop, d => +d.year)? popyScale(d.stats)+10:popyScale(d.stats))
                        .style("text-anchor", d.year == d3.max(data.pop, d => +d.year)? "end":"start")
                        .text(d.stats);
                }                
            }
            else {
                d3.select("#popTitle")
                    .html("");
                d3.select("#population")
                    .attr("height", 0)
                    .attr("width", 0)
                    .html("");
            }

            if (data.hdi.length != 0) {
    //humanIndex
                d3.select("#indexTitle")
                    .text("Human Development Index")
                    .style("font-size", "25px")
                    .style("font-weight", "bold");
    //humanIndex tip
               let hdiTip = d3.tip()
                    .attr('class', 'd3-tip')
                    .direction('s')
                    .offset(function() {
                        return [0,0];
                    })
                    .html(function(d){
                        let tooltip_data = {"result":[{"year": d.year,"stats": d.stats}]};
                        return "<text>Year: "+d.year+"<br>HDI: "+d.stats+"</text>";
                    });
    //humanIndex scale
                let hdiXScale = d3.scaleBand()
                    .domain(data.hdi.map(d=>+d.year).sort(d3.ascending))
                    .range([20, d3.select("#humanIndex").node().getBoundingClientRect().width-20])
                    .paddingInner(0.01);

                d3.select("#humanIndex")
                    .html("");
    //humanIndex Title
                let textArray = [d3.min(data.hdi, d=>+d.year), d3.max(data.hdi, d=>+d.year)];
                d3.select("#humanIndex")
                    .selectAll("text")
                    .data(textArray)
                    .enter().append("text")
                    .attr("x", d=>hdiXScale(d) + hdiXScale.bandwidth()/2)
                    .attr("y", 20) 
                    .attr("text-anchor", "middle")
                    .text(d=>d);
    //humanIndex Visualization
                d3.select("#humanIndex")
                    .append("g")
                    .attr("id", "indexShow")
                    .call(hdiTip);
                d3.select("#indexShow")
                    .selectAll("rect")
                    .data(data.hdi)
                    .enter().append("rect")
                    .attr("x", d=>hdiXScale(+d.year))
                    .attr("y", 30)
                    .attr("width", hdiXScale.bandwidth())
                    .attr("height", 10)
                    .style("fill", d=>this.colorScale(+d.stats))
                    .on("mouseover", hdiTip.show)
                    .on("mouseout", hdiTip.hide);
            }
            else {
                d3.select("#indexTitle")
                    .html("");
                d3.select("#humanIndex")
                    .attr("height", 0)
                    .attr("width", 0)
                    .html("");
            }

            if (data.wiki.length != 0) {
    //wikiPage Title
                d3.select("#wikiTitle")
                    .text("Description from Wiki")
                    .style("font-size", "25px")
                    .style("font-weight", "bold");                
            }
            else {
                d3.select("#wikiTitle")
                    .html("");
                d3.select("#wikipage")
                    .html("");
            }
        }.bind(this));
    }
}
