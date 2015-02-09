function initialize() {
    renderLinks=[];
    searches=[],
    phenoRoots=phenotypeRoots;
    docs=[];

    var root={};
    var d={};

    d.value=total_docs;
    d.children=documents;

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
    searchedPhenotypes.forEach(function (d) {
        searches.push(d);
    });

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
