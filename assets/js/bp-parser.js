document.addEventListener("DOMContentLoaded", async function() {
    
    // --- Configuration ---
    const pinColors = {
        'exec':   '#FFFFFF', // White
        'bool':   '#920101', // Red
        'byte':   '#006575', // Dark Cyan
        'int':    '#18E1A6', // Cyan-Green
        'float':  '#9EEF42', // Lime
        'name':   '#C673E6', // Violet
        'string': '#EB00D6', // Magenta
        'text':   '#E2758F', // Pinkish
        'vector': '#FBC204', // Yellow
        'rotator':'#989BF9', // Purple-Blue
        'transform':'#F67608',// Orange
        'object': '#00A6F6', // Blue (Object)
        'class':  '#5900B5',  // Deep Purple
        'struct': '#2c3392ff'
    };

    const PATH_EXEC = '/AsyncConveyorPlugin/assets/images/bp_pin_exec.svg';
    const PATH_DATA = '/AsyncConveyorPlugin/assets/images/bp_pin_data.svg';
    const PATH_REF = '/AsyncConveyorPlugin/assets/images/bp_pin_ref.svg';

    // --- 1. Fetch SVGs ---
    let execSvgTemplate = '';
    let dataSvgTemplate = '';
    let refSvgTemplate = '';

    try {
        const [execRes, dataRes, refRes] = await Promise.all([
            fetch(PATH_EXEC),
            fetch(PATH_DATA),
            fetch(PATH_REF)
        ]);
        if (!execRes.ok || !dataRes.ok || !refRes.ok) throw new Error("Missing SVGs");
        execSvgTemplate = await execRes.text();
        dataSvgTemplate = await dataRes.text();
        refSvgTemplate = await refRes.text();
    } catch (err) {
        console.error("SVG Fetch Failed.", err);
        return;
    }

    // --- 2. Helper: Generate Pin HTML ---
    function createPinHtml(typeString, name, isOutput, isRef) {
        // Parse type: "pin_float" -> "float"
        let colorKey = typeString.replace('out_pin_', '').replace('ref_pin_', '').replace('pin_', '');
        let hex = pinColors[colorKey] || '#cccccc';
        
        // Choose SVG Template
        let isExec = (colorKey === 'exec');
        let rawSvg = isExec ? execSvgTemplate : (isRef ? refSvgTemplate : dataSvgTemplate);
        
        // Inject Color
        let coloredSvg = rawSvg.replace(/{{COLOR}}/g, hex);
        
        // Build Structure
        let iconHtml = `<div class="pin-icon">${coloredSvg}</div>`;
        let textHtml = `<span>${name}</span>`;

        // Output pins have text on LEFT, icon on RIGHT
        if (isOutput) {
            return `<div class="bp-pin">${textHtml}${iconHtml}</div>`;
        } 
        // Input pins have icon on LEFT, text on RIGHT
        else {
            return `<div class="bp-pin">${iconHtml}${textHtml}</div>`;
        }
    }
// --- 3. Parser Loop ---
    const content = document.body;
    // Matches {bp_node_TYPE, Title, ...args}
    const regex = /\{bp_node_(pure|impure),\s*([^,]+)(?:,\s*(.*?))?\}/g;

    content.innerHTML = content.innerHTML.replace(regex, function(match, nodeType, title, argsString) {
        
        let inputsHtml = '';
        let outputsHtml = '';
        let subtitleHtml = '';
        
        // --- A. Auto-Inject Execution Pins for Impure Nodes ---
        if (nodeType === 'impure') {
            inputsHtml += createPinHtml('pin_exec', '', false); 
            outputsHtml += createPinHtml('pin_exec', '', true); 
        }

        // --- B. Process Arguments (Subtitle + Pins) ---
        if (argsString) {
            // Split by comma, trimming whitespace
            let args = argsString.split(',').map(s => s.trim());
            
            // Check for Subtitle (Must be the FIRST argument)
            // Rule: Starts with "Target is" (case insensitive)
            if (args.length > 0 && args[0].toLowerCase().startsWith("target is")) {
                subtitleHtml = `<span class="bp-subtitle">${args[0]}</span>`;
                args.shift(); // Remove subtitle from pins list
            }

            // Process remaining args as pins
            args.forEach(pin => {
                // Example: "pin_float Speed"
                let firstSpace = pin.indexOf(' ');
                if (firstSpace === -1) return; 

                let typeCode = pin.substring(0, firstSpace).toLowerCase(); 
                let paramName = pin.substring(firstSpace + 1); 
                
                if(typeCode == "target" || typeCode == "target_static") {
                    subtitleHtml = `<span class="bp-subtitle">Target is ${paramName}</span>`;
                    if (typeCode == "target_static") return;
                    typeCode = "pin_object";
                    paramName = "Target";
                }
                
                let isOutput = typeCode.startsWith('out_');
                let isRef = typeCode.startsWith("ref_")
                let html = createPinHtml(typeCode, paramName, isOutput, isRef);

                if (isOutput) outputsHtml += html;
                else inputsHtml += html;
            });
        }

        // --- C. Build Final Node ---
        return `
            <div class="bp-node ${nodeType}" contenteditable="false">
                <div class="bp-header">
                    <div class="bp-title-container">
                        <span class="bp-title">${title}</span>
                        ${subtitleHtml}
                    </div>
                </div>
                <div class="bp-body">
                    <div class="bp-inputs">${inputsHtml}</div>
                    <div class="bp-outputs">${outputsHtml}</div>
                </div>
            </div>
        `;
    });
});