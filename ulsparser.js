
var lineReader = require('line-reader'),
    path       = require('path');

var classMap = {
    E: "Amateur Extra",
    A: "Advanced",
    G: "General",
    P: "Technician Plus",
    T: "Technician",
    N: "Novice"
};

var map = {
    AM: function(doc) {
        return {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            ebf_number: doc[3],
            callsign: doc[4],
            licence_class: classMap[doc[5]] || doc[5],
            group_code: doc[6], // Unsure what this is
            region_code: doc[7],
            trustee_callsign: doc[8],
            is_trustee: doc[9],
            has_physician_cert: doc[10], // Unsure what this is
            has_ve_signature: doc[11], // Unsure what this is
            call_change_req: doc[12],
            is_vanity_change: doc[13], // Unsure what this is
            vanity_relationship: doc[14], // Unsure what this is
            prev_callsign: doc[15],
            prev_licence_class: classMap[doc[16]] || doc[16],
            trustee_name: doc[17]
        };
    }
};

function ULSParser(dirPath) {
    this.paths = {
        root: dirPath,
        AM: path.join(dirPath, "AM.dat"),
        EN: path.join(dirPath, "EN.dat"),
        HD: path.join(dirPath, "HD.dat")
    };
    this.rootPath = dirPath;

    return this;
}

var p = ULSParser.prototype;

p.parseEntriesForType = function(t, processLine) {
    var self = this;
    var path = this.paths[t];

    lineReader.eachLine(path, function(line, last, cb) {
        line = line.trim().split("|");
        var type = line[0];

        var doc;
        // First see if we have a translator for it
        if (map[type]) {
            doc = map[type](line);
        } else {
            doc = line;
        }

        var doneCb = function(stop) {
            if (stop) {
                cb(false);
            } else {
                if (last) {
                    processLine(null);
                } else {
                    cb();
                }
            }
        };

        processLine(doc, doneCb);
    });
};

module.exports = ULSParser;
