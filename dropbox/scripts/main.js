fetchData(); // in data.js:16

var intervalId;
var counter=2;
var renderLinks=[];

function main() {
    updateChart();
    draw(svgBoxes, data);
}

/*
function onDataFetched() {
    main();
}
*/

function onInterval() {
    log("onInterval");
    if(searchedPhenotypes.length==0) {
        clearInterval(intervalId);
    }
    else {
       // renderLinks=[];
       log("Rendering links");
        for (var i=0; i < counter; i++) {
            if (searchedPhenotypes.length > 0) {
                renderLinks.push(searchedPhenotypes.pop());
            }
        }
        counter=30;
        //counter++;
        updateLinks(renderLinks);
    }
}

