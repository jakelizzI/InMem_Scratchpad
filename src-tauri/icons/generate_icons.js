import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 calculation helper for PNG chunks
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ -1) >>> 0;
}

// Adler32 calculation helper for Zlib stream
function adler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

// Create a 100% valid, uncompressed 32x32 RGBA PNG image
function create32x32ValidPng() {
  const width = 32;
  const height = 32;
  
  // Build uncompressed scanlines: each line has filter byte 0x00 + 32 RGBA pixels
  const rawScanlines = [];
  for (let y = 0; y < height; y++) {
    rawScanlines.push(0x00); // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Solid Indigo color: R=99, G=102, B=241, A=255
      rawScanlines.push(99, 102, 241, 255);
    }
  }
  const uncompressedData = Buffer.from(rawScanlines); // 32 * (1 + 128) = 4128 bytes

  // Build Zlib stream with uncompressed Deflate block (BTYPE=00)
  const zlibHeader = Buffer.from([0x78, 0x01]);
  
  const len = uncompressedData.length;
  const nlen = len ^ 0xffff;
  const blockHeader = Buffer.from([
    0x01, // BFINAL=1, BTYPE=00 (uncompressed)
    len & 0xff, (len >> 8) & 0xff,
    nlen & 0xff, (nlen >> 8) & 0xff
  ]);
  
  const adlerVal = adler32(uncompressedData);
  const adlerBuf = Buffer.alloc(4);
  adlerBuf.writeUInt32BE(adlerVal, 0);

  const idatPayload = Buffer.concat([zlibHeader, blockHeader, uncompressedData, adlerBuf]);

  // Construct PNG Chunks
  // 1. Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    ihdrType,
    ihdrData,
    ihdrCrc
  ]);

  // 3. IDAT Chunk
  const idatType = Buffer.from('IDAT');
  const idatLengthBuf = Buffer.alloc(4);
  idatLengthBuf.writeUInt32BE(idatPayload.length, 0);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, idatPayload])), 0);
  const idatChunk = Buffer.concat([
    idatLengthBuf,
    idatType,
    idatPayload,
    idatCrc
  ]);

  // 4. IEND Chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    iendType,
    iendCrc
  ]);

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = create32x32ValidPng();

// Build valid Windows ICO embedding the PNG
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type 1 = ICO
  0x01, 0x00, // Count = 1
  0x20,       // Width = 32
  0x20,       // Height = 32
  0x00,       // Color count = 0
  0x00,       // Reserved
  0x01, 0x00, // Planes = 1
  0x20, 0x00, // BPP = 32
  pngBuffer.length & 0xff, (pngBuffer.length >> 8) & 0xff, (pngBuffer.length >> 16) & 0xff, (pngBuffer.length >> 24) & 0xff,
  0x16, 0x00, 0x00, 0x00 // Offset = 22
]);

const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);

const iconsDir = __dirname;
fs.writeFileSync(path.join(iconsDir, '32x32.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

console.log('Successfully generated 100% valid uncompressed PNG & ICO binaries with CRC32 & Adler32 checks!');
