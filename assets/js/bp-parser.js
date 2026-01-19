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

    // Paths to your SVGs
    const PATH_EXEC = '/AsyncConveyorPlugin/assets/images/bp_pin_exec.svg';
    const PATH_DATA = '/AsyncConveyorPlugin/assets/images/bp_pin_data.svg';
    const PATH_REF = '/AsyncConveyorPlugin/assets/images/bp_pin_ref.svg';
    const PATH_ARRAY = '/AsyncConveyorPlugin/assets/images/bp_pin_array.svg';
    const PATH_EVENT = '/AsyncConveyorPlugin/assets/images/bp_pin_event.svg';

    // --- 1. Fetch SVGs ---
    let execSvgTemplate = '', dataSvgTemplate = '', refSvgTemplate = '', arraySvgTemplate = '', eventSvgTemplate = '';

    try {
        const [execRes, dataRes, refRes, arrayRes, eventRes] = await Promise.all([
            fetch(PATH_EXEC), fetch(PATH_DATA), fetch(PATH_REF), fetch(PATH_ARRAY), fetch(PATH_EVENT)
        ]);
        if (!execRes.ok) throw new Error("Missing SVGs");

        execSvgTemplate = await execRes.text();
        dataSvgTemplate = await dataRes.text();
        refSvgTemplate = await refRes.text();
        arraySvgTemplate = await arrayRes.text();
        eventSvgTemplate = await eventRes.text();
    } catch (err) {
        console.warn("Blueprint Parser: SVGs failed to load. Nodes will lack icons.", err);
        return;
    }

    // --- 2. Helper: Generate Pin HTML ---
    function createPinHtml(typeString, name, isOutput) {
        let colorKey = typeString
            .replace("out_", "")
            .replace("ref_", "")
            .replace("array_", "")
            .replace("event_", "")
            .replace("pin_", "");
        //let colorKey = typeString.replace(/^(out_|ref_|array_|event_|pin_)/, '');
        let hex = pinColors[colorKey] || pinColors['wildcard'];

        let isArray = typeString.includes('array_');
        let isEvent = typeString.includes('event');
        let isExec = (colorKey === 'exec');
        let isRef = typeString.includes('ref_');

        let rawSvg = isExec ? execSvgTemplate :
            (isRef ? refSvgTemplate :
                (isArray ? arraySvgTemplate :
                    (isEvent ? eventSvgTemplate : dataSvgTemplate)));

        let coloredSvg = rawSvg.replace(/{{COLOR}}/g, hex);
        let iconHtml = `<div class="pin-icon">${coloredSvg}</div>`;
        let textHtml = `<span>${name}</span>`;

        return isOutput ?
            `<div class="bp-pin">${textHtml}${iconHtml}</div>` :
            `<div class="bp-pin">${iconHtml}${textHtml}</div>`;
    }

    // --- 3. Render Node Logic ---
    // This logic mimics your original regex callback but creates a DOM element instead of a string
    function renderNode(match, nodeType, title, argsString) {
        let inputsHtml = '';
        let outputsHtml = '';
        let subtitleHtml = '';

        if (nodeType === 'impure') {
            inputsHtml += createPinHtml('pin_exec', '', false);
            outputsHtml += createPinHtml('pin_exec', '', true);
        }

        if (argsString) {
            let args = argsString.split(',').map(s => s.trim());

            if (args.length > 0 && args[0].toLowerCase().startsWith("target is")) {
                subtitleHtml = `<span class="bp-subtitle">${args[0]}</span>`;
                args.shift();
            }

            args.forEach(pin => {
                let firstSpace = pin.indexOf(' ');
                if (firstSpace === -1) return;

                let typeCode = pin.substring(0, firstSpace).toLowerCase();
                let paramName = pin.substring(firstSpace + 1);

                if(typeCode === "target" || typeCode === "target_static") {
                    subtitleHtml = `<span class="bp-subtitle">Target is ${paramName}</span>`;
                    if (typeCode === "target_static") return;
                    typeCode = "pin_object";
                    paramName = "Target";
                }

                let isOutput = typeCode.startsWith('out_');
                // Note: isRef logic is handled inside createPinHtml by regex checking the typeCode
                let html = createPinHtml(typeCode, paramName, isOutput);

                if (isOutput) outputsHtml += html;
                else inputsHtml += html;
            });
        }

        // Create the container div
        const div = document.createElement('div');
        div.className = `bp-node ${nodeType}`;
        div.contentEditable = "false";
        div.innerHTML = `
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
        `;
        return div;
    }

    // --- 4. Main Processing Loop (Placeholder Hydration) ---
    // We look for the hidden divs created by the Ruby plugin
    const placeholders = document.querySelectorAll('.js-bp-node-placeholder');

    placeholders.forEach(placeholder => {
        const rawTag = placeholder.dataset.raw;
        if (!rawTag) return;

        // Regex to parse the content INSIDE the tag: {bp_node_TYPE, Title, Args}
        const regex = /\{bp_node_(pure|impure),\s*([^,]+)(?:,\s*(.*?))?\}/;
        const match = regex.exec(rawTag);

        if (match) {
            // Generate the Node
            const newNode = renderNode(match[0], match[1], match[2], match[3]);
            // Replace the hidden placeholder with the visible node
            placeholder.replaceWith(newNode);
        }
    });
});