import axios from 'axios';
import { config } from '../config/env.js';
import { parseLawSearchXml, parsePrecSearchXml } from '../utils/xmlParser.js';

const LAW_SEARCH_URL = 'http://www.law.go.kr/DRF/lawSearch.do';
const PREC_SEARCH_URL = 'http://www.law.go.kr/DRF/precSearch.do';

/**
 * Returns mock data when OC is missing or API call fails.
 */
const getMockData = (target, query) => {
  console.log(`[MOCK SERVICE] Fetching mock data for target: ${target}, query: "${query}"`);
  
  if (target === 'law') {
    if (query.includes('주택') || query.includes('임대') || query.includes('보증')) {
      return {
        target: 'law',
        totalCount: 2,
        items: [
          {
            lawId: '002341',
            title: '주택임대차보호법',
            abbr: '주택임대차법',
            type: '법률',
            promulgationDate: '20200731',
            promulgationNumber: '17471',
            department: '법무부',
            link: 'https://www.law.go.kr/법령/주택임대차보호법'
          },
          {
            lawId: '002342',
            title: '주택임대차보호법 시행령',
            abbr: '주택임대차법 시행령',
            type: '대통령령',
            promulgationDate: '20231101',
            promulgationNumber: '33890',
            department: '법무부',
            link: 'https://www.law.go.kr/법령/주택임대차보호법시행령'
          }
        ]
      };
    } else if (query.includes('근로') || query.includes('임금') || query.includes('퇴직')) {
      return {
        target: 'law',
        totalCount: 2,
        items: [
          {
            lawId: '001123',
            title: '근로기준법',
            abbr: '근로기준법',
            type: '법률',
            promulgationDate: '20210105',
            promulgationNumber: '17822',
            department: '고용노동부',
            link: 'https://www.law.go.kr/법령/근로기준법'
          },
          {
            lawId: '001124',
            title: '근로자퇴직급여 보장법',
            abbr: '퇴직급여법',
            type: '법률',
            promulgationDate: '20220414',
            promulgationNumber: '18833',
            department: '고용노동부',
            link: 'https://www.law.go.kr/법령/근로자퇴직급여보장법'
          }
        ]
      };
    } else {
      // Default / Scam
      return {
        target: 'law',
        totalCount: 1,
        items: [
          {
            lawId: '000001',
            title: '형법',
            abbr: '형법',
            type: '법률',
            promulgationDate: '20231020',
            promulgationNumber: '19702',
            department: '법무부',
            link: 'https://www.law.go.kr/법령/형법'
          }
        ]
      };
    }
  } else {
    // Precedents (prec)
    if (query.includes('주택') || query.includes('임대') || query.includes('보증')) {
      return {
        target: 'prec',
        totalCount: 2,
        items: [
          {
            precId: '210450',
            caseName: '임대차보증금반환',
            caseNumber: '2019다280375',
            judgmentDate: '20200514',
            court: '대법원',
            caseType: '민사',
            judgmentType: '판결',
            link: 'https://www.law.go.kr/판례/임대차보증금반환-(2019다280375)'
          },
          {
            precId: '210451',
            caseName: '건물명도',
            caseNumber: '2020다290112',
            judgmentDate: '20210311',
            court: '대법원',
            caseType: '민사',
            judgmentType: '판결',
            link: 'https://www.law.go.kr/판례/건물명도-(2020다290112)'
          }
        ]
      };
    } else if (query.includes('근로') || query.includes('임금') || query.includes('퇴직')) {
      return {
        target: 'prec',
        totalCount: 1,
        items: [
          {
            precId: '199823',
            caseName: '임금',
            caseNumber: '2018다234123',
            judgmentDate: '20191024',
            court: '대법원',
            caseType: '민사',
            judgmentType: '판결',
            link: 'https://www.law.go.kr/판례/임금-(2018다234123)'
          }
        ]
      };
    } else {
      return {
        target: 'prec',
        totalCount: 1,
        items: [
          {
            precId: '190231',
            caseName: '사기',
            caseNumber: '2017도12345',
            judgmentDate: '20180125',
            court: '대법원',
            caseType: '형사',
            judgmentType: '판결',
            link: 'https://www.law.go.kr/판례/사기-(2017도12345)'
          }
        ]
      };
    }
  }
};

/**
 * Searches for laws in National Law Information Center API
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchLaw(query) {
  if (!query) {
    throw new Error('Query parameter is required for law search');
  }

  if (!config.lawApiOc) {
    return getMockData('law', query);
  }

  try {
    const response = await axios.get(LAW_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'law',
        type: 'XML',
        query: query
      },
      timeout: 5000 // 5 seconds timeout
    });

    return await parseLawSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Law API. Falling back to Mock data.', error.message);
    return getMockData('law', query);
  }
}

/**
 * Searches for precedents in National Law Information Center API
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchPrecedent(query) {
  if (!query) {
    throw new Error('Query parameter is required for precedent search');
  }

  if (!config.lawApiOc) {
    return getMockData('prec', query);
  }

  try {
    const response = await axios.get(PREC_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'prec',
        type: 'XML',
        query: query
      },
      timeout: 5000
    });

    return await parsePrecSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Precedent API. Falling back to Mock data.', error.message);
    return getMockData('prec', query);
  }
}
