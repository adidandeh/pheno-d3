var activerow = -1,
    childrenNumStack = [1],
    currentTreeData = {},
    cursorElement = null,
    cursorDataPrior = null,
    cursorData = null,
    colorArr = [
        "#6b9799", "#96f", "#75525f",
        "#6bbaff", "#e6bea1", "#d9628d",
        "#4d57ac", "#8d3f5c", "#607334", 
        "#8c613f", "#aacc5c", "#b25ccc",
        "#807438", "#ff7373", "#8c3f3f",
        "#b35823", "#5ccc9f", "#47ff66",
        "#743467", "#73faff", "#2e6650",
        "#7381ff", "#513a82", "#3f688c"
    ],
    duration = 100,
    drill = undefined,
    i = 0,
    margin = {
        top: 20,
        right: 0,
        bottom: 20,
        left: 0
    },
    phenobarheight = 20,
    sqwidth = 70,
    sqheight = 25,
    sqspacing = 1,
    treeActive = false,
    treeWidth = 200,
    treeHeight = 500,
    height = 1000 - margin.top - margin.bottom,
    width = 900 - margin.right - margin.left,
    maxBoxHeight = 120,
    verticalPadding = 10,
    horizontalPadding = 0;

var documents=[], // data
    phenotypeRoots=[], // data
    total_docs=0,
    searchedPhenotypes =[],
    searchLinks = [],
    
    documentsById={},
    phenotypeRootsById={},
    chordsById={},
    nodesById={},
    chordLinkCount={},

    chordCount=20,
    pText=null,
    pChords=null,
    nodes=[],
    renderLinks=[],
    colorByName={},
    delay=2;

var maxWidth=Math.max(600,Math.min(screen.height,screen.width)-250);

var outerRadius = maxWidth / 2,
    innerRadius = outerRadius - 120,
    bubbleRadius=innerRadius-50,
    linkRadius=innerRadius-20,
    chartTranslateX = 0,
    nodesTranslate=(outerRadius-innerRadius) + (innerRadius-bubbleRadius) + chartTranslateX,
    chordsTranslate=(outerRadius + chartTranslateX);

var svgBoxes = d3.select("#phenobar").append("svg")
    .attr("width", 800)
    .attr("height", height);

var svg = d3.select("#phenobar").append("svg")
    .attr("id", "overview")
    .attr("width", width)
    .attr("height", height);

var chordsSvg=svg.append("g")
    .attr("class","chords")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")");

var linksSvg=svg.append("g")
    .attr("class","links")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")")

var highlightSvg=svg.append("g")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")")
    .style("opacity",0);

var highlightLink=highlightSvg.append("path");

var nodesSvg=svg.append("g")
    .attr("class","nodes")
    .attr("transform", "translate(" + nodesTranslate + "," + nodesTranslate + ")");

 var bubble = d3.layout.pack()
    .sort(null)
    .size([bubbleRadius*2, bubbleRadius*2])
    .padding(1.5);

var chord = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending);
    // .sortChords(d3.descending);

var diagonal = d3.svg.diagonal.radial();
    //.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 10);

var diameter = 960,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var toolTip = d3.select(document.getElementById("toolTip"));
var header = d3.select(document.getElementById("head"));
var header1 = d3.select(document.getElementById("header1"));
var header2 = d3.select(document.getElementById("header2"));
var repColor="#F80018";
var demColor="#0543bc";
var otherColor="#FFa400";

var fills= d3.scale.ordinal().range(["#00AC6B","#20815D","#007046","#35D699","#60D6A9"]);
var linkGroup;

var formatNumber = d3.format(",.0f"),
    formatCurrency = function(d) { return "$" + formatNumber(d)};

var buf_indexByName={},
    indexByName = {},
    nameByIndex = {},
    labels = [],
    chords = [];

// phenoTree
var tree = d3.layout.tree()
    .size([treeHeight, treeWidth]);

// var diagonal = d3.svg.diagonal()
//     .projection(function(d) {
//         return [d.y, d.x];
//     });

var div = d3.select("body").append("div")
    .attr("class", "tooltipPhenoBox");

var treecolor = d3.scale.category20c();

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

// http://www.sitepoint.com/javascript-generate-lighter-darker-color/
function colorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    lum = lum/10;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }

    return rgb;
}

color = function(rootOrder, weightDiff) { // TODO: Get working.

    // var random = Math.floor(Math.random() * colorArr.length) + 0;
    //return colorArr[random];
    // insert generation function.
    //return "#D8C6C6";
   // return "#49B649"; // green
   log(weightDiff);
   return colorLuminance(colorArr[rootOrder], weightDiff);
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