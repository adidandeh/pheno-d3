var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 2060 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var sqwidth = 50,
    sqheight = sqwidth,
    sqspacing = 0,
    phenobarheight = 20;

var data = [{"name": "Integument", "order": 1, "active": 0},
            {"name": "Genitourinary System", "order": 2, "active": 0},
            {"name": "Head and Neck", "order": 3, "active": 0},
            {"name": "Endocrine", "order": 4, "active": 0},
            {"name": "Connective Tissue", "order": 5, "active": 0},
            {"name": "Immune System", "order": 6, "active": 0},
            {"name": "Abdomen", "order": 7, "active": 0},
            {"name": "Voice", "order": 8, "active": 0},
            {"name": "Musculature", "order": 9, "active": 0},
            {"name": "Cardiovascular System", "order": 10, "active": 0},
            {"name": "Eye", "order": 11, "active": 0},
            {"name": "Metabolism/Homeostasis", "order": 12, "active": 0},
            {"name": "Ear", "order": 13, "active": 0},
            {"name": "Neoplasm", "order": 14, "active": 0},
            {"name": "Growth", "order": 15, "active": 0},
            {"name": "Prenatal or Birth", "order": 16, "active": 0},
            {"name": "Blood and Blood-Forming Tissue", "order": 17, "active": 0},
            {"name": "Nervous System", "order": 18, "active": 0},
            {"name": "Breast", "order": 19, "active": 0},
            {"name": "Respiratory System", "order": 20, "active": 0},
            {"name": "Skeletal System", "order": 21, "active": 0}
          ]

// helper func
getNumOfActivePheno = function() {
  var count = 0;

    for (var i=0, l=data.length; i<l; i++) {
      if(data[i].active == 1) {
        count++;
      }
    }

  return count;
};

//helper func
findWithAttr = function (array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
}

draw = function(svg, data) {
  svg.selectAll("*").remove();

  var bar = svg.selectAll("g")
               .data(data, function(d) { return d.order; })
               .enter().append("g")
               .attr("transform",
                  function(d,i) {
                    return "translate(" + i + ", "+ sqheight +")";
                  });

  bar.append("rect")
    .attr("x", function(d) { return (d.order * sqwidth); })
    .attr("y", phenobarheight)
    .attr("width", sqwidth)
    .attr("height", sqheight)
    .attr("class", "inactive")
    //.attr("style", "outline: thin solid black;")
    .style("fill", function(d){ 
      if(d.active == 1) { 
        return "#49B649";
      } else {
        return "#E35C5C";
      }})
    .on("click", function(d) {
      var rec = d3.select(this); // clicked rec

      // pull current pheno out of the data array.
      var removedArr = data.splice(findWithAttr(data, 'name', d.name), 1);

      // toggle color between two choices
      if (rec.style("fill") == "rgb(227, 92, 92)") {
        rec.style("fill", "#49B649"); 
        rec.attr("class","active");

        // include itself
        var numOfActivePheno = getNumOfActivePheno(); 

        // reorder pheno data list
        // make sure that the new pheno isn't already in the proper place.
        if(removedArr[0].order != numOfActivePheno + 1){
          // if it isn't, bump the order of all the right obj elems
          data.forEach(function(pheno){
            if(pheno.order < removedArr[0].order + 1
              && pheno.active == 0) {
              pheno.order++;
            }
          });
        }
        // adjust the pheno object for insertion
        removedArr[0].active = 1;
        removedArr[0].order = numOfActivePheno + 1;
        // push the changed pheno into the data list at new place.
        data.splice(numOfActivePheno, 0, removedArr[0]);

      } else {
        rec.style("fill", "#E35C5C");
        rec.attr("class","inactive");

        // get number of phenos still active
        var numOfActivePheno = getNumOfActivePheno(); 

        if(removedArr[0].order != numOfActivePheno + 1){
          data.forEach(function(pheno){
            if(pheno.order > removedArr[0].order
                && pheno.active == 1) {
              pheno.order--;
            }
          });

        }
        // put it's position at the leftmost inactive.
        removedArr[0].active = 0;
        removedArr[0].order = numOfActivePheno + 1;
        // push the changed pheno into the data list at new place.
        data.splice(numOfActivePheno, 0, removedArr[0]);
      }
      draw(svg, data);
    })
    .on("mouseover", function(d) {      
              div.transition()        
                  .duration(200)      
                  .style("opacity", 10);      
              div .html("<h3>" + d.name + "</h3><br/>")  
                  .style("left", (d3.event.pageX - 0) + "px")     
                  .style("top", (d3.event.pageY - 100) + "px");    
              })                  
          .on("mouseout", function(d) {       
              div.transition()        
                  .duration(1000)      
                  .style("opacity", 0);   
          });

  bar.append("line")
    .attr("x1", function(d) { return d.order * (sqwidth + sqspacing) + 10;})
    .attr("y1", phenobarheight + 40)
    .attr("x2", function(d) { return d.order * (sqwidth + sqspacing) + 25;})
    .attr("y2", phenobarheight + 45)
    .style("stroke", "black")
    .style("stroke-width", 1);

  bar.append("line")
    .attr("x1", function(d) { return d.order * (sqwidth + sqspacing) + 40;})
    .attr("y1", phenobarheight + 40)
    .attr("x2", function(d) { return d.order * (sqwidth + sqspacing) + 25;})
    .attr("y2", phenobarheight + 45)
    .style("stroke", "black")
    .style("stroke-width", 1);

  bar.append("text")
    .attr("x", function(d) { return (d.order * (sqwidth + sqspacing) + sqwidth/2); })
    .attr("y", sqheight - 7) // hardcoded until better option is found
    .attr("dy", ".35em")
    .style("font-size", function(d) { 
      return Math.min(0.3 * sqwidth, (2 * sqwidth - 8) / this.getComputedTextLength() * 20) + "px";
    })
    .style("text-anchor", "middle")
    .attr("pointer-events", "none")
    .text(function(d) { return d.name.substring(0,5); });
};

var svg = d3.select("#phenobar").append("svg")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

draw(svg, data);