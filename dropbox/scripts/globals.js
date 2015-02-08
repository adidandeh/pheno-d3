var activerow = -1,
    childrenNumStack = [1],
    currentTreeData = {},
    cursorElement = null,
    cursorData = null,
    colorArr = ["#98DDD3",
        "#E2B8CC",
        "#A3E0A4",
        "#D5D481",
        "#C6D2D7",
        "#EDAA84"
    ],
    duration = 100,
    depth = 0,
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
    treeActive = false,
    treeWidth = 200,
    treeHeight = 500,
    height = 1000 - margin.top - margin.bottom,
    width = 1200 - margin.right - margin.left,
    maxBoxHeight = 120,
    verticalPadding = 10,
    horizontalPadding = 0;

var cns=[],
    cands=[],
    pacs=[],
    
    documents=[], // data
    phenotypeRoots=[], // data

    pacsHouse=[],
    pacsSentate=[],
    contr=[],
    h_dems=[],
    h_reps=[],
    h_others=[],
    house=[];
    s_dems=[],
    s_reps=[],
    s_others=[],
    senate=[],
    total_hDems=0,
    total_sDems=0,
    total_hReps=0,
    total_sReps=0,
    total_hOthers=0,
    total_sOthers=0,

    total_docs=0,

    contributions=[],
    c_senate=[];
    c_house=[];
    pacsById={},

    documentsById={},
    phenotypeRootsById={},

    chordsById={},
    nodesById={},
    chordCount=20,
    pText=null,
    pChords=null,
    nodes=[],
    renderLinks=[],
    colorByName={},
    totalContributions=0,
    delay=2;

var maxWidth=Math.max(600,Math.min(screen.height,screen.width)-250);

var outerRadius = maxWidth / 2,
    innerRadius = outerRadius - 120,
    bubbleRadius=innerRadius-50,
    linkRadius=innerRadius-20,
    nodesTranslate=(outerRadius-innerRadius) + (innerRadius-bubbleRadius) + 100,
    chordsTranslate=(outerRadius + 100);

// d3.select(document.getElementById("mainDiv"))
//     .style("width",(outerRadius*2 + 400) + "px")
//     .style("height",(outerRadius*2 + 400) + "px");

// d3.select(document.getElementById("bpg"))
//     .style("width",(outerRadius*2 + 400) + "px");

var svgBoxes = d3.select("#phenobar").append("svg")
    .attr("width", width)
    .attr("height", height);

var svg = d3.select("#phenobar").append("svg")
    .attr("width", width)
    .attr("height", height);

// var svg = d3.select(document.getElementById("svgDiv"))
//     .style("width", (outerRadius*2 + 200) + "px")
//     .style("height", (outerRadius*2 + 200) + "px")
//     .append("svg")
//     .attr("id","svg")
//     .style("width", (outerRadius*2 + 200) + "px")
//     .style("height", (outerRadius*2 + 200) + "px");

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
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

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
var total = d3.select(document.getElementById("totalDiv"));
var repColor="#F80018";
var demColor="#0543bc";
var otherColor="#FFa400";

var fills= d3.scale.ordinal().range(["#00AC6B","#20815D","#007046","#35D699","#60D6A9"]);

var office="house";

var linkGroup;

var formatNumber = d3.format(",.0f"),
    formatCurrency = function(d) { return "$" + formatNumber(d)};

var buf_indexByName={},
    indexByName = {},
    nameByIndex = {},
    labels = [],
    chords = [];



// treeMap
var mapMargin = {
        top: 20,
        right: 0,
        bottom: 0,
        left: 0
    },
    mapWidth = 300,
    mapHeight = 300;

var treemap = d3.layout.treemap()
    .size([mapWidth, mapHeight])
    .value(function(d) {
        try {
            return (d._children.length > 0) ? d._children.length : 1;
        } catch (e) {
            return 0;
        }
    });

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
    // console.log(message);
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

color = function(d) {
    var random = Math.floor(Math.random() * colorArr.length) + 0;
    //return colorArr[random];
    // insert generation function.
    //return "#D8C6C6";
    return "#49B649"; // green
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