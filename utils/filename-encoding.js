const MOJIBAKE_MARKERS = /[ÃÂâØÙÛÐÑ]/;
const REPLACEMENT_CHAR = '\uFFFD';

function markerScore(value) {
  const matches = String(value).match(/[ÃÂâØÙÛÐÑ�]/g);
  if (!matches) return 0;
  return matches.reduce((score, char) => score + (char === REPLACEMENT_CHAR ? 5 : 1), 0);
}

function normalizeUploadedFilename(name) {
  if (typeof name !== 'string') return name;

  const trimmed = name.trim();
  if (!trimmed) return '';

  const normalized = trimmed.normalize('NFC');
  if (!MOJIBAKE_MARKERS.test(normalized)) return normalized;

  const decoded = Buffer.from(normalized, 'latin1').toString('utf8');
  if (!decoded || decoded.includes(REPLACEMENT_CHAR)) return normalized;

  const decodedNormalized = decoded.normalize('NFC');
  return markerScore(decodedNormalized) < markerScore(normalized)
    ? decodedNormalized
    : normalized;
}

function sanitizeUploadedFilename(name, fallback = 'file') {
  const clean = String(normalizeUploadedFilename(name || fallback))
    .replace(/[\x00-\x1f]/g, '')
    .replace(/[/\\]/g, '_')
    .replace(/\.\./g, '_')
    .trim();

  return clean || fallback;
}

function normalizeStoredFilePath(filename) {
  if (typeof filename !== 'string') return filename;
  const parts = filename.split('/');
  if (parts.length === 0) return filename;
  parts[parts.length - 1] = sanitizeUploadedFilename(parts[parts.length - 1]);
  return parts.join('/');
}

module.exports = {
  normalizeUploadedFilename,
  sanitizeUploadedFilename,
  normalizeStoredFilePath,
};
