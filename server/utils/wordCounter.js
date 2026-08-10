const WORDS_PER_MINUTE = 200;

const stripMarkdown = (markdown = '') => {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
};

const getWordCount = (markdown = '') => {
  const plain = stripMarkdown(markdown);
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
};

const getReadTime = (wordCount = 0) => {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};

module.exports = { stripMarkdown, getWordCount, getReadTime };
