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
    height = 2000 - margin.top - margin.bottom,
    width = 900 - margin.right - margin.left,
    maxBoxHeight = 120,
    verticalPadding = 10,
    horizontalPadding = 0;

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

var diagonal = d3.svg.diagonal()
    .projection(function(d) {
        return [d.y, d.x];
    });

var svg = d3.select("#phenobar").append("svg")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body").append("div")
    .attr("class", "tooltip");

var treecolor = d3.scale.category20c();