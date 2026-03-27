/* ─────────────────────────────────────────────────────────────────
   SYSTEM DESIGN FOR AI/ML ROADMAP DATA
   ───────────────────────────────────────────────────────────────── */

export const STORAGE_KEY = 'dp_sysdesign_checks_v1'

export function loadChecks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
  catch { return {} }
}

export function saveChecks(checks) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checks)) } catch {}
}

export function itemId(sectionId, subLabel, itemIdx) {
  return `${sectionId}_${subLabel.replace(/\s+/g, '_')}_${itemIdx}`
}

// 3-state toggle: 0 (none/red) → 1 (in-progress/orange) → 2 (done/green) → 0
export function cycleState(current) {
  const n = current === true ? 2 : (Number(current) || 0)
  return (n + 1) % 3
}

export function normalizeState(val) {
  if (val === true) return 2
  if (val === false || val === undefined || val === null) return 0
  return Number(val) || 0
}

export function isDone(val) { return normalizeState(val) === 2 }

export const STATE_COLORS = {
  0: { bg: 'rgba(220,38,38,0.12)',  border: '#dc2626', text: '#dc2626',  label: '✕', tip: 'Not started' },
  1: { bg: 'rgba(234,88,12,0.12)',  border: '#ea580c', text: '#ea580c',  label: '~', tip: 'In progress'  },
  2: { bg: 'rgba(22,163,74,0.12)',  border: '#16a34a', text: '#16a34a',  label: '✓', tip: 'Done'         },
}

export const SECTIONS = [
  {
    id: 'sd1',
    icon: '🏗️',
    title: 'ML System Design Fundamentals',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.1)',
    subsections: [
      {
        label: 'Design Framework & Process',
        items: [
          'ML system design interview framework (problem → metrics → architecture → deep dive)',
          'Functional vs non-functional requirements gathering for ML systems',
          'Online vs offline architecture tradeoffs',
          'Latency vs throughput optimization strategies',
          'System design diagram conventions for ML pipelines',
          'End-to-end ML lifecycle (data → train → evaluate → deploy → monitor)',
          'Choosing metrics: business metrics vs ML metrics vs system metrics',
          'Handling scale: horizontal vs vertical scaling for ML workloads',
        ],
      },
      {
        label: 'Data Layer Design',
        items: [
          'Feature stores (Feast, Tecton) — architecture and use cases',
          'Data lakes vs data warehouses for ML workloads',
          'Data versioning tools (DVC, LakeFS)',
          'Schema evolution and backward compatibility',
          'Data quality pipelines (Great Expectations, Deequ)',
          'Handling data skew and distribution shift in production',
          'Training/serving data consistency (train-serve skew)',
          'Data sampling strategies for large-scale ML',
        ],
      },
      {
        label: 'Model Serving Patterns',
        items: [
          'Online prediction serving (REST APIs, gRPC endpoints)',
          'Batch prediction (Spark, Airflow-based pipelines)',
          'Streaming prediction (Kafka Streams, Flink)',
          'Model servers (TorchServe, Triton Inference Server, TF Serving)',
          'Model packaging (ONNX, Docker containers, model artifacts)',
          'Shadow deployment and canary rollout strategies',
          'A/B testing infrastructure for model deployment',
          'Blue-green deployment for ML models',
        ],
      },
      {
        label: 'Experimentation & A/B Testing',
        items: [
          'A/B testing frameworks for ML models',
          'Multi-armed bandit approaches for model selection',
          'Interleaving experiments for ranking models',
          'Holdout groups and long-term effect measurement',
          'Feature flags for ML rollouts',
          'Statistical significance and sample size calculation',
        ],
      },
    ],
  },
  {
    id: 'sd2',
    icon: '📚',
    title: 'RAG System Design',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    subsections: [
      {
        label: 'Core RAG Architecture',
        items: [
          'Basic RAG pipeline (retrieve → augment → generate)',
          'Document ingestion pipeline design',
          'Chunking strategies (fixed-size, semantic, recursive, document-aware)',
          'Embedding model selection (OpenAI, Cohere, open-source)',
          'Vector databases (Pinecone, Weaviate, Qdrant, Milvus, ChromaDB)',
          'Hybrid search (dense embeddings + sparse BM25)',
          'Metadata filtering and pre-retrieval optimization',
          'Index types (flat, IVF, HNSW) and tradeoffs',
        ],
      },
      {
        label: 'Advanced RAG Patterns',
        items: [
          'Query transformation (HyDE — Hypothetical Document Embeddings)',
          'Query decomposition for complex multi-part questions',
          'Re-ranking with cross-encoders and ColBERT',
          'Multi-hop RAG for multi-step reasoning',
          'Parent-child retrieval (small chunks for retrieval, large for context)',
          'Contextual compression of retrieved documents',
          'Self-RAG (self-reflective retrieval-augmented generation)',
          'Corrective RAG (CRAG — verify and correct retrieval)',
          'Graph RAG (knowledge graph + vector retrieval)',
          'Agentic RAG (tool-using retrieval agents)',
        ],
      },
      {
        label: 'Production RAG at Scale',
        items: [
          'RAG evaluation frameworks (RAGAS, DeepEval, TruLens)',
          'Caching strategies for RAG (semantic cache, exact match)',
          'Multi-tenant RAG architecture design',
          'Incremental index updates (add/delete/update documents)',
          'Cost optimization (embedding costs, LLM token usage)',
          'Hallucination detection and mitigation in RAG',
          'Citation and source attribution design',
          'RAG vs fine-tuning decision framework',
        ],
      },
    ],
  },
  {
    id: 'sd3',
    icon: '⚡',
    title: 'LLM Serving & Inference Optimization',
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.1)',
    subsections: [
      {
        label: 'LLM Serving Architecture',
        items: [
          'vLLM architecture and PagedAttention mechanism',
          'Text Generation Inference (TGI) by HuggingFace',
          'TensorRT-LLM for NVIDIA GPU optimization',
          'KV-cache management and memory optimization',
          'Continuous batching vs static batching',
          'Multi-GPU serving (tensor parallelism, pipeline parallelism)',
          'Speculative decoding for faster inference',
          'Streaming token generation (SSE, WebSocket)',
        ],
      },
      {
        label: 'Optimization Techniques',
        items: [
          'Quantization methods (GPTQ, AWQ, GGUF, bitsandbytes)',
          'Knowledge distillation for smaller models',
          'Pruning (structured vs unstructured)',
          'Flash Attention and memory-efficient attention',
          'ONNX Runtime and TensorRT optimization',
          'Prefix caching for repeated prompt prefixes',
          'Prompt compression techniques',
          'Dynamic batching and request scheduling',
        ],
      },
      {
        label: 'Scaling & Cost',
        items: [
          'GPU cluster management for LLM serving',
          'Auto-scaling policies for LLM endpoints',
          'Rate limiting and request queuing strategies',
          'Cost optimization via model routing and cascading',
          'Serverless LLM deployment (Lambda, Cloud Functions)',
          'Multi-model serving on shared infrastructure',
          'Token-based billing and cost tracking',
          'Latency optimization (P50, P95, P99 targets)',
        ],
      },
    ],
  },
  {
    id: 'sd4',
    icon: '🤝',
    title: 'Multi-Agent System Design',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.1)',
    subsections: [
      {
        label: 'Agent Architecture Patterns',
        items: [
          'Single-agent loops (ReAct pattern: reason → act → observe)',
          'Plan-and-execute agent architecture',
          'Multi-agent orchestration patterns (supervisor, swarm, hierarchical)',
          'Agent-as-tool composition',
          'Memory systems (short-term, long-term, episodic)',
          'Tool/function calling design and schema',
          'Framework comparison (LangGraph, CrewAI, AutoGen, Semantic Kernel)',
          'State management in agent workflows',
        ],
      },
      {
        label: 'Production Agent Systems',
        items: [
          'Reliability patterns (retries, timeouts, circuit breakers)',
          'Human-in-the-loop approval workflows',
          'Observability and tracing (LangSmith, Arize Phoenix)',
          'Agent evaluation and benchmarking',
          'Guardrails for agent actions (input/output validation)',
          'Cost control and token budget management',
          'Error recovery and graceful degradation',
          'Sandboxing agent code execution',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Customer support agent with tool access',
          'Design: Code generation and review agent',
          'Design: Research agent with web search',
          'Design: Data analysis agent with SQL/Python',
          'Design: Document processing and extraction pipeline',
          'Design: Multi-agent debate/consensus system',
        ],
      },
    ],
  },
  {
    id: 'sd5',
    icon: '🎯',
    title: 'Recommendation Systems',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.1)',
    subsections: [
      {
        label: 'Retrieval Stage',
        items: [
          'Collaborative filtering (user-based, item-based, matrix factorization)',
          'Two-tower model architecture (user tower + item tower)',
          'Approximate Nearest Neighbor search (FAISS, ScaNN)',
          'Multi-source candidate blending and deduplication',
          'Cold-start problem solutions (content-based, popularity, exploration)',
          'Session-based recommendations (GRU4Rec, BERT4Rec)',
          'Sequential recommendation models',
          'Knowledge graph-based recommendations',
        ],
      },
      {
        label: 'Ranking Stage',
        items: [
          'Learning-to-rank: pointwise, pairwise, listwise approaches',
          'Deep ranking models (Wide & Deep, DeepFM, DCN)',
          'Multi-objective ranking (engagement + diversity + freshness)',
          'Position bias correction in ranking',
          'Diversity and novelty in recommendations',
          'Feature engineering for recommendation ranking',
          'Real-time feature computation for ranking',
          'Calibration of recommendation scores',
        ],
      },
      {
        label: 'System Architecture',
        items: [
          'End-to-end recommendation pipeline at scale',
          'Real-time recommendation updates',
          'A/B testing for recommendation systems',
          'Feedback loops and popularity bias mitigation',
          'Explainable recommendations',
          'Design: YouTube-style video recommendation system',
          'Design: E-commerce product recommendation engine',
          'Design: News feed personalization system',
        ],
      },
    ],
  },
  {
    id: 'sd6',
    icon: '🔍',
    title: 'Search & Ranking Systems',
    color: '#059669',
    bg: 'rgba(5,150,105,0.1)',
    subsections: [
      {
        label: 'Search Architecture',
        items: [
          'Inverted index design and implementation',
          'Query understanding (spell correction, query expansion, intent classification)',
          'Semantic search with bi-encoders and cross-encoders',
          'Hybrid search (lexical + semantic fusion)',
          'Search result diversification',
          'Autocomplete and query suggestion systems',
          'Faceted search and filtering',
          'Multi-modal search (text + image)',
        ],
      },
      {
        label: 'Ranking & Relevance',
        items: [
          'Learning-to-rank for search (LambdaMART, LambdaRank)',
          'Click models for implicit feedback',
          'Evaluation metrics (NDCG, MRR, MAP, precision@k)',
          'Personalized search ranking',
          'Query-document relevance scoring',
          'Search quality monitoring and alerting',
          'Online vs offline evaluation for search',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Web-scale search engine (simplified Google)',
          'Design: Enterprise document search system',
          'Design: E-commerce product search with filters',
          'Design: Code search engine (simplified GitHub search)',
          'Design: Multi-language search system',
        ],
      },
    ],
  },
  {
    id: 'sd7',
    icon: '💬',
    title: 'Conversational AI & Chatbot Architecture',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    subsections: [
      {
        label: 'Chatbot System Design',
        items: [
          'Multi-turn conversation management and state tracking',
          'Conversation memory design (buffer, summary, vector)',
          'Intent classification and entity extraction',
          'Dialog policy and response generation',
          'Human handoff escalation design',
          'Multi-channel deployment (web, mobile, Slack, Teams)',
          'Session management and user identification',
        ],
      },
      {
        label: 'Enterprise Patterns',
        items: [
          'Knowledge-grounded chatbot (RAG + conversation)',
          'Task-oriented dialog systems',
          'Guardrails and content moderation for chatbots',
          'Conversation analytics and dashboards',
          'Personalization and user preference tracking',
          'Multi-language chatbot architecture',
          'Fallback and disambiguation strategies',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Customer support chatbot with knowledge base',
          'Design: Knowledge base Q&A bot for enterprises',
          'Design: Voice assistant backend architecture',
          'Design: Coding assistant architecture (Copilot-style)',
          'Design: Internal helpdesk automation bot',
        ],
      },
    ],
  },
  {
    id: 'sd8',
    icon: '🔧',
    title: 'Fine-Tuning Pipelines at Scale',
    color: '#b45309',
    bg: 'rgba(180,83,9,0.1)',
    subsections: [
      {
        label: 'Fine-Tuning Approaches',
        items: [
          'Full fine-tuning vs parameter-efficient fine-tuning (PEFT)',
          'LoRA (Low-Rank Adaptation) architecture and implementation',
          'QLoRA (Quantized LoRA) for memory-efficient fine-tuning',
          'DoRA (Weight-Decomposed Low-Rank Adaptation)',
          'Instruction tuning and data formatting',
          'RLHF (Reinforcement Learning from Human Feedback) pipeline',
          'DPO (Direct Preference Optimization) — simpler alternative to RLHF',
          'Data preparation and quality for fine-tuning',
          'Hyperparameter tuning for fine-tuning jobs',
          'Continual learning and catastrophic forgetting prevention',
        ],
      },
      {
        label: 'Infrastructure',
        items: [
          'Distributed training (FSDP, DeepSpeed ZeRO stages)',
          'GPU orchestration and multi-node training',
          'Training data pipelines (streaming, preprocessing)',
          'Experiment tracking (W&B, MLflow, Neptune)',
          'Checkpointing and training resumption',
          'Cost estimation for fine-tuning jobs (GPU hours, cloud costs)',
          'Mixed precision training (FP16, BF16)',
          'Gradient accumulation and effective batch size',
        ],
      },
      {
        label: 'Evaluation & Deployment',
        items: [
          'Benchmark evaluation (MMLU, HumanEval, MT-Bench)',
          'Human evaluation pipelines for fine-tuned models',
          'Fine-tuned vs base model A/B comparison',
          'Model merging techniques (TIES, DARE, SLERP)',
          'LoRA adapter serving (multiple adapters, dynamic loading)',
          'When to fine-tune vs RAG vs prompting (decision framework)',
          'Fine-tuning for domain adaptation vs task-specific behavior',
        ],
      },
    ],
  },
  {
    id: 'sd9',
    icon: '⏱️',
    title: 'Real-Time ML Systems',
    color: '#0d9488',
    bg: 'rgba(13,148,136,0.1)',
    subsections: [
      {
        label: 'Streaming Architecture',
        items: [
          'Kafka Streams for real-time ML feature computation',
          'Apache Flink for stateful stream processing',
          'Spark Structured Streaming for ML pipelines',
          'Online feature stores (Feast online, Redis, DynamoDB)',
          'Event-driven ML architecture patterns',
          'Lambda vs Kappa architecture for ML',
          'Stream-batch unification (Apache Beam, Flink)',
          'Exactly-once semantics in ML pipelines',
        ],
      },
      {
        label: 'Online Learning',
        items: [
          'Incremental/online learning algorithms',
          'Multi-armed bandits (epsilon-greedy, UCB, Thompson sampling)',
          'Contextual bandits for personalization',
          'Retraining triggers and schedules',
          'Concept drift detection methods (DDM, ADWIN, PSI)',
          'Online model evaluation and monitoring',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Real-time fraud detection system',
          'Design: Dynamic pricing engine',
          'Design: Real-time content moderation pipeline',
          'Design: Live feed personalization system',
          'Design: Anomaly detection for infrastructure monitoring',
          'Design: Real-time bidding (RTB) system for ads',
        ],
      },
    ],
  },
  {
    id: 'sd10',
    icon: '👁️',
    title: 'Computer Vision Systems',
    color: '#9333ea',
    bg: 'rgba(147,51,234,0.1)',
    subsections: [
      {
        label: 'CV Pipeline Architecture',
        items: [
          'Image preprocessing and augmentation pipelines',
          'Object detection at scale (YOLO, DETR, serving patterns)',
          'Image classification serving (batch vs real-time)',
          'Video processing and frame extraction pipelines',
          'Multi-model vision pipelines (detect → classify → extract)',
          'Edge deployment for vision models (TFLite, CoreML, ONNX)',
          'GPU-optimized image processing (NVIDIA DALI)',
        ],
      },
      {
        label: 'Production CV',
        items: [
          'Image and video storage architecture (S3, CDN)',
          'Active learning for labeling prioritization',
          'Labeling pipelines and annotation tools',
          'Model versioning for vision models',
          'Evaluation metrics (mAP, IoU, precision-recall curves)',
          'Data augmentation strategies for production',
          'Handling class imbalance in vision datasets',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Content moderation system (images + video)',
          'Design: Cashierless checkout (Amazon Go-style)',
          'Design: Document OCR and information extraction pipeline',
          'Design: Visual search engine (image-to-image similarity)',
          'Design: Video surveillance and event detection system',
          'Design: Medical image analysis pipeline',
        ],
      },
    ],
  },
  {
    id: 'sd11',
    icon: '📝',
    title: 'NLP Systems (Pre-GenAI)',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.1)',
    subsections: [
      {
        label: 'Core NLP Pipelines',
        items: [
          'Text classification system design (multi-class, multi-label)',
          'Named Entity Recognition (NER) at scale',
          'Text preprocessing pipelines (tokenization, normalization)',
          'Word embeddings (Word2Vec, GloVe) and contextual embeddings (BERT)',
          'Multi-language NLP system design',
          'Text similarity and deduplication systems',
          'Topic modeling at scale (LDA, BERTopic)',
          'Text summarization pipelines (extractive vs abstractive)',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Sentiment analysis system at scale',
          'Design: Spam/abuse detection pipeline',
          'Design: Entity extraction and linking system',
          'Design: Document classification and routing system',
          'Design: Machine translation service',
          'Design: Autocomplete and text prediction system',
        ],
      },
    ],
  },
  {
    id: 'sd12',
    icon: '🔄',
    title: 'MLOps & Model Lifecycle',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.1)',
    subsections: [
      {
        label: 'CI/CD for ML',
        items: [
          'ML pipeline orchestration (Airflow, Kubeflow Pipelines, Prefect)',
          'Model registry design (MLflow, Vertex AI, SageMaker)',
          'Automated training pipelines (trigger → train → evaluate → deploy)',
          'Data validation in CI/CD (schema checks, drift detection)',
          'Feature pipeline CI/CD (feature store integration)',
          'Infrastructure as Code for ML (Terraform, Pulumi)',
          'Testing strategies for ML code (unit, integration, data tests)',
        ],
      },
      {
        label: 'Monitoring & Observability',
        items: [
          'Data drift detection (KL divergence, PSI, Wasserstein)',
          'Model performance monitoring dashboards',
          'Prediction logging and audit trails',
          'Alerting on model degradation (accuracy drops, latency spikes)',
          'ML observability platforms (Arize, WhyLabs, Evidently)',
          'Feature importance monitoring in production',
          'A/B test result monitoring and analysis',
        ],
      },
      {
        label: 'Governance',
        items: [
          'Model lineage and provenance tracking',
          'Model cards and documentation standards',
          'Bias and fairness auditing for ML models',
          'GDPR/privacy compliance for ML systems',
          'Model approval workflows (staging → production)',
          'Cost tracking and resource allocation for ML workloads',
          'Reproducibility and experiment tracking',
        ],
      },
    ],
  },
  {
    id: 'sd13',
    icon: '🔀',
    title: 'Data Pipelines at Scale',
    color: '#ca8a04',
    bg: 'rgba(202,138,4,0.1)',
    subsections: [
      {
        label: 'Batch Pipelines',
        items: [
          'ETL vs ELT patterns for ML data preparation',
          'Apache Spark for large-scale data processing',
          'Data partitioning strategies (Parquet, Delta Lake, Iceberg)',
          'Idempotent pipeline design (rerunnable without side effects)',
          'Backfill strategies for historical data reprocessing',
          'Data lineage tracking (OpenLineage, Marquez)',
          'Handling late-arriving data in batch pipelines',
        ],
      },
      {
        label: 'Real-Time Pipelines',
        items: [
          'Kafka-based data ingestion architecture',
          'Change Data Capture (CDC) for real-time features',
          'Stream processing for ML features (Flink, Kafka Streams)',
          'Real-time data quality validation',
          'Schema registry and schema evolution in streams',
          'Exactly-once delivery guarantees',
          'Backpressure handling in streaming systems',
        ],
      },
      {
        label: 'Design Exercises',
        items: [
          'Design: Data platform for ML teams',
          'Design: Large-scale training data pipeline (TB-scale)',
          'Design: Real-time event processing system',
          'Design: Feature engineering platform',
          'Design: Data lake architecture for ML workloads',
        ],
      },
    ],
  },
  {
    id: 'sd14',
    icon: '🚀',
    title: 'GenAI Application Architecture',
    color: '#e11d48',
    bg: 'rgba(225,29,72,0.1)',
    subsections: [
      {
        label: 'Application Patterns',
        items: [
          'LLM gateway/proxy design (routing, caching, rate limiting)',
          'Prompt management system (versioning, templates, A/B testing)',
          'Output evaluation and quality scoring pipeline',
          'Structured data extraction from LLM outputs',
          'Multi-model routing (cost vs quality optimization)',
          'Fallback chains and graceful degradation',
          'Streaming response architecture (SSE, chunked transfer)',
        ],
      },
      {
        label: 'Complex Architectures',
        items: [
          'Design: AI code review system',
          'Design: Document summarization platform',
          'Design: Content generation platform (multi-format)',
          'Design: Multi-modal AI application (text + image + audio)',
          'Design: Automated data extraction pipeline',
          'Design: LLM workflow automation engine',
          'Design: AI-powered search with answer generation',
        ],
      },
      {
        label: 'Operational Concerns',
        items: [
          'Cost monitoring and optimization for LLM applications',
          'Prompt injection prevention and input sanitization',
          'Content safety and output filtering',
          'Response caching strategies (semantic, exact)',
          'Observability for LLM applications (traces, logs, metrics)',
          'SLA design for AI-powered features',
          'Graceful degradation when LLM providers have outages',
          'Multi-provider strategy (OpenAI, Anthropic, open-source)',
        ],
      },
    ],
  },
  {
    id: 'sd15',
    icon: '🎓',
    title: 'Interview Patterns & Estimation',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    subsections: [
      {
        label: 'Interview Framework',
        items: [
          'Structured approach: clarify → metrics → architecture → deep dive → scale',
          'Gathering and prioritizing requirements (functional vs non-functional)',
          'Choosing the right ML metrics for the problem',
          'Drawing clear architecture diagrams under time pressure',
          'Deep-dive design of a chosen component',
          'Scaling discussion (10x, 100x growth scenarios)',
          'Trade-off analysis (latency vs accuracy, cost vs quality)',
          'Communicating uncertainty and assumptions clearly',
        ],
      },
      {
        label: 'Capacity Planning & Estimation',
        items: [
          'QPS estimation for ML serving endpoints',
          'GPU memory estimation (model size, batch size, KV-cache)',
          'Storage estimation (embeddings, features, logs)',
          'Training cost estimation (GPU hours, cloud pricing)',
          'Embedding storage and index size calculation',
          'Cache sizing for prediction caching',
          'Network bandwidth estimation for model serving',
          'Cost-per-prediction analysis',
        ],
      },
      {
        label: 'Common Interview Questions',
        items: [
          'Design: Notification relevance ranking system',
          'Design: Fraud detection system (real-time + batch)',
          'Design: Content feed ranking (Twitter/Instagram-style)',
          'Design: Ad click prediction system',
          'Design: Ride ETA prediction (Uber/Lyft-style)',
          'Design: Search autocomplete with ML',
          'Design: Image moderation at scale',
          'Design: Email spam classifier',
          'Design: Music recommendation system (Spotify-style)',
        ],
      },
      {
        label: 'Debugging & Incidents',
        items: [
          'ML debugging workflow (data → features → model → serving)',
          'Handling model performance degradation in production',
          'Root cause analysis for ML system failures',
          'Rollback strategies for ML models',
          'Post-mortem template for ML incidents',
          'Common failure modes in ML systems and how to prevent them',
        ],
      },
    ],
  },
]
