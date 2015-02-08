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
    if(contr.length==0) {
        clearInterval(intervalId);
    }
    else {
       // renderLinks=[];
        for (var i=0; i < counter; i++) {
            if (contr.length > 0) {
                renderLinks.push(contr.pop());
            }
        }
        counter=30;
        //counter++;
        updateLinks(renderLinks);
    }
}

