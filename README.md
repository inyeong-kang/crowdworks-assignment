# 사전 과제

> 주요 기능: PDF 문서와 해당 문서를 파싱한 JSON 데이터를 연결한 양방향 인터랙션

## 요구사항

1. 화면 구성

- 왼쪽: PDF 렌더링 (예: react-pdf 또는 pdfjs-dist 활용) ✅
- 오른쪽: 파싱된 JSON 데이터를 텍스트 블록 형태로 렌더링 ✅

2. 마우스 인터랙션 (PDF → JSON)

- 사용자가 PDF 위 특정 영역에 마우스를 올리면
    - 해당 영역에 네모 테두리 + 반투명 하이라이트 처리 ✅
    - 오른쪽 텍스트 영역 중 매칭되는 항목으로 스크롤 이동 + 배경 노란색 강조 ✅

3. 클릭 인터랙션 (JSON → PDF)

- 사용자가 오른쪽 텍스트 항목을 클릭하면
    - 해당 항목의 배경이 노란색으로 강조 ✅
    - 왼쪽 PDF에서 매칭되는 영역을 테두리 + 반투명 오버레이 처리 ✅
    - PDF 문서가 해당 영역이 가운데로 오도록 스크롤 이동 ✅

## 기술 조건

- React, TypeScript, styled-components, pdfjs-dist

## 구현사항 요약

- 프로젝트 설치 및 실행

    - 프로젝트 설치: `npm i`
    - 프로젝트(개발 서버) 실행: `npm run dev` (http://localhost:5173/ 접속)

- 프로젝트 구조
    ```jsx
    // :root/src 기준 구조입니다.
    📦src
     ┣ 📂components
     ┃ ┣ 📂PDFViewer
     ┃ ┣ 📂Preview
     ┃ ┃ ┣ 📂components
     ┃ ┃ ┃ ┣ 📂Picture
     ┃ ┃ ┃ ┣ 📂Table
     ┃ ┃ ┃ ┣ 📂Text
     ┃ ┃ ┃ ┣ 📜NodeRenderer.tsx
     ┃ ┃ ┃ ┗ 📜index.ts
     ┃ ┃ ┣ 📜index.tsx
     ┃ ┣ 📂common
     ┃ ┃ ┣ 📜Pagination.tsx
     ┃ ┃ ┣ 📜Tab.tsx
     ┃ ┃ ┗ 📜index.ts
     ┃ ┣ 📜JSONViewer.tsx
     ┃ ┗ 📜index.ts
     ┣ 📂contexts
     ┃ ┣ 📜highlight.tsx
     ┃ ┣ 📜index.ts
     ┃ ┣ 📜pagination.tsx
     ┃ ┗ 📜tab.tsx
     ┣ 📂hooks
     ┃ ┣ 📜index.ts
     ┃ ┗ 📜usePDFRendering.ts
     ┣ 📂styles
     ┃ ┣ 📜global.ts
     ┃ ┗ 📜index.ts
     ┣ 📂types
     ┃ ┣ 📜index.ts
     ┃ ┣ 📜pdf.d.ts
     ┃ ┗ 📜preview.ts
     ┣ 📂utils
     ┃ ┣ 📜file.ts
     ┃ ┗ 📜index.ts
     ┣ 📜App.tsx
     ┣ 📜main.tsx
     ┗ 📜vite-env.d.ts
    ```
- 추가로 사용한 기술 스택
    1. pdfjs-dist: react-pdf와 비교했을 때 더 낮은 추상화 수준을 제공하여, 커스터마이징이 용이하여 도입
    2. styled-components: 컴포넌트 기반으로 동적인 스타일링을 적용할 수 있어, 상태에 따라 스타일을 유연하게 변경할 수 있어 도입
    3. Vite: 빠른 개발 서버 구동 속도와 핫 리로드 성능이 매우 뛰어나 도입
    4. react-json-view-lite: 가볍고 빠른 JSON 뷰어로, 대용량 JSON을 렌더링할 때도 성능 저하가 적으며 트리 구조로 표현되어 데이터 구조를 직관적으로 파악할 수 있어 도입
- 전체적인 UI 설계
    - [Docling](https://docling-project.github.io/docling/concepts/docling_document/) 공식 문서에서 제공하는 문서 구조를 바탕으로 파싱된 데이터(`1.report.json`)의 구조를 파악한 다음, 필요한 컴포넌트를 정의했습니다. → Text, Table, Picture
    - “JSON 영역에서 텍스트 블록”은 Preivew 컴포넌트의 Node 와 상응하도록 설계했고, 하나의 Node 가 또다시 여러개의 Node 를 가질 수 있는 상황을 고려하여 NodeRenderer 를 정의했습니다.

---

## 고민했던 사항들 또는 이슈사항

1. bbox, bounding box 를 가지고 문서에서 매칭되는 요소에 하이라이트 효과를 주었습니다. 그런데 이때 bounding box 는 Docling 에서 문서의 왼쪽 하단을 기준으로 추출된 정보들이기 때문에, `cood_origin: BOTTOMLEFT` → 이 기준점이 달라지는 경우에 대해서는 별도의 대응 코드 필요한 상태입니다. (우선은 docling 이 기본적으로 cood_origin 을 왼쪽 하단으로 설정하여 요소들을 추출하고 있어, 현 상태를 유지하였습니다.)
2. `1.report.json` 과 `1.report.pdf` 파일을 가지고 기능을 구현하다가, 페이지가 많거나 요소 안의 요소가 많은 경우에는, 대응하기 힘든 컴포넌트 구조라고 판단하였습니다. → [docling-project 레포지토리](https://github.com/docling-project/docling) 를 통해 추가로 예시 파일(`2206.01062v1.pdf`)을 파싱한 `2206.01062v1.json` 파일을 얻을 수 있었고, 이 파일들을 통해 페이지네이션 로직 등을 정교화할 수 있었습니다. 또한 이미지나 테이블 내부의 요소들(캡션 등)도 detection 되는 케이스를 반영할 수 있었습니다.
3. 줌 기능이 도입되면 파일의 크기가 달라지기 때문에, 그에 맞게 bounding box 의 위치값도 재조정되도록 별도의 계산 로직을 추가하는 것이 필요하겠다고 생각했습니다.
4. 만약 좀 더 복잡한 UI(예를 들어 BarChart, PieChart, 링크 등)에 대한 지원이 필요하다면, 그에 상응하는 컴포넌트를 Preview/components 에 정의하는 방식으로 컴포넌트 구조를 설계했습니다.

---

과제 리뷰 감사드립니다! 🙇😀
