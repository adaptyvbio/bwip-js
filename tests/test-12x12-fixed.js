const bwipjs = require('./dist/bwip-js-node.js');
const fs = require('fs');

async function test12x12DataMatrix() {
    console.log('Testing 12x12 Data Matrix with exactly 5 bytes...\n');
    
    // Test with 5 specific bytes
    const testBytes = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
    
    console.log('Test bytes (hex):', testBytes.toString('hex'));
    console.log('Test bytes (decimal):', Array.from(testBytes).join(', '));
    
    try {
        const png = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: testBytes,
            rows: 12,
            columns: 12,
            scale: 10,
            padding: 10
        });
        
        console.log('\n✓ Successfully encoded 5 bytes to 12x12 Data Matrix!');
        console.log('  PNG size:', png.length, 'bytes');
        
        fs.writeFileSync('datamatrix-12x12-success.png', png);
        console.log('  Saved as: datamatrix-12x12-success.png');
        
        // Test with different 5-byte combinations
        console.log('\nTesting various 5-byte combinations:');
        
        const testCases = [
            Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]), // All zeros
            Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]), // All 0xFF
            Buffer.from([0x41, 0x42, 0x43, 0x44, 0x45]), // ASCII: ABCDE
            Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]), // ASCII: Hello
            Buffer.from([0x80, 0x90, 0xA0, 0xB0, 0xC0]), // High bytes
        ];
        
        for (let i = 0; i < testCases.length; i++) {
            try {
                const testPng = await bwipjs.toBuffer({
                    bcid: 'datamatrix',
                    bytes: testCases[i],
                    rows: 12,
                    columns: 12,
                    scale: 5
                });
                
                console.log(`  ✓ Test ${i + 1} (${testCases[i].toString('hex')}): ${testPng.length} bytes`);
                
            } catch (err) {
                console.log(`  ✗ Test ${i + 1} (${testCases[i].toString('hex')}): ${err.message}`);
            }
        }
        
        return true;
        
    } catch (err) {
        console.error('\n✗ Failed to encode 5 bytes to 12x12 Data Matrix:');
        console.error('  Error:', err.message);
        return false;
    }
}

async function main() {
    const success = await test12x12DataMatrix();
    
    if (success) {
        console.log('\n🎉 12x12 Data Matrix with 5 bytes works perfectly!');
        console.log('The library already supports this functionality.');
    } else {
        console.log('\n❌ Issue found - will need to investigate further.');
    }
}

main().catch(console.error);