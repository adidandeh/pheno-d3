var remote = false;
var url = "http://129.100.19.193/soscip/api/search.php";

if (remote) {
    url = "http://localhost:8080/soscip/api/search.php";
}
// hardcoded pheno bar data
var dataPheno = [{
    "name": "Abnormality of the Abdomen",
    "order": 1,
    "id": "HP:0001438",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of Blood and Blood-Forming Tissue",
    "order": 2,
    "id": "HP:0001871",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Breast",
    "order": 3,
    "id": "HP:0000769",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Cardiovascular System",
    "order": 4,
    "id": "HP:0001626",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of Connective Tissue",
    "order": 5,
    "id": "HP:0003549",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Ear",
    "order": 6,
    "id": "HP:0000598",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Endocrine System",
    "order": 7,
    "id": "HP:0000818",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Eye",
    "order": 8,
    "id": "HP:0000478",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Genitourinary System",
    "order": 9,
    "id": "HP:0000119",
    "active": 0,
    "searches": []
}, {
    "name": "Growth Abnormality",
    "order": 10,
    "id": "HP:0001507",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of Head or Neck",
    "order": 11,
    "id": "HP:0000152",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Immune System",
    "order": 12,
    "id": "HP:0002715",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Integument",
    "id": "HP:0001574",
    "order": 13,
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of Limbs",
    "order": 14,
    "id": "HP:0040064",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of Metabolism",
    "order": 15,
    "id": "HP:0001939",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Musculature",
    "order": 16,
    "id": "HP:0003011",
    "active": 0,
    "searches": []
}, {
    "name": "Neoplasm",
    "order": 17,
    "id": "HP:0002664",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Nervous System",
    "order": 18,
    "id": "HP:0000707",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of Prenatal Development or Birth",
    "order": 19,
    "id": "HP:0001197",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Respiratory System",
    "order": 20,
    "id": "HP:0002086",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Skeletal System",
    "order": 21,
    "id": "HP:0000924",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Thoracic Cavity",
    "order": 22,
    "id": "HP:0045027",
    "active": 0,
    "searches": []
}, {
    "name": "Abnormality of the Voice",
    "order": 23,
    "id": "HP:0001608",
    "active": 0,
    "searches": []
}]

var dataCalls = [];
var numCalls = 0;

fetchData = function() {
    documentsById = {},
    documents = [],
    phenotypeRootsById = {},
    chordsById = {},
    nodesById = {},
    chordLinkCount = {},
    dataCalls = [];
    searchLinks = [];
    renderLinks = [];

    addStream("data/data.json", onFetchPhenotypes, "json");
    startFetch();
}

onFetchPhenotypes = function(error, pheno) {
    phenotypeRootsById = [];
    phenotypeRoots = pheno.children;
    // build arc setup
    for (var i = 0; i < phenotypeRoots.length; i++) {
        phenotypeRootsById["phenotypeRoot_" + phenotypeRoots[i].id] = phenotypeRoots[i];
    }
    searchedPhenotypes = [];
    // build search links
    for (var i = 0; i < dataPheno.length; i++) {
        for (var j = 0; j < dataPheno[i].searches.length; j++) {
            dataPheno[i].searches[j].key = dataPheno[i].order + "_" + j;
            dataPheno[i].searches[j].rootId = dataPheno[i].id;
            dataPheno[i].searches[j].rootOrder = dataPheno[i].order;
            searchedPhenotypes.push(dataPheno[i].searches[j]);
        }
    }

    log("onFetchPhenotypes");
    endFetch();
}

searchSolr = function() {
    var searchmax = 100;
    var searchString = "";
    var cleanedSearches = [];
    var re = /\s/g;

    if (searchedPhenotypes.length > 0) { // if there's searched phenotypes.
        searchedPhenotypes.forEach(function(d) {
            searchTerm = d.name;
            searchTerm = searchTerm.replace(re, "+");
            cleanedSearches.push(searchTerm);
        });

        // create search queries.
        joinedSearches = [];

        // http://codereview.stackexchange.com/a/39747
        function powerSet(list) {
            var set = [],
            listSize = list.length,
            combinationsCount = (1 << listSize);

            for (var i = 1; i < combinationsCount; i++, set.push(combination))
                for (var j = 0, combination = []; j < listSize; j++)
                    if ((i & (1 << j)))
                        combination.push(list[j]);
            return set;
        }

        joinedSearches = powerSet(cleanedSearches);
        searchCase = function(queries) {
            var first = true;
            searchString = "";
            query = queries.pop();
            query.forEach(function(d) {
                if (!first) {
                    searchString += "+AND+";
                } else {
                    first = false;
                }
                searchString += '"' + d + '"';
            });

            var search = {
                core: 'medline-citations',
                handler: "select",
                searchFields: JSON.stringify(['phenotypes']), //stringify the array so it is sent properly
                query: searchString,
                years: JSON.stringify({
                    min: 1900,
                    max: 2015
                }),
                start: 0,
                rows: searchmax
            };

            return $.ajax({ // TODO: Slowing down everything.
                url: url,
                type: "get", //send it through get method
                data: search,
                success: function(result) {
                    var result = jQuery.parseJSON(result);
                    log("searchSolr finish");
                    temp_documents = result.response.docs;

                    for (var i = 0; i < temp_documents.length; i++) {
                        var d = temp_documents[i];

                        if (typeof d.phenotypes !== "undefined") {
                            d.value = d.phenotypes.length;
                        } else {
                            d.value = 0.5;
                        }

                        d.resultType = "doc";

                        // if not in the document already
                        if(typeof documentsById["documents_" + d.id] === "undefined") {
                            documents.push(d);
                            documentsById["documents_" + d.id] = d;
                            total_docs += 1;
                            searchmax--;
                        }
                    }

                    if (searchmax > 0 && queries.length > 0) {
                        searchCase(queries);
                    } else { // if searchmax = 0, or there's no more reduction left
                        dataInit();
                        main();
                    }
                },
                error: function(xhr) {
                    log("error searchSolr");
                    documents = [];
                    dataInit();
                    main();
                }
            });
        }

        searchCase(joinedSearches);
    } else { // no searched phenotypes
        searchmax = 0;
        var phenoRootNum = [];

        emptySearch = function(cleanedData) {
            var current = cleanedData.pop();
            var search = {
                core: 'medline-citations',
                handler: "select",
                searchFields: JSON.stringify(['phenotypes']), //stringify the array so it is sent properly
                query: current.searchTerm,
                years: JSON.stringify({
                    min: 1900,
                    max: 2015
                }),
                start: 0,
                rows: searchmax
            };

            $.ajax({ // TODO: Slowing down everything.
                url: url,
                type: "get", //send it through get method
                data: search,
                success: function(result) {
                    var result = jQuery.parseJSON(result);

                    phenoRootNum.push({
                        phenotype: current.phenotype,
                        numFound: result.response.numFound
                    });

                    if (cleanedData.length > 0) {
                        emptySearch(cleanedData);
                    } else {
                        phenoRootNum.forEach(function(d) {
                            d.phenotype.resultType = "cluster";
                            d.phenotype.value = d.numFound;
                            documents.push(d.phenotype);
                            documentsById["documents_" + d.phenotype.id] = d.phenotype;
                            // total_docs+=1;
                        });
                        dataInit();
                        main();
                    }
                    // log("emptySearch finish");
                },
                error: function(xhr) {
                    log("error emptySearch");
                    documents = [];
                    dataInit();
                    main();
                }
            });
        }

        var cleanedData = [];
        dataPheno.forEach(function(d) {
            var searchTerm = d.name;
            searchTerm = searchTerm.replace(re, "+");
            cleanedData.push({
                phenotype: d,
                searchTerm: searchTerm
            });
        });
        emptySearch(cleanedData.reverse());
    }
}

onFetchLiveDocuments = function() {
    $.when(searchSolr()).done(function() {
        log("onFetchLiveDocuments");
    });
}

onFetchDocuments = function(error, data) { // TODO: If using Solr, instead search for #of docs in roots
    documentsById = [];
    if (documents.length < 1) {
        documents = data.response.docs;
    }

    for (var i = 0; i < documents.length; i++) {
        var d = documents[i];
        // d.value = d.phenotypes.length;
        d.value = 1;
        documentsById["documents_" + documents[i].id] = documents[i];
        total_docs += 1;
    }
    endFetch();
}

dataInit = function() {
    buf_indexByName = indexByName;
    indexByName = [];
    nameByIndex = [];
    n = 0;
    searchLinks = [];

    var totalLinkAmount = 0;

    phenotypeRoots.forEach(function(d) { // TODO: Need to change to remove roots from arc
        d = d.id;
        if (!(d in indexByName)) {
            nameByIndex[n] = d;
            indexByName[d] = n++;
        }
    });

    var tempCount = 0;
    phenotypeRoots.forEach(function(d) { // TODO: Need to change to remove roots from arc
        linkCount = 0;
        if (searchedPhenotypes.length > 0) {
            for (var j = 0; j < searchedPhenotypes.length; j++) { // eadh searched phenotype
                if (searchedPhenotypes[j].rootId === d.id) {
                    for (var i = 0; i < documents.length; i++) { // each document
                        if (typeof documents[i].phenotypes != "undefined") { // TODO : no nodes.
                            tempPhenotypes = documents[i].phenotypes;

                            var uniquePhenos = tempPhenotypes.reduce(function(a, b) { // remove duplicate phenos
                                if (a.indexOf(b) < 0) a.push(b);
                                return a;
                            }, []);

                            for (var k = 0; k < uniquePhenos.length; k++) { // each document's phenotypes tags
                                if (searchedPhenotypes[j].name.toUpperCase() === uniquePhenos[k].toUpperCase()) {
                                    s = {};
                                    s.doc = documents[i];
                                    s.pheno = searchedPhenotypes[j];
                                    s.key = searchedPhenotypes[j].rootOrder + "_" + linkCount;
                                    // documentsById["documents_" + documents[i].id].value += 1;
                                    searchLinks.push(s);
                                    linkCount++;
                                }
                            }
                        }
                    }
                }
            }
        } else { // no searched phenotypes.
            // if(searchedPhenotypes[j].name.toUpperCase() === uniquePhenos[k].toUpperCase()) {
            s = {};
            s.doc = documents[tempCount];
            s.pheno = dataPheno[tempCount];
            s.key = dataPheno[tempCount].order + "_" + linkCount;
            documentsById["documents_" + documents[tempCount].id].value += 1;
            searchLinks.push(s);
            // linkCount++;
            // }
            tempCount++;
        }
        totalLinkAmount += linkCount;
        if (linkCount < 1) linkCount++; // To show at least the chord tag TODO, artificially pumping by one
        chordLinkCount[indexByName[d.id]] = linkCount;
    });
}

addStream = function(file, func, type) {
    var o = {};
    o.file = file;
    o.function = func;
    o.type = type;
    dataCalls.push(o);
}

startFetch = function() {
    numCalls = dataCalls.length;
    dataCalls.forEach(function(d) {
        d3[d.type](d.file, d.function);
    })
}

endFetch = function() {
    numCalls--;
    if (numCalls == 0) {
        onFetchLiveDocuments();
    }
}

prepData = function(d, row) {
    d3.json("data/data.json", function(error, flare) {
        root = flare;
        var tempPheno = [cursorData];
        while (typeof tempPheno[tempPheno.length - 1].parent != "undefined") {
            tempPheno.push(tempPheno[tempPheno.length - 1].parent);
        }

        if (tempPheno[0].resultType == "cluster") {
            tempPheno.pop();
            tempPheno.pop();
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

        function collapse(d, dep) {
            if (d.children) {
                //for(var i=0; i < d.children.length; i++) { // trying to cut out the junk ones.
                //console.log(d.children);
                // if (typeof d.children[i].name == "undefined") {
                //     d.children.splice(i,1);
                // }
                // }
                d._children = d.children;
                d.depth = dep;
                dep++;
                d._children.forEach(function(d, dep) {
                    collapse(d, dep);
                });
                d.children = null;
            }
        }

        root.children.forEach(function(d, dep) {
            collapse(d, 1);
        });
        currentTreeData = root;
        update(currentTreeData, row, sqwidth * (tempPheno.length - 1));
    });
}