#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Build configuration for Node.js version
const buildNode = async () => {
  console.log('Building bwip-js for Node.js using Bun...');
  
  // Read the source files in order
  const srcDir = './src';
  const distDir = './dist';
  
  // Header for the compiled file
  const header = `// This file is part of the bwip-js project available at:
//
//    http://metafloor.github.io/bwip-js
//
// Copyright (c) 2011-2025 Mark Warren
//
// This file contains code automatically generated from:
// Barcode Writer in Pure PostScript - Version 2025-04-19
// Copyright (c) 2004-2024 Terry Burton
//
// The MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
"use strict";\n\n`;

  // Source files in dependency order
  const sourceFiles = [
    'bwipjs.js',
    'bwipp.js',
    'drawing-builtin.js',
    'drawing-zlibpng.js',
    'fontlib.js',
    'exports.js'
  ];
  
  let combinedSource = header;
  
  // Process each source file
  for (const file of sourceFiles) {
    const filePath = join(srcDir, file);
    console.log(`  Processing ${file}...`);
    
    let content = readFileSync(filePath, 'utf8');
    
    // Remove any module.exports or exports statements for now
    content = content.replace(/module\.exports\s*=\s*[^;]+;/g, '');
    content = content.replace(/exports\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*/g, '');
    
    // Add file marker
    combinedSource += `\n// ${file}\n`;
    
    // Handle specific transformations for exports.js
    if (file === 'exports.js') {
      // Replace the version placeholder
      content = content.replace(/__BWIPJS_VERS__/g, '4.7.2 (2025-06-26)');
      
      // Remove the browser and react-native specific sections completely
      content = content.replace(/\/\/@@BEGIN-BROWSER-EXPORTS@@[\s\S]*?\/\/@@ENDOF-EXPORTS@@/g, '');
      content = content.replace(/\/\/@@BEGIN-REACT-NV-EXPORTS@@[\s\S]*?\/\/@@ENDOF-EXPORTS@@/g, '');
      
      // Remove the markers for NODE-JS exports
      content = content.replace(/\/\/@@BEGIN-NODE-JS-EXPORTS@@/g, '');
      content = content.replace(/\/\/@@ENDOF-EXPORTS@@/g, '');
    }
    
    combinedSource += content + '\n';
  }
  
  // Add module exports at the end
  combinedSource += `
// Module exports
module.exports = {
    toBuffer: ToBuffer,
    toSVG: ToSVG,
    raw: ToRaw,
    render: Render,
    request: Request,
    FontLib: FontLib,
    loadFont: FontLib.loadFont,
    BWIPP_VERSION: BWIPP_VERSION,
    BWIPJS_VERSION: BWIPJS_VERSION,
    // Symbol-specific exports
`;

  // Add all the barcode type exports
  const barcodeTypes = [
    'auspost', 'azteccode', 'azteccodecompact', 'aztecrune', 'bc412', 'channelcode',
    'codablockf', 'code11', 'code128', 'code16k', 'code2of5', 'code32', 'code39',
    'code39ext', 'code49', 'code93', 'code93ext', 'codeone', 'coop2of5', 'daft',
    'databarexpanded', 'databarexpandedcomposite', 'databarexpandedstacked',
    'databarexpandedstackedcomposite', 'databarlimited', 'databarlimitedcomposite',
    'databaromni', 'databaromnicomposite', 'databarstacked', 'databarstackedcomposite',
    'databarstackedomni', 'databarstackedomnicomposite', 'databartruncated',
    'databartruncatedcomposite', 'datalogic2of5', 'datamatrix', 'datamatrixrectangular',
    'datamatrixrectangularextension', 'dotcode', 'ean13', 'ean13composite', 'ean14',
    'ean2', 'ean5', 'ean8', 'ean8composite', 'flattermarken', 'gs1_128', 'gs1_128composite',
    'gs1_cc', 'gs1datamatrix', 'gs1datamatrixrectangular', 'gs1dldatamatrix', 'gs1dlqrcode',
    'gs1dotcode', 'gs1northamericancoupon', 'gs1qrcode', 'hanxin', 'hibcazteccode',
    'hibccodablockf', 'hibccode128', 'hibccode39', 'hibcdatamatrix', 'hibcdatamatrixrectangular',
    'hibcmicropdf417', 'hibcpdf417', 'hibcqrcode', 'iata2of5', 'identcode', 'industrial2of5',
    'interleaved2of5', 'isbn', 'ismn', 'issn', 'itf14', 'jabcode', 'japanpost', 'kix',
    'leitcode', 'mailmark', 'mands', 'matrix2of5', 'maxicode', 'micropdf417', 'microqrcode',
    'msi', 'onecode', 'pdf417', 'pdf417compact', 'pharmacode', 'pharmacode2', 'planet',
    'plessey', 'posicode', 'postnet', 'pzn', 'qrcode', 'rationalizedCodabar', 'raw',
    'rectangularmicroqrcode', 'royalmail', 'sscc18', 'swissqrcode', 'symbol', 'telepen',
    'telepennumeric', 'ultracode', 'upca', 'upcacomposite', 'upce', 'upcecomposite'
  ];

  for (const type of barcodeTypes) {
    combinedSource += `    ${type}: function(opts, drawing) {
        if (arguments.length == 1) {
            return _ToAny(bwipp_${type}, opts);
        } else {
            return _ToAny(bwipp_${type}, opts, drawing);
        }
    },\n`;
  }

  combinedSource += '};\n';

  // Write the combined file
  const outputPath = join(distDir, 'bwip-js-node.js');
  writeFileSync(outputPath, combinedSource);
  
  console.log(`✓ Built ${outputPath}`);
};

// Run the build
buildNode().catch(console.error);