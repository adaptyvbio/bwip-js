const bwipjs = require('./dist/bwip-js-node.js');

async function testBase256Encoding() {
    console.log('Testing base256 encoding for high byte values...\n');
    
    const problematicBytes = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    
    // Test with manual base256 encoding
    try {
        const png = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            text: String.fromCharCode(...problematicBytes),
            binarytext: true,
            encoding: 'base256',
            rows: 14,  // Use 14x14 which we know has more capacity
            columns: 14,
            scale: 5
        });
        
        console.log('✓ Manual base256 encoding works with 14x14');
        console.log('  PNG size:', png.length, 'bytes');
        
        require('fs').writeFileSync('datamatrix-base256-manual.png', png);
        console.log('  Saved as: datamatrix-base256-manual.png');
        
    } catch (err) {
        console.log('✗ Manual base256 failed:', err.message);
    }
    
    // Test with our bytes option
    try {
        const png2 = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: problematicBytes,
            rows: 14,
            columns: 14,
            scale: 5
        });
        
        console.log('✓ Bytes option with base256 works with 14x14');
        console.log('  PNG size:', png2.length, 'bytes');
        
        require('fs').writeFileSync('datamatrix-base256-bytes.png', png2);
        console.log('  Saved as: datamatrix-base256-bytes.png');
        
    } catch (err) {
        console.log('✗ Bytes option failed:', err.message);
    }
    
    // Test different size matrices with problematic bytes
    console.log('\nTesting various sizes with 0xFF bytes:');
    const sizes = [[12, 12], [14, 14], [16, 16], [18, 18], [20, 20]];
    
    for (const [rows, cols] of sizes) {
        try {
            await bwipjs.toBuffer({
                bcid: 'datamatrix',
                bytes: problematicBytes,
                rows: rows,
                columns: cols,
                scale: 1
            });
            console.log(`  ✓ ${rows}x${cols} works with bytes option`);
        } catch (err) {
            console.log(`  ✗ ${rows}x${cols} failed: ${err.message.substring(0, 50)}...`);
        }
    }
}

testBase256Encoding().catch(console.error);