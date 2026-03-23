# Interview Prep: Experience & Behavioral Q&A

**Candidate:** Sujan Dora
**Target Role:** AI Engineer
**Prepared:** March 2026

---

## Section 1: "Tell Me About Yourself"

### Version 1: 30-Second Elevator Pitch

"I'm Sujan Dora, an AI Engineer at Compass Group where I build multi-agent AI systems and RAG pipelines that automate enterprise operations. I have about three years of combined experience spanning AI/ML engineering -- from building production computer vision systems and LLM evaluation pipelines at Grootan Technologies in India, to now architecting agentic workflows using LangGraph, MCP, and fine-tuned LLMs. I recently completed my Master's in Computer Science with a Data Science focus from Missouri State University. I'm looking for a role where I can keep building production AI systems that solve real problems at scale."

### Version 2: 1-Minute Version

"I'm Sujan Dora, an AI Engineer currently at Compass Group, where I architect multi-agent AI systems using LangGraph and MCP to automate operational workflows -- things like menu management, scheduling, and inventory queries. That work has reduced manual support overhead by about 40%.

Before that, I worked at Grootan Technologies in India in two roles. As a full-time AI/ML Engineer, I built hybrid RAG pipelines with Weaviate, designed LLM-as-Judge evaluation systems, and deployed production services on AWS with FastAPI and Docker. Before that, as an intern, I built a production computer vision system for national ID authentication, where I cut processing latency by 50%.

I completed my Master's in Computer Science from Missouri State University in December 2024 with a 3.63 GPA, and I've published two IEEE papers. What excites me most is the full lifecycle -- from prototyping an LLM-powered system to deploying it in production and measuring real business impact. I'm looking for a team where I can do that at scale."

### Version 3: 2-Minute Detailed Version

"I'm Sujan Dora, an AI Engineer with a progression from ML intern to building production agentic AI systems. Let me walk you through my journey.

I started in AI/ML at iNeuron.ai in Bengaluru as a Data Science Intern, where I built a credit card default prediction model with 97% accuracy and learned end-to-end ML deployment with Docker and CI/CD on AWS. That gave me the fundamentals.

Then I joined Grootan Technologies in Chennai as an AI/ML Intern, where I got thrown into production immediately. I built the backend for a national ID authentication system that used computer vision and ML-based hologram verification. The system was slow -- 4 minutes per request -- and I redesigned the workflow to cut that to 2 minutes. I also applied transfer learning to improve hologram detection accuracy with limited labeled data. That 10-month internship taught me what production ML really means: reliability, latency, edge cases.

I was promoted to a full-time AI/ML Engineer role at Grootan, where I shifted into the LLM space. I built hybrid RAG retrieval pipelines combining dense embeddings, BM25, and reranking with Weaviate vector search, hitting 200ms query latency. I designed LLM-as-Judge evaluation pipelines to monitor accuracy and hallucination in production, which cut our manual QA review time by 60%. I also built and deployed FastAPI services on AWS with zero-downtime deployments.

After that, I came to the US for my Master's in Computer Science at Missouri State University, focusing on Data Science, which I completed in December 2024 with a 3.63 GPA. I published two IEEE papers during that time.

Now at Compass Group, I'm an AI Engineer where I've architected a multi-agent system using LangGraph and MCP. The system has specialized agents that handle different operational domains -- menu queries, scheduling, inventory -- each with tool-calling capabilities to hit live APIs. I built RAG pipelines with FAISS and ChromaDB, improved retrieval accuracy by 10% through semantic chunking and hybrid search, and fine-tuned domain-specific LLMs using LoRA and QLoRA, which improved task-specific accuracy by 28% while cutting compute costs by 40%.

What ties all of this together is my focus on production AI systems that deliver measurable business impact. I'm looking for a role where I can keep pushing the boundaries of what's possible with LLMs and agentic systems at scale."

---

## Section 2: Experience Deep-Dive Questions

---

### Compass Group -- AI Engineer (Jan 2025 - Present)

---

#### Q1: Walk me through the multi-agent system architecture. What agents did you have? How did they communicate?

"The system was built on LangGraph as the orchestration framework. At a high level, we had a supervisor agent that acted as the router -- it would take an incoming user request, classify the intent, and delegate to the right specialized agent.

The specialized agents included:
- A **Menu Agent** that could query the menu management API, handle questions about ingredients, nutrition, dietary restrictions, and menu changes.
- A **Scheduling Agent** for shift management, staffing queries, and availability lookups.
- An **Inventory Agent** that tracked stock levels, flagged low-inventory items, and could interface with the ordering system.
- A **General Support Agent** that handled FAQ-type questions and policy lookups via RAG.

Communication happened through LangGraph's state graph. Each agent had its own state that it could read and write to, and the supervisor agent managed the overall conversation state. When one agent needed information from another -- say, the scheduling agent needed to know about a menu change to adjust staffing -- the supervisor would orchestrate that handoff through the shared state.

We used MCP (Model Context Protocol) to standardize how each agent connected to its tools and data sources. Each agent exposed its capabilities as MCP tools, which made the architecture modular -- we could add or swap agents without changing the orchestration logic.

The key design decision was keeping agents stateless between turns. All context lived in LangGraph's state, which made the system easier to debug and scale. If an agent failed, we could retry just that step without losing the conversation context."

---

#### Q2: How did MCP fit into your architecture? Why MCP over direct function calling?

"MCP served as the standardized interface layer between our agents and external tools and data sources. Each agent had an MCP server that exposed its capabilities -- things like API calls, database queries, and RAG retrievals -- as typed tools with schemas.

We chose MCP over direct function calling for a few specific reasons:

First, **modularity**. With direct function calling, the tool definitions are tightly coupled to the LLM prompt. Every time we added or changed a tool, we had to update the prompt, re-test, and redeploy. With MCP, the tool catalog was separate from the agent logic. We could add a new API endpoint to the inventory agent's MCP server without touching the agent prompt at all.

Second, **discoverability**. MCP lets agents dynamically discover what tools are available. When we onboarded a new data source, we just registered it as an MCP tool, and the agents could find and use it. This was critical in an enterprise environment where the data landscape kept changing.

Third, **standardization across agents**. We had multiple agents built by different people at different times. MCP gave us a consistent protocol for tool invocation, error handling, and response formatting. Without it, each agent would have had its own bespoke tool integration, which would have been a maintenance nightmare.

The tradeoff was added complexity in the initial setup -- MCP has a learning curve, and there's overhead in running MCP servers. But it paid off quickly as the system grew. Direct function calling would have been fine for a single-agent prototype, but for a multi-agent production system, MCP was the right abstraction."

---

#### Q3: Explain your RAG pipeline. How did you choose between FAISS and ChromaDB?

"Our RAG pipeline had two main retrieval paths, and we used FAISS and ChromaDB for different purposes based on their strengths.

**FAISS** was our choice for high-throughput, latency-sensitive retrieval. We used it for the operational data that was queried most frequently -- things like menu item descriptions, standard operating procedures, and common FAQ content. FAISS is an in-memory index, so it gave us sub-10ms retrieval times. We used IVF-PQ (Inverted File with Product Quantization) indexing to keep the memory footprint manageable as the corpus grew. The downside is FAISS doesn't handle metadata filtering natively, so for pure semantic similarity search on stable corpora, it was ideal.

**ChromaDB** was used for the data that needed richer metadata filtering and more frequent updates -- things like inventory records, scheduling data that changed daily, and location-specific content. ChromaDB gave us the ability to filter by metadata fields like location, date, and department before doing the semantic search, which was critical for scoping queries to relevant data. It also handled document updates more gracefully than FAISS, where you basically need to rebuild the index.

The pipeline itself worked like this:
1. User query comes in, the supervisor routes it to the right agent.
2. The agent's query gets embedded using the same embedding model (we used a sentence-transformer model).
3. Depending on the data domain, we query FAISS, ChromaDB, or both.
4. Results go through a re-ranking step using a cross-encoder to improve precision.
5. The top-k documents are stuffed into the agent's context window along with the original query.

We also had a hybrid search component where we combined dense embeddings with BM25 keyword matching for certain query types, especially when users used specific product codes or technical terms that semantic search alone would miss."

---

#### Q4: How did semantic chunking improve your retrieval? What was your chunk size? How did you measure the 10% improvement?

"Before semantic chunking, we were using fixed-size chunking -- 512 tokens with 50-token overlap. The problem was that enterprise documents like SOPs, policy manuals, and operational guides have varying information density. A fixed chunk would often split a procedure in the middle of a step, or lump unrelated sections together. This meant the retriever would return chunks that had partial information, and the LLM would either hallucinate the rest or give an incomplete answer.

With semantic chunking, I used embedding similarity to find natural breakpoints in the text. The approach was: embed sentences sequentially, compute cosine similarity between consecutive sentence embeddings, and split when the similarity dropped below a threshold -- indicating a topic shift. This produced chunks that ranged from about 200 to 800 tokens, averaging around 400.

For measuring the 10% improvement, I set up an evaluation pipeline:
1. I built a test set of about 150 query-answer pairs that our operations team validated. These covered the main query types we saw in production.
2. For each query, I ran retrieval with both the old fixed-size chunks and the new semantic chunks.
3. I measured **recall@5** (did the correct source document appear in the top 5 retrieved chunks) and **MRR** (Mean Reciprocal Rank).
4. Recall@5 went from about 78% to 86%, and MRR improved from 0.71 to 0.79. The 10% figure was based on the recall@5 improvement.

The re-ranking step (using a cross-encoder) added another lift on top of that. And the hybrid search with BM25 specifically helped with queries containing exact terminology or codes that semantic search alone struggled with."

---

#### Q5: Walk me through your fine-tuning process. Why LoRA/QLoRA? What base model? How did you get 28% improvement?

"The motivation for fine-tuning was that our base model -- we started with Llama 2 13B and later moved to Mistral 7B -- didn't understand Compass Group's domain terminology well. Terms like specific menu codes, operational workflow names, and internal acronyms were either unknown or misinterpreted. The model would generate plausible-sounding but wrong answers about our specific processes.

**Why LoRA/QLoRA:** Full fine-tuning of a 7B+ parameter model was not feasible given our compute budget. We were running on AWS instances, and full fine-tuning would have required multiple A100s for days. LoRA let us train only the low-rank adaptation matrices -- typically rank 16 or 32 -- while keeping the base model weights frozen. That meant we could fine-tune on a single A10G GPU in a matter of hours. QLoRA took it further by quantizing the base model to 4-bit, which cut the memory footprint roughly in half and let us use the same hardware for the 13B model experiments.

**The process:**
1. **Data preparation:** I worked with the operations team to collect about 3,000 instruction-response pairs. These came from real support tickets, approved responses, and operational procedures that I reformatted into instruction-tuning format.
2. **Training:** Used the Hugging Face PEFT library. LoRA rank 16, alpha 32, dropout 0.05. Trained for 3 epochs with a cosine learning rate scheduler. Training took about 4 hours on a single GPU.
3. **Evaluation:** I built a held-out test set of 300 examples. I measured task-specific accuracy by having domain experts grade the responses on a rubric: correct, partially correct, or incorrect.
4. **Results:** The base Mistral 7B model scored about 58% fully correct on our domain-specific test set. After QLoRA fine-tuning, that jumped to 86% -- that's the 28% improvement. The 40% compute cost reduction compared to full fine-tuning came from using QLoRA's 4-bit quantization, which let us use smaller GPU instances.

One important lesson: the data quality mattered far more than the quantity. Our first round of fine-tuning with noisy data only got us to about 70%. After I cleaned the dataset and removed ambiguous examples, we hit 86% with less training data."

---

#### Q6: What was the most challenging bug/issue you faced? How did you debug it?

"The hardest issue was what I call 'agent drift' in the multi-agent system. After a few turns of conversation, the supervisor agent would start routing queries to the wrong specialized agent. A user might start asking about a menu item, get a correct answer, then ask a follow-up about the ingredient supplier, and the supervisor would route it to the inventory agent instead of keeping it with the menu agent.

The root cause was subtle. The conversation state accumulated context from previous turns, and by turn 3 or 4, the state contained tokens from multiple domains. The supervisor's routing prompt was being overwhelmed by the accumulated context, and it was latching onto keywords from previous turns rather than focusing on the current query.

Debugging this was tough because it wasn't reproducible with single-turn tests. I had to build multi-turn test scenarios and log every intermediate state in the LangGraph execution. I added detailed logging at each node in the graph -- the supervisor's classification, the confidence score, the state snapshot before and after each agent call.

Once I identified the pattern, the fix had two parts:
1. I added a **context windowing** mechanism that summarized older turns rather than passing raw history to the supervisor. This kept the routing prompt focused on recent context.
2. I added an **explicit intent confirmation** step where the supervisor would re-classify the intent after receiving context from the previous agent, rather than relying solely on the user's latest message.

The combination fixed the drift issue. The lesson was that multi-agent systems need observability built in from day one. I should have had that detailed logging from the start, not added it after the bug surfaced."

---

#### Q7: How did you measure the 40% reduction in manual support overhead?

"Compass Group's operations teams had a ticketing system for internal support requests -- things like 'What's the allergen info for this menu item?' or 'Is item X in stock at location Y?' Before the AI system, these were handled entirely by human support staff.

We measured the reduction in two ways:

First, **ticket deflection rate.** We tracked how many incoming queries were fully resolved by the AI system without any human intervention. Before the system, the support team handled about 2,000 tickets per week. After deployment, about 800 of those were being handled end-to-end by the agents. We validated this by sampling 100 deflected tickets per week and having the support team review whether the AI's answer was actually correct and complete. The correctness rate was above 92%.

Second, **time-to-resolution for escalated tickets.** Even for queries that still needed a human, the AI system pre-populated context and suggested answers, which cut the average handling time from about 8 minutes to 5 minutes.

The 40% figure came from combining both: fewer tickets reaching humans, and faster resolution for those that did. The operations team tracked this through their existing ticketing dashboard, so the measurement was straightforward. We reported it monthly and the number was stable after the first month of rollout."

---

#### Q8: What would you do differently if you rebuilt this system?

"A few things:

**First, I'd invest in evaluation infrastructure earlier.** We built the evaluation pipeline partway through, but I wish we'd had it from the start. Every time we changed a prompt, swapped a model, or adjusted the RAG pipeline, we were doing ad-hoc testing. A proper eval suite from day one would have saved us weeks of debugging and given us more confidence in each change.

**Second, I'd use a more sophisticated routing mechanism.** The supervisor agent worked, but it was essentially an LLM doing classification, which has inherent latency and occasional errors. I'd explore a lightweight classifier for routing -- maybe a fine-tuned small model or even a traditional ML classifier on query embeddings -- and reserve the LLM supervisor for complex multi-step queries.

**Third, I'd design for streaming from the start.** We initially built the system to return complete responses, but users wanted to see responses as they were generated. Retrofitting streaming into a multi-agent system where one agent might call another was painful. If I'd designed the LangGraph state management with streaming in mind, it would have been much cleaner.

**Fourth, I'd push harder on structured logging and tracing.** We eventually added good observability, but in the early days, debugging agent behavior was like reading tea leaves. I'd integrate something like LangSmith or a custom tracing solution from the very first prototype.

These aren't regrets exactly -- we shipped a system that works and delivers value. But next time, I'd front-load these architectural decisions."

---

### Grootan Technologies -- AI/ML Engineer (Jul 2023 - Dec 2023)

---

#### Q9: How did you implement LLM-as-Judge? What metrics did you track? How did you validate the judge itself?

"The motivation was that we had RAG-powered features in production, and manually reviewing output quality at scale wasn't sustainable. We needed automated quality monitoring.

**Implementation:**
I set up evaluation pipelines where a separate LLM (GPT-4 at the time) acted as the judge. For each production response, the judge received the original query, the retrieved context, and the generated answer, then scored on three dimensions:

1. **Accuracy:** Does the answer correctly address the question based on the retrieved context? Scored 1-5.
2. **Faithfulness:** Is the answer grounded in the retrieved documents, or does it contain information not in the context? Binary yes/no plus a confidence score.
3. **Hallucination detection:** Are there specific claims in the answer that contradict the source documents or introduce fabricated details? We flagged these at the sentence level.

We ran this on a sample of production responses -- about 10% of daily volume -- and tracked trends over time. If accuracy scores dropped below a threshold, or hallucination rates spiked, we'd get alerts.

**Validating the judge itself** was the hardest part. You can't just trust that the judge LLM is correct. My approach:
- I created a **gold-standard set** of 200 examples where human experts had provided the correct accuracy and faithfulness labels. I measured agreement between the LLM judge and human experts -- we achieved about 87% agreement on accuracy scores (within 1 point) and 91% on faithfulness.
- I ran **inter-annotator agreement** analysis between the LLM judge and two human reviewers, and the LLM's agreement rate was comparable to the agreement between the two humans.
- I **monitored for judge drift** by re-running the gold-standard set monthly to ensure the judge's behavior was stable.

The 60% reduction in manual QA review time came from this: instead of human reviewers checking every response, they only reviewed the ones the judge flagged as potentially problematic. The judge handled the routine quality checks."

---

#### Q10: Explain your hybrid RAG architecture. Why BM25 + dense + reranking? How did you tune weights?

"The core insight was that no single retrieval method handles all query types well.

**Dense embeddings** (we used a fine-tuned sentence-transformer) are great for semantic similarity -- 'What's the return policy?' matches 'How can I send back an item?' even though they share few keywords. But dense retrieval struggles with exact matches -- product IDs, technical codes, specific names.

**BM25** is the opposite. It's excellent for keyword matching and exact terms, but misses semantic equivalents. When a user asks about 'cancellation policy' and the document says 'termination of service,' BM25 won't find it.

**The hybrid approach:**
1. Query comes in. We run it through both BM25 (on an Elasticsearch index) and dense retrieval (on Weaviate) in parallel.
2. Each returns its top-20 candidates.
3. We merge the results using Reciprocal Rank Fusion (RRF). RRF is simple: for each document, compute 1/(k + rank) for each retriever, sum the scores, and re-sort. We used k=60, which is a common default that worked well for us.
4. The merged top-20 goes to a **cross-encoder reranker** (we used a fine-tuned ms-marco cross-encoder) that does a full query-document attention pass and produces final relevance scores.
5. Top-5 after reranking go into the LLM context.

**Tuning weights:** I initially tried weighted linear combination of BM25 and dense scores, but score distributions are on different scales and vary by query type, making weight tuning fragile. RRF was more robust because it only uses rank positions, not raw scores. We did tune the k parameter -- I swept k from 10 to 100 in steps of 10, evaluated on our test set, and k=60 gave the best recall@10.

The 20% improvement in retrieval relevance was measured against a dense-only baseline. We used a test set of 250 queries with human-annotated relevant documents. Recall@5 went from 72% to 86.5%, and NDCG@5 improved from 0.65 to 0.78."

---

#### Q11: How did you achieve 200ms query latency with Weaviate? What optimizations?

"200ms was the p95 latency for the full retrieval path -- query embedding, vector search, and result formatting. Getting there required several optimizations:

**1. Embedding caching.** We noticed many queries were semantically similar. I added an embedding cache using Redis that stored recent query embeddings with a TTL of 1 hour. Cache hit rate was about 30%, which eliminated the embedding computation (about 20-40ms) for those queries.

**2. Weaviate configuration tuning.** We tuned the HNSW index parameters:
   - `efConstruction` set to 256 (higher than default) for better index quality.
   - `ef` (search-time parameter) set to 128, which balanced recall and speed. Going higher didn't improve recall meaningfully but added latency.
   - We used the `flat` distance metric since our embeddings were normalized, which is faster than cosine computation.

**3. Schema design.** We denormalized our data so that each Weaviate object contained all the fields we needed in the response. This avoided any join-like operations or follow-up queries after retrieval.

**4. Connection pooling.** We maintained a pool of persistent gRPC connections to Weaviate rather than creating new connections per request. This cut about 10-15ms of connection overhead.

**5. Async retrieval.** The BM25 and dense retrieval paths ran in parallel using Python's asyncio. So the total retrieval time was the max of the two, not the sum.

Before optimization, we were at about 450ms p95. The biggest single win was the parallel execution of BM25 and dense retrieval -- that alone cut about 150ms. The other optimizations collectively shaved off the remaining 100ms."

---

#### Q12: Walk me through your FastAPI + Docker + AWS deployment. How did you handle zero-downtime?

"The production stack was:
- **FastAPI** for the API layer, serving inference endpoints.
- **Docker** containers for packaging. Each service (API server, embedding service, evaluation pipeline) had its own container.
- **AWS infrastructure:** We used EC2 instances behind an Application Load Balancer (ALB), with S3 for model artifacts and document storage.

**Zero-downtime deployment** was achieved with a blue-green deployment pattern:

1. We had two identical environments behind the ALB -- blue (current production) and green (new version staging).
2. When deploying a new version, we'd deploy the new Docker images to the green environment.
3. Health checks would run: API response checks, a smoke test suite of about 20 representative queries that verified end-to-end correctness, and latency checks.
4. Once green passed all health checks, the ALB would shift traffic from blue to green. We did a gradual shift -- 10% for 5 minutes, then 50% for 5 minutes, then 100%.
5. Blue stayed alive for 30 minutes as a rollback target. If any alerts fired, we could instantly shift traffic back.

The CI/CD pipeline ran on GitHub Actions:
1. On PR: linting, unit tests, integration tests against a test Weaviate instance.
2. On merge to main: build Docker images, push to ECR, deploy to green environment.
3. Automated smoke tests on green.
4. Manual approval gate for the traffic shift (we kept this manual for safety).

We also used Lambda for some async tasks -- like running the LLM-as-Judge evaluation pipeline on batches of production responses. That didn't need to be real-time, so Lambda's event-driven model was a good fit."

---

#### Q13: How did structured outputs help cut token usage by 25%?

"Before structured outputs, our LLM calls used free-form prompts like 'Answer the user's question based on the following context...' The model would often produce verbose responses with unnecessary preambles ('Based on the information provided, I can tell you that...'), restate the question, or include disclaimers that weren't needed for our use case.

With structured outputs, I defined explicit JSON schemas for each response type. For example, a product query response might have fields like:

```json
{
  \"answer\": \"string - direct answer to the question\",
  \"source_documents\": [\"list of document IDs used\"],
  \"confidence\": \"high/medium/low\",
  \"follow_up_needed\": \"boolean\"
}
```

This did three things that reduced token usage:

1. **No preamble/fluff.** The model went straight to populating the fields. The 'answer' field typically contained 40-60% fewer tokens than the free-form equivalent because the model didn't add filler text.

2. **Predictable response structure.** We could set `max_tokens` more tightly because we knew roughly how long each field would be. With free-form, we had to set a generous max_tokens to avoid truncation, which sometimes led to the model filling up the space with unnecessary detail.

3. **Better prompt engineering.** The structured format let us use more targeted few-shot examples. Instead of showing full conversation examples, we showed just the JSON output, which was much shorter but equally effective for guiding the model.

The 25% came from measuring average tokens per response over a week of production traffic before and after the switch. We went from an average of about 320 tokens per response to about 240. Output quality, as measured by our LLM-as-Judge pipeline, stayed within the same range."

---

#### Q14: What CI/CD pipeline did you set up? What tests ran in the pipeline?

"The pipeline was built on GitHub Actions with the following stages:

**On every pull request:**
1. **Linting and formatting:** Black, isort, flake8 for Python code quality.
2. **Unit tests:** Fast tests covering individual functions -- embedding generation, document parsing, prompt construction, API request/response validation. About 80 tests, running in under 2 minutes.
3. **Integration tests:** Tests that spun up a local Weaviate instance (via Docker Compose in the CI environment) and ran end-to-end retrieval tests. These verified that documents could be ingested, indexed, and retrieved correctly. About 30 tests, running in about 5 minutes.
4. **API contract tests:** Tests that hit the FastAPI endpoints with known inputs and verified the response schema and status codes.

**On merge to main:**
5. **Docker image build:** Build and push images to AWS ECR.
6. **Staging deployment:** Deploy to the green environment.
7. **Smoke tests on staging:** A suite of 20 end-to-end tests using real-world query examples. These checked response correctness, latency (must be under 500ms p95), and error rates.
8. **Manual approval gate:** A team member had to approve the production traffic shift.

**Nightly:**
9. **Evaluation suite:** Run the full 250-query evaluation set against the production system and compare metrics to the previous day. This caught gradual quality degradation.

We also had a **model versioning** check. Any PR that changed model artifacts or fine-tuning configurations had to include updated evaluation results in the PR description. This prevented accidentally deploying a worse model."

---

#### Q15: What was the biggest production incident? How did you handle it?

"The biggest incident was a silent retrieval degradation that we caught through our monitoring but not immediately.

What happened: After a routine data ingestion update, about 15% of our document chunks were indexed with stale embeddings. The ingestion script had a bug where it was reusing cached embeddings from a previous version of the documents instead of re-embedding the updated text. So the text content was new, but the embedding vectors were old and didn't match.

The effect was subtle. Retrieval still worked for most queries because the majority of embeddings were correct. But for queries related to recently updated content, relevance scores dropped, and users were getting outdated or partially wrong answers.

**How I caught it:** Our nightly evaluation suite showed a 4% drop in recall@5 compared to the previous week. That triggered an alert. When I investigated, I noticed the drop was concentrated in specific document categories -- the ones that had been recently updated.

**How I fixed it:**
1. Immediate: I identified the affected document chunks by comparing document update timestamps against embedding generation timestamps. Any chunk where the doc was updated after the embedding was generated was flagged.
2. I re-ran the embedding pipeline on just those chunks and re-indexed them.
3. I fixed the root cause in the ingestion script: added a check that invalidates cached embeddings when the source document's content hash changes.
4. I added a **data integrity check** to the CI pipeline that verifies embedding freshness after any ingestion run.

The whole incident from detection to full fix took about 6 hours. The lesson was that data pipeline bugs can be more insidious than application bugs because they degrade quality gradually rather than causing obvious failures."

---

#### Q16: How did you monitor model quality in production?

"We had three layers of monitoring:

**Layer 1: Real-time operational metrics.**
We tracked request latency (p50, p95, p99), error rates, and throughput via CloudWatch dashboards. This caught infrastructure issues -- if latency spiked or error rates increased, we'd know immediately. We had PagerDuty alerts for p95 latency above 500ms or error rate above 2%.

**Layer 2: Response quality sampling via LLM-as-Judge.**
As I described earlier, we ran the LLM-as-Judge evaluation on 10% of daily production responses. We tracked daily accuracy scores, faithfulness rates, and hallucination rates on a dashboard. We set alerts for:
- Average accuracy score dropping below 4.0 (out of 5)
- Hallucination rate exceeding 5%
- Faithfulness score dropping below 90%

These caught quality degradation even when operational metrics looked fine.

**Layer 3: Weekly human evaluation.**
Every week, the QA team reviewed 50 randomly sampled responses and provided ground-truth labels. This served as a check on the LLM judge itself and caught failure modes that automated evaluation might miss -- like responses that were technically correct but unhelpful, or answers that were right but phrased in a confusing way.

We also tracked **user feedback signals** -- when users asked the same question repeatedly (suggesting the first answer was unsatisfactory), or when queries were escalated to human support after the AI responded (suggesting the AI's answer didn't resolve the issue). These were proxy metrics but valuable for catching issues that purely accuracy-based evaluation missed."

---

### Grootan Technologies -- AI/ML Intern (Sep 2022 - Jul 2023)

---

#### Q17: Explain the hologram verification system. How does CV detect holograms?

"The system was part of a national ID authentication pipeline. When someone submitted a photo of their ID card for verification, one of the checks was whether the card had a valid hologram -- real ID cards have holograms that are difficult to counterfeit.

**How hologram detection works with computer vision:**

Holograms have distinctive visual properties. Under normal lighting, they produce iridescent, rainbow-like patterns that shift when you change the viewing angle. In a static image, this manifests as:
1. **Multi-colored reflective regions** with sharp color gradients.
2. **High-frequency texture patterns** that differ from the rest of the card.
3. **Specific spatial locations** on the card where the hologram should appear.

Our approach combined traditional CV and deep learning:

1. **Preprocessing:** We normalized the image -- color correction, perspective transformation to flatten the card, and cropping to the region where the hologram was expected.
2. **Feature extraction:** We used color histogram analysis in the HSV color space to detect the characteristic multi-hue signature of holograms. Genuine holograms show peaks across multiple hue values, while printed fakes tend to have a narrower color distribution.
3. **Deep learning classification:** We fine-tuned a convolutional network (started from a pre-trained ResNet-50) on a dataset of genuine hologram images vs. fake/missing hologram images. The model learned to detect subtle texture patterns that the handcrafted features missed.
4. **Ensemble decision:** The final verdict combined the color analysis score and the CNN confidence score.

The challenge was that hologram appearance varies significantly based on lighting and camera quality. We dealt with this by augmenting our training data with different lighting conditions and camera noise levels."

---

#### Q18: How did you reduce latency from 4 min to 2 min? What were the bottlenecks?

"The original pipeline was a sequential chain of verification steps, and the latency was spread across several bottlenecks:

**Bottleneck 1: Image preprocessing (about 60 seconds).** The original code downloaded the full-resolution image, ran multiple preprocessing steps sequentially (resizing, color correction, noise reduction, perspective correction), and wrote intermediate results to disk between steps. I fixed this by: (a) resizing the image early to reduce the pixel count for downstream steps, (b) keeping intermediate results in memory using NumPy arrays instead of writing to disk, and (c) combining some preprocessing steps that could run in a single pass.

**Bottleneck 2: Multiple model inference calls (about 90 seconds).** The pipeline ran several ML models sequentially -- face detection, face matching, text OCR, hologram detection. Each model was loaded fresh for each request. I fixed this by: (a) keeping models loaded in memory as persistent objects rather than reloading per request, and (b) parallelizing independent inference steps. Face detection and hologram detection didn't depend on each other, so I ran them concurrently using Python threading (since the actual inference was happening in C++ backend libraries that released the GIL).

**Bottleneck 3: External API calls (about 60 seconds).** We called external government APIs for data verification. These had variable response times. I added connection pooling, timeouts, and a retry mechanism with exponential backoff. I also cached responses for repeat verifications within a time window, since some customers submitted multiple times.

**Bottleneck 4: Result compilation and response formatting (about 30 seconds).** The original code did a lot of redundant computation when assembling the final verification report. I refactored this to compute each field once and reuse it.

The total went from roughly 4 minutes to roughly 2 minutes. The biggest single win was parallelizing the independent ML inference steps and keeping models in memory -- that alone saved about a minute."

---

#### Q19: How did transfer learning help with limited labeled data?

"We had a fundamental data problem. Hologram images from real ID cards are sensitive data, and we could only collect a limited dataset -- about 1,500 genuine hologram images and about 800 fake or missing hologram images. Training a CNN from scratch on this would have been severely overfit.

Transfer learning let us start from a ResNet-50 that was pre-trained on ImageNet. ImageNet doesn't have holograms, but the lower layers of the network had already learned to detect general visual features -- edges, textures, color patterns, shapes. These features transfer well to our domain.

**Our approach:**
1. We froze the first 40 layers of ResNet-50 (the general feature extractors) and only fine-tuned the later layers plus a new classification head.
2. We used aggressive data augmentation: random rotation (up to 15 degrees), brightness and contrast jittering (to simulate different lighting), Gaussian noise (to simulate camera quality variation), and horizontal flips.
3. We trained with a low learning rate (1e-4) and used early stopping based on validation accuracy to avoid overfitting.
4. We used class weights to handle the imbalance between genuine and fake samples.

The result was that we achieved meaningful accuracy improvement compared to training from scratch, where the model basically memorized the training set and failed on new examples. The pre-trained features gave the model a strong starting point, and fine-tuning the later layers adapted those features to the specific patterns of holograms.

The key insight was that hologram detection is fundamentally a texture classification problem, and texture features are well-represented in ImageNet-pretrained networks."

---

#### Q20: What was the production architecture?

"The production system was a Python backend service that processed ID verification requests:

**API layer:** A RESTful API (using Flask at the time) that received verification requests. Each request included an image of the ID card and metadata about the ID type.

**Processing pipeline:** A sequential pipeline that ran:
1. Image validation (checking format, resolution, blur detection)
2. ID card detection and perspective correction
3. Face detection and extraction
4. OCR for text fields
5. Hologram detection
6. Face matching against a reference photo
7. Data verification against external APIs
8. Result compilation

**Infrastructure:** Hosted on AWS EC2 instances. We used S3 for image storage. The ML models were loaded on GPU-enabled instances (we used g4dn instances with T4 GPUs for inference). We had a basic load balancer distributing requests across two instances for redundancy.

**Database:** PostgreSQL for storing verification results, audit logs, and request metadata. We needed strong auditability given the sensitive nature of ID verification.

**Monitoring:** Basic CloudWatch monitoring for uptime, request counts, and error rates. We also logged every verification step's outcome for debugging and auditing purposes.

It wasn't the most sophisticated architecture -- this was early in my career -- but it was reliable and processed thousands of verifications daily. The experience taught me the basics of production systems: reliability, logging, error handling, and thinking about what happens when things fail."

---

#### Q21: How did you handle different ID formats?

"India has multiple national ID formats -- Aadhaar cards, PAN cards, voter IDs, driving licenses -- and each has a different layout, hologram placement, text format, and security features.

We handled this with a modular approach:

1. **ID type classification:** The first step in the pipeline was classifying which type of ID the image contained. We trained a lightweight classifier (MobileNet-based) for this, which was fast and accurate since the overall layout of each ID type is visually distinct.

2. **Configuration-driven processing:** Each ID type had a configuration file that specified: the expected hologram location (as a bounding box relative to the card dimensions), the text field locations for OCR, the expected font and format for fields like ID number, and the face photo location.

3. **Type-specific models:** The hologram detection model was trained with type-specific data since each ID type has a different hologram design. We fine-tuned separate classification heads for each ID type while sharing the base feature extractor.

4. **Validation rules:** Each ID type had its own validation rules -- for example, Aadhaar numbers follow a specific format (12 digits with a checksum), while PAN numbers have a different alphanumeric pattern.

When a new ID format was added, we needed to: create the configuration file, collect training data for that ID type's hologram, fine-tune the hologram detection head, and define the validation rules. The modular architecture meant we didn't have to retrain or modify the entire pipeline for each new format."

---

### iNeuron.ai -- Data Science Intern (Nov 2021 - Mar 2022)

---

#### Q22: Walk me through the credit card default prediction model.

"This was a binary classification problem: given a customer's profile and payment history, predict whether they'll default on their credit card payment next month.

**Data:** We worked with a dataset of about 30,000 customer records with features like credit limit, age, education, marital status, and six months of payment history (payment amount, bill amount, repayment status for each month).

**EDA:** I started with exploratory analysis. Key findings included: payment history was by far the most predictive feature -- customers who had been late in recent months were much more likely to default. Credit limit had a non-linear relationship with default rate. There was a class imbalance -- about 22% default rate.

**Feature engineering:** I created features like: average payment ratio (payment amount / bill amount) over the six months, payment trend (improving or worsening), and consecutive months of late payment.

**Modeling:** I tried multiple approaches:
- Logistic Regression as a baseline (about 81% accuracy)
- Random Forest (about 93% accuracy)
- XGBoost (about 96% accuracy)
- A stacked ensemble of Random Forest + XGBoost with a Logistic Regression meta-learner (97% accuracy)

**Handling class imbalance:** I used SMOTE (Synthetic Minority Over-sampling Technique) for the training set and kept the test set at the natural distribution for realistic evaluation.

**Deployment:** Packaged the model with Docker, set up a CircleCI pipeline for automated testing and deployment, and deployed to AWS. The CircleCI pipeline ran tests on every push, built the Docker image, and pushed it to AWS.

This was my first end-to-end ML project, and it taught me the full lifecycle -- from data exploration to production deployment."

---

#### Q23: How did you achieve 97% accuracy? What about precision/recall tradeoffs for fraud?

"The 97% accuracy came primarily from the ensemble approach and good feature engineering. But I want to be honest about a nuance here -- in a credit default prediction context, accuracy alone is misleading because of the class imbalance.

With 78% non-default and 22% default, a model that predicts 'no default' for everyone would get 78% accuracy. So the real measure of model quality was in the precision and recall for the default class.

Our stacked ensemble achieved:
- **Precision for default class:** About 85% -- meaning when the model predicted a customer would default, it was right 85% of the time.
- **Recall for default class:** About 78% -- meaning it caught 78% of actual defaults.
- **F1 score for default class:** About 0.81.

The precision/recall tradeoff is a business decision. In credit card default prediction:
- **High precision, lower recall** means you're conservative in flagging defaults. You miss some defaults, but you don't falsely flag good customers. This is preferred if the cost of falsely flagging a customer (losing their business) is high.
- **High recall, lower precision** means you catch more defaults, but also flag more good customers. This is preferred if the cost of a missed default (financial loss) is high.

I tuned the classification threshold to optimize for recall, since the business cost of a missed default was typically higher than the cost of extra scrutiny on a good customer. At a threshold of 0.35 (instead of the default 0.5), recall went up to about 86% with precision dropping to about 76%, which was a better tradeoff for this use case.

This was an important learning moment for me -- accuracy is a starting metric, but the real-world decision depends on the cost matrix."

---

#### Q24: How was the CI/CD pipeline set up?

"The pipeline used CircleCI and had a straightforward structure:

**On every push:**
1. **Install dependencies** from requirements.txt in a Docker-based CircleCI environment.
2. **Run linting** checks (pylint).
3. **Run unit tests:** Tests covering data preprocessing functions, feature engineering functions, and prediction endpoint.
4. **Run model validation:** Load the model artifact, run it against a small held-out validation set, and assert that accuracy was above a minimum threshold (95%). This caught cases where someone accidentally committed a broken or untrained model.

**On merge to main:**
5. **Build Docker image** containing the model, the API server (a Flask app), and all dependencies.
6. **Push Docker image** to AWS ECR.
7. **Deploy to AWS EC2** using a deployment script that pulled the latest image and restarted the container.

It was a simple pipeline compared to what I'd build today, but it was my first time setting up CI/CD for an ML project, and it taught me the fundamentals: automated testing, containerization, and automated deployment. The most valuable lesson was that having any CI/CD pipeline is infinitely better than manual deployment, even if the pipeline is basic."

---

#### Q25: What was the most important feature you found in EDA?

"The single most important feature was **recent payment status** -- specifically, whether the customer had been late on payments in the most recent 1-2 months.

During EDA, I plotted default rates segmented by each feature. Payment status had the clearest signal: customers who were 2+ months late in any of the last 3 months had about a 60% default rate, compared to about 12% for customers who were current on payments. No other single feature came close to that separation.

The second most important finding was the **payment ratio trend** -- the ratio of payment amount to bill amount over time. Customers whose payment ratios were declining (paying less of their balance over time) defaulted at about 3x the rate of those with stable or improving ratios. This wasn't a raw feature in the dataset; I engineered it by computing the slope of payment ratios over the six-month history.

Interestingly, some features I expected to be predictive were not. Education level had almost no predictive power after controlling for payment history. Credit limit had some predictive power but was confounded -- higher credit limits were given to better customers, so the relationship was inverse to what you might naively expect.

The EDA phase was where I learned that understanding your data deeply is more valuable than trying fancier models. The feature engineering I did based on EDA insights contributed more to model performance than the choice between Random Forest and XGBoost."

---

## Section 3: Behavioral Questions (STAR Format)

---

### 1. Tell me about a time you solved a difficult technical problem.

**Situation:** At Compass Group, our multi-agent system had a subtle bug where the supervisor agent started routing queries to the wrong specialized agent after 3-4 turns of conversation. It only happened in multi-turn sessions and was not reproducible in our single-turn tests.

**Task:** I needed to identify the root cause and fix it without disrupting the production system, which was already handling hundreds of queries daily.

**Action:** I instrumented the LangGraph state graph with detailed logging at every node -- capturing the supervisor's classification decision, confidence score, and full state snapshot. I then built a set of 30 multi-turn test scenarios that mimicked real user conversations. Running these with the instrumentation revealed the pattern: accumulated context from previous turns was polluting the supervisor's routing decision. The supervisor was latching onto keywords from earlier turns rather than focusing on the current query. I implemented two fixes: a context windowing mechanism that summarized older turns instead of passing raw history, and an explicit intent re-classification step after each agent handoff.

**Result:** The routing accuracy for multi-turn conversations went from about 82% to 96%. The fix also improved response quality because queries were reaching the right agent with the right context. The bigger takeaway was that I built the observability infrastructure that we should have had from the start, which caught several smaller issues going forward.

---

### 2. Tell me about a time you disagreed with a teammate.

**Situation:** At Grootan Technologies, when building the hybrid RAG pipeline, a senior developer on the team wanted to go with a pure dense retrieval approach using only Weaviate. He argued that BM25 was "legacy technology" and that modern embeddings could handle all query types. I believed we needed the hybrid approach.

**Task:** I needed to either convince him with evidence or accept his approach if the data didn't support my position.

**Action:** Instead of arguing theoretically, I proposed a bake-off. I set up an evaluation on our existing query logs: 200 queries classified into three types -- semantic queries, keyword/exact-match queries, and mixed queries. I ran both approaches and measured recall@5 for each query type. Dense-only performed well on semantic queries (88% recall) but poorly on keyword queries (61% recall). The hybrid approach performed well on both (85% and 82% respectively). I presented the results in a team meeting with the data laid out clearly. I also acknowledged that the hybrid approach added complexity and proposed a specific architecture that kept the complexity manageable.

**Result:** He agreed with the data. We went with the hybrid approach, and the production system benefited from it -- especially for queries with product codes and specific terminology. What I learned was that data settles technical disagreements faster than opinions. I also learned to respect the other person's perspective; his concern about complexity was valid, and I made sure to address it.

---

### 3. Tell me about a time you had to learn something quickly.

**Situation:** When I joined Compass Group, the team had decided to use LangGraph and MCP for the multi-agent system. I had experience with LangChain and basic agent patterns, but LangGraph's state graph paradigm and MCP were new to me. I had about two weeks before I needed to start building.

**Task:** I needed to get productive with both technologies quickly enough to make architectural decisions and start implementation.

**Action:** I took a structured approach. First, I read the LangGraph documentation end-to-end and built three small prototype agents in the first week -- each with increasing complexity (single agent, two-agent handoff, multi-agent with shared state). For MCP, I studied the protocol specification and built a simple MCP server that exposed a calculator as a tool, then connected it to a LangGraph agent. I also read the source code of both libraries to understand how they worked under the hood, not just the API surface. By the end of week two, I had a working prototype of our supervisor-agent architecture with MCP tool integration.

**Result:** I was contributing to architectural decisions by week three and had the first production agent running by week five. The key to learning quickly was building things immediately rather than just reading. Each prototype I built raised questions that I then researched, which made the learning much more targeted and efficient.

---

### 4. Tell me about a time you improved a process.

**Situation:** At Grootan Technologies during my internship, the ID verification pipeline was taking 4 minutes per request, which was causing user drop-off. Customers would submit their ID photo and then abandon the process because they didn't want to wait.

**Task:** I was asked to find ways to reduce the latency without sacrificing verification accuracy.

**Action:** I profiled the entire pipeline to identify where time was being spent. I found four main bottlenecks: image preprocessing was writing intermediate files to disk, ML models were being reloaded for every request, independent verification steps were running sequentially, and external API calls had no timeouts or connection pooling. I addressed each one systematically: kept intermediate data in memory, made models persistent, parallelized independent steps using threading, and added connection pooling and timeouts for external calls.

**Result:** Latency dropped from 4 minutes to 2 minutes -- a 50% improvement. Customer drop-off during the verification step decreased noticeably. The approach I took -- profiling first, then addressing bottlenecks in order of impact -- became a template I still use today. I learned not to guess where the bottleneck is but to measure it.

---

### 5. Tell me about a time you failed.

**Situation:** At Compass Group, during the early stages of our fine-tuning work, I was eager to show results quickly. I collected training data from support tickets and operational documents, did minimal cleaning, and ran a LoRA fine-tuning job. The model showed improvement on my quick manual tests, and I reported encouraging results to the team.

**Task:** When we ran a more rigorous evaluation a week later, the fine-tuned model was only marginally better than the base model -- about 70% accuracy on domain-specific tasks versus 58% for the base model, when I had implied we were much further along.

**Action:** I owned up to the team that my initial assessment was premature and not based on rigorous evaluation. I then did what I should have done from the start: built a proper evaluation set with domain expert input, cleaned the training data thoroughly (removing ambiguous and contradictory examples), and re-ran the fine-tuning. I also established the rule that any model evaluation needed to be done on a standardized test set with documented metrics, not ad-hoc manual testing.

**Result:** The second round of fine-tuning achieved 86% accuracy -- a genuine 28% improvement. The failure taught me two things: first, never report results without rigorous evaluation. Second, data quality matters more than data quantity in fine-tuning. I still follow the principle of building the evaluation pipeline before building the model.

---

### 6. Tell me about a time you handled ambiguity.

**Situation:** When I started at Compass Group, the project brief was vague: "Build an AI system to help with operations." There was no specific requirements document, no defined user stories, and different stakeholders had different ideas about what the system should do.

**Task:** I needed to turn this ambiguous brief into a concrete, buildable system architecture.

**Action:** I started by talking to actual users -- the operations team members who would use the system. Over two weeks, I sat with support staff, shadowed their workflow, and categorized the types of queries they handled daily. I identified four main categories (menu, scheduling, inventory, general support) that covered about 85% of their queries. I then proposed the multi-agent architecture with specialized agents for each category, starting with the highest-volume category (menu queries) as a proof of concept. I wrote a one-page design doc for each agent with sample queries, expected behavior, and success metrics, and got stakeholder sign-off before building.

**Result:** Starting with the menu agent as an MVP let us deliver value quickly -- within a month -- and validate the architecture before building out the other agents. The stakeholders appreciated having something tangible to react to rather than a theoretical design. I learned that the best way to resolve ambiguity is to talk to end users and deliver small increments.

---

### 7. Tell me about a time you had to make a tradeoff.

**Situation:** At Compass Group, I had to decide between using a larger, more capable LLM (Llama 2 70B) for the agents versus a smaller model (Mistral 7B) that was faster and cheaper but less capable out of the box.

**Task:** I needed to pick the model that would best serve the production system's needs: accuracy, latency, and cost.

**Action:** I ran a structured comparison. I evaluated both models on our domain-specific test set for accuracy. The 70B model scored about 72% out of the box; Mistral 7B scored 58%. However, the 70B model had 3x the latency (about 2 seconds per response vs. 700ms) and 4x the inference cost. I then explored whether fine-tuning could close the gap. After QLoRA fine-tuning on our domain data, Mistral 7B reached 86% -- significantly better than the 70B base model. I documented the tradeoff analysis: fine-tuned Mistral 7B was more accurate than base Llama 70B, 3x faster, and 4x cheaper, with the one-time cost of fine-tuning.

**Result:** We went with fine-tuned Mistral 7B. The decision saved roughly 40% on compute costs while delivering better accuracy. The lesson was that a smaller model fine-tuned on your data often beats a larger general-purpose model, and that tradeoff decisions should be driven by data, not assumptions about model size.

---

### 8. Why are you interested in AI engineering?

"What excites me about AI engineering is the combination of building systems and pushing the boundaries of what's possible. I got into this space when I was at my first internship building a basic ML model, and since then, the field has moved from 'can we classify this image' to 'can we build autonomous agents that reason and use tools.' I've been fortunate to ride that wave -- going from traditional ML to computer vision to LLM-based systems to multi-agent architectures.

What specifically draws me to AI engineering versus research is the production aspect. I love the challenge of taking a model or technique that works in a notebook and making it work reliably at scale in production, with real users depending on it. The debugging is harder, the constraints are tighter, but the impact is more direct.

And the pace of the field is exhilarating. In the last year alone, I've had to learn LangGraph, MCP, new fine-tuning techniques, new evaluation methods. I genuinely enjoy that constant learning. It doesn't feel like work to me when I'm reading about a new agent framework on a weekend."

---

### 9. Where do you see yourself in 5 years?

"In five years, I want to be a senior AI engineer or technical lead responsible for the architecture and strategy of AI systems at a company that's pushing the boundaries of what AI can do in production.

Technically, I want to be deep in the agentic AI and multimodal space. I believe the next few years will see AI systems that can reason, plan, and act across multiple modalities and tool ecosystems, and I want to be building those systems.

In terms of scope, I want to go from building individual agents and pipelines to owning the end-to-end AI platform -- the infrastructure, the evaluation systems, the deployment pipelines, the monitoring. And I want to be mentoring junior engineers, because I've benefited enormously from mentors in my own career.

I'm not fixated on a specific title. What matters to me is working on hard problems, having ownership over the systems I build, and being on a team where I'm learning from people who are better than me."

---

### 10. What's your biggest weakness?

"I tend to over-engineer solutions early on. At Compass Group, when we first started the multi-agent project, I spent time designing an elaborate plugin system for adding new agents, with configuration files and dynamic loading. My manager pointed out that we had three agents to build, not thirty, and a simpler approach would get us to production faster. He was right -- we shipped the simpler version, and the elaborate plugin system was never needed.

I've been actively working on this. I now explicitly ask myself: 'What's the simplest thing that works for the current requirements?' before designing anything. I also try to timebox design phases -- if I've been designing for more than a day without writing code, I force myself to start building. The pattern I've found useful is to build the simple version first and refactor when the complexity is actually warranted. It's still a conscious effort, but I've gotten much better at it."

---

### 11. Tell me about a time you worked under pressure.

**Situation:** At Grootan Technologies, we had a production incident where the ID verification system's accuracy dropped sharply over a weekend. A client had a batch of 500+ verifications queued for Monday morning, and the system was rejecting valid IDs at about 3x the normal rate.

**Task:** I needed to diagnose and fix the issue before the Monday morning batch, with the client's operations depending on the system working correctly.

**Action:** I came in on Sunday evening and started investigating. I pulled logs for the rejected verifications and compared them to recent successful ones. The pattern was that IDs photographed with certain newer phone cameras were failing the preprocessing step -- the images had slightly different color profiles that threw off the hologram detection model. The root cause was that a phone manufacturer had pushed a camera software update that changed the default color processing. I wrote a normalization step that standardized the color profile before processing, tested it on the failing cases, confirmed they now passed, deployed the fix, and re-ran the failed batch.

**Result:** The fix was deployed by Monday 6 AM. The client's batch processed successfully. I then added a broader color normalization step to the preprocessing pipeline and created a monitoring alert for sudden spikes in rejection rates. The experience reinforced that production systems need to be robust to input variations you don't anticipate.

---

### 12. How do you stay updated with AI?

"I have a multi-layered approach. For daily awareness, I follow key researchers and practitioners on X/Twitter and read the Hacker News and Reddit ML threads. I subscribe to a few curated newsletters -- The Batch by Andrew Ng, and Papers With Code weekly digest.

For deeper learning, I read 2-3 papers per week. I don't read every paper cover to cover -- I triage by reading the abstract and conclusion first, and only do a deep read if it's relevant to what I'm building or exploring. Recently, I've been focused on papers about agent architectures, tool use, and evaluation methods.

For hands-on learning, I build things. When MCP came out, I didn't just read about it -- I built a prototype. When new fine-tuning techniques are published, I try them on a small project. That hands-on experimentation is where the real understanding comes from.

I also participate in the LangChain and LangGraph community Discord channels, which are great for learning about real-world patterns and issues that don't show up in papers.

Finally, I've published two IEEE papers myself, which keeps me connected to the academic side and forces me to think rigorously about methodology."

---

### 13. Tell me about a time you went above and beyond.

**Situation:** At Compass Group, after deploying the multi-agent system, I noticed from production logs that a significant number of user queries were about topics our system didn't cover -- things like HR policies, benefits questions, and IT support requests. These queries were getting generic "I can't help with that" responses.

**Task:** My assigned responsibility was the four operational agents. The HR/benefits/IT queries were technically someone else's problem.

**Action:** I analyzed two weeks of production logs and categorized the unhandled queries. About 35% of "unhandled" queries were actually HR and benefits related. I built a simple RAG pipeline over the company's HR documentation as a proof of concept -- this only took me about a day since the infrastructure was already in place. I presented it to my manager with the data: "35% of our unhandled queries could be addressed with this additional agent." I offered to build it as a production agent if given the time.

**Result:** My manager approved the work, and we deployed an HR support agent within two weeks. This expanded the system's coverage significantly and was well-received by the operations team. It also strengthened my case for the agentic architecture -- the modularity meant adding a new agent was relatively easy. The lesson was that production data tells you what to build next if you're paying attention.

---

### 14. How do you handle disagreements about technical approach?

"My approach is data-first. Technical disagreements usually happen because each person is optimizing for a different constraint or has different assumptions. So the first thing I do is make sure we agree on the problem definition and success criteria. If we agree on what we're optimizing for, the disagreement often narrows to something we can test.

At Grootan, I had the disagreement about hybrid RAG versus dense-only retrieval. Instead of debating, I proposed a bake-off with clear metrics. The data settled it. At Compass Group, when there was a discussion about model size, I ran benchmarks. In both cases, the willingness to test both approaches and respect the results was what moved us forward.

When the disagreement is more about approach than about a testable hypothesis -- say, a design philosophy or architecture choice -- I try to focus on tradeoffs rather than right or wrong. I'll say something like: 'Your approach optimizes for X, mine optimizes for Y. Which is more important for our situation?' That reframes the discussion from a debate to a joint decision.

I also try to genuinely listen. I've been wrong before, and the other person's approach has sometimes been better. Being open to that makes these discussions productive rather than adversarial."

---

### 15. What's the most impactful project you've worked on?

**Situation:** The multi-agent AI system at Compass Group is the most impactful project I've worked on, both in terms of technical scope and business impact.

**Task:** Compass Group is a massive food services and facilities management company. Their operations teams were spending huge amounts of time on repetitive support queries -- menu questions, scheduling lookups, inventory checks. The task was to automate these workflows with AI.

**Action:** I architected and built a multi-agent system from the ground up. This involved: designing the agent orchestration with LangGraph, integrating with live operational APIs via MCP, building RAG pipelines for document retrieval, implementing hybrid search with semantic chunking and reranking, and fine-tuning domain-specific LLMs. I was the primary engineer on the project, making most of the architectural decisions and doing the implementation.

**Result:** The system reduced manual support overhead by 40%, improved retrieval accuracy by 10% over baseline, and the fine-tuned models achieved 28% better task-specific accuracy while reducing compute costs by 40%. But beyond the numbers, the impact was that hundreds of operations staff members got hours of their week back. They went from answering the same questions repeatedly to focusing on higher-value work. Seeing an AI system I built change how an entire operations organization works was deeply satisfying and confirmed that this is what I want to keep doing.

---

## Section 4: Tricky Questions & How to Handle Gaps

---

### "I see a gap between Dec 2023 and Jan 2025 -- what were you doing?"

"I was completing my Master's in Computer Science at Missouri State University. I moved to the US for the program and was a full-time student, focusing on data science coursework, and I published two IEEE research papers during that time. I graduated in December 2024 with a 3.63 GPA and started at Compass Group in January 2025. It was a deliberate decision to invest in deepening my fundamentals before continuing my career in the US."

---

### "Your internship was 10 months -- why so long?"

"The internship at Grootan Technologies started as a standard engagement, but the scope of the project -- building a production ID verification system with computer vision -- was substantial. I took on increasing responsibility over time, eventually owning major components of the system and delivering the 50% latency reduction. The length reflected the complexity of the project and my growing contributions, which is why they brought me on full-time immediately after. Looking back, that extended hands-on experience with a production system was the most valuable learning period of my early career."

---

### "Why did you leave India?"

"I wanted to pursue a Master's degree to deepen my technical foundations, and the US had the strongest programs for my focus area -- data science and AI. Missouri State offered a program with the right combination of coursework and research opportunities. Beyond academics, I wanted the experience of working in the US tech ecosystem, which is where many of the leading AI companies and research labs are. It was a calculated career investment."

---

### "Why Compass Group? It's not a tech company."

"That's actually part of what attracted me. Compass Group is a massive enterprise -- one of the largest in food services globally -- with real operational complexity. Building AI for a tech company where the infrastructure and data pipelines already exist is one challenge. Building AI for an enterprise that is just beginning its AI transformation is a different and, I'd argue, harder challenge. I get to solve greenfield problems, make high-impact architectural decisions, and see the direct impact on thousands of people's daily work. The 40% reduction in support overhead wasn't an abstract metric -- it changed how real operations teams work every day."

---

### "Your experience is mostly short stints -- why?"

"I understand how it looks on paper, but let me walk through the progression. iNeuron was a structured four-month internship program. At Grootan, I did a 10-month internship that led directly to a full-time role -- so that's really one continuous engagement of 16 months, where I grew from intern to building production systems. Then I left for my Master's program in the US, which was a planned career move. At Compass Group, I've been here for over a year now and I'm continuing to grow the scope of the AI platform. Each transition had a clear reason, and within each role, I delivered significant results."

---

### "Do you have experience leading a team?"

"I haven't had a formal team lead title, but I've had meaningful leadership experience. At Compass Group, I'm the primary architect of the multi-agent system, which means I make the key technical decisions and other engineers build on the architecture I've designed. I've onboarded two engineers onto the platform, written the architectural documentation, and run the design reviews for new agent integrations. At Grootan, as a full-time engineer, I mentored the newer interns on production ML practices. I'm ready to step into a formal tech lead role and am actively looking for opportunities that include that growth path."

---

### "What's your salary expectation?"

"I'd like to understand the full compensation package -- base, bonus, equity, benefits -- before anchoring on a number. My focus is on finding the right role where I can grow and have impact. That said, I've researched market rates for AI Engineers with my experience level in this area, and I'm expecting something competitive with that range. I'm flexible and open to discussing what works for both sides once we've established mutual fit. Can you share the budgeted range for this role?"

---

*End of Interview Prep Document*

*Remember: Practice these answers out loud. Modify specific details to match your exact experience. The structure and framing here are designed to be honest, confident, and technically impressive. You know this material -- you lived it.*
