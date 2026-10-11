const MAX_LENGTH = 3500;

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownToHtml(text) {
  const blocks = [];
  let html = escapeHtml(text).replace(/```[\w-]*\n?([\s\S]*?)```/g, (match, code) => {
    blocks.push(`<pre>${code.replace(/\n$/, '')}</pre>`);
    return `\u0000${blocks.length - 1}\u0000`;
  });
  html = html
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^#{1,6}\s+(.+)$/gm, '<b>$1</b>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<b>$1</b>')
    .replace(/(^|[^*\w])\*(\S(?:[^*\n]*\S)?)\*(?!\w)/g, '$1<i>$2</i>')
    .replace(/^(\s*)[-*]\s+/gm, '$1- ');
  return html.replace(/\u0000(\d+)\u0000/g, (match, index) => blocks[Number(index)]);
}

function splitMessage(text) {
  const parts = [];
  let rest = text.trim();
  while (rest.length > MAX_LENGTH) {
    let cut = rest.lastIndexOf('\n\n', MAX_LENGTH);
    if (cut < MAX_LENGTH / 2) cut = rest.lastIndexOf('\n', MAX_LENGTH);
    if (cut < MAX_LENGTH / 2) cut = rest.lastIndexOf(' ', MAX_LENGTH);
    if (cut <= 0) cut = MAX_LENGTH;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

module.exports = { escapeHtml, markdownToHtml, splitMessage };
