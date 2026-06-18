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
