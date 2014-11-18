var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 2060 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var sqwidth = 50,
    sqheight = sqwidth,
    sqspacing = 0,
    phenobarheight = 20;

var data = [{"name": "Integument", "order": 1},
            {"name": "Genitourinary System", "order": 2},
            {"name": "Head and Neck", "order": 3},
            {"name": "Endocrine", "order": 4},
            {"name": "Connective Tissue", "order": 5},
            {"name": "Immune System", "order": 6},
            {"name": "Abdomen", "order": 7},
            {"name": "Voice", "order": 8},
            {"name": "Musculature", "order": 9},
            {"name": "Cardiovascular System", "order": 10},
            {"name": "Eye", "order": 11},
            {"name": "Metabolism/Homeostasis", "order": 12},
            {"name": "Ear", "order": 13},
            {"name": "Neoplasm", "order": 14},
            {"name": "Growth", "order": 15},
            {"name": "Prenatal or Birth", "order": 16},
            {"name": "Blood and Blood-Forming Tissue", "order": 17},
            {"name": "Nervous System", "order": 18},
            {"name": "Breast", "order": 19},
            {"name": "Respiratory System", "order": 20},
            {"name": "Skeletal System", "order": 21}
          ]

var svg = d3.select("#phenobar").append("svg")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var bar = svg.selectAll("g")
             .data(data)
             .enter().append("g")
             .attr("transform",
                function(d,i) {
                  return "translate(" + i + ", "+ sqwidth +")";
                });

bar.append("rect")
  .attr("x", function(d) { return d.order * (sqwidth + sqspacing); })
  .attr("y", phenobarheight)
  .attr("width", sqwidth)
  .attr("height", sqheight)
  .attr("class", "inactive")
  .attr("style", "outline: thin solid black;")
  .style("fill", "red")
  .on("click", function() {
    var rec = d3.select(this); // clicked rec

    // toggle color between two choices
    if (rec.style("fill") == "rgb(255, 0, 0)") {
      rec.style("fill", "green"); 
      rec.attr("class","active");
    } else {
      rec.style("fill", "red");
      rec.attr("class","inactive");
    }
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
  .style("font-size","16px")
  .style("text-anchor", "middle")
  .attr("pointer-events", "none")
  .text(function(d) { return d.name.substring(0,5); });



// var i = 0,
//     duration = 750,
//     root;

// var tree = d3.layout.tree()
//     .size([height, width]);

// var diagonal = d3.svg.diagonal()
//     .projection(function(d) { return [d.y, d.x]; });

// var svg = d3.select("body").append("svg")
//     .attr("width", width + margin.right + margin.left)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// d3.json("data.json", function(error, flare) {
//   root = flare;
//   root.x0 = height / 2;
//   root.y0 = 0;

//   function collapse(d) {
//     if (d.children) {
//       d._children = d.children;
//       d._children.forEach(collapse);
//       d.children = null;
//     }
//   }

//   root.children.forEach(collapse);
//   update(root);
// });

// d3.select(self.frameElement).style("height", "800px");

// function update(source) {

//   // Compute the new tree layout.
//   var nodes = tree.nodes(root).reverse(),
//       links = tree.links(nodes);

//   // Normalize for fixed-depth.
//   nodes.forEach(function(d) { d.y = d.depth * 200; }); // How wide it gets

//   // Update the nodes…
//   var node = svg.selectAll("g.node")
//       .data(nodes, function(d) { return d.id || (d.id = ++i); });

//   // Enter any new nodes at the parent's previous position.
//   var nodeEnter = node.enter().append("g")
//       .attr("class", "node")
//       .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
//       .on("click", click);

//   nodeEnter.append("circle")
//       .attr("r", 1e-6)
//       .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

//   nodeEnter.append("text")
//       .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
//       .attr("dy", ".35em")
//       .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
//       .text(function(d) { return d.name; })
//       .style("fill-opacity", 1e-6);

//   // Transition nodes to their new position.
//   var nodeUpdate = node.transition()
//       .duration(duration)
//       .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

//   nodeUpdate.select("circle")
//       .attr("r", 4.5)
//       .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

//   nodeUpdate.select("text")
//       .style("fill-opacity", 1);

//   // Transition exiting nodes to the parent's new position.
//   var nodeExit = node.exit().transition()
//       .duration(duration)
//       .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
//       .remove();

//   nodeExit.select("circle")
//       .attr("r", 1e-6);

//   nodeExit.select("text")
//       .style("fill-opacity", 1e-6);

//   // Update the links…
//   var link = svg.selectAll("path.link")
//       .data(links, function(d) { return d.target.id; });

//   // Enter any new links at the parent's previous position.
//   link.enter().insert("path", "g")
//       .attr("class", "link")
//       .attr("d", function(d) {
//         var o = {x: source.x0, y: source.y0};
//         return diagonal({source: o, target: o});
//       });

//   // Transition links to their new position.
//   link.transition()
//       .duration(duration)
//       .attr("d", diagonal);

//   // Transition exiting nodes to the parent's new position.
//   link.exit().transition()
//       .duration(duration)
//       .attr("d", function(d) {
//         var o = {x: source.x, y: source.y};
//         return diagonal({source: o, target: o});
//       })
//       .remove();

//   // Stash the old positions for transition.
//   nodes.forEach(function(d) {
//     d.x0 = d.x;
//     d.y0 = d.y;
//   });
// }

// // Toggle children on click.
// function click(d) {
//   if (d.children) {
//     d._children = d.children;
//     d.children = null;
//   } else {
//     d.children = d._children;
//     d._children = null;
//   }
//   update(d);
// }