# EJS Layout & Spacing Rules

## ❌ NEVER comment out EJS includes using HTML comments `<!-- -->`
Wrapping EJS includes in HTML comments does NOT prevent the server from executing and rendering the EJS templates. 

If the included template itself contains HTML comments or closing tags, they can close the outer HTML comment early. This leaves a stray comment close tag `-->` printed directly in the final HTML output.

### The Spacing Bug
- Stray `-->` text nodes high in the `body` or right before `.main-container` act as raw text nodes.
- Browsers render these text nodes inside the inline flow, causing a line box of `~20px` to appear at the very top of the page.
- This pushes down the entire block layout, leaving a visual gap that exposes background wallpapers or dark fills.

### ❌ Bad Pattern
```html
<!-- <%- include("elements/customizer") %> -->
```

### ✅ Good Pattern (Use Server-Side EJS Comments)
To temporarily disable or comment out an EJS include, **ALWAYS** use EJS server-side comments `<%# %>` so that EJS completely ignores the include and renders nothing to the output stream:
```html
<%# include("elements/customizer") %>
```

## ✅ ALWAYS avoid leading/trailing whitespace text nodes in layout wrappers
Ensure that there are no empty raw text nodes or spacing between tags that could affect flow layout when child components are rendered.
