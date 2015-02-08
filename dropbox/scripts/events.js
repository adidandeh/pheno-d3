
function node_onMouseOver(d,type) {
    if (type=="CAND") {
        if(d.depth < 2) return;
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");
        // header1.text("Congress");
        // header.text(d.CAND_NAME);
        // header2.text("Total Recieved: " + formatCurrency(Number(d.Amount)));

        tempHeight = 100;

        header1.text(d.medline_journal_title);
        header.text(d.medline_article_title);
        header2.text("Year Published: " + d.medline_pub_year);
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

        highlightLinks(d,true);
    }
    else if (type=="CONTRIBUTION") {

        /*
        Highlight chord stroke
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");

        header1.text(pacsById[office + "_" + d.CMTE_ID].CMTE_NM);
        header.text(d.CAND_NAME);
        header2.text(formatCurrency(Number(d.TRANSACTION_AMT)) + " on " + d.Month + "/" + d.Day + "/" + d.Year);
        toolTip.style("left", (d3.event.pageX+15) + "px")
            .style("top", (d3.event.pageY-75) + "px")
            .style("height","100px");
        highlightLink(d,true);
    }
    else if (type=="PAC") {
        /*
        highlight all contributions and all candidates
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");

        // header1.text("Political Action Committee");
        // header.text(pacsById[office + "_" + d.label].CMTE_NM);
        // header2.text("Total Contributions: " + formatCurrency(pacsById[office + "_" + d.label].Amount));
        header1.text("Phenotype Root");
        header.text(phenotypeRootsById["phenotypeRoot_" + d.label].name);
        header2.text("Number of Children: " + phenotypeRootsById["phenotypeRoot_" + d.label].children.length);
        toolTip.style("left", (d3.event.pageX+15) + "px")
            .style("top", (d3.event.pageY-75) + "px")
            .style("height","110px");
        highlightLinks(chordsById[d.label],true);
    }
}

function node_onMouseOut(d,type) {
    if (type=="CAND") {
        highlightLinks(d,false);
    }
    else if (type=="CONTRIBUTION") {
        highlightLink(d,false);
    }
    else if (type=="PAC") {
        highlightLinks(chordsById[d.label],false);
    }


    toolTip.transition()                                    // declare the transition properties to fade-out the div
        .duration(500)                                  // it shall take 500ms
        .style("opacity", "0");                         // and go all the way to an opacity of nil

}

function highlightLink(g,on) {

    var opacity=((on==true) ? .6 : .1);

      // console.log("fadeHandler(" + opacity + ")");
      // highlightSvg.style("opacity",opacity);

       var link=d3.select(document.getElementById("l_" + g.Key));
        link.transition((on==true) ? 150:550)
            .style("fill-opacity",opacity)
            .style("stroke-opacity",opacity);

        var arc=d3.select(document.getElementById("a_" + g.Key));
        arc.transition().style("fill-opacity",(on==true) ? opacity :.2);

        var circ=d3.select(document.getElementById("c_" + g.CAND_ID));
        circ.transition((on==true) ? 150:550)
        .style("opacity",((on==true) ?1 :0));

        var text=d3.select(document.getElementById("t_" + g.CMTE_ID));
         text.transition((on==true) ? 0:550)
             .style("fill",(on==true) ? "#000" : "#777")
             .style("font-size",(on==true) ? "10px" : "8px")
             .style("stroke-width",((on==true) ? 2 : 0));


}

function highlightLinks(d,on) {

    d.relatedLinks.forEach(function (d) {
        highlightLink(d,on);
    })

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
    d3.select("#chart").selectAll("div").remove();
    activerow = -1;
    childrenNumStack = [1];
    currentTreeData = {};
    cursorElement = null;
    cursorData = null;
    depth = 0;
    drill = undefined;

    draw(svgBoxes, data);
}

searchPhenotypes = function() {
    console.log("searching");
}

createPhenoBox = function() { // use cursorData parent chain-up
    if (typeof cursorData.name != "undefined") {
        var tempPheno = [cursorData];
        while (typeof tempPheno[tempPheno.length - 1].parent != "undefined") {
            tempPheno.push(tempPheno[tempPheno.length - 1].parent);
        }
        tempPheno.pop();
        tempPheno.reverse();
        var inArray;
        for (var i = 0; i < tempPheno.length; i++) {
            inArray = findWithAttr(data[activerow].children, "id", tempPheno[i].id);
            if (inArray == -1) {
                data[activerow].children.push(tempPheno[i]);
            }
        }

        cursorData = null;
        treeActive = false;
        draw(svgBoxes, data);
    }
}

removeChild = function(row, column) {
    data[row].children.splice(column, 1);
    draw(svgBoxes, data);
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