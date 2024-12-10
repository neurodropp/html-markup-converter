// Initialize CKEditor
ClassicEditor
    .create(document.querySelector('#editor'))
    .then(editor => {
        // Add real-time update on content change
        editor.model.document.on('change:data', () => {
            updateOutput();
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
            const text = node.textContent.trim();
            if (text) {
                formatted += text;
            }
        } else if (node.nodeType === 1) { // Element node
            const tagName = node.tagName.toLowerCase();
            
            // Add newline and indentation before opening tag
            if (formatted) {
                addNewLine();
            }
            
            // Add opening tag
            formatted += `<${tagName}`;
            
            // Add attributes
            Array.from(node.attributes).forEach(attr => {
                formatted += ` ${attr.name}="${attr.value}"`;
            });
            
            formatted += '>';
            
            // Handle children
            if (node.children.length > 0) {
                indent++;
                Array.from(node.children).forEach(child => {
                    formatNode(child);
                });
                indent--;
                addNewLine();
            } else if (node.textContent.trim()) {
                formatted += node.textContent.trim();
            }
            
            // Add closing tag
            formatted += `</${tagName}>`;
        }
    }

    // Format each child node
    Array.from(temp.childNodes).forEach(node => {
        formatNode(node);
    });

    return formatted;
}

function updateOutput() {
    const content = window.editor.getData();
    const cleanContent = cleanHTML(content);
    const formattedContent = formatHTML(cleanContent);
    document.getElementById('output').value = formattedContent;
}

// Copy to clipboard functionality
document.getElementById('copyButton').addEventListener('click', async () => {
    const outputText = document.getElementById('output').value;
    try {
        await navigator.clipboard.writeText(outputText);
        const button = document.getElementById('copyButton');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = '#333333';
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '#000000';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard');
    }
});
