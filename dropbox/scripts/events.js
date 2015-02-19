function node_onMouseOver(d,type) {
    if (type=="DOC") {
        if(d.depth < 2) return;
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");
        tempHeight = 140;
        header1.text(d.medline_journal_title);
        header.text(d.medline_article_title);
        // header2.text("Year Published: " + d.medline_pub_year);
        tempPheno = "";

        if(typeof d.phenotypes != "undefined") {
            d.phenotypes.forEach(function(p) {
                tempPheno += p + ", ";
            });
        } else {
            tempPheno = "No phenotypes found."
        }

        header2.text("phenotypes: " + tempPheno);
        toolTip.style("left", (d3.event.pageX+15) + "px")
            .style("top", (d3.event.pageY-75) + "px")
            .style("height", function() {
                if (d.medline_article_title.length > 25*2) {
                    tempHeight += (d.medline_article_title.length/31*20);
                } 

                if (d.medline_journal_title.length > 30) {
                    tempHeight += (d.medline_journal_title.length/30*10)
                }
                return tempHeight + "px";
            });

        highlightLinks(documentsById["documents_"+d.id],true,type);
    } 
    else if (type=="LINKHEAD") {
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");
        header1.text(d.pheno.name);
        header.text("Document: " + d.doc.medline_article_title);
        header2.text(d.pheno.defn);

        toolTip.style("left", (d3.event.pageX+15) + "px")
            .style("top", (d3.event.pageY-75) + "px")
            .style("height",200+"px");
        // log(d);
        highlightLink(d,true);
    }
    else if (type=="LINK") {
        /*
        Highlight chord stroke
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");
        header1.text(d.pheno.name);
        header.text("Document: " + d.doc.medline_article_title);
        header2.text(d.pheno.defn);

        toolTip.style("left", (d3.event.pageX+15) + "px")
            .style("top", (d3.event.pageY-75) + "px")
            .style("height",200+"px");
        // log(d);
        highlightLink(d,true);
    }
    else if (type=="ROOT") {
        /*
        highlight all contributions and all candidates
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");
        header1.text("Phenotype Root");
        header.text(phenotypeRootsById["phenotypeRoot_" + d.label].name);
        header2.text("Number of Children: " + phenotypeRootsById["phenotypeRoot_" + d.label].children.length);
        toolTip.style("left", (d3.event.pageX+15) + "px")
            .style("top", (d3.event.pageY-75) + "px")
            .style("height","110px");
        highlightLinks(chordsById[d.label],true,type);
    }
}

function node_onMouseOut(d,type) {
    if (type=="DOC") {
        highlightLinks(documentsById["documents_"+d.id],false,type);
    }
    else if (type=="LINKHEAD") {
        highlightLink(d,false);
    }
    else if (type=="LINK") {
        highlightLink(d,false);
    }
    else if (type=="ROOT") {
        highlightLinks(chordsById[d.label],false,type);
    }

    toolTip.transition()                                    // declare the transition properties to fade-out the div
        .duration(500)                                  // it shall take 500ms
        .style("opacity", "0");                         // and go all the way to an opacity of nil
}

function highlightLink(g,on,type) {
    var opacity=((on==true) ? .6 : .1);
      // console.log("fadeHandler(" + opacity + ")");
      // highlightSvg.style("opacity",opacity);
       var link=d3.select(document.getElementById("l_" + g.key));
        link.transition((on==true) ? 150:550)
            .style("fill-opacity",opacity)
            .style("stroke-opacity",opacity);

        var arc=d3.select(document.getElementById("a_" + g.key));
        arc.transition().style("fill-opacity",(on==true) ? opacity :.2);

        var circ=d3.select(document.getElementById("d_" + g.doc.id));
        circ.transition((on==true) ? 150:550)
        .attr("r", function (d) {
            return d.r;
        })
        .style("opacity",((on==true) ?1 :0));

        var text=d3.select(document.getElementById("t_" + g.id));
         text.transition((on==true) ? 0:550)
             .style("fill",(on==true) ? "#000" : "#777")
             .style("font-size",(on==true) ? "10px" : "8px")
             .style("stroke-width",((on==true) ? 2 : 0));
}

function highlightLinks(d,on,type) {
    if(typeof d != "undefined" || typeof d.relatedLinks != "undefined"){
        d.relatedLinks.forEach(function (d) {
            highlightLink(d,on, type);
        })
    }
}

selectNode = function(d) { // TODO: Actually do something.
    position = selectedNodes.indexOf(d);
    if(position === -1) {
        selectedNodes.push(d);
        var circ=d3.select(document.getElementById("d_" + d.id));
        circ.style("opacity", 1)
            .attr("r", function (d) {
                return d.r /* * d.value */;
            });
    }
    log("selectNode");
}

unselectNode = function(d) {
    position = selectedNodes.indexOf(d);
    if(position !== -1) {
        selectedNodes.splice(position, 1);
        var circ=d3.select(document.getElementById("d_" + d.id));
        circ.style("opacity", 0);
    }
    log("unselectNode");
}

resetSelectedNodes = function(){
    selectedNodes.forEach(function(d){
        var circ=d3.select(document.getElementById("d_" + d.id));
        circ.style("opacity", 0);
    });
    selectedNodes = [];
}

d3.select("body").on("keydown", function(d) {
    if (treeActive) {
        var keyCode = d3.event.keyCode;
        d3.event.preventDefault();

        switch (keyCode) {
            case 13: // enter
                createPhenoBox();
                break;
            case 37: // left
                try {
                    var next = document.querySelector('[hpid="' + cursorData.parent["id"] + '"]');
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
                    if (cursorElement["location"] == "list") {
                        moveSignal(l);
                    } else if (cursorElement["location"] == "tree") {
                        moveSignal(l.parentNode);
                    }
                } catch (e) {}
                break;
            case 38: // up
                try {
                    var next;
                    if (cursorElement["location"] == "list") { // list and tree are inverted.
                        next = cursorElement["element"].parentNode.previousSibling.childNodes[0];
                    } else if (cursorElement["location"] == "tree") {
                        next = cursorElement["element"].parentNode.nextSibling.childNodes[0];
                        if (cursorElement["element"].parentNode.transform.animVal[0].matrix.e != next.parentNode.transform.animVal[0].matrix.e) {
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
                    if (cursorElement["location"] == "list") {
                        moveSignal(l);
                    } else if (cursorElement["location"] == "tree") {
                        moveSignal(l.parentNode);
                    }

                } catch (e) {}
                break;
            case 39: // right
                try {
                    var next;
                    if (cursorElement["location"] == "list") {
                        next = cursorElement["element"].parentNode.parentNode.lastChild.previousSibling.childNodes[0];
                    } else if (cursorElement["location"] == "tree") {
                        if (cursorData.children.length <= 0) break;
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
                } catch (e) {}
                break;
            case 40: // down
                try {
                    var next;
                    if (cursorElement["location"] == "list") { // list and tree are inverted.
                        next = cursorElement["element"].parentNode.nextSibling.childNodes[0];
                        if (next.className.animVal != "rootPheno") break; // stop from scroll off the bottom of the list
                    } else if (cursorElement["location"] == "tree") {
                        next = cursorElement["element"].parentNode.previousSibling.childNodes[0];
                        if (cursorElement["element"].parentNode.transform.animVal[0].matrix.e != next.parentNode.transform.animVal[0].matrix.e) {
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
                    if (cursorElement["location"] == "list") {
                        moveSignal(l);
                    } else if (cursorElement["location"] == "tree") {
                        moveSignal(l.parentNode);
                    }
                } catch (e) {}
                break;
        }
    }
});

d3.select("body").on("keypress", function() {
    if (treeActive) {
        d3.event.preventDefault();
    }
});

clearPhenotypes = function() {
    data.forEach(function(d) {
        d.children = [];
    });
    d3.select("#overview > .links").selectAll(".links").remove();
    activerow = -1;
    childrenNumStack = [1];
    currentTreeData = {};
    cursorElement = null;
    cursorDataPrior = null;
    cursorData = null;
    depth = 0;
    drill = undefined;
    resetSelectedNodes();
    // chords = [];
    documents = [];
    docs = [];
    searchLinks = [];
    renderLinks=[];
    fetchData();
    // updateChart();
    // draw(svgBoxes, data);
}

searchPhenotypes = function() {
        documents = [];
        docs = [];
            searchLinks = [];
    renderLinks=[];
    fetchData();
}

createPhenoBox = function() { // use cursorData parent chain-up
    if (typeof cursorData.name != "undefined") {
        var tempPheno = [cursorData];
        while (typeof tempPheno[tempPheno.length - 1].parent != "undefined") {
            tempPheno.push(tempPheno[tempPheno.length - 1].parent);
        }
        tempPheno.pop();
        tempPheno.reverse();
        tempPheno.depth = depth;
        var inArray;
        for (var i = 0; i < tempPheno.length; i++) {
            inArray = findWithAttr(data[activerow].children, "id", tempPheno[i].id);
            if (inArray == -1) {
                // depthInArray = findWithAttr(data[activerow].children, "depth", tempPheno[i].depth);
                // if(depthInArray !== -1) {
                //     data[activerow].children.splice(depthInArray, 0, tempPheno[i]);
                // } else {
                //    data[activerow].children.splice(data[activerow].children.length-1, 0, tempPheno[i]); 
                // }
                data[activerow].children.push(tempPheno[i]);
            }
        }
        cursorDataPrior = null;
        cursorData = null;
        treeActive = false;
        depth = 0;
        fetchData();
        // updateChart();
        // draw(svgBoxes, data);
    }
}

removeChild = function(row, column) {
    data[row].children.splice(column, 1);
    d3.select("#overview > .links").selectAll(".links").remove();
    fetchData();
    // updateChart();
    // draw(svgBoxes, data);
}

moveSignal = function(target) {
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click');
    target.dispatchEvent(event);
}

collapse = function(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

move = function(d) {
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
        .style("left", /*(d3.event.pageX + 10)*/ 0 + "px") // horizontal
    .style("top", /*(d3.event.pageY - 20)*/ 5 + verticalPadding + "px"); // vertical
}