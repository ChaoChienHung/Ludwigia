---
name: nus-soc-slurm
description: Prepare, submit, monitor, and troubleshoot GPU or CPU batch jobs on the NUS School of Computing Slurm cluster from a Git-synced project, including node failures, log hand-off through Git, and running several jobs at once. Use when work mentions the SoC cluster, xlogin, sbatch, srun, sinfo, sacct, a failed or instantly exiting job, or moving an experiment from a laptop to SoC.
---

# NUS SoC Slurm 操作手冊

目標：讓本機寫好的實驗能在 NUS SoC 叢集上可靠地跑完、失敗時能快速定位原因，並讓 AI 助手在**看不到叢集**的情況下，仍能透過 Git 拿到 log、判讀結果。

這份手冊整理自 2026 年 11 月在 SoC 上跑推薦模型（TIGER、SASRec、FMRec）的實際經驗。分割區名稱、GPU 型號、節點好壞都會變動，下面標了日期的內容是**當時的觀察**，用之前要在叢集上重新確認。

## 1) 連線與即時檢查

1. 不在 NUS 網路內時，先依 NUS 現行 VPN 說明連線，再登入 login node（例如 `xlogin.comp.nus.edu.sg`）。帳號、密碼、token、SSH key 都不寫進任何 repo 檔案。
2. 先讀官方 [SoC Slurm guide](https://dochub.comp.nus.edu.sg/cf/guides/compute-cluster/slurm) 與 [Slurm Info](https://dochub.comp.nus.edu.sg/cf/guides/compute-cluster/slurm-info)。讀不到時，直接在叢集上查：

```bash
sinfo -o '%P %l %a %G'                    # 分割區、時限、GPU 種類
sinfo -N -o '%N %P %G %T' | sort -u       # 每個節點的分割區、GPU、狀態
squeue -u "$USER"
```

3. login node 只用來跑 `git`、`sbatch`、`squeue`、`sacct`。不要在上面 import PyTorch 或訓練：2026-11 時 login node 的虛擬記憶體上限是 1 GiB，`import torch` 會失敗。要測 GPU 程式就用 `salloc` 或 `srun` 拿一個計算節點。

## 2) 程式與 log 怎麼在本機和 SoC 之間移動

以 Git 當唯一通道，AI 助手不直接登入叢集：

- **程式 → SoC**：本機 commit、推到 `main`，SoC 上 `git pull --ff-only`。已經在跑的 job 用的是它開始時的程式，log 第一行應印出 `commit=`。
- **log → 助手**：在 SoC 上 commit `slurm-*.out` 並 push；助手 `git fetch` 後讀檔。數字已經寫進研究筆記的舊 log 可以 `git rm`，並記下取回指令 `git show <commit>:<檔名>`。
- **SoC 上 push 被拒（`fetch first`）或 pull 出現 divergent branches**：先 `git log --oneline origin/main..HEAD` 看本地多了什麼，再 `git pull --rebase`、`git push`。不要 force push。
- **給使用者指令時不要留 `<JOBID>` 這種佔位字。**bash 會把 `<JOBID>` 當成輸入重新導向，回報 `JOBID: No such file or directory`。改成能自己找值的寫法：

```bash
f=$(ls -t slurm-*.out | head -1); echo "$f"; grep -v "Requirement already" "$f" | tail -20
```

## 3) 批次腳本的寫法

- 一個訓練流程只用一支可選階段的 `run.sbatch`，用環境變數選模型與階段（例如 `MODEL=`、`STAGE=`、`RUN_NAME=`），以 `sbatch --export=ALL run.sbatch` 提交。實作放在可重用的 Python 入口，腳本只做編排。
- `#SBATCH` 指令緊接在 shebang 後；Slurm 不展開裡面的 shell 變數。`--output` 的目錄要在提交前存在。
- 腳本一開始就印出 `job=`、`commit=`、模型、階段、run 名稱；讀任何數字之前先看這一行。
- 在昂貴的工作之前驗證輸入與設定值，不合法就 `exit 2`。run 目錄已有 checkpoint 就續訓；有目錄但沒有 checkpoint 就拒絕，不要從頭覆蓋。
- 訓練程式在建立輸出目錄**之前**檢查 `torch.cuda.is_available()`，這樣節點壞掉時不會留下半成品，同一個 run 名稱可以直接重送。
- **同時跑好幾個 job**：每個模型各送一個 job，用只訓練的階段（例如 `STAGE=train`）。會準備資料的階段（`all`、`prepare`）讓每個 job 同時寫同一份資料，沒有鎖保護。每個 job 各佔一張 GPU，先確認配額。
- 用 `--job-name=<專案>-<模型>` 讓 log 檔名能分辨模型。

## 4) 監看與判讀

```bash
squeue -u "$USER"
sacct -u "$USER" -S today --format=JobID%12,JobName%15,State,ExitCode,Elapsed,NodeList%10
```

- `NodeList` 告訴你每個 job 落在哪台節點；把失敗與成功的 job 放在一起比，最快看出是不是節點問題。
- 從佇列消失不代表成功：讀 log、分清 `TIMEOUT` 與 `COMPLETED`、確認預期的產物（checkpoint、指標檔）存在，才回報結果。
- validation 用來選模型，held-out test 只在定案後跑一次；每個數字都記下 job ID、commit 與 run 名稱。

## 5) 疑難排解

### job 幾秒就結束：`CUDA unknown error` → `CUDA is unavailable`

log 會出現 PyTorch 警告 `CUDA initialization: CUDA unknown error`，接著程式報 `CUDA is unavailable`，最後一行 `srun: error: <節點>: task 0: Exited with exit code 2`。

- 這是節點的問題，不是程式。2026-11-19 在 `xgpe2`、`xgpe4`、`xgpe6`（`gpu:nv:1`）連續發生，同時間 `xgpf11` 上的 job 正常訓練。
- **陷阱：壞節點在 `sinfo` 上看起來是 `idle`。**每個 job 一上去就死，所以它永遠閒著，Slurm 又優先把新 job 派給閒置節點。一次只排除一台，job 只會換到下一台壞掉的同型節點；要排除整組。
- **陷阱：`--exclude` 只能列存在的節點。**`--exclude='xgpe[0-6]'` 因為 `xgpe5` 不存在而被拒絕（`Invalid node name specified`）。先用 `sinfo -N` 列出實際節點，再寫成 `--exclude='xgpe[0-4,6]'`。
- 也可以直接指定 GPU 種類，例如 `--gpus=a100-40:1`（種類看 `sinfo` 的 `GRES` 欄，先確認該分割區有）。

### 舊 GPU 出現 `no kernel image is available`

TITAN V（sm_70）這類舊卡不被新版 CUDA 13 的 PyTorch build 支援。安裝時明確指定 CUDA 12.6 的版本與套件來源，例如 `torch==2.7.1+cu126` 搭配 `--extra-index-url https://download.pytorch.org/whl/cu126`，並把同一條指令寫在 requirements 註解與批次腳本裡。

### 其他

- **排隊太久**：看 `squeue`、`scontrol show job <id>`、要求的資源與分割區狀態，再決定要不要改資源。
- **失敗或 OOM**：把 `sacct` 的狀態、exit code、`MaxRSS` 和 log 一起看，分清記憶體不足、Python 例外、缺資料、超時與套件錯誤。
- **pip 或 git 遇到 `/tmp` 配額**：先把 `TMPDIR` 設到可寫的專案目錄再重試；只加 `--no-cache-dir` 不會移動暫存目錄。
- **沒有 log**：確認 job 真的開始了，以及 `--output` 解析到哪裡。

## 6) 規則

- 準備或審查腳本不等於可以送 job。提交、取消、修改 job 都要使用者明確要求；通常由助手給出完整指令、使用者自己執行。
- 不為了能提交而擅自 push 程式或公開資料。
- 原始資料、checkpoint、快取放在允許的持久檔案系統，不進 Git；只有小的 Slurm log 會被 commit。
- 單一行程的訓練多要 GPU 沒有好處。除非工作需要，不要指定特定節點；優先排除已知壞掉的節點。

參考：[Slurm `sbatch` 手冊](https://slurm.schedmd.com/sbatch.html)。
