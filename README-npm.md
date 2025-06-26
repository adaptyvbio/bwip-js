# @adaptyvbio/bwip-js

A fork of [bwip-js](https://github.com/metafloor/bwip-js) with added support for encoding raw bytes in barcodes.

## Installation

```bash
npm install @adaptyvbio/bwip-js
```

## New Feature: Raw Bytes Support

This fork adds support for encoding raw bytes (including non-ASCII bytes like `0xFF`) through a new `bytes` option:

```javascript
const bwipjs = require('@adaptyvbio/bwip-js');

// Using Buffer with raw bytes
const binaryData = Buffer.from([0x00, 0x01, 0xFF, 0xFE, 0x80, 0x7F]);
const png = await bwipjs.toBuffer({
    bcid: 'datamatrix',
    bytes: binaryData,  // New option!
    scale: 3
});

// Using Uint8Array
const uint8Data = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]);
const png2 = await bwipjs.toBuffer({
    bcid: 'code128',
    bytes: uint8Data,
    scale: 3,
    height: 10
});

// Original string-based API still works
const png3 = await bwipjs.toBuffer({
    bcid: 'code128',
    text: 'Hello World',
    scale: 3,
    height: 10
});
```

## Key Differences from Original bwip-js

1. **New `bytes` option**: Accepts `Buffer` or `Uint8Array` for raw byte encoding
2. **Automatic binary mode**: When using `bytes`, the `binarytext` flag is automatically set to `true`
3. **Full byte range support**: All byte values (0x00-0xFF) are preserved without UTF-8 conversion
4. **Backward compatible**: Original string-based `text` option continues to work as before

## Usage

All original bwip-js functionality is preserved. See the [original documentation](https://github.com/metafloor/bwip-js) for complete API reference.

### Example with Error Handling

```javascript
try {
    const png = await bwipjs.toBuffer({
        bcid: 'qrcode',
        bytes: Buffer.from([0xFF, 0xFE, 0xFD]),
        scale: 5
    });
    // Use the png Buffer...
} catch (err) {
    console.error('Barcode generation failed:', err);
}
```

## Supported Barcode Types

All barcode types from the original bwip-js are supported, including:
- Data Matrix
- QR Code
- Code 128
- Code 39
- PDF417
- Aztec Code
- And many more...

## License

MIT (same as original bwip-js)