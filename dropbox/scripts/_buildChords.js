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

    var counter = 1;
     phenotypeRoots.forEach(function(d) {
        var source = indexByName[d.id], // get HP id
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }
        row[indexByName[d.id]] = chordLinkCount[indexByName[d.id]];
    });

    var tempLabels=[];
    var tempChords=[];
    chord.matrix(matrix); // TODO: change matrix to allow for all the searchLinks
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

