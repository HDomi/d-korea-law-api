import { parseStringPromise } from 'xml2js';

/**
 * Helper to safely extract single string value from xml2js array format
 */
const getSingleValue = (arr) => {
  if (Array.isArray(arr) && arr.length > 0) {
    return arr[0];
  }
  return '';
};

/**
 * Parses Law Search XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parseLawSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.LawSearch;
    
    if (!root) {
      throw new Error('Invalid law XML structure');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawLaws = root.law || [];

    const laws = rawLaws.map(item => {
      const relativeLink = getSingleValue(item.법령상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        lawId: getSingleValue(item.법령일련번호),
        title: getSingleValue(item.법령명한글),
        abbr: getSingleValue(item.법령약칭명),
        type: getSingleValue(item.법령구분명),
        promulgationDate: getSingleValue(item.공포일자),
        promulgationNumber: getSingleValue(item.공포번호),
        department: getSingleValue(item.소관부처명),
        link: link
      };
    });

    return {
      target: 'law',
      totalCount: totalCnt,
      items: laws
    };
  } catch (error) {
    console.error('Failed to parse law XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses Precedent Search XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parsePrecSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.PrecSearch;

    if (!root) {
      throw new Error('Invalid precedent XML structure');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawPrecs = root.prec || [];

    const precedents = rawPrecs.map(item => {
      const relativeLink = getSingleValue(item.판례상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        precId: getSingleValue(item.판례일련번호),
        caseName: getSingleValue(item.사건명),
        caseNumber: getSingleValue(item.사건번호),
        judgmentDate: getSingleValue(item.선고일자),
        court: getSingleValue(item.법원명),
        caseType: getSingleValue(item.사건종류명),
        judgmentType: getSingleValue(item.판결유형),
        link: link
      };
    });

    return {
      target: 'prec',
      totalCount: totalCnt,
      items: precedents
    };
  } catch (error) {
    console.error('Failed to parse precedent XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses Articles (AiSearch) XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parseArticlesSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.AiSearch;
    if (!root) {
      throw new Error('Invalid articles XML structure (AiSearch)');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawItems = root.ai || [];

    const articles = rawItems.map(item => {
      const relativeLink = getSingleValue(item.조문상세링크) || getSingleValue(item.법령상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        lawId: getSingleValue(item.법령일련번호),
        title: getSingleValue(item.법령명한글),
        articleNumber: getSingleValue(item.조문번호),
        paragraphNumber: getSingleValue(item.항번호),
        articleTitle: getSingleValue(item.조문제목),
        content: getSingleValue(item.조문내용),
        link: link
      };
    });

    return {
      target: 'aiSearch',
      totalCount: totalCnt,
      items: articles
    };
  } catch (error) {
    console.error('Failed to parse articles XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses Constitutional Court Cases (DetcSearch) XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parseDetcSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.DetcSearch;
    if (!root) {
      throw new Error('Invalid constitutional case XML structure (DetcSearch)');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawItems = root.detc || [];

    const items = rawItems.map(item => {
      const relativeLink = getSingleValue(item.결정례상세링크) || getSingleValue(item.판례상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        id: getSingleValue(item.결정례일련번호),
        caseName: getSingleValue(item.사건명),
        caseNumber: getSingleValue(item.사건번호),
        judgmentDate: getSingleValue(item.선고일자),
        court: getSingleValue(item.종국결정외명) || '헌법재판소',
        caseType: getSingleValue(item.사건종류명),
        judgmentType: getSingleValue(item.결정유형명) || getSingleValue(item.판결유형),
        link: link
      };
    });

    return {
      target: 'detc',
      totalCount: totalCnt,
      items: items
    };
  } catch (error) {
    console.error('Failed to parse constitutional case XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses Statute Interpretation Cases (ExpcSearch) XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parseExpcSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.ExpcSearch;
    if (!root) {
      throw new Error('Invalid interpretation case XML structure (ExpcSearch)');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawItems = root.expc || [];

    const items = rawItems.map(item => {
      const relativeLink = getSingleValue(item.해석례상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        id: getSingleValue(item.해석례일련번호),
        title: getSingleValue(item.안건명),
        caseNumber: getSingleValue(item.해석례번호) || getSingleValue(item.안건번호),
        judgmentDate: getSingleValue(item.회신일자),
        court: getSingleValue(item.해석기관명) || '법제처',
        link: link
      };
    });

    return {
      target: 'expc',
      totalCount: totalCnt,
      items: items
    };
  } catch (error) {
    console.error('Failed to parse interpretation XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses Administrative Appeal Cases (DeccSearch) XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parseDeccSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.DeccSearch;
    if (!root) {
      throw new Error('Invalid administrative appeal XML structure (DeccSearch)');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawItems = root.decc || [];

    const items = rawItems.map(item => {
      const relativeLink = getSingleValue(item.재결례상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        id: getSingleValue(item.재결례일련번호),
        caseName: getSingleValue(item.사건명),
        caseNumber: getSingleValue(item.재결번호) || getSingleValue(item.사건번호),
        judgmentDate: getSingleValue(item.재결일자),
        court: getSingleValue(item.재결기관명) || '중앙행정심판위원회',
        link: link
      };
    });

    return {
      target: 'decc',
      totalCount: totalCnt,
      items: items
    };
  } catch (error) {
    console.error('Failed to parse administrative appeal XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses Administrative Rules (AdmrulSearch) XML response into structured JSON
 * @param {string} xmlString 
 * @returns {Promise<object>}
 */
export async function parseAdmrulSearchXml(xmlString) {
  try {
    const rawJson = await parseStringPromise(xmlString);
    const root = rawJson.AdmrulSearch;
    if (!root) {
      throw new Error('Invalid administrative rule XML structure (AdmrulSearch)');
    }

    const totalCnt = parseInt(getSingleValue(root.totalCnt) || '0', 10);
    const rawItems = root.admrul || [];

    const items = rawItems.map(item => {
      const relativeLink = getSingleValue(item.행정규칙상세링크);
      const link = relativeLink ? `https://www.law.go.kr${relativeLink}` : '';

      return {
        id: getSingleValue(item.행정규칙일련번호),
        title: getSingleValue(item.행정규칙명),
        type: getSingleValue(item.행정규칙구분명),
        promulgationDate: getSingleValue(item.발령일자),
        promulgationNumber: getSingleValue(item.발령번호),
        department: getSingleValue(item.소관부처명),
        link: link
      };
    });

    return {
      target: 'admrul',
      totalCount: totalCnt,
      items: items
    };
  } catch (error) {
    console.error('Failed to parse administrative rules XML:', error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

