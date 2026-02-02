/**
 * Word HTML Cleaner Utility
 * Supports 3 paste modes: keep, match, plain
 * 
 * - keep: Original cleaning with beautification (EXACT original function)
 * - match: Same as keep (for compatibility)
 * - plain: Strip all HTML, return text only
 */

/**
 * Main entry point - Clean HTML based on mode
 * @param {string} html - Raw HTML from clipboard
 * @param {string} mode - 'keep' | 'match' | 'plain'
 * @returns {string} - Cleaned HTML
 */
export function cleanWordHtml(html, mode = 'match') {
    if (mode === 'plain') {
        return stripToPlainText(html)
    }
    // Both 'keep' and 'match' use the original cleaning function
    return cleanWordHtmlOriginal(html)
}

/**
 * Plain Text Mode - Strip all HTML, keep only text
 */
function stripToPlainText(html) {
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Get text content, preserve some structure
    let text = temp.textContent || ''

    // Clean up whitespace
    text = text.replace(/[\r\n]+/g, '\n')
    text = text.replace(/\n{3,}/g, '\n\n')
    text = text.trim()

    // Convert newlines to <br> for HTML insertion
    return text.replace(/\n/g, '<br>')
}

/**
 * Original cleanWordHtml function - EXACT copy from Alpine.js
 * Used for both 'keep' and 'match' modes
 */
function cleanWordHtmlOriginal(html) {
    // Create a temporary div to parse HTML
    var temp = document.createElement('div');

    // Pre-cleaning
    html = html.replace(/<!--\[if\s+!vml\]-->([\s\S]*?)<!--\[endif\]-->/gi, '$1');
    html = html.replace(/<!\[if\s+!vml\]>([\s\S]*?)<!\[endif\]>/gi, '$1');
    html = html.replace(/<!--\[if\s+vml\]>([\s\S]*?)<!--\[endif\]-->/gi, '');
    html = html.replace(/<!\[if\s+vml\]>([\s\S]*?)<!\[endif\]>/gi, '');
    html = html.replace(/<!--\[if\s+gte\s+vml\s+1\]>([\s\S]*?)<!--\[endif\]-->/gi, '');
    html = html.replace(/<o:p>\s*<\/o:p>/g, '');
    html = html.replace(/<o:p>.*?<\/o:p>/g, function (match) {
        return match.replace(/<o:p>|<\/o:p>/g, '');
    });

    temp.innerHTML = html;

    function unwrap(el) {
        var parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
    }

    // 1. General Gentle Clean (Preserves formatting for normal text)
    var elementsToClean = temp.querySelectorAll('*');
    elementsToClean.forEach(function (el) {
        el.removeAttribute('class');
        el.removeAttribute('lang');

        var tagName = el.tagName;
        // Skip tables/lists here, we handle them aggressively below
        if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'UL', 'OL', 'LI'].includes(tagName)) return;

        var style = el.getAttribute('style');
        if (style) {
            style = style.replace(/mso-[^;]+;?/gi, '');
            style = style.replace(/position:[^;]+;?/gi, '');
            style = style.replace(/margin[^;]*;?/gi, '');
            style = style.replace(/padding[^;]*;?/gi, '');
            el.setAttribute('style', style);
        }

        if (tagName === 'IMG') {
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
            el.removeAttribute('width');
            el.removeAttribute('height');
            el.removeAttribute('v:shapes');
        }
    });

    // 2. DEEP CLEAN & BEAUTIFY: Tables and Lists
    // User wants to strip ALL original styles inside tables/lists and apply a "Beautiful" look.

    // Tables
    var tables = temp.querySelectorAll('table');
    tables.forEach(function (table) {
        // 2a. Nuke styles from Table and ALL descendants
        table.removeAttribute('style');
        table.removeAttribute('border');
        table.removeAttribute('cellspacing');
        table.removeAttribute('cellpadding');
        table.removeAttribute('width');

        var descendants = table.querySelectorAll('*');
        descendants.forEach(function (d) {
            d.removeAttribute('style'); // Removes text color, font, bg, everything.
            d.removeAttribute('class');
            d.removeAttribute('width');
            d.removeAttribute('height');
            d.removeAttribute('bgcolor');
            d.removeAttribute('align');
            d.removeAttribute('valign');
        });

        // 2b. Apply "Beautiful Table" Inline Styles
        // Container
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '1em';
        table.style.marginTop = '0.5em';
        table.style.fontFamily = 'inherit';
        table.style.fontSize = '0.9em'; // Slightly smaller font for data
        table.style.border = '1px solid #e5e7eb';

        // Headers
        var ths = table.querySelectorAll('th');
        ths.forEach(function (th) {
            th.style.backgroundColor = '#f9fafb';
            th.style.color = '#111827';
            th.style.fontWeight = '600';
            th.style.textAlign = 'left';
            th.style.padding = '8px 12px'; // Reduced padding
            th.style.borderBottom = '1px solid #d1d5db';
        });

        // Cells
        var tds = table.querySelectorAll('td');
        tds.forEach(function (td) {
            td.style.padding = '6px 12px'; // Compact padding
            td.style.borderBottom = '1px solid #e5e7eb';
            td.style.color = '#374151';
            td.style.verticalAlign = 'top';

            // Fix: Remove default margins from P tags inside cells to prevent huge rows
            var paragraphs = td.querySelectorAll('p');
            paragraphs.forEach(function (p) {
                p.style.margin = '0';
                p.style.lineHeight = '1.4';
            });
        });
    });

    // Lists
    var lists = temp.querySelectorAll('ul, ol');
    lists.forEach(function (list) {
        // 2c. Nuke styles from List and ALL descendants
        list.removeAttribute('style');

        var descendants = list.querySelectorAll('*');
        descendants.forEach(function (d) {
            d.removeAttribute('style');
            d.removeAttribute('class');
        });

        // 2d. Apply "Beautiful List" Styles
        list.style.paddingLeft = '1.5em';
        list.style.marginBottom = '1em';
        list.style.color = '#374151';

        if (list.tagName === 'UL') list.style.listStyleType = 'disc';
        if (list.tagName === 'OL') list.style.listStyleType = 'decimal';

        var lis = list.querySelectorAll('li');
        lis.forEach(function (li) {
            li.style.marginBottom = '0.25em'; // Reduced spacing
            li.style.lineHeight = '1.5';
        });
    });

    // Final string cleanup
    var result = temp.innerHTML;
    result = result.replace(/[\r\n]+/g, ' ');
    result = result.replace(/<o:p><\/o:p>/gi, '');
    result = result.replace(/<!--[\s\S]*?-->/gi, '');
    result = result.replace(/<span[^>]*>\s*<\/span>/gi, '');
    result = result.replace(/<br\s*\/?>\s*(?!<br)/gi, ' ');
    result = result.replace(/\s{2,}/g, ' ');

    return result;
}
