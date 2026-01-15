# Vibe coding content outlines

#  **ACT I — The Vibe Zone**

*Why vibe coding feels magical… until it doesn’t.*

---

## **1\) The Vibe Zone**

**Subtitle:** The One-Shot Radius. Your app only vibe-codes well inside a certain complexity perimeter.

**Intro paragraph:**

Every vibe coder learns the same rule the hard way: there’s a distance you can throw an idea before it breaks on impact. Inside that radius, the model can hold the whole thing in its “mind,” you can iterate by poking the UI, and progress feels like skating downhill. Outside it, you hit the complexity cliff: things that only happen on Tuesdays (webhooks), things you can’t see in the browser (policies), and things that fail silently (billing edge cases). This post names that boundary, treats it like a design constraint instead of a personal failure, and shows how the stack you choose decides whether your project lives in the one-shot world or the slow, expensive world.

* Define “vibe zone”

* Define “one-shot radius” (scope where generation \+ iteration stays coherent)

* What expands it: simpler stack, fewer layers, smaller state surface

* What shrinks it: billing edge cases, webhooks, multi-tenant policies, hidden auth

* Why Vibes DIY expands the radius by collapsing infrastructure into the artifact

* A practical checklist: “Will this idea fit inside one-shot?”

---

## **2\) Code Got Cheap. Complexity Didn’t.**

**Subtitle:** In the LLM era, “budget” means cognitive load, not dollars.

**Intro paragraph:**

People keep asking whether software got cheaper. It did—but not in the way they mean. Code got cheap. Complexity did not. The burn rate moved from “writing functions” to “carrying a system in your head,” from “can we implement this?” to “can we understand what we shipped when it breaks in production?” Vibe coding makes this painfully obvious because it accelerates you into the parts of the stack that were always expensive, just hidden behind ceremony. This post reframes “budget” as the scarce resource it actually is now: conceptual surface area.

* Why code got cheap faster than understanding did

* The new bottleneck: *maintaining a coherent mental model*

* What “complexity budget” looks like in practice (blast radius, hidden state, off-screen enforcement)

* Why your stack is explicitly a “complexity budget allocator”

* How to tell when you’re over budget before users do

---

## **3\) The Stack That Lets You Jam**

**Subtitle:** Why “local state \+ sync library” is a groovebox mental model for LLMs.

**Intro paragraph:**

There are two kinds of music machines: the ones that invite play and the ones that invite engineering. A groovebox gives you a tight loop: press, hear, adjust, repeat. A modular synth gives you possibility—but you pay for it in routing, debugging, and “why is there no sound” archaeology. Most server-centric stacks are modular rigs: endpoints, headers, schemas, auth, policies, retries, and that one cursed CORS error that means you’re done for the night. For vibe coders, the groovebox wins—not because it’s less powerful, but because it keeps the feedback loop inside the room the model can see.

* Groovebox mindset: immediate feedback, tight loop, fewer interconnects

* Modular mindset: expressive, but demands expert routing and debugging

* Server stacks as modular rigs: endpoints, headers, schemas, auth, policies

* Fireproof as groovebox: one interface (“read/write local JS”), sync handled elsewhere

* Why LLMs compose better under groovebox constraints

---

## **ACT II — Seeing What the Model Sees**

*What the LLM can perceive, reason about, and safely compose.*

---

## **4\) “The LLM Doesn’t See Your Services—Only Your Sentences”**

**Subtitle:** Off-screen enforcement is where vibe-coded apps go to die.

**Intro paragraph:**

A vibe coder’s superpower is speed—until the app’s behavior depends on things that aren’t in the prompt, aren’t in the file, and aren’t on the screen. Traditional stacks hide the sharp edges off-stage: environment variables, IAM, middleware, database policies, migrations, webhooks. The model can’t reliably maintain what it can’t perceive, so it writes cheerful code that accidentally has the blast radius of a meteor. The fix isn’t “be more careful.” It’s to reduce the off-screen surface area, and to design stacks whose correctness lives inside the artifact the model is actually editing.

* The “off-screen surface area” problem (env vars, IAM, middleware, policies, migrations)

* Why models generate dangerous code: they can’t perceive blast radius that lives outside text

* How single-artifact stacks reduce off-screen surface area

* “Closure” as the real advantage: fewer implicit contracts to maintain

* A concrete comparison: Next/Supabase vs Vibes/Fireproof in terms of hidden enforcement

---

## **5\) Why This Worked Yesterday and Broke Today**

**Subtitle:** Why simpler systems make smarter AI.

**Intro paragraph:**

We talk about LLMs like they’re typing code, but the real act is compression: taking a messy world and turning it into a story the model can keep consistent across time. A repo is not just instructions; it’s a context frame. If the system’s meaning is scattered across services and dashboards and invisible policies, you don’t have an app—you have a rumor about an app. Local-first stacks aren’t “easier” in the motivational-poster sense. They’re easier in the epistemic sense: they create a closed world where the consequences of a change remain traceable.

* The real game: compressing your system into a narratable frame

* Why multi-service topologies break the model’s causal tracing

* Local-first as “context closure”: fewer implied contracts across layers

* How to write systems that are legible to models (and humans)

* What to optimize for: smaller worlds, explicit state, fewer hidden branches

---

## **6\) State Is the New Syntax**

**Subtitle:** Once models write the code, the craft shifts to shaping state.

**Intro paragraph:**

When humans wrote every line, syntax was the battlefield: style guides, lint rules, architecture debates. In vibe coding, syntax is table stakes—the model will happily produce twenty syntactically valid versions of the wrong idea. The real craft becomes the thing underneath: the shape of the data, the invariants you refuse to violate, and the lifecycle of the objects your app cares about. If you design the state well, the UI almost writes itself. If you design it poorly, you’ll spend your life patching “just one more edge case.” This post is a manifesto for state design as the new literacy.

* Syntax gets automated; the meaning moves upstream

* State design as product design: constraints, invariants, schemas, lifecycles

* Why local-first makes state *the* interface between human intent and system behavior

* How to teach vibe coders to think in state: “what objects exist?” “what changes?” “what must never happen?”

* Fireproof as a forcing function: the state model becomes the center of gravity

---

## **ACT III — Architecture After Its Constraints**

*What happens when the conditions that shaped the stack no longer apply.*

---

## **7\) The API Is the Wound Where the App Was Cut in Half**

**Subtitle:** Client/server isn’t a law of nature.

**Intro paragraph:**

The API is not a feature. It’s a coping mechanism. It’s the bandage we invented when we split the app into two beings that don’t share memory, time, or trust—and then we pretended that split was natural. Vibe coding makes the wound obvious because the model keeps reaching for unity (“just update the list”) and the stack keeps insisting on estrangement (“await the server, handle failure, reconcile state”). Local-first doesn’t remove the network; it demotes it. The app becomes whole again, and the network becomes logistics.

* Why APIs exist (historical constraints: weak clients, trust boundaries, no offline-safe state)

* The symptom stack: loading states, retries, cache invalidation, “eventual consistency anxiety”

* How local-first “heals” the split: state becomes authoritative locally

* The sync layer as the *right* place for distributed complexity

* What changes in product design when you stop designing around the wound

---

## **8\) Security That Doesn’t Require Remembering**

**Subtitle:** Why policy-based security collapses under vibe coding.

**Intro paragraph:**

Most web app security is a game of “don’t forget.” Don’t forget to filter the query. Don’t forget to check the role. Don’t forget to apply the policy in the new endpoint. It mostly works because professionals build habits and teams build process and reviewers catch mistakes—until they don’t. Vibe coding is a stress test for this whole paradigm, because it produces working features faster than you can audit the places where you accidentally widened the blast radius. Capability-based security flips the script: unauthorized data is unreadable, not merely forbidden. The goal isn’t “fewer security bugs.” It’s fewer security *possibilities*.

* The problem with role/policy stacks: correctness depends on perfect consistency everywhere

* Vibe coding amplifies overfetching \+ “we’ll filter later”

* Invisible trust boundaries: browser feels private, server feels secure, reality disagrees

* Capability-based security: keys are access; storage never sees plaintext

* The payoff: whole classes of bugs become *non-expressible*, not “best-practice avoided”

---

## **9\) Low Budget Software**

**Subtitle:** DOGMA 95 rules for building apps that survive vibe coding.

**Intro paragraph:**

Vibe coding doesn’t need a morality play about quality. It needs a production code of constraints. DOGMA 95 wasn’t “no money, no talent.” It was a deliberate refusal of tricks that hide mistakes. In the LLM era, “low budget” is the same move: stop building systems that require a priesthood, stop leaning on invisible enforcement, stop centralizing risk, stop spending complexity like it’s free. The punchline is counterintuitive: the safest vibe-coded software is software that can’t do very much—and does it extremely well.

* DOGMA 95 as the perfect analogy: voluntary constraints to reveal truth

* The rules (no invisible execution, no global state, no ambient authority, no clever infra)

* Why loud failure beats silent correctness in AI-built systems

* “Patterns beat flexibility” as the core vibe-coding survival strategy

* How Vibes DIY \+ Fireproof encode these constraints structurally

---

## **ACT IV — Worlds, Not Rows**

*What becomes newly possible once the architecture stops fighting you.*

---

## **10\) Multi-Tenancy Without the Pain**

**Subtitle:** When a tenant is a namespace, not a policy.

**Intro paragraph:**

Multi-tenancy is where vibe coding goes to get humbled—not because the model can’t write the code, but because the failure modes don’t show up in the UI until it’s too late. A tenant isolation bug looks like success. A policy mis-scope looks like “working.” And the tools for doing it “right” tend to live in dashboards and migrations and middleware you can’t vibe-test. The world/namespace approach is the opposite: the unit of safety is structural. A tenant isn’t a row. It’s a separate universe. And that’s a design choice that turns a cliff into a curb.

* The traditional multi-tenancy cliff (tenant\_id discipline, RLS, migrations, routing, ops)

* Why UI-only testing can’t reveal isolation bugs (they’re invisible until they’re catastrophic)

* Client-side tenancy: subdomain → database → isolated world

* Honest tradeoff: you give up global queries—and that’s the point

* The pitch: “Scaling becomes multiplying cells, not enlarging a shared core”

---

## **11\) Stop Storing Communities in Tables**

**Subtitle:** The alternative is worlds, not tenants.

**Intro paragraph:**

SaaS culture quietly trained us to think there’s only one respectable shape for software: one app, one giant database, everyone inside it, differentiated by roles and filters and policies. That shape is great for empires—and brutal for vibe coders, because every new feature shares the same core, the same risks, the same invisible enforcement. The worlds model is a different metaphysics: each community gets its own data universe, its own keys, its own failure domain. It’s less “web scale” and more “human scale.” And for vibe-coded products, human scale is the point.

* Rows in one DB: shared core, shared risk, shared complexity

* Worlds model: each community has its own database, identity, and blast radius

* How this changes product strategy (micro-SaaS, vertical tools, short-lived apps)

* Why this aligns with vibe coding’s “disposable software” ethos

* The marketing before/after that makes it click instantly

---

## **12\) The Disposable App and the Return of the Village**

**Subtitle:** Why vibe coding is pre-industrial—and that’s good.

**Intro paragraph:**

Industrial software assumes permanence: roadmaps, uptime, org charts, compliance checklists, the slow accumulation of institutional scar tissue. Vibe coding suggests a different category: apps that exist like a conversation exists—made for the moment, for a small group, for a specific coordination problem, then allowed to fade. That sounds unserious until you remember how much human life is made of small-group coordination: dinner plans, clubs, mutual aid, micro-business workflows, temporary projects. Local-first “worlds” make this practical, because the app doesn’t need to become a company to become real.

* “Retribalization” as a real product category: apps for 6 friends, 1 hour, 1 need

* Why industrial software assumed permanence (ops, compliance, org structure)

* Local-first as the substrate for ephemeral-but-real tools

* The business angle: NanoSaaS/micro-tools, small paid worlds, low support burden

* The cultural angle: oral tradition → disposable artifacts → living software

