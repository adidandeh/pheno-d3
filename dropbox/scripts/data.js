// hardcoded pheno bar data
var data = [{
    "name": "Abnormality of the Abdomen",
    "order": 1,
    "id": "HP:0001438",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of Blood and Blood-Forming Tissue",
    "order": 2,
    "id": "HP:0001871",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Breast",
    "order": 3,
    "id": "HP:0000769",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Cardiovascular System",
    "order": 4,
    "id": "HP:0001626",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of Connective Tissue",
    "order": 5,
    "id": "HP:0003549",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Ear",
    "order": 6,
    "id": "HP:0000598",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Endocrine System",
    "order": 7,
    "id": "HP:0000818",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Eye",
    "order": 8,
    "id": "HP:0000478",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Genitourinary System",
    "order": 9,
    "id": "HP:0000119",
    "active": 0,
    "children": []
}, {
    "name": "Growth Abnormality",
    "order": 10,
    "id": "HP:0001507",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of Head or Neck",
    "order": 11,
    "id": "HP:0000152",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Immune System",
    "order": 12,
    "id": "HP:0002715",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Integument",
    "id": "HP:0001574",
    "order": 13,
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of Limbs",
    "order": 14,
    "id": "HP:0040064",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of Metabolism",
    "order": 15,
    "id": "HP:0001939",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Musculature",
    "order": 16,
    "id": "HP:0003011",
    "active": 0,
    "children": []
},  {
    "name": "Neoplasm",
    "order": 17,
    "id": "HP:0002664",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Nervous System",
    "order": 18,
    "id": "HP:0000707",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of Prenatal Development or Birth",
    "order": 19,
    "id": "HP:0001197",
    "active": 0,
    "children": []
},  {
    "name": "Abnormality of the Respiratory System",
    "order": 20,
    "id": "HP:0002086",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Skeletal System",
    "order": 21,
    "id": "HP:0000924",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Thoracic Cavity",
    "order": 22,
    "id": "HP:0045027",
    "active": 0,
    "children": []
}, {
    "name": "Abnormality of the Voice",
    "order": 23,
    "id": "HP:0001608",
    "active": 0,
    "children": []
}]


var dataCalls=[];
var numCalls=0;

function fetchData() {
    documentsById={},
    phenotypeRootsById={},
    chordsById={},
    nodesById={},
    chordLinkCount={},
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
    startFetch();
}


function onFetchPhenotypes(error, pheno) {
    phenotypeRootsById = [];
    phenotypeRoots = pheno.children;
    // build arc setup
    for (var i=0; i < phenotypeRoots.length; i++) {
        phenotypeRootsById["phenotypeRoot_" + phenotypeRoots[i].id]=phenotypeRoots[i];
    }

    searchedPhenotypes = [];
    // build search links
    for(var i=0; i<data.length; i++) {
        for(var j=0; j<data[i].children.length; j++) {
            data[i].children[j].key = data[i].order + "_" + j;
            data[i].children[j].parentId = data[i].id;
            data[i].children[j].parentOrder = data[i].order;
            searchedPhenotypes.push(data[i].children[j]);
        }
    }
    endFetch();
}

function onFetchDocuments(error, data) {
    documents = data.response.docs;
    for (var i=0; i < documents.length; i++) {
        var d = documents[i];
        d.value = d.phenotypes.length;
        // d.value = 1;
        documentsById["documents_" + documents[i].id]=documents[i];
        total_docs+=1; 
    }
    endFetch();
}

dataInit = function() {
    buf_indexByName=indexByName;
    indexByName=[];
    nameByIndex=[];
    n = 0;
    searchLinks = [];

    var totalLinkAmount=0;

    phenotypeRoots.forEach(function(d) {
        d = d.id;
        if (!(d in indexByName)) {
              nameByIndex[n] = d;
              indexByName[d] = n++;
        }
    });

    phenotypeRoots.forEach(function(d) {
        linkCount = 0;
        for(var j = 0; j < searchedPhenotypes.length; j++) { // eadh searched phenotype
            if(searchedPhenotypes[j].parentId === d.id) {
                for(var i = 0; i < documents.length; i++) { // each document
                    tempPhenotypes = documents[i].phenotypes;

                    var uniquePhenos = tempPhenotypes.reduce(function(a,b){ // remove duplicate phenos
                        if (a.indexOf(b) < 0 ) a.push(b);
                        return a;
                    },[]);

                    for (var k = 0; k < uniquePhenos.length; k++) { // each document's phenotypes tags
                        if(searchedPhenotypes[j].name.toUpperCase() === uniquePhenos[k].toUpperCase()) {

                            s = {};
                            s.doc = documents[i];
                            s.pheno = searchedPhenotypes[j];
                            s.key = linkCount;
                            // documentsById["documents_" + documents[i].id].value += 1;
                            searchLinks.push(s);
                            linkCount++;
                        }
                    }   
                }
            }
        }
        totalLinkAmount+=linkCount;
        if(linkCount<1) linkCount++; // To show at least the chord tag TODO, artificially pumping by one
        chordLinkCount[indexByName[d.id]] = linkCount;

    });

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
        dataInit();
        main();
    }
}

prepData = function(d, data, row) {
    d3.json("data/data.json", function(error, flare) {
        root = flare;

        var tempPheno = [cursorData];
        while (typeof tempPheno[tempPheno.length - 1].parent != "undefined") {
            tempPheno.push(tempPheno[tempPheno.length - 1].parent);
        }
        tempPheno.reverse();
        for (var x = 0; x < tempPheno.length; x++) {
            if (typeof root == "undefined") break // leaf node
            if (typeof root.children !== "undefined") { // stops if at leaf
                root = root.children[findWithAttr(root.children, 'id', tempPheno[x].id)];
            }
        }

        root.x0 = (row + 1) * sqheight;
        root.y0 = phenobarheight + (sqwidth * (tempPheno.length - 1)) + 50;

        function collapse(d) {
            if (d.children) {
                //for(var i=0; i < d.children.length; i++) { // trying to cut out the junk ones.
                //console.log(d.children);
                // if (typeof d.children[i].name == "undefined") {
                //     d.children.splice(i,1);
                // }
                // }

                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        currentTreeData = root;
        update(currentTreeData, row, sqwidth * (tempPheno.length - 1));
    });
}
