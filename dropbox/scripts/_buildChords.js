function buildChords() {
    var  matrix = [];
    labels=[];
    chords=[];

    for (var i=0; i < phenotypeRoots.length; i++) {
        var l={};
        l.index=i;
        l.label="null";
        l.angle=0;
        labels.push(l);

        var c={}
        c.label="null";
        c.source={};
        c.target={};
        chords.push(c);

    }

    buf_indexByName=indexByName;

    indexByName=[];
    nameByIndex=[];
    n = 0;

    var totalLinkAmount=0;

    // Compute a unique index for each package name
    phenotypeRoots.forEach(function(d) {
        d = d.id;
        if (!(d in indexByName)) {
              nameByIndex[n] = d;
              indexByName[d] = n++;
        }
    });

    var counter = 1;
     phenotypeRoots.forEach(function(d) {
        var source = indexByName[d.id], // get HP id
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }

        linkCount = 0;
        for(var j = 0; j < searchedPhenotypes.length; j++) { // eadh searched phenotype
            if(searchedPhenotypes[j].parentId === d.id) {
                for(var i = 0; i < docs.length; i++) { // each document
                    tempPhenotypes = docs[i].phenotypes;
                    for (var k = 0; k < tempPhenotypes.length; k++) { // each document's phenotypes tags
                        if(searchedPhenotypes[j].name.toUpperCase() === tempPhenotypes[k].toUpperCase()) {
                            linkCount++; // TODO: current does not account for same phenotype tag
                        }
                    }   
                }
            }
        }

        if(linkCount<1) linkCount++; // To show at least the tag

        row[indexByName[d.id]] = linkCount;
        totalLinkAmount+= linkCount;
    });

    var tempLabels=[];
    var tempChords=[];
    chord.matrix(matrix);
    chords=chord.chords();

    var i=0;
    chords.forEach(function (d) {
        d.label=nameByIndex[i];
        d.angle=(d.source.startAngle + d.source.endAngle) / 2
        var o={};
        o.startAngle= d.source.startAngle;
        o.endAngle= d.source.endAngle;
        o.index= d.source.index;
        o.value= d.source.value;
        o.currentAngle= d.source.startAngle;
        o.currentLinkAngle= d.source.startAngle;
        o.Amount= d.source.value;
        o.source= d.source;
        o.relatedLinks=[];
        chordsById[d.label]= o;
        i++;
    });

    function getFirstIndex(index,indexes) {
        for (var i=0; i < chordCount; i++) {
            var found=false;
            for (var y=index; y < indexes.length; y++) {
                if (i==indexes[y]) {
                    found=true;
                }
            }
            if (found==false) {
                return i;
                //  break;
            }
        }
        //      console.log("no available indexes");
    }

    function getLabelIndex(name) {
        for (var i=0; i < chordCount; i++) {
            if (buffer[i].label==name) {
                return i;
                //   break;
            }
        }
        return -1;
    }

    log("buildChords()");
}

