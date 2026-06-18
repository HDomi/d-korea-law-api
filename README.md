# 대한민국 법률 정보 검색 API (Korea Law Search API)

국가법령정보 공동활용 OPEN API를 활용하여 2030 청년들을 위한 나홀로 소송 및 법률 대응 가이드를 제공하는 Node.js Express API 서버입니다.

이 서버는 자연어 검색어 한 번으로 관련 **법령 조문(몇조 몇항 등)**, **판례**, **기타 법률 자료(헌재결정례, 법령해석례, 행정심판례, 행정규칙 등)**를 한 번에 조회하여 통합 JSON 객체로 반환해 줍니다.

---

## 주요 기능 및 아키텍처

- **ES Modules (ESM)** 기반 Node.js 및 Express 애플리케이션
- **병렬 API 호출**: `Promise.allSettled`를 이용해 여러 오픈 API 타겟을 비동기 병렬로 신속하게 검색
- **XML 파서 구현**: 공공데이터포털 XML 응답을 깨끗한 JSON 구조로 변환
- **Graceful Fallback (Mock Data)**: 로컬 개발 환경에서 API 호출 IP가 미등록되었거나 인증키(`LAW_API_OC`)가 없을 시, 사전에 구성된 현실적인 Mock 데이터를 반환하여 무중단 테스트 가능

---

## 시작하기

### 1. 패키지 설치
이 프로젝트는 패키지 매니저로 `pnpm`을 사용합니다.
```bash
pnpm install
```

### 2. 환경 변수 설정
프로젝트 루트 폴더에 `.env` 파일을 생성하거나 수정합니다.
```env
PORT=5556
LAW_API_OC="발급받은_오픈API_OC_인증키"
GOOGLE_API_KEY="발급받은_구글_제미나이_API키"
NODE_ENV=development
```
> **Note**: 로컬 IP가 국가법령정보 공동활용 시스템에 등록되어 있지 않으면 API 요청이 실패하고 자동으로 Mock 데이터 모드로 작동합니다.

### 3. 개발 서버 실행
```bash
pnpm dev
```
기본 포트는 `5556`으로 설정되어 있으며, 로컬 서버 주소는 `http://localhost:5556`이 됩니다.

---

## API 사용 방법

### 맞춤형 법률 가이드 및 서류 합성 API: `POST /api/law-guide`

사용자의 자연어 사연과 카테고리를 입력받아, 제미나이(Gemini) API를 활용해 맞춤형 대응 가이드(Markdown 형태)와 수신인/금액 등이 들어간 완벽한 자동 서식 텍스트를 함께 생성하여 제공하는 핵심 API 엔드포인트입니다.

#### 1. 요청 형식 (Requests)
- **URL**: `/api/law-guide`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "userMessage": "원룸 월세가 만기됐는데 집주인이 전화를 안 받고 보증금 300만 원을 안 줍니다.",
    "category": "housing"
  }
  ```
  - `category` 값으로 가능한 유형: `"housing"` (주택임대차), `"labor"` (임금체불), `"scam"` (사기) 등

#### 2. 응답 형식 (Response)
성공적인 요청 시 `200 OK` 상태 코드와 함께 다음과 같은 구조의 JSON 객체를 반환합니다.

```json
{
  "success": true,
  "category": "housing",
  "searchKeyword": "주택임대차",
  "guide": "## 🔍 1. 내 상황 팩트 체크 및 위로\n...\n## 📋 2. 지금 당장 해야 할 액션 플랜\n- [ ] 1단계: ...\n## ✍️ 3. 나홀로 대응 서류 자동 완성\n[내용증명 서식]\n수신인: [임대인 이름 입력]\n...\n## ⚠️ 주의사항\n본 가이드는 AI가 법령 데이터를 기반으로 요약한 참고 자료일 뿐...",
  "rawLawData": {
    "laws": [ ... ],
    "precedents": [ ... ],
    "others": [ ... ]
  }
}
```

---

### 통합 검색 API: `POST /api/search` 및 `GET /api/search`

자연어 검색어 하나만 전송하여 법령, 판례, 그리고 기타 자료를 모두 조회할 수 있는 메인 API 엔드포인트입니다.

#### 1. 요청 형식 (Requests)

##### POST 요청 (JSON)
- **URL**: `/api/search`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "query": "주택임대차"
  }
  ```

##### GET 요청 (Query Parameter)
- **URL**: `/api/search?query=임금`

---

#### 2. 응답 형식 (Response)

성공적인 요청 시 `200 OK` 상태 코드와 함께 다음과 같은 구조의 JSON 객체를 반환합니다.

```json
{
  "success": true,
  "keyword": "주택임대차",
  "data": {
    "laws": [
      {
        "lawId": "002341",
        "title": "주택임대차보호법",
        "articleNumber": "3",
        "paragraphNumber": "2",
        "articleTitle": "보증금의 회수",
        "content": "임차인은 임차주택에 대하여 보증금 반환청구소송의 확정판결이나...",
        "link": "https://www.law.go.kr/법령/주택임대차보호법/제3조의2"
      }
    ],
    "precedents": [
      {
        "precId": "210450",
        "caseName": "임대차보증금반환",
        "caseNumber": "2019다280375",
        "judgmentDate": "20200514",
        "court": "대법원",
        "caseType": "민사",
        "judgmentType": "판결",
        "link": "https://www.law.go.kr/판례/임대차보증금반환-(2019다280375)"
      }
    ],
    "others": [
      {
        "id": "150432",
        "caseName": "주택임대차보호법 제3조 위헌소송",
        "caseNumber": "2020헌바123",
        "judgmentDate": "20210527",
        "court": "헌법재판소",
        "caseType": "헌바",
        "judgmentType": "합헌결정",
        "link": "https://www.law.go.kr/결정례/주택임대차보호법제3조위헌소송-(2020헌바123)",
        "targetType": "헌재결정례"
      },
      {
        "id": "012345",
        "title": "주택임대차 분쟁조정위원회 운영 규정",
        "type": "훈령",
        "promulgationDate": "20200815",
        "promulgationNumber": "450",
        "department": "법무부",
        "link": "https://www.law.go.kr/행정규칙/주택임대차분쟁조정위원회운영규정",
        "targetType": "행정규칙"
      }
    ]
  },
  "message": "Successfully retrieved law, precedent, and other related information."
}
```

##### 응답 객체 필드 상세 설명
- **`data.laws`**: 지능형 검색(`aiSearch`)을 통해 찾아낸 특정 **법령 조항(몇조 몇항 등)**들의 배열입니다.
  - `articleNumber`: 조 번호
  - `paragraphNumber`: 항 번호
  - `articleTitle`: 조문의 제목 (예: "보증금의 회수")
  - `content`: 조항 내용 상세 텍스트
- **`data.precedents`**: 대법원 판례 목록 배열입니다.
- **`data.others`**: 헌재결정례, 법령해석례, 행정심판례, 행정규칙을 포함한 통합 데이터 목록입니다. `targetType` 필드로 개별 구분할 수 있습니다.

---

### 외부 호출 샘플 예제 (External Code Examples)

#### JavaScript (POST /api/law-guide 호출 예시)
```javascript
fetch('http://localhost:5556/api/law-guide', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userMessage: '월급이 2달 동안 밀려있어요.',
    category: 'labor'
  })
})
  .then(response => response.json())
  .then(res => {
    if (res.success) {
      console.log('검색 키워드:', res.searchKeyword);
      console.log('AI 가이드 및 서식 (Markdown):', res.guide);
    }
  })
  .catch(err => console.error('네트워크 에러:', err));
```

#### Curl Command (POST /api/law-guide)
```bash
curl -X POST http://localhost:5556/api/law-guide \
     -H "Content-Type: application/json" \
     -d '{"userMessage": "원룸 월세가 만기됐는데 집주인이 전화를 안 받고 보증금 300만 원을 안 줍니다.", "category": "housing"}'
```

#### JavaScript (fetch API - /api/search 호출 예시)
```javascript
const query = '임금체불';

fetch('http://localhost:5556/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
})
  .then(response => response.json())
  .then(res => {
    if (res.success) {
      console.log('법령 조문:', res.data.laws);
      console.log('판례 정보:', res.data.precedents);
      console.log('기타 규칙/결정례:', res.data.others);
    } else {
      console.error('검색 실패:', res.error);
    }
  })
  .catch(err => console.error('네트워크 에러:', err));
```

#### Curl Command
```bash
curl -X POST http://localhost:5556/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "임대차"}'
```
