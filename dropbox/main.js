/* 

#98DDD3
#E2B8CC
#A3E0A4
#D5D481
#C6D2D7
#EDAA84

*/

var activerow = -1,
    pastlineage = [], /* diff between pastlineage and barStack is that 
    barstack deals with local lineage during phenotree and past lineage 
    is grabbed from it's parent's lineage. */
    childrenNumStack = [1];
    currentTreeData = {},
    cursorPheno = "",
    cursorData = null,
    colorArr = ["#98DDD3",
                "#E2B8CC",
                "#A3E0A4",
                "#D5D481",
                "#C6D2D7",
                "#EDAA84"],
    dropbuttonwidth = 15,
    duration = 400,
    depth = 0;
    drill = undefined;
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

// UNUSED/DEAD FUNCTIONS

// helper func
// getNumOfActivePheno = function() {
//     var count = 0;
//     for (var i = 0, l = data.length; i < l; i++) {
//         if (data[i].active == 1) {
//             count++;
//         }
//     }
//     return count;
// };

// getRowOrder = function(d, data) {
//     for(var i = 0; i < data.length; i++) {
//         if(d.id == data[i].id) {
//                 return data[i].order;
//         }
//     }
//     return -1;
// }

// getPhenoParentRoot = function(d) {
//     if(typeof d.parent !== "undefined") {
//         var currentPheno = d;
//         var tempLineageStack = [currentPheno];

//         while (typeof currentPheno.parent !== "undefined") {
//             tempLineageStack.push(currentPheno.parent);
//             currentPheno = currentPheno.parent;
//         }
//         return tempLineageStack.pop();
//     } else { 
//         return null;
//     }
// }

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

createPhenoBox = function(d) { // use cursorData parent chain-up
    // if(typeof data[activerow] == "undefined" || typeof d.id == "undefined") {
    //     console.log("Error in createPhenoBox!");
    // } else if (typeof findWithAttr(data[activerow].children, "id", d.id) == "undefined") {
    //     d["lineage"] = pastlineage.concat(barStack);
    //     data[activerow].children.push(d);
    // }
    // barStack = [];
    // pastlineage = [];
    // draw(svg, data);
}


findWithAttr = function(array, attr, value) {
    for (var i = 0; i < array.length; i++) {
        if (typeof array[i][attr] !== "undefined") {
            if (array[i][attr].toUpperCase() === value.toUpperCase()) {
                return i;
            }
        }
    }       
}


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
function collapse(d) {
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
    div.transition()
        .duration(200)
        .style("opacity", 10);
    div.html("<h3>" + generateBreadCrumb(d) /*d.name*/ + "</h3><br/>")
        .style("left", /*(d3.event.pageX + 10)*/ 100 + "px") // horizontal
        .style("top", /*(d3.event.pageY - 20)*/ 50 + "px"); // vertical
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
update = function(source, row) {
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
        // Normalize for fixed-depth.
        nodes.forEach(function(d) { // TODO: Change based odd number of nodes.
           // d.y = d.depth * (sqwidth+1) + 70; // final positioning
            d.y = d.depth * (sqwidth+1) +150; // dev
            
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
                if (typeof d != "undefined") {
                    move(d);
                } 
            });

        nodeEnter.append("rect") // top majority of phenotype box
            .attr("y", function(d) {
                return (/*d.order * sqheight*/0) + sqspacing;
            })
            .attr("x", phenobarheight)
            .attr("width", sqwidth)
            .attr("height", sqheight)
            .style("fill", function(d) {
                return color(d);
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
        .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        nodeUpdate.select("rect")
                        .style("stroke-width", "1px")
            .style("stroke", cursor);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

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
   pastlineage = [];
    d3.json("data.json", function(error, flare) {
        root = flare;
       pastlineage = d["lineage"];
        if (typeof pastlineage == "undefined") {
            pastlineage = [];
        }

       var tempLineage = pastlineage.concat(d);
        for(var x = 0; x < tempLineage.length; x++) {
            if(typeof root == "undefined") break // leaf node
            if(typeof root.children !== "undefined") { // stops if at leaf
                root = root.children[findWithAttr(root.children, 'id', tempLineage[x].id, false)];
            }
        }

        root.x0 = 200;
        root.y0 = phenobarheight + sqheight - dropbuttonwidth; 

        function collapse(d) {
            if (d.children) {
                // for(var i=0; i < d.children.length; i++) { // trying to cut out the junk ones.
                //     if (typeof d.children[i].name == "undefined") {
                //         d.children.splice(i,1);
                //     }
                // }

                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        currentTreeData = root;
        update(currentTreeData, row);
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
            return "translate(" + sqwidth + ", " + i + ")";
        });

    bar.append("rect") // top majority of phenotype box
        .attr("y", function(d) {
            return (d.order * sqheight) + sqspacing;
        })
        .attr("x", phenobarheight)
        .attr("width", sqwidth)
        .attr("height", sqheight)
        .style("fill", color)
        .style("stroke-width", "1px")
        .style("stroke", cursor)
        .on("click", function(d) { // for now as the mouseover issues need to be addressed
            activerow = d.order-1;
            cursorData = d;
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
                    return "translate(" + sqwidth + ", " + 0 + ")";
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
                    .attr("class", row)
                    .style("fill", color)
                    .style("stroke-width", "1px")
                    .style("stroke", cursor)
                    .on("click", function(d) { // for now as the mouseover issues need to be addressed
                        var tempColumn = d3.select(this).attr("id");
                        var tempRow = d3.select(this).attr("class"); 
                        cursorData = d;
                        pheno = data[tempRow].children[tempColumn];
                        prepData(pheno, data, tempRow);
                    })
                    .on("contextmenu", function(d){
                        d3.event.preventDefault();  
                        var tempColumn = d3.select(this).attr("id");
                        var tempRow = d3.select(this).attr("class");
                        removeChild(tempRow, tempColumn);
                    })
                    .on("mouseover", function(d) { // tool tip 
                        var tempColumn = d3.select(this).attr("id");
                        var tempName = "";
                        var tempRow = d3.select(this).attr("class");
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