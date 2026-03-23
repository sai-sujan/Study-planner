# Project Stories & Architecture Deep Dive

> Sujan Dora | AI Engineer
> Use this document to prepare for behavioral and technical deep-dive interview questions.
> Everything is written in first person so you can practice telling these stories out loud.

---

## PROJECT 1: Multi-Agent AI System (Compass Group)

**Role:** AI Engineer | **Duration:** January 2025 - Present | **Location:** Springfield, USA

---

### The Story (Tell it like this in interviews)

"At Compass Group, I walked into a situation where operational teams -- people handling menus, scheduling, inventory -- were drowning in repetitive requests. Cafeteria managers needed to check what was on the menu for Tuesday, warehouse staff wanted to know if chicken breast was in stock, schedulers needed to find shift coverage. All of this was going through a centralized support team, and it was slow and expensive.

I proposed building a multi-agent AI system. The idea was simple: instead of one monolithic chatbot that tries to do everything badly, we would build specialized agents -- a menu agent, a scheduling agent, an inventory agent, and a general support agent -- and have an orchestrator figure out which agent should handle each request.

I chose LangGraph for the orchestration because we needed stateful, graph-based workflows. Each agent needed to maintain context across multiple tool calls -- for example, if someone asked 'Is the chicken from Tuesday's menu available in inventory?', that query touches the menu agent first, then the inventory agent. LangGraph's state management made this kind of multi-step routing natural.

For knowledge retrieval, I built RAG pipelines with both FAISS and ChromaDB. FAISS handled the high-throughput, read-heavy collections like menu items and SOPs, while ChromaDB handled collections that changed more frequently, like inventory docs, because ChromaDB's update and delete operations were simpler to work with. I integrated MCP servers so agents could also call live APIs -- pulling real-time inventory levels or current shift schedules rather than relying only on indexed documents.

One of the bigger challenges was retrieval quality. Enterprise food service documents are full of domain-specific jargon -- terms like 'LTO' for limited-time offer, 'cover count' for number of guests served, 'par level' for minimum inventory thresholds. Standard embedding models struggled with these. So I fine-tuned domain-specific LLMs using LoRA and QLoRA, which improved task-specific accuracy by 28% while keeping compute costs 40% lower than full fine-tuning would have been.

The system ended up reducing manual support overhead by 40%. That translated to the support team being able to focus on genuinely complex issues instead of answering the same questions about Tuesday's lunch menu fifty times a day."

---

### Architecture Diagram (ASCII)

```
                                    MULTI-AGENT AI SYSTEM - COMPASS GROUP
                                    =====================================

    +------------------+
    |   User Request   |
    | (Slack/Web/API)  |
    +--------+---------+
             |
             v
    +--------+---------+
    |   API Gateway    |
    |   (FastAPI)      |
    +--------+---------+
             |
             v
    +--------+------------------------------------------+
    |            LangGraph Orchestrator                  |
    |                                                    |
    |  +------------+    +-----------+    +-----------+  |
    |  |  Intent    |--->|  Router   |--->|  State    |  |
    |  | Classifier |    |  (Cond.   |    | Manager   |  |
    |  |            |    |   Edges)  |    |           |  |
    |  +------------+    +-----+-----+    +-----------+  |
    |                          |                         |
    +-----+----------+---------+---------+----------+----+
          |          |                   |          |
          v          v                   v          v
    +-----+----+  +--+-------+  +-------+---+  +--+--------+
    |  Menu    |  |Scheduling|  | Inventory  |  |  Support  |
    |  Agent   |  |  Agent   |  |   Agent    |  |  Agent    |
    +-----+----+  +--+-------+  +-------+---+  +--+--------+
          |          |                   |          |
          |          |                   |          |
    +-----+----------+---------+---------+----------+----+
    |                   Tool Layer                        |
    |                                                     |
    |  +-------------+  +-------------+  +-------------+  |
    |  | MCP Server  |  | MCP Server  |  | MCP Server  |  |
    |  |   (Menu)    |  | (Schedule)  |  | (Inventory) |  |
    |  +------+------+  +------+------+  +------+------+  |
    |         |                |                |          |
    +-----+---+----------------+----------------+---+------+
          |                    |                    |
          v                    v                    v
    +-----+------+  +---------+------+  +---------+------+
    | Menu API   |  | Scheduling API |  | Inventory API  |
    | (External) |  |  (External)    |  |  (External)    |
    +------------+  +----------------+  +----------------+


    +================================================================+
    |                     RAG PIPELINE (Detail)                       |
    |                                                                 |
    |  +-----------+    +------------+    +------------+              |
    |  | Documents |    | Semantic   |    | Embedding  |              |
    |  | (Menus,   |--->| Chunking   |--->| Generation |              |
    |  |  SOPs,    |    | (variable  |    | (BGE /     |              |
    |  |  Manuals) |    |  size by   |    |  E5-large) |              |
    |  +-----------+    |  meaning)  |    +-----+------+              |
    |                   +------------+          |                     |
    |                                           v                     |
    |                              +------------+------------+        |
    |                              |                         |        |
    |                              v                         v        |
    |                       +------+------+          +------+------+  |
    |                       |    FAISS    |          |  ChromaDB   |  |
    |                       | (Static:   |          | (Dynamic:   |  |
    |                       |  menus,    |          |  inventory, |  |
    |                       |  SOPs)     |          |  schedules) |  |
    |                       +------+------+          +------+------+  |
    |                              |                         |        |
    |                              +------------+------------+        |
    |                                           |                     |
    |                                           v                     |
    |                                    +------+------+              |
    |                                    |   Hybrid    |              |
    |                                    |   Search    |              |
    |                                    | (Dense +    |              |
    |                                    |  Sparse)    |              |
    |                                    +------+------+              |
    |                                           |                     |
    |                                           v                     |
    |                                    +------+------+              |
    |                                    |  Re-Ranker  |              |
    |                                    | (Cross-     |              |
    |                                    |  Encoder)   |              |
    |                                    +------+------+              |
    |                                           |                     |
    |                                           v                     |
    |                                    +------+------+              |
    |                                    | Fine-Tuned  |              |
    |                                    |    LLM      |              |
    |                                    | (LoRA /     |              |
    |                                    |  QLoRA)     |              |
    |                                    +------+------+              |
    |                                           |                     |
    |                                           v                     |
    |                                    +------+------+              |
    |                                    |  Response   |              |
    |                                    +-------------+              |
    +================================================================+
```

---

### Technical Deep Dive

#### LangGraph Multi-Agent Orchestration

**How the graph was structured:**

The core idea is that the LangGraph StateGraph defines nodes (agents and utility functions) connected by edges (transitions). The orchestrator node classifies intent and routes to the appropriate specialized agent. Each agent is a subgraph that can invoke tools, call RAG, and update the shared state.

**State Schema:**

```python
from typing import TypedDict, Literal, Annotated, List, Optional
from langgraph.graph import MessagesState
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    current_agent: Optional[str]
    intent: Optional[str]
    context: Optional[dict]           # Retrieved RAG context
    tool_results: Optional[dict]      # Results from MCP tool calls
    retry_count: int
    requires_multi_agent: bool        # Flag for cross-agent queries
    agent_history: List[str]          # Track which agents have handled this
    final_response: Optional[str]
```

**Graph Definition:**

```python
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

def build_multi_agent_graph():
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("intent_classifier", classify_intent)
    graph.add_node("menu_agent", menu_agent_node)
    graph.add_node("scheduling_agent", scheduling_agent_node)
    graph.add_node("inventory_agent", inventory_agent_node)
    graph.add_node("support_agent", support_agent_node)
    graph.add_node("response_synthesizer", synthesize_response)
    graph.add_node("error_handler", handle_error)

    # Entry point
    graph.set_entry_point("intent_classifier")

    # Conditional routing from intent classifier
    graph.add_conditional_edges(
        "intent_classifier",
        route_to_agent,
        {
            "menu": "menu_agent",
            "scheduling": "scheduling_agent",
            "inventory": "inventory_agent",
            "support": "support_agent",
            "multi_intent": "menu_agent",  # Start with first detected intent
            "unclear": "support_agent",
        }
    )

    # Each agent can route to another agent or to response synthesis
    for agent_name in ["menu_agent", "scheduling_agent",
                       "inventory_agent", "support_agent"]:
        graph.add_conditional_edges(
            agent_name,
            check_if_done_or_handoff,
            {
                "done": "response_synthesizer",
                "handoff_menu": "menu_agent",
                "handoff_scheduling": "scheduling_agent",
                "handoff_inventory": "inventory_agent",
                "handoff_support": "support_agent",
                "error": "error_handler",
            }
        )

    graph.add_edge("response_synthesizer", END)
    graph.add_edge("error_handler", "support_agent")  # Fallback

    return graph.compile()
```

**Routing logic:**

The intent classifier uses the LLM with a structured output schema to classify the query into one or more intent categories. For multi-intent queries (e.g., "Is the chicken from Tuesday's menu in stock?"), it sets `requires_multi_agent = True` and routes through agents sequentially, with each agent's output becoming context for the next.

**Error handling and fallback:**

Every agent node is wrapped in a try/except. If an agent fails (API timeout, tool error, LLM refusal), the state's `retry_count` increments. After 2 retries, the query falls back to the general support agent, which can provide a best-effort answer or escalate to a human. The error handler logs the failure to our monitoring system so we can track failure patterns.

---

#### MCP Integration

**What MCP servers were built:**

I built three MCP servers, one per operational domain:

1. **Menu MCP Server** -- Tools: `get_menu_by_date`, `search_menu_items`, `get_nutritional_info`, `get_allergen_info`
2. **Scheduling MCP Server** -- Tools: `get_shift_schedule`, `find_available_staff`, `get_coverage_gaps`, `check_time_off_requests`
3. **Inventory MCP Server** -- Tools: `check_stock_level`, `get_par_levels`, `get_delivery_schedule`, `search_supplier_catalog`

**Transport type:** stdio for local development and testing, SSE (Server-Sent Events) for production deployment. SSE allowed us to run MCP servers as separate services behind a load balancer.

**Why MCP over direct function calling:**

Direct function calling ties tool definitions to a specific LLM provider's format. MCP gave us a provider-agnostic tool layer. When we experimented with swapping the underlying LLM (we tested OpenAI, Anthropic, and an Ollama-served open-source model), the MCP servers didn't need to change at all. The tool definitions, authentication, and execution logic all lived in the MCP server. We just needed to update the LLM client to speak MCP.

The other big advantage was separation of concerns. The team managing the scheduling API didn't need to know anything about LLMs. They exposed an MCP server with well-defined tools, and my orchestrator consumed them.

**Example MCP server structure:**

```python
# inventory_mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import httpx

server = Server("inventory-server")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="check_stock_level",
            description="Check current inventory stock level for a specific item. "
                        "Returns quantity on hand, par level, and reorder status.",
            inputSchema={
                "type": "object",
                "properties": {
                    "item_name": {
                        "type": "string",
                        "description": "Name of the inventory item (e.g., 'chicken breast')"
                    },
                    "location_id": {
                        "type": "string",
                        "description": "Facility location ID"
                    }
                },
                "required": ["item_name"]
            }
        ),
        Tool(
            name="get_par_levels",
            description="Get minimum stock par levels for items at a location.",
            inputSchema={
                "type": "object",
                "properties": {
                    "location_id": {"type": "string"},
                    "category": {"type": "string", "description": "Food category filter"}
                },
                "required": ["location_id"]
            }
        ),
        # ... more tools
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "check_stock_level":
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_API_BASE}/stock",
                params={
                    "item": arguments["item_name"],
                    "location": arguments.get("location_id", DEFAULT_LOCATION)
                },
                headers={"Authorization": f"Bearer {API_TOKEN}"}
            )
            data = response.json()
            return [TextContent(
                type="text",
                text=f"Item: {data['item_name']}\n"
                     f"On Hand: {data['quantity']} {data['unit']}\n"
                     f"Par Level: {data['par_level']} {data['unit']}\n"
                     f"Status: {'REORDER NEEDED' if data['quantity'] < data['par_level'] else 'OK'}"
            )]
    # ... handle other tools
```

---

#### RAG Pipeline

**Document types ingested:**

- Menu documents (PDFs, spreadsheets updated weekly)
- Standard Operating Procedures (SOPs) for food prep, safety, cleaning
- Inventory catalogs and supplier documentation
- Scheduling policies and shift rules
- Training manuals for new staff

**Chunking strategy -- semantic chunking:**

I used semantic chunking instead of fixed-size chunking because the documents varied wildly in structure. A menu PDF has short, dense entries (item name, description, allergens, price). An SOP might have multi-paragraph procedures. Fixed-size chunking at 512 tokens would either split a menu item across two chunks (bad) or bundle unrelated SOP steps together (also bad).

With semantic chunking, I used an embedding model to detect where the meaning shifts. I computed embeddings for each sentence, then measured cosine similarity between consecutive sentences. When similarity dropped below a threshold (I tuned this to 0.65 after experimentation), I placed a chunk boundary. This gave us chunks that were semantically coherent regardless of document structure.

Each chunk also got metadata: `source_file`, `document_type`, `section_heading`, `last_updated`, and `location_id` for multi-facility filtering.

**Why FAISS for some data and ChromaDB for other data:**

FAISS was the right choice for our static, read-heavy collections -- menus (updated weekly in a batch job) and SOPs (updated monthly). FAISS is extremely fast for similarity search and has low memory overhead, but its update and delete operations require rebuilding the index. That's fine when your data changes on a known schedule.

ChromaDB handled inventory and scheduling documents that changed throughout the day. ChromaDB supports incremental add/update/delete natively without a full re-index. The tradeoff is slightly higher query latency than FAISS, but for these collections the freshness of the data mattered more than shaving off a few milliseconds.

**Hybrid search implementation:**

For each query, I ran two retrieval paths in parallel:

1. Dense retrieval: embed the query with BGE-large-en-v1.5, search the vector index, get top-20 candidates
2. Sparse retrieval: BM25 keyword search over the same document collection, get top-20 candidates

I merged results using Reciprocal Rank Fusion (RRF):

```
RRF_score(doc) = sum(1 / (k + rank_in_list)) for each list containing doc
```

With k=60 (standard constant). This gives us a combined ranked list that benefits from both semantic understanding (dense) and exact keyword matching (sparse). The keyword matching was especially important for inventory queries where users would search by exact product codes or SKUs.

**Re-ranking step:**

After RRF fusion produced the top-20 merged candidates, I passed them through a cross-encoder re-ranker (BGE-reranker-v2-m3). The cross-encoder scores each (query, document) pair jointly, which is much more accurate than the bi-encoder similarity used in the initial retrieval. I took the top-5 after re-ranking and passed those as context to the LLM.

This two-stage approach (fast retrieval of many candidates, then accurate re-ranking of fewer candidates) is what got us the 10% retrieval accuracy improvement. The biggest gains came from queries with domain jargon where the dense retriever would miss relevant docs but the keyword search would catch them, and then the re-ranker would correctly prioritize the most relevant one.

**Real-time data handling:**

This was a key design decision. For data that changes in real-time (current inventory levels, today's schedule), we didn't use RAG at all. Instead, the agent used MCP tool calls to query live APIs. RAG was reserved for relatively stable reference data (SOPs, policies, menu descriptions). The router's job was partly to determine: "Does this query need live data or reference data?" If live, route to tool calling. If reference, route to RAG. If both, do tool calling first, then use RAG to add context.

---

#### Fine-Tuning

**Base model chosen and why:**

Mistral-7B-Instruct-v0.2. I chose it because: (a) 7B parameters is small enough to fine-tune on a single A100 GPU, (b) Mistral-7B has strong baseline performance on instruction-following tasks, and (c) the Apache 2.0 license allowed commercial use without restrictions, which mattered for a corporate deployment.

**Dataset preparation:**

I collected enterprise-specific training data from three sources:

1. Historical support tickets (about 2,000 real Q&A pairs, anonymized)
2. SME-generated examples: I worked with operations managers to write 500 ideal question-answer pairs using correct domain terminology
3. Synthetic augmentation: I used GPT-4 to generate variations of the SME examples, producing another 1,500 pairs. Each synthetic example was reviewed for quality.

Total training set: approximately 4,000 instruction-response pairs. Validation set: 400 held-out examples.

**LoRA configuration:**

```python
from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    r=16,                          # Rank - higher = more capacity but more params
    lora_alpha=32,                 # Scaling factor (alpha/r = scaling)
    target_modules=[
        "q_proj", "k_proj",       # Attention query and key projections
        "v_proj", "o_proj",       # Attention value and output projections
        "gate_proj", "up_proj",   # MLP layers
        "down_proj"
    ],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)
```

I chose rank 16 after experimenting with 8, 16, and 32. Rank 8 underfit on our domain terminology. Rank 32 showed marginal improvement over 16 but doubled the adapter size. The alpha-to-rank ratio of 2:1 (32/16) is a well-tested default that worked well for us.

**Training setup:**

- Epochs: 3 (loss plateaued after epoch 3, validation loss started creeping up at epoch 4)
- Learning rate: 2e-4 with cosine scheduler and 100 warmup steps
- Batch size: 4 per device with gradient accumulation steps of 4 (effective batch size 16)
- Max sequence length: 2048 tokens
- Optimizer: paged AdamW 8-bit (memory efficient)
- Training time: approximately 6 hours on a single A100 80GB

**QLoRA specifics:**

For deployment, I used QLoRA to reduce memory footprint:

- Base model quantized to 4-bit using bitsandbytes NF4 (NormalFloat4) quantization
- Double quantization enabled (quantize the quantization constants)
- Compute dtype: bfloat16 for the LoRA adapters
- This brought inference memory from approximately 14GB (fp16) to approximately 5GB (4-bit + adapters), making it deployable on cheaper GPU instances

**Evaluation methodology (how 28% improvement was measured):**

I built a task-specific evaluation suite with 200 held-out test examples across four categories: menu queries, scheduling queries, inventory queries, and policy questions. Each example had a reference answer written by a domain expert.

I measured:
- Correctness: Does the response contain the right information? (LLM-as-judge scoring 1-5)
- Terminology accuracy: Does it use correct domain terms? (Keyword overlap + manual review)
- Instruction following: Does it answer in the expected format? (Structured output validation)

The fine-tuned model scored 28% higher on the composite metric compared to the base Mistral-7B-Instruct with the same prompt. The biggest gains were on terminology accuracy -- the base model would say "minimum stock level" while the fine-tuned model correctly said "par level."

**Compute cost reduction of 40%:**

This refers to LoRA/QLoRA vs. full fine-tuning. Full fine-tuning of Mistral-7B requires updating all 7B parameters, needing multiple A100s and roughly 10x the training time. LoRA only trained approximately 20M parameters (the low-rank adapters), and QLoRA let us do this on a single GPU. The 40% figure compared our actual compute cost against the estimated cost of full fine-tuning on the same dataset with equivalent training steps.

---

### Challenges & How I Overcame Them

**1. Agent routing accuracy (misclassifying queries)**

The initial intent classifier got about 78% routing accuracy. The failure mode was ambiguous queries like "Can I get more napkins for Tuesday?" -- is that inventory (napkins) or scheduling (Tuesday event)? I fixed this by (a) adding a "multi-intent" classification category so the system could route to multiple agents sequentially, (b) including few-shot examples of ambiguous queries in the classifier prompt, and (c) adding a confidence threshold -- if the classifier's confidence was below 0.7, it would ask a clarifying question instead of guessing. This brought routing accuracy to 93%.

**2. RAG retrieval quality for domain-specific jargon**

Early on, searching for "LTO items" (limited-time offers) returned zero relevant results because the embedding model had never seen that abbreviation in a food service context. I addressed this three ways: (a) I added a query expansion step that used the LLM to rewrite domain jargon into natural language before embedding, (b) the hybrid search with BM25 caught exact keyword matches that the dense retriever missed, and (c) I added a glossary document to the RAG corpus that mapped all internal abbreviations to their full forms. The combination of these three approaches is what drove the 10% retrieval accuracy improvement.

**3. Fine-tuning data quality and quantity**

We had only 2,000 real support tickets, and many were poorly written or incomplete. I couldn't just throw them all into training. I built a data quality pipeline: filter out conversations shorter than 2 turns, use an LLM to score each pair on a 1-5 quality scale, keep only 4+ rated pairs (kept about 1,200 of the 2,000), then augmented with SME-written and synthetic examples. I also ran deduplication using MinHash to remove near-duplicate examples. The quality filtering made a bigger difference than having more data -- an early experiment with all 2,000 unfiltered examples actually performed worse than 1,200 high-quality ones.

**4. Latency requirements for real-time responses**

The target was under 3 seconds end-to-end. The initial pipeline took 5-6 seconds: intent classification (800ms) + RAG retrieval (600ms) + re-ranking (400ms) + LLM generation (3-4s). I cut this down by: (a) using a smaller, faster model for intent classification (a fine-tuned distilbert, 80ms), (b) running dense and sparse retrieval in parallel with asyncio, (c) using ONNX-optimized cross-encoder for re-ranking (150ms), and (d) streaming the LLM response so time-to-first-token was around 500ms even though full generation took 2-3 seconds. The perceived latency dropped dramatically with streaming.

**5. Handling ambiguous multi-intent queries**

"Is the chicken from Tuesday's menu available in inventory, and who's working the grill station that day?" touches three agents. The naive approach of routing to one agent would lose information. I designed a sequential handoff protocol: the orchestrator parses out sub-intents, routes to the first agent, captures its output in the shared state, then routes to the next agent with the previous agent's context. The response synthesizer at the end combines all agent outputs into a single coherent response. The key insight was keeping the shared state clean -- each agent writes to its own namespace in the state dict, so there's no collision.

---

### Metrics & Impact

| Metric | Before | After | How Measured |
|--------|--------|-------|-------------|
| Manual support overhead | Baseline | -40% | Count of support tickets routed to human agents per week. Compared 4 weeks pre-launch vs. 4 weeks post-launch. |
| Retrieval accuracy | 72% Hit@5 | 82% Hit@5 (+10%) | Golden test set of 200 queries with labeled relevant documents. Measured Hit Rate at top-5 retrieved docs. |
| Task-specific accuracy | Baseline (Mistral-7B) | +28% composite | 200-example eval suite scored by LLM-as-judge on correctness, terminology, and format. Fine-tuned vs. base model. |
| Compute cost (fine-tuning) | Full FT estimate | -40% | Compared GPU-hours * cost-per-hour for LoRA/QLoRA training vs. estimated full fine-tuning on same hardware. |
| End-to-end latency | 5-6 seconds | <3 seconds (streaming TTFT ~500ms) | P95 latency measured via application logs over 1,000 production queries. |

---
---

## PROJECT 2: LLM Evaluation & Hybrid RAG System (Grootan Technologies)

**Role:** AI/ML Engineer | **Duration:** July 2023 - December 2023 | **Location:** Chennai, India

---

### The Story (Tell it like this in interviews)

"At Grootan Technologies, I joined a team that was building AI-powered backend services for clients, mostly document Q&A and information retrieval use cases. The problem was twofold: first, our RAG retrieval quality was inconsistent -- some queries returned great results, others returned completely irrelevant documents. Second, we had no systematic way to evaluate our LLM outputs. Quality control was a human QA team manually reading through hundreds of responses. It was slow, subjective, and didn't scale.

I tackled both problems. For retrieval, I architected a hybrid RAG pipeline that combined dense vector search with BM25 keyword search inside Weaviate, fused the results using Reciprocal Rank Fusion, and then applied a cross-encoder re-ranker. This gave us the best of both worlds -- semantic understanding from dense embeddings and exact-match precision from keyword search. Retrieval relevance improved by 20%, and we hit 200ms query latency, which was critical for the real-time use case.

For evaluation, I designed an LLM-as-Judge pipeline. Instead of humans reading every response, I used GPT-4 as an automated judge to score outputs on accuracy, faithfulness, hallucination, and relevance. I validated the judge against human annotations to make sure it was reliable. This cut manual QA review time by 60% -- the human reviewers only needed to look at cases where the judge flagged potential issues.

I also optimized our prompt pipelines. By switching to structured outputs with Pydantic schemas and carefully selecting few-shot examples, I cut token usage by 25% without any quality degradation. That might sound small, but at production scale it was meaningful cost savings.

The whole system was deployed on AWS using FastAPI, Docker, and a CI/CD pipeline with GitHub Actions. We had Lambda for lightweight inference endpoints, EC2 for the heavier vector search workloads, and S3 for document storage. Zero-downtime deployments using blue-green switching."

---

### Architecture Diagram (ASCII)

```
               HYBRID RAG + LLM EVALUATION SYSTEM - GROOTAN TECHNOLOGIES
               ==========================================================

  +----------------+
  |  Client App    |
  |  (REST API)    |
  +-------+--------+
          |
          v
  +-------+--------+     +--------------------+
  |   AWS ALB      |     |   CloudWatch       |
  | (Load Balancer)|     |   Monitoring &     |
  +-------+--------+     |   Alerting         |
          |               +--------------------+
          v
  +-------+----------------------------------------------+
  |              FastAPI Application                      |
  |                                                       |
  |  +------------+  +-----------+  +-----------------+   |
  |  | /query     |  | /evaluate |  | /health         |   |
  |  | endpoint   |  | endpoint  |  | /metrics        |   |
  |  +-----+------+  +-----+-----+  +-----------------+   |
  |        |               |                               |
  +--------+---------------+-------------------------------+
           |               |
           v               v
  +--------+--------+    +-+-------------------+
  | HYBRID RAG      |    | LLM-AS-JUDGE       |
  | PIPELINE        |    | EVALUATION          |
  |                 |    |                      |
  | +-----------+   |    | +----------------+  |
  | | Query     |   |    | | Judge LLM      |  |
  | | Processor |   |    | | (GPT-4)        |  |
  | +-----+-----+   |    | +-------+--------+  |
  |       |          |    |         |            |
  |       v          |    | +-------+--------+  |
  | +-----+-------+  |    | | Score:         |  |
  | |  Parallel   |  |    | | - Accuracy     |  |
  | |  Retrieval  |  |    | | - Faithfulness |  |
  | +--+------+---+  |    | | - Hallucination|  |
  |    |      |       |    | | - Relevancy   |  |
  |    v      v       |    | +-------+--------+  |
  | +--+--+ +-+---+  |    |         |            |
  | |Dense| |BM25 |  |    | +-------+--------+  |
  | |Vec. | |Key- |  |    | | Results DB     |  |
  | |Search| |word |  |    | | (PostgreSQL)   |  |
  | +--+--+ +-+---+  |    | +----------------+  |
  |    |      |       |    +--------------------+
  |    v      v       |
  | +--+------+---+   |
  | |     RRF     |   |
  | | (Reciprocal |   |
  | |  Rank       |   |
  | |  Fusion)    |   |
  | +------+------+   |
  |        |           |
  |        v           |
  | +------+------+    |
  | |Cross-Encoder|    |
  | | Re-Ranker   |    |
  | +------+------+    |
  |        |           |
  |        v           |
  | +------+------+    |
  | |  LLM        |    |
  | | Generation  |    |
  | +------+------+    |
  |        |           |
  +--------+-----------+
           |
           v
  +--------+--------+
  |   Response      |
  +-----------------+


  +====================================================+
  |               WEAVIATE VECTOR DB                    |
  |                                                     |
  | +---------------+  +---------------------------+    |
  | | Dense Index   |  | BM25 Inverted Index       |    |
  | | (HNSW)        |  | (Built-in keyword search) |    |
  | |               |  |                           |    |
  | | Embeddings:   |  | Tokenized text fields     |    |
  | | BGE-base-en   |  |                           |    |
  | +---------------+  +---------------------------+    |
  +====================================================+


  +====================================================+
  |              AWS INFRASTRUCTURE                     |
  |                                                     |
  |  +----------+  +----------+  +-----------+          |
  |  | EC2      |  | Lambda   |  | S3        |          |
  |  | (FastAPI |  | (Light   |  | (Document |          |
  |  |  + Vec.  |  |  inference|  |  Storage) |          |
  |  |  DB)     |  |  tasks)  |  |           |          |
  |  +----------+  +----------+  +-----------+          |
  |                                                     |
  |  +------------------+  +---------------------+      |
  |  | ECR (Docker      |  | GitHub Actions      |      |
  |  |  Registry)       |  | (CI/CD Pipeline)    |      |
  |  +------------------+  +---------------------+      |
  +====================================================+
```

---

### Technical Deep Dive

#### LLM-as-Judge Pipeline

**How the judge was implemented:**

I used GPT-4 as the judge model because it was the most capable model available at the time for evaluation tasks. The judge received the original query, the retrieved context, the generated response, and (when available) a reference answer. It scored each response on four dimensions.

**Metrics evaluated:**

1. **Accuracy** (1-5): Does the response correctly answer the question?
2. **Faithfulness** (1-5): Is every claim in the response supported by the provided context?
3. **Hallucination** (binary + severity): Does the response contain information not in the context?
4. **Relevancy** (1-5): Does the response address what was actually asked?

**Example judge prompt template:**

```
You are an expert evaluator for a question-answering system.

Given the following:
- User Question: {question}
- Retrieved Context: {context}
- Generated Response: {response}
- Reference Answer (if available): {reference}

Evaluate the response on the following criteria. For each, provide a score and a one-sentence justification.

1. ACCURACY (1-5): Does the response correctly answer the question based on the context?
   1 = Completely wrong, 5 = Perfectly correct

2. FAITHFULNESS (1-5): Is every claim in the response grounded in the provided context?
   1 = Entirely fabricated, 5 = Fully grounded

3. HALLUCINATION: Does the response contain claims not supported by the context?
   - Present: yes/no
   - Severity: none / minor (inconsequential details) / major (core claims fabricated)

4. RELEVANCY (1-5): Does the response directly address the user's question?
   1 = Completely off-topic, 5 = Directly and fully addresses the question

Respond in this exact JSON format:
{
  "accuracy": {"score": <int>, "justification": "<string>"},
  "faithfulness": {"score": <int>, "justification": "<string>"},
  "hallucination": {"present": <bool>, "severity": "<string>", "justification": "<string>"},
  "relevancy": {"score": <int>, "justification": "<string>"}
}
```

**How judge reliability was validated:**

I had three human annotators score 150 randomly sampled responses on the same criteria. I then computed:
- Pearson correlation between GPT-4 judge scores and averaged human scores: 0.87 for accuracy, 0.82 for faithfulness, 0.91 for relevancy
- Cohen's kappa for hallucination detection (binary): 0.79 (substantial agreement)

I also ran consistency checks -- feeding the same (query, response) pair to the judge 5 times and measuring variance. Standard deviation was below 0.3 on the 1-5 scales, which was acceptable.

**How results were stored and tracked:**

Every evaluation result was stored in PostgreSQL with: `evaluation_id`, `query_id`, `model_version`, `prompt_version`, `scores` (JSONB), `timestamp`. I built a simple dashboard (Streamlit) that showed score distributions over time, flagged responses scoring below thresholds, and compared metrics across model/prompt versions.

**How this fed back into improving the main model:**

Low-scoring responses became the basis for prompt improvements. If faithfulness scores were low for a particular document type, I'd examine those cases and adjust the prompt to be more explicit about grounding. If hallucination was flagged on questions about dates or numbers, I added explicit instructions to only state facts present in the context. This feedback loop is what drove the continuous improvement.

---

#### Hybrid RAG Architecture

**BM25 index setup:**

Weaviate has built-in BM25 keyword search (they call it "bm25" search), so I didn't need a separate Elasticsearch or rank_bm25 setup. This was a deliberate architectural choice -- having both dense and sparse search in a single database simplified infrastructure. I configured Weaviate to index all text fields for keyword search while simultaneously maintaining HNSW vector indices for dense search.

**Dense embedding model:**

BGE-base-en-v1.5 for production (good balance of quality and speed). I considered BGE-large but the latency increase wasn't worth the marginal quality gain for our use case. Embeddings were 768-dimensional. I used the `query_instruction` prefix for asymmetric retrieval: "Represent this sentence for searching relevant passages:" prepended to queries at embedding time.

**Reciprocal Rank Fusion implementation:**

```python
def reciprocal_rank_fusion(dense_results, bm25_results, k=60):
    """
    Fuse results from dense and BM25 retrieval.
    k=60 is the standard constant that dampens the impact of high rankings.
    """
    fused_scores = {}

    for rank, doc in enumerate(dense_results):
        doc_id = doc.id
        fused_scores[doc_id] = fused_scores.get(doc_id, 0) + 1 / (k + rank + 1)

    for rank, doc in enumerate(bm25_results):
        doc_id = doc.id
        fused_scores[doc_id] = fused_scores.get(doc_id, 0) + 1 / (k + rank + 1)

    # Sort by fused score descending
    sorted_doc_ids = sorted(fused_scores, key=fused_scores.get, reverse=True)
    return sorted_doc_ids[:top_n]
```

Weaviate also supports hybrid search natively (`hybrid` search with `alpha` parameter to weight dense vs sparse), but I implemented RRF manually for more control over the fusion weights during experimentation.

**Cross-encoder reranking:**

Used `cross-encoder/ms-marco-MiniLM-L-6-v2` -- fast enough for production (approximately 50ms for re-ranking 20 candidates), with strong relevance scoring. I re-ranked the top 20 candidates from RRF fusion and kept the top 5 for context injection.

**How 200ms latency was achieved:**

- Weaviate was deployed on an EC2 instance with the HNSW index fully loaded in memory
- BGE-base embeddings (not large) for faster encoding -- query embedding took approximately 15ms
- BM25 and dense search ran in parallel (Weaviate's hybrid mode)
- Cross-encoder re-ranking on only 20 candidates (not 100)
- Connection pooling to Weaviate (persistent HTTP connections)
- Warm-started embedding model (loaded at FastAPI startup, not per-request)

Breakdown: Query embedding (15ms) + Hybrid search (80ms) + RRF fusion (5ms) + Re-ranking 20 docs (50ms) + Overhead (50ms) = approximately 200ms total retrieval. LLM generation was on top of this but streamed.

**How 20% improvement was measured:**

I built a golden test dataset of 300 query-document relevance pairs. Each query had 1-5 documents labeled as relevant by domain experts. I measured Recall@5 (what fraction of relevant docs appear in top 5 results) and MRR@5 (mean reciprocal rank). The hybrid pipeline (dense + BM25 + re-ranking) achieved 20% higher Recall@5 compared to dense-only retrieval.

---

#### Production Deployment

**FastAPI service architecture:**

```python
# Simplified structure
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

app = FastAPI(title="RAG Service", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"])

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    filters: dict = {}

class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    latency_ms: float
    model_version: str

@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    start = time.time()
    # 1. Embed query
    query_embedding = await embed_query(request.query)
    # 2. Parallel retrieval
    dense_task = retrieve_dense(query_embedding, request.top_k * 4)
    sparse_task = retrieve_bm25(request.query, request.top_k * 4)
    dense_results, sparse_results = await asyncio.gather(dense_task, sparse_task)
    # 3. Fuse + rerank
    fused = reciprocal_rank_fusion(dense_results, sparse_results)
    reranked = rerank(request.query, fused, top_k=request.top_k)
    # 4. Generate
    answer = await generate_answer(request.query, reranked)
    latency = (time.time() - start) * 1000
    return QueryResponse(answer=answer, sources=reranked, latency_ms=latency, model_version=MODEL_VERSION)

@app.get("/health")
async def health():
    return {"status": "healthy", "weaviate": await check_weaviate()}
```

**Docker setup:**

Multi-stage build. First stage installs dependencies and downloads model weights. Second stage copies only the runtime artifacts, keeping the image slim (approximately 1.2GB including the cross-encoder model weights).

```dockerfile
# Build stage
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Download model weights at build time
RUN python -c "from sentence_transformers import CrossEncoder; CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')"

# Runtime stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /root/.cache/huggingface /root/.cache/huggingface
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**AWS architecture:**

- **EC2** (t3.xlarge): FastAPI app + Weaviate instance. Weaviate needed persistent storage and enough RAM to keep HNSW indices in memory. Lambda's ephemeral nature and cold starts made it unsuitable for vector DB hosting.
- **Lambda**: Lightweight tasks -- document processing triggers (when new docs uploaded to S3), scheduled evaluation runs, webhook handlers.
- **S3**: Document storage (source PDFs, processed chunks), evaluation results, model artifacts.
- **ECR**: Docker image registry for the FastAPI service.
- **ALB**: Application load balancer for health checks and SSL termination.
- **CloudWatch**: Logging, metrics, alerting on latency spikes or error rates.

**CI/CD pipeline:**

```
GitHub Push -> GitHub Actions:
  1. Run unit tests (pytest)
  2. Run integration tests (test retrieval pipeline with golden queries)
  3. Run evaluation suite (LLM-as-judge on 50 canary queries)
  4. Build Docker image, push to ECR
  5. Deploy to staging EC2 (blue environment)
  6. Run smoke tests against staging
  7. Switch ALB traffic to blue (new) environment
  8. Monitor for 10 minutes, rollback if error rate > 1%
  9. Terminate old (green) environment
```

**Zero-downtime deployment:** Blue-green. Two EC2 instances behind the ALB. Deploy to the inactive one, run health checks, switch ALB target group. If anything goes wrong, switch back. The whole cutover takes under 30 seconds.

---

#### Prompt Optimization

**Before (verbose prompt):**

```
You are a helpful AI assistant. Your job is to answer questions based on
the provided context. Please read the context carefully and provide a
comprehensive answer. If you don't know the answer, say so. Here is the
context:

{context}

Here is the question:

{question}

Please provide your answer:
```

**After (optimized prompt with structured output):**

```
Answer the question using ONLY the provided context. Respond in JSON.

Context:
{context}

Question: {question}

{"answer": "<direct answer>", "confidence": "high|medium|low", "source_chunks": [<indices of chunks used>]}
```

The optimized version cut approximately 40 tokens of instruction overhead per request. Multiply by thousands of requests per day and the savings add up. The structured JSON output also eliminated post-processing -- no more parsing free-text responses to extract the actual answer.

**Few-shot example selection strategy:**

I maintained a bank of 20 high-quality example pairs across different query types. For each incoming query, I used embedding similarity to select the 2-3 most relevant examples dynamically. This worked better than static few-shot because the examples were always contextually appropriate, and I only used as many as needed (sometimes 1 example was enough for simple queries, saving tokens).

**How quality was maintained while cutting tokens:**

I ran the LLM-as-Judge pipeline on both the old and new prompts across the same 300 test queries. Average accuracy score: 4.2 (old) vs 4.1 (new) -- within noise margin. Faithfulness actually improved slightly (3.9 to 4.1) because the structured output format made the model less likely to add unsupported details.

---

### Challenges & Solutions

**1. Weaviate cold start and index loading**

When the EC2 instance restarted, Weaviate took 2-3 minutes to load HNSW indices from disk into memory. During this time, queries would timeout. I solved this by adding a health check endpoint that only returned "healthy" after Weaviate confirmed all indices were loaded. The ALB wouldn't route traffic until the health check passed. I also added a warm-up script that ran 10 dummy queries after startup to prime the caches.

**2. LLM-as-Judge inconsistency on edge cases**

The judge was inconsistent on ambiguous cases -- responses that were technically correct but poorly worded. Scores would fluctuate between 2 and 4 on repeated evaluations. I addressed this by (a) making the rubric more explicit with examples of each score level, (b) running the judge 3 times per evaluation and taking the median, and (c) flagging cases where the 3 runs had standard deviation > 1.0 for human review. This hybrid approach (automated + human-for-edge-cases) is what gave us reliable evaluation without the full cost of human review.

**3. BM25 and dense retrieval returning completely different documents**

For some queries, the dense and BM25 retrievers had zero overlap in their top-20 results. RRF fusion would then just interleave them without any re-ranking signal. The solution was increasing the candidate pool (top-40 from each retriever instead of top-20) and adding a minimum relevance threshold -- BM25 results below a score threshold and dense results below a similarity threshold were filtered out before fusion.

**4. Docker image size bloating with ML model weights**

The initial Docker image was over 5GB because it included PyTorch, transformers, and model weights. I reduced it by (a) multi-stage build to strip build-time dependencies, (b) using ONNX Runtime instead of PyTorch for the cross-encoder at inference time (smaller runtime), and (c) storing large model weights in S3 and downloading them at container startup rather than baking them into the image. Final image: approximately 1.2GB.

**5. Handling concurrent requests without latency spikes**

Under load, the cross-encoder re-ranking step became a bottleneck because it's CPU-intensive and was running synchronously. I moved re-ranking to a thread pool executor (`asyncio.run_in_executor`) so it wouldn't block the FastAPI event loop. I also added request batching -- if 5 requests came in within a 50ms window, their re-ranking was batched into a single forward pass through the cross-encoder, which was more efficient than processing them individually.

---

### Metrics & Impact

| Metric | Before | After | How Measured |
|--------|--------|-------|-------------|
| Retrieval relevance | Baseline (dense-only) | +20% Recall@5 | Golden dataset of 300 query-document pairs. Compared dense-only vs. hybrid+reranking. |
| Query latency | ~500ms (dense-only) | 200ms (hybrid) | P50 measured over 10K production queries. Hybrid was faster because Weaviate's native hybrid mode is optimized. |
| Manual QA review time | 100% manual | -60% | Only responses flagged by LLM-as-Judge (score < 3 on any dimension) needed human review. Volume dropped from all responses to ~40%. |
| Token usage | Baseline | -25% | Compared average tokens per request before and after prompt optimization. Tracked via API usage logs. |
| Deployment downtime | ~5 min per deploy | Zero | Blue-green deployment with ALB switching. Monitored via CloudWatch uptime metric. |

---
---

## PROJECT 3: National ID Authentication System (Grootan Technologies - Intern)

**Role:** AI/ML Intern | **Duration:** September 2022 - July 2023 | **Location:** Chennai, India

---

### The Story (Tell it like this in interviews)

"This was my first production ML project, and it taught me more about real-world engineering than any course ever did. At Grootan, we were building a national ID authentication system -- think Aadhaar card verification. The core problem was detecting whether the hologram on a physical ID card was genuine. Counterfeit IDs often have fake or missing holograms, so hologram verification was a critical security check.

When I joined, there was already a working system, but it was painfully slow -- 4 minutes per verification request. For a production service handling thousands of verifications per day, that was unacceptable. My job was twofold: maintain and improve the computer vision pipeline for hologram detection, and cut that processing time.

The hologram detection problem was interesting because we had very limited labeled data. Hologram images are hard to collect at scale -- you need physical ID cards, controlled lighting, and manual annotation. We had maybe a few hundred labeled samples. I used transfer learning, starting with a pre-trained ResNet model and fine-tuning it on our small dataset with aggressive data augmentation -- rotations, brightness changes, crops, simulating different camera angles and lighting conditions.

For the latency problem, I profiled the entire pipeline and found that most of the 4 minutes was spent on redundant image preprocessing. The original pipeline was doing full-resolution processing on the entire ID card image, then cropping to the hologram region, then re-processing. I redesigned it to do early cropping with a lightweight detector, so the expensive preprocessing only ran on the relevant region. I also parallelized independent processing steps. This brought us from 4 minutes down to 2 minutes -- a 50% reduction.

What I'm most proud of from this project is learning to think about the full system, not just the model. The model accuracy mattered, but so did latency, error handling, logging, and making the system work across different ID card formats with different hologram placements."

---

### Architecture Diagram (ASCII)

```
            NATIONAL ID AUTHENTICATION SYSTEM
            =================================

  +------------------+
  |  Client Request  |
  |  (ID Card Image) |
  +--------+---------+
           |
           v
  +--------+---------+
  |  Python Backend  |
  |  (REST API)      |
  +--------+---------+
           |
           v
  +--------+-------------------------------------------+
  |              VERIFICATION PIPELINE                  |
  |                                                     |
  |  +-------------+                                    |
  |  | Image       |  - Resize to standard dimensions   |
  |  | Preprocessing|  - Color normalization             |
  |  | (Lightweight)|  - Noise reduction                 |
  |  +------+------+                                    |
  |         |                                           |
  |         v                                           |
  |  +------+------+                                    |
  |  | ROI         |  - Detect hologram region           |
  |  | Detection   |  - Crop to region of interest       |
  |  | (Fast)      |  - Template matching per ID format   |
  |  +------+------+                                    |
  |         |                                           |
  |         v                                           |
  |  +------+------+                                    |
  |  | Feature     |  - Transfer learning (ResNet)       |
  |  | Extraction  |  - Fine-tuned on hologram data      |
  |  | (CNN)       |  - Extract hologram features         |
  |  +------+------+                                    |
  |         |                                           |
  |         v                                           |
  |  +------+------+                                    |
  |  | Hologram    |  - Genuine vs counterfeit           |
  |  | Classifier  |  - Confidence score                 |
  |  |             |  - Anomaly detection for unknown     |
  |  +------+------+    ID formats                       |
  |         |                                           |
  |         v                                           |
  |  +------+------+                                    |
  |  | Post-       |  - Threshold check                  |
  |  | Processing  |  - Edge case handling               |
  |  | & Decision  |  - Confidence calibration           |
  |  +------+------+                                    |
  |         |                                           |
  +---------+-------------------------------------------+
            |
            v
  +---------+---------+
  | Verification      |
  | Result            |
  | (Genuine/Fake/    |
  |  Uncertain +      |
  |  Confidence)      |
  +-------------------+
```

---

### Technical Deep Dive

**Computer vision pipeline:**

The pipeline had four stages:

1. **Image preprocessing:** Resize to a standard resolution (640x480), apply CLAHE (Contrast Limited Adaptive Histogram Equalization) for lighting normalization, and Gaussian blur for noise reduction. The original pipeline was processing at the full camera resolution (often 4000x3000), which was wasteful since the hologram occupied maybe 5% of the image.

2. **ROI (Region of Interest) detection:** I built format-specific template matchers for different national ID types. Each ID format has the hologram in a known relative position. The ROI detector identified the ID format first (using a lightweight classifier), then cropped to the expected hologram region with some padding. This was the key optimization -- instead of processing the full image through the heavy CNN, we only processed the cropped hologram region.

3. **Feature extraction (Transfer learning):** I started with ResNet-50 pre-trained on ImageNet. I froze the early convolutional layers (which detect generic features like edges, textures) and fine-tuned the later layers and the classification head on our hologram dataset. The final feature vector (2048-dim from ResNet's penultimate layer) captured hologram-specific patterns like iridescence patterns, microtext, and overlay consistency.

4. **Classification:** A small fully-connected head (2048 -> 512 -> 128 -> 2) with dropout for regularization. Output: genuine probability and counterfeit probability.

**Transfer learning approach:**

The challenge was approximately 300-400 labeled hologram images total. Not nearly enough to train a CNN from scratch. Transfer learning was essential. I used a staged unfreezing approach:

- Phase 1: Freeze all ResNet layers, train only the new classification head (10 epochs). This learns to map ImageNet features to our hologram classification task.
- Phase 2: Unfreeze the last ResNet block (layer4), fine-tune with a low learning rate (1e-5). This adapts high-level features to hologram-specific patterns.
- Phase 3: Optionally unfreeze layer3 if validation accuracy plateaued.

**Data augmentation for limited data:**

- Random rotation (+/- 15 degrees, simulating tilted ID cards)
- Random brightness and contrast adjustment (+/- 30%, simulating different lighting)
- Random cropping with 80-100% of the region (simulating imprecise ROI detection)
- Horizontal flip (holograms can be photographed from either side)
- Color jitter (saturation, hue shifts)
- Gaussian noise injection (simulating low-quality cameras)
- Cutout / random erasing (forcing the model to use multiple features, not just one)

With these augmentations, each training image effectively became 20-30 unique training samples.

**How latency was reduced from 4 minutes to 2 minutes:**

I profiled the pipeline with Python's `cProfile` and `line_profiler`. The bottlenecks were:

1. **Full-resolution processing (saved ~60s):** The original code ran preprocessing on the full 4000x3000 image, then detected the hologram region, then re-processed the cropped region. I moved the format detection and ROI cropping before the expensive preprocessing, so we only ever processed the small cropped region.

2. **Redundant model loading (saved ~30s):** The original code was loading the PyTorch model weights from disk on every request. I refactored to load the model once at service startup and keep it in memory.

3. **Sequential independent operations (saved ~20s):** Some preprocessing steps (color normalization and noise reduction) were independent and could run in parallel using Python's `concurrent.futures.ThreadPoolExecutor`.

4. **Unoptimized image I/O (saved ~10s):** Replaced PIL image loading with OpenCV (cv2), which is significantly faster for basic operations.

Total: approximately 120 seconds saved, bringing the pipeline from 240s to 120s.

**Handling different ID formats:**

I built a format registry -- a configuration file mapping ID format codes to hologram position templates (relative coordinates on the card). When a new ID format was added, we only needed to add its template to the registry and collect a small number of hologram samples for fine-tuning. The classification model generalized reasonably well across formats because holograms share common authenticity features regardless of specific design.

---

### Challenges & Solutions

**1. Extremely limited labeled data**

300-400 labeled images is tiny for a CNN. Beyond data augmentation, I used a few additional strategies: (a) hard negative mining -- I specifically collected images of high-quality counterfeits to include in training, since the model needed to distinguish subtle differences. (b) I generated synthetic negative examples by digitally altering genuine hologram images (removing iridescence patterns, blurring microtext). (c) I used the pre-trained ResNet as a feature extractor and trained a simpler SVM classifier on the features, which required less data than fine-tuning the full network. In production, we used the fine-tuned ResNet, but the SVM served as a sanity check during development.

**2. Varying image quality from different devices**

Users were submitting ID photos taken on everything from high-end smartphones to grainy webcams. Hologram features that were clearly visible in good photos were barely detectable in bad ones. I added a pre-check quality gate: if the image's sharpness score (Laplacian variance) fell below a threshold, the system returned "image quality insufficient" and asked for a re-upload instead of producing a low-confidence result. This reduced false negatives caused by poor image quality.

**3. Production reliability and error handling**

As an intern, my initial code had minimal error handling. When a malformed image came in (wrong format, corrupted file, too small), the service would crash. I learned to add defensive checks at every pipeline stage: validate image format and minimum resolution at upload, wrap each processing stage in try/except with specific error messages, add request timeouts so one stuck request couldn't block the service, and add structured logging so we could debug production issues from the logs alone.

---
---

## PROJECT 4: Credit Card Default Prediction (iNeuron.ai)

**Role:** Data Science Intern | **Duration:** November 2021 - March 2022 | **Location:** Bengaluru, India

---

### The Story (Tell it like this in interviews)

"This was my first professional data science project, during an internship at iNeuron.ai. I built an end-to-end credit card default prediction system -- from EDA through model training to a deployed API on AWS.

The dataset was about 30,000 customer records with features like credit limit, payment history, bill amounts, and demographic information. The target was whether a customer would default on their credit card payment next month. I did thorough exploratory data analysis and found some interesting patterns -- payment history was by far the strongest predictor, and there was significant class imbalance (about 22% default rate).

I trained several models -- logistic regression, random forest, gradient boosting, and XGBoost -- and did hyperparameter tuning with cross-validation. The XGBoost model achieved 97% accuracy, though I want to be honest about what that means: with 78% of records being non-default, a model that always predicts 'no default' would get 78% accuracy. The real story was in precision and recall on the default class, which is what I focused on optimizing.

I packaged the whole thing with Docker and set up a CI/CD pipeline with CircleCI that automatically ran tests, built the Docker image, and deployed to AWS whenever I pushed to main. It was my first experience with production ML deployment, and it taught me that the model is maybe 20% of the work -- the other 80% is everything around it."

---

### Technical Deep Dive

**Dataset description and EDA findings:**

The dataset (likely the UCI Credit Card Default dataset or a similar one) contained approximately 30,000 records with 23 features:

- Demographics: age, sex, education, marital status
- Credit features: credit limit, bill amounts for 6 months, payment amounts for 6 months
- Payment behavior: repayment status for each of the past 6 months (-1 = paid on time, 1 = one month delay, 2 = two months, etc.)

Key EDA findings:
- **Class imbalance:** 78% non-default vs 22% default. This meant accuracy alone was misleading.
- **Payment history dominance:** Customers who were late on payments for 2+ consecutive months had a default rate of over 60%, compared to ~10% for customers always on time. This was the single most predictive feature group.
- **Credit limit correlation:** Lower credit limits correlated with higher default rates, but this was partially confounded with age and education.
- **Bill amount patterns:** Customers whose bill amounts were consistently increasing month-over-month had higher default rates.

**Feature engineering:**

- `avg_payment_delay`: average of the 6 monthly repayment status values
- `max_payment_delay`: worst delay in the past 6 months
- `payment_to_bill_ratio`: average(payment amounts) / average(bill amounts) -- how much of their bill they typically pay
- `credit_utilization`: average(bill amounts) / credit limit
- `bill_trend`: slope of bill amounts over the 6 months (increasing/decreasing)
- Encoded categorical variables (education, marital status) with ordinal encoding where order mattered, one-hot otherwise

**Model selection and why:**

I trained and compared:
- Logistic Regression: baseline, interpretable, 82% accuracy
- Random Forest: 91% accuracy, good feature importance insights
- Gradient Boosting (sklearn): 94% accuracy
- **XGBoost: 97% accuracy, best precision-recall tradeoff**

XGBoost won because (a) it handled the class imbalance well with `scale_pos_weight`, (b) built-in regularization (L1/L2) prevented overfitting on 30K samples, and (c) it was fast to train with hyperparameter tuning.

**97% accuracy context -- class imbalance handling:**

I used multiple strategies:
- `scale_pos_weight` in XGBoost (set to ratio of negatives/positives, approximately 3.5)
- SMOTE (Synthetic Minority Oversampling Technique) on the training set -- but only on training, never on validation/test
- Stratified K-fold cross-validation (5 folds) to ensure each fold had representative class distribution
- Optimized the classification threshold (not just 0.5) using the F1 score on the validation set. The optimal threshold was around 0.35, which improved recall on the default class.

True performance on the default class (the one that matters): Precision ~85%, Recall ~80%, F1 ~82%. The 97% overall accuracy was driven by the majority class being easy to classify.

**Docker + CircleCI + AWS deployment:**

```yaml
# .circleci/config.yml (simplified)
version: 2.1
jobs:
  test:
    docker:
      - image: python:3.9
    steps:
      - checkout
      - run: pip install -r requirements.txt
      - run: pytest tests/

  build-and-deploy:
    docker:
      - image: python:3.9
    steps:
      - checkout
      - setup_remote_docker
      - run: docker build -t credit-default-predictor .
      - run: docker tag credit-default-predictor:latest $ECR_REPO:latest
      - run: aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REPO
      - run: docker push $ECR_REPO:latest
      - run: aws ecs update-service --cluster prod --service predictor --force-new-deployment

workflows:
  deploy:
    jobs:
      - test
      - build-and-deploy:
          requires:
            - test
          filters:
            branches:
              only: main
```

The API exposed a `/predict` endpoint that accepted customer features as JSON and returned the default probability plus a binary prediction.

---

### Challenges & Solutions

**1. Overfitting on a small dataset**

With only 30K records, overfitting was a real risk, especially with gradient boosting methods that can memorize training data. I addressed it with: (a) strict train/test split with stratification, (b) 5-fold cross-validation to detect overfitting, (c) XGBoost regularization parameters (`max_depth=6`, `min_child_weight=5`, `gamma=0.1`, `reg_alpha=0.1`, `reg_lambda=1.0`), and (d) early stopping based on validation loss (stopped at 300 rounds out of a maximum 1000).

**2. Deploying my first ML model to production**

I had never deployed anything to AWS before this internship. The learning curve was steep -- Docker, CI/CD, ECR, ECS were all new concepts. I started by getting the API running locally with Flask (later migrated to FastAPI), then learned Docker step by step (Dockerfile -> build -> run -> test locally), then set up CircleCI for automated testing and deployment. The key lesson was to automate everything -- manual deployments are error-prone and don't scale. Even for a small project, having a proper CI/CD pipeline saved me hours of manual work and caught bugs early.

---
---

## CROSS-PROJECT PATTERNS (Use these to show growth)

### How my approach to production systems evolved

**iNeuron (2021-2022):** I was focused almost entirely on model accuracy. I spent 80% of my time on feature engineering and model tuning, and scrambled to deploy at the end. The deployment was functional but fragile.

**Grootan Intern (2022-2023):** I learned that production systems are about much more than models. Latency, error handling, logging, and reliability became first-class concerns. I started thinking about the full request lifecycle, not just the prediction step.

**Grootan Full-time (2023):** I shifted to thinking about systems. The hybrid RAG pipeline was designed for maintainability and observability from day one. The LLM-as-Judge pipeline was about building feedback loops. I started caring about evaluation, monitoring, and continuous improvement.

**Compass Group (2025-Present):** Now I think in terms of architecture. The multi-agent system is a complex distributed system with multiple moving parts. I design for extensibility (easy to add new agents), resilience (graceful degradation when components fail), and measurability (every component has metrics). The fine-tuning work showed I can improve systems at the model level too, not just the infrastructure level.

### Common patterns I use

1. **Always hybrid retrieval for RAG.** Dense-only misses keyword matches, BM25-only misses semantic similarity. Hybrid + re-ranking has consistently outperformed either alone across every project.

2. **Evaluation before optimization.** At Grootan I built the LLM-as-Judge before optimizing prompts, so I could measure whether changes actually helped. At Compass Group I built the evaluation suite before fine-tuning. You can't improve what you can't measure.

3. **Start simple, add complexity when proven necessary.** At Compass Group, the first version of the multi-agent system had just two agents (a general agent and a support agent). I added specialized agents only after measuring that the general agent was struggling on domain-specific queries. Each addition was justified by data.

4. **Separate real-time from batch.** Real-time APIs handle user-facing queries. Batch jobs handle document indexing, evaluation runs, and model training. Trying to do both in the same system leads to resource contention and unpredictable latency.

5. **Infrastructure as code, CI/CD from day one.** Even my intern project at iNeuron had a CI/CD pipeline. It takes an hour to set up and saves weeks over the life of a project.

### My go-to architecture decisions and why

- **FastAPI for Python APIs:** Async support, automatic OpenAPI docs, Pydantic validation. I've used it in every project since Grootan.
- **Weaviate or FAISS + ChromaDB for vector search:** Weaviate when I need native hybrid search in one system. FAISS for high-performance read-heavy workloads, ChromaDB for frequently-updated collections.
- **LangGraph for agent orchestration:** Stateful graph-based workflows give me explicit control over routing, state, and error handling. I prefer it over CrewAI or AutoGen because I can see and debug exactly what's happening at every step.
- **Cross-encoder re-ranking as a standard RAG step:** The accuracy improvement is almost always worth the small latency cost. I use it by default and only remove it if latency budgets are extremely tight.
- **Docker for everything:** Reproducible environments, consistent deployments, easy local development. No "works on my machine" problems.

---

*Prepared for Sujan Dora's interview preparation. Practice telling these stories out loud until they feel natural. Adjust specific numbers and details to match your actual experience -- the architecture and technical decisions described here are representative frameworks to build your narrative around.*
