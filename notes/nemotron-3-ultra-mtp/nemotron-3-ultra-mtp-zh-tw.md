<meta>
Title: Nemotron 3 Ultra 的 MTP：共享預測頭、蒸餾對齊與 Rollout 效率
Summary: 整理 Nemotron 3 Ultra 的共享 recurrent MTP、凍結 backbone 的 head boosting 與實測推論收益。
Slug: nemotron-3-ultra-mtp-zh-tw
Output: notes/nemotron-3-ultra-mtp/nemotron-3-ultra-mtp-zh-tw.html
CanonicalId: nemotron-3-ultra-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-10-06
</meta>

# Nemotron 3 Ultra 的 MTP：共享預測頭、蒸餾對齊與 Rollout 效率

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

預訓練使用共享權重的 MTP heads；推論遞迴使用共享 head。MTP Boosting 則固定 backbone，以 forward-KL 讓 head 對齊主模型分布。報告另外測量 RL rollout 與單用戶 decode 的加速。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

§2.1 共享設計；§3.4 train-inference mismatch 與 KL；§3.6 和 §5 的速度適用條件與 state rollback。

## 參考資料（References）

### 學術論文（Academic Literature）

1. NVIDIA. (2026). *Nemotron 3 Ultra: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning*. arXiv preprint arXiv:2606.15007. [Nemotron 3 Ultra: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning](https://arxiv.org/abs/2606.15007)。

    閱讀重點：§2.1 共享 recurrent head、§3.4 frozen-backbone KL Boosting、§3.6／§5 速度條件。

### 開源程式碼（Open Source Code）

1. [NVIDIA-NeMo/Nemotron｜官方發布 repo](https://github.com/NVIDIA-NeMo/Nemotron)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- head boosting 階段只更新 MTP head。
- 接受長度與驗證成本共同決定實際加速。
</takeaways>
<qprompt/>
</reviewkit>

