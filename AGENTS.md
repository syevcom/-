# Development Guidelines & Rules for SY.com Project

## 1. Absolute Preservation of Product Data & Image Paths (상품 데이터 및 이미지 경로 절대 보존)
- **절대 덮어쓰기/리셋 금지**: 사용자가 등록하거나 수정한 모든 상품의 메인 이미지 URL (`/스필.png`, `/쿨차지.png`, `/일렉트리.png`, `/차지고.png`, `/50kw-쿨차지.png` 등), 상세페이지 이미지 URL, 텍스트 데이터(상품명, 가격, 옵션, 태그, 보증기간 등)를 임의의 플레이스홀더나 다른 외부 URL로 교체/초기화하지 않습니다.
- **기존 데이터 객체 구조 유지**: 기존 정의된 데이터 객체(Array/JSON)의 구조와 값을 온전히 유지한 상태에서 기능 로직과 스타일만 확장/수정합니다.

## 2. PC / Mobile Single Source of Truth Responsive Design (PC/모바일 데이터 일원화)
- **단일 데이터 소스(SSOT)**: 모바일 화면과 PC 화면이 동일한 상품 데이터 소스(State/Props)를 공유하며, 모바일용/PC용 데이터를 별도로 분리하거나 이중 관리하지 않습니다.
- **반응형 레이아웃 일원화**: 동일한 마크업 및 데이터 구조를 기반으로 Tailwind CSS 반응형 클래스(`sm:`, `md:`, `lg:`, `xl:`) 및 미디어 쿼리를 사용하여, 모바일 화면에서도 이미지가 잘리거나 깨짐 없이 완벽하게 반응형으로 렌더링되도록 구현합니다.

## 3. Data Persistence & Real-time Cloud Sync (데이터 영속성)
- **로컬 스토리지 및 Firestore 실시간 동기화**: 브라우저를 새로고침하거나 기기를 변경해도 등록/수정된 상품과 이미지가 손실 없이 유지되도록 LocalStorage 및 Firestore 비동기 레이어를 통해 안전하게 상태를 관리합니다.
