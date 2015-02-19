function initialize() {
    // renderLinks=[];
    searches=[],
    selectedNodes=[],
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
    nodes.forEach(function (d) {
        if (d.depth==2) {
            log(d);
            nodesById[d.id]=d;
            d.relatedLinks=[];
            d.Amount=1;
            d.currentAmount = 1;
            docs.push(d);
            totalDocAmount+= d.Amount;
        }
    })
    log("totalDocAmount=" + totalDocAmount);
    searchLinks.forEach(function (d) {
        searches.push(d);
    });

    buildChords();
    var totalSearchPhenotypes=0;

    // connect phenotypes to documents and phenotypes to its root tree
    searches.forEach(function (d) {
        if(typeof documentsById["documents_"+d.doc.id] != "undefined") { // TODO : Mhmm. 
            documentsById["documents_"+d.doc.id].relatedLinks.push(d);
            documentsById["documents_"+d.doc.id].value+=1;
            chordsById[d.pheno.rootId].relatedLinks.push(d);
            // chordsById[d.pheno.rootId].relatedLinks.push(d);
            totalSearchPhenotypes+=1;
        }
    })

    docs.forEach(function(d){
        d.value = documentsById["documents_"+d.id].value;
    });

    log("totalSearchPhenotypes=" + totalSearchPhenotypes);
    log("initialize()");

}
