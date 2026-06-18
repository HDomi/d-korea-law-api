/**
 * Helper to clean HTML tags and collapse whitespace in raw API texts.
 * Helps prevent waste of tokens from empty tags, non-breaking spaces, and duplicate whitespace.
 * @param {string} rawText
 * @returns {string}
 */
export function cleanText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/<[^>]*>/g, '')         // Remove HTML tags
    .replace(/&nbsp;/g, ' ')         // Replace HTML non-breaking space entity
    .replace(/\s+/g, ' ')            // Collapse consecutive whitespace and newlines
    .trim();
}

/**
 * Filters and trims raw search data to extract only key information and limit array lengths
 * to avoid excessive prompt token consumption in Gemini 2.0 Flash.
 * @param {object} rawLawData
 * @returns {object} Optimized data structure
 */
export function reduceTokenPayload(rawLawData) {
  if (!rawLawData) {
    return { laws: [], precedents: [], others: [] };
  }

  // 1. Target laws/articles: slice to top 3, clean up text, and limit text length to 600 chars
  const optimizedLaws = (rawLawData.laws || [])
    .slice(0, 3)
    .map(law => ({
      title: law.title,
      articleNumber: law.articleNumber,
      articleTitle: law.articleTitle,
      content: cleanText(law.content || '').substring(0, 600)
    }));

  // 2. Precedents: slice to top 2, keep metadata, clean summary/content if any
  const optimizedPrecedents = (rawLawData.precedents || [])
    .slice(0, 2)
    .map(prec => ({
      caseName: prec.caseName,
      caseNumber: prec.caseNumber,
      court: prec.court,
      judgmentType: prec.judgmentType,
      judgmentDate: prec.judgmentDate,
      summary: cleanText(prec.summary || prec.content || '').substring(0, 600)
    }));

  // 3. Other rules/interpretations/appeals: slice to top 1, keep key metadata and clean content
  const optimizedOthers = (rawLawData.others || [])
    .slice(0, 1)
    .map(other => ({
      title: other.title || other.caseName,
      caseNumber: other.caseNumber,
      targetType: other.targetType,
      content: cleanText(other.content || '').substring(0, 400)
    }));

  return {
    laws: optimizedLaws,
    precedents: optimizedPrecedents,
    others: optimizedOthers
  };
}
