import {
  searchLaw,
  searchPrecedent,
  searchArticles,
  searchConstitutional,
  searchInterpretation,
  searchAppeals,
  searchAdministrativeRules
} from '../services/lawApiService.js';

/**
 * Heuristic keyword extractor when AI (Gemini) is not yet active
 */
const extractHeuristicKeyword = (userMessage, category) => {
  const message = userMessage || '';
  
  if (category === 'housing' || message.includes('보증금') || message.includes('집주인') || message.includes('전세') || message.includes('월세') || message.includes('임대')) {
    return '주택임대차';
  }
  
  if (category === 'labor' || message.includes('임금') || message.includes('월급') || message.includes('퇴직금') || message.includes('해고') || message.includes('수당')) {
    return '근로기준법';
  }
  
  if (category === 'scam' || message.includes('사기') || message.includes('먹튀') || message.includes('돈떼') || message.includes('번개장터')) {
    return '형법';
  }

  // Fallback: extract the first two non-empty words
  const words = message.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 0) {
    return words.slice(0, 2).join(' ');
  }

  return '민법';
};

/**
 * Controller to search laws and precedents based on keywords
 */
export async function generateLawGuide(req, res, next) {
  try {
    const { userMessage, category, keyword, ...extraParams } = req.body;

    // Determine the keyword to query
    let queryKeyword = keyword;
    if (!queryKeyword) {
      if (!userMessage && !category) {
        return res.status(400).json({
          success: false,
          error: 'At least one of "keyword", "userMessage", or "category" must be provided.'
        });
      }
      queryKeyword = extractHeuristicKeyword(userMessage, category);
    }

    console.log(`[LawController] Querying law data with keyword: "${queryKeyword}" (Category: ${category || 'none'}) and extra parameters:`, extraParams);

    // Perform parallel searches for laws and precedents
    const [lawsResult, precedentsResult] = await Promise.allSettled([
      searchLaw(queryKeyword, extraParams),
      searchPrecedent(queryKeyword, extraParams)
    ]);

    const laws = lawsResult.status === 'fulfilled' ? lawsResult.value : { target: 'law', totalCount: 0, items: [], error: lawsResult.reason?.message };
    const precedents = precedentsResult.status === 'fulfilled' ? precedentsResult.value : { target: 'prec', totalCount: 0, items: [], error: precedentsResult.reason?.message };

    return res.status(200).json({
      success: true,
      keyword: queryKeyword,
      category: category || null,
      data: {
        laws,
        precedents
      },
      message: 'Successfully retrieved law and precedent information.'
    });
  } catch (error) {
    console.error('Error in generateLawGuide controller:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while retrieving law data.',
      details: error.message
    });
  }
}

/**
 * Unified search controller to search articles (몇항 몇조 등), precedents, and other materials
 */
export async function searchAllLawInfo(req, res, next) {
  try {
    const query = req.body.query || req.query.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "query" is required.'
      });
    }

    console.log(`[LawController] Performing unified search for keyword: "${query}"`);

    // Perform parallel searches for all targets
    const [
      articlesResult,
      precedentsResult,
      constitutionalResult,
      interpretationResult,
      appealsResult,
      adminRulesResult
    ] = await Promise.allSettled([
      searchArticles(query),
      searchPrecedent(query),
      searchConstitutional(query),
      searchInterpretation(query),
      searchAppeals(query),
      searchAdministrativeRules(query)
    ]);

    const laws = articlesResult.status === 'fulfilled' ? articlesResult.value.items : [];
    const precedents = precedentsResult.status === 'fulfilled' ? precedentsResult.value.items : [];

    // Combine other targets into a single "others" array
    const others = [];
    if (constitutionalResult.status === 'fulfilled') {
      others.push(...constitutionalResult.value.items.map(item => ({ ...item, targetType: '헌재결정례' })));
    }
    if (interpretationResult.status === 'fulfilled') {
      others.push(...interpretationResult.value.items.map(item => ({ ...item, targetType: '법령해석례' })));
    }
    if (appealsResult.status === 'fulfilled') {
      others.push(...appealsResult.value.items.map(item => ({ ...item, targetType: '행정심판례' })));
    }
    if (adminRulesResult.status === 'fulfilled') {
      others.push(...adminRulesResult.value.items.map(item => ({ ...item, targetType: '행정규칙' })));
    }

    return res.status(200).json({
      success: true,
      keyword: query,
      data: {
        laws,
        precedents,
        others
      },
      message: 'Successfully retrieved law, precedent, and other related information.'
    });
  } catch (error) {
    console.error('Error in searchAllLawInfo controller:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while retrieving law data.',
      details: error.message
    });
  }
}
