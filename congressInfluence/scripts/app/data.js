
/**
 *
 * DATA SOURCE:  http://www.fec.gov/data/index.jsp/
 *
 */

/**
 * Daisy Chain Data Fetches to ensure all data is loaded prior to updates (async calls)
 */

// var dataDispatch=d3.dispatch("end");
var dataCalls=[];
var numCalls=0;

function fetchData() {
    dataCalls=[];
//    dataDispatch.on("end",onDataFetched)


/* Need to generate: 
    - Full phenotype listing, seperated by major subtree. 
        - data.children is the arc main segments
        - the individual divisions are the children phenotypes
        - Used for arc divisions around the visual space.
    - Full article sets.
        - Used as the clusters within the visual space.
    - Search input.
        - Used to generate the links between the arc and the clusters.
*/

    addStream("data/data.json", onFetchPhenotypes, "json");
    addStream("data/docs.json", onFetchDocuments, "json");
    addStream("data/Candidates_House.csv", onFetchCandidatesHouse, "csv");
    addStream("data/Candidates_Senate.csv", onFetchCandidatesSenate, "csv");
    addStream("data/Contributions_House.csv", onFetchContributionsHouse, "csv");
    addStream("data/Contributions_Senate.csv", onFetchContributionsSenate, "csv");
    addStream("data/Pacs_House.csv", onFetchPacsHouse, "csv");
    addStream("data/Pacs_Senate.csv", onFetchPacsSenate, "csv");
    startFetch();
}


function onFetchPhenotypes(error, data) {
    phenotypeRoots = data.children;
    for (var i=0; i < phenotypeRoots.length; i++) {
        phenotypeRootsById["phenotypeRoot_" + phenotypeRoots[i].id]=phenotypeRoots[i];
    }

        endFetch();
}

function onFetchDocuments(error, data) {
    documents = data.response.docs;
    for (var i=0; i < documents.length; i++) {
        documentsById["documents_" + documents[i].id]=documents[i];
    }
        endFetch();
}

function onFetchCandidatesSenate(csv) {

     for (var i=0; i < csv.length; i++) {
        var r=csv[i];
         r.value=Number(r.Amount);
        cns[r.CAND_ID]=r;

            senate.push(r);
            if (r.PTY=="REP") {
                s_reps.push(r);
                total_sReps+= r.value;
            }
            else if (r.PTY=="DEM") {
                s_dems.push(r)
                total_sDems+= r.value;
            }
            else {
                s_others.push(r);
                total_sOthers+= r.value;
            }

     }

    log("onFetchCandidatesSenate()");
    endFetch();
}

function onFetchCandidatesHouse(csv) {
    for (var i=0; i < csv.length; i++) {
        var r=csv[i];
        r.value=Number(r.Amount);
        cns[r.CAND_ID]=r;
        house.push(r);
        if (r.PTY=="REP") {
            h_reps.push(r);
            total_hReps+= r.value;
        }
        else if (r.PTY=="DEM") {
            h_dems.push(r)
            total_hDems+= r.value;
        }
        else {
            h_others.push(r);
            total_hOthers+= r.value;
        }
    }
    log("onFetchCandidatesHouse()");
    endFetch();
}

function onFetchContributionsSenate(csv) {

    var i=0;
    csv.forEach(function (d) {
        d.Key="S"+(i++);
        contributions.push(d);
        c_senate.push(d);
    });

    log("onFetchContributionsSenate()");
    endFetch();

}

function onFetchContributionsHouse(csv) {
    var i=0;
    csv.forEach(function (d) {
        d.Key="H"+(i++);
        contributions.push(d);
        c_house.push(d);
    });

    log("onFetchContributionsHouse()");
    endFetch();

}

function onFetchPacsHouse(csv) {
    // console.log(csv);
    pacsHouse=csv;
    for (var i=0; i < pacsHouse.length; i++) {
        pacsById["house_" + pacsHouse[i].CMTE_ID]=pacsHouse[i];
    }
    // console.log(pacsById);
    log("onFetchPacsHouse()");
    endFetch();


}

function onFetchPacsSenate(csv) {

    pacsSenate=csv;
    for (var i=0; i < pacsSenate.length; i++) {
        pacsById["senate_" + pacsSenate[i].CMTE_ID]=pacsSenate[i];
    }

    log("onFetchPacsSenate()");
    endFetch();

}


function addStream(file,func,type) {
    var o={};
    o.file=file;
    o.function=func;
    o.type=type;
    dataCalls.push(o);
}

function startFetch() {
    numCalls=dataCalls.length;
    dataCalls.forEach(function (d) {
        d3[d.type](d.file, d.function);
    })
}

function endFetch() {
    numCalls--;
    if (numCalls==0) {
       // dataDispatch.end();
        main();
    }
}
