function initialize() {
    totalContributions=0;
    renderLinks=[];
    cands=[];
    pacs=[];
    contr=[];
    searches=[],
    phenoRoots=phenotypeRoots;
    docs=[];

    if (office=="house") {
        var root={};
        var d={};
        // d.value=total_hDems;
        // d.children=h_dems;
        d.value=total_docs;
        d.children=documents;

        // var r={};
        // r.value=total_hReps;
        // r.children=h_reps;

        // var o={};
        // o.value=total_hOthers;
        // o.children=h_others;

        // root.children=[r,d,o];
        root.children=[d];
        root.PTY="root";

        nodes=bubble.nodes(root);

        var totalDocAmount=0;
        nodes.forEach (function (d) {
            if (d.depth==2) {
                nodesById[d.id]=d;
                d.relatedLinks=[];
                d.Amount=1;
                d.currentAmount = 1;
                docs.push(d);
                totalDocAmount+= d.Amount;

            }
        })
        log("totalDocAmount=" + totalDocAmount);
        // pacs=pacsHouse;
        searchedPhenotypes.forEach(function (d) {
            searches.push(d);
        });
    }

    buildChords();
    var totalSearchPhenotypes=0;

    // connect phenotypes to documents and phenotypes to its root tree
    searches.forEach(function (d) {
        documentsById["documents_450820"].relatedLinks.push(d); // temp target until search
        chordsById[d.parentId].relatedLinks.push(d);
        totalSearchPhenotypes+=1;
    })

    log("totalSearchPhenotypes=" + totalSearchPhenotypes);
    log("initialize()");

}
