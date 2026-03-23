# Advanced Python Roadmap - Google-Level Production Mastery

> **Skip:** Variables, loops, lists, dicts, basic functions - you know these.
> **Focus:** Write code that passes Google's production bar - clean, performant, memory-efficient, testable, and scalable.
> **Practice daily** on your website. Each topic below = one practice session.

---

## Phase 1: OOP Mastery (The Foundation of Production Code)

---

### 1.1 Classes - Beyond the Basics

- [ ] `__init__` vs `__new__` — when and why `__new__` exists
- [ ] Instance attributes vs class attributes — mutation gotcha with mutable class attributes
- [ ] `self` — what it actually is under the hood
- [ ] `cls` — classmethod's first argument
- [ ] `@classmethod` — alternative constructors pattern (`from_json`, `from_csv`, `from_dict`)
- [ ] `@staticmethod` — when to use vs classmethod vs plain function
- [ ] `@property` — getters and setters the Pythonic way
- [ ] `@property` with `@setter` and `@deleter`
- [ ] Computed properties — properties that derive from other attributes
- [ ] Lazy properties — compute once, cache forever (`functools.cached_property`)
- [ ] `__slots__` — what it does, memory savings, when to use
- [ ] `__slots__` with inheritance — the gotchas
- [ ] Class variables vs instance variables — the MRO lookup chain
- [ ] Private attributes (`_single` vs `__double` name mangling)
- [ ] Name mangling — how `__attr` becomes `_ClassName__attr`

### 1.2 Inheritance Deep Dive

- [ ] Single inheritance — method resolution order (MRO)
- [ ] `super()` — how it actually works (not just "call parent")
- [ ] `super()` in multiple inheritance — cooperative multiple inheritance
- [ ] Multiple inheritance — diamond problem
- [ ] MRO (Method Resolution Order) — C3 linearization algorithm
- [ ] `ClassName.__mro__` and `ClassName.mro()` — inspecting the chain
- [ ] Mixin classes — small, focused classes that add behavior
- [ ] Mixin ordering — why order in class definition matters
- [ ] Abstract Base Classes (`abc.ABC`, `@abstractmethod`)
- [ ] Abstract properties (`@abstractmethod` + `@property`)
- [ ] `abc.ABCMeta` — the metaclass behind ABC
- [ ] `isinstance()` vs `type()` — when to use which
- [ ] `issubclass()` — checking class hierarchies
- [ ] `__subclasses__()` — finding all subclasses at runtime
- [ ] `__init_subclass__` — hook into subclass creation without metaclasses
- [ ] Template Method Pattern via inheritance
- [ ] When NOT to use inheritance — composition over inheritance

### 1.3 Composition & Delegation

- [ ] Composition over inheritance — why and when
- [ ] Has-a vs Is-a relationships — design decision framework
- [ ] Delegation pattern — forwarding method calls to composed objects
- [ ] `__getattr__` for automatic delegation
- [ ] Wrapper classes — adding behavior without inheritance
- [ ] Dependency injection — passing dependencies through `__init__`
- [ ] Strategy pattern via composition (swap behaviors at runtime)
- [ ] Plugin architecture with composition

### 1.4 Dunder (Magic) Methods - Complete Mastery

#### Object Lifecycle
- [ ] `__new__` — object creation (before `__init__`)
- [ ] `__init__` — object initialization
- [ ] `__del__` — destructor (and why you almost never use it)
- [ ] `__repr__` — unambiguous string for developers
- [ ] `__str__` — human-readable string
- [ ] `__repr__` vs `__str__` — when Python calls which
- [ ] `__format__` — custom format spec (`f"{obj:.2f}"`)
- [ ] `__hash__` — making objects hashable (usable as dict keys / set members)
- [ ] `__eq__` — equality comparison
- [ ] `__hash__` and `__eq__` relationship — if you define `__eq__`, `__hash__` is set to None
- [ ] `__bool__` — truthiness of objects
- [ ] `__sizeof__` — memory size reporting

#### Comparison Operators
- [ ] `__lt__`, `__le__`, `__gt__`, `__ge__` — rich comparisons
- [ ] `@functools.total_ordering` — define `__eq__` + one comparison, get all six
- [ ] Implementing sortable objects

#### Arithmetic Operators
- [ ] `__add__`, `__sub__`, `__mul__`, `__truediv__`, `__floordiv__`, `__mod__`, `__pow__`
- [ ] `__radd__`, `__rsub__`, etc. — reflected (right-hand) operators
- [ ] `__iadd__`, `__isub__`, etc. — in-place operators (`+=`, `-=`)
- [ ] `__neg__`, `__pos__`, `__abs__` — unary operators

#### Container Protocol
- [ ] `__len__` — `len(obj)`
- [ ] `__getitem__` — `obj[key]` (indexing and slicing)
- [ ] `__setitem__` — `obj[key] = value`
- [ ] `__delitem__` — `del obj[key]`
- [ ] `__contains__` — `item in obj`
- [ ] `__iter__` — making objects iterable
- [ ] `__next__` — iterator protocol
- [ ] `__reversed__` — `reversed(obj)`
- [ ] `__missing__` — `dict` subclass key miss handling
- [ ] Building a custom list-like class
- [ ] Building a custom dict-like class

#### Attribute Access
- [ ] `__getattr__` — called when attribute not found normally
- [ ] `__getattribute__` — called for EVERY attribute access
- [ ] `__setattr__` — called for EVERY attribute assignment
- [ ] `__delattr__` — called for EVERY attribute deletion
- [ ] `__dir__` — customize `dir(obj)` output
- [ ] The attribute lookup chain: instance `__dict__` → class → bases → `__getattr__`

#### Callable Objects
- [ ] `__call__` — making instances callable like functions
- [ ] Callable objects as stateful functions
- [ ] Callable objects as decorators (class-based decorators)

#### Context Manager Protocol
- [ ] `__enter__` and `__exit__` — the `with` statement protocol
- [ ] Exception handling in `__exit__` (suppress or propagate)
- [ ] `contextlib.contextmanager` — generator-based context managers
- [ ] Async context managers (`__aenter__`, `__aexit__`)

#### Copy Protocol
- [ ] `__copy__` — shallow copy behavior
- [ ] `__deepcopy__` — deep copy behavior

### 1.5 Descriptors (How Python Properties Actually Work)

- [ ] What is a descriptor — objects that define `__get__`, `__set__`, `__delete__`
- [ ] Data descriptors vs non-data descriptors
- [ ] Descriptor lookup order (data descriptor > instance dict > non-data descriptor)
- [ ] Building a custom descriptor from scratch
- [ ] Typed descriptor — enforce types on assignment
- [ ] Validated descriptor — enforce value ranges
- [ ] Lazy descriptor — compute once, cache on instance
- [ ] How `@property` is implemented as a descriptor
- [ ] How `@classmethod` and `@staticmethod` are descriptors
- [ ] How `__slots__` uses descriptors internally
- [ ] `__set_name__` — know the attribute name assigned to the descriptor

### 1.6 Metaclasses (How Classes Are Created)

- [ ] `type` as the default metaclass — `type(name, bases, namespace)`
- [ ] Creating classes dynamically with `type()`
- [ ] Custom metaclass with `__new__` and `__init__`
- [ ] `__prepare__` — customize the class namespace (OrderedDict, etc.)
- [ ] Metaclass inheritance — metaclass of metaclass
- [ ] Registry pattern with metaclasses (auto-register all subclasses)
- [ ] Validation metaclass (enforce class structure at creation time)
- [ ] Singleton metaclass
- [ ] `__init_subclass__` — the modern alternative to metaclasses (Python 3.6+)
- [ ] When to use metaclasses vs `__init_subclass__` vs decorators

---

## Phase 2: Functions - Advanced Patterns

---

### 2.1 First-Class Functions

- [ ] Functions as objects — assigning to variables, passing as arguments
- [ ] Higher-order functions — functions that take/return functions
- [ ] `map()`, `filter()`, `reduce()` — functional programming basics
- [ ] `functools.partial` — pre-filling function arguments
- [ ] `functools.reduce` — accumulation pattern
- [ ] `operator` module — `operator.add`, `operator.attrgetter`, `operator.itemgetter`
- [ ] Lambda functions — when to use, when NOT to use
- [ ] Closures — functions that capture variables from enclosing scope
- [ ] Closure variable binding gotcha (loop variable capture)
- [ ] `nonlocal` keyword — modifying closure variables
- [ ] Function introspection — `__name__`, `__doc__`, `__defaults__`, `__code__`, `__annotations__`

### 2.2 Decorators - From Basics to Production

- [ ] Basic function decorator pattern
- [ ] `@functools.wraps` — preserving function metadata (critical!)
- [ ] Decorators with arguments — the triple-nested function pattern
- [ ] Class-based decorators (using `__call__`)
- [ ] Decorating classes (not just functions)
- [ ] Method decorators — handling `self` properly
- [ ] Stacking decorators — execution order (bottom-up)
- [ ] `functools.lru_cache` — memoization decorator
- [ ] `functools.cache` — unbounded cache (Python 3.9+)
- [ ] `functools.cached_property` — lazy computed attribute
- [ ] Writing a retry decorator (with exponential backoff)
- [ ] Writing a timing/profiling decorator
- [ ] Writing a logging decorator
- [ ] Writing a rate-limiter decorator
- [ ] Writing a validation decorator
- [ ] Writing a deprecation warning decorator
- [ ] Writing a singleton decorator
- [ ] Decorator with optional arguments (works with and without parentheses)
- [ ] `functools.singledispatch` — single dispatch generic functions
- [ ] Parametric decorators using descriptor protocol

### 2.3 Generators & Iterators - Production Patterns

- [ ] Generator functions — `yield` keyword
- [ ] Generator expressions — `(x for x in range(n))`
- [ ] `yield` vs `return` — execution suspension
- [ ] `next()` — advancing generators manually
- [ ] `send()` — sending values INTO a generator (coroutine pattern)
- [ ] `throw()` — throwing exceptions into a generator
- [ ] `close()` — terminating a generator
- [ ] `yield from` — delegating to sub-generators
- [ ] Generator pipelines — chaining generators for data processing
- [ ] Infinite generators — generating data streams
- [ ] `itertools.count`, `itertools.cycle`, `itertools.repeat` — infinite iterators
- [ ] `itertools.chain` — concatenating iterables
- [ ] `itertools.islice` — slicing iterables
- [ ] `itertools.groupby` — grouping consecutive elements
- [ ] `itertools.product` — cartesian product
- [ ] `itertools.combinations`, `itertools.permutations`
- [ ] `itertools.accumulate` — running totals
- [ ] `itertools.starmap` — unpacking arguments
- [ ] `itertools.tee` — duplicating iterators
- [ ] `itertools.zip_longest` — zip with fill values
- [ ] `itertools.filterfalse` — inverse filter
- [ ] Custom iterator class (`__iter__` + `__next__`)
- [ ] Iterable vs Iterator — the protocol difference
- [ ] Memory-efficient data processing with generators (processing 100GB files)

### 2.4 Type Hints & Static Analysis (Google Requires This)

- [ ] Basic type hints — `int`, `str`, `float`, `bool`, `None`
- [ ] `list[int]`, `dict[str, int]`, `tuple[int, ...]`, `set[str]` (Python 3.9+)
- [ ] `Optional[X]` — equivalent to `X | None`
- [ ] `Union[X, Y]` — multiple types
- [ ] `X | Y` syntax (Python 3.10+)
- [ ] `Any` — escape hatch (avoid in production)
- [ ] `Callable[[ArgTypes], ReturnType]` — function type hints
- [ ] `TypeVar` — generic type variables
- [ ] `Generic[T]` — generic classes
- [ ] `TypeVar` with `bound` — upper bound constraints
- [ ] `TypeVar` with `constraints` — restricted set of types
- [ ] `ParamSpec` — preserving parameter types in decorators (Python 3.10+)
- [ ] `Concatenate` — adding parameters to ParamSpec
- [ ] `Protocol` — structural subtyping (duck typing with types)
- [ ] `@runtime_checkable` protocols
- [ ] `TypedDict` — typed dictionaries with specific keys
- [ ] `Literal["a", "b"]` — restrict to specific values
- [ ] `Final` — constants that can't be reassigned
- [ ] `ClassVar` — class-level variable annotation
- [ ] `Annotated[X, metadata]` — attaching metadata to types
- [ ] `TypeAlias` — explicit type alias declaration
- [ ] `Self` type (Python 3.11+) — return type for method chaining
- [ ] `Unpack` and `TypeVarTuple` — variadic generics (Python 3.11+)
- [ ] `@overload` — multiple function signatures
- [ ] `TYPE_CHECKING` — imports only for type checkers
- [ ] `cast()` — telling the type checker to trust you
- [ ] `reveal_type()` — debugging type inference
- [ ] `mypy` — running static type checks
- [ ] `mypy` configuration — `mypy.ini` or `pyproject.toml`
- [ ] `mypy` strict mode — what it enforces
- [ ] `pyright` — Microsoft's type checker (used in VS Code)
- [ ] Type stubs (`.pyi` files) — typing for untyped libraries

---

## Phase 3: Memory Management (Critical for Google-Level)

---

### 3.1 Python Memory Model - Internals

- [ ] Everything is an object — `id()`, `type()`, `sys.getrefcount()`
- [ ] Variables are references (name bindings), not boxes
- [ ] Mutable vs immutable objects — memory implications
- [ ] Integer interning — Python caches -5 to 256
- [ ] String interning — when Python reuses string objects
- [ ] `is` vs `==` — identity vs equality
- [ ] `id()` — memory address of an object
- [ ] `sys.getsizeof()` — shallow size of a single object
- [ ] Deep size — total memory including referenced objects (`pympler.asizeof`)
- [ ] Object header — every Python object has `ob_refcnt` + `ob_type` (16+ bytes overhead)
- [ ] Small object allocator (pymalloc) — arenas, pools, blocks
- [ ] Memory arenas — 256KB chunks from OS
- [ ] Memory pools — 4KB pages within arenas (grouped by block size)
- [ ] Memory blocks — 8 to 512 bytes, serviced by pools
- [ ] Large object allocation — goes directly to system `malloc` (>512 bytes)
- [ ] `sys.getallocatedblocks()` — current block count
- [ ] Memory fragmentation — why freed memory isn't returned to OS
- [ ] Arena-based deallocation — arenas freed only when completely empty

### 3.2 Reference Counting

- [ ] How reference counting works — `ob_refcnt` field on every object
- [ ] What increases refcount — assignment, function args, containers
- [ ] What decreases refcount — `del`, reassignment, scope exit, container removal
- [ ] `sys.getrefcount()` — checking reference count (always +1 due to function arg)
- [ ] `weakref` — references that don't increase refcount
- [ ] `weakref.ref` — basic weak reference
- [ ] `weakref.proxy` — transparent weak reference
- [ ] `weakref.WeakValueDictionary` — dict with weak value references
- [ ] `weakref.WeakKeyDictionary` — dict with weak key references
- [ ] `weakref.WeakSet` — set with weak references
- [ ] `weakref.finalize` — destructor callback without preventing GC
- [ ] When to use weak references — caches, observer pattern, parent-child cycles

### 3.3 Garbage Collection

- [ ] Reference counting — primary GC mechanism (immediate, deterministic)
- [ ] Cyclic garbage collector — handles reference cycles
- [ ] What is a reference cycle — A refers to B, B refers to A
- [ ] Generational GC — generation 0, 1, 2 (young, middle, old)
- [ ] Collection thresholds — `gc.get_threshold()` → (700, 10, 10)
- [ ] What triggers GC — allocation count exceeds threshold
- [ ] `gc.collect()` — manually trigger garbage collection
- [ ] `gc.disable()` — disable automatic GC (useful for performance-critical sections)
- [ ] `gc.enable()` — re-enable GC
- [ ] `gc.get_objects()` — all tracked objects
- [ ] `gc.get_referrers(obj)` — who references this object?
- [ ] `gc.get_referents(obj)` — what does this object reference?
- [ ] `gc.set_threshold()` — tune GC aggressiveness
- [ ] `gc.callbacks` — register callbacks when GC runs
- [ ] `gc.freeze()` — exclude all current objects from future GC (Python 3.7+)
- [ ] `gc.unfreeze()` — undo freeze
- [ ] `__del__` and GC — why finalizers complicate garbage collection
- [ ] Uncollectable cycles — cycles with `__del__` methods (Python 2 problem, mostly fixed in 3)
- [ ] GC performance impact — stop-the-world pauses
- [ ] Disabling GC in production — Instagram's approach (disable generational GC, rely on refcounting)

### 3.4 Memory Profiling & Debugging

- [ ] `sys.getsizeof()` — shallow size measurement
- [ ] `pympler.asizeof()` — deep/recursive size measurement
- [ ] `pympler.tracker.SummaryTracker` — track memory changes over time
- [ ] `tracemalloc` — built-in memory allocation tracer
- [ ] `tracemalloc.start()` / `tracemalloc.stop()`
- [ ] `tracemalloc.get_traced_memory()` — current and peak memory
- [ ] `tracemalloc.take_snapshot()` — snapshot of allocations
- [ ] Comparing snapshots — finding memory growth between two points
- [ ] `tracemalloc` top-N allocations by file/line
- [ ] `memory_profiler` — line-by-line memory profiling (`@profile` decorator)
- [ ] `mprof run` / `mprof plot` — memory usage over time
- [ ] `objgraph` — visualize object reference graphs
- [ ] `objgraph.show_most_common_types()` — what objects exist?
- [ ] `objgraph.show_growth()` — what types are growing?
- [ ] `objgraph.show_backrefs()` — why is this object alive?
- [ ] `guppy3` / `heapy` — heap analysis
- [ ] `resource` module — track RSS (Resident Set Size)
- [ ] `/proc/self/status` (Linux) — reading VmRSS, VmPeak
- [ ] Finding memory leaks — systematic approach
- [ ] Memory leak patterns — global lists, caches without limits, circular refs, `__del__` preventing GC

### 3.5 Memory Optimization Techniques

- [ ] `__slots__` — eliminate `__dict__` per instance (40-50% memory saving)
- [ ] `__slots__` with inheritance — each class needs its own slots
- [ ] `namedtuple` vs regular class — memory comparison
- [ ] `dataclasses` with `slots=True` (Python 3.10+)
- [ ] Using `array.array` instead of `list` for homogeneous numeric data
- [ ] `numpy` arrays vs Python lists — memory layout comparison
- [ ] Generators instead of lists — lazy evaluation, O(1) memory
- [ ] `itertools` for memory-efficient iteration
- [ ] String interning with `sys.intern()` — deduplicating repeated strings
- [ ] `memoryview` — zero-copy buffer access
- [ ] `struct` module — pack data into compact binary format
- [ ] `mmap` — memory-mapped files for large file processing
- [ ] Object pooling — reusing objects instead of creating new ones
- [ ] `__sizeof__` — customizing memory reporting for your objects
- [ ] Compact dict (Python 3.6+) — how modern dicts use less memory
- [ ] Key sharing dict — instances of the same class share key storage
- [ ] Flyweight pattern — share common state between many objects
- [ ] Intern pattern — reuse identical immutable objects
- [ ] Buffer protocol — sharing memory between objects without copying

### 3.6 Memory Management in Production

- [ ] Memory limits in containers (Docker, Kubernetes) — OOMKiller
- [ ] Setting memory limits — `resource.setrlimit()`
- [ ] Memory monitoring in production — Prometheus, psutil
- [ ] `psutil.Process().memory_info()` — RSS, VMS tracking
- [ ] Memory-aware caching — `functools.lru_cache(maxsize=N)`
- [ ] Custom cache with memory limit (evict when cache exceeds N bytes)
- [ ] Processing large files — chunk-based reading patterns
- [ ] Processing large CSVs — `pandas` chunked reading vs `csv.reader` generator
- [ ] Processing large JSON — `ijson` streaming parser
- [ ] Copy-on-write — `os.fork()` and shared memory pages
- [ ] `multiprocessing` and memory — each process gets its own copy
- [ ] `multiprocessing.shared_memory` — sharing data between processes
- [ ] `gc.collect()` before `fork()` — preventing duplicate collection
- [ ] Memory leaks in long-running services — detection and prevention
- [ ] Connection pool leaks — database connections not returned
- [ ] Event listener leaks — registering without unregistering

---

## Phase 4: Concurrency & Parallelism (Production-Critical)

---

### 4.1 Threading

- [ ] `threading.Thread` — creating and starting threads
- [ ] `Thread.join()` — waiting for thread completion
- [ ] `Thread.daemon` — daemon threads (die with main thread)
- [ ] `threading.Lock` — mutual exclusion
- [ ] `threading.RLock` — reentrant lock (same thread can acquire multiple times)
- [ ] `threading.Semaphore` — limiting concurrent access (N permits)
- [ ] `threading.BoundedSemaphore` — semaphore that can't be released more than acquired
- [ ] `threading.Event` — one-shot signaling between threads
- [ ] `threading.Condition` — wait/notify pattern
- [ ] `threading.Barrier` — synchronization point for N threads
- [ ] `threading.Timer` — delayed execution
- [ ] `threading.local()` — thread-local storage
- [ ] GIL (Global Interpreter Lock) — what it is, why it exists
- [ ] GIL impact — only one thread executes Python bytecode at a time
- [ ] When threading helps — I/O-bound tasks (network, disk, sleep)
- [ ] When threading doesn't help — CPU-bound tasks
- [ ] Thread safety — race conditions, data races
- [ ] Thread-safe data structures — `queue.Queue`, `queue.PriorityQueue`
- [ ] Producer-consumer pattern with `queue.Queue`
- [ ] Deadlock — causes and prevention (lock ordering, timeout)
- [ ] Thread pool — `concurrent.futures.ThreadPoolExecutor`

### 4.2 Multiprocessing

- [ ] `multiprocessing.Process` — creating processes
- [ ] `Process.start()`, `Process.join()`, `Process.terminate()`
- [ ] `multiprocessing.Pool` — process pool for parallel map
- [ ] `Pool.map()`, `Pool.starmap()`, `Pool.apply_async()`
- [ ] `concurrent.futures.ProcessPoolExecutor` — modern API
- [ ] `multiprocessing.Queue` — inter-process communication
- [ ] `multiprocessing.Pipe` — bidirectional communication
- [ ] `multiprocessing.Value`, `multiprocessing.Array` — shared state
- [ ] `multiprocessing.Manager` — shared objects (dict, list, etc.)
- [ ] `multiprocessing.Lock` — inter-process locking
- [ ] `multiprocessing.shared_memory` — zero-copy shared memory (Python 3.8+)
- [ ] Pickle serialization — what can/can't be pickled for multiprocessing
- [ ] `fork` vs `spawn` vs `forkserver` — start methods and their tradeoffs
- [ ] CPU-bound parallelism — when to use multiprocessing
- [ ] Process pool sizing — `os.cpu_count()` and practical limits

### 4.3 Async/Await (asyncio)

- [ ] Event loop — the heart of asyncio (`asyncio.run()`, `asyncio.get_event_loop()`)
- [ ] `async def` — defining coroutines
- [ ] `await` — suspending until a coroutine completes
- [ ] `asyncio.gather()` — running multiple coroutines concurrently
- [ ] `asyncio.create_task()` — scheduling coroutines
- [ ] `asyncio.wait()` — waiting with more control (first_completed, all_completed)
- [ ] `asyncio.wait_for()` — timeout wrapper
- [ ] `asyncio.shield()` — protect from cancellation
- [ ] `asyncio.sleep()` — non-blocking sleep
- [ ] `asyncio.Queue` — async producer-consumer
- [ ] `asyncio.Semaphore` — async concurrency limiting
- [ ] `asyncio.Lock` — async mutual exclusion
- [ ] `asyncio.Event` — async signaling
- [ ] `asyncio.Condition` — async wait/notify
- [ ] `async for` — async iteration protocol (`__aiter__`, `__anext__`)
- [ ] `async with` — async context managers (`__aenter__`, `__aexit__`)
- [ ] `async generators` — `yield` inside `async def`
- [ ] `asyncio.to_thread()` — run blocking code in a thread (Python 3.9+)
- [ ] `asyncio.run_in_executor()` — bridge sync and async code
- [ ] Task cancellation — `task.cancel()`, handling `CancelledError`
- [ ] Structured concurrency — `asyncio.TaskGroup` (Python 3.11+)
- [ ] Exception handling in gather — `return_exceptions=True`
- [ ] Debugging asyncio — `asyncio.run(debug=True)`, `PYTHONASYNCIODEBUG=1`
- [ ] `aiohttp` — async HTTP client/server
- [ ] `aiofiles` — async file I/O
- [ ] `aiomysql`, `asyncpg` — async database drivers

### 4.4 Concurrency Patterns for Production

- [ ] Thread pool for I/O, process pool for CPU — the decision framework
- [ ] Fan-out/fan-in — distribute work, collect results
- [ ] Pipeline pattern — stages connected by queues
- [ ] Circuit breaker — stop calling failing services
- [ ] Bulkhead pattern — isolate failures
- [ ] Rate limiter — token bucket, sliding window
- [ ] Retry with exponential backoff and jitter
- [ ] Graceful shutdown — signal handling, drain queues
- [ ] `concurrent.futures.as_completed()` — process results as they finish
- [ ] `concurrent.futures.Future` — representing async results

---

## Phase 5: Design Patterns (Write Code Like Google Engineers)

---

### 5.1 Creational Patterns

- [ ] **Singleton** — ensure one instance (module-level, metaclass, decorator approaches)
- [ ] Singleton in Python — why module-level instance is preferred over class pattern
- [ ] **Factory Method** — defer object creation to subclasses
- [ ] **Abstract Factory** — create families of related objects
- [ ] Factory with registry — `register()` + `create()` pattern
- [ ] **Builder** — construct complex objects step by step (fluent interface)
- [ ] Builder with method chaining — `obj.set_x(1).set_y(2).build()`
- [ ] **Prototype** — clone existing objects (`copy.copy`, `copy.deepcopy`)
- [ ] **Object Pool** — reuse expensive objects (DB connections, threads)

### 5.2 Structural Patterns

- [ ] **Adapter** — make incompatible interfaces work together
- [ ] Adapter with inheritance vs composition
- [ ] **Decorator Pattern** (not Python decorator) — add behavior dynamically
- [ ] **Facade** — simplify complex subsystems with a unified interface
- [ ] **Proxy** — control access to an object (lazy loading, access control, logging)
- [ ] **Composite** — tree structure where leaf and branch have same interface
- [ ] **Bridge** — decouple abstraction from implementation
- [ ] **Flyweight** — share state between many similar objects (memory optimization)

### 5.3 Behavioral Patterns

- [ ] **Strategy** — swap algorithms at runtime (via composition or callable)
- [ ] Strategy in Python — just pass a function (no class hierarchy needed)
- [ ] **Observer** — publish-subscribe (event system)
- [ ] Observer with weak references — prevent memory leaks
- [ ] **Command** — encapsulate actions as objects (undo/redo, queuing)
- [ ] **State** — object behavior changes based on internal state
- [ ] **Template Method** — define algorithm skeleton, let subclasses override steps
- [ ] **Iterator** — custom iteration logic (`__iter__`, `__next__`)
- [ ] **Chain of Responsibility** — pass request along a chain of handlers
- [ ] Chain of Responsibility for middleware (like WSGI/ASGI middleware)
- [ ] **Mediator** — centralize complex communication between objects
- [ ] **Memento** — capture and restore object state (snapshots)
- [ ] **Visitor** — add operations to objects without modifying them
- [ ] Visitor with `functools.singledispatch`

### 5.4 Python-Specific Patterns

- [ ] **Borg/Monostate** — shared state, different instances
- [ ] **Null Object** — provide default do-nothing behavior
- [ ] **Registry** — auto-register classes/functions (metaclass or decorator)
- [ ] **Mixin** — add functionality through multiple inheritance
- [ ] **Context Manager** — resource management pattern (`with` statement)
- [ ] **Descriptor** — reusable attribute behavior
- [ ] **EAFP** (Easier to Ask Forgiveness than Permission) — try/except over if/check
- [ ] **LBYL** (Look Before You Leap) — check before doing
- [ ] **Sentinel values** — `_MISSING = object()` instead of `None`
- [ ] **Double dispatch** — `functools.singledispatch` for method overloading

### 5.5 Architectural Patterns

- [ ] **Repository pattern** — abstract data access
- [ ] **Service layer** — business logic orchestration
- [ ] **Unit of Work** — track changes and commit atomically
- [ ] **Dependency Injection** — inject dependencies, don't create them
- [ ] **Event-driven architecture** — loose coupling via events
- [ ] **CQRS** (Command Query Responsibility Segregation) — separate read/write models
- [ ] **Hexagonal architecture** — ports and adapters
- [ ] **Clean architecture** — dependency rule (dependencies point inward)
- [ ] **Plugin architecture** — extensible systems with entry points

---

## Phase 6: Error Handling & Defensive Programming

---

### 6.1 Exception Handling Mastery

- [ ] Exception hierarchy — `BaseException` → `Exception` → specific exceptions
- [ ] `try` / `except` / `else` / `finally` — full syntax and execution order
- [ ] Catching multiple exceptions — `except (TypeError, ValueError)`
- [ ] Exception chaining — `raise X from Y`
- [ ] Implicit chaining — `raise` inside `except` block
- [ ] `__cause__` vs `__context__` — explicit vs implicit chaining
- [ ] `raise X from None` — suppress exception context
- [ ] Custom exception classes — inheritance from `Exception`
- [ ] Custom exception with attributes — rich error information
- [ ] Exception groups (Python 3.11+) — `ExceptionGroup`, `except*`
- [ ] `BaseExceptionGroup` vs `ExceptionGroup`
- [ ] When to catch vs when to let exceptions propagate
- [ ] Never catch `BaseException` (catches `KeyboardInterrupt`, `SystemExit`)
- [ ] Never use bare `except:` (same as catching `BaseException`)
- [ ] `warnings` module — `warnings.warn()` for deprecation, user warnings
- [ ] `warnings.filterwarnings()` — controlling warning behavior
- [ ] `contextlib.suppress()` — ignore specific exceptions cleanly
- [ ] `errno` module — system error codes

### 6.2 Logging (Production Standard)

- [ ] `logging` module — loggers, handlers, formatters, filters
- [ ] Log levels — DEBUG, INFO, WARNING, ERROR, CRITICAL
- [ ] `logging.getLogger(__name__)` — per-module loggers
- [ ] Logger hierarchy — parent/child loggers, propagation
- [ ] `logging.basicConfig()` — quick setup
- [ ] `StreamHandler` — log to stderr/stdout
- [ ] `FileHandler` — log to file
- [ ] `RotatingFileHandler` — log rotation by size
- [ ] `TimedRotatingFileHandler` — log rotation by time
- [ ] `logging.config.dictConfig()` — configure logging from dict
- [ ] Structured logging — JSON formatted logs (`python-json-logger`)
- [ ] Log context — adding request_id, user_id to all logs
- [ ] `logging.LoggerAdapter` — add context to a logger
- [ ] `contextvars` for request-scoped logging context
- [ ] Performance — `logger.isEnabledFor()` to avoid expensive format operations
- [ ] Never use `print()` in production — always use `logging`

### 6.3 Assertions & Contracts

- [ ] `assert` — when to use (debugging, never in production logic)
- [ ] `assert` is removed with `python -O` — never use for validation
- [ ] Preconditions — validate inputs at function start
- [ ] Postconditions — validate outputs before return
- [ ] Class invariants — validate object state after each method
- [ ] Design by contract philosophy
- [ ] `typing.assert_type()` — static assertion (Python 3.11+)

---

## Phase 7: Testing (Google Tests Everything)

---

### 7.1 Unit Testing

- [ ] `pytest` — basics: test functions, test classes, assertions
- [ ] `pytest` fixtures — setup/teardown, scopes (function, class, module, session)
- [ ] `pytest` parametrize — `@pytest.mark.parametrize`
- [ ] `pytest` markers — `@pytest.mark.slow`, `@pytest.mark.skip`, `@pytest.mark.xfail`
- [ ] `pytest` conftest.py — shared fixtures
- [ ] `pytest` plugins — `pytest-cov`, `pytest-asyncio`, `pytest-mock`, `pytest-xdist`
- [ ] `unittest.mock.Mock` — creating mock objects
- [ ] `unittest.mock.MagicMock` — mock with magic method support
- [ ] `unittest.mock.patch` — patching objects for testing
- [ ] `unittest.mock.patch.object` — patching specific attributes
- [ ] `mock.return_value` vs `mock.side_effect`
- [ ] `mock.assert_called_with()`, `mock.assert_called_once()`
- [ ] Mocking external APIs — requests, database calls
- [ ] `pytest-asyncio` — testing async functions
- [ ] Test isolation — each test is independent
- [ ] Arrange-Act-Assert (AAA) pattern

### 7.2 Testing Patterns

- [ ] Test doubles — fakes, stubs, mocks, spies
- [ ] Dependency injection for testability
- [ ] Testing private methods — should you? (generally no)
- [ ] Testing exceptions — `pytest.raises()`
- [ ] Testing warnings — `pytest.warns()`
- [ ] Testing logging output — `caplog` fixture
- [ ] Snapshot testing — comparing against stored outputs
- [ ] Property-based testing — `hypothesis` library
- [ ] Fuzzing — random input generation
- [ ] Code coverage — `pytest-cov`, `coverage.py`
- [ ] Mutation testing — `mutmut` (test your tests)
- [ ] Integration testing vs unit testing — the testing pyramid
- [ ] End-to-end testing — testing the full pipeline

---

## Phase 8: Data Structures & Algorithms (Google Interview Level)

---

### 8.1 Built-in Data Structures - Deep Knowledge

- [ ] `list` — dynamic array, amortized O(1) append, O(n) insert
- [ ] `list` memory layout — over-allocation strategy
- [ ] `list` vs `array.array` — when to use which
- [ ] `tuple` — immutable, hashable (if contents hashable), used as dict keys
- [ ] `tuple` unpacking — `a, *b, c = iterable`
- [ ] `namedtuple` — `collections.namedtuple` for structured tuples
- [ ] `dict` — hash table, O(1) average lookup, insertion order (3.7+)
- [ ] `dict` internals — hash function, collision resolution (open addressing)
- [ ] `dict` resize — when and how it happens
- [ ] `dict.setdefault()` — get or set default
- [ ] `collections.defaultdict` — auto-default factory
- [ ] `collections.OrderedDict` — ordered dict (move_to_end, popitem(last=True))
- [ ] `collections.Counter` — frequency counting
- [ ] `collections.ChainMap` — layered dict lookups
- [ ] `set` — hash set, O(1) membership test
- [ ] `set` operations — union, intersection, difference, symmetric_difference
- [ ] `frozenset` — immutable set, hashable
- [ ] `collections.deque` — double-ended queue, O(1) append/pop both ends
- [ ] `deque(maxlen=N)` — bounded deque, auto-evicts oldest
- [ ] `heapq` — min-heap operations on lists
- [ ] `heapq.nlargest()`, `heapq.nsmallest()` — efficient top-k
- [ ] `bisect` — binary search on sorted lists
- [ ] `bisect.insort()` — insert maintaining sort order
- [ ] `queue.PriorityQueue` — thread-safe priority queue
- [ ] `types.MappingProxyType` — read-only dict view
- [ ] `typing.NamedTuple` — typed namedtuple

### 8.2 Algorithm Complexity & Practice

- [ ] Big-O notation — O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)
- [ ] Space complexity — auxiliary space vs total space
- [ ] Amortized analysis — dynamic array append, hash table resize
- [ ] Two pointer technique
- [ ] Sliding window technique
- [ ] Hash map patterns (two-sum, frequency counting, grouping)
- [ ] Stack patterns (valid parentheses, monotonic stack)
- [ ] Queue/BFS patterns
- [ ] Binary search — on sorted arrays, on answer space
- [ ] Recursion — call stack, base case, recursive case
- [ ] Memoization — top-down dynamic programming
- [ ] Tabulation — bottom-up dynamic programming
- [ ] Sorting — understanding `sorted()` uses Timsort (hybrid merge + insertion)
- [ ] Custom sort keys — `key=lambda`, `operator.attrgetter`
- [ ] Graph traversal — BFS, DFS with Python dicts
- [ ] Tree traversal — inorder, preorder, postorder
- [ ] Trie — prefix tree implementation in Python
- [ ] Union-Find / Disjoint Set — with path compression

---

## Phase 9: Python Internals & Performance

---

### 9.1 CPython Internals

- [ ] CPython vs PyPy vs Cython — implementation differences
- [ ] Bytecode — `dis.dis()` to inspect bytecode
- [ ] `__pycache__` and `.pyc` files — compiled bytecode caching
- [ ] `compile()` → `exec()` / `eval()` — dynamic code execution
- [ ] Frame objects — `sys._getframe()`, traceback inspection
- [ ] Code objects — `function.__code__`, `co_varnames`, `co_consts`
- [ ] GIL internals — how the GIL is released for I/O, C extensions
- [ ] GIL-free Python (PEP 703, Python 3.13+) — no-GIL experimental build
- [ ] `sys.settrace()` — execution tracing
- [ ] `sys.setprofile()` — profiling hook
- [ ] Import system — `importlib`, `__import__`, module search path
- [ ] `sys.modules` — module cache
- [ ] Circular imports — why they happen, how to fix
- [ ] `__all__` — controlling `from module import *`
- [ ] `__init__.py` — package initialization
- [ ] Namespace packages — packages without `__init__.py` (PEP 420)

### 9.2 Performance Profiling

- [ ] `time.perf_counter()` — high-resolution timer
- [ ] `timeit` module — reliable micro-benchmarking
- [ ] `cProfile` — function-level CPU profiling
- [ ] `cProfile` + `snakeviz` — visual profiling
- [ ] `line_profiler` — line-by-line CPU profiling (`@profile`)
- [ ] `py-spy` — sampling profiler (no code modification)
- [ ] `scalene` — CPU + memory + GPU profiler
- [ ] Flame graphs — visualizing call stacks
- [ ] Profiling async code — `aiomonitor`
- [ ] Benchmarking methodology — warmup, multiple runs, statistical analysis

### 9.3 Performance Optimization Techniques

- [ ] String concatenation — `"".join()` vs `+=` (O(n) vs O(n²))
- [ ] List comprehensions vs loops — comprehensions are faster
- [ ] Generator expressions vs list comprehensions — memory vs speed
- [ ] `dict` comprehensions and `set` comprehensions
- [ ] Local variables are faster than global variables (LOAD_FAST vs LOAD_GLOBAL)
- [ ] Avoid dot lookups in loops — `append = list.append`
- [ ] `collections.deque` for O(1) popleft vs list.pop(0) which is O(n)
- [ ] `set` for membership testing vs `list` — O(1) vs O(n)
- [ ] `__slots__` — faster attribute access + less memory
- [ ] `@functools.lru_cache` — memoize expensive computations
- [ ] `numpy` vectorization vs Python loops — 10-100x faster
- [ ] C extensions — `ctypes`, `cffi`, Cython for hot paths
- [ ] `struct.pack/unpack` — efficient binary data handling
- [ ] Avoiding unnecessary copies — `memoryview`, slice assignment
- [ ] `map()` and `filter()` vs comprehensions — marginal differences

---

## Phase 10: Production Python (What Google Actually Looks For)

---

### 10.1 Code Organization & Architecture

- [ ] Project structure — `src/` layout vs flat layout
- [ ] `pyproject.toml` — modern Python project configuration
- [ ] Package management — `pip`, `uv`, `poetry`, `pdm`
- [ ] Virtual environments — `venv`, `virtualenv`, `conda`
- [ ] Dependency locking — `requirements.txt` vs `poetry.lock` vs `uv.lock`
- [ ] Monorepo patterns for Python
- [ ] Module design — high cohesion, low coupling
- [ ] Circular dependency detection and resolution
- [ ] `__init__.py` design — what to export, lazy imports
- [ ] Namespace packages — when and why

### 10.2 SOLID Principles in Python

- [ ] **Single Responsibility** — one reason to change per class/module
- [ ] **Open/Closed** — open for extension, closed for modification (use protocols/ABCs)
- [ ] **Liskov Substitution** — subclasses must be substitutable for base classes
- [ ] **Interface Segregation** — small, focused interfaces (use `Protocol`)
- [ ] **Dependency Inversion** — depend on abstractions, not concretions

### 10.3 Clean Code Practices

- [ ] PEP 8 — style guide (enforced by `ruff`, `black`, `flake8`)
- [ ] `ruff` — extremely fast linter + formatter
- [ ] `black` — opinionated code formatter
- [ ] `isort` / `ruff` — import sorting
- [ ] Naming conventions — `snake_case` functions, `PascalCase` classes, `UPPER_CASE` constants
- [ ] Docstrings — Google style, NumPy style, Sphinx style
- [ ] Type hints everywhere — Google style mandates them
- [ ] Code review checklist — readability, testability, performance, security
- [ ] DRY (Don't Repeat Yourself) — but don't over-abstract
- [ ] YAGNI (You Aren't Gonna Need It) — don't build what you don't need
- [ ] KISS (Keep It Simple, Stupid) — simplest solution wins
- [ ] Composition over inheritance
- [ ] Favor immutability — `frozenset`, `tuple`, `@dataclass(frozen=True)`
- [ ] Guard clauses — early returns reduce nesting

### 10.4 Dataclasses & Modern Python

- [ ] `@dataclass` — basics: auto-generated `__init__`, `__repr__`, `__eq__`
- [ ] `@dataclass(frozen=True)` — immutable dataclass
- [ ] `@dataclass(slots=True)` — memory-efficient dataclass (Python 3.10+)
- [ ] `@dataclass(order=True)` — auto-generate comparison methods
- [ ] `field()` — default factories, repr control, compare control
- [ ] `field(default_factory=list)` — mutable default values done right
- [ ] `__post_init__` — validation after initialization
- [ ] `InitVar` — init-only fields (not stored as attributes)
- [ ] `ClassVar` — class variables in dataclasses (not included in `__init__`)
- [ ] Dataclass inheritance — field ordering gotchas
- [ ] `dataclasses.asdict()`, `dataclasses.astuple()` — conversion
- [ ] `dataclasses.replace()` — create modified copies
- [ ] Pydantic `BaseModel` vs dataclass — when to use which
- [ ] `attrs` library — more powerful alternative to dataclasses
- [ ] `NamedTuple` vs `dataclass` — when to use which

### 10.5 Serialization & Data Handling

- [ ] `json` — serialization/deserialization, custom encoders/decoders
- [ ] `json.JSONEncoder` subclass — serialize custom objects
- [ ] `pickle` — binary serialization (security risks!)
- [ ] `pickle` protocol versions — compatibility vs efficiency
- [ ] Why pickle is dangerous — arbitrary code execution on deserialization
- [ ] `struct` — binary data packing/unpacking
- [ ] `csv` module — reading/writing CSV safely
- [ ] `yaml` — `PyYAML` with `safe_load()` (never `load()`)
- [ ] `toml` / `tomllib` (Python 3.11+) — TOML parsing
- [ ] `msgpack` — fast binary serialization
- [ ] `protobuf` — schema-enforced serialization (Google's choice)
- [ ] `dataclasses` + JSON — serialization patterns
- [ ] Pydantic — validation + serialization in one

### 10.6 Security

- [ ] Input validation — never trust user input
- [ ] SQL injection — parameterized queries, ORMs
- [ ] Command injection — `subprocess` with `shell=False`, `shlex.quote()`
- [ ] Path traversal — `pathlib.Path.resolve()`, validate paths
- [ ] Deserialization attacks — `pickle.loads()` on untrusted data
- [ ] YAML deserialization — `yaml.safe_load()` only
- [ ] `eval()` / `exec()` — never on user input
- [ ] Secret management — `os.environ`, never hardcode secrets
- [ ] `secrets` module — cryptographic random for tokens/passwords
- [ ] `hashlib` — secure hashing (SHA-256, not MD5)
- [ ] `hmac` — message authentication
- [ ] Dependency scanning — `pip-audit`, `safety`
- [ ] `bandit` — static security analysis for Python

---

## Phase 11: Standard Library Deep Dives

---

### 11.1 `collections` Module

- [ ] `defaultdict` — factory function for missing keys
- [ ] `Counter` — counting, most_common(), arithmetic operations
- [ ] `OrderedDict` — move_to_end(), popitem(last=True)
- [ ] `ChainMap` — layered dict lookup (scopes, config overrides)
- [ ] `deque` — O(1) append/pop both ends, maxlen for bounded buffers
- [ ] `namedtuple` — lightweight immutable records
- [ ] `UserDict`, `UserList`, `UserString` — safe subclassing bases

### 11.2 `functools` Module

- [ ] `lru_cache` — memoization with LRU eviction
- [ ] `cache` — unbounded memoization (Python 3.9+)
- [ ] `cached_property` — one-time computed property
- [ ] `partial` — freeze some arguments
- [ ] `reduce` — accumulation
- [ ] `singledispatch` — generic function dispatch by first argument type
- [ ] `total_ordering` — auto-generate comparison methods
- [ ] `wraps` — preserve function metadata in decorators
- [ ] `cmp_to_key` — convert old-style comparison function to key function

### 11.3 `pathlib` Module (Modern File Handling)

- [ ] `Path` — object-oriented filesystem paths
- [ ] `Path.exists()`, `Path.is_file()`, `Path.is_dir()`
- [ ] `Path.mkdir(parents=True, exist_ok=True)` — safe directory creation
- [ ] `Path.glob()`, `Path.rglob()` — pattern matching
- [ ] `Path.read_text()`, `Path.write_text()` — simple file I/O
- [ ] `Path.read_bytes()`, `Path.write_bytes()` — binary I/O
- [ ] `Path.resolve()` — absolute path resolution
- [ ] `Path.relative_to()` — relative path computation
- [ ] `Path.stem`, `Path.suffix`, `Path.parent`, `Path.name`
- [ ] `Path` / operator for joining — `Path("dir") / "file.txt"`

### 11.4 `contextlib` Module

- [ ] `contextmanager` — generator-based context managers
- [ ] `asynccontextmanager` — async generator-based context managers
- [ ] `suppress` — ignore specific exceptions
- [ ] `redirect_stdout`, `redirect_stderr` — temporary output redirection
- [ ] `ExitStack` — manage dynamic number of context managers
- [ ] `closing` — ensure `.close()` is called
- [ ] `nullcontext` — no-op context manager (conditional context managers)

### 11.5 `dataclasses`, `enum`, `typing` (Covered in respective sections)

### 11.6 `subprocess` Module

- [ ] `subprocess.run()` — run external commands
- [ ] `capture_output=True` — capture stdout/stderr
- [ ] `check=True` — raise on non-zero exit code
- [ ] `shell=True` vs `shell=False` — security implications
- [ ] `subprocess.Popen` — advanced process management
- [ ] Piping between processes
- [ ] Timeouts — `timeout` parameter

### 11.7 `os` and `sys` Modules

- [ ] `os.environ` — environment variables
- [ ] `os.path` vs `pathlib` — prefer `pathlib`
- [ ] `os.cpu_count()` — number of CPUs
- [ ] `os.getpid()`, `os.getppid()` — process IDs
- [ ] `sys.argv` — command line arguments
- [ ] `sys.path` — module search path
- [ ] `sys.stdin`, `sys.stdout`, `sys.stderr` — standard streams
- [ ] `sys.exit()` — exit program
- [ ] `sys.getsizeof()` — object memory size
- [ ] `sys.getrecursionlimit()`, `sys.setrecursionlimit()` — recursion depth

---

## Phase 12: Daily Practice Plan

---

### Week 1-2: OOP Foundations
- Day 1: Classes, `__init__` vs `__new__`, class vs instance attributes
- Day 2: `@classmethod`, `@staticmethod`, `@property`, `cached_property`
- Day 3: `__slots__`, private attributes, name mangling
- Day 4: Single inheritance, `super()`, MRO
- Day 5: Multiple inheritance, diamond problem, mixins
- Day 6: Abstract Base Classes, `@abstractmethod`
- Day 7: Composition vs inheritance, delegation pattern
- Day 8: Practice — build a class hierarchy for a real system (e.g., payment processors)
- Day 9: `__repr__`, `__str__`, `__format__`, `__hash__`, `__eq__`, `__bool__`
- Day 10: Comparison operators, `@total_ordering`, sortable objects
- Day 11: Container protocol — `__getitem__`, `__len__`, `__contains__`, `__iter__`
- Day 12: `__getattr__`, `__getattribute__`, `__setattr__` — attribute access control
- Day 13: `__call__` — callable objects, class-based decorators
- Day 14: Practice — build a custom dict-like and list-like class

### Week 3-4: Descriptors, Metaclasses & Advanced OOP
- Day 15: Descriptors — `__get__`, `__set__`, `__delete__`, `__set_name__`
- Day 16: Build typed descriptor, validated descriptor, lazy descriptor
- Day 17: How `@property`, `@classmethod`, `@staticmethod` are descriptors
- Day 18: Metaclasses — `type()`, creating classes dynamically
- Day 19: Custom metaclass — registry pattern, validation pattern
- Day 20: `__init_subclass__` — the modern metaclass alternative
- Day 21: Practice — build a mini ORM with descriptors and metaclasses
- Day 22: Context managers — `__enter__`, `__exit__`, `contextlib`
- Day 23: Copy protocol — `__copy__`, `__deepcopy__`
- Day 24: Dataclasses — all features, `frozen`, `slots`, `field()`, `__post_init__`
- Day 25: Pydantic vs dataclass vs namedtuple — comparison exercise
- Day 26: Enums — `enum.Enum`, `IntEnum`, `Flag`, `auto()`
- Day 27: Practice — refactor a messy script into clean OOP architecture
- Day 28: Review & practice exam — design a library management system

### Week 5-6: Functions, Decorators & Generators
- Day 29: Closures, `nonlocal`, closure gotchas
- Day 30: Basic decorators, `@functools.wraps`, decorator with arguments
- Day 31: Class-based decorators, stacking decorators
- Day 32: Build practical decorators — retry, timing, rate-limiter, cache
- Day 33: `functools.lru_cache`, `singledispatch`, `partial`
- Day 34: Generators — `yield`, `send()`, `throw()`, `close()`
- Day 35: `yield from`, generator pipelines
- Day 36: `itertools` — complete module walkthrough with examples
- Day 37: Practice — build a data processing pipeline using generators
- Day 38: Type hints — basics, generics, `TypeVar`, `Protocol`
- Day 39: Type hints — `ParamSpec`, `Overload`, `TypedDict`, `Literal`
- Day 40: `mypy` — setup, strict mode, fixing type errors
- Day 41: Practice — add complete type hints to an existing project
- Day 42: Review — build a typed, decorator-heavy middleware system

### Week 7-8: Memory Management (The Google Differentiator)
- Day 43: Python memory model — references, `id()`, `is` vs `==`, interning
- Day 44: `sys.getsizeof()`, `pympler.asizeof()` — measuring object sizes
- Day 45: Object overhead — every object costs 16+ bytes, list vs tuple vs dict memory
- Day 46: Reference counting — `sys.getrefcount()`, what increases/decreases refs
- Day 47: `weakref` — `ref`, `proxy`, `WeakValueDictionary`, `finalize`
- Day 48: Garbage collection — generational GC, `gc` module, thresholds
- Day 49: `gc.collect()`, `gc.get_referrers()`, `gc.get_referents()` — debugging cycles
- Day 50: Practice — create and detect reference cycles, fix them
- Day 51: `tracemalloc` — trace allocations, take snapshots, compare snapshots
- Day 52: `memory_profiler` — line-by-line profiling, `mprof` plots
- Day 53: `objgraph` — visualize reference graphs, find leaks
- Day 54: `__slots__` deep dive — measure memory savings on 1M objects
- Day 55: Memory optimization — `array.array`, `memoryview`, `struct`, `mmap`
- Day 56: Practice — optimize a memory-heavy program (1M+ objects)

### Week 9-10: Concurrency & Parallelism
- Day 57: Threading — `Thread`, `Lock`, `RLock`, `Semaphore`
- Day 58: Threading — `Event`, `Condition`, `Barrier`, thread-local storage
- Day 59: GIL — what it is, when threading helps, when it doesn't
- Day 60: `concurrent.futures.ThreadPoolExecutor` — practical patterns
- Day 61: Multiprocessing — `Process`, `Pool`, `Queue`, `Pipe`
- Day 62: `concurrent.futures.ProcessPoolExecutor`, shared memory
- Day 63: `asyncio` — event loop, `async/await`, `gather`, `create_task`
- Day 64: `asyncio` — `Semaphore`, `Lock`, `Queue`, `TaskGroup`
- Day 65: `asyncio` — error handling, cancellation, timeouts
- Day 66: Practice — build an async web scraper with rate limiting
- Day 67: Concurrency patterns — producer-consumer, fan-out/fan-in, pipeline
- Day 68: Practice — build a concurrent data processing system
- Day 69: Review — when to use threading vs multiprocessing vs asyncio
- Day 70: Practice — refactor a sync application to async

### Week 11-12: Design Patterns & Architecture
- Day 71: Singleton, Factory Method, Abstract Factory
- Day 72: Builder, Prototype, Object Pool
- Day 73: Adapter, Decorator (pattern), Proxy
- Day 74: Facade, Composite, Bridge, Flyweight
- Day 75: Strategy, Observer, Command
- Day 76: State, Template Method, Iterator
- Day 77: Chain of Responsibility, Mediator, Memento
- Day 78: Practice — implement 5 patterns in a real mini-project
- Day 79: SOLID principles — apply each to Python code
- Day 80: Repository pattern, Service layer, Dependency Injection
- Day 81: Clean Architecture in Python — ports and adapters
- Day 82: Practice — design a multi-layer application (API → Service → Repository)
- Day 83: Code review exercise — review bad code, refactor to patterns
- Day 84: Review & comprehensive design exercise

### Week 13-14: Testing, Performance & Production
- Day 85: `pytest` — fixtures, parametrize, markers, conftest
- Day 86: Mocking — `Mock`, `MagicMock`, `patch`, `side_effect`
- Day 87: Testing patterns — AAA, test doubles, testing exceptions
- Day 88: Practice — write tests for an existing codebase (aim for 90% coverage)
- Day 89: `cProfile`, `line_profiler`, `py-spy` — CPU profiling
- Day 90: Performance optimization — string join, comprehensions, local vars, sets
- Day 91: `timeit` — benchmarking, methodology
- Day 92: Practice — profile and optimize a slow program (10x speedup target)
- Day 93: Error handling — exception hierarchy, chaining, custom exceptions
- Day 94: Logging — structured logging, log levels, configuration
- Day 95: Security — input validation, injection prevention, secrets management
- Day 96: Serialization — JSON, pickle, protobuf, msgpack
- Day 97: `pathlib`, `subprocess`, `os` — system interaction
- Day 98: Practice — build a production CLI tool with proper error handling, logging, testing
- Day 99: Mock interview — design + code a system in 45 minutes
- Day 100: Final review — identify weak areas, plan continued practice

---

> **How to practice each day:**
> 1. Read the concept (15 min)
> 2. Write code implementing it from scratch — NO copy-paste (30 min)
> 3. Build a small exercise/project using it (30 min)
> 4. Write a test for your code (15 min)
> 5. Add it to your practice website
>
> **Google bar:** If you can explain any concept on this roadmap to an interviewer while writing clean, typed, tested code on a whiteboard — you're ready.
