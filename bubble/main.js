var diameter = 1100,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var count = 0;
var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter-300])
    .padding(1.5)
    .radius(diameter/65);

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

defaultFilter = function(d) { 
  return (!d.children)
};
searchFilter = function(d) {
  if(typeof d.id === 'undefined'){
      return (!d.children);
  };
  return (!d.children) && d.phenotypes.some(function(elem) { return elem.indexOf(search) != -1; })
};

generate(defaultFilter);

function generate(filter) {
svg.selectAll("*").remove();
  d3.json("ost.json", function(error, root) {
    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(root))
        .filter(filter))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.id + ": " + format(d.id); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.id); });

    node.append("text")
          .text(function(d) { return d.id; })
          .style("text-anchor", "middle")
          .style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; })
          .attr("dy", ".35em");
  });
}

function filter() {
  search = d3.select("#searchfield");
  search = search[0][0].value;

  generate(searchFilter);
}

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  root = root.response.docs;
  var classes = root;

  classes.forEach(function(d){
    if(typeof d.phenotypes === 'undefined'){
      d.phenotypes = [""];
    };
    d.phenotypes = d.phenotypes.map(function(elem) { return elem.toLowerCase(); });
  });

  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");