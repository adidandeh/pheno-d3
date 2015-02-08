function initialize() {
    totalContributions=0;
    renderLinks=[];
    cands=[];
    pacs=[];
    contr=[];
    searches=[],
    phenoRoots=[];
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

        var totalCandAmount=0;
        nodes.forEach (function (d) {
            if (d.depth==2) {
                nodesById[d.id]=d;
                d.relatedLinks=[];
                d.Amount=Number(d.phenotypes.length);
                // d.Amount=Number(d.Amount);
                d.currentAmount =d.phenotypes.length;
                // d.currentAmount =d.Amount;
                // cands.push(d);
                docs.push(d);
                totalCandAmount+= d.Amount;

            }
        })
        log("totalCandAmount=" + totalCandAmount);
        pacs=pacsHouse;
        searchedPhenotypes.forEach(function (d) {
            searches.push(d);
        });
    }

    buildChords();
    // var totalContr=0;

    // connect phenotypes to documents and phenotypes to its root tree
    searches.forEach(function (d) {
        // log(documentsById);
        // log(chordsById);
        // log(d);
        documentsById["documents_450820"].relatedLinks.push(d); // temp target until search
        //chordsById[d.CMTE_ID].relatedLinks.push(d);
        chordsById[d.parentId].relatedLinks.push(d);
        // totalContr+= Number(d.TRANSACTION_AMT);
    })

    // log("totalContributions=" + totalContr);
    log("initialize()");

}
