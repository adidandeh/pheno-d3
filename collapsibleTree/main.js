var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 2060 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;
    
var i = 0,
    duration = 750,
    root;

var activerow = -1,
    pastlineage = [], /* diff between pastlineage and barStack is that 
    barstack deals with local lineage during phenotree and past lineage 
    is grabbed from it's parent's lineage. */
    barStack = [],
    circleRadius = 6,
    clickedNode = false, 
    colorArr = ["#98DDD3",
                "#E2B8CC",
                "#A3E0A4",
                "#D5D481",
                "#C6D2D7",
                "#EDAA84"],
    dropactive = false,
    dropbuttonwidth = 15,
    duration = 400,
    i = 0,
    margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    },
    phenobarheight = 20,
    priorPheno = null,
    sqwidth = 70,
    sqheight = 25,
    sqspacing = 1,
    treeWidth = 200,
    treeHeight = 500,
    height = 2000 - margin.top - margin.bottom,
    width = 2060 - margin.right - margin.left,
    maxBoxHeight = 120;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data.json", function(error, flare) {
  root = flare;
  root.x0 = height / 2;
  root.y0 = 0;

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  root.children.forEach(collapse);
  update(root);
});

d3.select(self.frameElement).style("height", "800px");


//helper functions 
cleanName = function(name) {
    try {
        name = name.replace("Abnormality of the ", "");
        name = name.replace("Abnormality of ", "");
        name = name.replace(" Abnormality", "");
        name = name.replace(" abnormality", "");
        name = name.replace("Abnormal ", "");
        name = name.charAt(0).toUpperCase() + name.slice(1);

        var tempEnd = "";
        var tempTextLength = 26;
        if (name.length > tempTextLength) {
            tempEnd = "...";
        }
        name = name.substring(0, tempTextLength) + tempEnd;
    } catch (e) {}

    return name;
}

color = function(d){
    var random = Math.floor(Math.random() * colorArr.length) + 0;

    return colorArr[random];
    // insert generation function.
    //return "#D8C6C6";
    //return "#49B649"; // green
}

function update(source) {
        // var levelWidth = [1];
        // var childCount = function(level, n) {
        //     if(n.children && n.children.length > 0) {
        //         if(levelWidth.length <= level + 1) levelWidth.push(0);
              
        //         levelWidth[level+1] += n.children.length;
        //         n.children.forEach(function(d) {
        //            childCount(level + 1, d);
        //         });
        //     }
        // };
        
        // childCount(0, source);  
  // Compute the new tree layout.
        // var newHeight = d3.max(levelWidth) * sqheight; // 20 pixels per line  
        // tree = tree.size([newHeight, treeWidth]);

tree = tree.size([550, treeWidth]);
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * (sqwidth+1); }); // How wide it gets

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("rect") // top majority of phenotype box
      .attr("y", function(d) {
          return (d.order * sqheight) + sqspacing;
      })
      .attr("x", phenobarheight)
      .attr("width", sqwidth)
      .attr("height", sqheight)
      .style("fill", color);

  // nodeEnter.append("circle")
  //     .attr("r", 1e-6)
  //     .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
      .attr("y", sqheight/2)
      .attr("x", function(d) { return d.children || d._children ? 80 : 80; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) {
         return cleanName(d.name).substring(0, 10);
      })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  // nodeUpdate.select("circle")
  //     .attr("r", 4.5)
  //     .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  // nodeExit.select("circle")
  //     .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}