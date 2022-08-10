radialvisMain()

function radialvisMain(){

    var oddsRatio;
    var oddsRatioDimensions = ['Confidant','Single-Person','Unemployed','Discriminated','Supervisor','Religion','EthnicMinority','Immigrant']
    var lonelinessFactors = [
        'no confidant',
        'living alone',
        'unemployed',
        'being discriminated',
        'no supervisory role',
        'not belong to religion',
        'being ethinic minority',
        'being immigrants'
    ]

    var factorExplainations =[
        'Compare those who have no confidant with those who have at least one confidant.',
        'Compare those who lives alone with those who do not live alone.',
        'Compare those who was unemployed with those who had paid work in the past 7 days.',
        'Compare those who feel being discriminated with those who do not.',
        'Compare those who do not supervise the work of other employees with those who do.',
        'Compare those who do not believe in a religion with those who do.',
        'Compare those who are ethnic minority with those who are ethnic majority.',
        'Compare those who are immigrants with those who are natives.'
    ]

    var topFactors = [];
    var oddsRatioCountries;
    var oddsRatioStacked;
    var oddsRatioStackedDisplayed;
    var filtering;
    var radialArea;
    var singleRadialArea;
    var countryAreaPaths;
    var countryAreaPaths2;
    var oddsCircleBackgrounds;
    var oddsAxesLabels;
    var oddsCircleBackgrounds2;
    var radiusScale;
    var angleScale;
    var radiusAxis;
    var radiusAxisInverse;
    var oddsAxes;
    var tickValues
    var svg;
    var innerRadius = 40;
    var outerRadius = 180;
    var maxCircleCount = 5;
    var circleCount;
    var minCircleCount = 3;
    var maxInnerRadius = 40;
    var minInnerRadius = 20;
    var maxBoundaryOffset = 10;
    var minBoundaryOffset = 5;
    var radiusBoundaryOffset = 10;
    var colorInterpolator;
    var colorScheme;

    // svg groups containers
    var circleContainer;
    var areaContainer;
    var axesContainer;
    var labelContainer;

    var explainationContainer;
    var currentCountry = 'Europe';
    var displayCountry;

    var radialtooltip;
    var radialtooltiptext;
    var tooltipContainer;
    // Load Data
    queue()
        .defer(d3.csv, "data/OddsRatioByFactor.csv")
        .await(createRadialVis);



    function createRadialVis(error, oddsRatioData){
        oddsRatioCountries = oddsRatioData.columns.slice(1,);
        oddsRatio = oddsRatioData.slice();
        oddsRatio.forEach((d,i) => {
            for (const property in d){
                if (property != 'Factor'){
                    d[property] = + d[property] 
                    if (Number.isNaN(d[property])){
                        d[property] = 1.0;   // 1 means not positive realted or negative related
                    }
                }
            }
        })
        initRadialVis()
    }

    function initRadialVis(){
        svg = d3.select("#dugy-radial")
        //responsive layout from 
        //https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
            .classed("dugy-svg-container", true)
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 400 400")
            .classed("dugy-svg-content-responsive", true)
            .append('g')
            .attr("transform", "translate(" + 200 + "," +200 + ")");
        
        circleContainer = svg.append('g').attr('class', 'dugy-radial-circle-container');
        areaContainer = svg.append('g').attr('class','dugy-radial-area-container');
        axesContainer = svg.append('g').attr('class','dugy-radial-axes-container');
        labelContainer = svg.append('g').attr('class', 'dugy-radial-labels-container');
        tooltipContainer = svg.append('g').attr('class', 'dugy-radial-tooltip-container');
                       

        var stack = d3.stack().keys(oddsRatioCountries);

        // Call shape function on the dataset
        oddsRatioStacked = stack(oddsRatio);



        // scale
        angleScale = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .domain([0, oddsRatioDimensions.length]);

        var rmax = d3.max(oddsRatioStacked, d=> {return d3.max(d, e=> e[1])}) + radiusBoundaryOffset;
        radiusScale = d3.scalePow()
            .exponent(0.75)
            .domain([0,rmax])
            .range([innerRadius,outerRadius]);


        radialtooltip = tooltipContainer.append('rect')
                        .attr("width", 270)
                        .attr("height", 20)
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("id", "dugy-radial-tooltip-rect")
                        .style('fill','#171c25')
                        .style('opacity',0)
        radialtooltiptext = tooltipContainer.append('text')
                    .attr('id', 'dugy-radial-tooltip-text')
                    .style('fill','#8593b3')
                    .attr('x', 8)
                    .attr('y', 8)
                    .style('font-size',6)
                    .style("opacity",0)
                    .attr('dy', '.35em');


        // text labels for factors
        oddsAxesLabels = labelContainer.selectAll(".dugy-radial-label")
            .data(oddsRatioDimensions, function(d,i){return i})
            
        oddsAxesLabels2 = oddsAxesLabels.enter().append('text')

        oddsAxesLabels2.transition()
            .duration(800)
            .attr('x',0)
            .attr('y',function(d,i){
            if (angleScale(i)> 0.5 * Math.PI && angleScale(i) < 1.5* Math.PI ){
               return outerRadius+ 10
            }else{
               return -outerRadius-5
            }
            })
            .attr('class', 'dugy-radial-label')
            .attr("transform", function(d,i) { 
                if (angleScale(i)> 0.5 * Math.PI && angleScale(i) < 1.5 * Math.PI){
                    return "rotate(" + (angleScale(i) - Math.PI) * 180 / Math.PI + ")"; 
                }else{
                    return "rotate(" + angleScale(i) * 180 / Math.PI + ")"; 
                }
            
            })
            .text(function(d){return d})
            .style('fill','#ff6666')
            .style('font-weight', '200')
            .style('text-anchor','middle')
            .style('font-size', '9px')

        oddsAxesLabels2.on('mouseenter', function(d,i){
            tooltipContainer.transition(10).attr('transform', `translate(${-50}, ${40})`);
            radialtooltip.transition(1).style("opacity",1.0);
            radialtooltiptext.transition(1).style("opacity",1.0).text(factorExplainations[i]);
            })
            .on('mouseleave',function(d,i){
                radialtooltip.transition(1).style("opacity",0);
                radialtooltiptext.transition(1).style("opacity",0);
              }) 

        // axes
        circleCount = maxCircleCount;
        radiusAxis = d3.axisLeft().scale(radiusScale).tickSize(2).ticks(circleCount);
        
        oddsAxes = axesContainer.selectAll(".dugy-radial-axis")
            .data(d3.range(angleScale.domain()[1]))
            .enter().append("g")
            .attr("class", function(d){
                if (angleScale(d) >= Math.PI * 0.5 && angleScale(d) < Math.PI * 1.5){
                    return "dugy-radial-axis dugy-radial-axis-upright";
                }else{
                    return "dugy-radial-axis dugy-radial-axis-down";
                }})
            .attr("transform", function(d) { return "rotate(" + angleScale(d) * 180 / Math.PI + ")"; })
            .call(radiusAxis);
        d3.selectAll("g.dugy-radial-axis.dugy-radial-axis-upright")
        .selectAll('.tick').selectAll('text')
        .attr('transform', 'rotate(180)')
        .attr('x', 5)
        .attr('text-anchor','middle')

        colorInterpolator = d3.interpolateRgb(d3.color("#ff6666"),d3.color("#8293b6"));
        colorScheme = d3.quantize(colorInterpolator, oddsRatioCountries.length);

        filtering = '';
        hovering = '';
        filterData();
    }



    function filterData(){
        oddsRatioStackedDisplayed = oddsRatioStacked;

        if (filtering){
            var indexOfFilter = oddsRatioCountries.findIndex(function(d){return d == filtering});
            oddsRatioStackedDisplayed = [oddsRatioStacked[indexOfFilter]];
        }

        updateRadialVis();

    }

    function updateRadialVis(){
        displayCountry = document.getElementById('dugy-radial-currentCountry');


        // update radius scale
        var rmax = d3.max(oddsRatioStackedDisplayed, d=> 
                          { return d3.max(d, e=>{
                              if(filtering){return e[1]-e[0];}
                              else{return e[1];}
                          })
                          }) + radiusBoundaryOffset;

        radiusScale.range([innerRadius,outerRadius]).domain([0,rmax]);
        radiusAxis.scale(radiusScale).ticks(circleCount);



        // area paths                    
        radialArea = d3.areaRadial()
            .curve(d3.curveCardinalClosed)
            .angle(function(d,i) { return angleScale(i);})
            .innerRadius(function(d) { return radiusScale(d[0]);})
            .outerRadius(function(d) { return radiusScale(d[1]);});

        singleRadialArea =  d3.areaRadial()
            .curve(d3.curveCardinalClosed)
            .angle(function(d,i) { return angleScale(i);})
            .innerRadius(radiusScale(0))
            .outerRadius(function(d) { return radiusScale(d[1]-d[0]);});

        // get tickvalues for drawing circles
        tickValues = d3.ticks(0,radiusScale.domain()[1],circleCount);
        if (tickValues[-1] != rmax){tickValues.push(rmax)}

        oddsAxes.call(radiusAxis); 
        d3.selectAll("g.dugy-radial-axis.dugy-radial-axis-upright")
        .selectAll('.tick').selectAll('text')
        .attr('transform', 'rotate(180)')
        .attr('x',8);

        

        // circles
        oddsCircleBackgrounds = circleContainer.selectAll(".dugy-radial-circle")
            .data(tickValues, function(d,i){return i})

        //console.log(oddsCircleBackgrounds)
        oddsCircleBackgrounds2 = oddsCircleBackgrounds
            .enter().append("circle")
            .attr('class','dugy-radial-circle')
            .merge(oddsCircleBackgrounds)
            .attr('cx', 0 )
            .attr('cy', 0 )
            .attr('r', function(d){return radiusScale(d)})
            .style('fill', '#000000')
            .style('fill-opacity', 0.15)
        oddsCircleBackgrounds.exit().remove();

        updateTopFactors();

        // Area Paths
        countryAreaPaths = areaContainer.selectAll(".dugy-radial-area")
            .data(oddsRatioStackedDisplayed, function(d){return d.key});

        countryAreaPaths2 = countryAreaPaths.enter().append("path")
            .attr("class", "dugy-radial-area")
            .merge(countryAreaPaths);
        countryAreaPaths2.transition()
            .duration(800)
            .style("fill", function(d,i) {
            return colorScheme[i];
        })
            .style("fill-opacity",function(d,i){
            return 0.8;
        })
            .attr("d", function(d) {
            if(filtering){return singleRadialArea(d)}
            else{
                return radialArea(d);
            }
        });
        countryAreaPaths2.on('mouseover', function(d,i) {
            d3.select(this).style("fill", 'white');
            d3.select(this).style("fill-opacity", 1)
                .attr('cursor', 'pointer');
            currentCountry = d.key;
            displayCountry.innerHTML = currentCountry;
            updateTopFactors();
            svg.append("text")
                .attr("x", 0)
                .attr("y", -2)
                .attr("class", "dugyclicktoshow")
                .attr("font-family", "'Roboto', sans-serif")
                .attr("font-weight", "200")
                .attr("font-size", "8px")
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text("click to")
            svg.append("text")
                .attr("class", "dugyclicktoshow")
                .attr("x", 0)
                .attr("y", 8)
                .attr("font-family", "'Roboto', sans-serif")
                .attr("font-weight", "200")
                .attr("font-size", "8px")
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text("zoom")

        })
            .on('mouseleave', function(d,i) {
            d3.selectAll(".dugyclicktoshow").remove();
            d3.select(this).style("fill", colorScheme[i]);
            d3.select(this).style("fill-opacity", 0.8); 
            currentCountry = (filtering == "")? 'Europe':d.key
            displayCountry.innerHTML = currentCountry ;
            updateTopFactors();
        })
            .on("click", function(d,i) {
            filtering = (filtering) ? "" : oddsRatioCountries[i];
            circleCount = (filtering == "")? maxCircleCount:minCircleCount;
            innerRadius = (filtering == "")? maxInnerRadius:minInnerRadius;
            radiusBoundaryOffset = (filtering == "")? maxBoundaryOffset:minBoundaryOffset;
            currentCountry = d.key;
            displayCountry.innerHTML = currentCountry;
            filterData();});
        countryAreaPaths.exit().remove();

    }

    function updateTopFactors(){
        topFactors = []
        if (filtering == '' && currentCountry != 'Europe'){
            // Update Top Factors
            var indexOfCountry = oddsRatioCountries.findIndex(function(d){return d == currentCountry});
            oddsRatioStackedDisplayed[indexOfCountry].forEach((d,i)=>{
                topFactors.push([d[1] - d[0],d.data.Factor,i]) 
            })
        }
        else{
            // Update Top Factors
            oddsRatioStackedDisplayed[oddsRatioStackedDisplayed.length-1].forEach((d,i)=>{
                topFactors.push([d[1] - oddsRatioStackedDisplayed[0][i][0],d.data.Factor,i])
            });
        }

        //sort decreasingly
        topFactors.sort(function(a,b){
            return b[0] - a[0];
        })

        document.getElementById('dugy-radial-topfactors').innerHTML = 
            lonelinessFactors[topFactors[0][2]]
            + ' <br>' + 
            lonelinessFactors[topFactors[1][2]]
            + ' <br>' + 
            lonelinessFactors[topFactors[2][2]];

    }

}



