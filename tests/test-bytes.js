const bwipjs = require('../dist/bwip-js-node.js');
const fs = require('fs');

async function testBytesInput() {
    console.log('Testing toBuffer with different input types...\n');
    
    // Test 1: String input (backward compatibility)
    try {
        const png1 = await bwipjs.toBuffer({
            bcid: 'code128',
            text: 'Hello World',
            scale: 3,
            height: 10
        });
        console.log('✓ String input works:', png1.length, 'bytes');
    } catch (err) {
        console.error('✗ String input failed:', err.message);
    }
    
    // Test 2: Buffer input with binary data using bytes option
    try {
        const binaryData = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]); // "Hello World"
        const png2 = await bwipjs.toBuffer({
            bcid: 'code128',
            bytes: binaryData,
            scale: 3,
            height: 10
        });
        console.log('✓ Buffer input via bytes option works:', png2.length, 'bytes');
    } catch (err) {
        console.error('✗ Buffer input via bytes option failed:', err.message);
    }
    
    // Test 3: Uint8Array input using bytes option
    try {
        const uint8Data = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]); // "Hello World"
        const png3 = await bwipjs.toBuffer({
            bcid: 'code128',
            bytes: uint8Data,
            scale: 3,
            height: 10
        });
        console.log('✓ Uint8Array input via bytes option works:', png3.length, 'bytes');
    } catch (err) {
        console.error('✗ Uint8Array input via bytes option failed:', err.message);
    }
    
    // Test 4: Binary data with non-ASCII bytes (including 0xFF)
    try {
        const binaryData = Buffer.from([0x00, 0x01, 0xFF, 0xFE, 0x80, 0x7F, 0xFF]);
        const png4 = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: binaryData,
            scale: 3
        });
        console.log('✓ Binary data with non-ASCII bytes (including 0xFF) works:', png4.length, 'bytes');
        
        // Save to file for visual inspection
        fs.writeFileSync('test-binary-barcode.png', png4);
        console.log('  Saved test barcode to test-binary-barcode.png');
    } catch (err) {
        console.error('✗ Binary data with non-ASCII bytes failed:', err.message);
    }
    
    // Test 5: Error case - invalid bytes type
    try {
        await bwipjs.toBuffer({
            bcid: 'code128',
            bytes: "not a buffer",
            scale: 3,
            height: 10
        });
        console.error('✗ Invalid bytes type should have failed');
    } catch (err) {
        console.log('✓ Invalid bytes type correctly rejected:', err.message);
    }
    
    // Test 6: Using both text and bytes (bytes should take precedence)
    try {
        const binaryData = Buffer.from([0x41, 0x42, 0x43]); // "ABC"
        const png6 = await bwipjs.toBuffer({
            bcid: 'code128',
            text: 'XYZ',
            bytes: binaryData,
            scale: 3,
            height: 10
        });
        console.log('✓ Using both text and bytes works (bytes takes precedence):', png6.length, 'bytes');
    } catch (err) {
        console.error('✗ Using both text and bytes failed:', err.message);
    }
}

testBytesInput().then(() => {
    console.log('\nAll tests completed!');
}).catch(err => {
    console.error('Test error:', err);
});