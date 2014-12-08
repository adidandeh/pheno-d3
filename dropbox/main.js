var barStack = [],
    dropbuttonheight = 15,
    dropactive = false,
    duration = 300,
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
    sqheight = sqwidth,
    sqspacing = 0,
    treeWidth = 200,
    treeHeight = treeWidth,
    height = 500 - margin.top - margin.bottom,
    width = 2060 - margin.right - margin.left;

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
        if (array[i][attr] === value) {
            return i;
        }
    }
}

update = function(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
        d.y = d.depth * treeWidth + 200;
        d.x += 120;
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
        .on("click", click);


    nodeEnter.append("line") // -- \ in \/ of checkmark
        .attr("x1", 10)
        .attr("y1", 0)
        .attr("x2", 15)
        .attr("y2", 5)
        .style("stroke", "green")
        .style("stroke-width", 3)
        .on("click", checkmarkClick);

    nodeEnter.append("line") // -- / in \/ of checkmark
        .attr("x1", 14)
        .attr("y1", 5)
        .attr("x2", 25)
        .attr("y2", -8)
        .style("stroke", "green")
        .style("stroke-width", 3)
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
    // add this pheno to box listing.
    // refresh drawing. 
    // make sure to have the drawing mech read from updated box listing
    //   and dynamically generate the box structure.
    // will also have to have the tree structure dynamically place based
    //   off available vertical space.
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

prepData = function(d) {
    d3.json("data.json", function(error, flare) {
        root = flare;

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
        root.y0 = phenobarheight + sqheight - dropbuttonheight;

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
        .attr("transform",
            function(d, i) {
                return "translate(" + i + ", " + sqheight + ")";
            });

    bar.append("rect") // top majority of phenotype box
    .attr("x", function(d) {
        return (d.order * sqwidth);
    })
        .attr("y", phenobarheight)
        .attr("width", sqwidth)
        .attr("height", sqheight)
        .attr("class", "inactive, top")
        .style("fill", function(d) {
            if (d.active == 1) {
                return "#49B649";
            } else {
                return "#E35C5C";
            }
        })
        .on("click", function(d) {
            var rec = d3.select(this); // clicked rec
            var removedArr = data.splice(findWithAttr(data, 'name', d.name), 1);

            // toggle color between two choices
            if (rec.style("fill") == "rgb(227, 92, 92)") {
                rec.style("fill", "#49B649");
                rec.attr("class", "top, active");
                var numOfActivePheno = getNumOfActivePheno();

                // reorder pheno data list
                // make sure that the new pheno isn't already in the proper place.
                if (removedArr[0].order != numOfActivePheno + 1) {
                    data.forEach(function(pheno) { // if it isn't, bump the order of all the right obj elems
                        if (pheno.order < removedArr[0].order + 1 && pheno.active == 0) {
                            pheno.order++;
                        }
                    });
                }
                removedArr[0].active = 1; // adjust the pheno object for insertion
                removedArr[0].order = numOfActivePheno + 1;
                data.splice(numOfActivePheno, 0, removedArr[0]); // push the changed pheno into the data list at new place.
            } else {
                rec.style("fill", "#E35C5C");
                rec.attr("class", "top, inactive");

                // get number of phenos still active
                var numOfActivePheno = getNumOfActivePheno();

                if (removedArr[0].order != numOfActivePheno + 1) {
                    data.forEach(function(pheno) {
                        if (pheno.order > removedArr[0].order && pheno.active == 1) {
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
        .on("mouseover", function(d) { // tool tip   
            div.transition()
                .duration(200)
                .style("opacity", 10);
            div.html("<h3>" + d.name + "</h3><br/>")
                .style("left", (d3.event.pageX - 0) + "px")
                .style("top", (d3.event.pageY - 100) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(1000)
                .style("opacity", 0);
        });

    bar.append("rect") // drop down button for each pheno
    .attr("x", function(d) {
        return (d.order * sqwidth);
    })
        .attr("y", phenobarheight + sqheight - dropbuttonheight)
        .attr("width", sqwidth)
        .attr("height", dropbuttonheight)
        .attr("class", "drop, inactive")
        .attr("style", "fill: transparent")
        .on("click", function(d) {
            if (d.active == 1) {
                var pheno = d3.select(this); // pheno is the drop button
                if (pheno.attr("class") == "drop, inactive" && !dropactive) {
                    pheno.attr("class", "drop, active");
                    dropactive = true;
                    prepData(d);
                } else if (pheno.attr("class") == "drop, inactive" && dropactive) {
                    // another is active, but we want this one
                    prepData(d);
                } else {
                    dropactive = false;
                    pheno.attr("class", "drop, inactive");
                    draw(svg, data);
                }
            }
        });

    bar.append("line") // -- \ in \/
    .attr("x1", function(d) {
        return d.order * (sqwidth + sqspacing) + 10;
    })
        .attr("y1", phenobarheight + 40)
        .attr("x2", function(d) {
            return d.order * (sqwidth + sqspacing) + 25;
        })
        .attr("y2", phenobarheight + 45)
        .style("stroke", "black")
        .style("stroke-width", 1);

    bar.append("line") // -- / in \/
    .attr("x1", function(d) {
        return d.order * (sqwidth + sqspacing) + 40;
    })
        .attr("y1", phenobarheight + 40)
        .attr("x2", function(d) {
            return d.order * (sqwidth + sqspacing) + 25;
        })
        .attr("y2", phenobarheight + 45)
        .style("stroke", "black")
        .style("stroke-width", 1);

    bar.append("text") // phenotype name
    .attr("x", function(d) {
        return (d.order * (sqwidth + sqspacing) + sqwidth / 2);
    })
        .attr("y", sqheight - 7) // hardcoded until better option is found
    .attr("dy", ".35em")
        .style("font-size", function(d) {
            return Math.min(0.3 * sqwidth, (2 * sqwidth - 8) / this.getComputedTextLength() * 20) + "px";
        })
        .style("text-anchor", "middle")
        .attr("pointer-events", "none")
        .text(function(d) {
            return d.name.substring(0, 5);
        });
}

draw(svg, data);