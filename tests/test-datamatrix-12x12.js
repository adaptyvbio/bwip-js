const bwipjs = require('./dist/bwip-js-node.js');
const fs = require('fs');

async function testDataMatrix12x12() {
    console.log('Testing 12x12 Data Matrix with 5 random bytes...\n');
    
    // Generate 5 random bytes
    const randomBytes = Buffer.from([
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ]);
    
    console.log('Random bytes (hex):', randomBytes.toString('hex'));
    console.log('Random bytes (decimal):', Array.from(randomBytes).join(', '));
    
    try {
        // Try encoding with explicit 12x12 size
        const png = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: randomBytes,
            rows: 12,
            columns: 12,
            scale: 10,  // Large scale for visibility
            padding: 10
        });
        
        console.log('\n✓ Successfully encoded to 12x12 Data Matrix');
        console.log('  PNG size:', png.length, 'bytes');
        
        // Save the image
        fs.writeFileSync('datamatrix-12x12-test.png', png);
        console.log('  Saved as: datamatrix-12x12-test.png');
        
        // Also try with different options
        console.log('\nTesting with various options...');
        
        // Test 1: Explicit square size
        const png2 = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: randomBytes,
            version: '12x12',  // Try version parameter
            scale: 10,
            padding: 10
        });
        console.log('✓ Test with version="12x12":', png2.length, 'bytes');
        
        // Test 2: Try with square option
        const png3 = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            bytes: randomBytes,
            square: true,
            rows: 12,
            scale: 10,
            padding: 10
        });
        console.log('✓ Test with square=true:', png3.length, 'bytes');
        
    } catch (err) {
        console.error('\n✗ Failed to encode:', err.message);
        console.error('\nFull error:', err);
        
        // Try to understand the issue
        console.log('\nAttempting to determine valid Data Matrix sizes...');
        
        // Test different sizes
        const sizes = [
            [10, 10], [12, 12], [14, 14], [16, 16], [18, 18], [20, 20],
            [22, 22], [24, 24], [26, 26], [32, 32], [36, 36], [40, 40]
        ];
        
        for (const [rows, cols] of sizes) {
            try {
                await bwipjs.toBuffer({
                    bcid: 'datamatrix',
                    bytes: randomBytes,
                    rows: rows,
                    columns: cols,
                    scale: 1
                });
                console.log(`  ✓ ${rows}x${cols} works`);
            } catch (e) {
                console.log(`  ✗ ${rows}x${cols} failed:`, e.message.substring(0, 50) + '...');
            }
        }
    }
}

// Also test the raw API to get more information
async function testRawAPI() {
    console.log('\n\nTesting raw API for Data Matrix capabilities...');
    
    try {
        const randomBytes = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
        
        // Test with raw API
        const result = bwipjs.raw({
            bcid: 'datamatrix',
            bytes: randomBytes
        });
        
        console.log('Raw API result:', result);
        
        if (result && result.length > 0 && result[0]) {
            const info = result[0];
            console.log('Barcode dimensions:', info.width, 'x', info.height);
            console.log('Available properties:', Object.keys(info));
        }
        
    } catch (err) {
        console.error('Raw API error:', err.message);
    }
}

async function main() {
    // First rebuild to ensure we have latest changes
    console.log('Building project first...');
    require('child_process').execSync('bun run build', { stdio: 'inherit' });
    console.log('Build complete.\n');
    
    await testDataMatrix12x12();
    await testRawAPI();
}

main().catch(console.error);