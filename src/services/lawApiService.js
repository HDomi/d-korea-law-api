import axios from 'axios';
import { config } from '../config/env.js';
import {
  parseLawSearchXml,
  parsePrecSearchXml,
  parseArticlesSearchXml,
  parseDetcSearchXml,
  parseExpcSearchXml,
  parseDeccSearchXml,
  parseAdmrulSearchXml
} from '../utils/xmlParser.js';

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
  } else if (target === 'aiSearch') {
    if (query.includes('주택') || query.includes('임대') || query.includes('보증')) {
      return {
        target: 'aiSearch',
        totalCount: 2,
        items: [
          {
            lawId: '002341',
            title: '주택임대차보호법',
            articleNumber: '3',
            paragraphNumber: '2',
            articleTitle: '보증금의 회수',
            content: '임차인은 임차주택에 대하여 보증금 반환청구소송의 확정판결이나 그 밖에 이에 준하는 집행권원에 기한 경매를 신청하는 경우에는 반대의무의 이행이나 이행의 제공을 집행개시의 요건으로 하지 아니한다.',
            link: 'https://www.law.go.kr/법령/주택임대차보호법/제3조의2'
          },
          {
            lawId: '002341',
            title: '주택임대차보호법',
            articleNumber: '4',
            paragraphNumber: '1',
            articleTitle: '임대차기간 등',
            content: '기간을 정하지 아니하거나 2년 미만으로 정한 임대차는 그 기간을 2년으로 본다. 다만, 임차인은 2년 미만으로 정한 기간이 유효함을 주장할 수 있다.',
            link: 'https://www.law.go.kr/법령/주택임대차보호법/제4조'
          }
        ]
      };
    } else if (query.includes('근로') || query.includes('임금') || query.includes('퇴직')) {
      return {
        target: 'aiSearch',
        totalCount: 2,
        items: [
          {
            lawId: '001123',
            title: '근로기준법',
            articleNumber: '36',
            paragraphNumber: '',
            articleTitle: '금품 청산',
            content: '사용자는 근로자가 사망하거나 퇴직한 경우에는 그 지급 사유가 발생한 날부터 14일 이내에 임금, 보상금, 그 밖의 모든 금품을 지급하여야 한다. 다만, 특별한 사정이 있을 경우에는 당사자 사이의 합의에 의하여 기일을 연장할 수 있다.',
            link: 'https://www.law.go.kr/법령/근로기준법/제36조'
          },
          {
            lawId: '001124',
            title: '근로자퇴직급여 보장법',
            articleNumber: '8',
            paragraphNumber: '1',
            articleTitle: '퇴직금제도의 설정',
            content: '퇴직금제도를 설정하려는 사용자는 계속근로기간 1년에 대하여 30일분 이상의 평균임금을 퇴직금으로 퇴직 근로자에게 지급할 수 있는 제도를 설정하여야 한다.',
            link: 'https://www.law.go.kr/법령/근로자퇴직급여보장법/제8조'
          }
        ]
      };
    } else {
      return {
        target: 'aiSearch',
        totalCount: 1,
        items: [
          {
            lawId: '000001',
            title: '형법',
            articleNumber: '347',
            paragraphNumber: '1',
            articleTitle: '사기',
            content: '사람을 기망하여 재물의 교부를 받거나 재산상의 이익을 취득한 자는 10년 이하의 징역 또는 2천만원 이하의 벌금에 처한다.',
            link: 'https://www.law.go.kr/법령/형법/제347조'
          }
        ]
      };
    }
  } else if (target === 'prec') {
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
  } else if (target === 'detc') {
    // Constitutional Cases (detc)
    return {
      target: 'detc',
      totalCount: 1,
      items: [
        {
          id: '150432',
          caseName: '주택임대차보호법 제3조 위헌소송',
          caseNumber: '2020헌바123',
          judgmentDate: '20210527',
          court: '헌법재판소',
          caseType: '헌바',
          judgmentType: '합헌결정',
          link: 'https://www.law.go.kr/결정례/주택임대차보호법제3조위헌소송-(2020헌바123)'
        }
      ]
    };
  } else if (target === 'expc') {
    // Statute Interpretations (expc)
    return {
      target: 'expc',
      totalCount: 1,
      items: [
        {
          id: '201243',
          title: '주택임대차보호법 제3조 보증금 회수 요건 해석',
          caseNumber: '20-0045',
          judgmentDate: '20200311',
          court: '법제처',
          link: 'https://www.law.go.kr/해석례/안건명-20-0045'
        }
      ]
    };
  } else if (target === 'decc') {
    // Administrative Appeals (decc)
    return {
      target: 'decc',
      totalCount: 1,
      items: [
        {
          id: '180234',
          caseName: '임금체불 구제명령 처분 취소 청구',
          caseNumber: '2021-04321',
          judgmentDate: '20210615',
          court: '중앙행정심판위원회',
          link: 'https://www.law.go.kr/재결례/임금체불처분취소-(2021-04321)'
        }
      ]
    };
  } else if (target === 'admrul') {
    // Administrative Rules (admrul)
    return {
      target: 'admrul',
      totalCount: 1,
      items: [
        {
          id: '012345',
          title: '주택임대차 분쟁조정위원회 운영 규정',
          type: '훈령',
          promulgationDate: '20200815',
          promulgationNumber: '450',
          department: '법무부',
          link: 'https://www.law.go.kr/행정규칙/주택임대차분쟁조정위원회운영규정'
        }
      ]
    };
  }
  return { target, totalCount: 0, items: [] };
};

/**
 * Searches for laws in National Law Information Center API
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchLaw(query, extraParams = {}) {
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
        query: query,
        ...extraParams
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
export async function searchPrecedent(query, extraParams = {}) {
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
        query: query,
        ...extraParams
      },
      timeout: 5000
    });

    return await parsePrecSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Precedent API. Falling back to Mock data.', error.message);
    return getMockData('prec', query);
  }
}

/**
 * Searches for specific law articles (조문) using aiSearch
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchArticles(query, extraParams = {}) {
  if (!query) {
    throw new Error('Query parameter is required for articles search');
  }

  if (!config.lawApiOc) {
    return getMockData('aiSearch', query);
  }

  try {
    const response = await axios.get(LAW_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'aiSearch',
        search: '0', // 0 for law articles (법령조문)
        type: 'XML',
        query: query,
        ...extraParams
      },
      timeout: 5000
    });

    return await parseArticlesSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Articles API (aiSearch). Falling back to Mock data.', error.message);
    return getMockData('aiSearch', query);
  }
}

/**
 * Searches for Constitutional Court cases (헌재결정례)
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchConstitutional(query, extraParams = {}) {
  if (!query) {
    throw new Error('Query parameter is required for constitutional cases search');
  }

  if (!config.lawApiOc) {
    return getMockData('detc', query);
  }

  try {
    const response = await axios.get(LAW_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'detc',
        type: 'XML',
        query: query,
        ...extraParams
      },
      timeout: 5000
    });

    return await parseDetcSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Constitutional cases API (detc). Falling back to Mock data.', error.message);
    return getMockData('detc', query);
  }
}

/**
 * Searches for Statute Interpretations (법령해석례)
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchInterpretation(query, extraParams = {}) {
  if (!query) {
    throw new Error('Query parameter is required for statute interpretations search');
  }

  if (!config.lawApiOc) {
    return getMockData('expc', query);
  }

  try {
    const response = await axios.get(LAW_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'expc',
        type: 'XML',
        query: query,
        ...extraParams
      },
      timeout: 5000
    });

    return await parseExpcSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Statute Interpretations API (expc). Falling back to Mock data.', error.message);
    return getMockData('expc', query);
  }
}

/**
 * Searches for Administrative Appeals (행정심판례)
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchAppeals(query, extraParams = {}) {
  if (!query) {
    throw new Error('Query parameter is required for administrative appeals search');
  }

  if (!config.lawApiOc) {
    return getMockData('decc', query);
  }

  try {
    const response = await axios.get(LAW_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'decc',
        type: 'XML',
        query: query,
        ...extraParams
      },
      timeout: 5000
    });

    return await parseDeccSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Administrative Appeals API (decc). Falling back to Mock data.', error.message);
    return getMockData('decc', query);
  }
}

/**
 * Searches for Administrative Rules (행정규칙)
 * @param {string} query Search keyword
 * @returns {Promise<object>} Parsed results
 */
export async function searchAdministrativeRules(query, extraParams = {}) {
  if (!query) {
    throw new Error('Query parameter is required for administrative rules search');
  }

  if (!config.lawApiOc) {
    return getMockData('admrul', query);
  }

  try {
    const response = await axios.get(LAW_SEARCH_URL, {
      params: {
        OC: config.lawApiOc,
        target: 'admrul',
        type: 'XML',
        query: query,
        ...extraParams
      },
      timeout: 5000
    });

    return await parseAdmrulSearchXml(response.data);
  } catch (error) {
    console.error('Failed to call Administrative Rules API (admrul). Falling back to Mock data.', error.message);
    return getMockData('admrul', query);
  }
}

