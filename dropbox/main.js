var activerow = -1,
    childrenNumStack = [1];
    currentTreeData = {},
    cursorElement = null,
    cursorData = null,
    colorArr = ["#98DDD3",
                "#E2B8CC",
                "#A3E0A4",
                "#D5D481",
                "#C6D2D7",
                "#EDAA84"],
    duration = 200,
    depth = 0;
    drill = undefined,
    i = 0,
    margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    },
    phenobarheight = 20,
    sqwidth = 70,
    sqheight = 25,
    sqspacing = 1,
    treeActive = false;
    treeWidth = 200,
    treeHeight = 500,
    height = 2000 - margin.top - margin.bottom,
    width = 1000 - margin.right - margin.left,
    maxBoxHeight = 120;

// treeMap
var mapMargin = {top: 20, right: 0, bottom: 0, left: 0},
    mapWidth = 300,
    mapHeight = 300;

// var mapX = d3.scale.linear()
//     .domain([0, mapWidth])
//     .range([0, mapWidth]);

// var mapY = d3.scale.linear()
//     .domain([0, mapHeight])
//     .range([0, mapHeight]);

// var treemap = d3.layout.treemap()
//     .children(function(d, depth) { 
//       return depth ? null : d._children; })
//     // .sort(function(a, b) { 
//     //   return a.value - b.value; })
//     .ratio(mapHeight / mapWidth * 0.5 * (1 + Math.sqrt(5)))
//     .round(false);

var treemap = d3.layout.treemap()
    .size([mapWidth, mapHeight])
    .value(function(d) {
        try {
            return (d._children.length > 0) ? d._children.length : 1;
        } catch (e) {
            return 0;
        }
    });

// phenoTree
var tree = d3.layout.tree()
    .size([treeHeight, treeWidth]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) {
        return [d.y, d.x];
    });

var svg = d3.select("#phenobar").append("svg")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body").append("div")
    .attr("class", "tooltip");

var treecolor = d3.scale.category20c();

// treeMap
// var svgMap = d3.select("#chart").append("svg")
//     .attr("width", mapWidth + mapMargin.left + mapMargin.right)
//     .attr("height", mapHeight + mapMargin.bottom + mapMargin.top)
//     .style("margin-left", -mapMargin.left + "px")
//     .style("margin.right", -mapMargin.right + "px")
//   .append("g")
//     .attr("transform", "translate(" + mapMargin.left + "," + mapMargin.top + ")")
//     .style("shape-rendering", "crispEdges");

// var grandparent = svgMap.append("g")
//     .attr("class", "grandparent");

// grandparent.append("rect")
//     .attr("y", -mapMargin.top)
//     .attr("width", mapWidth)
//     .attr("height", mapMargin.top);

// grandparent.append("text")
//     .attr("x", 6)
//     .attr("y", 6 - mapMargin.top)
//     .attr("dy", ".75em");
// /

d3.select("body").on("keydown", function (d) {
    if(treeActive) {
        var keyCode = d3.event.keyCode;
        d3.event.preventDefault(); 
    
        switch(keyCode) {
            case 13: // enter
                createPhenoBox();
                break;
            case 37: // left
                try {
                    var next = document.querySelector('[hpid="'+cursorData.parent["id"]+'"]');
                    cursorElement["element"].style["stroke"] = "";
                    cursorElement["element"].style["opacity"] = 0.6;
                    cursorElement["element"].id = "";
                    cursorElement["element"] = next;
                    cursorElement["element"].style["stroke"] = "black";
                    cursorElement["element"].style["opacity"] = 1.0;
                    cursorElement["element"].id = "cursor";
                    if (typeof cursorData.parent.parent == "undefined") { // going back into root phenos
                        cursorElement["location"] = "list";
                    } 

                    var l = document.getElementById('cursor');
                    if(cursorElement["location"] == "list") {
                        moveSignal(l);
                    } else if(cursorElement["location"] == "tree"){
                        moveSignal(l.parentNode);
                    }
                } catch (e) {}
                break;
            case 38: // up
                try {
                    var next;
                    if(cursorElement["location"] == "list") { // list and tree are inverted.
                        next = cursorElement["element"].parentNode.previousSibling.childNodes[0];
                    } else if (cursorElement["location"] == "tree") {
                        next = cursorElement["element"].parentNode.nextSibling.childNodes[0];
                        if (cursorElement["element"].parentNode.transform.animVal[0].matrix.e 
                            != next.parentNode.transform.animVal[0].matrix.e) {
                            break; // stop from scroll off the bottom of the tree list
                        }
                    }

                    cursorElement["element"].style["stroke"] = "";
                    cursorElement["element"].style["opacity"] = 0.6;
                    cursorElement["element"].id = "";
                    cursorElement["element"] = next;
                    cursorElement["element"].style["stroke"] = "black";
                    cursorElement["element"].style["opacity"] = 1.0;
                    cursorElement["element"].id = "cursor";

                    var l = document.getElementById('cursor');
                    if(cursorElement["location"] == "list") {
                        moveSignal(l);
                    } else if(cursorElement["location"] == "tree"){
                        moveSignal(l.parentNode);
                    }

                } catch(e){}
                break; 
            case 39: // right
                try {
                    var next;
                    if(cursorElement["location"] == "list") {
                        next = cursorElement["element"].parentNode.parentNode.lastChild.previousSibling.childNodes[0];
                    } else if (cursorElement["location"] == "tree") {
                        if(cursorData.children.length <= 0) break;
                        next = cursorElement["element"].parentNode.parentNode.lastChild.childNodes[0];
                    }

                    cursorElement["element"].id = "";
                    cursorElement["element"].style["stroke"] = "grey";
                    cursorElement["element"] = next;

                    cursorElement["location"] = "tree";
                    cursorElement["element"].id = "cursor";
                    cursorElement["element"].style["stroke"] = "black";
                    cursorElement["element"].style["opacity"] = 1.0;

                    var l = document.getElementById('cursor');
                    moveSignal(l.parentNode);
                } catch(e){}
                break; 
            case 40: // down
                try {
                    var next;
                    if(cursorElement["location"] == "list") { // list and tree are inverted.
                        next = cursorElement["element"].parentNode.nextSibling.childNodes[0];
                        if (next.className.animVal != "rootPheno") break; // stop from scroll off the bottom of the list
                    } else if (cursorElement["location"] == "tree") {
                        next = cursorElement["element"].parentNode.previousSibling.childNodes[0];
                        if (cursorElement["element"].parentNode.transform.animVal[0].matrix.e 
                            != next.parentNode.transform.animVal[0].matrix.e) {
                             break; // stop from scroll off the bottom of the tree list
                        }
                    }

                    cursorElement["element"].style["stroke"] = "";
                    cursorElement["element"].style["opacity"] = 0.6;
                    cursorElement["element"].id = "";
                    cursorElement["element"] = next;
                    cursorElement["element"].id = "cursor";
                    cursorElement["element"].style["stroke"] = "black";
                    cursorElement["element"].style["opacity"] = 1.0;

                    var l = document.getElementById('cursor');
                    if(cursorElement["location"] == "list") {
                        moveSignal(l);
                    } else if(cursorElement["location"] == "tree"){
                        moveSignal(l.parentNode);
                    }
                } catch(e){}
                break; 
        }
    }  
});

d3.select("body").on("keypress", function () { 
    if(treeActive) {
        d3.event.preventDefault();  
    }
});

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
    } catch (e) {
        name = "Error."
    }

    return name;
}

color = function(d){
    var random = Math.floor(Math.random() * colorArr.length) + 0;
    //return colorArr[random];
    // insert generation function.
    //return "#D8C6C6";
    return "#49B649"; // green
}

createPhenoBox = function() { // use cursorData parent chain-up
    if(typeof cursorData.name != "undefined"){
        var tempPheno = [cursorData];
        while(typeof tempPheno[tempPheno.length-1].parent != "undefined") {
            tempPheno.push(tempPheno[tempPheno.length-1].parent);
        }
        tempPheno.pop();
        tempPheno.reverse();
        var inArray;
        for(var i = 0; i < tempPheno.length; i++) {
            inArray = findWithAttr(data[activerow].children, "id", tempPheno[i].id);
            if(inArray == -1) {
                data[activerow].children.push(tempPheno[i]);
            }
        }

        cursorData = null;
        treeActive = false;
        draw(svg, data);
    }
}

findWithAttr = function(array, attr, value) {
    for (var i = 0; i < array.length; i++) {
        if (typeof array[i][attr] !== "undefined") {
            if (array[i][attr].toUpperCase() === value.toUpperCase()) {
                return i;
            }
        }
    } 
    return -1;      
}

moveSignal = function(target) {
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click');
    target.dispatchEvent(event);
};

getMaxChildren = function() {
    var children = 0;

    data.forEach(function(rootPheno) {
        if(rootPheno.children.length > children) {
            children = rootPheno.children.length;
        }
    });
    return children;
} 

getLineage = function(d) {
    var lineage = [];
        var temp = d;
        while (temp.hasOwnProperty("parent")) {
            lineage.push(temp.parent);
            temp = temp.parent;
        }
    return lineage;
}

generateBreadCrumb = function(d) {
    var tempLineageArr = [];
    var temptext = "";

    if (typeof d["lineage"] !== "undefined") {
        tempLineageArr = tempLineageArr.concat(d["lineage"]);
    } //else if (barStack.length > 0){ 
    // }
    tempLineageArr.push(d);

    for (var x = 0; x < tempLineageArr.length; x++) {
        if (x < tempLineageArr.length && x != 0) {
            temptext = temptext + " > ";
        }
        temptext = temptext + tempLineageArr[x].name;
    }
    return temptext;
}

// http://stackoverflow.com/questions/19167890/d3-js-tree-layout-collapsing-other-nodes-when-expanding-one/19168311#19168311
collapse = function(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

move = function(d) {
  cursorData = d;
  if (d.children) {
    drill = false; // up to the parent
    d._children = d.children;
    d.children = null;
  } else {
      drill = true; // down to the children
      d.children = d._children;
      d._children = null;
  }

    // http://stackoverflow.com/questions/19167890/d3-js-tree-layout-collapsing-other-nodes-when-expanding-one/19168311#19168311
    if (d.parent) {
        d.parent.children.forEach(function(element) {
          if (d !== element) {
            collapse(element);
          }
        });
    }
    tooltipMouseOver(d);
    update(d);
}

removeChild = function(row, column) {
    data[row].children.splice(column, 1);
    draw(svg, data);
}

tooltipMouseOut = function(d) {
    div.transition()
        .duration(1000)
        .style("opacity", 0);
}

tooltipMouseOver = function(d) { 
    var defn = " : " + d.defn;
    if (typeof d.defn == "undefined" || d.defn == null) {
        defn = "";
    }

    var bread = generateBreadCrumb(d);
    if (bread == "undefined") {
        bread = "Error generating phenotype";
    }

    div.transition()
        .duration(200)
        .style("opacity", 10);
    div.html("<h3>" + bread + defn /*d.name*/ + "</h3><br/>")
        .style("left", /*(d3.event.pageX + 10)*/ 100 + "px") // horizontal
        .style("top", /*(d3.event.pageY - 20)*/ 40 + "px"); // vertical
}

cursor = function(d) {
    if(cursorData) {
        if (cursorData.id == d.id) {
            return "black";
        }
        var lineage = getLineage(cursorData);
        for(var i = 0; i < lineage.length; i++){
            if(lineage[i].id == d.id) {
                return "grey";
            }
        }
    }
    return "";
}

// major functions
update = function(source, row, startOffset) {
    // treeMap

    d3.select("#chart").selectAll("div").remove();

    var treediv = d3.select("#chart").append("div")
        .style("position", "relative")
        .style("width", (mapWidth + mapMargin.left + mapMargin.right) + "px")
        .style("height", (mapHeight + mapMargin.top + mapMargin.bottom) + "px")
        .style("left", mapMargin.left + "px")
        .style("top", mapMargin.top + "px");

    var treenode = treediv.datum(source).selectAll(".treenode")
        .data(treemap.nodes)
        .enter().append("div")
          .attr("class", "treenode")
          .call(position)
          .style("background", function(d) { return d.children ? color(d.name) : null; })
          .text(function(d) { 
            return d._children ? d.name : null; });

    function position() {
      this.style("left", function(d) { return d.x + "px"; })
          .style("top", function(d) { return d.y + "px"; })
          .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
          .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }
    // svgMap.selectAll(".depth").remove();

// console.log("^^^^");
//    initialize(source);
  // accumulate(source);
  // layout(source);
    // display(source);

    // function initialize(root) {
    //     root.x = root.y = 0;
    //     root.dx = mapWidth;
    //     root.dy = mapHeight;
    //     root.depth = 0;
    // }

    // // Aggregate the values for internal nodes. This is normally done by the
    // // treemap layout, but not here because of our custom implementation.
    // // We also take a snapshot of the original children (_children) to avoid
    // // the children being overwritten when when layout is computed.
    // function accumulate(d) {
    //     //d.value = Math.floor((Math.random() * 2) + 1);
    //  //  d.value = 1;
    //     console.log(d);
    //     return (d._children = d.children)
    //         ? d.value = d.children.reduce(function(p, v) { 
    //             return p + accumulate(v); }, 0)
    //         : d.value;
    // }

    // // Compute the treemap layout recursively such that each group of siblings
    // // uses the same size (1×1) rather than the dimensions of the parent cell.
    // // This optimizes the layout for the current zoom state. Note that a wrapper
    // // object is created for the parent node for each group of siblings so that
    // // the parent’s dimensions are not discarded as we recurse. Since each group
    // // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // // coordinates. This lets us use a viewport to zoom.
    // function layout(d) {
    //     if (d.children) {
    //       treemap.nodes({_children: d.children});
    //       d.children.forEach(function(c) {
    //         c.x = d.x + c.x * d.dx;
    //         c.y = d.y + c.y * d.dy;
    //         c.dx *= d.dx;
    //         c.dy *= d.dy;
    //         c.parent = d;
    //         layout(c);
    //       });
    //     }
    // }

    // function display(d) {
    //     grandparent
    //         .datum(d.parent)
    //         .on("click", transition)
    //       .select("text")
    //         .text(name(d));

    //     var g1 = svgMap.insert("g", ".grandparent")
    //         .datum(d)
    //         .attr("class", "depth");

    //     var g = g1.selectAll("g")
    //         .data(d._children)
    //       .enter().append("g");

    //     g.filter(function(d) { return d._children; })
    //         .classed("children", true)
    //         .on("click", transition);

    //     g.selectAll(".child")
    //         .data(function(d) { return d._children || [d]; })
    //       .enter().append("rect")
    //         .attr("class", "child")
    //         .call(rect);

    //     g.append("rect")
    //         .attr("class", "parent")
    //         .call(rect)
    //       .append("title")
    //         .text(function(d) { 
    //           //return formatNumber(d.value); 
    //           return cleanName(d.name);
    //         });

    //     g.append("text")
    //         .attr("dy", ".75em")
    //         .text(function(d) {  return cleanName(d.name).substring(0, 10); })
    //         .call(text);

    //     function transition(d) {
    //         console.log("test");
    //       if (transitioning || !d) return;
    //       transitioning = true;

    //       var g2 = display(d),
    //           t1 = g1.transition().duration(750),
    //           t2 = g2.transition().duration(750);

    //       // Update the domain only after entering new elements.
    //       mapX.domain([d.x, d.x + d.dx]);
    //       mapY.domain([d.y, d.y + d.dy]);

    //       // Enable anti-aliasing during the transition.
    //       svgMap.style("shape-rendering", null);

    //       // Draw child nodes on top of parent nodes.
    //       svgMap.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

    //       // Fade-in entering text.
    //       g2.selectAll("text").style("fill-opacity", 0);

    //       // Transition to the new view.
    //       t1.selectAll("text").call(text).style("fill-opacity", 0);
    //       t2.selectAll("text").call(text).style("fill-opacity", 1);
    //       t1.selectAll("rect").call(rect);
    //       t2.selectAll("rect").call(rect);

    //       // Remove the old node when the transition is finished.
    //       t1.remove().each("end", function() {
    //         svgMap.style("shape-rendering", "crispEdges");
    //         transitioning = false;
    //       });
    //     }

    //     return g;
    // }

    // function text(text) {
    //     text.attr("x", function(d) { return mapX(d.x) + 6; })
    //         .attr("y", function(d) { return mapY(d.y) + 6; });
    // }

    // function rect(rect) {
    //     rect.attr("x", function(d) { return mapX(d.x); })
    //         .attr("y", function(d) { return mapY(d.y); })
    //         .attr("width", function(d) { return mapX(d.x + d.dx) - mapX(d.x); })
    //         .attr("height", function(d) { return mapY(d.y + d.dy) - mapY(d.y); });
    // }

    // function name(d) {
    //     return d.parent
    //         ? name(d.parent) + "." + cleanName(d.name)
    //         : cleanName(d.name);
    // }

    // phenoTree
    if(typeof startOffset == "undefined") {
        startOffset = 0;
    }
    if(typeof source != "undefined") {
        if(typeof drill !== "undefined") {
          if (!drill) {
            childrenNumStack.pop();
          }
        }
        var levelWidth = [1];
        var childCount = function(level, n) {
            if(n.children && n.children.length > 0) {
                if(levelWidth.length <= level + 1) levelWidth.push(0);
              
                levelWidth[level+1] += n.children.length;
                n.children.forEach(function(d) {
                   childCount(level + 1, d);
                });
            }
        };
        
        if (typeof source.children !== "undefined") {
         childCount(0, source);
         if (typeof levelWidth[1] !== "undefined") {  
            childrenNumStack.push(levelWidth[1]);
          }
        }


        var newHeight = d3.max(childrenNumStack) * (sqheight + 1);
        tree = tree.size([newHeight, treeWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(currentTreeData).reverse(),
            links = tree.links(nodes);

        nodes.forEach(function(d) {
            d.y = d.depth * (sqwidth+1) + startOffset; // final positioning
           if (d.children != null) {
                d.children.forEach(function (d, i) {
                   d.x = sqheight + i*(sqheight+1);
                });
            }
        });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("mouseover", tooltipMouseOver)
            .on("mouseout", tooltipMouseOut)
            .on("click", function(d){
                cursorData = d;
                cursorElement["element"].id = "";
                cursorElement["element"].style["stroke"] = "grey";
                this.children[0].id = "cursor";
                cursorElement = {"element":this.children[0], "location":"tree"};
                if (typeof d != "undefined") {
                    move(d);
                } 
            })
            .on("dblclick", function() {
                createPhenoBox();
            });

        nodeEnter.append("rect") // top majority of phenotype box
            .attr("y", function(d) {
                return sqspacing;
            })
            .attr("x", phenobarheight)
            .attr("width", sqwidth)
            .attr("height", sqheight)
            .attr("class", "childPheno")
            .attr("hpid", function(d){
                return d.id;
            })
            .style("fill", function(d) {
                return color(d);
            })
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            })
            .style("stroke-width", "1px")
            .style("stroke", cursor);

        nodeEnter.append("text")
            .attr("y", sqheight/2)
            .attr("x", function(d) { return d.children || d._children ? 55 : 55; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) {
              try {
               return cleanName(d.name).substring(0, 10);
              } catch (e) {
                return "Empty Pheno!";
              }
            })
            .style("fill-opacity", 1e-6)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            });

        nodeUpdate.select("rect")
            .style("stroke-width", "1px")
            .style("stroke", cursor)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            })
            .style("opacity", function(d) {
                if(cursorData.id == d.id) {
                    return 1.0;
                }

                var lineage = getLineage(cursorData);
                for(var i = 0; i < lineage.length; i++) {
                    if (d.id == lineage[i].id) {
                        return 1.0;
                    }
                }

                var children = cursorData["children"];

                if(children) {
                    for (var i = 0; i < children.length; i++) {
                        if(d.id == children[i].id) {
                            return 1.0;
                        }
                    }
                }

                if(typeof cursorData.parent == "undefined") {
                    return 1.0;
                }
                
                return 0.6;
            });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("text")
            .style("fill-opacity", 1e-6)            
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            });

        nodeExit.select("rect")
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            })
        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
}

prepData = function(d, data, row) {    
    d3.json("data.json", function(error, flare) {
        root = flare;

        var tempPheno = [cursorData];
        while(typeof tempPheno[tempPheno.length-1].parent != "undefined") {
            tempPheno.push(tempPheno[tempPheno.length-1].parent);
        }
        tempPheno.reverse();
        for(var x = 0; x < tempPheno.length; x++) {
            if(typeof root == "undefined") break // leaf node
            if(typeof root.children !== "undefined") { // stops if at leaf
                root = root.children[findWithAttr(root.children, 'id', tempPheno[x].id)];
            }
        }

        root.x0 = (row+1) * sqheight;
        root.y0 = phenobarheight + (sqwidth*(tempPheno.length-1)) + 50; 

        function collapse(d) {
            if (d.children) {
                //for(var i=0; i < d.children.length; i++) { // trying to cut out the junk ones.
                    //console.log(d.children);
                    // if (typeof d.children[i].name == "undefined") {
                    //     d.children.splice(i,1);
                    // }
               // }

                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        console.log(root);
        console.log("****");
        currentTreeData = root;
        update(currentTreeData, row, sqwidth*(tempPheno.length-1));
    });  
}


draw = function(svg, data) {
    svg.selectAll("*").remove();

    var bar = svg.selectAll("g") // the bar which will hold the phenotype boxes.
        .data(data, function(d) {
            return d.order;
        })
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + 0 + ", " + i + ")";
        });

    bar.append("rect") // top majority of phenotype box
        .attr("y", function(d) {
            return (d.order * sqheight) + sqspacing;
        })
        .attr("x", phenobarheight)
        .attr("class", "rootPheno")
        .attr("width", sqwidth)
        .attr("height", sqheight)
        .attr("hpid", function(d) {
            return d.id;
        })
        .style("fill", color)
        .on("click", function(d) {
            treeActive = true;
            activerow = d.order-1;
            cursorData = d;
            if (cursorElement != null) {
                cursorElement["element"].id = "";
            }

            this.id = "cursor";
            cursorElement = {"element":this, "location":"list"};

            var rootPhenos = d3.selectAll(".rootPheno"); // CSS adjustments
            for(var i = 0; i < rootPhenos[0].length; i++) {
               rootPhenos[0][i].style["stroke"] = "";
               rootPhenos[0][i].style["opacity"] = 0.6;
            }
            this.style["stroke"] = "black";
            this.style["opacity"] = 1.0;

            var childPhenos = d3.selectAll(".childPheno"); // CSS adjustments
            for(var i = 0; i < childPhenos[0].length; i++) {
                childPhenos[0][i].style["opacity"] = 0;
                childPhenos[0][i].nextSibling.style["opacity"] = 0;
            }
            prepData(d, data, activerow);
        })
        .on("contextmenu", function(d){
            d3.event.preventDefault();   
        })
        .on("mouseover", function(d) { // tool tip  
            tooltipMouseOver(d);
        })
        .on("mouseout", function(d) {
            tooltipMouseOut(d);
        });

    bar.append("text") // phenotype name
        .attr("y", function(d) {
            return ((d.order * sqheight) + sqheight / 2) + 1;
        })
        .attr("x", sqwidth - 15) // hardcoded until better option is found
        .attr("dy", ".35em")
        .style("font-size", function(d) {
            return 0.15 * sqwidth + "px";
        })
        .style("text-anchor", "middle")
        .attr("pointer-events", "none")
        .text(function(d) {
            return cleanName(d.name).substring(0, 10);
        });

    // attempt to create children boxes.
    var locData = data;
    for(var row = 0; row < locData.length; row++) {
        if (locData[row].children.length > 0) {
            var barChildren = svg.selectAll(locData[row].name) // the bar which will hold the phenotype boxes.
                .data(locData[row].children)
                .enter().append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + 0 + ", " + 0 + ")";
                });

            for(var count = 0; count < locData[row].children.length; count++) {
                var tempName = locData[row].children[count].name;

                barChildren.append("rect") // top majority of phenotype box
                    .attr("y", function(d) {
                        return ((locData[row].order) * (sqheight+sqspacing));
                    })
                    .attr("x", function(d) {
                        return (sqwidth*(count+1) + 21 + (count));
                    })
                    .attr("width", sqwidth)
                    .attr("height", sqheight)
                    .attr("id", count)
                    .attr("class", "childPheno")
                    .attr("row", row)
                    .attr("hpid", function(d) {
                        return d.id;
                    })
                    .style("fill", color)
                    .style("stroke-width", "1px")
                    .style("stroke", cursor)
                    .on("click", function(d) { // for now as the mouseover issues need to be addressed
                        // treeActive = true;
                        // var tempColumn = d3.select(this).attr("id");
                        // var tempRow = d3.select(this).attr("row"); 
                        // cursorData = d;

                        // if (cursorElement != null) {
                        //     cursorElement["element"].id = "";
                        // }
                        // this.id = "cursor";
                        // cursorElement = {"element":this, "location":"list"};

                        // var rootPhenos = d3.selectAll(".rootPheno"); // CSS adjustments
                        // for(var i = 0; i < rootPhenos[0].length; i++) {
                        //    rootPhenos[0][i].style["stroke"] = "";
                        //    rootPhenos[0][i].style["opacity"] = 0.6;
                        // }

                        // var childPhenos = d3.selectAll(".childPheno"); // CSS adjustments
                        // for(var i = 0; i < childPhenos[0].length; i++) {
                        //     childPhenos[0][i].style["opacity"] = 0;
                        //     childPhenos[0][i].nextSibling.style["opacity"] = 0;
                        // }

                        // this.style["stroke"] = "grey";
                        // this.style["opacity"] = 1.0;
                        // this.nextSibling.style["opacity"] = 1.0;

                        // pheno = data[tempRow].children[tempColumn];
                        // prepData(pheno, data, tempRow);
                    })
                    .on("contextmenu", function(d){
                        d3.event.preventDefault();  
                        var tempColumn = d3.select(this).attr("id");
                        var tempRow = d3.select(this).attr("row");
                        removeChild(tempRow, tempColumn);
                    })
                    .on("mouseover", function(d) { // tool tip 
                        var tempColumn = d3.select(this).attr("id");
                        var tempName = "";
                        var tempRow = d3.select(this).attr("row");
                        if(typeof data[tempRow] !== "undefined" &&
                           typeof data[tempRow].children[tempColumn] !== "undefined") {
                            tempName = data[tempRow].children[tempColumn]/*.name*/;
                        }

                        div.transition()
                            .duration(200)
                            .style("opacity", 10);
                        div.html("<h3>" + generateBreadCrumb(tempName) + "</h3><br/>") // issue only remembers last name
                            .style("left", 100 + "px") // horizontal
                            .style("top", 50 + "px"); // vertical
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                barChildren.append("text") // phenotype name
                    .attr("y", function(d) {
                        return ((locData[row].order) * (sqheight + sqspacing) + sqheight / 2) + 1;
                    })
                    .attr("x", 51*(count+1) + 75 + (count*20)) // hardcoded until better option is found
                    .attr("dy", ".35em")
                    .style("font-size", function(d) {
                        return 0.15 * sqwidth + "px";
                    })
                    .style("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(function(d) {
                        return cleanName(locData[row].children[count].name).substring(0, 10);
                    });
            }
        }
    }
}


draw(svg, data);