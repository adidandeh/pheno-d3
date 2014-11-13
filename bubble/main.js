var diameter = 1100,
    format = d3.format(",d"),
    color = d3.scale.category20c(),
    search = "",
    pubmed = "",
    lastdataarray = [];

var bubble = d3.layout.pack()
    .sort(function comparator(a, b) {
        return b.medline_pub_year - a.medline_pub_year;
      })
    .size([diameter, diameter-300])
    .padding(1.5)
    .radius(diameter/35);

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};


defaultFilter = function(d) { 
  return (!d.children)
};
// searchFilter = function(d) {
//   if(typeof d.id === 'undefined'){
//       return (!d.children);
//   };
//   return (!d.children) && searchCase(d, search)
// };

generate(defaultFilter,search);

function generate(filter, search) {
  svg.selectAll("*").remove();

  d3.json("data.json", function(error, root) {
    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(root, search))
        .filter(filter))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
          var numofnodes = d3.selectAll(".node").size();
          return "translate(" + d.x + "," + d.y + ")"; });

    var numofnodes = d3.selectAll(".node").size();

    node.append("title")
        .text(function(d) { return d.id + ": " + format(d.id); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.id); }).on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", 10);      
            div .html(
              "<h3>" + d.medline_article_title + "</h3><br/>"+
              "<b>Journal Title:</b> " + d.medline_journal_title[0] + "<br/>"+
              "<b>Publishing Year:</b> " + d.medline_pub_year + "<br/>" +
              "<b>Author(s):</b> " + d.medline_author_name + "<br/>"+
              "<b>Phenotype(s):</b> " + d.phenotypes + "<br/>"+
              "<b>Descriptor(s):</b> " + d.medline_descriptor_name + "<br/>"
              )  
                .style("left", (d3.event.pageX - 340) + "px")     
                .style("top", (d3.event.pageY + 128) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(1000)      
                .style("opacity", 0);   
        });

    node.append("text")
          .text(function(d) { return d.medline_journal_title; })
           .style("text-anchor", "middle")
           .style("font-size", function(d) { return Math.min(0.5 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 20) + "px"; })
           .attr("dy", ".35em");
  });
}

function filter() {
  search = d3.select("#searchfield");
  search = search[0][0].value;

  generate(defaultFilter, search);
}

function httpGet(url, searchterm)
{
    var paramobj = {
        core: 'medline-citations',
        handler: 'select',
        searchFields: JSON.stringify(['medline_abstract_text']), //stringify the array so it is sent properly
        query: searchterm,
      };
//    var params = JSON.stringify(paramobj);

    url = url + "?core=" + paramobj.core + 
                "&handler=" + paramobj.handler +
                "&searchFields=" + paramobj.searchFields +
                "&query=" + paramobj.query;
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xmlHttp.send();
    return xmlHttp.responseText;
}

function pubmedsearch() {
  pubmed = d3.select("#pubmedfield");
  pubmed = pubmed[0][0].value;

  jsonresponse = httpGet("//129.100.19.193/soscip/api/search.php",
    pubmed);

  

  console.log(jsonresponse);

}

function searchCase(d, search){
  return d.phenotypes.some(function(elem){ return elem.indexOf(search) != -1; }) ||
         d.medline_article_title.some(function(elem){ return elem.indexOf(search) != -1; }) ||
         d.medline_journal_title.some(function(elem){ return elem.indexOf(search) != -1; }) ||
         d.medline_descriptor_name.some(function(elem){ return elem.indexOf(search) != -1; }) ||
         d.medline_pub_year.some(function(elem){ return elem.indexOf(search) != -1; }) ||
         d.medline_author_name.some(function(elem){ return elem.indexOf(search) != -1; })
}

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root, search) {
  root = root.response.docs;
  var classes = [];

  root.forEach(function(d){
    if(typeof d.phenotypes === 'undefined'){
      d.phenotypes = [""];
    } else if(typeof d.phenotypes === 'string'){
      d.phenotypes = [d.phenotypes.toLowerCase()];
    } else {
      d.phenotypes = d.phenotypes.map(function(elem) { return elem.toLowerCase(); });
    }

    if(typeof d.medline_pub_year === 'undefined'){
      d.medline_pub_year = [""];
    } else if(!isNaN(parseFloat(d.medline_pub_year)) && isFinite(d.medline_pub_year)){
      d.medline_pub_year = [d.medline_pub_year.toString()];
    }

    if(typeof d.medline_article_title === 'undefined'){
      d.medline_article_title = [""];
    } else if(typeof d.medline_article_title === 'string'){
      d.medline_article_title = [d.medline_article_title.toLowerCase()];
    } else {
      d.medline_article_title = d.medline_article_title.map(function(elem) { return elem.toLowerCase(); });
    }

    if(typeof d.medline_journal_title === 'undefined'){
      d.medline_journal_title = [""];
    } else if(typeof d.medline_journal_title === 'string'){
      d.medline_journal_title = [d.medline_journal_title.toLowerCase()];
    } else {
      d.medline_journal_title = d.medline_journal_title.map(function(elem) { return elem.toLowerCase(); });
    }

    if(typeof d.medline_descriptor_name === 'undefined'){
      d.medline_descriptor_name = [""];
    } else if(typeof d.medline_descriptor_name === 'string'){
      d.medline_descriptor_name = [d.medline_descriptor_name.toLowerCase()];
    } else {
      d.medline_descriptor_name = d.medline_descriptor_name.map(function(elem) { return elem.toLowerCase(); });
    }

    if(typeof d.medline_author_name === 'undefined'){
      d.medline_author_name = [""];
    } else if(typeof d.medline_author_name === 'string'){
      d.medline_author_name = [d.medline_author_name.toLowerCase()];
    } else {
      d.medline_author_name = d.medline_author_name.map(function(elem) { return elem.toLowerCase(); });
    }

    if(search != "") {
      if(searchCase(d, search)) {
        classes.push(d);
      }
    } else {
      classes.push(d);
    }
  });

  if (classes.length <= 0 ){
    return {children: lastdataarray};
  }

  lastdataarray = classes;
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");