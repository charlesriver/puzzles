

/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

StackedAreaChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    this.initVis();
};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 30, left: 60 };

    vis.width = 900 - vis.margin.left - vis.margin.right;
    vis.height = 300 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TO-DO: Overlay with path clipping


    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.Year; }));

    vis.y = d3.scaleLinear()
        .domain([-0.15, 0.05])
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

   vis.xaxis_group =  vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")

    vis.yaxis_group =  vis.svg.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(0,0)");

    vis.yaxis_group
        .append("text")
        .attr("transform", "translate(" + -vis.margin.left*2/3 + "," + vis.height/4 +") rotate(-90)")
        .text("Forest Growth since 1990 (%)")
        .attr("stroke", "black");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // TO-DO: Initialize stack layout
    var dataCategories = colorScale.domain();

    // TO-DO: Tooltip placeholder
    vis.svg.append("text")
        .attr("class", "mytooltip")
        .attr('x', "0px")
        .attr('y', "-10px")
        .attr("stroke", "black");

    // TO-DO: (Filter, aggregate, modify data)

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.wrangleData();
};


/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function(){
    var vis = this;

    // In the first step no data wrangling/filtering needed
    var vals = ["Low Income", "Lower middle income", "Middle income", "Upper middle income", "High income"];
    vis.displayData = [];
    for(var i=0; i<vals.length; i++) {
        var v = vals[i];
        vis.displayData.push(this.data.map(function(d) {
            var obj = {Year: d.Year};
            obj.value = d[v];
            return obj;
        }));
    }
    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

StackedAreaChart.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    // vis.y.domain([0, d3.max(vis.displayData, function(d) {
    //     return d3.max(d, function(e) {
    //         return e[1];
    //     });
    // })
    // ]);



    vis.line = d3.line()
        .x(function(d) {return vis.x(d.Year); })
        .y(function(d) {return vis.y(d.value); })
        .curve(d3.curveLinear);

    var dataCategories = colorScale.domain();

// Draw the layers
    vis.svg.selectAll(".category").remove();

    var categories = vis.svg.selectAll(".category")
        .data(vis.displayData)
        .enter()
        .append("g")
        .attr("class", "category");

    categories.append("path")
        .attr("class", "line")
        .attr("d", function(d){return vis.line(d)})
        .attr("stroke", function(d,i) {
            return colorScale(dataCategories[i]);
        })
        .style("stroke-width", 5)
        .attr("fill", "none")
        .on("mouseover", function(d,i) {
            d3.select(".mytooltip").text(dataCategories[i])
        });

    // TO-DO: Update tooltip text

    categories.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};

