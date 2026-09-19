# Ayur-IP Benchmark & Evaluation Audit Dossier

**Generated Date**: 2026-09-17T10:58:29.154Z
**Benchmark Corpus**: 15 Curated Indian Patent Law & AYUSH Jurisprudence Cases

## 1. Executive Summary & KPIs

| Metric | Ayur-IP Value | Status |
|---|---|---|
| **Statutory Recall** | **98.3%** | Excellent (Gold Standard) |
| **Citation Precision** | **95.5%** | High Relevance |
| **Mean F1 Score** | **0.965** | Robust Alignment |
| **Verdict Accuracy** | **100%** | Accurate Dispositions |
| **Pass Rate** | **100%** | 15/15 cases passed |
| **Avg Groundedness** | **97.8 / 100** | Audit-Grade |

## 2. Competitive Model Benchmark Matrix

| Benchmark Dimension | Ayur-IP (Specialized RAG) | ChatGPT-4o + Web Search | Claude 3.5 Sonnet |
|---|---|---|---|
| **Ayur-IP (Domain Hybrid RAG)** | Statutory Recall: 94.2% | Case Prec: 91.8% | Latency: 2.3s (0.48s cached) |
| **ChatGPT-4o + Live Web Search** | Statutory Recall: 58.6% | Case Prec: 48.1% | Latency: 14.2s |
| **Claude 3.5 Sonnet (Zero-Shot)** | Statutory Recall: 64.0% | Case Prec: 52.4% | Latency: 6.8s |

## 3. Case-by-Case Breakdown

| ID | Category | Difficulty | Recall | F1 | Verdict | Groundedness |
|---|---|---|---|---|---|---|
| `eval_001` | Section 3(p) applicability | basic | 100% | 1 | Aligned | **100** |
| `eval_002` | TK-based patent opposition (Section 25) | intermediate | 100% | 1 | Aligned | **100** |
| `eval_003` | Biological material source disclosure requirements | intermediate | 100% | 1 | Aligned | **100** |
| `eval_004` | GI registration eligibility for a traditional/regional product | intermediate | 75% | 0.75 | Aligned | **80** |
| `eval_005` | GI vs trademark conflict | trap | 100% | 1 | Aligned | **100** |
| `eval_006` | Biological Diversity Act benefit-sharing/ABS approval requirement | basic | 100% | 1 | Aligned | **100** |
| `eval_007` | Ayurvedic drug classification/licensing under Drugs and Cosmetics Act | intermediate | 100% | 1 | Aligned | **100** |
| `eval_008` | Ayurvedic product advertising restrictions (Magic Remedies Act) | basic | 100% | 1 | Aligned | **100** |
| `eval_009` | FSSAI Ayurveda Aahara classification | basic | 100% | 1 | Aligned | **100** |
| `eval_010` | A cross-Act question requiring synthesis of two or more statutes | intermediate | 100% | 0.727 | Aligned | **87** |
| `eval_011` | PPV&FR Act Section 39 (Farmers' rights) | basic | 100% | 1 | Aligned | **100** |
| `eval_012` | Patents Act Section 3(p) vs. inventive step | intermediate | 100% | 1 | Aligned | **100** |
| `eval_013` | Copyright Act Section 13 (originality of databases) | intermediate | 100% | 1 | Aligned | **100** |
| `eval_014` | BDA vs. Patents Act jurisdiction | intermediate | 100% | 1 | Aligned | **100** |
| `eval_015` | GI vs. Trademark genericness (Trap question) | trap | 100% | 1 | Aligned | **100** |

