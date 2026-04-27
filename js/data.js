// ============================================
// NIGALEX PWA - Profile Database
// Updated: New accessories, glass, angle bar, multi-size support
// ============================================

const PROFILE_DATA = {
    "curtain-wall": {
        name: "Curtain Wall (Semi-Frameless)",
        variants: [{ id: "standard", name: "Standard" }],
        profiles: [
            { name: "TRANSOM", number: "20858", area: 371, weight: 2104, width: 54, height: 58, thickness: "1.8", type: "frame", category: "profile" },
            { name: "STRUCTURAL PANEL", number: "21689", area: 221, weight: 685, width: 65, height: 17.5, thickness: "1.8/2.0", type: "panel", category: "profile" }
        ],
        accessories: [
            { name: "Hinge Pair (Big)", unit: "pair", qtyPerPanel: 1, category: "accessory" },
            { name: "Hinge Pair (Small)", unit: "pair", qtyPerPanel: 1, category: "accessory" },
            { name: "Glazing Rubber (Glass)", unit: "m", factor: "glass_perimeter", category: "accessory" },
            { name: "Glazing Rubber (Frame)", unit: "m", factor: "frame_perimeter", category: "accessory" },
            { name: "Handle Lock", unit: "pc", qtyPerPanel: 1, category: "accessory" }
        ],
        rules: {
            frameDepth: 54,
            panelDepth: 17.5,
            dividerWidth: 54
        }
    },

    "casement": {
        name: "Casement Window (CW42)",
        variants: [
            { id: "cego1", name: "CEGO 1 - Standard Gauge" },
            { id: "cego3", name: "CEGO 3 - Medium Gauge" },
            { id: "thin", name: "Thin Gauge" }
        ],
        profiles: {
            "cego1": [
                { name: "OUTER FRAME WITH HIDDEN HINGES", number: "21199", area: 254, weight: 715, width: 42, height: 43, thickness: "1.5", type: "outer", category: "profile" },
                { name: "OUTER FRAME / VENT", number: "21200", area: 278, weight: 734, width: 42, height: 43, thickness: "1.4", type: "outer", category: "profile" },
                { name: "SINGLE-GLAZING VENT (INNER)", number: "21201", area: 307, weight: 873, width: 42, height: 65, thickness: "1.4", type: "vent", category: "profile" },
                { name: "MULLION", number: "21202", area: 276, weight: 903, width: 42, height: 65, thickness: "1.4", type: "mullion", category: "profile" },
                { name: "DIVIDER", number: "30234", area: 202, weight: 358, width: 21, height: 28, thickness: "1.3", type: "divider", category: "profile" },
                { name: "NET/BURGLARY TRAY-Bottom", number: "12321", area: 283, weight: 530, width: 75, height: 20.1, thickness: "1.4", type: "tray", category: "profile" },
                { name: "3-PANEL MULLION", number: "21222", area: 349, weight: 1030, width: 42, height: 69, thickness: "1.5", type: "mullion", category: "profile" },
                { name: "BIG OUTER FRAME", number: "21223", area: 314, weight: 889, width: 42, height: 61.4, thickness: "1.4", type: "outer", category: "profile" },
                { name: "GLAZING BEAD (double glazing)", number: "12586", area: 120, weight: 238, width: 18, height: 15, thickness: "1.3", type: "bead", category: "profile" },
                { name: "GLAZING BEAD FOR FIXED LIGHT", number: "12322", area: 139, weight: 271, width: 27, height: 15, thickness: "1.3", type: "bead", category: "profile" },
                { name: "NET/BURGLARY TRAY-TOP", number: "12323", area: 334, weight: 628, width: 75, height: 20.1, thickness: "1.4", type: "tray", category: "profile" }
            ],
            "cego3": [
                { name: "OUTER FRAME WITH HIDDEN HINGES", number: "21673", area: 259, weight: 587, width: 42, height: 43.5, thickness: "1.2", type: "outer", category: "profile" },
                { name: "OUTER FRAME / VENT", number: "21674", area: 280, weight: 636, width: 42, height: 43, thickness: "1.2", type: "outer", category: "profile" },
                { name: "VENT (INNER)", number: "21675", area: 310, weight: 764, width: 42, height: 65, thickness: "1.2", type: "vent", category: "profile" },
                { name: "2-PANEL MULLION", number: "21676", area: 295, weight: 797, width: 42, height: 65, thickness: "1.2", type: "mullion", category: "profile" },
                { name: "GLAZING BEAD FOR FIXED LIGHT", number: "12700", area: 139, weight: 248, width: 27, height: 15, thickness: "1.2", type: "bead", category: "profile" },
                { name: "3-PANEL MULLION", number: "21745", area: 362, weight: 854, width: 37, height: 69, thickness: "1.2", type: "mullion", category: "profile" }
            ],
            "thin": [
                { name: "OUTER FRAME WITH HIDDEN HINGES", number: "22004", area: 261, weight: 507, width: 42, height: 43, thickness: "1.0", type: "outer", category: "profile" },
                { name: "OUTER FRAME / VENT", number: "22005", area: 283, weight: 549, width: 42, height: 43, thickness: "1.0", type: "outer", category: "profile" },
                { name: "SINGLE-GLAZING VENT (INNER)", number: "22006", area: 312, weight: 644, width: 42, height: 65, thickness: "1.0", type: "vent", category: "profile" },
                { name: "MULLION", number: "22007", area: 282, weight: 676, width: 42, height: 65, thickness: "1.0", type: "mullion", category: "profile" },
                { name: "3-PANEL MULLION", number: "22008", area: 360, weight: 724, width: 42, height: 69, thickness: "1.0", type: "mullion", category: "profile" },
                { name: "BIG OUTER FRAME", number: "22009", area: 325, weight: 656, width: 42, height: 61.4, thickness: "1.0", type: "outer", category: "profile" }
            ]
        },
        accessories: [
            { name: "Inner Hinge", unit: "set", qtyPerPanel: 1, category: "accessory" },
            { name: "Glazing Rubber (Glass)", unit: "m", factor: "glass_perimeter", category: "accessory" },
            { name: "Handle (Window)", unit: "pc", qtyPerPanel: 1, category: "accessory" },
            { name: "Lock (Door)", unit: "pc", qtyPerPanel: 1, category: "accessory" }
        ],
        rules: {
            frameDepth: 42,
            ventHeight: 65,
            mullionWidth: 42,
            hingeSide: 30,
            lockSide: 30
        }
    },

    "projected": {
        name: "Projected Window",
        variants: [
            { id: "as46", name: "AS46" },
            { id: "cego", name: "CEGO" }
        ],
        profiles: {
            "as46": [
                { name: "CORNER BRACKET", number: "11004", area: 320, weight: 3717, width: 100, height: 60, thickness: "9.5", type: "bracket", category: "profile" },
                { name: "OUTER FRAME", number: "11005", area: 270, weight: 670, width: 39, height: 41, thickness: "1.8", type: "outer", category: "profile" },
                { name: "MULLION", number: "20301", area: 224, weight: 1049, width: 39, height: 59, thickness: "1.8/2.0", type: "mullion", category: "profile" },
                { name: "GLAZING BEAD", number: "11226", area: 179, weight: 349, width: 28, height: 24.5, thickness: "1.3/1.5", type: "bead", category: "profile" },
                { name: "OUTER WITH WATER SEAL", number: "11006", area: 319, weight: 826, width: 59, height: 41, thickness: "1.8", type: "outer", category: "profile" },
                { name: "MULLION WITH WATER SEAL", number: "20364", area: 293, weight: 1185, width: 59, height: 59, thickness: "2.0", type: "mullion", category: "profile" },
                { name: "VENT PROFILE", number: "20300", area: 320, weight: 1153, width: 45.7, height: 60, thickness: "1.2/1.8/2.0", type: "vent", category: "profile" },
                { name: "PARTITION PROFILE", number: "20395", area: 228, weight: 952, width: 46, height: 34, thickness: "1.5/1.8", type: "partition", category: "profile" },
                { name: "GLAZING BEAD", number: "11227", area: 136, weight: 268, width: 16, height: 24.5, thickness: "1.5", type: "bead", category: "profile" }
            ],
            "cego": [
                { name: "VENT PROFILE", number: "11488", area: 224, weight: 501, width: 30, height: 47, thickness: "1.5", type: "vent", category: "profile" },
                { name: "OUTER FRAME", number: "11489", area: 248, weight: 562, width: 30, height: 47, thickness: "1.5", type: "outer", category: "profile" },
                { name: "GLAZING BEAD", number: "11484", area: 118, weight: 164, width: 28, height: 19.6, thickness: "1.5", type: "bead", category: "profile" },
                { name: "CORNER BRACKET", number: "11483", area: 229, weight: 935, width: 50, height: 50, thickness: "4.6", type: "bracket", category: "profile" },
                { name: "MULLION", number: "20491", area: 230, weight: 717, width: 58, height: 30, thickness: "1.5", type: "mullion", category: "profile" }
            ]
        },
        accessories: [
            { name: "Hinge Pair (Big)", unit: "pair", qtyPerPanel: 1, category: "accessory" },
            { name: "Hinge Pair (Small)", unit: "pair", qtyPerPanel: 1, category: "accessory" },
            { name: "Glazing Rubber (Glass)", unit: "m", factor: "glass_perimeter", category: "accessory" },
            { name: "Handle Lock", unit: "pc", qtyPerPanel: 1, category: "accessory" }
        ],
        rules: {
            frameDepth: 39,
            ventDepth: 60,
            projection: 100
        }
    },

    "sliding": {
        name: "Sliding Window",
        variants: [
            { id: "cego1", name: "CEGO 1" },
            { id: "cego2", name: "CEGO 2" },
            { id: "cego3", name: "CEGO 3" }
        ],
        profiles: {
            "cego1": [
                { name: "SINGLE SIDE JAMB", number: "11487", area: 200, weight: 413, width: 35, height: 27, thickness: "1.6", type: "jamb", category: "profile" },
                { name: "INTERLOCK STILE", number: "20493", area: 223, weight: 709, width: 32.5, height: 31, thickness: "1.6", type: "stile", category: "profile" },
                { name: "BOTTOM RAIL", number: "30122", area: 359, weight: 779, width: 23, height: 60, thickness: "1.6", type: "rail", category: "profile" },
                { name: "SLIDING DIVIDER (BIG)", number: "20949", area: 249, weight: 772, width: 24.5, height: 47.7, thickness: "1.5", type: "divider", category: "profile" },
                { name: "SINGLE TRACK / EXTENSION", number: "11486", area: 146, weight: 387, width: 38, height: 29, thickness: "1.5", type: "track", category: "profile" },
                { name: "DOUBLE SIDE JAMB", number: "11431", area: 313, weight: 658, width: 70, height: 27, thickness: "1.5", type: "jamb", category: "profile" },
                { name: "TOP RAIL", number: "30121", area: 320, weight: 714, width: 18, height: 47.5, thickness: "1.6", type: "rail", category: "profile" },
                { name: "LOCK STILE", number: "20492", area: 224, weight: 758, width: 25, height: 50.8, thickness: "1.6", type: "stile", category: "profile" },
                { name: "DOUBLE TRACK", number: "11485", area: 332, weight: 901, width: 75, height: 29, thickness: "1.3", type: "track", category: "profile" },
                { name: "TRIPLE TRACK", number: "11479", area: 459, weight: 1265, width: 108.9, height: 29, thickness: "1.3", type: "track", category: "profile" }
            ],
            "cego2": [
                { name: "BOTTOM RAIL", number: "30122", area: 359, weight: 779, width: 22.8, height: 59.8, thickness: "1.3", type: "rail", category: "profile" },
                { name: "TOP RAIL", number: "30232", area: 328, weight: 596, width: 22.8, height: 47.4, thickness: "1.3", type: "rail", category: "profile" },
                { name: "LOCK STILE", number: "20058", area: 223, weight: 588, width: 24.8, height: 50.1, thickness: "1.3", type: "stile", category: "profile" },
                { name: "SLIDING DIVIDER", number: "20057", area: 251, weight: 681, width: 24.5, height: 47.7, thickness: "1.3", type: "divider", category: "profile" },
                { name: "SINGLE SIDE JAMB", number: "10435", area: 199, weight: 358, width: 34.8, height: 27, thickness: "1.3", type: "jamb", category: "profile" },
                { name: "SINGLE-TRACK / EXTENSION", number: "10436", area: 167, weight: 324, width: 38, height: 29, thickness: "1.3", type: "track", category: "profile" },
                { name: "INTER-LOCK STILE", number: "20056", area: 229, weight: 555, width: 32.5, height: 30.8, thickness: "1.3", type: "stile", category: "profile" },
                { name: "DOUBLE SIDE JAMB", number: "10434", area: 316, weight: 589, width: 70, height: 27, thickness: "1.4", type: "jamb", category: "profile" },
                { name: "DOUBLE-TRACK", number: "10433", area: 333, weight: 761, width: 75, height: 29, thickness: "1.3", type: "track", category: "profile" },
                { name: "TRIPLE-TRACK", number: "10432", area: 460, weight: 1073, width: 108.9, height: 29, thickness: "1.3", type: "track", category: "profile" }
            ],
            "cego3": [
                { name: "INTERLOCK", number: "12953", area: 175, weight: 236, width: 37.9, height: 31.8, thickness: "1.0", type: "stile", category: "profile" },
                { name: "JOINT PANEL", number: "21994", area: 90, weight: 165, width: 20.7, height: 19.1, thickness: "0.9", type: "panel", category: "profile" },
                { name: "LOCKSTYLE (single glazing)", number: "21991", area: 333, weight: 508, width: 28, height: 60.1, thickness: "0.9", type: "stile", category: "profile" },
                { name: "LOCKSTYLE (double glazing)", number: "21990", area: 321, weight: 493, width: 28, height: 60.1, thickness: "0.9", type: "stile", category: "profile" },
                { name: "3-TRACK SLIDING", number: "21993", area: 482, weight: 885, width: 87, height: 45, thickness: "0.9", type: "track", category: "profile" },
                { name: "2-TRACK SLIDING", number: "21992", area: 379, weight: 609, width: 39.8, height: 45, thickness: "0.9", type: "track", category: "profile" }
            ]
        },
        accessories: [
            { name: "Glazing Rubber (Glass)", unit: "m", factor: "glass_perimeter", category: "accessory" },
            { name: "Lock", unit: "pc", qtyPerPanel: 1, category: "accessory" },
            { name: "Window Roller", unit: "set", qtyPerPanel: 2, category: "accessory" },
            { name: "Door Roller", unit: "set", qtyPerPanel: 2, category: "accessory" }
        ],
        rules: {
            trackHeight: 29,
            panelOverlap: 20,
            jambDepth: 27,
            railHeight: 60
        }
    }
};

// Protector Bar Data
const PROTECTOR_DATA = {
    infil: {
        name: "Protector Bar - Infil",
        description: "Hollow aluminium pipe",
        standardLength: 5500,
        outerDiameter: 12,
        innerDiameter: 8,
        weight: 150,
        category: "protector"
    },
    steelRod: {
        name: "Protector Bar - Steel Rod",
        description: "Solid steel rod that passes through infil",
        standardLength: 39000,
        diameter: 6,
        weight: 220,
        category: "protector"
    }
};

// Angle Bar Data (40x40mm, 5.5m bars, cut to 40mm pieces)
const ANGLE_BAR_DATA = {
    name: "Angle Bar (40x40mm)",
    description: "40mm x 40mm angle bar for panel joints",
    standardLength: 5500,
    cutLength: 40,
    weight: 850,
    category: "angle"
};

// Glass Data
const GLASS_DATA = {
    sheetHeight: 2133,
    sheetWidth: 3352,
    thickness: 4,
    weight: 2500,
    category: "glass"
};

// Standard bar length
const STANDARD_LENGTH = 5500;

// Default Price List (full bar prices - user editable)
const DEFAULT_PRICE_LIST = {
    // Curtain Wall Profiles
    "20858": { name: "TRANSOM", unitPrice: 0, unit: "bar" },
    "21689": { name: "STRUCTURAL PANEL", unitPrice: 0, unit: "bar" },

    // Casement CEGO1
    "21199": { name: "OUTER FRAME WITH HIDDEN HINGES", unitPrice: 0, unit: "bar" },
    "21200": { name: "OUTER FRAME / VENT", unitPrice: 0, unit: "bar" },
    "21201": { name: "SINGLE-GLAZING VENT (INNER)", unitPrice: 0, unit: "bar" },
    "21202": { name: "MULLION", unitPrice: 0, unit: "bar" },
    "30234": { name: "DIVIDER", unitPrice: 0, unit: "bar" },
    "12321": { name: "NET/BURGLARY TRAY-Bottom", unitPrice: 0, unit: "bar" },
    "21222": { name: "3-PANEL MULLION", unitPrice: 0, unit: "bar" },
    "21223": { name: "BIG OUTER FRAME", unitPrice: 0, unit: "bar" },
    "12586": { name: "GLAZING BEAD (double glazing)", unitPrice: 0, unit: "bar" },
    "12322": { name: "GLAZING BEAD FOR FIXED LIGHT", unitPrice: 0, unit: "bar" },
    "12323": { name: "NET/BURGLARY TRAY-TOP", unitPrice: 0, unit: "bar" },

    // Casement CEGO3
    "21673": { name: "OUTER FRAME WITH HIDDEN HINGES", unitPrice: 0, unit: "bar" },
    "21674": { name: "OUTER FRAME / VENT", unitPrice: 0, unit: "bar" },
    "21675": { name: "VENT (INNER)", unitPrice: 0, unit: "bar" },
    "21676": { name: "2-PANEL MULLION", unitPrice: 0, unit: "bar" },
    "12700": { name: "GLAZING BEAD FOR FIXED LIGHT", unitPrice: 0, unit: "bar" },
    "21745": { name: "3-PANEL MULLION", unitPrice: 0, unit: "bar" },

    // Casement Thin
    "22004": { name: "OUTER FRAME WITH HIDDEN HINGES", unitPrice: 0, unit: "bar" },
    "22005": { name: "OUTER FRAME / VENT", unitPrice: 0, unit: "bar" },
    "22006": { name: "SINGLE-GLAZING VENT (INNER)", unitPrice: 0, unit: "bar" },
    "22007": { name: "MULLION", unitPrice: 0, unit: "bar" },
    "22008": { name: "3-PANEL MULLION", unitPrice: 0, unit: "bar" },
    "22009": { name: "BIG OUTER FRAME", unitPrice: 0, unit: "bar" },

    // Projected AS46
    "20301": { name: "MULLION", unitPrice: 0, unit: "bar" },
    "11005": { name: "OUTER FRAME", unitPrice: 0, unit: "bar" },
    "11006": { name: "OUTER WITH WATER SEAL", unitPrice: 0, unit: "bar" },
    "20364": { name: "MULLION WITH WATER SEAL", unitPrice: 0, unit: "bar" },
    "20300": { name: "VENT PROFILE", unitPrice: 0, unit: "bar" },
    "20395": { name: "PARTITION PROFILE", unitPrice: 0, unit: "bar" },
    "11227": { name: "GLAZING BEAD", unitPrice: 0, unit: "bar" },

    // Projected CEGO
    "11488": { name: "VENT PROFILE", unitPrice: 0, unit: "bar" },
    "11489": { name: "OUTER FRAME", unitPrice: 0, unit: "bar" },
    "11484": { name: "GLAZING BEAD", unitPrice: 0, unit: "bar" },
    "11483": { name: "CORNER BRACKET", unitPrice: 0, unit: "bar" },
    "20491": { name: "MULLION", unitPrice: 0, unit: "bar" },

    // Sliding CEGO1
    "11487": { name: "SINGLE SIDE JAMB", unitPrice: 0, unit: "bar" },
    "20493": { name: "INTERLOCK STILE", unitPrice: 0, unit: "bar" },
    "30122": { name: "BOTTOM RAIL", unitPrice: 0, unit: "bar" },
    "20949": { name: "SLIDING DIVIDER (BIG)", unitPrice: 0, unit: "bar" },
    "11486": { name: "SINGLE TRACK / EXTENSION", unitPrice: 0, unit: "bar" },
    "11431": { name: "DOUBLE SIDE JAMB", unitPrice: 0, unit: "bar" },
    "30121": { name: "TOP RAIL", unitPrice: 0, unit: "bar" },
    "20492": { name: "LOCK STILE", unitPrice: 0, unit: "bar" },
    "11485": { name: "DOUBLE TRACK", unitPrice: 0, unit: "bar" },
    "11479": { name: "TRIPLE TRACK", unitPrice: 0, unit: "bar" },

    // Sliding CEGO2
    "30232": { name: "TOP RAIL", unitPrice: 0, unit: "bar" },
    "20058": { name: "LOCK STILE", unitPrice: 0, unit: "bar" },
    "20057": { name: "SLIDING DIVIDER", unitPrice: 0, unit: "bar" },
    "10435": { name: "SINGLE SIDE JAMB", unitPrice: 0, unit: "bar" },
    "10436": { name: "SINGLE-TRACK / EXTENSION", unitPrice: 0, unit: "bar" },
    "20056": { name: "INTER-LOCK STILE", unitPrice: 0, unit: "bar" },
    "10434": { name: "DOUBLE SIDE JAMB", unitPrice: 0, unit: "bar" },
    "10433": { name: "DOUBLE-TRACK", unitPrice: 0, unit: "bar" },
    "10432": { name: "TRIPLE-TRACK", unitPrice: 0, unit: "bar" },

    // Sliding CEGO3
    "12953": { name: "INTERLOCK", unitPrice: 0, unit: "bar" },
    "21994": { name: "JOINT PANEL", unitPrice: 0, unit: "bar" },
    "21991": { name: "LOCKSTYLE (single glazing)", unitPrice: 0, unit: "bar" },
    "21990": { name: "LOCKSTYLE (double glazing)", unitPrice: 0, unit: "bar" },
    "21993": { name: "3-TRACK SLIDING", unitPrice: 0, unit: "bar" },
    "21992": { name: "2-TRACK SLIDING", unitPrice: 0, unit: "bar" },

    // Protector Bars
    "INFIL": { name: "Protector Bar - Infil", unitPrice: 0, unit: "bar" },
    "STEEL_ROD": { name: "Protector Bar - Steel Rod", unitPrice: 0, unit: "rod" },

    // Angle Bar
    "ANGLE_BAR": { name: "Angle Bar (40x40mm)", unitPrice: 0, unit: "bar" },

    // Glass
    "GLASS_SHEET": { name: "Glass Sheet (2133x3352mm)", unitPrice: 0, unit: "sheet" },

    // Curtain Wall Accessories
    "ACC_HINGE_PAIR_BIG": { name: "Hinge Pair (Big)", unitPrice: 0, unit: "pair" },
    "ACC_HINGE_PAIR_SMALL": { name: "Hinge Pair (Small)", unitPrice: 0, unit: "pair" },
    "ACC_GLAZING_RUBBER_GLASS": { name: "Glazing Rubber (Glass)", unitPrice: 0, unit: "m" },
    "ACC_GLAZING_RUBBER_FRAME": { name: "Glazing Rubber (Frame)", unitPrice: 0, unit: "m" },
    "ACC_HANDLE_LOCK": { name: "Handle Lock", unitPrice: 0, unit: "pc" },

    // Casement Accessories
    "ACC_INNER_HINGE": { name: "Inner Hinge", unitPrice: 0, unit: "set" },
    "ACC_HANDLE_WINDOW": { name: "Handle (Window)", unitPrice: 0, unit: "pc" },
    "ACC_LOCK_DOOR": { name: "Lock (Door)", unitPrice: 0, unit: "pc" },

    // Projected Accessories

    // Sliding Accessories
    "ACC_LOCK": { name: "Lock", unitPrice: 0, unit: "pc" },
    "ACC_WINDOW_ROLLER": { name: "Window Roller", unitPrice: 0, unit: "set" },
    "ACC_DOOR_ROLLER": { name: "Door Roller", unitPrice: 0, unit: "set" }
};

// Helper function to get all items for price list
function getAllPriceListItems() {
    const items = [];

    Object.keys(PROFILE_DATA).forEach(systemKey => {
        const system = PROFILE_DATA[systemKey];
        if (system.profiles) {
            if (Array.isArray(system.profiles)) {
                system.profiles.forEach(p => {
                    items.push({
                        code: p.number,
                        name: p.name,
                        system: system.name,
                        category: "Profile",
                        unit: "bar"
                    });
                });
            } else {
                Object.keys(system.profiles).forEach(variant => {
                    system.profiles[variant].forEach(p => {
                        items.push({
                            code: p.number,
                            name: p.name,
                            system: `${system.name} (${variant})`,
                            category: "Profile",
                            unit: "bar"
                        });
                    });
                });
            }
        }

        if (system.accessories) {
            system.accessories.forEach(acc => {
                const accCode = `ACC_${acc.name.toUpperCase().replace(/[()]/g, '').replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')}`;
                items.push({
                    code: accCode,
                    name: acc.name,
                    system: system.name,
                    category: "Accessory",
                    unit: acc.unit
                });
            });
        }
    });

    items.push({
        code: "INFIL",
        name: "Protector Bar - Infil",
        system: "All Systems",
        category: "Protector",
        unit: "bar"
    });
    items.push({
        code: "STEEL_ROD",
        name: "Protector Bar - Steel Rod",
        system: "All Systems",
        category: "Protector",
        unit: "rod"
    });
    items.push({
        code: "ANGLE_BAR",
        name: "Angle Bar (40x40mm)",
        system: "All Systems",
        category: "Angle Bar",
        unit: "bar"
    });
    items.push({
        code: "GLASS_SHEET",
        name: "Glass Sheet (2133x3352mm)",
        system: "All Systems",
        category: "Glass",
        unit: "sheet"
    });

    return items;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROFILE_DATA, PROTECTOR_DATA, ANGLE_BAR_DATA, GLASS_DATA, STANDARD_LENGTH, DEFAULT_PRICE_LIST, getAllPriceListItems };
}
