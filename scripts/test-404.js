const axios = require('axios');

async function test404() {
    try {
        console.log("Fetching a non-existent URL...");
        const response = await axios.get('http://localhost:3000/non-existent-route-for-testing', {
            validateStatus: (status) => true // Don't throw on error statuses
        });
        
        console.log("HTTP Status Received:", response.status);
        if (response.status === 404) {
            console.log("✅ Successfully returned 404 Not Found!");
        } else {
            console.log("❌ Expected status 404, but got:", response.status);
        }

        const html = response.data;
        const hasTitle = html.includes("<title>Page Non Trouvée | Cyberbox</title>");
        const has404Text = html.includes("Page introuvable");
        const hasLoginBtn = html.includes('href="/auth/login"');
        const hasBackBtn = html.includes('window.history.back()');

        if (hasTitle && has404Text && hasLoginBtn && hasBackBtn) {
            console.log("✅ HTML Elements verified successfully!");
            console.log("Found Title: ", hasTitle);
            console.log("Found Heading: ", has404Text);
            console.log("Found Login Redirect Button: ", hasLoginBtn);
            console.log("Found Back History Button: ", hasBackBtn);
        } else {
            console.log("❌ HTML elements verification failed.");
            console.log("HTML Sample:", html.substring(0, 500));
        }

    } catch (err) {
        console.error("❌ Request failed:", err.message);
    }
}

test404();
