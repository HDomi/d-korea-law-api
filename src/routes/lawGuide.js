import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import {
  searchArticles,
  searchPrecedent,
  searchConstitutional,
  searchInterpretation,
  searchAppeals,
  searchAdministrativeRules,
} from "../services/lawApiService.js";
import { reduceTokenPayload } from "../utils/tokenDieter.js";

const router = Router();

// Environment variables configuration and Gemini SDK initialization
const aiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const ai = aiKey ? new GoogleGenAI({ apiKey: aiKey }) : null;

/**
 * Step 1: Extract law search keywords from user's natural language message
 */
async function extractLegalKeyword(userMessage, category) {
  if (!ai) {
    return category === "housing"
      ? "주택임대차"
      : category === "labor"
        ? "임금체불"
        : "사기";
  }

  const prompt = `
    당신은 사용자의 일상적인 억울한 사연을 듣고, 국가법령정보센터에서 관련 법 조문이나 판례를 검색할 수 있도록 가장 정확한 '법률 핵심 키워드' 하나를 추출하는 전문가입니다.
    
    [사용자 카테고리]: ${category}
    [사용자 사연]: "${userMessage}"
    
    위 사연을 기반으로 법령 검색창에 쳤을 때 관련 주택임대차보호법, 근로기준법, 형법 등이 가장 잘 검색될 만한 단성/단일 명사 형태의 법률 키워드 딱 1개만 추출하세요.
    예시: "집주인이 돈 안 줌" -> "주택임대차", "월급 밀림" -> "임금체불", "중고 사기꾼" -> "사기"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyword: {
              type: Type.STRING,
              description: "추출된 단일 법률 검색어",
            },
          },
          required: ["keyword"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result.keyword || "법률";
  } catch (error) {
    console.error(
      "Gemini keyword extraction error, fallback to category mapping:",
      error.message,
    );
    return category === "housing"
      ? "주택임대차"
      : category === "labor"
        ? "임금체불"
        : "사기";
  }
}

/**
 * Step 2: Fetch search data internally (mimicking the /api/search response structure)
 */
async function fetchLocalLawData(query) {
  if (!query) {
    return { laws: [], precedents: [], others: [] };
  }

  // Parallel searches for all targets using Promise.allSettled
  const [
    articlesResult,
    precedentsResult,
    constitutionalResult,
    interpretationResult,
    appealsResult,
    adminRulesResult,
  ] = await Promise.allSettled([
    searchArticles(query),
    searchPrecedent(query),
    searchConstitutional(query),
    searchInterpretation(query),
    searchAppeals(query),
    searchAdministrativeRules(query),
  ]);

  const laws =
    articlesResult.status === "fulfilled"
      ? articlesResult.value.items || []
      : [];
  const precedents =
    precedentsResult.status === "fulfilled"
      ? precedentsResult.value.items || []
      : [];

  const others = [];
  if (
    constitutionalResult.status === "fulfilled" &&
    constitutionalResult.value?.items
  ) {
    others.push(
      ...constitutionalResult.value.items.map((item) => ({
        ...item,
        targetType: "헌재결정례",
      })),
    );
  }
  if (
    interpretationResult.status === "fulfilled" &&
    interpretationResult.value?.items
  ) {
    others.push(
      ...interpretationResult.value.items.map((item) => ({
        ...item,
        targetType: "법령해석례",
      })),
    );
  }
  if (appealsResult.status === "fulfilled" && appealsResult.value?.items) {
    others.push(
      ...appealsResult.value.items.map((item) => ({
        ...item,
        targetType: "행정심판례",
      })),
    );
  }
  if (
    adminRulesResult.status === "fulfilled" &&
    adminRulesResult.value?.items
  ) {
    others.push(
      ...adminRulesResult.value.items.map((item) => ({
        ...item,
        targetType: "행정규칙",
      })),
    );
  }

  return { laws, precedents, others };
}

/**
 * Step 3: Synthesize personalized guide and documents based on retrieved legal raw data
 */
async function generateLegalGuide(userMessage, category, lawData) {
  if (!ai) {
    return "AI API 키가 설정되지 않아 가이드를 생성할 수 없습니다. (Mock 모드)";
  }

  const prompt = `
    당신은 법률 전문가 조력자이자, 2030 사회초년생을 위한 '나홀로 소송 및 법적 대응 지침서' 작성기입니다.
    사용자의 사연과 국가법령 API를 통해 실시간으로 조회된 실제 대한민국 법률/판례 데이터를 바탕으로 맞춤형 가이드를 작성하세요.

    [사용자 사연]: "${userMessage}"
    [조회된 실제 법률 데이터]: ${JSON.stringify(lawData)}

    ---
    [작성 규칙]
    1. 톤앤매너: 법을 전혀 모르는 20대 청년도 쉽게 이해하고 용기를 낼 수 있도록 따뜻하고 친절한 구어체(~요, ~습니다)를 사용하세요.
    2. 형식: 마크다운(Markdown) 포맷을 사용하여 가독성 있게 작성하세요.
    3. 필수 포함 섹션:
       - ## 🔍 1. 내 상황 팩트 체크 및 위로: 유저가 어떤 상황이고 어떤 법적 권리(예: 대항력, 임금 청구권 등)를 가지는지 조회된 법령에 근거해 쉽게 설명.
       - ## 📋 2. 지금 당장 해야 할 액션 플랜: 유저가 혼자서 발로 뛰며 해야 할 행동 지침을 단계별 체크박스(- [ ] 형태)로 나열 (예: 동사무소 방문, 고용노동부 사이트 접속 등).
       - ## ✍️ 3. 나홀로 대응 서류 자동 완성: 사용자가 그대로 드래그해서 복사할 수 있는 완벽한 서식 텍스트(예: 내용증명, 고소장, 진정서 중 상황에 맞는 것 하나)를 완성해 줄 것. 유저가 직접 채워 넣어야 하는 가변 정보는 반드시 '[ ]' 기호로 감싸서 표기할 것 (예: 수신인: [임대인 이름 입력], 금액: [지급받지 못한 금액 입력]).
       - ## ⚠️ 주의사항: 하단에 "본 가이드는 AI가 법령 데이터를 기반으로 요약한 참고 자료일 뿐 법적 효력을 가지지 않으며, 실제 소송 시에는 법률 전문가의 자문을 권장합니다."라는 문구를 반드시 명시하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini guide generation error:", error.message);
    throw error;
  }
}

/**
 * Main Orchestrator Endpoint
 * POST /api/law-guide
 */
router.post("/law-guide", async (req, res) => {
  try {
    const { userMessage, category } = req.body;

    if (!userMessage || !category) {
      return res.status(400).json({
        success: false,
        error:
          "userMessage와 category('housing' | 'labor' | 'scam')는 필수 입력 사항입니다.",
      });
    }

    // [Step 1] Extract search keyword from natural language input
    const extractedKeyword = await extractLegalKeyword(userMessage, category);

    // [Step 2] Fetch matching law/precedent/others data from local services
    let lawSearchResult;
    try {
      lawSearchResult = await fetchLocalLawData(extractedKeyword);
    } catch (searchError) {
      console.error(
        "국가법령 검색 로컬 서비스 호출 실패, Fallback 작동:",
        searchError.message,
      );
      lawSearchResult = { laws: [], precedents: [], others: [] };
    }

    // [Step 3] Synthesize guide and documents markdown using Gemini API
    const slimLawData = reduceTokenPayload(lawSearchResult);
    const finalGuideMarkdown = await generateLegalGuide(
      userMessage,
      category,
      slimLawData,
    );

    // [Step 4] Respond back with the generated guide and original data source
    return res.json({
      success: true,
      category,
      searchKeyword: extractedKeyword,
      guide: finalGuideMarkdown,
      rawLawData: lawSearchResult,
    });
  } catch (error) {
    console.error("최종 가이드 생성 중 서버 에러 발생:", error);

    let statusCode = 500;
    let errorType = "InternalServerError";
    let errorMessage = error.message || "An unexpected error occurred.";
    let errorDetails = null;

    if (error.status) {
      statusCode = error.status;
      if (statusCode === 429) {
        errorType = "GeminiQuotaExceeded";
        errorMessage =
          "Gemini API quota exceeded or rate limited. Please try again later.";
      } else if (statusCode === 503) {
        errorType = "GeminiServiceUnavailable";
        errorMessage =
          "Gemini API is currently experiencing high demand or is temporarily unavailable.";
      } else if (statusCode === 404) {
        errorType = "GeminiModelNotFound";
        errorMessage =
          "The requested Gemini model was not found in the current environment.";
      } else {
        errorType = `GeminiApiError(${statusCode})`;
      }

      if (error.error) {
        errorDetails =
          typeof error.error === "string"
            ? error.error
            : JSON.stringify(error.error);
      }
    } else if (error.message && error.message.includes("API key")) {
      statusCode = 401;
      errorType = "UnauthorizedApiKey";
      errorMessage = "Gemini API key is invalid or not configured correctly.";
    }

    return res.status(statusCode).json({
      success: false,
      error: errorType,
      message: errorMessage,
      details: errorDetails || error.stack || null,
    });
  }
});

// GET /api/law-guide for simple endpoint testing or verification
router.get("/law-guide", (req, res) => {
  res.status(200).json({
    message:
      'To generate a law guide, please send a POST request with a JSON body containing "userMessage" and "category".',
  });
});

export default router;
