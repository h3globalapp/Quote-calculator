// ============================================
// NIGALEX PWA - Main Application Logic
// Updated: Glass optimizer, collapsible diagrams, multi-size support
// ============================================

class NigalexApp {
    constructor() {
        this.currentSystem = null;
        this.currentVariant = null;
        this.history = JSON.parse(localStorage.getItem('nigalex_history') || '[]');
        this.sizeCount = 1;
        this.init();
    }

    init() {
        try {
            this.bindEvents();
            this.updateHistoryUI();
            this.initPriceList();
            this.showToast('App loaded successfully');
        } catch (error) {
            this.showToast('Init Error: ' + error.message);
            this.showMobileError('Init Error: ' + error.message + '\nStack: ' + (error.stack || 'no stack'));
        }
    }

    bindEvents() {
        try {
            document.getElementById('menu-toggle').addEventListener('click', () => this.openNav());
            document.getElementById('nav-close').addEventListener('click', () => this.closeNav());
            document.getElementById('overlay').addEventListener('click', () => this.closeNav());

            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('click', () => this.selectSystem(card.dataset.system));
            });

            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeNav();
                    this.selectSystem(item.dataset.system);
                });
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showScreen(link.dataset.screen);
                    this.setActiveNav(link);
                });
            });

            document.getElementById('back-btn').addEventListener('click', () => {
                this.showScreen('home-screen');
            });

            document.getElementById('calculate-btn').addEventListener('click', () => this.calculate());

            document.getElementById('new-calc-btn').addEventListener('click', () => {
                document.getElementById('step-config').classList.add('active');
                document.getElementById('step-results').classList.remove('active');
                this.resetSizes();
            });

            document.getElementById('export-btn').addEventListener('click', () => {
                calculator.exportToPDF();
            });

            document.getElementById('clear-history').addEventListener('click', () => {
                this.history = [];
                localStorage.removeItem('nigalex_history');
                this.updateHistoryUI();
                this.showToast('History cleared');
            });

            document.getElementById('variant-select').addEventListener('change', (e) => {
                this.currentVariant = e.target.value;
            });

            document.getElementById('protector-toggle').addEventListener('change', (e) => {
                const protectorOptions = document.getElementById('protector-options');
                protectorOptions.style.display = e.target.checked ? 'block' : 'none';
            });

            document.getElementById('overflow-btn').addEventListener('click', () => this.toggleOverflow());
            document.getElementById('overflow-price').addEventListener('click', () => {
                this.toggleOverflow();
                this.showPriceList();
            });
            document.getElementById('overflow-about').addEventListener('click', () => {
                this.toggleOverflow();
                this.showScreen('about-screen');
                this.setActiveNav(document.querySelector('[data-screen="about-screen"]'));
            });

            document.getElementById('save-prices-btn').addEventListener('click', () => this.savePrices());
            document.getElementById('reset-prices-btn').addEventListener('click', () => this.resetPrices());
            document.getElementById('price-search').addEventListener('input', (e) => this.filterPriceList(e.target.value));

            document.getElementById('price-back-btn').addEventListener('click', () => {
                this.showScreen('home-screen');
            });

            document.getElementById('add-size-btn').addEventListener('click', () => this.addSizeRow());
        } catch (error) {
            this.showToast('Bind Error: ' + error.message);
            this.showMobileError('BindEvents Error: ' + error.message + '\nStack: ' + (error.stack || 'no stack'));
        }
    }

    openNav() {
        document.getElementById('main-nav').classList.add('open');
        document.getElementById('overlay').classList.add('active');
    }

    closeNav() {
        document.getElementById('main-nav').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');
    }

    toggleOverflow() {
        const menu = document.getElementById('overflow-menu');
        menu.classList.toggle('show');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    setActiveNav(link) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
    }

    resetSizes() {
        this.sizeCount = 1;
        const container = document.getElementById('sizes-container');
        container.innerHTML = `
            <div class="size-row" data-index="0">
                <div class="size-inputs">
                    <input type="number" class="form-control size-width" placeholder="Width (mm)" min="300" max="5000">
                    <span class="size-x">×</span>
                    <input type="number" class="form-control size-height" placeholder="Height (mm)" min="300" max="3000">
                    <input type="number" class="form-control size-qty" placeholder="Qty" min="1" value="1" style="width:60px;">
                </div>
                <div class="size-panels">
                    <label>Panels:</label>
                    <div class="radio-group size-radio-group">
                        <label class="radio-label">
                            <input type="radio" name="panels-0" value="1" checked> 1
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="panels-0" value="2"> 2
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="panels-0" value="3"> 3
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="panels-0" value="4"> 4
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    addSizeRow() {
        const container = document.getElementById('sizes-container');
        const index = this.sizeCount++;
        const row = document.createElement('div');
        row.className = 'size-row';
        row.dataset.index = index;
        row.innerHTML = `
            <div class="size-inputs">
                <input type="number" class="form-control size-width" placeholder="Width (mm)" min="300" max="5000">
                <span class="size-x">×</span>
                <input type="number" class="form-control size-height" placeholder="Height (mm)" min="300" max="3000">
                <input type="number" class="form-control size-qty" placeholder="Qty" min="1" value="1" style="width:60px;">
                <button class="remove-size-btn" onclick="this.closest('.size-row').remove()">×</button>
            </div>
            <div class="size-panels">
                <label>Panels:</label>
                <div class="radio-group size-radio-group">
                    <label class="radio-label">
                        <input type="radio" name="panels-${index}" value="1" checked> 1
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="panels-${index}" value="2"> 2
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="panels-${index}" value="3"> 3
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="panels-${index}" value="4"> 4
                    </label>
                </div>
            </div>
        `;
        container.appendChild(row);
    }

    selectSystem(system) {
        this.currentSystem = system;
        const systemData = PROFILE_DATA[system];

        document.getElementById('system-title').textContent = systemData.name;

        const variantSelect = document.getElementById('variant-select');
        variantSelect.innerHTML = '<option value="">Select variant...</option>';

        if (systemData.variants) {
            systemData.variants.forEach(v => {
                const option = document.createElement('option');
                option.value = v.id;
                option.textContent = v.name;
                variantSelect.appendChild(option);
            });
        }

        this.toggleSystemOptions(system);
        this.showScreen('calculator-screen');

        document.getElementById('step-config').classList.add('active');
        document.getElementById('step-results').classList.remove('active');

        this.resetSizes();
        document.getElementById('protector-toggle').checked = false;
        document.getElementById('protector-options').style.display = 'none';
        document.getElementById('transport-cost').value = '';
        document.getElementById('installation-cost').value = '';
        document.getElementById('labor-cost').value = '';
        document.getElementById('num-workers').value = '';
        document.getElementById('num-days').value = '';
    }

    toggleSystemOptions(system) {
        const glazingGroup = document.getElementById('glazing-group');
        const netTrayCheckbox = document.getElementById('net-tray').parentElement;
        const waterSealCheckbox = document.getElementById('water-seal').parentElement;
        const hingeTypeGroup = document.getElementById('hinge-type-group');

        glazingGroup.style.display = 'block';
        netTrayCheckbox.style.display = 'flex';
        waterSealCheckbox.style.display = 'none';
        hingeTypeGroup.style.display = 'none';

        switch(system) {
            case 'curtain-wall':
                glazingGroup.style.display = 'none';
                netTrayCheckbox.style.display = 'none';
                hingeTypeGroup.style.display = 'block';
                break;
            case 'projected':
                waterSealCheckbox.style.display = 'flex';
                hingeTypeGroup.style.display = 'block';
                break;
            case 'sliding':
                glazingGroup.style.display = 'none';
                netTrayCheckbox.style.display = 'none';
                break;
        }
    }

    calculate() {
        try {
            this.showToast('Starting calculation...');

            const variant = document.getElementById('variant-select').value;
            if (!variant) {
                this.showToast('ERROR: Please select a variant');
                return;
            }

            const sizes = [];
            const sizeRows = document.querySelectorAll('.size-row');
            let hasError = false;

            sizeRows.forEach((row, idx) => {
                const width = parseFloat(row.querySelector('.size-width').value);
                const height = parseFloat(row.querySelector('.size-height').value);
                const qty = parseInt(row.querySelector('.size-qty').value) || 1;
                const panels = parseInt(row.querySelector('input[type="radio"]:checked')?.value || 1);

                if (!width || width < 300 || width > 5000) {
                    this.showToast(`ERROR: Size ${idx + 1}: Invalid width (300-5000mm)`);
                    hasError = true;
                    return;
                }
                if (!height || height < 300 || height > 3000) {
                    this.showToast(`ERROR: Size ${idx + 1}: Invalid height (300-3000mm)`);
                    hasError = true;
                    return;
                }

                sizes.push({ width, height, panels, qty });
            });

            if (hasError) return;
            if (sizes.length === 0) {
                this.showToast('ERROR: Please enter at least one window size');
                return;
            }

            const glazing = document.querySelector('input[name="glazing"]:checked')?.value || 'single';
            const netTray = document.getElementById('net-tray').checked;
            const waterSeal = document.getElementById('water-seal').checked;
            const hingeType = document.querySelector('input[name="hinge-type"]:checked')?.value || 'big';

            const protector = document.getElementById('protector-toggle').checked;
            const protectorDirection = protector ? document.querySelector('input[name="protector-dir"]:checked')?.value : null;
            const barSpacing = protector ? parseFloat(document.getElementById('bar-spacing').value) : null;

            if (protector && (!protectorDirection || !barSpacing || barSpacing < 50)) {
                this.showToast('ERROR: Please select protector direction and valid spacing (min 50mm)');
                return;
            }

            const projectCosts = {
                transport: document.getElementById('transport-cost').value || 0,
                installation: document.getElementById('installation-cost').value || 0,
                labor: document.getElementById('labor-cost').value || 0,
                workers: document.getElementById('num-workers').value || 0,
                days: document.getElementById('num-days').value || 0
            };

            const config = { sizes, glazing, netTray, waterSeal, hingeType, protector, protectorDirection, barSpacing, projectCosts };

            if (typeof calculator === 'undefined') {
                this.showToast('ERROR: Calculator not loaded');
                return;
            }
            if (typeof PROFILE_DATA === 'undefined') {
                this.showToast('ERROR: Profile data not loaded');
                return;
            }
            if (!this.currentSystem) {
                this.showToast('ERROR: No system selected');
                return;
            }

            this.showToast('Calculating ' + this.currentSystem + '...');

            const results = calculator.calculate(this.currentSystem, variant, config);

            if (!results) {
                this.showToast('ERROR: Calculation returned no results');
                return;
            }

            this.showToast('Calculation complete! Showing results...');
            this.displayResults(results);
            this.saveToHistory(results);

            document.getElementById('step-config').classList.remove('active');
            document.getElementById('step-results').classList.add('active');
        } catch (error) {
            this.showToast('ERROR: ' + error.message);
            this.showMobileError('Calculate Error: ' + error.message + '\nStack: ' + (error.stack || 'no stack'));
        }
    }

    // ============================================================
    // DISPLAY RESULTS - WITH COLLAPSIBLE DIAGRAMS
    // ============================================================
    displayResults(results) {
        // Size summary
        const sizeSummary = document.getElementById('size-summary');
        sizeSummary.innerHTML = '';
        results.sizes.forEach((size, idx) => {
            const div = document.createElement('div');
            div.className = 'size-summary-item';
            div.innerHTML = `<strong>Size ${idx + 1}:</strong> ${size.width}×${size.height}mm | ${size.panels} panel(s) × ${size.qty} unit(s)`;
            sizeSummary.appendChild(div);
        });

        // Summary cards
        document.getElementById('total-windows').textContent = results.totalWindows;
        document.getElementById('total-weight').textContent = results.totals.weight + ' kg';
        document.getElementById('total-length').textContent = results.totals.length + ' m';
        document.getElementById('total-bars').textContent = results.totals.bars;
        document.getElementById('waste-percent').textContent = results.totals.waste + '%';
        document.getElementById('material-subtotal').textContent = '₦' + results.totals.materialSubtotal;

        // Project costs
        document.getElementById('cost-transport').textContent = '₦' + results.totals.transport;
        document.getElementById('cost-installation').textContent = '₦' + results.totals.installation;
        document.getElementById('cost-labor').textContent = '₦' + results.totals.labor;
        document.getElementById('grand-total').textContent = '₦' + results.totals.grandTotal;

        // Materials table
        const tbody = document.getElementById('materials-tbody');
        tbody.innerHTML = '';
        results.materials.forEach(mat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mat.name}</td>
                <td>${mat.number}</td>
                <td>${mat.qty}</td>
                <td>${mat.cutLength}</td>
                <td>${(mat.totalLength / 1000).toFixed(2)}</td>
                <td>${(mat.weight * mat.totalLength / 1000000).toFixed(2)}</td>
                <td>₦${mat.unitPrice.toFixed(2)}/m</td>
                <td>₦${mat.totalPrice}</td>
            `;
            tbody.appendChild(row);
        });

        // Accessories table
        const accTbody = document.getElementById('accessories-tbody');
        accTbody.innerHTML = '';
        results.accessories.forEach(acc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${acc.name}</td>
                <td>${acc.qty} ${acc.unit}</td>
                <td>${acc.note || ''}</td>
                <td>₦${acc.unitPrice.toFixed(2)}</td>
                <td>₦${acc.totalPrice}</td>
            `;
            accTbody.appendChild(row);
        });

        // Glass table - NEW FORMAT with optimizer data
        const glassTbody = document.getElementById('glass-tbody');
        glassTbody.innerHTML = '';

        if (results.glass && results.glass.sheets) {
            // Main summary row
            const summaryRow = document.createElement('tr');
            summaryRow.style.background = '#e8f5e9';
            summaryRow.style.fontWeight = '600';
            summaryRow.innerHTML = `
                <td colspan="2">Total: ${results.glass.totalSheets} sheet(s) for ${results.glass.totalPanels} panels</td>
                <td colspan="2">Waste: ${results.glass.totalWastePercent.toFixed(1)}%</td>
                <td>₦${results.glass.unitPrice.toFixed(2)}</td>
                <td>₦${results.glass.totalPrice}</td>
            `;
            glassTbody.appendChild(summaryRow);

            // Per-sheet breakdown
            results.glass.sheets.forEach(sheet => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>Sheet ${sheet.id} (${sheet.orientation})</td>
                    <td>${sheet.panels.length} panels</td>
                    <td>${sheet.sheetWidth}×${sheet.sheetHeight}mm</td>
                    <td>${sheet.wastePercent.toFixed(1)}% waste</td>
                    <td>—</td>
                    <td>—</td>
                `;
                glassTbody.appendChild(row);
            });
        }

        // Angle bars table
        const angleTbody = document.getElementById('angle-tbody');
        angleTbody.innerHTML = '';
        results.angleBars.forEach(a => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${a.name}</td>
                <td>${a.qty}</td>
                <td>${a.barsNeeded}</td>
                <td>₦${a.unitPrice.toFixed(2)}</td>
                <td>₦${a.totalPrice}</td>
            `;
            angleTbody.appendChild(row);
        });

        // Protector bars table
        const protTbody = document.getElementById('protector-tbody');
        const protectorSection = document.getElementById('protector-section');

        if (results.protector && results.protector.length > 0) {
            protectorSection.style.display = 'block';
            protTbody.innerHTML = '';
            results.protector.forEach(prot => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${prot.name}</td>
                    <td>${prot.qty}</td>
                    <td>${prot.cutLength}</td>
                    <td>${(prot.totalLength / 1000).toFixed(2)}</td>
                    <td>${(prot.weight * prot.totalLength / 1000000).toFixed(2)}</td>
                    <td>₦${prot.unitPrice.toFixed(2)}/m</td>
                    <td>₦${prot.totalPrice}</td>
                `;
                protTbody.appendChild(row);
            });
        } else {
            protectorSection.style.display = 'none';
        }

        // ============================================================
        // GLASS CUTTING DIAGRAMS (Collapsible)
        // ============================================================
        this.renderGlassDiagrams(results.glass);

        // ============================================================
        // ALUMINUM CUTTING DIAGRAMS (Collapsible)
        // ============================================================
        this.renderAluminumDiagrams(results);
    }

    // ============================================================
    // RENDER GLASS DIAGRAMS - 2D LAYOUT WITH PANELS
    // ============================================================
    renderGlassDiagrams(glassData) {
        const container = document.getElementById('glass-cutting-diagrams');
        if (!container) return;

        container.innerHTML = '';

        if (!glassData || !glassData.sheets || glassData.sheets.length === 0) {
            container.innerHTML = '<p class="empty-state">No glass panels to display.</p>';
            return;
        }

        // Header with toggle
        const header = document.createElement('div');
        header.className = 'diagram-header';
        header.innerHTML = `
            <h4>🪟 Glass Cutting Diagrams</h4>
            <button class="diagram-toggle" onclick="this.closest('.diagram-section').classList.toggle('collapsed')">
                <span class="toggle-icon">▼</span>
            </button>
        `;

        const content = document.createElement('div');
        content.className = 'diagram-content';

        const sheetsContainer = document.createElement('div');
        sheetsContainer.className = 'glass-sheets-container';

        const maxDisplayWidth = Math.min(window.innerWidth - 40, 800);

        glassData.sheets.forEach(sheet => {
            const sheetDiv = document.createElement('div');
            sheetDiv.className = 'glass-sheet';

            const scale = maxDisplayWidth / sheet.sheetWidth;
            const displayHeight = sheet.sheetHeight * scale;

            sheetDiv.style.cssText = `
                width: ${maxDisplayWidth}px;
                height: ${displayHeight}px;
                border: 2px solid #333;
                position: relative;
                margin-bottom: 20px;
                background: #f5f5f5;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;

            // Sheet label
            const label = document.createElement('div');
            label.className = 'sheet-label';
            label.innerHTML = `
                <strong>Sheet ${sheet.id}</strong> (${sheet.orientation}) 
                ${sheet.sheetWidth}×${sheet.sheetHeight}mm | 
                ${sheet.panels.length} panels | 
                Waste: ${sheet.wastePercent.toFixed(1)}%
            `;
            label.style.cssText = `
                position: absolute;
                top: -24px;
                left: 0;
                font-size: 12px;
                font-weight: 600;
                color: #333;
            `;
            sheetDiv.appendChild(label);

            // Margin indicator (faint border inside)
            const marginDiv = document.createElement('div');
            marginDiv.style.cssText = `
                position: absolute;
                left: ${sheet.margin * scale}px;
                top: ${sheet.margin * scale}px;
                right: ${sheet.margin * scale}px;
                bottom: ${sheet.margin * scale}px;
                border: 1px dashed #ccc;
                pointer-events: none;
            `;
            sheetDiv.appendChild(marginDiv);

            // Render each panel
            sheet.panels.forEach(panel => {
                const panelDiv = document.createElement('div');
                panelDiv.className = 'glass-panel';

                const pw = panel.width * scale;
                const ph = panel.height * scale;
                const px = panel.x * scale;
                const py = panel.y * scale;

                panelDiv.style.cssText = `
                    position: absolute;
                    left: ${px}px;
                    top: ${py}px;
                    width: ${pw}px;
                    height: ${ph}px;
                    background: ${panel.color};
                    border: 1px solid rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                `;

                // Panel label
                const label = document.createElement('span');
                label.innerHTML = `
                    S${panel.windowSizeIdx + 1}-P${panel.panelIdx + 1}
                    ${panel.rotated ? '↻' : ''}
                    <br><small>${panel.originalWidth}×${panel.originalHeight}</small>
                `;
                panelDiv.appendChild(label);

                // Hover effect
                panelDiv.addEventListener('mouseenter', () => {
                    panelDiv.style.transform = 'scale(1.02)';
                    panelDiv.style.zIndex = '10';
                    panelDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                });
                panelDiv.addEventListener('mouseleave', () => {
                    panelDiv.style.transform = 'scale(1)';
                    panelDiv.style.zIndex = '1';
                    panelDiv.style.boxShadow = 'none';
                });

                // Tooltip
                panelDiv.title = `
Window Size ${panel.windowSizeIdx + 1}, Panel ${panel.panelIdx + 1}
Dimensions: ${panel.originalWidth}mm × ${panel.originalHeight}mm
Placed: ${panel.width}mm × ${panel.height}mm at (${panel.x}, ${panel.y})
${panel.rotated ? 'ROTATED 90°' : 'Original orientation'}
                `.trim();

                sheetDiv.appendChild(panelDiv);
            });

            sheetsContainer.appendChild(sheetDiv);
        });

        // Legend
        const legend = document.createElement('div');
        legend.className = 'glass-legend';
        legend.innerHTML = `
            <div style="margin-top:12px; padding:8px; background:#f8f9fa; border-radius:6px; font-size:12px;">
                <strong>Legend:</strong> 
                <span style="margin-left:8px;">↻ = Rotated 90°</span>
                <span style="margin-left:8px;">S1-P2 = Size 1, Panel 2</span>
                <span style="margin-left:8px;">Dashed line = Edge margin (${glassData.sheets[0]?.margin || 10}mm)</span>
            </div>
        `;

        content.appendChild(sheetsContainer);
        content.appendChild(legend);

        const section = document.createElement('div');
        section.className = 'diagram-section';
        section.appendChild(header);
        section.appendChild(content);

        container.appendChild(section);
    }

    // ============================================================
    // RENDER ALUMINUM DIAGRAMS (Existing + Collapsible)
    // ============================================================
    renderAluminumDiagrams(results) {
        const container = document.getElementById('aluminum-cutting-diagrams');
        if (!container) return;

        container.innerHTML = '';

        // Header with toggle
        const header = document.createElement('div');
        header.className = 'diagram-header';
        header.innerHTML = `
            <h4>🔧 Aluminum Profile Cutting Diagrams</h4>
            <button class="diagram-toggle" onclick="this.closest('.diagram-section').classList.toggle('collapsed')">
                <span class="toggle-icon">▼</span>
            </button>
        `;

        const content = document.createElement('div');
        content.className = 'diagram-content';

        const barsContainer = document.createElement('div');
        barsContainer.className = 'bars-container';

        // Profile cutting plans
        if (results.cuttingPlans) {
            Object.keys(results.cuttingPlans).forEach(profileNumber => {
                const bars = results.cuttingPlans[profileNumber];
                if (!bars || bars.length === 0) return;

                const firstCut = bars[0]?.cuts[0];
                const profileName = firstCut ? firstCut.name : profileNumber;

                const typeHeader = document.createElement('div');
                typeHeader.className = 'cutting-type-header';
                typeHeader.style.cssText = 'margin: 16px 0 8px 0; padding: 8px 12px; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem;';
                typeHeader.textContent = `${profileName} (${profileNumber}) — ${bars.length} bar(s) needed`;
                barsContainer.appendChild(typeHeader);

                const barLength = profileNumber === 'STEEL_ROD' ? 39000 : STANDARD_LENGTH;
                const scale = 100 / barLength;

                bars.forEach(bar => {
                    const barDiv = document.createElement('div');
                    barDiv.className = 'bar-item';

                    const label = document.createElement('div');
                    label.className = 'bar-label';
                    label.textContent = `Bar ${bar.id} — Used: ${bar.used}mm / ${barLength}mm`;

                    const visual = document.createElement('div');
                    visual.className = 'bar-visual';

                    bar.cuts.forEach(cut => {
                        const segment = document.createElement('div');
                        segment.className = 'bar-segment';
                        segment.style.width = (cut.length * scale) + '%';
                        segment.style.background = this.getProfileColor(cut.type);
                        segment.textContent = cut.length;
                        segment.title = `${cut.name} (${cut.number})${cut.note ? ' — ' + cut.note : ''}`;
                        visual.appendChild(segment);
                    });

                    const waste = barLength - bar.used;
                    if (waste > 50) {
                        const wasteSegment = document.createElement('div');
                        wasteSegment.className = 'bar-waste';
                        wasteSegment.style.width = (waste * scale) + '%';
                        wasteSegment.textContent = waste;
                        visual.appendChild(wasteSegment);
                    }

                    barDiv.appendChild(label);
                    barDiv.appendChild(visual);
                    barsContainer.appendChild(barDiv);
                });
            });
        }

        // Angle bar cutting plans
        if (results.angleBarCuttingPlans && Object.keys(results.angleBarCuttingPlans).length > 0) {
            const angleHeader = document.createElement('div');
            angleHeader.className = 'cutting-type-header';
            angleHeader.style.cssText = 'margin: 20px 0 8px 0; padding: 8px 12px; background: var(--accent); color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem;';
            angleHeader.textContent = 'Angle Bars (40×40mm)';
            barsContainer.appendChild(angleHeader);

            Object.keys(results.angleBarCuttingPlans).forEach(code => {
                const bars = results.angleBarCuttingPlans[code];
                if (!bars || bars.length === 0) return;

                const barLength = STANDARD_LENGTH;
                const scale = 100 / barLength;

                const subHeader = document.createElement('div');
                subHeader.style.cssText = 'margin: 8px 0 4px 0; font-weight: 600; color: var(--dark); font-size: 0.85rem;';
                subHeader.textContent = `${bars[0]?.cuts[0]?.name || code} — ${bars.length} bar(s)`;
                barsContainer.appendChild(subHeader);

                bars.forEach(bar => {
                    const barDiv = document.createElement('div');
                    barDiv.className = 'bar-item';

                    const label = document.createElement('div');
                    label.className = 'bar-label';
                    label.textContent = `Bar ${bar.id} — Used: ${bar.used}mm / ${barLength}mm`;

                    const visual = document.createElement('div');
                    visual.className = 'bar-visual';

                    bar.cuts.forEach(cut => {
                        const segment = document.createElement('div');
                        segment.className = 'bar-segment';
                        segment.style.width = (cut.length * scale) + '%';
                        segment.style.background = '#f39c12';
                        segment.textContent = cut.length;
                        segment.title = cut.name;
                        visual.appendChild(segment);
                    });

                    const waste = barLength - bar.used;
                    if (waste > 50) {
                        const wasteSegment = document.createElement('div');
                        wasteSegment.className = 'bar-waste';
                        wasteSegment.style.width = (waste * scale) + '%';
                        wasteSegment.textContent = waste;
                        visual.appendChild(wasteSegment);
                    }

                    barDiv.appendChild(label);
                    barDiv.appendChild(visual);
                    barsContainer.appendChild(barDiv);
                });
            });
        }

        // Protector bar cutting plans
        if (results.protectorCuttingPlans && Object.keys(results.protectorCuttingPlans).length > 0) {
            const protectorHeader = document.createElement('div');
            protectorHeader.className = 'cutting-type-header';
            protectorHeader.style.cssText = 'margin: 20px 0 8px 0; padding: 8px 12px; background: var(--secondary); color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem;';
            protectorHeader.textContent = 'Protector Bars';
            barsContainer.appendChild(protectorHeader);

            Object.keys(results.protectorCuttingPlans).forEach(code => {
                const bars = results.protectorCuttingPlans[code];
                if (!bars || bars.length === 0) return;

                const barLength = code === 'STEEL_ROD' ? 39000 : STANDARD_LENGTH;
                const scale = 100 / barLength;

                const subHeader = document.createElement('div');
                subHeader.style.cssText = 'margin: 8px 0 4px 0; font-weight: 600; color: var(--dark); font-size: 0.85rem;';
                subHeader.textContent = `${bars[0]?.cuts[0]?.name || code} — ${bars.length} bar(s)`;
                barsContainer.appendChild(subHeader);

                bars.forEach(bar => {
                    const barDiv = document.createElement('div');
                    barDiv.className = 'bar-item';

                    const label = document.createElement('div');
                    label.className = 'bar-label';
                    label.textContent = `Bar ${bar.id} — Used: ${bar.used}mm / ${barLength}mm`;

                    const visual = document.createElement('div');
                    visual.className = 'bar-visual';

                    bar.cuts.forEach(cut => {
                        const segment = document.createElement('div');
                        segment.className = 'bar-segment';
                        segment.style.width = (cut.length * scale) + '%';
                        segment.style.background = code === 'STEEL_ROD' ? '#e74c3c' : '#f39c12';
                        segment.textContent = cut.length;
                        segment.title = cut.name;
                        visual.appendChild(segment);
                    });

                    const waste = barLength - bar.used;
                    if (waste > 50) {
                        const wasteSegment = document.createElement('div');
                        wasteSegment.className = 'bar-waste';
                        wasteSegment.style.width = (waste * scale) + '%';
                        wasteSegment.textContent = waste;
                        visual.appendChild(wasteSegment);
                    }

                    barDiv.appendChild(label);
                    barDiv.appendChild(visual);
                    barsContainer.appendChild(barDiv);
                });
            });
        }

        content.appendChild(barsContainer);

        const section = document.createElement('div');
        section.className = 'diagram-section';
        section.appendChild(header);
        section.appendChild(content);

        container.appendChild(section);
    }

    getProfileColor(type) {
        const colors = {
            'frame': '#2e86c1', 'outer': '#1a5276', 'vent': '#28b463',
            'mullion': '#8e44ad', 'bead': '#f39c12', 'bracket': '#e74c3c',
            'rail': '#16a085', 'track': '#d35400', 'stile': '#27ae60',
            'jamb': '#2980b9', 'divider': '#c0392b', 'tray': '#7f8c8d',
            'cap': '#9b59b6', 'panel': '#34495e', 'profile': '#2c3e50'
        };
        return colors[type] || '#95a5a6';
    }

    initPriceList() {
        this.renderPriceList();
    }

    showPriceList() {
        try {
            this.showToast('Loading price list...');
            if (typeof calculator === 'undefined') {
                this.showToast('ERROR: Calculator not loaded');
                return;
            }
            if (typeof getAllPriceListItems === 'undefined') {
                this.showToast('ERROR: Price list data not loaded');
                return;
            }
            calculator.priceList = calculator.loadPriceList();
            this.renderPriceList();
            this.showScreen('price-screen');
            this.showToast('Price list loaded');
        } catch (error) {
            this.showToast('Error: ' + error.message);
            this.showMobileError('Price List Error: ' + error.message);
        }
    }

    renderPriceList(filter = '') {
        const tbody = document.getElementById('price-tbody');
        tbody.innerHTML = '';

        const items = getAllPriceListItems();
        const priceList = calculator.loadPriceList();
        calculator.priceList = priceList;

        let currentCategory = '';
        let savedCount = 0;

        items.forEach(item => {
            if (filter && !item.name.toLowerCase().includes(filter.toLowerCase()) && 
                !item.code.toLowerCase().includes(filter.toLowerCase())) {
                return;
            }

            if (item.category !== currentCategory) {
                currentCategory = item.category;
                const headerRow = document.createElement('tr');
                headerRow.className = 'category-header';
                headerRow.innerHTML = `<td colspan="5"><strong>${currentCategory}</strong></td>`;
                tbody.appendChild(headerRow);
            }

            const price = priceList[item.code]?.unitPrice || 0;
            if (price > 0) savedCount++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.system}</td>
                <td>${item.unit}</td>
                <td><input type="number" class="price-input" data-code="${item.code}" 
                    value="${price > 0 ? price : ''}" min="0" step="0.01" placeholder="0.00" 
                    style="${price > 0 ? 'background:#e8f5e9;border-color:#4caf50;' : ''}"></td>
            `;
            tbody.appendChild(row);
        });

        const statusDiv = document.getElementById('price-status');
        const statusText = document.getElementById('price-status-text');
        const statusCount = document.getElementById('price-status-count');
        if (statusDiv && statusText) {
            if (savedCount > 0) {
                statusDiv.className = 'price-status saved';
                statusText.textContent = `${savedCount} prices saved`;
                if (statusCount) statusCount.textContent = '✓';
            } else {
                statusDiv.className = 'price-status empty';
                statusText.textContent = 'No prices saved yet';
                if (statusCount) statusCount.textContent = '';
            }
        }

        tbody.querySelectorAll('.price-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const code = e.target.dataset.code;
                const price = parseFloat(e.target.value) || 0;
                if (calculator.priceList[code]) {
                    calculator.priceList[code].unitPrice = price;
                }
            });
            input.addEventListener('blur', (e) => {
                const code = e.target.dataset.code;
                const price = parseFloat(e.target.value) || 0;
                calculator.updatePrice(code, price);
            });
            input.addEventListener('change', (e) => {
                const code = e.target.dataset.code;
                const price = parseFloat(e.target.value) || 0;
                calculator.updatePrice(code, price);
            });
        });
    }

    filterPriceList(query) {
        this.renderPriceList(query);
    }

    savePrices() {
        let savedCount = 0;
        document.querySelectorAll('.price-input').forEach(input => {
            const code = input.dataset.code;
            const price = parseFloat(input.value) || 0;
            if (calculator.priceList[code]) {
                calculator.priceList[code].unitPrice = price;
                if (price > 0) savedCount++;
            }
        });
        calculator.savePriceList();

        const statusDiv = document.getElementById('price-status');
        const statusText = document.getElementById('price-status-text');
        if (statusDiv && statusText) {
            statusDiv.className = 'price-status saved';
            statusText.textContent = `${savedCount} prices saved`;
        }

        this.showToast(`${savedCount} prices saved to local storage`);
    }

    resetPrices() {
        if (confirm('Reset all prices to zero?')) {
            calculator.priceList = JSON.parse(JSON.stringify(DEFAULT_PRICE_LIST));
            calculator.savePriceList();
            this.renderPriceList();
            this.showToast('Prices reset to default');
        }
    }

    saveToHistory(results) {
        const entry = {
            id: Date.now(),
            system: results.system,
            variant: results.variant,
            config: results.config,
            totals: results.totals,
            date: new Date().toLocaleString()
        };

        this.history.unshift(entry);
        if (this.history.length > 50) this.history.pop();

        localStorage.setItem('nigalex_history', JSON.stringify(this.history));
        this.updateHistoryUI();
    }

    updateHistoryUI() {
        const list = document.getElementById('history-list');

        if (this.history.length === 0) {
            list.innerHTML = '<p class="empty-state">No calculations yet. Start by selecting a system.</p>';
            return;
        }

        list.innerHTML = '';
        this.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const sizeCount = item.config.sizes ? item.config.sizes.length : 1;
            const totalQty = item.config.sizes ? item.config.sizes.reduce((s, sz) => s + sz.qty, 0) : 1;
            div.innerHTML = `
                <div class="history-info">
                    <h4>${item.system} — ${item.variant}</h4>
                    <p>${sizeCount} size(s), ${totalQty} total window(s)</p>
                    <p style="font-size:0.75rem;color:#95a5a6">${item.date}</p>
                </div>
                <div class="history-details">
                    <span class="history-weight">${item.totals.weight}kg</span>
                    <span class="history-price">₦${item.totals.grandTotal}</span>
                </div>
            `;
            div.addEventListener('click', () => {
                this.currentSystem = Object.keys(PROFILE_DATA).find(k => 
                    PROFILE_DATA[k].name === item.system
                );
                this.currentVariant = item.variant;

                const results = calculator.calculate(this.currentSystem, item.variant, item.config);
                this.displayResults(results);

                document.getElementById('system-title').textContent = item.system;
                document.getElementById('step-config').classList.remove('active');
                document.getElementById('step-results').classList.add('active');
                this.showScreen('calculator-screen');
            });
            list.appendChild(div);
        });
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showMobileError(message) {
        let errorDiv = document.getElementById('mobile-error-log');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'mobile-error-log';
            errorDiv.style.cssText = 'position:fixed;bottom:80px;left:10px;right:10px;background:#e74c3c;color:white;padding:10px;border-radius:8px;z-index:9999;font-size:12px;max-height:200px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;';
            document.body.appendChild(errorDiv);
        }
        const timestamp = new Date().toLocaleTimeString();
        errorDiv.innerHTML += '[' + timestamp + '] ' + message + '\n\n';
        errorDiv.scrollTop = errorDiv.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new NigalexApp();
});
