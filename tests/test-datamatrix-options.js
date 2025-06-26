const bwipjs = require('./dist/bwip-js-node.js');

async function testDataMatrixOptions() {
    console.log('Testing Data Matrix encoding options...\n');
    
    const testBytes = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    
    // Test different encoding options
    const encodingOptions = [
        {},
        { encoding: 'ascii' },
        { encoding: 'c40' },
        { encoding: 'text' },
        { encoding: 'x12' },
        { encoding: 'edifact' },
        { encoding: 'base256' },
        { parse: false },
        { raw: true },
        { mode: 'byte' },
        { mode: 'ascii' },
        { eclevel: 'L' },
        { format: 'square' },
        { format: 'rectangle' },
    ];
    
    for (let i = 0; i < encodingOptions.length; i++) {
        const options = {
            bcid: 'datamatrix',
            bytes: testBytes,
            rows: 12,
            columns: 12,
            scale: 1,
            ...encodingOptions[i]
        };
        
        console.log(`Test ${i + 1}: ${JSON.stringify(encodingOptions[i])}`);
        
        try {
            await bwipjs.toBuffer(options);
            console.log('  ✓ Success');
        } catch (err) {
            console.log(`  ✗ Failed: ${err.message.substring(0, 60)}...`);
        }
    }
    
    // Test without our special options to see if it works
    console.log('\nTesting without byte mode forcing:');
    try {
        const result = await bwipjs.toBuffer({
            bcid: 'datamatrix',
            text: String.fromCharCode(0x01, 0x02, 0x03, 0x04, 0x05),
            binarytext: true,
            rows: 12,
            columns: 12,
            scale: 1
        });
        console.log('✓ Manual approach works');
    } catch (err) {
        console.log(`✗ Manual approach failed: ${err.message}`);
    }
}

testDataMatrixOptions().catch(console.error);