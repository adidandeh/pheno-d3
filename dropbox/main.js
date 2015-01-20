/* 

#98DDD3
#E2B8CC
#A3E0A4
#D5D481
#C6D2D7
#EDAA84

*/

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
    } catch (e) {}

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
            d.y = d.depth * (sqwidth+1) + startOffset + 70; // final positioning
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
            return "translate(" + sqwidth + ", " + i + ")";
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