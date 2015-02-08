update = function(source, row, startOffset) {
    // treeMap
    d3.select("#chart").selectAll("div").remove();

    var treediv = d3.select("#chart").append("div")
        .style("position", "relative")
        .style("width", (mapWidth + mapMargin.left + mapMargin.right) + "px")
        .style("height", (mapHeight + mapMargin.top + mapMargin.bottom) + "px")
        .style("left", mapMargin.left + "px")
        .style("top", mapMargin.top + verticalPadding + "px")
        .attr("id", "treeMapHeader")
        .text(function(d) {
            return cursorData.name.toUpperCase();
        });

    var treenode = treediv.datum(source).selectAll(".treenode")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "treenode")
        .call(position)
        .style("background", function(d) {
            return d.children ? color(d.name) : null;
        })
        .text(function(d) {
            return d._children ? d.name : null;
        });

    function position() {
        this.style("left", function(d) {
            return d.x + "px";
        })
            .style("top", function(d) {
                return d.y + 20 + "px";
            })
            .style("width", function(d) {
                return Math.max(0, d.dx - 1) + "px";
            })
            .style("height", function(d) {
                return Math.max(0, d.dy - 1) + "px";
            });
    }

    // phenoTree
    if (typeof startOffset == "undefined") {
        startOffset = 0;
    }
    if (typeof source != "undefined") {
        if (typeof drill !== "undefined") {
            if (!drill) {
                childrenNumStack.pop();
            }
        }
        var levelWidth = [1];
        var childCount = function(level, n) {
            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
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

            d.y = d.depth * (sqwidth + 1) + startOffset + horizontalPadding - 20; // final positioning
            if (d.children != null) {
                d.children.forEach(function(d, i) {
                    d.x = sqheight + i * (sqheight + sqspacing) + verticalPadding;
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
            .on("click", function(d) {
                cursorData = d;
                cursorElement["element"].id = "";
                cursorElement["element"].style["stroke"] = "grey";
                this.children[0].id = "cursor";
                cursorElement = {
                    "element": this.children[0],
                    "location": "tree"
                };
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
            .attr("hpid", function(d) {
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
            .attr("y", sqheight / 2)
            .attr("x", function(d) {
                return d.children || d._children ? 55 : 55;
            })
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
                if (cursorData.id == d.id) {
                    return 1.0;
                }

                var lineage = getLineage(cursorData);
                for (var i = 0; i < lineage.length; i++) {
                    if (d.id == lineage[i].id) {
                        return 1.0;
                    }
                }

                var children = cursorData["children"];

                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        if (d.id == children[i].id) {
                            return 1.0;
                        }
                    }
                }

                if (typeof cursorData.parent == "undefined") {
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
        return (d.order * sqheight) + sqspacing + verticalPadding;
    })
        .attr("x", horizontalPadding)
        .attr("class", "rootPheno")
        .attr("width", sqwidth)
        .attr("height", sqheight)
        .attr("hpid", function(d) {
            return d.id;
        })
        .style("fill", color)
        .on("click", function(d) {
            treeActive = true;
            activerow = d.order - 1;
            cursorData = d;
            if (cursorElement != null) {
                cursorElement["element"].id = "";
            }

            this.id = "cursor";
            cursorElement = {
                "element": this,
                "location": "list"
            };

            var rootPhenos = d3.selectAll(".rootPheno"); // CSS adjustments
            for (var i = 0; i < rootPhenos[0].length; i++) {
                rootPhenos[0][i].style["stroke"] = "";
                rootPhenos[0][i].style["opacity"] = 0.6;
            }
            this.style["stroke"] = "black";
            this.style["opacity"] = 1.0;

            var childPhenos = d3.selectAll(".childPheno"); // CSS adjustments
            for (var i = 0; i < childPhenos[0].length; i++) {
                childPhenos[0][i].style["opacity"] = 0;
                childPhenos[0][i].nextSibling.style["opacity"] = 0;
            }
            prepData(d, data, activerow);
        })
        .on("contextmenu", function(d) {
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
        return ((d.order * sqheight) + sqheight / 2) + sqspacing + verticalPadding;
    })
        .attr("x", horizontalPadding + 35) // hardcoded until better option is found
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
    for (var row = 0; row < locData.length; row++) {
        if (locData[row].children.length > 0) {
            var barChildren = svg.selectAll(locData[row].name) // the bar which will hold the phenotype boxes.
                .data(locData[row].children)
                .enter().append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + 0 + ", " + 0 + ")";
                });

            for (var count = 0; count < locData[row].children.length; count++) {
                var tempName = locData[row].children[count].name;

                barChildren.append("rect") // top majority of phenotype box
                .attr("y", function(d) {
                    return (locData[row].order * (sqheight + sqspacing)) + verticalPadding;
                })
                    .attr("x", function(d) {
                        return ((1 + sqwidth) * (count + sqspacing) + horizontalPadding);
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
                    .on("contextmenu", function(d) {
                        d3.event.preventDefault();
                        var tempColumn = d3.select(this).attr("id");
                        var tempRow = d3.select(this).attr("row");
                        removeChild(tempRow, tempColumn);
                    })
                    .on("mouseover", function(d) { // tool tip 
                        var tempColumn = d3.select(this).attr("id");
                        var tempName = "";
                        var tempRow = d3.select(this).attr("row");
                        if (typeof data[tempRow] !== "undefined" &&
                            typeof data[tempRow].children[tempColumn] !== "undefined") {
                            tempName = data[tempRow].children[tempColumn] /*.name*/ ;
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
                    return ((locData[row].order) * (sqheight + sqspacing) + sqheight / 2) + sqspacing + verticalPadding;
                })
                    .attr("x", 51 * (count + 1) + horizontalPadding + 55 + (count * 20)) // hardcoded until better option is found
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