const key = "sb_publishable_ygsqToZp7wBMibcxW07k5w_q-QgfLva";

console.log("Length:", key.length);
try {
  const parts = key.split('_');
  console.log("Parts:", parts);
  
  parts.forEach((part, i) => {
    try {
      const decoded = Buffer.from(part, 'base64').toString('utf-8');
      console.log(`Part ${i} decoded (base64 utf8):`, decoded);
      console.log(`Part ${i} decoded (hex):`, Buffer.from(part, 'base64').toString('hex'));
    } catch (e) {
      console.log(`Part ${i} failed to decode:`, e.message);
    }
  });
} catch (error) {
  console.error(error);
}
