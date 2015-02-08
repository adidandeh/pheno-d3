function initialize() {

    totalContributions=0;
    renderLinks=[];
    cands=[];
    pacs=[];
    contr=[];
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
        // c_house.forEach(function (d) {
        //     contr.push(d);
        // });
    }
    else if (office=="senate") {
        var root={};
        var d={};
        d.value=total_sDems;
        d.children=s_dems;

        var r={};
        r.value=total_sReps;
        r.children=s_reps;

        var o={};
        o.value=total_sOthers;
        o.children=s_others;

        root.children=[r,d,o];
        root.PTY="root";

        nodes=bubble.nodes(root);

        var totalCandAmount=0;
        nodes.forEach (function (d) {
            if (d.depth==2) {
                nodesById[d.CAND_ID]=d;
                d.relatedLinks=[];
                d.Amount=Number(d.Amount);
                d.currentAmount= d.Amount;
                cands.push(d);
                totalCandAmount+= d.Amount;
            }
        })

        log("totalCandAmount=" + totalCandAmount);
        pacs=pacsSenate;
        c_senate.forEach(function (d) {
            contr.push(d);
        });
    }

    buildChords();
    var totalContr=0;
    // contr.forEach(function (d) {
    //     console.log(d);
    //     nodesById[d.CAND_ID].relatedLinks.push(d);
    //     //chordsById[d.CMTE_ID].relatedLinks.push(d);
    //     chordsById[d.CMTE_ID].relatedLinks.push(d); //temp
    //     totalContr+= Number(d.TRANSACTION_AMT);
    // })

    log("totalContributions=" + totalContr);
    log("initialize()");

}
