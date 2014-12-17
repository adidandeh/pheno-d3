var activerow = -1,
    barStack = [],
    dropbuttonwidth = 15,
    dropactive = false,
    duration = 500,
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
    treeHeight = treeWidth,
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
findWithAttr = function(array, attr, value, ignoreCase) {
    if(ignoreCase) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][attr].ignoreCase === value.ignoreCase) {
                return i;
            }
        }   
    } else {
        for (var i = 0; i < array.length; i++) {
            if (array[i][attr] === value) {
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
    // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse(),
        links = tree.links(nodes);
    // Normalize for fixed-depth.

    nodes.forEach(function(d) { // TODO: Swap?
        d.y = d.depth * treeWidth + getMaxChildren()*(sqwidth+sqspacing) + 300; // horizontal
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
        .on("mouseover", tooltopMouseOver)
        .on("mouseout", tooltopMouseOut);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        })   
        .on("mouseout", click)
        .on("click", checkmarkClick);

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
        .on("click", click);

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

tooltopMouseOver = function(d) { 
    div.transition()
        .duration(200)
        .style("opacity", 10);
    div.html("<h3>" + d.name + "</h3><br/>")
        .style("left", (d3.event.pageX - 0) + "px")
        .style("top", (d3.event.pageY - 100) + "px");
}

tooltopMouseOut = function(d) {
    div.transition()
        .duration(1000)
        .style("opacity", 0);
}

checkmarkClick = function(d) {
    data[activerow-1].children.push(d);
    draw(svg, data);
}

// Toggle children on click.
click = function(d) {
    if (d.children) { // Going back a step
        var tempRoot;
        do {
            tempRoot = barStack.pop();
        } while (tempRoot != d);
        d._children = d.children;
        d.children = null;
        update(barStack[barStack.length - 1]); // required to go back into tree
    } else { // opening the nodes below
        if (barStack[barStack.length - 1] !== d || barStack.length == 1) { // stopping same node from being repeat added.
            barStack.push(d);
            d.children = d._children;
            d._children = null;
        }
      update(d); // required to delve further into tree.
    }
}

getRowOrder = function(d, data, root) {
    for(var i = 0; i < data.length; i++) {
        if(root) {
            if (findWithAttr(data[i], 'name', d.name)) {
                return data[i].order;
            }
        } else {
            if (findWithAttr(data[i].children, 'name', d.name)) {
                return data[i].order;
            }
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
    d3.json("data.json", function(error, flare) {
        root = flare;

        if(typeof d.parent !== "undefined") {
            var currentPheno = d;
            var tempLineageStack = [currentPheno.name];

            while (typeof currentPheno.parent !== "undefined") {
                tempLineageStack.push(currentPheno.parent.name);
                currentPheno = currentPheno.parent;
            }

            var tempPhenoRoot = data[findWithAttr(data, 'name', 
                tempLineageStack[tempLineageStack.length-1], true)];

            // issue, always 50 b/c findWithAttr always returns 0. Matching issue.
            var temp0x = tempPhenoRoot.order * sqwidth; 

            while(tempLineageStack.length > 0) {
                root = root.children[findWithAttr(root.children, 'name', tempLineageStack.pop(), false)];
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

        root.y0 = phenobarheight + sqheight - dropbuttonwidth;

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        priorPheno = root;
        barStack.push(root);
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
        .on("mouseover", function(d) { // tool tip  
            div.transition()
                .duration(200)
                .style("opacity", 10);
            div.html("<h3>" + d.name + "</h3><br/>")
                .style("left", (d3.event.pageX - 0) + "px")
                .style("top", (d3.event.pageY - 100) + "px");

            activerow = d.order;
            prepData(d, data);
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", 0);
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
                    .attr("class", "child")
                    .style("fill", "#49B649")
                    .on("mouseover", function(d) { // tool tip 
                        div.transition()
                            .duration(200)
                            .style("opacity", 10);
                        div.html("<h3>" + d.name + "</h3><br/>") // issue only remembers last name
                            .style("left", (d3.event.pageX - 0) + "px")
                            .style("top", (d3.event.pageY - 100) + "px");

                        activerow = d.order;
                        prepData(d, data);
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