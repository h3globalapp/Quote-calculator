// ============================================
// NIGALEX PWA - Calculator Engine
// Updated: Multi-size windows, angle bars, glass, project costing
// NEW: True 2D Guillotine Glass Optimizer with Rotation
// ============================================

class NigalexCalculator {
    constructor() {
        this.standardLength = 5500;
        this.steelRodLength = 39000;
        this.results = null;
        this.priceList = this.loadPriceList();

        // Glass optimizer config
        this.glassConfig = {
            sheetWidth: 3352,
            sheetHeight: 2133,
            edgeMargin: 10,      // margin from sheet edges
            cutMargin: 5,        // margin between cuts/panels
            allowRotation: true,
            allowSheetRotation: true  // allow sheet in portrait too
        };
    }

    loadPriceList() {
        try {
            const saved = localStorage.getItem('nigalex_price_list');
            if (saved) {
                const parsed = JSON.parse(saved);
                const merged = JSON.parse(JSON.stringify(DEFAULT_PRICE_LIST));
                Object.keys(parsed).forEach(key => {
                    if (merged[key]) {
                        merged[key].unitPrice = parsed[key].unitPrice || 0;
                    }
                });
                return merged;
            }
        } catch (e) {
            console.error('Error loading price list:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_PRICE_LIST));
    }

    savePriceList() {
        try {
            localStorage.setItem('nigalex_price_list', JSON.stringify(this.priceList));
        } catch (e) {
            console.error('Error saving price list:', e);
        }
    }

    updatePrice(code, price) {
        if (this.priceList[code]) {
            this.priceList[code].unitPrice = parseFloat(price) || 0;
            this.savePriceList();
            return true;
        }
        return false;
    }

    getPricePerMeter(code) {
        const item = this.priceList[code];
        if (!item || !item.unitPrice) return 0;
        if (code === 'STEEL_ROD') {
            return item.unitPrice / (this.steelRodLength / 1000);
        }
        return item.unitPrice / (this.standardLength / 1000);
    }

    getPricePerUnit(code) {
        const item = this.priceList[code];
        if (!item || !item.unitPrice) return 0;
        return item.unitPrice;
    }

    // ============================================================
    // MAIN CALCULATION
    // ============================================================
    calculate(system, variant, config) {
        const { sizes, glazing, netTray, waterSeal, protector, protectorDirection, barSpacing, projectCosts } = config;
        const systemData = PROFILE_DATA[system];
        const profiles = systemData.profiles[variant] || systemData.profiles;

        let allMaterials = [];
        let allAccessories = [];
        let allProtectorMaterials = [];
        let allAngleBars = [];
        let totalWindows = 0;

        // Collect all glass panels across all sizes for global optimization
        let allGlassPanels = [];

        // Process each size
        sizes.forEach((size, sizeIdx) => {
            const { width, height, panels, qty } = size;
            totalWindows += qty;

            let materials = [];
            let accessories = [];
            let protectorMaterials = [];
            let angleBars = [];

            switch(system) {
                case 'curtain-wall':
                    materials = this.calculateCurtainWall(width, height, panels, profiles, systemData.rules);
                    accessories = this.calculateCurtainWallAccessories(width, height, panels, systemData.accessories, config.hingeType);
                    angleBars = this.calculateAngleBars(width, height, panels, system, systemData.rules);
                    break;
                case 'casement':
                    materials = this.calculateCasement(width, height, panels, glazing, netTray, profiles, systemData.rules);
                    accessories = this.calculateCasementAccessories(width, height, panels, systemData.accessories);
                    angleBars = this.calculateAngleBars(width, height, panels, system, systemData.rules);
                    break;
                case 'projected':
                    materials = this.calculateProjected(width, height, panels, waterSeal, profiles, systemData.rules);
                    accessories = this.calculateProjectedAccessories(width, height, panels, systemData.accessories, config.hingeType);
                    angleBars = this.calculateAngleBars(width, height, panels, system, systemData.rules);
                    break;
                case 'sliding':
                    materials = this.calculateSliding(width, height, panels, profiles, systemData.rules);
                    accessories = this.calculateSlidingAccessories(width, height, panels, systemData.accessories);
                    angleBars = this.calculateAngleBars(width, height, panels, system, systemData.rules);
                    break;
            }

            // Multiply by quantity
            materials = materials.map(m => ({ ...m, qty: m.qty * qty, totalLength: m.totalLength * qty }));
            accessories = accessories.map(a => ({ ...a, qty: a.qty * qty }));
            angleBars = angleBars.map(a => ({ ...a, qty: a.qty * qty, totalLength: a.totalLength * qty, barsNeeded: Math.ceil(a.qty * qty * a.cutLength / this.standardLength) }));

            if (protector && protectorDirection && barSpacing) {
                protectorMaterials = this.calculateProtectorBars(width, height, panels, system, protectorDirection, barSpacing, systemData.rules);
                protectorMaterials = protectorMaterials.map(p => ({ ...p, qty: p.qty * qty, totalLength: p.totalLength * qty }));
            }

            // Generate glass panels for this size (before qty multiplication, then multiply)
            const glassPanelsForSize = this.generateGlassPanels(width, height, panels, system, systemData.rules, sizeIdx);
            for (let q = 0; q < qty; q++) {
                allGlassPanels.push(...glassPanelsForSize.map(p => ({...p, instanceId: q})));
            }

            allMaterials = this.mergeMaterials(allMaterials, materials);
            allAccessories = this.mergeAccessories(allAccessories, accessories);
            allAngleBars = this.mergeAngleBars(allAngleBars, angleBars);
            allProtectorMaterials = this.mergeProtectorMaterials(allProtectorMaterials, protectorMaterials);
        });

        // Optimize glass cutting globally
        const glassOptimization = this.optimizeGlassCutting(allGlassPanels);

        // Optimize cutting across ALL sizes combined
        const cuttingPlans = this.optimizeCuttingPerType(allMaterials);
        const protectorCuttingPlans = this.optimizeProtectorCuttingPerType(allProtectorMaterials);
        const angleBarCuttingPlans = this.optimizeAngleBarCutting(allAngleBars);

        // Calculate totals
        const totalWeight = allMaterials.reduce((sum, m) => sum + (m.weight * m.totalLength / 1000000), 0);
        const totalLength = allMaterials.reduce((sum, m) => sum + m.totalLength, 0);
        const totalBars = Object.values(cuttingPlans).reduce((sum, plan) => sum + plan.length, 0);
        const wastePercent = this.calculateWastePerType(cuttingPlans);

        // Calculate prices
        const materialsWithPrice = allMaterials.map(m => {
            const pricePerMeter = this.getPricePerMeter(m.number);
            const totalMeters = m.totalLength / 1000;
            return {
                ...m,
                unitPrice: pricePerMeter,
                totalPrice: (pricePerMeter * totalMeters).toFixed(2)
            };
        });

        const accessoriesWithPrice = allAccessories.map(a => {
            const accCode = `ACC_${a.name.toUpperCase().replace(/[()]/g, '').replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')}`;
            const pricePerUnit = this.priceList[accCode]?.unitPrice || 0;
            return {
                ...a,
                unitPrice: pricePerUnit,
                totalPrice: (pricePerUnit * a.qty).toFixed(2)
            };
        });

        const angleBarsWithPrice = allAngleBars.map(a => {
            const pricePerBar = this.getPricePerUnit('ANGLE_BAR');
            return {
                ...a,
                unitPrice: pricePerBar,
                totalPrice: (pricePerBar * a.barsNeeded).toFixed(2)
            };
        });

        const protectorWithPrice = allProtectorMaterials.map(p => {
            const pricePerMeter = this.getPricePerMeter(p.code);
            const totalMeters = p.totalLength / 1000;
            return {
                ...p,
                unitPrice: pricePerMeter,
                totalPrice: (pricePerMeter * totalMeters).toFixed(2)
            };
        });

        // Glass pricing
        const pricePerSheet = this.getPricePerUnit('GLASS_SHEET');
        const glassWithPrice = {
            ...glassOptimization,
            unitPrice: pricePerSheet,
            totalPrice: (pricePerSheet * glassOptimization.totalSheets).toFixed(2)
        };

        // Calculate material subtotal
        const materialSubtotal = [
            ...materialsWithPrice,
            ...accessoriesWithPrice,
            ...angleBarsWithPrice,
            ...protectorWithPrice
        ].reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0) + parseFloat(glassWithPrice.totalPrice || 0);

        // Project costs
        const transportCost = parseFloat(projectCosts?.transport || 0);
        const installationCost = parseFloat(projectCosts?.installation || 0);
        const laborCost = parseFloat(projectCosts?.labor || 0);
        const grandTotal = materialSubtotal + transportCost + installationCost + laborCost;

        this.results = {
            system: systemData.name,
            variant: variant,
            config: config,
            sizes: sizes,
            totalWindows: totalWindows,
            materials: materialsWithPrice,
            accessories: accessoriesWithPrice,
            glass: glassWithPrice,
            angleBars: angleBarsWithPrice,
            protector: protectorWithPrice,
            cuttingPlans: cuttingPlans,
            protectorCuttingPlans: protectorCuttingPlans,
            angleBarCuttingPlans: angleBarCuttingPlans,
            projectCosts: {
                transport: transportCost,
                installation: installationCost,
                labor: laborCost
            },
            totals: {
                weight: totalWeight.toFixed(2),
                length: (totalLength / 1000).toFixed(2),
                bars: totalBars,
                waste: wastePercent.toFixed(1),
                materialSubtotal: materialSubtotal.toFixed(2),
                transport: transportCost.toFixed(2),
                installation: installationCost.toFixed(2),
                labor: laborCost.toFixed(2),
                grandTotal: grandTotal.toFixed(2)
            }
        };

        return this.results;
    }

    // ============================================================
    // GLASS PANEL GENERATION (per window size)
    // ============================================================
    generateGlassPanels(width, height, panels, system, rules, sizeIdx) {
        let glassWidth, glassHeight;

        if (system === 'curtain-wall') {
            const frameDepth = rules.frameDepth || 54;
            const dividerWidth = rules.dividerWidth || 54;
            glassWidth = (width - 2 * frameDepth - (panels - 1) * dividerWidth) / panels;
            glassHeight = height - 2 * frameDepth;
        } else if (system === 'casement') {
            const frameDepth = rules.frameDepth || 42;
            const mullionWidth = rules.mullionWidth || 42;
            glassWidth = (width - 2 * frameDepth - (panels - 1) * mullionWidth) / panels;
            glassHeight = height - 2 * frameDepth;
        } else if (system === 'projected') {
            const frameDepth = rules.frameDepth || 39;
            glassWidth = (width - 2 * frameDepth) / panels;
            glassHeight = height - 2 * frameDepth;
        } else if (system === 'sliding') {
            const trackHeight = rules.trackHeight || 29;
            const panelOverlap = rules.panelOverlap || 20;
            glassWidth = (width - (panels - 1) * panelOverlap) / panels;
            glassHeight = height - 2 * trackHeight;
        }

        const panels_list = [];
        for (let p = 0; p < panels; p++) {
            panels_list.push({
                id: `S${sizeIdx}-P${p}`,
                width: Math.round(glassWidth * 10) / 10,
                height: Math.round(glassHeight * 10) / 10,
                windowSizeIdx: sizeIdx,
                panelIdx: p,
                area: glassWidth * glassHeight
            });
        }
        return panels_list;
    }

    // ============================================================
    // 2D GUILLOTINE GLASS OPTIMIZER
    // ============================================================
    _optimizeSingle(panels) {
        const cfg = this.glassConfig;
        const edge = cfg.edgeMargin;
        const cut = cfg.cutMargin;

        // Sort panels by area descending (largest first for better packing)
        const sortedPanels = [...panels].sort((a, b) => b.area - a.area);

        const sheets = [];
        let panelIdCounter = 0;

        // Color palette for different window sizes
        const colors = [
            '#2e86c1', '#28b463', '#e74c3c', '#8e44ad', '#f39c12',
            '#1abc9c', '#d35400', '#c0392b', '#2980b9', '#27ae60'
        ];

        // ============================================
// MAXRECTS CORE LOOP (REPLACES OLD LOOP)
// ============================================

for (const panel of sortedPanels) {

    let bestSheet = null;
    let bestNode = null;
    let bestScore = Infinity;

    for (const sheet of sheets) {

        for (const rect of sheet.freeRects) {

            const orientations = [
                { w: panel.width, h: panel.height, rotated: false },
                { w: panel.height, h: panel.width, rotated: true }
            ];

            for (const o of orientations) {

                const neededW = o.w + cut;
                const neededH = o.h + cut;

                if (neededW <= rect.width && neededH <= rect.height) {

                    const leftoverW = rect.width - o.w;
                    const leftoverH = rect.height - o.h;

                    const shortSide = Math.min(leftoverW, leftoverH);
                    const longSide = Math.max(leftoverW, leftoverH);
                    const areaFit = (rect.width * rect.height) - (o.w * o.h);

                    const score = areaFit * 10 + shortSide * 2 + longSide;

                    if (score < bestScore) {
                        bestScore = score;
                        bestSheet = sheet;
                        bestNode = {
                            rect,
                            width: o.w,
                            height: o.h,
                            rotated: o.rotated
                        };
                    }
                }
            }
        }
    }

    // 🔴 CREATE NEW SHEET IF NEEDED
    if (!bestNode) {

    // 🔁 LAST ATTEMPT: force fit into existing sheets
    for (const sheet of sheets) {
        for (const rect of sheet.freeRects) {

            if (
                panel.width <= rect.width &&
                panel.height <= rect.height
            ) {
                bestSheet = sheet;
                bestNode = {
                    rect,
                    width: panel.width,
                    height: panel.height,
                    rotated: false
                };
                break;
            }
        }
        if (bestNode) break;
    }

    // 🚨 ONLY NOW create new sheet
    if (!bestNode) {

        const usableW = cfg.sheetWidth - 2 * edge;
        const usableH = cfg.sheetHeight - 2 * edge;

        const newSheet = {
            id: sheets.length + 1,
            panels: [],
            freeRects: [{ x: 0, y: 0, width: usableW, height: usableH }],
            usedArea: 0
        };

        sheets.push(newSheet);

        bestSheet = newSheet;
        bestNode = {
            rect: newSheet.freeRects[0],
            width: panel.width,
            height: panel.height,
            rotated: false
        };
    }
    }

    const rect = bestNode.rect;

    const placedPanel = {
        id: panelIdCounter++,
        x: rect.x + edge,
        y: rect.y + edge,
        width: bestNode.width,
        height: bestNode.height,
        rotated: bestNode.rotated,
        windowSizeIdx: panel.windowSizeIdx,
        panelIdx: panel.panelIdx,
        originalWidth: panel.width,
        originalHeight: panel.height,
        color: '#2e86c1'
    };

    bestSheet.panels.push(placedPanel);
    bestSheet.usedArea += bestNode.width * bestNode.height;

    // 🔥 MAXRECTS SPLIT (REPLACES GUILLOTINE)
    const newRects = [];

    for (const r of bestSheet.freeRects) {

        if (
            placedPanel.x >= r.x + r.width ||
            placedPanel.x + bestNode.width <= r.x ||
            placedPanel.y >= r.y + r.height ||
            placedPanel.y + bestNode.height <= r.y
        ) {
            newRects.push(r);
            continue;
        }

        if (placedPanel.x > r.x) {
            newRects.push({
                x: r.x,
                y: r.y,
                width: placedPanel.x - r.x,
                height: r.height
            });
        }

        if (placedPanel.x + bestNode.width < r.x + r.width) {
            newRects.push({
                x: placedPanel.x + bestNode.width,
                y: r.y,
                width: (r.x + r.width) - (placedPanel.x + bestNode.width),
                height: r.height
            });
        }

        if (placedPanel.y > r.y) {
            newRects.push({
                x: r.x,
                y: r.y,
                width: r.width,
                height: placedPanel.y - r.y
            });
        }

        if (placedPanel.y + bestNode.height < r.y + r.height) {
            newRects.push({
                x: r.x,
                y: placedPanel.y + bestNode.height,
                width: r.width,
                height: (r.y + r.height) - (placedPanel.y + bestNode.height)
            });
        }
    }

    bestSheet.freeRects = pruneRects(newRects);
}







        

        // Calculate final statistics per sheet
        const sheetArea = cfg.sheetWidth * cfg.sheetHeight;

        sheets.forEach(sheet => {
            const usableArea = sheet.usableWidth * sheet.usableHeight;
            sheet.wasteArea = usableArea - sheet.usedArea;
            sheet.wastePercent = usableArea > 0 ? (sheet.wasteArea / usableArea) * 100 : 0;
            sheet.totalSheetArea = sheetArea;
        });

        const totalSheets = sheets.length;
        const totalPanels = panels.length;
        const totalGlassArea = panels.reduce((sum, p) => sum + p.area, 0);
        const totalSheetArea = totalSheets * sheetArea;
        const totalWasteArea = sheets.reduce((sum, s) => sum + s.wasteArea, 0);
        const totalUsedArea = sheets.reduce((sum, s) => sum + s.usedArea, 0);
        const totalWastePercent = totalSheetArea > 0 ? (totalWasteArea / totalSheetArea) * 100 : 0;

        return {
            name: "Glass Sheet",
            code: "GLASS_SHEET",
            qty: totalSheets,
            sheets: sheets,
            totalSheets: totalSheets,
            totalPanels: totalPanels,
            totalGlassArea: totalGlassArea,
            totalSheetArea: totalSheetArea,
            totalUsedArea: totalUsedArea,
            totalWasteArea: totalWasteArea,
            totalWastePercent: totalWastePercent,
            panelList: panels,
            sheetSize: `${cfg.sheetWidth}x${cfg.sheetHeight}mm`,
            weight: GLASS_DATA.weight,
            note: `${totalPanels} panels across ${totalSheets} sheet(s)`
        };

        optimizeGlassCutting(panels) {

    let bestResult = null;

    for (let i = 0; i < 12; i++) {

        const shuffled = [...panels].sort(() => Math.random() - 0.5);

        const result = this._optimizeSingle(shuffled);

        if (!bestResult || result.totalWaste < bestResult.totalWaste) {
            bestResult = result;
        }
    }

    return bestResult;
        }
    }

    

    mergeFreeRectangles(sheet) {
        // Remove rectangles that are too small
        sheet.freeRects = sheet.freeRects.filter(r => r.width > 20 && r.height > 20);

        // Sort by position for potential merging
        sheet.freeRects.sort((a, b) => a.y - b.y || a.x - b.x);

        // Simple merge: if two rectangles share an edge and have same dimensions, merge them
        let merged = true;
        while (merged && sheet.freeRects.length > 1) {
            merged = false;
            for (let i = 0; i < sheet.freeRects.length; i++) {
                for (let j = i + 1; j < sheet.freeRects.length; j++) {
                    const r1 = sheet.freeRects[i];
                    const r2 = sheet.freeRects[j];

                    // Check if they can be merged horizontally
                    if (r1.y === r2.y && r1.height === r2.height && r1.x + r1.width === r2.x) {
                        r1.width += r2.width;
                        sheet.freeRects.splice(j, 1);
                        merged = true;
                        break;
                    }
                    // Check if they can be merged vertically
                    if (r1.x === r2.x && r1.width === r2.width && r1.y + r1.height === r2.y) {
                        r1.height += r2.height;
                        sheet.freeRects.splice(j, 1);
                        merged = true;
                        break;
                    }
                }
                if (merged) break;
            }
        }
    }

    // ============================================================
    // ANGLE BAR CALCULATION
    // ============================================================
    calculateAngleBars(width, height, panels, system, rules) {
        const angleBars = [];
        let numJoints = 0;

        if (system === 'curtain-wall') {
            numJoints += 4; // Outer frame corners
            numJoints += panels * 4; // Panel sash corners
            if (panels > 1) numJoints += (panels - 1) * 2; // Divider joints
        } else if (system === 'casement') {
            numJoints += 4;
            numJoints += panels * 4;
            if (panels > 1) numJoints += (panels - 1) * 2;
        } else if (system === 'projected') {
            numJoints += 4;
            numJoints += panels * 4;
            if (panels > 1) numJoints += (panels - 1) * 2;
        } else if (system === 'sliding') {
            numJoints += 4;
            numJoints += panels * 4;
            if (panels > 1) numJoints += (panels - 1) * 2;
        }

        const piecesNeeded = numJoints;
        const piecesPerBar = Math.floor(this.standardLength / ANGLE_BAR_DATA.cutLength);
        const barsNeeded = Math.ceil(piecesNeeded / piecesPerBar);
        const totalLength = piecesNeeded * ANGLE_BAR_DATA.cutLength;

        angleBars.push({
            name: ANGLE_BAR_DATA.name,
            code: "ANGLE_BAR",
            qty: piecesNeeded,
            cutLength: ANGLE_BAR_DATA.cutLength,
            totalLength: totalLength,
            barsNeeded: barsNeeded,
            piecesPerBar: piecesPerBar,
            weight: ANGLE_BAR_DATA.weight,
            note: `${piecesNeeded} pieces (40mm each), ${barsNeeded} bar(s) needed`
        });

        return angleBars;
    }

    // ============================================================
    // CURTAIN WALL CALCULATION
    // ============================================================
    calculateCurtainWall(width, height, panels, profiles, rules) {
        const materials = [];
        const frameDepth = rules.frameDepth || 54;
        const dividerWidth = rules.dividerWidth || 54;

        const transom = profiles.find(p => p.name === 'TRANSOM');
        const structPanel = profiles.find(p => p.name === 'STRUCTURAL PANEL');

        if (transom) {
            materials.push({
                ...transom,
                qty: 2,
                cutLength: width,
                totalLength: 2 * width,
                weight: transom.weight,
                note: 'Outer frame - Top & Bottom'
            });
            materials.push({
                ...transom,
                qty: 2,
                cutLength: height,
                totalLength: 2 * height,
                weight: transom.weight,
                note: 'Outer frame - Left & Right'
            });
        }

        if (transom && panels > 1) {
            const dividerHeight = height - (2 * frameDepth);
            materials.push({
                ...transom,
                qty: panels - 1,
                cutLength: dividerHeight,
                totalLength: (panels - 1) * dividerHeight,
                weight: transom.weight,
                note: `${panels - 1} dividers (inner height: ${dividerHeight}mm)`
            });
        }

        if (structPanel && panels > 0) {
            const sashWidth = (width - 2 * frameDepth - (panels - 1) * dividerWidth) / panels;
            const sashHeight = height - 2 * frameDepth;

            materials.push({
                ...structPanel,
                qty: panels * 2,
                cutLength: sashWidth,
                totalLength: panels * 2 * sashWidth,
                weight: structPanel.weight,
                note: `${panels} panels - Top & Bottom (${sashWidth.toFixed(1)}mm)`
            });
            materials.push({
                ...structPanel,
                qty: panels * 2,
                cutLength: sashHeight,
                totalLength: panels * 2 * sashHeight,
                weight: structPanel.weight,
                note: `${panels} panels - Left & Right (${sashHeight.toFixed(1)}mm)`
            });
        }

        return materials;
    }

    calculateCurtainWallAccessories(width, height, panels, accessories, hingeType) {
        const frameDepth = 54;
        const dividerWidth = 54;
        const sashWidth = (width - 2 * frameDepth - (panels - 1) * dividerWidth) / panels;
        const sashHeight = height - 2 * frameDepth;
        const glassPerimeter = 2 * (sashWidth + sashHeight) * panels;
        const framePerimeter = 2 * (width + height);

        return accessories.map(acc => {
            if (acc.name.includes('Big') && hingeType === 'small') return null;
            if (acc.name.includes('Small') && hingeType === 'big') return null;

            let qty = 0;
            if (acc.factor === 'glass_perimeter') {
                qty = Math.ceil(glassPerimeter / 1000);
            } else if (acc.factor === 'frame_perimeter') {
                qty = Math.ceil(framePerimeter / 1000);
            } else if (acc.qtyPerPanel) {
                qty = acc.qtyPerPanel * panels;
            }
            return { ...acc, qty };
        }).filter(acc => acc !== null);
    }

    // ============================================================
    // CASEMENT CALCULATION
    // ============================================================
    calculateCasement(width, height, panels, glazing, netTray, profiles, rules) {
        const materials = [];
        const frameDepth = rules.frameDepth;
        const frameWidth = width;
        const frameHeight = height;

        const outerFrame = profiles.find(p => p.type === 'outer');
        if (outerFrame) {
            materials.push({
                ...outerFrame,
                qty: 2,
                cutLength: frameWidth,
                totalLength: 2 * frameWidth,
                weight: outerFrame.weight,
                note: 'Top & Bottom'
            });
            materials.push({
                ...outerFrame,
                qty: 2,
                cutLength: frameHeight,
                totalLength: 2 * frameHeight,
                weight: outerFrame.weight,
                note: 'Left & Right'
            });
        }

        const sashWidth = (frameWidth - (panels - 1) * rules.mullionWidth - 2 * frameDepth) / panels;
        const sashHeight = frameHeight - 2 * frameDepth;

        const vent = profiles.find(p => p.type === 'vent');
        if (vent && panels > 0) {
            materials.push({
                ...vent,
                qty: panels * 2,
                cutLength: sashWidth,
                totalLength: panels * 2 * sashWidth,
                weight: vent.weight,
                note: `${panels} panels`
            });
            materials.push({
                ...vent,
                qty: panels * 2,
                cutLength: sashHeight,
                totalLength: panels * 2 * sashHeight,
                weight: vent.weight,
                note: `${panels} panels`
            });
        }

        if (panels > 1) {
            const mullionName = panels === 3 ? '3-PANEL MULLION' : 'MULLION';
            const mullionProfile = profiles.find(p => p.name.includes(mullionName)) || profiles.find(p => p.type === 'mullion');
            if (mullionProfile) {
                materials.push({
                    ...mullionProfile,
                    qty: panels - 1,
                    cutLength: frameHeight,
                    totalLength: (panels - 1) * frameHeight,
                    weight: mullionProfile.weight,
                    note: `${panels - 1} mullions`
                });
            }
        }

        const beadType = glazing === 'double' ? 'GLAZING BEAD (double glazing)' : 'GLAZING BEAD FOR FIXED LIGHT';
        const bead = profiles.find(p => p.name.includes(beadType)) || profiles.find(p => p.type === 'bead');
        if (bead) {
            const beadPerimeter = 2 * (sashWidth + sashHeight) * panels;
            materials.push({
                ...bead,
                qty: Math.ceil(beadPerimeter / this.standardLength),
                cutLength: this.standardLength,
                totalLength: beadPerimeter,
                weight: bead.weight,
                note: `${glazing} glazing`
            });
        }

        if (netTray) {
            const trayBottom = profiles.find(p => p.name.includes('TRAY-Bottom'));
            const trayTop = profiles.find(p => p.name.includes('TRAY-TOP'));
            if (trayBottom) {
                materials.push({
                    ...trayBottom,
                    qty: panels,
                    cutLength: sashWidth,
                    totalLength: panels * sashWidth,
                    weight: trayBottom.weight,
                    note: 'Bottom tray'
                });
            }
            if (trayTop) {
                materials.push({
                    ...trayTop,
                    qty: panels,
                    cutLength: sashWidth,
                    totalLength: panels * sashWidth,
                    weight: trayTop.weight,
                    note: 'Top tray'
                });
            }
        }

        return materials;
    }

    calculateCasementAccessories(width, height, panels, accessories) {
        const frameDepth = 42;
        const mullionWidth = 42;
        const sashWidth = (width - (panels - 1) * mullionWidth - 2 * frameDepth) / panels;
        const sashHeight = height - 2 * frameDepth;
        const glassPerimeter = 2 * (sashWidth + sashHeight) * panels;

        return accessories.map(acc => {
            let qty = 0;
            if (acc.factor === 'glass_perimeter') {
                qty = Math.ceil(glassPerimeter / 1000);
            } else if (acc.qtyPerPanel) {
                qty = acc.qtyPerPanel * panels;
            }
            return { ...acc, qty };
        });
    }

    // ============================================================
    // PROJECTED CALCULATION
    // ============================================================
    calculateProjected(width, height, panels, waterSeal, profiles, rules) {
        const materials = [];
        const frameDepth = rules.frameDepth;

        const outerType = waterSeal ? 'OUTER WITH WATER SEAL' : 'OUTER FRAME';
        const outerFrame = profiles.find(p => p.name === outerType) || profiles.find(p => p.type === 'outer');

        if (outerFrame) {
            materials.push({
                ...outerFrame,
                qty: 2,
                cutLength: width,
                totalLength: 2 * width,
                weight: outerFrame.weight,
                note: 'Top & Bottom'
            });
            materials.push({
                ...outerFrame,
                qty: 2,
                cutLength: height,
                totalLength: 2 * height,
                weight: outerFrame.weight,
                note: 'Left & Right'
            });
        }

        const vent = profiles.find(p => p.type === 'vent');
        const sashWidth = (width - 2 * frameDepth) / panels;
        const sashHeight = height - 2 * frameDepth;

        if (vent) {
            materials.push({
                ...vent,
                qty: panels * 2,
                cutLength: sashWidth,
                totalLength: panels * 2 * sashWidth,
                weight: vent.weight,
                note: `${panels} panels`
            });
            materials.push({
                ...vent,
                qty: panels * 2,
                cutLength: sashHeight,
                totalLength: panels * 2 * sashHeight,
                weight: vent.weight,
                note: `${panels} panels`
            });
        }

        if (panels > 1) {
            const mullionType = waterSeal ? 'MULLION WITH WATER SEAL' : 'MULLION';
            const mullion = profiles.find(p => p.name === mullionType) || profiles.find(p => p.type === 'mullion');
            if (mullion) {
                materials.push({
                    ...mullion,
                    qty: panels - 1,
                    cutLength: height,
                    totalLength: (panels - 1) * height,
                    weight: mullion.weight,
                    note: `${panels - 1} mullions`
                });
            }
        }

        const bead = profiles.find(p => p.type === 'bead');
        if (bead) {
            const beadLength = 2 * (sashWidth + sashHeight) * panels;
            materials.push({
                ...bead,
                qty: Math.ceil(beadLength / this.standardLength),
                cutLength: this.standardLength,
                totalLength: beadLength,
                weight: bead.weight
            });
        }

        const bracket = profiles.find(p => p.type === 'bracket');
        if (bracket) {
            materials.push({
                ...bracket,
                qty: panels * 4,
                cutLength: bracket.height,
                totalLength: panels * 4 * bracket.height,
                weight: bracket.weight,
                note: '4 per panel'
            });
        }

        return materials;
    }

    calculateProjectedAccessories(width, height, panels, accessories, hingeType) {
        const frameDepth = 39;
        const sashWidth = (width - 2 * frameDepth) / panels;
        const sashHeight = height - 2 * frameDepth;
        const glassPerimeter = 2 * (sashWidth + sashHeight) * panels;

        return accessories.map(acc => {
            if (acc.name.includes('Big') && hingeType === 'small') return null;
            if (acc.name.includes('Small') && hingeType === 'big') return null;

            let qty = 0;
            if (acc.factor === 'glass_perimeter') {
                qty = Math.ceil(glassPerimeter / 1000);
            } else if (acc.qtyPerPanel) {
                qty = acc.qtyPerPanel * panels;
            }
            return { ...acc, qty };
        }).filter(acc => acc !== null);
    }

    // ============================================================
    // SLIDING CALCULATION
    // ============================================================
    calculateSliding(width, height, panels, profiles, rules) {
        const materials = [];
        const trackHeight = rules.trackHeight;
        const panelOverlap = rules.panelOverlap;

        let trackProfileName = 'SINGLE TRACK / EXTENSION';
        let jambType = 'SINGLE SIDE JAMB';

        if (panels === 2) {
            trackProfileName = 'DOUBLE TRACK';
            jambType = 'DOUBLE SIDE JAMB';
        } else if (panels >= 3) {
            trackProfileName = 'TRIPLE TRACK';
            jambType = 'DOUBLE SIDE JAMB';
        }

        const jamb = profiles.find(p => p.name === jambType) || profiles.find(p => p.type === 'jamb');
        if (jamb) {
            materials.push({
                ...jamb,
                qty: 2,
                cutLength: height,
                totalLength: 2 * height,
                weight: jamb.weight,
                note: 'Left & Right'
            });
        }

        const topRail = profiles.find(p => p.type === 'rail' && p.name.includes('TOP'));
        const bottomRail = profiles.find(p => p.type === 'rail' && p.name.includes('BOTTOM'));

        if (topRail) {
            materials.push({
                ...topRail,
                qty: 1,
                cutLength: width,
                totalLength: width,
                weight: topRail.weight,
                note: 'Top track'
            });
        }

        if (bottomRail) {
            materials.push({
                ...bottomRail,
                qty: 1,
                cutLength: width,
                totalLength: width,
                weight: bottomRail.weight,
                note: 'Bottom track'
            });
        }

        const interlock = profiles.find(p => p.name.includes('INTERLOCK') || p.type === 'stile');
        const lockStile = profiles.find(p => p.name.includes('LOCK') && p.type === 'stile');

        const panelWidth = (width - (panels - 1) * panelOverlap) / panels;
        const panelHeight = height - 2 * trackHeight;

        if (interlock) {
            materials.push({
                ...interlock,
                qty: panels * 2,
                cutLength: panelHeight,
                totalLength: panels * 2 * panelHeight,
                weight: interlock.weight,
                note: `${panels} panels`
            });
        }

        if (lockStile) {
            materials.push({
                ...lockStile,
                qty: 1,
                cutLength: panelHeight,
                totalLength: panelHeight,
                weight: lockStile.weight,
                note: 'Operating panel'
            });
        }

        if (panels > 1) {
            const divider = profiles.find(p => p.name.includes('DIVIDER'));
            if (divider) {
                materials.push({
                    ...divider,
                    qty: panels - 1,
                    cutLength: panelHeight,
                    totalLength: (panels - 1) * panelHeight,
                    weight: divider.weight,
                    note: `${panels - 1} dividers`
                });
            }
        }

        return materials;
    }

    calculateSlidingAccessories(width, height, panels, accessories) {
        const frameDepth = 27;
        const trackHeight = 29;
        const panelOverlap = 20;
        const panelWidth = (width + (panels - 1) * panelOverlap) / panels;
        const panelHeight = height - 2 * trackHeight;
        const glassPerimeter = 2 * (panelWidth + panelHeight) * panels;

        return accessories.map(acc => {
            let qty = 0;
            if (acc.factor === 'glass_perimeter') {
                qty = Math.ceil(glassPerimeter / 1000);
            } else if (acc.qtyPerPanel) {
                qty = acc.qtyPerPanel * panels;
            }
            return { ...acc, qty };
        });
    }

    // ============================================================
    // PROTECTOR BAR CALCULATION
    // ============================================================
    calculateProtectorBars(width, height, panels, system, direction, spacing, rules) {
        const materials = [];
        const frameDepth = rules.frameDepth || 54;

        let innerDimension, outerDimension;

        if (direction === 'horizontal') {
            innerDimension = width - (2 * frameDepth);
            outerDimension = width;
            const numBars = Math.floor(height / spacing);

            materials.push({
                code: "INFIL",
                name: "Protector Bar - Infil",
                qty: numBars,
                cutLength: innerDimension,
                totalLength: numBars * innerDimension,
                weight: PROTECTOR_DATA.infil.weight,
                note: `Horizontal, ${numBars} bars, ${spacing}mm spacing`
            });
            materials.push({
                code: "STEEL_ROD",
                name: "Protector Bar - Steel Rod",
                qty: numBars,
                cutLength: outerDimension,
                totalLength: numBars * outerDimension,
                weight: PROTECTOR_DATA.steelRod.weight,
                note: `Horizontal, ${numBars} bars, ${spacing}mm spacing`
            });
        } else {
            innerDimension = height - (2 * frameDepth);
            outerDimension = height;
            const numBars = Math.floor(width / spacing);

            materials.push({
                code: "INFIL",
                name: "Protector Bar - Infil",
                qty: numBars,
                cutLength: innerDimension,
                totalLength: numBars * innerDimension,
                weight: PROTECTOR_DATA.infil.weight,
                note: `Vertical, ${numBars} bars, ${spacing}mm spacing`
            });
            materials.push({
                code: "STEEL_ROD",
                name: "Protector Bar - Steel Rod",
                qty: numBars,
                cutLength: outerDimension,
                totalLength: numBars * outerDimension,
                weight: PROTECTOR_DATA.steelRod.weight,
                note: `Vertical, ${numBars} bars, ${spacing}mm spacing`
            });
        }

        return materials;
    }

    // ============================================================
    // MERGE HELPERS
    // ============================================================
    mergeMaterials(existing, newItems) {
        newItems.forEach(item => {
            const existingItem = existing.find(e => e.number === item.number && e.cutLength === item.cutLength);
            if (existingItem) {
                existingItem.qty += item.qty;
                existingItem.totalLength += item.totalLength;
            } else {
                existing.push({ ...item });
            }
        });
        return existing;
    }

    mergeAccessories(existing, newItems) {
        newItems.forEach(item => {
            const existingItem = existing.find(e => e.name === item.name);
            if (existingItem) {
                existingItem.qty += item.qty;
            } else {
                existing.push({ ...item });
            }
        });
        return existing;
    }

    mergeAngleBars(existing, newItems) {
        newItems.forEach(item => {
            const existingItem = existing.find(e => e.name === item.name);
            if (existingItem) {
                existingItem.qty += item.qty;
                existingItem.totalLength += item.totalLength;
                existingItem.barsNeeded = Math.ceil(existingItem.totalLength / this.standardLength);
            } else {
                existing.push({ ...item });
            }
        });
        return existing;
    }

    mergeProtectorMaterials(existing, newItems) {
        newItems.forEach(item => {
            const existingItem = existing.find(e => e.code === item.code && e.cutLength === item.cutLength);
            if (existingItem) {
                existingItem.qty += item.qty;
                existingItem.totalLength += item.totalLength;
            } else {
                existing.push({ ...item });
            }
        });
        return existing;
    }

    // ============================================================
    // CUTTING OPTIMIZATION (1D - Aluminum Bars)
    // ============================================================
    optimizeCuttingPerType(materials) {
        const cutsByType = {};

        materials.forEach(mat => {
            const key = mat.number;
            if (!cutsByType[key]) {
                cutsByType[key] = {
                    name: mat.name,
                    number: mat.number,
                    type: mat.type || 'profile',
                    cuts: []
                };
            }
            for (let i = 0; i < mat.qty; i++) {
                cutsByType[key].cuts.push({
                    length: mat.cutLength,
                    name: mat.name,
                    number: mat.number,
                    type: mat.type || 'profile',
                    note: mat.note || ''
                });
            }
        });

        const plans = {};
        Object.keys(cutsByType).forEach(key => {
            const group = cutsByType[key];
            group.cuts.sort((a, b) => b.length - a.length);

            let bars = [];
            group.cuts.forEach(cut => {
                let placed = false;
                for (let bar of bars) {
                    const remaining = this.standardLength - bar.used;
                    if (remaining >= cut.length + 5) {
                        bar.cuts.push(cut);
                        bar.used += cut.length + 5;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    bars.push({
                        id: bars.length + 1,
                        cuts: [cut],
                        used: cut.length + 5
                    });
                }
            });

            plans[key] = bars;
        });

        return plans;
    }

    optimizeProtectorCuttingPerType(protectorMaterials) {
        const cutsByType = {};

        protectorMaterials.forEach(mat => {
            const key = mat.code;
            if (!cutsByType[key]) {
                cutsByType[key] = {
                    name: mat.name,
                    code: mat.code,
                    cuts: []
                };
            }
            for (let i = 0; i < mat.qty; i++) {
                cutsByType[key].cuts.push({
                    length: mat.cutLength,
                    name: mat.name,
                    code: mat.code
                });
            }
        });

        const plans = {};
        Object.keys(cutsByType).forEach(key => {
            const group = cutsByType[key];
            const barLength = key === 'STEEL_ROD' ? this.steelRodLength : this.standardLength;
            group.cuts.sort((a, b) => b.length - a.length);

            let bars = [];
            group.cuts.forEach(cut => {
                let placed = false;
                for (let bar of bars) {
                    const remaining = barLength - bar.used;
                    if (remaining >= cut.length + 5) {
                        bar.cuts.push(cut);
                        bar.used += cut.length + 5;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    bars.push({
                        id: bars.length + 1,
                        materialType: cut.code,
                        cuts: [cut],
                        used: cut.length + 5,
                        standardLength: barLength
                    });
                }
            });

            plans[key] = bars;
        });

        return plans;
    }

    optimizeAngleBarCutting(angleBars) {
        const cutsByType = {};

        angleBars.forEach(mat => {
            const key = mat.code;
            if (!cutsByType[key]) {
                cutsByType[key] = {
                    name: mat.name,
                    code: mat.code,
                    cuts: []
                };
            }
            for (let i = 0; i < mat.qty; i++) {
                cutsByType[key].cuts.push({
                    length: mat.cutLength,
                    name: mat.name,
                    code: mat.code
                });
            }
        });

        const plans = {};
        Object.keys(cutsByType).forEach(key => {
            const group = cutsByType[key];
            const barLength = this.standardLength;
            group.cuts.sort((a, b) => b.length - a.length);

            let bars = [];
            group.cuts.forEach(cut => {
                let placed = false;
                for (let bar of bars) {
                    const remaining = barLength - bar.used;
                    if (remaining >= cut.length + 2) {
                        bar.cuts.push(cut);
                        bar.used += cut.length + 2;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    bars.push({
                        id: bars.length + 1,
                        materialType: cut.code,
                        cuts: [cut],
                        used: cut.length + 2,
                        standardLength: barLength
                    });
                }
            });

            plans[key] = bars;
        });

        return plans;
    }

    calculateWastePerType(cuttingPlans) {
        let totalUsed = 0;
        let totalAvailable = 0;

        Object.keys(cuttingPlans).forEach(key => {
            const bars = cuttingPlans[key];
            const barLength = key === 'STEEL_ROD' ? this.steelRodLength : this.standardLength;
            bars.forEach(bar => {
                totalUsed += bar.used;
                totalAvailable += barLength;
            });
        });

        if (totalAvailable === 0) return 0;
        return ((totalAvailable - totalUsed) / totalAvailable) * 100;
    }

    exportToPDF() {
        window.print();
    }
}

const calculator = new NigalexCalculator();
