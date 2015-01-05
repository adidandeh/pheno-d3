var activerow = -1,
    pastlineage = [], // diff between pastlineage and barStack is that
    barStack = [],      // barstack deals with local lineage during phenotree
    clickedNode = false, // and past lineage is grabbed from it's parent's lineage.
    dropbuttonwidth = 15,
    dropactive = false,
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
    sqwidth = 50,
    sqheight = sqwidth/2,
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
    .attr("height", height); // TODO: Dynamic height adjustment.

var div = d3.select("body").append("div")
    .attr("class", "tooltip");

// helper func
getNumOfActivePheno = function() {
    var count = 0;
    for (var i = 0, l = data.length; i < l; i++) {
        if (data[i].active == 1) {
            count++;
        }
    }
    return count;
};

//helper func
findWithAttr = function(array, attr, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][attr].toUpperCase() === value.toUpperCase()) {
            return i;
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

update = function(source) {
    if(typeof source != "undefined") {
        // dynamic tree height
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
        
        childCount(0, source);  

        var newHeight = d3.max(levelWidth) * 20; // 20 pixels per line  
        tree = tree.size([newHeight, treeWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(source).reverse(),
            links = tree.links(nodes);
        // Normalize for fixed-depth.

        nodes.forEach(function(d) { // TODO: Swap?
            d.y = d.depth * treeWidth + getMaxChildren()*(sqwidth+sqspacing) + 350; // horizontal
            d.x += maxBoxHeight + getMaxChildren()*(sqheight+sqspacing) + 20; // vertical height
        }); // How wide it gets

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
            .on("mouseout", tooltipMouseOut);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            })   
            .on("mouseout", function(d) {
                if(!clickedNode) {
                    if (typeof d != "undefined") {
                        move(d);
                    } 
                } else {
                    clickedNode = false;
                }
            })
            .on("click", function(d){
                clickedNode = true;
                createPhenoBox(d);
            });

        nodeEnter.append("text")
            .attr("class", "boxtext")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                var name = d.name;
                return cleanName(name);
            })
            .style("font-size", "10pt")
            .style("fill-opacity", 1e-6) // svg style
            .on("click", move);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
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

tooltipMouseOver = function(d) { 
    div.transition()
        .duration(200)
        .style("opacity", 10);
    div.html("<h3>" + d.name + "</h3><br/>")
        .style("left", (d3.event.pageX - 0) + "px")
        .style("top", (d3.event.pageY - 100) + "px");
}

tooltipMouseOut = function(d) {
    div.transition()
        .duration(1000)
        .style("opacity", 0);
}

createPhenoBox = function(d) {
    // console.log(d);
    // console.log("///// Entering createPhenoBox");
    if(typeof data[activerow] == "undefined" || typeof d.name == "undefined") {
        // end node and other errors
    } else if (typeof findWithAttr(data[activerow].children, "id", d.id) == "undefined") {
        // console.log("pastlineage");
        // console.log(pastlineage);
        // console.log("barStack");
        // console.log(barStack);

        d["lineage"] = pastlineage.concat(barStack);
        data[activerow].children.push(d);
        // console.log("//// Done createPhenoBox\n");
    }
    barStack = [];
    pastlineage = [];
    draw(svg, data);
}

removeChild = function(row, column) {
    data[row].children.splice(column, 1);
    draw(svg, data);
}

// Toggle children on click.
move = function(d) {
    if (d.children) { // Going back a step
        var tempRoot;
        do {
            tempRoot = barStack.pop();
        } while (tempRoot != d);
        d._children = d.children;
        d.children = null;

        if(typeof d != "undefined") {
            update(barStack[barStack.length - 1]); // required to go back into tree
        }
    } else if(typeof d._children != "undefined") {
        if(d._children.length > 1) { // opening the nodes below, don't open children endnodes
            if (barStack[barStack.length - 1] !== d || barStack.length == 1) { // stopping same node from being repeat added.
                barStack.push(d);
                d.children = d._children;
                d._children = null;
            }
            update(d); // required to delve further into tree.
        }
    }
}

getRowOrder = function(d, data) {
    for(var i = 0; i < data.length; i++) {
        if(d.id == data[i].id) {
                return data[i].order;
        }
    }
    return -1;
}

getPhenoParentRoot = function(d) {
    if(typeof d.parent !== "undefined") {
        var currentPheno = d;
        var tempLineageStack = [currentPheno];

        while (typeof currentPheno.parent !== "undefined") {
            tempLineageStack.push(currentPheno.parent);
            currentPheno = currentPheno.parent;
        }
        return tempLineageStack.pop();
    } else { 
        return null;
    }
}

prepData = function(d, data) {
    // console.log("/// Entering prepData");
    // console.log("data:");
    // console.log(data);
    barStack = [];
    pastlineage = [];
    d3.json("data.json", function(error, flare) {
        root = flare;
        if(typeof d.parent !== "undefined") { // TODO Rewrite as errors finding root location
            var currentPheno = d;
            pastlineage = currentPheno["lineage"];
            var tempLineage = pastlineage.concat(currentPheno);
            // console.log("LOLOL");
            // console.log(tempLineage);
            // root.children[findWithAttr(root.children, 'name', data[activerow].name, false)]

            for(var x = 0; x < tempLineage.length; x++) {
                // console.log("tempLineage:");
                // console.log(tempLineage);
                // console.log("Prior Root:");
                // console.log(root);
                if(typeof root.children !== "undefined") { // stops if at leaf
                    root = root.children[findWithAttr(root.children, 'name', tempLineage[x].name, false)];
                }
                // console.log("Post Root:");
                // console.log(root);
            }

            root.x0 = 200; // TODO non-dynamic.
        } else {
            var children = root.children;
            var child = null;
            children.forEach(function(element) {
                var tempchildname = element.name.toLowerCase();
                if (tempchildname.indexOf(d.name.toLowerCase()) > -1) {
                    child = element;
                    return;
                }
            });

            root = child;
            root.x0 = d.order * sqwidth;
        }

          //  root.y0 =(activerow+1) * (sqheight + sqspacing);
        root.y0 = phenobarheight + sqheight - dropbuttonwidth; 

        function collapse(d) {
            if (d.children) {
                for(var i=0; i < d.children.length; i++) {
                    if (typeof d.children[i].name == "undefined") {
                        d.children.splice(i,1);
                    }
                }

                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        priorPheno = root;
        barStack.push(root);

        // console.log("/// Leaving prepData\n");
        update(root);
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
        .style("fill", function(d) {
            return "#49B649";
        })
        .on("click", function(d) { // for now as the mouseover issues need to be addressed
            activerow = d.order-1;
            prepData(d, data);
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
            return (d.order * (sqheight) + sqheight / 2) + 1;
        })
        .attr("x", sqwidth - 7) // hardcoded until better option is found
        .attr("dy", ".35em")
        .style("font-size", function(d) {
            return Math.min(0.25 * sqwidth, (2 * sqwidth - 8) / this.getComputedTextLength() * 20) + "px";
        })
        .style("text-anchor", "middle")
        .attr("pointer-events", "none")
        .text(function(d) {
            return cleanName(d.name).substring(0, 5);
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
                        return (51*(count+sqspacing) + 20);
                    })
                    .attr("width", sqwidth)
                    .attr("height", sqheight)
                    .attr("id", count)
                    .attr("class", row)
                    .style("fill", "#49B649")
                    .on("click", function(d) { // for now as the mouseover issues need to be addressed
                        activerow = d3.select(this).attr("class"); 
                        prepData(d, data);
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

                        if(typeof data[activerow] !== "undefined" &&
                           typeof data[activerow].children[tempColumn] !== "undefined") {
                            tempName = data[activerow].children[tempColumn].name;
                        }

                        div.transition()
                            .duration(200)
                            .style("opacity", 10);
                        div.html("<h3>" + tempName + "</h3><br/>") // issue only remembers last name
                            .style("left", (d3.event.pageX - 0) + "px")
                            .style("top", (d3.event.pageY - 100) + "px");
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
                    .attr("x", 51*(count+1) + 42) // hardcoded until better option is found
                    .attr("dy", ".35em")
                    .style("font-size", function(d) {
                        return Math.min(0.25 * sqwidth, (2 * sqwidth - 8) / this.getComputedTextLength() * 20) + "px";
                    })
                    .style("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(function(d) {
                        return cleanName(locData[row].children[count].name).substring(0, 5);
                    });
            }
        }
    }
}

draw(svg, data);