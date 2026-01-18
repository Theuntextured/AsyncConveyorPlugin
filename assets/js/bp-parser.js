document.addEventListener("DOMContentLoaded", async function() {
    
    // --- Configuration ---
    const pinColors = {
        'exec':   '#FFFFFFFF',
        'bool':   '#950000FF',
        'byte':   '#006F65FF',
        'enum':   '#006F65FF',
        'int':    '#1FE3AFFF',
        'int64':  '#ACE3AFFF',
        'float':  '#38D500FF',
        'name':   '#CD82FFFF',
        'string': '#FF00D4FF',
        'text':   '#E77CAAFF',
        'vector': '#FFCA23FF',
        'rotator':'#A0B4FFFF',
        'transform':'#FF7300FF',
        'object': '#00AAF5FF',
        'soft_object': '#95FFFFFF',
        'soft_class': '#FF95FFFF',
        'class':  '#5900BCFF',
        'struct': '#0059CBFF',
        'interface': '#F1FFAAFF',
        'event': '#FF3838FF',
        'wildcard': '#817A7AFF'
    };

    const PATH_EXEC = '/AsyncConveyorPlugin/assets/images/bp_pin_exec.svg';
    const PATH_DATA = '/AsyncConveyorPlugin/assets/images/bp_pin_data.svg';
    const PATH_REF = '/AsyncConveyorPlugin/assets/images/bp_pin_ref.svg';
    const PATH_ARRAY = '/AsyncConveyorPlugin/assets/images/bp_pin_array.svg';
    const PATH_EVENT = '/AsyncConveyorPlugin/assets/images/bp_pin_event.svg';

    // --- 1. Fetch SVGs ---
    let execSvgTemplate = '';
    let dataSvgTemplate = '';
    let refSvgTemplate = '';
    let arraySvgTemplate = '';
    let eventSvgTemplate = '';

    try {
        const [execRes, dataRes, refRes, arrayRes, eventRes] = await Promise.all([
            fetch(PATH_EXEC),
            fetch(PATH_DATA),
            fetch(PATH_REF),
            fetch(PATH_ARRAY),
            fetch(PATH_EVENT)
        ]);
        if (!execRes.ok || !dataRes.ok || !refRes.ok || !arrayRes.ok || !eventRes.ok) throw new Error("Missing SVGs");
        execSvgTemplate = await execRes.text();
        dataSvgTemplate = await dataRes.text();
        refSvgTemplate = await refRes.text();
        arraySvgTemplate = await arrayRes.text();
        eventSvgTemplate = await eventRes.text();
    } catch (err) {
        console.error("SVG Fetch Failed.", err);
        return;
    }

    // --- 2. Helper: Generate Pin HTML ---
    function createPinHtml(typeString, name, isOutput, isRef) {
        // Parse type: "pin_float" -> "float"
        let colorKey = typeString
            .replace('out_pin_', '')
            .replace('ref_pin_', '')
            .replace('array_', '')
            .replace('event_', '')
            .replace('pin_', '');
        let hex = pinColors[colorKey] || pinColors['wildcard'];
        
        // Choose SVG Template
        let isArray = typeString.includes('array_');
        let isEvent = typeString.includes('event');
        let isExec = (colorKey === 'exec');
        let rawSvg = 
        isExec ? execSvgTemplate : 
            (isRef ? refSvgTemplate : 
                (isArray ? arraySvgTemplate : 
                    (isEvent ? eventSvgTemplate : dataSvgTemplate)));
        
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
    const content = document.querySelector('.main-content') || document.body;
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

    const regexIframe = /\{bp\s+([^}]+)\}/g;

    content.innerHTML = content.innerHTML.replace(regexIframe, function(match, rawId) {

        // 1. Clean the ID: Remove whitespace and any accidental HTML tags (like <b> or <span>)
        let id = rawId.trim().replace(/<[^>]*>/g, '');

        // 2. Sanitize: If the "smart" keyboard turned a hyphen into an en-dash (–), fix it.
        id = id.replace(/–/g, '--').replace(/—/g, '---');

        return `
            <div style="width: 100%; height: 400px; overflow: hidden; margin: 20px auto 40px auto; border-radius: 4px;">
                <iframe 
                    src="https://blueprintue.com/render/${id}/" 
                    scrolling="no" 
                    allowfullscreen 
                    style="
                        border: none !important; 
                        width: 104% !important; 
                        height: 400px !important; 
                        margin-left: -2% !important; 
                        margin-top: -2% !important;
                    ">
                </iframe>
            </div>
        `;
    });
});
