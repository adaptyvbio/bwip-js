const bwipjs = require('./dist/bwip-js-node.js');

async function testDataMatrixCapacity() {
    console.log('Testing Data Matrix capacity for different sizes...\n');
    
    // Test different byte counts to find capacity limits
    const sizes = [
        [10, 10], [12, 12], [14, 14], [16, 16], [18, 18], [20, 20]
    ];
    
    for (const [rows, cols] of sizes) {
        console.log(`Testing ${rows}x${cols} Data Matrix:`);
        
        // Try different byte counts
        for (let byteCount = 1; byteCount <= 10; byteCount++) {
            const testBytes = Buffer.alloc(byteCount, 0x41); // Fill with 'A' (0x41)
            
            try {
                await bwipjs.toBuffer({
                    bcid: 'datamatrix',
                    bytes: testBytes,
                    rows: rows,
                    columns: cols,
                    scale: 1
                });
                console.log(`  ✓ ${byteCount} bytes: OK`);
            } catch (err) {
                console.log(`  ✗ ${byteCount} bytes: ${err.message.substring(0, 50)}...`);
                break; // Stop testing larger sizes for this matrix
            }
        }
        console.log();
    }
    
    // Test 5 bytes specifically with the smallest working size
    console.log('Testing 5 bytes with 14x14 Data Matrix (smallest working size):');
    const fiveBytes = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
    
    try {
        const png = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: fiveBytes,
            rows: 14,
            columns: 14,
            scale: 10,
            padding: 10
        });
        
        console.log('✓ Successfully encoded 5 bytes to 14x14 Data Matrix');
        console.log('  Bytes (hex):', fiveBytes.toString('hex'));
        console.log('  PNG size:', png.length, 'bytes');
        
        require('fs').writeFileSync('datamatrix-14x14-5bytes.png', png);
        console.log('  Saved as: datamatrix-14x14-5bytes.png');
        
    } catch (err) {
        console.error('✗ Failed:', err.message);
    }
}

testDataMatrixCapacity().catch(console.error);