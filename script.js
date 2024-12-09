// Initialize TinyMCE
tinymce.init({
    selector: '#editor',
    height: 500,
    menubar: true,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
        'bold italic | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link table | ' +
        'removeformat',
    setup: function(editor) {
        // Add real-time update on content change
        editor.on('input', function() {
            updateOutput();
        });
        editor.on('change', function() {
            updateOutput();
        });
    }
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

        // Remove div tags but keep their content
        const divs = element.getElementsByTagName('div');
        while (divs.length > 0) {
            const div = divs[0];
            while (div.firstChild) {
                div.parentNode.insertBefore(div.firstChild, div);
            }
            div.parentNode.removeChild(div);
        }

        // Convert remaining elements to appropriate tags
        Array.from(element.children).forEach(child => {
            cleanElement(child);
        });
    }

    // Clean the temporary div
    cleanElement(temp);

    // Get the cleaned HTML and format it
    let cleanedHTML = temp.innerHTML;
    
    // Replace multiple line breaks with a single one
    cleanedHTML = cleanedHTML.replace(/(\r\n|\n|\r)+/g, '\n');
    
    // Add proper indentation
    cleanedHTML = formatHTML(cleanedHTML);
    
    return cleanedHTML;
}

function formatHTML(html) {
    let formatted = '';
    let indent = 0;
    
    // Split on '<' to get array of tags and content
    const tokens = html.split('<');
    
    for (let i = 0; i < tokens.length; i++) {
        if (!tokens[i]) continue;
        
        let line = '<' + tokens[i];
        
        // Decrease indent for closing tags
        if (line.indexOf('</') === 0) indent--;
        
        // Add indentation
        formatted += '    '.repeat(indent) + line.trim() + '\n';
        
        // Increase indent for opening tags if there's no closing tag on the same line
        if (line.indexOf('</') !== 0 && line.indexOf('/>') === -1 && line.indexOf('<br>') === -1) {
            if (
                line.indexOf('</') === -1 &&
                !line.match(/<(img|br|input|hr|meta|link)[^>]*>/)
            ) {
                indent++;
            }
        }
    }
    
    return formatted;
}

function updateOutput() {
    // Wait for TinyMCE to be initialized
    if (tinymce.activeEditor) {
        const content = tinymce.activeEditor.getContent();
        const cleanedContent = cleanHTML(content);
        document.getElementById('output').value = cleanedContent;
    }
}
