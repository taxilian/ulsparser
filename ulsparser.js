
var lineReader = require('line-reader'),
    path       = require('path'),
    logCodeMap = require("./hs_codes");

var classMap = {
    E: "Amateur Extra",
    A: "Advanced",
    G: "General",
    P: "Technician Plus",
    T: "Technician",
    N: "Novice"
};

var entityTypeMap = {
    L: "Licensee",
    CL: "Licensee Contact",
    O: "Owner",
    R: "Assignor",
    E: "Transferee",
    CR: "Assignor Contact",
    CE: "Transferee Contact",
    S: "Lessee",
    CS: "Lesee Contact"
};

var applicantTypeCodeMap = {
    B: "Amateur Club",
    C: "Corporation",
    D: "General Partnership",
    E: "Limited Partnership",
    F: "Limited Liability Partnership",
    G: "Governmental Entity",
    H: "Other",
    I: "Individual",
    J: "Joint Venture",
    L: "Limited Liability Company",
    M: "Military Recreation",
    O: "Consortium",
    P: "Partnership",
    R: "RACES",
    T: "Trust",
    U: "Unincorporated Association"
};

var licenseStatusMap = {
    A: "Active",
    C: "Canceled",
    E: "Expired",
    L: "Pending Legal Status",
    P: "Parent Station Canceled",
    T: "Terminated"
};

var attachmentCodeMap = {
    A: "Application",
    B: "Cellular Cross Interest",
    C: "Confidentiality",
    D: "Divestiture",
    E: "603-T (Spectrum Leasing)",
    F: "Fee Exemption",
    G: "BRSChannel 1,2,2A Notification",
    I: "Indirect Ownership",
    L: "Letter",
    M: "800 MHz Band Reconfiguration",
    N: "Ownership",
    O: "Other",
    P: "Pleading",
    Q: "Confidential Pleading",
    R: "Data Correction",
    S: "1.2112(a)(6)",
    T: "47 C. F. R. 17.14 ASR Exemption",
    U: "Quiet Zone Consent",
    W: "Waiver",
    X: "Tribal Govt. Certification",
    Y: "Tribal Lands Waiver Request",
    Z: "TCNS Internal Reply",
    NBAND: "Rule 90.209(b)(6) Certification"
};

var map = {
    AM: function(doc) { // Amateur
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
    },
    CO: function(doc) { // Comments
        return {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            callsign: doc[3],
            comment_date: doc[4],
            comment_text: doc[5],
            status_code: doc[6],
            status_date: doc[7]
        };
    },
    EN: function(doc) { // Entity
        var ret = {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            ebf_number: doc[3],
            callsign: doc[4],
            entity_type: entityTypeMap[doc[5]] || doc[5],
            licensee_id: doc[6],
            entity_name: doc[7],
            first_name: doc[8],
            middle_initial: doc[9],
            last_name: doc[10],
            suffix: doc[11],
            phone: doc[12],
            fax: doc[13],
            email: doc[14],
            address: doc[15],
            city: doc[16],
            state: doc[17],
            zip: doc[18],
            pobox: doc[19],
            attn_line: doc[20],
            sgin: doc[21],
            frn: doc[22],
            applicant_type: applicantTypeCodeMap[doc[23]] || doc[23],
            status_code: doc[25],
            status_date: doc[26]
        };
        if (ret.applicant_type == "Other") { ret.applicant_type = doc[24]; }
    },
    HD: function(doc) { // Application / License Header
        return {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            ebf_number: doc[3],
            callsign: doc[4],
            license_status: licenseStatusMap[doc[5]] || doc[5],
            radio_service_code: doc[6],
            grant_date: doc[7],
            expired_date: doc[8],
            cancellation_date: doc[9],

            eligibility_rule_num: doc[10],

            is_alien: doc[12],
            is_alien_government: doc[13],
            is_alien_corp: doc[14],
            is_alien_officer: doc[15],
            is_alien_control: doc[16],

            is_revoked: doc[17],
            is_convicted: doc[18],
            is_adjudged: doc[19],

            is_common_carrier: doc[21],
            is_noncommon_carrier: doc[22],
            is_private_comm: doc[23],
            is_fixed: doc[24],
            is_mobile: doc[25],
            is_radiolocation: doc[26],
            is_satellite: doc[27],
            is_dev_or_demo: doc[28],
            is_interconnected_service: doc[29],

            certifier_first_name: doc[30],
            certifier_middle_initial: doc[31],
            certifier_last_name: doc[32],
            certifier_suffix: doc[33],
            certifier_title: doc[34],

            // I seriously doubt these are ever filled out, but in the interest of supporting the spec...
            is_female: doc[35],
            is_black: doc[36], // I'm not trying to be racist here, but is_black_or_african_american would be ridiculous to type
            is_native_american: doc[37],
            is_hawaiian: doc[38],
            is_asian: doc[39],
            is_white: doc[40],
            is_hispanic: doc[41],

            effective_date: doc[42],
            last_action_date: doc[43],
            auction_id: doc[44],

            broadcast_services_reg_status: doc[45],
            band_manager_reg_status: doc[46],
            broadcast_services_type_of_radio: doc[47],
            alien_ruling: doc[48],

            is_licensee_name_change: doc[49]
        };
    },
    HS: function(doc) { // History
        return {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            callsign: doc[3],
            log_date: doc[4],
            code: doc[5],
            code_text: logCodeMap(doc[5]) || doc[5]
        };
    },
    LA: function(doc) { // License Attachments; note that these aren't real useful since we can't get the files
        return {
            type: doc[0],
            u_id: doc[1],
            callsign: doc[2],
            attachment_code: doc[3],
            attachment_type: attachmentCodeMap[doc[3]] || doc[3],
            attachment_desc: doc[4],
            attachment_date: doc[5],
            attachment_filename: doc[6],
            action_performed: doc[7]
        };
    },
    SC: function(doc) { // Special Condition
        return {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            ebf_number: doc[3],
            callsign: doc[4],
            special_condition_type: doc[5], // Can't find any docs for this
            special_condition_code: doc[6], // Can't find any docs for this
            status_code: doc[7], // Can't find any docs for this
            status_date: doc[8]
        };
    },
    SF: function(doc) { // License Free Form Special Condition
        // ... whatever that is supposed to mean?
        return {
            type: doc[0],
            u_id: doc[1],
            uls_filenumber: doc[2],
            ebf_number: doc[3],
            callsign: doc[4],

            license_free_form_type: doc[5],
            unique_license_free_form_id: doc[6],
            sequence_number: doc[7],
            license_free_form_condition: doc[8],
            status_code: doc[9],
            status_date: doc[10]
        };
    }
};

function ULSParser(dirPath) {
    this.paths = {
        root: dirPath,
        AM: path.join(dirPath, "AM.dat"),
        CO: path.join(dirPath, "CO.dat"),
        EN: path.join(dirPath, "EN.dat"),
        HD: path.join(dirPath, "HD.dat"),
        HS: path.join(dirPath, "HS.dat"),
        LA: path.join(dirPath, "LA.dat"),
        SC: path.join(dirPath, "SC.dat"),
        SF: path.join(dirPath, "SF.dat")
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

ULSParser.classMap = classMap;
ULSParser.entityTypeMap = entityTypeMap;
ULSParser.applicantTypeCodeMap = applicantTypeCodeMap;
ULSParser.licenseStatusMap = licenseStatusMap;
ULSParser.attachmentCodeMap = attachmentCodeMap;
ULSParser.logCodeMap = logCodeMap;
