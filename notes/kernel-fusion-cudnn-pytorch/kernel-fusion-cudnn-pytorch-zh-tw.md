<meta>
Title: Kernel Fusion、PyTorch 與 cuDNN：誰描述運算，誰執行融合？
Summary: 從 GPU kernel 啟動與中間結果搬運的成本出發，辨清 PyTorch、torch.compile、Triton 與 cuDNN Graph API 的使用關係，以及 fused attention 的意思。
Slug: kernel-fusion-cudnn-pytorch-zh-tw
Output: notes/kernel-fusion-cudnn-pytorch/kernel-fusion-cudnn-pytorch-zh-tw.html
CanonicalId: kernel-fusion-cudnn-pytorch
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: gpu, kernel fusion, cudnn, pytorch, triton, attention
Status: drafting
LastModified: 2026-10-11
</meta>

# Kernel Fusion、PyTorch 與 cuDNN：誰描述運算，誰執行融合？

假設 GPU 要依序做矩陣乘法、加 bias、套 activation。如果每一步都各啟動一個 kernel，前一步的中間結果可能要寫回顯存，再由下一步讀回。**Kernel fusion** 試著把相容步驟放進較少的 kernel，減少啟動與中間資料搬運。它是否值得做、能否合併，仍取決於形狀、硬體、資源用量和實作。

## 先分清四個角色

| 層次 | 你通常會做什麼 | 它的責任 |
| --- | --- | --- |
| PyTorch 程式 | 寫 `nn.Module`、呼叫 attention 等操作。 | 提供模型編程介面與後端調度。 |
| `torch.compile`／Inductor | 選擇編譯模型或函式。 | 分析可捕獲的 PyTorch 圖，融合可處理的操作，選擇或生成執行方式。 |
| Triton | 需要時寫或由編譯器生成 GPU kernel。 | 表達較底層的 GPU 計算；它不是 PyTorch 的完整替代品。 |
| cuDNN | 透過框架間接使用，或直接提交支援的 Op Graph。 | 為 NVIDIA GPU 提供受支援運算的高效實作與執行方案。 |

這些層次可以串在一起，也可能走不同路徑。`torch.compile` **不等於**「一定呼叫 cuDNN」，而 cuDNN **也不會掃描任意 PyTorch 程式並自動融合所有相鄰操作**。

## 我想做 fusion，應該怎麼選？

1. **一般 PyTorch 模型**：先用現成的高階操作；若需要進一步融合可測試 `torch.compile`，再以 profiler 檢查 kernel 數量、顯存和速度是否真的改善。
2. **Attention**：呼叫 `torch.nn.functional.scaled_dot_product_attention(q, k, v)`。PyTorch 可依輸入條件選擇支援的實作；也可透過 `sdpa_kernel` 指定 `CUDNN_ATTENTION` 作實驗。這是選 attention 後端，不是開啟全域 cuDNN fusion。
3. **自建 NVIDIA 專用底層算子**：使用 cuDNN Frontend／Graph API，把受支援的 tensor 運算明確接成有向圖，請 cuDNN 建立執行計畫，然後執行。若圖不受支援，不能假設它會替你合成所需 kernel。
4. **自訂且不在受支援圖內的融合**：自行實作 Triton 或 CUDA kernel，或調整上層圖讓編譯器能處理。

## Op Graph API 到底是什麼？

它是**向 cuDNN 描述運算的介面**。你的程式或框架提供 tensor、運算節點及相依關係；cuDNN 尋找符合圖與裝置條件的 execution plan，可能選預寫的專用 kernel，也可能對支援的通用融合模式在執行期產生 kernel。這不等於「任何圖都會變成一個 kernel」。PyTorch 自己的模型圖和 cuDNN 收到的 Op Graph 也不是同一個層次；框架可以挑出合適的子圖交給 cuDNN。

## Fused attention 又是什麼？

標準 scaled dot-product attention 的數學目標仍是 $\operatorname{softmax}(QK^T/\sqrt{d})V$。高效實作會重新安排計算與資料搬運，例如分塊計算，以避免把龐大的 attention 分數矩陣完整寫回 GPU 顯存。**數學目標相同，不表示浮點結果必須逐位相同**；不同順序或精度會帶來小的數值差異。它和「任意 PyTorch 操作都能由 cuDNN 自動融合」是兩回事。

## 複習時自問

1. `torch.compile`、Triton 和 cuDNN 是同一層的替代品嗎？
2. 直接呼叫 cuDNN Graph API 時，誰負責描述運算圖？
3. 減少 kernel 數量是否必然加速？為何仍要量測？

## References

- [PyTorch：torch.compile](https://docs.pytorch.org/docs/stable/generated/torch.compile.html)
- [PyTorch：scaled dot-product attention](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention)
- [PyTorch：sdpa_kernel 後端選擇](https://docs.pytorch.org/docs/2.14/generated/torch.nn.attention.sdpa_kernel.html)
- [NVIDIA：cuDNN Graph API](https://docs.nvidia.com/cudnn/developer/graph-api/)
- [NVIDIA：cuDNN Frontend Quick Start](https://docs.nvidia.com/cudnn/quickstart/)

<reviewkit>
<takeaways>
- 寫一般 PyTorch 模型時，先用高階操作與 `torch.compile`；要直接控制 NVIDIA 支援的融合圖，才碰 cuDNN Graph API。
- cuDNN Graph API 接收明確描述的受支援子圖，並不掃描任意 PyTorch 程式。
- Fused attention 維持 attention 的數學目標，透過調整 GPU 計算與記憶體使用方式提高效率。
</takeaways>
<qprompt/>
</reviewkit>
