export function toCsv(data: string[][]): string {
  //用双引号包裹每个值，值中的每个双引号用两个双引号代替
  return data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n');
}

export function downloadBlob(blob: Blob, download: string) {
  const blobUrl = URL.createObjectURL(blob);
  const eleA = document.createElement('a');
  eleA.href = blobUrl;
  eleA.download = download;
  eleA.style.display = 'hidden';
  document.body.appendChild(eleA);
  eleA.click();
  eleA.remove();
}
