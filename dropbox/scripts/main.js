fetchData();

var intervalId;
var counter=2;
var renderLinks=[];

function main() {
    updateChart();
    draw(svgBoxes);
}

/*
function onDataFetched() {
    main();
}
*/

prepLinks = function () {
    renderLinks = searchLinks;
    // for (var i=0; i < searchLinks.length; i++) {
    //     renderLinks.push(searchLinks.pop());
    // }
    updateLinks(renderLinks);
}

// function onInterval() {
//     log("onInterval");
//     if(searchLinks.length==0) {
//         clearInterval(intervalId);
//     }
//     else {
//        // renderLinks=[];
//        // log("Rendering links");
//         for (var i=0; i < counter; i++) {
//             if (searchLinks.length > 0) {
//                 renderLinks.push(searchLinks.pop());
//             }
//         }
//         counter=30;
//         //counter++;
//         updateLinks(renderLinks);
//     }
// }

