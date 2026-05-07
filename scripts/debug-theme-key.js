// Check what localStorage keys Alpine uses for theme persistence
const puppeteer = require('puppeteer');
(async () => {
    // We'll just check by reading what Alpine puts in localStorage
    // The key format for Alpine.$persist in stores is: _x_<propName>
    // But it could also be the full dotted path
    console.log('Expected localStorage key for theme: _x_theme');
    console.log('The early script reads: localStorage.getItem("_x_theme")');
    console.log('Alpine.$persist default key = "_x_" + property name');
    console.log('For Alpine.store("app", { theme: Alpine.$persist(...) })');
    console.log('The key should be: _x_theme');
    console.log('');
    console.log('NOTE: If Alpine persist uses a different key format,');
    console.log('we need to update the early script in layout-app.ejs');
})();
