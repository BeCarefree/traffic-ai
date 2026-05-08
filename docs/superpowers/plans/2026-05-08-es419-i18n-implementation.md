# es-419 語系擴充 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在現有繁中/英文架構中新增 `es-419`，並實作 `es-419 -> en -> zh` fallback，同時把右上角語言切換擴充為三按鈕。

**Architecture:** 延續既有 `useLanguage()` + `translate()` 流程，不改頁面呼叫方式。重點在 `src/i18n/translations.ts` 將翻譯字典改為多語值物件，再讓 `translate()` 統一處理 fallback；`LanguageProvider` 與 `App` 只負責語言狀態、持久化與切換 UI。

**Tech Stack:** React 19、TypeScript 5、Vite 7、ESLint 9

---

## File Structure

- Modify: `src/i18n/translations.ts`
  - 職責：擴充 `Lang`、重構翻譯資料結構、實作 `translate()` fallback 規則
- Modify: `src/i18n/LanguageProvider.tsx`
  - 職責：讀取/儲存 `es419`、設定正確的 `document.documentElement.lang`
- Modify: `src/App.tsx`
  - 職責：語言切換按鈕從 2 顆變 3 顆（`中`、`EN`、`ES`）
- Verify: `package.json` scripts
  - 使用 `npm run lint` 與 `npm run build` 做靜態驗證，再做手動頁面驗證

### Task 1: 擴充語言型別與切換行為

**Files:**
- Modify: `src/i18n/LanguageProvider.tsx`
- Modify: `src/App.tsx`
- Test: `npm run lint`

- [ ] **Step 1: 先讓 lint 在未更新 `Lang` 前出現型別問題（預期失敗）**

Run: `npm run lint`  
Expected: 目前應為 PASS（建立基準）；在完成 Task 1 前若先手動改 `App.tsx` 呼叫 `setLang('es419')` 會出現型別錯誤。

- [ ] **Step 2: 修改 `LanguageProvider` 以接受 `es419` 並設定正確 html lang**

```tsx
// src/i18n/LanguageProvider.tsx
function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh' || stored === 'en' || stored === 'es419') return stored
  return 'zh'
}

useEffect(() => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, lang)
  document.documentElement.lang =
    lang === 'zh' ? 'zh-Hant' : lang === 'en' ? 'en' : 'es-419'
}, [lang])
```

- [ ] **Step 3: 修改 `LanguageToggle` 成 3 顆按鈕**

```tsx
// src/App.tsx
function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="lang-toggle" role="group" aria-label="Language switcher">
      <button type="button" className={'lang-toggle-btn' + (lang === 'zh' ? ' active' : '')} onClick={() => setLang('zh')}>
        中
      </button>
      <button type="button" className={'lang-toggle-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" className={'lang-toggle-btn' + (lang === 'es419' ? ' active' : '')} onClick={() => setLang('es419')}>
        ES
      </button>
    </div>
  )
}
```

- [ ] **Step 4: 執行 lint 驗證 Task 1**

Run: `npm run lint`  
Expected: PASS（無新增 ESLint/TypeScript lint 問題）

- [ ] **Step 5: Commit Task 1**

```bash
git add src/i18n/LanguageProvider.tsx src/App.tsx
git commit -m "feat(i18n): add es419 language toggle and provider support"
```

### Task 2: 重構翻譯資料結構並加入西語 fallback

**Files:**
- Modify: `src/i18n/translations.ts`
- Test: `npm run lint`

- [ ] **Step 1: 撰寫失敗驗證（先改 `Lang` 再跑 lint，預期 `translate()` 分支不完整）**

Run: `npm run lint`  
Expected: FAIL（若 `Lang` 已含 `es419` 但 `translate()` 尚未處理，會出現邏輯/型別不一致）

- [ ] **Step 2: 將 `translations` 轉為多語值物件（含 `en`、`es419`）**

```ts
// src/i18n/translations.ts
export type Lang = 'zh' | 'en' | 'es419'
type NonZhLang = 'en' | 'es419'

export const translations: Record<string, Partial<Record<NonZhLang, string>>> = {
  '交通控制決策輔助平台': {
    en: 'Traffic Control Decision Support Platform',
    es419: 'Plataforma de apoyo a decisiones de control de tráfico',
  },
  '交通監控儀表板': {
    en: 'Traffic Monitoring Dashboard',
    es419: 'Panel de monitoreo de tráfico',
  },
  // ...將檔案內所有既有 key 依同格式完整轉換
  '繁體中文': {
    en: 'Traditional Chinese',
    es419: 'Chino tradicional',
  },
  'English': {
    en: 'English',
    es419: 'Inglés',
  },
}
```

- [ ] **Step 3: 實作 `translate()` fallback：`es419 -> en -> zh`**

```ts
export function translate(text: string, lang: Lang): string {
  if (lang === 'zh') return text
  const row = translations[text]
  if (!row) return text
  if (lang === 'en') return row.en ?? text
  return row.es419 ?? row.en ?? text
}
```

- [ ] **Step 4: 執行 lint 驗證 Task 2**

Run: `npm run lint`  
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add src/i18n/translations.ts
git commit -m "feat(i18n): add es419 translations with english fallback"
```

### Task 3: 建置驗證與手動回歸

**Files:**
- Modify: none
- Test: `npm run build`
- Test: `npm run dev`

- [ ] **Step 1: 執行正式建置驗證**

Run: `npm run build`  
Expected: PASS，輸出 `dist/`，無 TypeScript build error

- [ ] **Step 2: 啟動本機並手動驗證三語切換**

Run: `npm run dev`  
Expected: Vite 啟動成功，可在頁面右上角看到 `中 / EN / ES`

手動檢查清單：
- 切到 `ES`，確認常見 UI 字串顯示西語
- 找一個未提供 `es419` 的字串（可暫時註解一筆）確認回退英文
- 再移除同 key 英文確認回退繁中
- 重新整理後語言維持上次選擇
- 瀏覽器檢查 `<html lang>` 在三語下分別為 `zh-Hant`、`en`、`es-419`

- [ ] **Step 3: Commit Task 3（僅紀錄驗證）**

```bash
git status
# 若無檔案變更則不需 commit；若有手動驗證造成的暫時改動，先還原後保持工作樹乾淨
```

## Spec Coverage Self-Review

- 已覆蓋「新增 `es-419`」：Task 1、Task 2
- 已覆蓋「三按鈕切換」：Task 1
- 已覆蓋「僅翻譯 `translations.ts` 既有 key」：Task 2 Step 2
- 已覆蓋「fallback `es419 -> en -> zh`」：Task 2 Step 3
- 已覆蓋「驗證與回歸」：Task 3
- 無 `TODO`、`TBD`、`implement later` 等佔位詞

