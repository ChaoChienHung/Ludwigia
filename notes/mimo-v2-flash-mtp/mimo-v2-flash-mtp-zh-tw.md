<meta>
Title: MiMo-V2-Flash 的 MTP：輕量預測頭與 RL Rollout 加速
Summary: 整理 MiMo-V2-Flash 的輕量 MTP 設計、多步訓練與服務及 RL rollout 的成本權衡。
Slug: mimo-v2-flash-mtp-zh-tw
Output: notes/mimo-v2-flash-mtp/mimo-v2-flash-mtp-zh-tw.html
CanonicalId: mimo-v2-flash-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-10-06
</meta>

# MiMo-V2-Flash 的 MTP：輕量預測頭與 RL Rollout 加速

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

MTP 模組以 dense FFN 與 sliding-window attention 降低 drafter 成本。預訓練附一個 head，posttraining 複製為多步模組並訓練 heads。報告把 serving decode 與 RL rollout 加速分開討論。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

§2.3 輕量架構；§5 接受長度、批次與速度；RL 小批次長尾生成的瓶頸。

## 參考資料（References）

### 學術論文（Academic Literature）

1. LLM-Core Xiaomi. (2026). *MiMo-V2-Flash Technical Report*. arXiv preprint arXiv:2601.02780. [MiMo-V2-Flash Technical Report](https://arxiv.org/abs/2601.02780)。

    閱讀重點：§2.3 輕量 head／多步訓練；§5 的批次、接受長度與測速條件。

### 技術文章與模型卡（Technical Articles）

1. [XiaomiMiMo/MiMo-V2-Flash｜官方模型卡](https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash)。

    閱讀重點：核對 XiaomiMiMo/MiMo-V2-Flash 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

### 開源程式碼（Open Source Code）

1. [XiaomiMiMo/MiMo-V2-Flash｜官方發布 repo](https://github.com/XiaomiMiMo/MiMo-V2-Flash)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- drafter 自身成本會影響實際收益。
- 加速 rollout 是訓練系統收益，需與學習效率區分。
</takeaways>
<qprompt/>
</reviewkit>
