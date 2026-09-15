<meta>
Title: NUS CS5242: Neural Networks and Deep Learning
Summary: Lecture and study notes for NUS CS5242 Neural Networks and Deep Learning, covering causal language models, LLaMA label handling mechanics, and instruction fine-tuning workflows.
Slug: nus-cs5242-neural-networks-and-deep-learning
Output: notes/NUS CS5242 Neural Networks and Deep Learning/NUS CS5242 Neural Networks and Deep Learning.html
CanonicalId: nus-cs5242-neural-networks-and-deep-learning
Style: default
EstimatedReadingTime: true
Lang: en
Tags: Deep Learning, Machine Learning, Artificial Intelligence, LLM
Status: drafting
Published: 2026-09-12
LastModified: 2026-09-12
</meta>

NUS CS5242 Neural Networks and Deep Learning
LLaMA Label Handling and Instruction Fine-Tuning Notes

1. Overview
LLaMA and similar models (like GPT and Mistral) are decoder-only causal language models trained using next-token prediction. This means the model predicts the next token in a sequence based on all previous tokens. If explicit labels are not provided during training, frameworks such as Hugging Face’s Trainer automatically set labels = input_ids, causing the model to learn to reproduce the entire input sequence.

2. Behavior in the Original Code
The original dataset combined the instruction, optional context, and response into a single text field.
Only input_ids were generated, and no labels were defined.
As a result, the model was trained to predict both the instruction and the response.
This setup is suboptimal for instruction tuning because the model wastes capacity learning to regenerate the prompt text instead of focusing on generating the correct response.

3. Improved Approach
Separate the dataset into two distinct parts:
- input: the prompt (instruction + optional context)
- label: the expected response
Tokenize both input and label fields.
Assign the response tokens as the labels using input_enc["labels"] = label_enc["input_ids"].
This setup ensures the model learns to predict only the response given the instruction, which aligns with supervised fine-tuning (SFT) objectives.

4. Comparison of Approaches
Old version: Implicit labels (labels = input_ids), model learns to predict the full formatted text including the instruction.
Updated version: Explicit labels (labels = response tokens), model learns to predict only the response.

5. Additional Considerations
For even better training efficiency, masking non-response tokens by setting their label positions to -100 can ensure the loss function ignores prompt tokens. This technique allows combining input and response into one sequence while optimizing loss computation on response tokens only.

6. Summary
Explicitly separating input and response or masking non-response tokens provides a more efficient and accurate fine-tuning setup.
This ensures the LLaMA model focuses on generating meaningful responses instead of reproducing the input prompts.

Why divide the dot product by √d?

- No scaling: Dot product values grow large with increasing dimension *d*, causing softmax to produce overly sharp (exploding) outputs, which destabilizes training.  
- Divide by d: Over-scales down the values, making softmax outputs almost uniform and losing meaningful differences.  
- Divide by √d: Strikes the right balance, keeping softmax inputs stable and gradients meaningful, improving training performance.

# Overview of the T5 Model Implementation

# T5 Transformer Core Components: Overview and Extensions

## Overview

This code implements the core components of the T5 Transformer architecture, a powerful sequence-to-sequence model widely used in NLP tasks like translation, summarization, and more.

## Main Components and Their Roles

### 1. T5LayerNorm

- Purpose: Applies a unique layer normalization used in T5.
- How it works:  
  Normalizes hidden states by scaling without bias.  
  Computes variance across the last dimension, divides inputs by √(variance + ε), then scales by learned weights.
- Why: Simplifies normalization, improves training stability.

### 2. T5DenseGatedActDense

- Purpose: Feed-forward network with *gated GELU* activation.
- How it works:  
  - Two linear layers (`wi_0`, `wi_1`) project inputs to feed-forward dimension.  
  - One output passes through GELU activation, then element-wise multiplied with the other.  
  - Result is projected back to model dimension (`wo`) and dropout applied.
- Why gating: Enhances expressivity and gradient flow.

### 3. T5LayerFF

- Purpose: Feed-forward block of the Transformer.
- How it works:  
  Applies T5LayerNorm → gated feed-forward network → dropout → residual connection.

### 4. T5Attention

- Purpose: Multi-head self-attention or cross-attention with relative position bias.
- How it works:  
  - Linear projections for queries, keys, values, output.  
  - Adds relative position biases to attention scores based on token distance.  
  - Applies softmax with attention masking (causal or padding).  
  - Supports cross-attention by using encoder keys/values.
- Why relative position bias: Better generalization for varying input lengths.

### 5. T5LayerSelfAttention

- Purpose: Self-attention with layer norm and residual dropout.
- How it works:  
  Normalize input → self-attention → dropout → add residual.

### 6. T5LayerCrossAttention

- Purpose: Cross-attention in the decoder, attending to encoder outputs.
- How it works:  
  Similar to self-attention, but keys/values come from encoder states.

### 7. T5Block

- Purpose: A Transformer block consisting of:  
  Self-attention → (optional) Cross-attention → Feed-forward network.  
- How it works:  
  Runs each sub-layer with residual connections, layer norm, and fp16 stability clamping.

### 8. T5Stack

- Purpose: Stacks multiple Transformer blocks (encoder or decoder).
- How it works:  
  - Token embedding.  
  - Creates attention masks (causal for decoder, padding for encoder).  
  - Passes input through all blocks sequentially.  
  - Applies final layer norm and dropout.  
  - Handles encoder-decoder interactions.

## Key Concepts and Infrastructure

- Layer Normalization: Stabilizes training by normalizing activations; T5 omits bias.
- Multi-head Attention: Parallel attention heads attending to different representation subspaces.
- Relative Position Bias: Attention scores biased by relative token positions rather than absolute.
- Residual Connections: Help gradients flow through deep networks.
- Dropout: Regularization technique.
- Causal Masking: Prevents decoder from attending to future tokens (autoregressive).

## Code Syntax Highlights

- Uses `nn.Module` subclasses for modularity.
- Parameters defined as `nn.Parameter`.
- Forward passes include tensor reshaping, matrix multiplication, masking, softmax, dropout.
- Handles different modes: encoder vs decoder, self vs cross attention.
- Implements fp16 numerical stability tricks.

## Detailed Explanation and Extension Ideas

### 1. T5LayerNorm

- Computes variance only, scales without bias.  
- *Extension ideas*: Add bias, try RMSNorm, optimize with fused kernels.

### 2. T5DenseGatedActDense

- Gated activation: multiply GELU output with linear projection.  
- *Extension ideas*: Swap GELU with Swish/ReLU, add normalization, learn gating weights dynamically.

### 3. T5Attention

- Multi-head attention with relative position bias.  
- Supports masking (causal for decoder, padding for encoder).  
- *Extension ideas*: Use rotary position embeddings (RoPE), sparse/local attention, fuse ops for speed.

### 4. T5Block

- Combines self-attention, optional cross-attention, feed-forward.  
- Residual and normalization layers included.  
- Clamps values in fp16 mode for stability.  
- *Extension ideas*: Pre-norm vs post-norm, adapters for efficient fine-tuning, stochastic depth.

### 5. T5Stack

- Embeds tokens, builds masks, stacks blocks, applies final norm.  
- Supports encoder-decoder interaction.  
- *Extension ideas*: Embedding tying, mixed precision training, token type embeddings, prefix/prompt tuning, beam search decoding.

## General Extensions and Improvements

- Tokenizer & Preprocessing: Integrate SentencePiece or HuggingFace tokenizers.
- Training Loop & Optimizer: Support gradient accumulation, learning rate schedules, mixed precision.
- Distributed Training: Multi-GPU and multi-node training.
- Model Checkpointing: Save/load weights, export to ONNX/TorchScript.
- Evaluation & Metrics: BLEU, ROUGE, accuracy pipelines.
- Fine-tuning Heads: Add classification, QA, summarization heads; implement adapters/LoRA.

## Summary

- The code modularly implements T5's core blocks with attention, normalization, and feed-forward layers.
- Supports encoder-decoder stacks with masking and relative position bias.
- Provides a strong foundation for training or fine-tuning T5 models.
- Many extension points to improve, customize, or optimize the model.

---

# T5 LayerNorm Summary

## Standard Layer Normalization

- Formula:
  \[
  \text{LayerNorm}(x) = \gamma \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} + \beta
  \]
- Steps:
  - Compute mean \(\mu\) of input features.
  - Subtract mean from input.
  - Compute variance \(\sigma^2\).
  - Normalize input using mean and variance.
  - Scale by learnable parameter \(\gamma\) (gamma).
  - Shift by learnable parameter \(\beta\) (beta).

- Learnable parameters: scale (gamma) and bias (beta).

## T5 LayerNorm (As in the Original Paper)

- No mean subtraction: Does not subtract mean from inputs.
- Variance calculation: Computes variance as mean of squared inputs (RMS).
- No learnable parameters: Neither scale (gamma) nor bias (beta).
- Formula:
  \[
  \text{T5LayerNorm}(x) = \frac{x}{\sqrt{\text{mean}(x^2) + \epsilon}}
  \]
- Simply normalizes inputs by root mean square (RMS).

## Why This Design?

- Simplifies normalization, reducing parameters.
- Empirically shown to improve training stability for T5.
- Downstream layers handle scaling implicitly.
- Helps model efficiency and regularization.

## Variants in Implementations

- Some implementations add a learnable scale parameter (`weight`) for flexibility.
- The original T5 implementation does not include learnable parameters in LayerNorm.
- Bias terms are generally omitted in all variants.

## Comparison Table

| Feature                 | Standard LayerNorm | T5 LayerNorm (Paper) | Common Implementations (PyTorch) |
|-------------------------|--------------------|---------------------|----------------------------------|
| Mean subtraction        | Yes                | No                  | No                               |
| Variance calculation    | Variance           | RMS (mean squared)  | RMS                              |
| Learnable scale (gamma) | Yes                | No                  | Sometimes yes                    |
| Learnable bias (beta)   | Yes                | No                  | No                               |

## Example: Parameter-free T5LayerNorm (PyTorch)

```python
import torch
import torch.nn as nn

class T5LayerNorm(nn.Module):
    def __init__(self, eps=1e-6):
        super().__init__()
        self.eps = eps

    def forward(self, x):
        # RMS normalization (no mean subtraction)
        variance = x.pow(2).mean(-1, keepdim=True)
        x = x / torch.sqrt(variance + self.eps)
        return x
```
---

# Summary: Layer Normalization in T5

- Normalization Dimension  
  T5's layer normalization normalizes across the last dimension, which corresponds to the embedding dimension (hidden size), not the sequence length.

- Why normalize the embedding dimension?  
  Each token's embedding vector is normalized individually. This means each token representation is "cleaned" or stabilized before passing to the next layer, helping consistent scale and distribution across layers.

- Embedding normalization vs. layer norm  
  While embeddings may be somewhat normalized initially, intermediate representations after each layer benefit from re-normalization to improve training stability and model performance.

- Effect of normalization per token  
  This ensures the model's internal representation remains well-behaved and prevents issues like exploding or vanishing activations as information passes through many layers.

- Not normalized across sequence  
  Normalizing across the sequence dimension would mix tokens and lose per-token information, which is not desired here.

This approach is standard for Transformer models, where layer norm is typically applied across the embedding dimension per token at each layer.

# What is a Causal Encoder and a Causal Decoder?

## Causal Encoder
- Definition: An encoder that processes input tokens with a causal mask applied.
- Causal Mask: Ensures that each token can only attend to previous tokens (and itself), not future tokens.
- Usage: This is uncommon for encoders in standard Transformer setups, because encoders usually have access to the whole input sequence (bidirectional).
- When it might be used:
  - In autoregressive models where even the encoder must not peek into future tokens.
  - For example, in some language modeling tasks where the encoder itself processes sequences autoregressively.
  
## Causal Decoder
- Definition: A decoder that uses a causal mask to prevent positions from attending to future tokens.
- Purpose:
  - Ensures autoregressive generation — the model predicts the next token using only previous tokens.
  - Prevents "cheating" by masking out future tokens during training and inference.
- Standard in: Transformer decoders for tasks like language generation, translation, summarization.

## Summary
| Component      | Causal Mask Usage    | Typical Purpose                           |
|----------------|---------------------|-----------------------------------------|
| Encoder        | Usually no       | Encodes entire input sequence (bidirectional) |
| Causal Encoder | Yes (rare)          | Autoregressive encoding (e.g., language modeling) |
| Decoder        | Yes (standard)      | Autoregressive decoding/generation       |

## Why does causal masking matter?

- It preserves the causal structure of sequence generation.
- Without causal masking in decoder, the model would see future tokens and fail to generalize to real generation scenarios.

---

# Explanation of `T5Attention` and `T5LayerSelfAttention`

## T5Attention

### Overview
`T5Attention` implements the core multi-head attention mechanism used in T5, supporting both self-attention and cross-attention.

---

### Key Parameters and Attributes
- d_model: Dimensionality of input embeddings.
- d_kv: Dimension of key and value vectors per head.
- num_heads: Number of attention heads.
- dropout_rate: Dropout applied to attention weights.
- relative_attention_num_buckets: Number of buckets for relative position bias.
- relative_attention_max_distance: Maximum relative distance tracked for bias.
- has_relative_attention_bias: Whether to use learned relative position bias.
- is_decoder: Indicates if this attention is in a decoder (affects masking and position bias).

### Initialization
- Defines linear layers for:
  - Query projection (`q`): from `d_model` to `num_heads * d_kv`
  - Key projection (`k`)
  - Value projection (`v`)
  - Output projection (`o`): back to `d_model`
- If relative attention bias is used, defines an embedding table for it.
- Sets other parameters like dropout rate and head counts.

### Relative Position Buckets

- Converts relative positions (distance between query and key tokens) into buckets to reduce the number of learned biases.
- Uses a mix of linear and logarithmic scaling to handle small and large distances differently.
- Buckets are split for positive and negative distances when bidirectional attention (encoder).
- When causal (decoder), uses unidirectional buckets.

### `compute_bias` Method

- Computes relative position biases for each pair of query and key tokens.
- Uses the bucketed relative positions to index into learned embeddings.
- Returns a bias tensor shaped `(1, num_heads, query_length, key_length)`.

---

### Forward Pass

1. Inputs:
   - `hidden_states`: Input embeddings of shape `(batch_size, seq_length, d_model)`.
   - `mask`: Attention mask to prevent attending to padding or future tokens.
   - `key_value_states`: Optional external states for cross-attention (encoder outputs).
   - `position_bias`: Optional cached position bias.

2. Projections:
   - Projects inputs to queries.
   - For keys and values, uses `key_value_states` if provided (cross-attention), else `hidden_states`.

3. Reshape for Multi-Head Attention:
   - Reshapes `(batch_size, seq_length, num_heads * d_kv)` into `(batch_size, num_heads, seq_length, d_kv)`.

4. Attention Scores:
   - Computes scaled dot-product attention scores by multiplying queries and keys.

5. Add Position Bias:
   - If no cached position bias, computes relative position biases.
   - Adds bias to scores.
   - Adds mask if provided (e.g., causal mask to prevent attending to future tokens).

6. Masking Heads (if pruned):
   - Optionally disables pruned attention heads.

7. Softmax and Dropout:
   - Applies softmax over the key dimension.
   - Applies dropout to attention weights.

8. Weighted Sum:
   - Multiplies attention weights by values.

9. Output Projection:
   - Reshapes back to `(batch_size, seq_length, d_model)`.
   - Projects through output linear layer.

10. Return:
    - Returns a tuple `(attn_output, position_bias)` for use in caching.

---

## T5LayerSelfAttention

### Overview
- Wraps `T5Attention` with:
  - Layer normalization before attention.
  - Residual connection and dropout after attention.

### Components
- `SelfAttention`: An instance of `T5Attention`.
- `layer_norm`: Normalizes input embeddings before attention.
- `dropout`: Applied after attention output.

### Forward Pass
- Normalize inputs.
- Run self-attention.
- Apply dropout.
- Add residual connection: output = input + dropout(attention_output).
- Return updated hidden states and position bias.

---

# Summary

| Step                 | Description                                                   |
|----------------------|---------------------------------------------------------------|
| Initialization       | Setup of linear layers and relative position bias embedding. |
| Relative position buckets | Efficient encoding of relative positions for bias lookup.   |
| Forward pass          | Compute Q, K, V projections → attention scores → add bias & mask → softmax → weighted sum → output projection. |
| Output                | Attention output and updated position bias for caching.       |
| T5LayerSelfAttention  | Adds layer norm before attention and residual connection after.|

# Additional Notes

- Cross-attention: When `key_value_states` are provided, keys and values come from encoder outputs (used in decoder cross-attention).
- Position bias caching: Allows reusing bias across steps during decoding.
- Masking:
  - For encoder: masks pad tokens.
  - For decoder: applies causal mask to avoid future token attention.

---

# 🔍 PyTorch T5 Attention Notes

## 🧠 Multi-Head Attention Flow

1. Input shape: `(batch_size, seq_length, d_model)`
2. Linear Projections: Project inputs to Q, K, V using separate linear layers.
3. Reshape: Split last dim into `(num_heads, d_kv)` and transpose to shape:
   - `(batch_size, num_heads, seq_length, d_kv)`
4. Attention scores: Compute dot product of Q and K:
   - `scores = torch.matmul(Q, K.transpose(-2, -1))`
   - Result shape: `(batch_size, num_heads, seq_length, seq_length)`
5. Position bias: Added to `scores` before softmax.
6. Masking:
   - Use attention mask to block out positions (e.g. causal or padding).
   - Mask shape: `(batch_size, 1, seq_length, seq_length)` or broadcastable.
7. Softmax and Dropout:
   - Normalize scores with softmax along `-1` (key axis).
   - Optionally apply dropout.
8. Attention output:
   - Multiply attention weights with V.
   - Shape: `(batch_size, num_heads, seq_length, d_kv)`
   - Merge heads and project back with output linear layer.

## 📏 Mask Shapes

- Causal mask shape: `(batch_size, seq_length, seq_length)`
- Extended mask: `mask[:, None, :, :]` → `(batch_size, 1, seq_length, seq_length)`
- Matches attention score shape for broadcasting.

## 🧮 Position Bias

- Relative position bias encodes how far apart positions are.
- Shape: `(1, num_heads, query_length, key_length)`
- Reused across layers for efficiency.
- Added to attention scores before softmax.

## 🪜 Relative Position Buckets

- `_relative_position_bucket()` maps relative distances to discrete buckets.
- Helps model learn patterns like "previous token", "2 tokens ahead", etc.
- Uses:
  - `relative_attention_num_buckets`: Total bucket count (e.g. 32)
  - `relative_attention_max_distance`: Max relative distance modeled

## 💡 torch.where for Device-Friendly Scalars

```python
clamp_value = torch.where(
    torch.isinf(tensor).any(),
    torch.finfo(tensor.dtype).max - 1000,
    torch.finfo(tensor.dtype).max
)
```

- Keeps `clamp_value` as a tensor on the same device (e.g. GPU).
- Avoids device mismatch and keeps code compatible with tracing.

## 🧱 torch.finfo

- Returns floating-point limits for a data type:
  - `.max`: max finite value
  - `.min`: min value
  - `.eps`: smallest distinguishable delta from 1.0
  - `.tiny`: smallest positive normal value

```python
torch.finfo(torch.float32).max  # ~3.4e38
```

## 🧱 torch.clamp

- Used to clip values within `[min, max]` range.
- `clamp_value` is just a number, `torch.clamp()` actually applies it to the tensor.

## 🔒 Causal Mask Construction

```python
seq_ids = torch.arange(seq_length, device=input_ids.device)
causal_mask = seq_ids[None, None, :].repeat(batch_size, seq_length, 1) <= seq_ids[None, :, None]
causal_mask = causal_mask.to(inputs_embeds.dtype)
```

- Ensures each position can only attend to itself and earlier.
- Final shape: `(batch_size, seq_length, seq_length)`

## ➕ Why Extend the Mask?

```python
extended_attention_mask = causal_mask[:, None, :, :]
```

- Adds a singleton head dimension for broadcasting.
- Final shape: `(batch_size, 1, seq_length, seq_length)`
- Needed for compatibility with attention scores.

## 🎮 torch.cuda.set_device()

```python
torch.cuda.set_device(self.encoder.first_device)
```

- Sets the current active CUDA device.
- Ensures new CUDA tensors/ops are placed on the right device.
- Important when working with multiple GPUs.

---

