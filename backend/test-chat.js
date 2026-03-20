const fetch = require('node-fetch');

async function testChat() {
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "hello" })
        });
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (err) {
        console.error('Error:', err);
    }
}
testChat();
