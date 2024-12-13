// Initialize CKEditor
ClassicEditor
    .create(document.querySelector('#editor'))
    .then(editor => {
        // Add real-time update on content change
        editor.model.document.on('change:data', () => {
            updateOutputFromEditor();
        });

        // Store editor instance globally
        window.editor = editor;
    })
    .catch(error => {
        console.error(error);
    });

function cleanHTML(html) {
    // Create a temporary div to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Function to clean an element
    function cleanElement(element) {
        // Remove style attributes
        element.removeAttribute('style');
        element.removeAttribute('class');
        element.removeAttribute('dir');

        // Remove span tags but keep their content
        const spans = element.getElementsByTagName('span');
        while (spans.length > 0) {
            const span = spans[0];
            while (span.firstChild) {
                span.parentNode.insertBefore(span.firstChild, span);
            }
            span.parentNode.removeChild(span);
        }

        // Clean all child elements
        Array.from(element.children).forEach(child => {
            cleanElement(child);
        });
    }

    // Clean the temporary element
    cleanElement(temp);
    return temp.innerHTML;
}

function formatHTML(html) {
    let formatted = '';
    let indent = 0;
    const tab = '    '; // 4 spaces for indentation
    
    // Helper function to add newlines and indentation
    function addNewLine() {
        formatted += '\n';
        for (let i = 0; i < indent; i++) {
            formatted += tab;
        }
    }

    // Parse the HTML into a temporary element
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();

    // Function to format a node
    function formatNode(node) {
        if (node.nodeType === 3) { // Text node
            const text = node.textContent;
            if (text) {
                // Preserve the exact text content including spaces
                formatted += text;
            }
        } else if (node.nodeType === 1) { // Element node
            const tagName = node.tagName.toLowerCase();
            
            // Add newline and indentation before opening tag
            if (tagName === 'p' || tagName === 'div') {
                if (formatted) addNewLine();
            }
            
            // Add opening tag
            formatted += `<${tagName}`;
            
            // Add attributes
            Array.from(node.attributes).forEach(attr => {
                formatted += ` ${attr.name}="${attr.value}"`;
            });
            
            formatted += '>';
            
            // Handle children and text content
            if (node.childNodes.length > 0) {
                if (tagName === 'p' || tagName === 'div') indent++;
                Array.from(node.childNodes).forEach(child => {
                    formatNode(child);
                });
                if (tagName === 'p' || tagName === 'div') {
                    indent--;
                    addNewLine();
                }
            }
            
            // Add closing tag
            formatted += `</${tagName}>`;
        }
    }

    // Format each root node
    Array.from(temp.childNodes).forEach(node => {
        formatNode(node);
    });

    return formatted;
}

// Function to update output from editor changes
function updateOutputFromEditor() {
    const data = window.editor.getData();
    const formattedHTML = formatHTML(data);
    document.getElementById('output').value = formattedHTML;
    updatePreview();
}

// Function to update the preview
function updatePreview() {
    const outputText = document.getElementById('output').value;
    const previewElement = document.getElementById('preview');
    previewElement.innerHTML = outputText;
}

// Add event listener for output textarea changes
document.getElementById('output').addEventListener('input', updatePreview);

// Copy to clipboard functionality
document.getElementById('copyButton').addEventListener('click', async () => {
    const outputText = document.getElementById('output').value;
    try {
        await navigator.clipboard.writeText(outputText);
        const button = document.getElementById('copyButton');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});
