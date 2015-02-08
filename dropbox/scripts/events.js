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