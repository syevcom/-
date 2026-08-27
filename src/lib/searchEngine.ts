/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Advanced Search & Match Engine for EV Chargers
 */

export interface SearchableItem {
  id: string;
  name: string;
  power: string;
  category: string;
  price: number;
  regularPrice?: number;
  discount?: number;
  image: string;
  fallbackImage: string;
  description: string;
  features?: string[];
  tags?: string[];
  targetPage: any;
  powerParam?: string;
}

// 1. Synonyms / Alias mapping dictionary
const BRAND_SYNONYMS: Record<string, string[]> = {
  speel: ['스필', 'speel', 'spil', 'sy-ac', '에스와이'],
  스필: ['스필', 'speel', 'spil', 'sy-ac', '에스와이'],
  chajigo: ['차지고', 'chajigo', 'chargego', 'chazigo'],
  차지고: ['차지고', 'chajigo', 'chargego', 'chazigo'],
  electree: ['일렉트리', 'electree', 'electri', 'elec'],
  일렉트리: ['일렉트리', 'electree', 'electri', 'elec'],
  coolcharge: ['쿨차지', 'coolcharge', 'cool', '쿨'],
  쿨차지: ['쿨차지', 'coolcharge', 'cool', '쿨'],
  lotte: ['롯데', 'evsis', '이브이시스', 'lotte'],
  롯데: ['롯데', 'evsis', '이브이시스', 'lotte'],
  evsis: ['롯데', 'evsis', '이브이시스', 'lotte'],
  이브이시스: ['롯데', 'evsis', '이브이시스', 'lotte'],
};

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  // Residential
  가정용: ['가정용', '홈', '홈충전기', '비공용', '단독주택', '개인용', '자가용', '주택용', 'residential', 'home'],
  홈: ['가정용', '홈', '홈충전기', '비공용', '단독주택', '개인용', '자가용', '주택용', 'residential', 'home'],
  홈충전기: ['가정용', '홈', '홈충전기', '비공용', '단독주택', '개인용', '자가용', '주택용', 'residential', 'home'],
  비공용: ['가정용', '홈', '홈충전기', '비공용', '단독주택', '개인용', '자가용', '주택용', 'residential', 'home'],
  개인용: ['가정용', '홈', '홈충전기', '비공용', '단독주택', '개인용', '자가용', '주택용', 'residential', 'home'],

  // Commercial / Parking / Biz
  상업용: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  사업용: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  biz: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  비즈: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  공용: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  수익형: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  주차장: ['상업용', '사업용', 'biz', '비즈', '공용', '수익형', '주차장', '사업장', '상가', '빌딩', 'commercial', 'parking'],
  아파트: ['아파트', '공동주택', 'apt', '단지', '입대의', 'commercial'],

  // Speed / Power categories
  완속: ['완속', 'slow', 'ac', '5kw', '7kw', '11kw', '14kw'],
  급속: ['급속', 'fast', 'rapid', 'dc', '35kw', '50kw', '100kw', '200kw', '300kw', '중급속', '초급속'],
  중급속: ['중급속', '35kw', '30kw', '40kw', '급속'],
  초급속: ['초급속', '100kw', '200kw', '300kw', '급속'],

  // Special Features
  화재: ['화재', '화재예방', 'plc', '스마트plc', 'plc모뎀', '과열방지', '안전'],
  plc: ['화재', '화재예방', 'plc', '스마트plc', 'plc모뎀', '과열방지'],
  무상: ['무상', '무상as', 'as', '4년', '4년무상', '품질보증', '보증기간'],
  as: ['무상', '무상as', 'as', '4년', '4년무상', '품질보증', '보증기간'],
};

/**
 * Normalizes text: lowercase, removes special chars, trims extra spaces.
 */
export function normalizeKeyword(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\sㄱ-ㅎ가-힣0-9]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Extracts and expands keywords with synonyms.
 */
export function expandSearchTokens(rawQuery: string): string[][] {
  const normalized = normalizeKeyword(rawQuery);
  if (!normalized) return [];

  // Split by whitespace
  const tokens = normalized.split(' ').filter(Boolean);

  return tokens.map((token) => {
    const synonymsSet = new Set<string>();
    synonymsSet.add(token);

    // Check brand synonyms
    if (BRAND_SYNONYMS[token]) {
      BRAND_SYNONYMS[token].forEach(s => synonymsSet.add(s));
    }
    // Check category synonyms
    if (CATEGORY_SYNONYMS[token]) {
      CATEGORY_SYNONYMS[token].forEach(s => synonymsSet.add(s));
    }

    // Power variations (e.g. "7k", "7kw", "7", "7킬로")
    const kwMatch = token.match(/^(\d+)(kw|k|킬로|킬로와트)?$/);
    if (kwMatch && kwMatch[1]) {
      const num = kwMatch[1];
      synonymsSet.add(`${num}kw`);
      synonymsSet.add(`${num} k`);
      synonymsSet.add(num);
    }

    return Array.from(synonymsSet);
  });
}

/**
 * Computes search score for an item given tokens and original search query.
 * Higher score = higher ranking.
 * Score >= 10 means valid match.
 */
export function calculateSearchScore(item: SearchableItem, rawQuery: string): number {
  const trimmed = rawQuery.trim().toLowerCase();
  if (!trimmed) return 100; // default order when no query

  const normQuery = normalizeKeyword(rawQuery);
  const tokenExpansions = expandSearchTokens(rawQuery);
  if (tokenExpansions.length === 0) return 100;

  const nameNorm = normalizeKeyword(item.name);
  const powerNorm = normalizeKeyword(item.power);
  const catNorm = normalizeKeyword(item.category);
  const descNorm = normalizeKeyword(item.description);
  const tagsNorm = normalizeKeyword((item.tags || []).join(' '));
  const featsNorm = normalizeKeyword((item.features || []).join(' '));

  const allItemText = `${nameNorm} ${powerNorm} ${catNorm} ${descNorm} ${tagsNorm} ${featsNorm}`;

  let totalScore = 0;
  let matchedTokenGroups = 0;

  // Exact full query matches
  if (nameNorm === normQuery) {
    totalScore += 1000;
  } else if (nameNorm.includes(normQuery)) {
    totalScore += 500;
  }

  // Token Group Matching (AND logic evaluation with weighted scoring)
  for (const synGroup of tokenExpansions) {
    let bestTokenScore = 0;

    for (const syn of synGroup) {
      let currentSynScore = 0;

      // 1순위: 상품명/브랜드에 정확 매칭 (Weight: 300 ~ 500)
      if (nameNorm.startsWith(syn) || nameNorm.split(' ').includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 400);
      } else if (nameNorm.includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 250);
      }

      // 2순위: 용량(kW)이나 주요 스펙 태그 일치 (Weight: 200 ~ 300)
      if (powerNorm === syn || powerNorm.includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 300);
      }
      if (tagsNorm.includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 200);
      }
      if (featsNorm.includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 150);
      }

      // 3순위: 설명글이나 카테고리 일치 (Weight: 80 ~ 120)
      if (catNorm.includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 120);
      } else if (descNorm.includes(syn)) {
        currentSynScore = Math.max(currentSynScore, 80);
      }

      if (currentSynScore > bestTokenScore) {
        bestTokenScore = currentSynScore;
      }
    }

    if (bestTokenScore > 0) {
      matchedTokenGroups++;
      totalScore += bestTokenScore;
    }
  }

  // Multi-token multiplier: if ALL search tokens are matched, give a huge boost
  const allTokensMatched = matchedTokenGroups === tokenExpansions.length;
  if (allTokensMatched) {
    totalScore += 500 * tokenExpansions.length;
  } else if (matchedTokenGroups > 0) {
    // Partial match score penalty so full matches always rank top
    totalScore = totalScore * (matchedTokenGroups / tokenExpansions.length) * 0.4;
  } else {
    return 0; // No match
  }

  return totalScore;
}

/**
 * Filters and sorts items based on search query with ranking weights.
 */
export function searchAndRankProducts<T extends SearchableItem>(
  items: T[],
  query: string
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const scoredList: { item: T; score: number }[] = [];

  for (const item of items) {
    const score = calculateSearchScore(item, query);
    if (score >= 30) {
      scoredList.push({ item, score });
    }
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.map(s => s.item);
}
