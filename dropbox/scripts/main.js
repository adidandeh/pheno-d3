log = function(message) {
    console.log(message);
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
    } catch (e) {
        name = "Error."
    }

    return name;
}

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

    draw(svg, data);
}

searchPhenotypes = function() {
    console.log("searching");
}

color = function(d) {
    var random = Math.floor(Math.random() * colorArr.length) + 0;
    //return colorArr[random];
    // insert generation function.
    //return "#D8C6C6";
    return "#49B649"; // green
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
        draw(svg, data);
    }
}

removeChild = function(row, column) {
    data[row].children.splice(column, 1);
    draw(svg, data);
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

getMaxChildren = function() {
    var children = 0;

    data.forEach(function(rootPheno) {
        if (rootPheno.children.length > children) {
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


cursor = function(d) {
    if (cursorData) {
        if (cursorData.id == d.id) {
            return "black";
        }
        var lineage = getLineage(cursorData);
        for (var i = 0; i < lineage.length; i++) {
            if (lineage[i].id == d.id) {
                return "grey";
            }
        }
    }
    return "";
}

draw(svg, data);