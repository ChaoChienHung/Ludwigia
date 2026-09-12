NUS CS5246 Text Mining
Week 1
CS5246 Text Mining — Lecture 1 Notes

Working with Text — Challenges

Text as data
- Text is unstructured data with variable length
- Exists in many file formats: TXT, CSV, DOCX, PDF, HTML, JSON, etc.
- Different character encodings complicate processing
- Most DBMS support only string-based or regex-based search
- Example task: find article headlines containing a number with two or more digits

Challenges of language reflected in text
- Language properties:
  - Ambiguous
  - Redundant
  - Changing over time
  - Unbounded
  - Imprecise
- Text properties:
  - Expressive
  - Sparse
  - Variable
  - Large-scale

Ambiguity in language
- Syntactic ambiguity:
  - Word sense ambiguity: bank (financial vs river), cancer (disease vs zodiac)
  - Part-of-speech ambiguity: run (verb/noun), fast (adjective/adverb/verb)
  - Structural ambiguity: "I see the man with a telescope"
- Semantic ambiguity:
  - Multiple meanings even after syntax is resolved
  - Example: "Alice and Bob are married" (to each other or others)
- Anaphoric ambiguity:
  - Unclear pronoun references
  - Example: "Alice and Sarah went for dinner. She invited her."
- Pragmatic ambiguity:
  - Meaning depends on context
  - Example: "Do you know what time it is?"

Expressivity of language
- Same meaning can be expressed in many forms
  - Example: "Please stop talking" vs "Shut up and listen"
- Use of idioms, neologisms, and literary devices:
  - Humor, sarcasm, irony, satire, exaggeration
  - Examples: "raining cats and dogs", "over the moon", "binge-watching"
- Algospeak:
  - Modified words to evade moderation
  - Examples: unalive, seggs, shmex, PDF file (slang for pedophile)

Scale and variation
- Natural language is emergent and diverse
  - About 6,500 languages across 150 language families
- Multiple writing systems and domains
  - News, social media, scientific papers
- Cultural differences and biases affect interpretation

Imprecision in text
- Meaning and labels are subjective and context-dependent
- Example: sentiment analysis of "I did not like this movie"
- Text analysis rarely has a single correct answer

Text as data — challenges
- Noise in text data:
  - Informal language, typos, grammatical errors
  - Out-of-vocabulary tokens (URLs, HTML entities)
  - OCR errors and formatting issues
  - Inconsistent styles (dates, abbreviations)
  - Incorrect annotations or class labels
- Outliers in text:
  - Extremely short or long documents
  - Different languages or domains
  - Different vocabularies and semantics
  - Related topic: out-of-distribution detection

Nominal vs numerical nature of text
- Text is a sequence of tokens with variable length
- Most algorithms require standardized, numerical input
- Words are nominal data:
  - No intrinsic numeric similarity
  - Example: "cat" vs "kitty" are semantically similar but numerically distinct

Ethical questions in text mining
- Distinction between what can be done and what should be done
- Examples:
  - Improving user writing
  - Inferring mental health from posts
  - Filtering or ranking content
  - Building chatbots
- Key quotes:
  - "If you torture the data long enough, it will confess to anything"
  - "With great power comes great responsibility"
- Case study:
  - Social media depression detection (2017–2025)
  - Raises issues of consent, purpose, bias, and societal impact

Example applications and project ideas
- Mental health prediction from online posts
- Knowledge graph generation from text
- Rumor detection on social media
- Privacy leak detection in text
  - Emails, phone numbers, sensitive information
  - Obfuscation via removal or replacement
- Crowdsourced search engines
  - Query classification, location detection, translation
- Event monitoring
  - Disaster detection and early warning
  - Supply chain and stock market impact assessment

Summary of key ideas
- Core concepts:
  - Text mining
  - Knowledge discovery process
  - Common text mining tasks
- Major challenges:
  - Natural language properties
  - Limitations of raw text
  - Ethical considerations
- Importance of understanding data and task before applying methods

Building blocks of written language
- Character:
  - Smallest symbol (letter, digit, punctuation)
- Morpheme:
  - Smallest meaning-bearing unit
- Word:
  - One or more morphemes
- Phrase:
  - One or more words
- Clause:
  - One or more phrases with subject and verb
- Sentence:
  - One or more clauses forming an independent statement
- Paragraph:
  - One or more sentences forming a discourse unit
- Document:
  - One or more paragraphs
- Corpus:
  - Collection of documents

Common sources of text
- Raw text documents
- Non-raw documents:
  - DOCX (python-docx)
  - PDF (PyPDF2)
- Public APIs:
  - Twitter JSON data (twython)
- HTML web pages
- OCR documents:
  - ocrd-calamari
- Databases

Basic pattern and substring matching
- Common tasks:
  - Detect hashtags, emails, URLs, emojis
  - Dates, phone numbers, IDs
  - Postal addresses, coordinates
  - Stock tickers, brand names
- Main tool:
  - Regular expressions

Common text mining tasks
- Text clustering:
  - Group similar documents
- Text classification:
  - Assign documents to predefined categories
- Keyword and keyphrase extraction:
  - Identify representative terms
  - Used for summarization and word clouds
- Named entity recognition:
  - Identify real-world entities
  - Types: person, location, organization, date, product
- Relationship extraction:
  - Convert unstructured text into structured knowledge
  - Example: entity-relation-entity triples
- Text summarization:
  - Automatic generation of concise summaries

Limitations and considerations
- Language properties remain challenging for algorithms
- Limitations of large language models:
  - Hallucinations
  - Weak grounding in facts
  - High computational cost
  - Limited reliability and interpretability
  - Weak performance in specialized domains

Text mining definition
- Text mining is data mining applied to text data
- Data mining definition:
  - Non-trivial extraction of implicit, previously unknown, and potentially useful information from data

From textual data to knowledge
- Data processing pipeline:
  - Data
  - Target data
  - Preprocessed data
  - Transformed data
  - Patterns
  - Knowledge
- Main steps:
  - Data selection
  - Data preprocessing and cleaning
    - Normalization (e.g., lowercasing)
    - Noise removal
  - Data transformation
    - Text converted into numerical representations
  - Data mining
    - Pattern discovery, clustering, classification, extraction tasks
  - Postprocessing
    - Visualization, interpretation, understanding

Types of data
- Well-structured data:
  - Fixed schema and attributes
  - Examples: relational databases, spreadsheets
- Semi-structured data:
  - Mix of structure and free text
  - Examples: XML, JSON, CSV, tagged documents
- Unstructured data:
  - No predefined data model
  - Examples: text, images, audio, video, social media

Text as strings
- String:
  - Sequence of characters including unicode
- Operations:
  - Pattern matching with regular expressions
- Limitation:
  - No inherent notion of words, phrases, or sentences

Text as written natural language
- Natural language:
  - Primary medium for expressing thoughts and ideas
  - Systematic but not formal
- Writing:
  - Visual representation of spoken language
  - Uses letters, digits, punctuation, and whitespace
Week 2
Basic Pattern / Substring Matching

Overview
- Common task in text processing: pattern-based substring matching
- Goal: identify, validate, extract, replace, or delete substrings that follow a specific pattern
- Core tool: Regular Expressions (RegEx)

Common pattern-matching targets
- Hashtags
- Email addresses
- URLs
- Emoticons and emojis (unicode characters)
- Dates, phone numbers, identification numbers
- Postal addresses, latitude/longitude coordinates
- Stock ticker symbols (e.g., AAPL, GOOG, AMZN)
- Brand names (e.g., Apple, Google, Amazon)

Regular Expressions (RegEx)
- Definition:
  - A character pattern that describes a set of strings matching that pattern
- Example:
  - lo+l matches "lol", "lool", "loool", etc.
- Typical applications:
  - Parsing documents to find specific patterns
  - Validation of structured text (e.g., passwords, email addresses)
  - Extraction, editing, replacement, or deletion of substrings
    - Examples: removing HTML tags, URLs, or unicode characters

RegEx in practice (Python re package)
- Two basic execution modes:
  - Match only the first occurrence of a pattern
  - Global search: match all occurrences of a pattern
- Functions may return:
  - Match objects (with span and groups)
    - re.search()
  - Or just the matched strings
    - re.findall()

Fixed patterns
- Fixed pattern:
  - Describes exactly one string
  - There is only one string that matches the pattern
- Equivalent to exact substring matching
- Default behavior is case-sensitive
- Examples:
  - month
  - months
  - 4
  - 10
- Case sensitivity can be explicitly controlled (e.g., case-insensitive search)

Metacharacters
- Characters with special meaning in RegEx
- Do not match themselves unless escaped
- Basic metacharacters:
  - \  .  ^  $  |  ?  *  +  ( )  [ ]  { }
- Meaning of common metacharacters:
  - \ : escape character or signals special sequence
  - . : matches any character except line breaks
  - ^ : matches start of string
  - $ : matches end of string
  - | : logical OR between patterns
- Note:
  - Results may be unintuitive due to greedy matching
  - Requires understanding greedy vs lazy evaluation

Greedy vs Lazy Evaluation

General Concepts
- Quantifiers in regex control how many times a character or group can repeat.
- Greedy and lazy describe how the regex engine matches repeated patterns.
- Greedy: matches as much text as possible while still allowing the overall match to succeed.
- Lazy (non-greedy): matches as little text as possible while still allowing the overall match to succeed.
- Lazy quantifiers are usually formed by adding '?' after a greedy quantifier.

Common Quantifiers
- * : matches 0 or more times (greedy by default)
- + : matches 1 or more times (greedy by default)
- ? : matches 0 or 1 time (greedy by default)
- {n,m} : matches between n and m times (greedy by default)
- Adding '?' after any quantifier makes it lazy:
  - *? : 0 or more times (lazy)
  - +? : 1 or more times (lazy)
  - ?? : 0 or 1 time (lazy)
  - {n,m}? : between n and m times (lazy)

Examples
- Greedy
  Pattern: "a.*b"
  String: "aaabbb"
  Matching process:
    1. .* consumes as much as possible: "aabbb"
    2. Regex backtracks to allow final 'b' to match
  Result: "aaabbb"

- Lazy
  Pattern: "a.*?b"
  String: "aaabbb"
  Matching process:
    1. .*? consumes as little as possible: first "a"
    2. Engine continues to match 'b'
  Result: "aaab"

Comparison Table
- Greedy: matches maximum length, default behavior, may require backtracking
- Lazy: matches minimum length, requires '?', useful for precise matches

Notes and Tips
- Greedy quantifiers can accidentally match more than intended if not careful.
- Lazy quantifiers are often used to extract shortest possible matches.
- Backtracking occurs in greedy matching if the initial match is too long.
- Lazy matching reduces unnecessary backtracking when short matches are desired.

Anchors
- Anchors match positions, not characters (zero-length matches)
- Common anchors:
  - ^ : beginning of string
  - $ : end of string
- Word boundary anchor: \b
  - Matches positions at word boundaries
  - Occurs in three cases:
    - Before the first character if it is a word character
    - After the last character if it is a word character
    - Between a word character and a non-word character
- Useful for matching whole words only

Word boundaries
- Enable precise word-level matching
- Example task:
  - Find all words of exactly 5 letters using boundaries and repetition constraints

Character sets
- Define a set of valid characters
- Enclosed in square brackets [ ]
- Matches exactly one character from the set
- Can be negated using [^ ]
- Ranges can be defined using -
- Examples:
  - [.,;:]
    - Matches a single punctuation character
  - [0-9][0-9]
    - Matches exactly two consecutive digits
  - [^a-z]
    - Matches any single character that is not a lowercase letter

Predefined character sets (shorthand)
- \d : digit, equivalent to [0-9]
- \D : non-digit, equivalent to [^0-9]
- \s : whitespace character (space, newline, tab, etc.)
- \S : non-whitespace character
- \w : word character [a-zA-Z0-9_]
- \W : non-word character

Equivalent expressions
- [0-9][0-9] and \d\d
  - Both match exactly two digits
- Shorthand improves readability and conciseness

Repetition patterns
- Used for patterns with flexible length
- Common use cases:
  - Numbers with more than two digits
  - Words shorter or longer than a given length
- Repetition metacharacters:
  - + : one or more occurrences
  - * : zero or more occurrences
  - ? : zero or one occurrence
  - {n} : exactly n occurrences
  - {l,u} : between l and u occurrences
  - {l,} : at least l occurrences
  - {,u} : at most u occurrences

RegEx — Groups

Groups: basic concept
- Groups are used to organize parts of a regular expression
- Defined using parentheses: ( )
- The entire pattern must match, but groups capture subparts of the match
- A match result becomes a tuple of strings
  - One entry per capturing group
- Groups can be nested
  - Example: ( ( ) ( ( ) ) )
- Group numbering is based on the order in which parentheses open

Capturing groups example
- Text: Send an email to alice@example.org for more information.
- Pattern:
  ([\w.-]+)@([\w.-]+)
- Full match: alice@example.org
- Group 1:
  - alice
- Group 2:
  - example.org
- Interpretation:
  - Group 1 matches the username
  - Group 2 matches the domain
- Sub-patterns:
  - @ matches the literal at-symbol
  - [\w.-]+ matches one or more letters, digits, underscores, periods, or hyphens

Using groups for extraction
- Groups allow extracting specific parts of a match
- Examples:
  - Find all occurrences of "haha", "hahaha", etc. using repetition within groups
  - Find domains of all URLs by capturing only the domain part
- Group numbering matters when accessing results programmatically

Group numbering complexity
- Nested and multiple groups lead to higher group indices
- Complex expressions may have many groups (e.g., Group #1 to Group #8)
- Tracking indices becomes error-prone when patterns evolve

Named groups
- Named groups improve readability and maintainability
- Avoid reliance on numeric group indices
- Syntax:
  (?P<name>pattern)
- Example:
  (?P<user>[\w.-]+)@(?P<domain>[\w.-]+)
- Match: alice@example.org
- Named captures:
  - user: alice
  - domain: example.org
- Useful when patterns are modified or reused

Named vs unnamed groups
- Without named groups:
  - Access groups by index (group(1), group(2), etc.)
- With named groups:
  - Access groups by name (group("user"), group("domain"))
- Named groups increase clarity and robustness of code

Non-capturing groups
- Non-capturing groups match patterns but do not store results
- Help manage group numbering
- Ignored when assigning group indices
- Syntax:
  (?:pattern)
- Example:
  (?:[\w.-]+)@([\w.-]+)
- Full match: alice@example.org
- Group 1:
  - example.org
- The username part is matched but not captured

Lookarounds
- Special group-like constructs used as assertions
- Do not consume characters in the final match
- Check whether a match is possible, then discard the assertion
- Two types:
  - Lookahead
  - Lookbehind
- Two forms:
  - Positive
  - Negative

Lookaround syntax and meaning
- Positive lookahead:
  - (?=B)
  - A(?=B): match A only if followed by B
- Negative lookahead:
  - (?!B)
  - A(?!B): match A only if not followed by B
- Positive lookbehind:
  - (?<=B)
  - (?<=B)A: match A only if preceded by B
- Negative lookbehind:
  - (?<!B)
  - (?<!B)A: match A only if not preceded by B

Lookbehind example
- Task:
  - Find all email addresses and return only their domains
- Text:
  - Send an email to alice@example.org for more information.
- Pattern:
  (?<=[\w.-]@)([\w.-]+)
- Match:
  - example.org
- Group 1:
  - example.org
- Notes:
  - Lookbehind asserts presence of a single character before @
  - In many RegEx engines (including Python re), lookbehinds must be fixed-length

Negative lookahead example
- Task:
  - Find all currency values except Singapore Dollar (SGD)
- Text:
  - For 100 SGD I can get around 71 USveD or 96 CAD.
- Pattern:
  (\d+)\s(?!SGD)
- Matches:
  - 71
  - 96
- Group 1:
  - 71
  - 96
- Explanation:
  - \d+ matches one or more digits
  - \s matches a whitespace character
  - (?!SGD) excludes values followed by "SGD"

Backreferences
- Used to match the same text as previously captured by a group
- Refer to groups by:
  - Number: \1, \2, ...
  - Name: (?P=name)
- Useful for enforcing repetition or symmetry in patterns
- Support partial replacement of matches

Backreference example
- Task:
  - Find all words that start and end with the same letter
- Text:
  - My mom said I need to pass this test.
- Pattern:
  \b([a-zA-Z])\w*\1\b
- Matches:
  - mom
  - test
- Group 1:
  - m (for mom)
  - t (for test)
- Explanation:
  - \b ensures word boundaries
  - ([a-zA-Z]) captures the first letter
  - \w* matches zero or more word characters
  - \1 enforces the same letter at the end of the word

Backreferences in practice
- Enable detection of repeated structures within tokens
- Common uses:
  - Palindromic-like patterns
  - Reduplicated words
  - Consistency checks within strings
- Require capturing groups to be defined beforehand

RegEx — Replacements

Goal
- Replace matching sequences in text with new sequences
- Common use case: find & replace operations
- Methods:
  - Most RegEx engines provide built-in replacement functions (e.g., Python: `re.sub()`)
- Deleting a match:
  - Replace match with empty string `''`

Simple replacement example
- Task: Replace all occurrences of "lol", "lool", "loool", etc. with "[SLANG+]"
- Purpose:
  - Standardize variants of informal expressions
  - Reduces noise in text preprocessing for NLP or text analysis

Partial replacement example
- Task: Replace letters repeated more than 3 times with only 2 occurrences
- Pattern: Use backreferences to detect repetition
- Example:
  - Input: coooool → Output: coool
- Note:
  - Using naive patterns like `re.sub(r'(\w)\1{1,}', r'\1', …)` may over-correct
    - E.g., would reduce "lol" to "lo" incorrectly
- Backreferences are essential to preserve intended repetitions

Challenges in using RegEx

1. Complexity and perfection
- Finding a "perfect" RegEx that handles all possible edge cases is extremely difficult
- Perfection is not always necessary
- Required complexity depends on the task:
  - Simple pattern finding (e.g., detecting email-like strings)
  - Strict validation (e.g., validating emails)
- Overly complex patterns increase risk of errors

3. Example: Matching article "the"
- Naive approach: `the`
- Problems:
  - False positives: matches inside other words (e.g., "other", "theology", "weather", "bathe", "mother")
  - False negatives: may miss capitalized occurrences (e.g., "The", "THE")
- Better solution: use word boundaries or case-insensitive matching:
  - Example: `\bthe\b` with case-insensitive flag

Error types
- False Positives (Type I Errors):
  - Matching strings that should not have matched
  - Example: matching "the" in "other"
- False Negatives (Type II Errors):
  - Failing to match strings that should match
  - Example: missing "THE"

Trade-offs
- Reducing false positives often increases false negatives, and vice versa
- In practice, prioritize based on application:
  - Sensitive data removal: false negatives are worse
  - Text normalization: false positives may be tolerable

Quick quiz: hardest cases to address
- Examples of challenging numeric formats:
  - `-12,345.67` → negative number with thousand separator
  - `6.5*10^8` → scientific notation
  - `.22` → fractional numbers without leading zero
  - `Not 4.5 is better.` → numbers embedded in text
- Most difficult:
  - Scientific notation and negative numbers often require custom handling beyond basic RegEx

RegEx — Limitations

Equivalence
- Regular Expressions (RegEx) describe Regular Languages
  - Most restricted class of languages in the Chomsky Hierarchy
- Regular Language
  - Language accepted by a Finite State Automaton (FSA)
  - Example: `{lol, loool, lolol, looolol, …}`
    - Can be represented by the RegEx: `l(o+l)+`
    - FSA transitions correspond to each character in the pattern

Relationship to Finite State Automata
- Basic equivalences between RegEx and FSA:
  - Concatenation: `ab` → sequence of states q0→q1→q2
  - Alternation: `a|b` → branch between states for a or b
  - Repetition: `a*` → loop back to previous state
- FSAs can be drawn to visually represent RegEx patterns

Limitations of RegEx
- Not all languages can be described using standard RegEx (Regular Languages)
  - Classic example: sequences requiring memory of an arbitrary number of characters (e.g., equal number of 0s and 1s)
  - Intuition: finite number of states → cannot remember unbounded history
- Practical implication:
  - Know which patterns can be handled with RegEx
  - Complex patterns may require advanced parsing or statistical/ML models
- Modern RegEx engines:
  - Some extend beyond classic Regular Languages
  - Implement features like recursive references, balancing groups
  - Can handle advanced patterns, e.g., palindromes

Quick Quiz Example
- Can you build a RegEx / FSA for natural language sentences like:
  - "It's Wednesday night, I'm out…"
  - Answer: Undecidable (natural language sentences are generally context-sensitive, not regular)

Summary
- Powers of RegEx:
  - Extremely powerful for string-level text mining tasks
  - Essential skill for text processing and manipulation
- Limitations:
  - Cannot express all possible patterns
  - Hard rules only (deterministic)
  - Higher-level tasks (semantic analysis, summarization, sentiment analysis) require statistical or machine learning approaches

Text Preprocessing — Main Purposes

- Two main purposes:
  1. Convert text as string → text as written in natural language
  2. Convert raw source text → "proper" input for text mining methods
- Representations:
  - Text as sequence of characters → text as collection of tokens
    - set
    - multiset / bag
    - sequence
    - subwords
    - words
    - phrases
- Text cleaning:
  - Remove noise: HTML tags, unicode characters, URLs, etc.
  - Address natural language challenges: reduce redundancy, variability; make bounded
  - Helps text mining methods identify patterns
- Tokens carry more semantic meaning than characters

Tokenization

- Definition: splitting a string into tokens → build vocabulary (set of unique tokens)
- Token: character sequence with semantic meaning (words, numbers, punctuation; depends on application)
- Importance: critical step for NLP algorithms (errors propagate → garbage in, garbage out)

Three Basic Approaches

1. Character-based
   - Tokens = individual characters
   - Easy to implement (RegEx: . matches all characters)
   - Limitations:
     - Characters lack semantic meaning
     - Suitable only for word-level tasks (e.g., classifying names)
   
2. Word-based
   - Split text into words, numbers, punctuation
   - Approaches using RegEx:
     - Match all words, numbers, punctuation: \w+|\d+|[,.;:]
     - Match boundaries between words and non-words: (?=\W)|(?<=\W)
   - Challenges:
     - Multiword phrases: "New York City"
     - Contractions: "I'm", "don't"
     - Hyphenation: "C++"
     - Acronyms, special tokens, emails, URLs
     - RegEx can get complex; different tokenizers yield different results

3. Subword-based
   - Data-driven tokenization; no fixed rules
   - Motivations:
     - Handle Out-of-Vocabulary (OOV) words
     - Handle very rare words
   - Algorithms: Byte Pair Encoding (BPE), Unigram Language Model Tokenization, WordPiece
   - Process:
     1. Token Learner: builds vocabulary from corpus
     2. Token Segmenter: tokenizes text using vocabulary

BPE Token Learner (example)

- Corpus preparation: split into characters
- Initialize vocabulary: {'d','e','g','i','l','n','o','r','s','t','w','_'}
- Repeat:
  1. Find most frequent adjacent pair of tokens
  2. Merge them into a new token
  3. Replace in corpus
- Stop after k merges
- Example merge sequence:
  - (e, s), (es, t), (est, _), (l, o), (lo, w), (n, e), (ne, w), (new, est_)
- Token Segmenter:
  - Tokenizes new words by applying learned merges in order
  - Example: "newer" → "new", "er_"

Subword Tokenization Challenges

- LLM issues often arise from tokenization:
  - Difficulty spelling words
  - Difficulty reversing strings
  - Poor non-English language performance
  - Problems with arithmetic
  - YAML vs JSON preference
- Can yield unexpected splits for:
  - Numbers: "100+1900" vs "127+5043"
  - Orthographic variations: "Egg." vs "EGG."

Tokenization Summary

- Tokenization: low-level NLP task; non-trivial, language-dependent
- Particularly tricky for informal language (social media)
- Approaches:
  - Character-based: trivial, low semantic content
  - Word-based: rule-based, language-dependent, OOV/rare word issues
  - Subword-based: learned from data; tokens often correspond to morphemes
- Practical considerations:
  - Identify type of text (formal vs informal, special tokens like URLs or hashtags)
  - Evaluate tokenizers before creating custom ones

Text Normalization — Main Goals

- Goal: Convert text into a canonical (standard) form
  - Remove noise, variability, or "randomness" from text
  - Affects characters, words, sentences, and documents
- Common normalization steps:
  - Stopword removal (e.g., a, an, the, not, and, or, but, to, from, at)
  - Removal of non-standard tokens (e.g., URLs, emojis, emoticons)
  - Case folding (convert all letters to upper or lower case)
  - Stemming / Lemmatization (reduce words to base form)

Examples of Normalization:

Raw | Normalized
---|---
Germany | GERMANY → germany
USA | U.S.A → US of A → USA
tonight | tonite → 2N8 → tonight
connect | connects → connected → connecting → connect
:) | :-) → :o) → [EMOTICON+]

Stopword Removal

- Stopwords are language- and application-specific
- Definition: words removed from text before processing
- Usually common words that carry little semantic meaning
- Reasoning:
  - Many tasks benefit from focusing on "important" words (e.g., document clustering, classification)
- Manual removal can be done with RegEx and Python
- Caveat: Some stopwords may affect meaning (e.g., negations like "not")

Removal of Non-Standard Tokens

- Non-standard tokens: tokens not in predefined vocabulary
  - Examples: HTML tags, URLs, hashtags, unicode characters
- Usually do not negatively affect processing
- Can be removed manually with RegEx or specialized tools

Case Folding

- Convert letters to a uniform case (usually lowercase)
- When to apply:
  - Case not important for task (e.g., clustering, classification, information retrieval)
- When NOT to apply:
  - Tasks where case carries information (e.g., Named Entity Recognition, Machine Translation)
- Caveats:
  - Uppercase words in the middle of sentences may be significant (e.g., Bush vs. bush)

Stemming

- Purpose: Reduce words to their stem
- Approach: Rule-based, crude chopping of affixes
- Characteristics:
  - Pros: Fast, no lexicon required
  - Cons: Stem may not be a proper word
- Examples (raw → stemmed):
  - cats → cat
  - running → run
  - phones → phon(e)
  - crying → cry/cri
  - went → went
- Porter Stemmer:
  - Series of rewrite rules applied in cascade
  - Examples of rules:
    - sses → ss (possesses → possess)
    - tional → tion (optional → option)
    - ies → i (cries → cri)
    - (*v*)ing → ε (singing → sing)
    - (m>1)ement → ε (replacement → replac)
  - Implementation with RegEx:
    """
    sses -> ss      re.sub(r"(\w{2,})sses", r"\1ss", word)
    tional -> tion   re.sub(r"(\w{2,})tional", r"\1tion", word)
    ies -> i         re.sub(r"(\w{2,})ies", r"\1i", word)
    (*v*)ing -> ε    re.sub(r"((?=.*[aeuoi])[a-zA-Z]{2,})ing", r"\1", word)
    (m>1)ement -> ε  re.sub(r'(\w{2,})ement', r'\1', word)
    """
- Example cascading:
  - Input: possessiveness
  - Rules applied sequentially: (m>1)ness → ε, (m>1)ive → ε

Lemmatization

- Purpose: Reduce words to base dictionary form (lemma)
- Differentiates word forms: nouns (N), verbs (V), adjectives (A)
- Examples:
  Raw | Lemmatized (N) | Lemmatized (V) | Lemmatized (A)
  ---|---|---|---
  running | running | run | running
  phones | phone | phone | phones
  went | went | go | went
  worse | worse | worse | bad
  mice | mouse | mice | mice
- Approach:
  - Dictionary: mappings from (word, POS) → lemma
  - Rules: handle cases not in dictionary (similar to stemmer rules)
    - ys → y (ways → way)
    - ies → y (babies → baby)
    - ves → fe (lives → live)
    - Exceptions: irregular nouns (mice, geese)
- Pros:
  - Produces proper words
  - Normalizes irregular forms (went → go, worst → bad)
- Cons:
  - Requires lexicons / lookup tables and POS tagging
  - Slower than stemming

Practical Notes

- Normalization is task-dependent
- Preserve capitalization if required:
  - Use core shapes: lowercase, uppercase, titlecase
- Be careful with stopwords like negations ("not") in sentiment tasks
- Regex can assist but has limitations (e.g., decimal vs sentence period ambiguity)

Summary of Text Preprocessing

- Regular Expressions: fundamental tool
- Text Preprocessing prepares data for analysis:
  - Tokenization
  - Normalization:
    - Stopword removal
    - Removal of non-standard tokens
    - Case folding
    - Stemming
    - Lemmatization
- Choice of normalization depends on task and language
Week 3
Text as Data — Challenges
- Text = sequence of words (tokens)
- Many algorithms require:
  - Standardized/canonical input (often fixed length)
  - Numerical input (for comparison, addition, scaling)
- Raw text is variable-length, nominal data, and not directly suitable for numerical methods
- Important concept: similarity between data items
  - Applications: document clustering, classification, search, recommender systems, plagiarism detection, near-duplicate detection

Normalization of Text
- Steps:
  - Removal of non-words
  - Removal of stopwords
  - Case-folding (convert to lowercase)
  - Lemmatization
- Example vocabulary after normalization: {elect, goal, mayor, player, team, term, vote, win}

Text Representation Methods

1. Set of Words
- Document represented as a set (duplicates removed, order ignored)
- Similarity measures: Jaccard Similarity
- Pros: Simple, intuitive, enables similarity-based methods
- Cons: Ignores term frequency, treats all words equally

2. Bag of Words (Multiset)
- Document represented as a bag (duplicates allowed, order ignored)
- Enables:
  - Similarity: multiset Jaccard
  - Classification: Naive Bayes
- Visualizations: Word clouds
- Pros: Simple, enables similarity & basic classification
- Cons: Requires careful preprocessing; all words weighted equally

Vector Space Model (VSM)
- Represents document as a fixed-length numerical vector
- Feature extraction = vectorization of text
- Types of vectors:
  1. Binary Weights
     - Matrix entries: 0 (term absent) or 1 (term present)
     - Equivalent to set-of-words representation
  2. Term Frequencies (TF)
     - Matrix entries: integer counts of term occurrences
     - Equivalent to bag-of-words representation
     - Assumes higher frequency = more important
     - Optional sublinear scaling (e.g., logarithm) to dampen effect
  3. TF-IDF Weights
     - Combines term frequency and inverse document frequency
     - Formula: 
       - tf(t,d) = frequency of term t in document d
       - df(t) = number of documents containing t
       - idf(t) = log(N / df(t)), N = total number of documents
       - weight w(t,d) = tf(t,d) * idf(t)
     - Reduces importance of frequent terms across documents
- Term-Document Matrix (TDM)
  - Rows = terms, Columns = documents
  - Entries = weights (binary, TF, TF-IDF)
  - Often very sparse
- Vocabulary reduction:
  - Remove rare terms (min document frequency)
  - Keep Top-k most frequent terms

Document Similarity in VSM
- Vectors in high-dimensional space, one axis per vocabulary term
- Similarity approaches:
  1. Dot Product
     - High for long vectors with large values in same dimensions
     - Biases toward longer documents
  2. Cosine Similarity
     - Normalized dot product: cos(θ) = (A·B) / (||A|| * ||B||)
     - Measures angle between vectors, mitigates effect of length

N-Grams
- Consecutive sequences of n words (1-grams = words)
- Captures local word order
- Larger n → increased sparsity of TDM
- Can reduce vocabulary by filtering rare n-grams or keeping Top-k

Applications of VSM
- Keyword Extraction
  - High-weight terms (TF-IDF) often correspond to important keywords
  - Helps in tagging, summarization, visualization
- Document Search
  - Query treated as a document vector
  - Candidate selection: documents containing ANY search term
  - Ranking: compute similarity (e.g., cosine) between query vector and document vectors

Limitations of VSM
- Ignores word order
- Sparse and high-dimensional vectors
- Cannot capture semantic similarity (e.g., "team" vs "group")
- Over-reliance on term frequencies may misrepresent importance

Dense Word & Text Vectors
- Motivation:
  - Capture semantic similarity
  - Lower-dimensional, less sparse
  - Generalize better than count-based vectors
- Word Vectors:
  - One-hot encoding: orthogonal vectors, no notion of similarity
  - Learned embeddings: Word2Vec, GloVe, fastText, ELMo, BERT
    - CBOW: predict word from context
    - Skip-gram: predict context from word
- Dense Text Vectors:
  - Aggregation of word vectors (average, pooling)
  - Custom embeddings: Doc2Vec, Skip-Thought, Sentence-BERT
- Pros:
  - Capture semantic similarity
  - More efficient storage
- Cons:
  - Quality depends on model and training data
  - Low interpretability

Practical Notes
- TDM matrices are extremely sparse (e.g., 98%+ zero entries)
- Additional handcrafted features can be combined with VSM vectors
- Normalization needed when features have different scales
- TF-IDF is not effective for:
  - Very short texts
  - Highly repetitive or domain-specific frequent words
- Solutions: use embeddings or domain-specific weighting schemes

Summary
- VSM provides fixed-size numerical representation of text
- Enables similarity computations, keyword extraction, document search, clustering, classification
- Dense embeddings provide more semantic power and efficiency
- Applications: text classification, sentiment analysis, search, summarization
Week 4
CS5246 Text Mining — Lecture 4  

AGNES — Basic Algorithm
1. Initialization:
   - Each data point is treated as its own cluster
2. Repeat:
   - Merge the two closest clusters
3. Terminate:
   - When only one cluster remains

AGNES — Implementation Details
- Uses a distance matrix storing distances between all clusters
- Initially:
  - Distance between clusters equals distance between individual points
- After merges:
  - Distance between clusters depends on chosen linkage method

Linkage Methods in AGNES
- Single Linkage
  - Distance between two clusters = minimum distance between any pair of points
  - Supports non-globular (chain-like) clusters
- Complete Linkage
  - Distance between two clusters = maximum distance between any pair of points
  - Produces compact, spherical clusters
- Average Linkage
  - Distance between two clusters = average distance between all point pairs
  - Compromise between single and complete linkage

Linkage Comparison
- Single linkage:
  - Only method that can capture non-globular cluster shapes
- Text data:
  - Highly non-globular clusters are rare
  - Complete or average linkage is usually more appropriate

AGNES — Step-by-Step with Average Linkage
- Start with each point as a singleton cluster
- Iteratively:
  - Merge closest pair of clusters
  - Update distance matrix using average linkage
- Continue merging until:
  - All points belong to a single cluster
- Final result:
  - A complete dendrogram representing all merge steps

Cluster Evaluation — Purpose
- Compare results of different clustering algorithms
  - Example: K-Means vs AGNES
- Compare results of same algorithm with different parameters
  - Example: different K in K-Means or cut levels in AGNES dendrogram
- Reduce the effects of noise on clustering
- Two main evaluation approaches:
  - External quality measures
    - Compare clustering to ground truth labels (rarely available)
  - Internal quality measures
    - Evaluate clustering quality using only the data itself
- Challenge: common evaluation metrics often not very informative for text clustering

Cluster Evaluation — Practical Comments
- Choosing the "best" clustering often pragmatic rather than absolute
  - Fixed number of clusters
  - Consider maximum, minimum, or average cluster size
  - Focus on individual clusters of interest rather than the whole clustering
    - E.g., the biggest or smallest cluster, or clusters containing certain key points
  - Use higher K in K-Means and merge clusters later if needed
  - Often clustering is exploratory to gain initial insights
- No universally perfect evaluation metric for text data
- Supplementary materials provide more cluster evaluation techniques

Summary — Clustering
- Clustering identifies patterns (groups) in unlabeled data
- Core concept in data mining with many applications
- Algorithms discussed:
  - K-Means (centroid-based, partitional)
  - AGNES (hierarchical, agglomerative)
- Focused on conceptual understanding and basic inner workings
- Many possible optimizations and tweaks exist
- Major challenge: cluster evaluation
  - No one-size-fits-all algorithm or parameter setting
- Takeaway: clustering is context-dependent and exploratory

Quick Quiz Concept
- Why are common clustering evaluation metrics often less useful for text data?
  - Example context: documents represented by TF-IDF vectors
  - Reasoning:
    - High-dimensional, sparse data
    - Cosine similarity often more meaningful than Euclidean distance
    - Cluster boundaries may be diffuse or overlapping
    - Metrics like SSE may not capture semantic coherence

Text Classification — Introduction
- Task: assign a document to a predefined class
- Very common machine learning task in text mining
- Input: document; Output: class label(s)
- Examples of classification tasks:
  - Language detection, Spam detection, Subject/genre classification, Authorship attribution, Sentiment analysis

Text Classification
- Language detection
  - Straightforward if alphabets are distinct
  - Challenging for closely related languages
- Email/SMS spam detection
  - Identify annoying or harmful messages
- Authorship attribution
  - Linguistic forensics to identify anonymous writers
  - Assumes unique writing styles (vocabulary, phrases, sentence length, typos)
- Sentiment analysis
  - Detect subjective or emotional attitudes in text
  - Applied to product reviews, social media, brand monitoring, political views, trend analysis

Formal Setup
- Notation:
  - D = set of all documents
  - d ∈ D = a single document
  - C = set of all classes
  - c ∈ C = a single class
- Task: learn a mapping f: D → C that approximates the true (unknown) mapping
- Note: documents may belong to multiple classes (multilabel classification)

Classification Approaches
1. Rule-based methods
   - Use explicit decision rules to assign classes
2. Supervised learning (machine learning)
   - Learn classification function automatically from labeled examples (document, class pairs)

K-Nearest Neighbor Algorithm (KNN) — Intuition
- The label of an unseen data point x is determined by the labels of its k-nearest neighbors
- Assumption: similar data points have similar labels
- Requires a notion of similarity or distance between data points
- Example: assign label/color to an unseen point based on neighboring points

KNN — Algorithm
- Training:
  - Simply store the labeled training data
- Prediction for unseen point xi:
  1. Compute distances between xi and all training data points
  2. Identify the k-nearest neighbors
  3. Assign to xi the most frequent label among the k neighbors
- Notes:
  - k is typically odd to reduce tie likelihood
  - Different values of k can yield different predictions

Quick Quiz Concept
- Should k be a prime number?
  - Using a prime may reduce chance of ties in some cases
  - Not strictly necessary but can be beneficial

- Similarity is central to clustering and classification tasks
- Text documents can be modeled as high-dimensional vectors
- K-Means is a centroid-based clustering algorithm minimizing SSE
- Euclidean distance is fundamental to standard K-Means
- Vector normalization makes K-Means compatible with cosine similarity
- Lloyd’s Algorithm is efficient but sensitive to initialization

K-Means — Limitations: Initial Centroids
- Different initializations of centroids can lead to different final clusterings
- Different clusterings usually have different SSE values
- Lloyd’s algorithm converges to a local minimum, not necessarily the global minimum
- Goal is to find a clustering with minimum possible SSE (global optimum), but this is not guaranteed

K-Means — Empty Clusters Issue
- Some centroid initializations may result in empty clusters
- An empty cluster occurs when no data points are assigned to a centroid
- This can happen when a centroid is “blocked off” by other centroids
- Empty clusters are undesirable and require special handling or reinitialization

Quick Quiz (Conceptual)
- Maximum number of empty clusters with K-Means (K ≥ 2)
  - Maximum possible empty clusters: K − 1
  - Reason: all data points could be assigned to a single cluster

K-Means Variants — K-Means++
- Modification only affects centroid initialization
- Assignment and update steps remain unchanged
- Goals:
  - Spread out initial centroids
  - Reduce likelihood of poor local optima
  - Improve clustering quality and convergence speed
- Benefits:
  - Better performance in practice
  - Theoretical approximation guarantees

K-Means++ Initialization Algorithm
1. Randomly select one data point as the first centroid
2. Repeat until K centroids are selected:
   - For each data point, compute distance to the nearest existing centroid
   - Select the next centroid randomly, with probability proportional to the squared distance
- Effect:
  - Points far from existing centroids have higher probability of being selected
  - Encourages well-separated initial centroids

Quick Quiz (Conceptual)
- Even with theoretically optimal initialization:
  - It is impossible to guarantee no empty clusters in all cases
  - Empty clusters can still occur during later iterations

Hierarchical Clustering Overview
- Produces a hierarchy of clusters represented as a dendrogram
- Clusters can be obtained by cutting the dendrogram at a chosen level
- Different cut levels yield different numbers of clusters

Hierarchical Clustering — Two Main Types
- Agglomerative (bottom-up)
  - Start with each data point as its own cluster
  - Iteratively merge the closest pair of clusters
  - Stop when a single cluster remains
  - Also known as AGNES (AGglomerative NESting)
- Divisive (top-down)
  - Start with one cluster containing all points
  - Iteratively split clusters
  - Stop when each cluster contains a single point
  - Also known as DIANA (DIvise ANAlysis)

Dendrogram Depth (Conceptual)
- Minimum possible depth: O(log N)
- Maximum possible depth: O(N)
- Depends on the order and structure of merges

Core Observation: Similarity
- Similarity between data items is a fundamental concept in text mining
- Applications include:
  - Document clustering, Document classification (e.g., K-Nearest Neighbor), Document search and retrieval, Recommender systems, Plagiarism detection, Near-duplicate detection
- Central question: how to compute similarity between text units (words, sentences, documents, etc.)

Documents as Vectors
- Vector Space Model
  - Each document is represented as a vector
  - Vocabulary size defines dimensionality
  - Each word corresponds to one dimension
  - Typically very high-dimensional (tens of thousands of dimensions)
- Common representations
  - Bag of Words
  - TF-IDF vectors
- Document similarity is reduced to vector similarity
- Similarity or distance measures
  - Jaccard similarity (for sets or multisets)
  - Euclidean distance
  - Cosine similarity
- Choice of similarity depends on representation and task

Clustering Overview
- Goal of clustering
  - Group unlabeled data into clusters of similar objects
  - Maximize intra-cluster similarity
  - Minimize inter-cluster similarity
- Requirements for document clustering
  - Document representation (set of words or vectors)
  - Similarity or distance measure
  - Clustering algorithm to assign documents to clusters

K-Means Clustering: Characteristics
- Centroid-based clustering
- Partitional clustering
- Exclusive: each point belongs to exactly one cluster
- Complete: all points are assigned
- Main input parameter: number of clusters K

K-Means Objective Function
- Optimization objective
  - Minimize the Sum of Squared Errors (SSE)
  - SSE = sum over all clusters of squared Euclidean distance between each data point and its assigned centroid
- Finding the global optimum is NP-hard
- Practical solution: greedy optimization using Lloyd’s Algorithm

Centroid Definition
- Centroid is defined to minimize SSE
- Using calculus:
  - Take derivative of SSE with respect to centroid
  - Set derivative to zero
  - Solve for centroid
- Result:
  - Centroid of a cluster is the mean of all points assigned to that cluster
- This result holds specifically for Euclidean distance

Distance Considerations in K-Means
- K-Means uses distances between data points and centroids, not pairwise distances
- Definition of centroid depends on the distance function
- K-Means is guaranteed to converge only with Euclidean distance
- Euclidean distance properties
  - Depends on vector magnitude
  - Sensitive to document length

Normalization and Cosine Similarity
- Solution to magnitude sensitivity: normalize document vectors
- Normalize each document vector to unit length
- For unit vectors u and v:
  - Squared Euclidean distance is proportional to cosine similarity
- Effect:
  - K-Means focuses on relative orientation rather than absolute length
- In practice:
  - Many libraries (e.g., sklearn) normalize vectors by default for text clustering

Lloyd’s Algorithm (K-Means Algorithm)
1. Initialization
   - Select K initial centroids (often randomly)
2. Repeat until convergence
   - Assignment step
     - Assign each data point to the nearest centroid
   - Update step
     - Recompute each centroid as the mean of its assigned points
3. Stop when assignments do not change between iterations

Convergence Properties
- K-Means always converges
  - Assignment step does not increase SSE
  - Update step does not increase SSE
- SSE decreases monotonically or stays the same
- Most SSE reduction occurs in early iterations
- Limitation
  - Converges to a local optimum, not guaranteed global optimum
  - Initialization of centroids strongly affects final result


Choice of k — Effects
- k too small:
  - Predictions sensitive to noise or outliers
  - Irregular, uneven decision boundaries
  - Risk: overfitting
- k too large:
  - Cannot capture local patterns
  - Overly smooth decision boundaries
  - Risk: underfitting
- Proper k selection addressed during model tuning

KNN — Text Classification
- Steps:
  1. Feature extraction (e.g., TF-IDF term-document matrix)
  2. Create document vectors
  3. Train KNN classifier
  4. Evaluate predictions for k = 1..5
  5. Distance metric: can directly support cosine distance
- Value of k affects classification results

KNN — Pros and Cons
- Pros:
  - Simple and intuitive
  - Predictions easy to interpret
  - Only requires a meaningful distance metric
  - Can produce arbitrarily shaped decision boundaries
  - No explicit training phase
- Cons:
  - Finding neighbors at test time can be slow (requires efficient search structures)
  - All training data must be stored in memory

Supervised Training/Learning — Basic Setup
- Requirement: labeled dataset (documents + class labels)
- Split dataset into:
  - Training data
  - Test data
- Training:
  - Use training data to build classifier
- Evaluation:
  - Compare predictions on test data with ground truth
- Note: test data must remain unseen during training and hyperparameter tuning

Extended Setup — Model Optimization
- Building a good classifier involves:
  - Selecting preprocessing steps (e.g., normalization, n-grams)
  - Choosing model type/family (e.g., KNN)
  - Tuning hyperparameters (e.g., k in KNN)
- Iterative evaluation required
- Important: never use test data for tuning

Training & Evaluation Using Validation Data
- Data split:
  - Training data: model fitting
  - Validation data: model selection and hyperparameter tuning
  - Test data: final performance evaluation
- Ensures generalizability of results

K-Fold Cross Validation
- Split training data into k blocks of equal size (e.g., k=10)
- Iteratively train on k−1 blocks, validate on the remaining block
- Repeat k times with different blocks as validation
- Advantages:
  - More reliable average performance
  - Variance between folds indicates stability of model
- Note: this k is unrelated to k in KNN

Summary — Lecture 4
- Document similarity:
  - Central to clustering and classification tasks
  - Choice of similarity metric depends on task and document representation
- Similarity-based techniques covered:
  - Clustering: K-Means, AGNES
  - Classification: K-Nearest Neighbor
- Not covered in detail:
  - Performance considerations for large corpora
  - Optimization techniques (sparse matrices, efficient search structures)
- Key idea: focus on relative similarities between documents for analysis
Week 5
CS5246 Text Mining — Lecture 5: Text Classification (Classic ML to Deep Learning)

Text classification overview
- A common machine learning task focused on assigning a predefined class label to a text document
- Input: text document
- Output: class from a finite set of labels
- Example tasks:
  - Language detection
  - Spam detection
  - Subject or genre classification
  - Authorship attribution
  - Sentiment analysis

K-Nearest Neighbor (KNN) recap
- Core idea: label of an unseen data point is determined by the labels of its k nearest neighbors
- Assumption: similar data points tend to have similar labels
- Characteristics:
  - Pros: simple, intuitive, explainable, often performs reasonably well
  - Cons: high storage requirements, slow inference time
  - Hyperparameter k controls overfitting (small k) vs underfitting (large k)

Naive Bayes classifier intuition
- Goal: compute the probability that a document belongs to each class and assign the class with highest probability
- Decision rule: assign label y that maximizes P(y | x)

Probabilistic formulation
- Prior P(y): probability of a class before observing any data
- Likelihood P(x | y): probability of observing the document given the class
- Marginal P(x): probability of observing the document under any class
- Posterior P(y | x): probability of the class given the document
- Bayes’ rule:
  - P(y | x) = P(x | y) P(y) / P(x)
- For classification, the marginal P(x) can be ignored since it is the same for all classes
- Features can be words or n-grams

Naive assumption
- Assumes all words in a document are conditionally independent given the class
- This assumption is not true in natural language but works well in practice

Parameter estimation with maximum likelihood
- Prior estimation:
  - P(y) = number of documents in class y / total number of documents
- Likelihood estimation (multinomial model):
  - P(w | y) = number of occurrences of word w in documents of class y / total number of words in documents of class y

Practical considerations for Naive Bayes
- Arithmetic underflow:
  - Multiply many small probabilities leads to numerical issues
  - Solution: compute log probabilities and sum instead of multiplying
- Out-of-vocabulary (OOV) words and unseen classes:
  - Unseen words during testing lead to zero probabilities
  - Classes with no training documents also lead to zero probabilities
- Smoothing:
  - Add-k (Laplace) smoothing:
    - P(w | y) = (count(w, y) + k) / (total words in y + k * |V|)
    - Common choice: k = 1

Worked example (high-level steps)
- Preprocess documents into tokens (e.g. unigrams)
- Build term-document matrix with term frequencies
- Compute class priors using document counts (with smoothing)
- Compute likelihoods using word counts per class (with smoothing)
- For a new document:
  - Compute log P(class) + sum of log P(word | class)
  - Assign the class with the higher score

Naive Bayes properties
- Pros:
  - Simple, fast to train, easy to interpret
  - Often performs very well for text classification
  - Linear decision boundaries for multinomial Naive Bayes
- Cons:
  - Bag-of-words representation ignores word order
  - Strong independence assumption between words

Number of parameters in binary Naive Bayes
- For n words in the vocabulary:
  - Parameters needed: 2n + 1
    - n likelihoods per class (2 classes)
    - 1 independent prior (the other is determined)

Linear models overview
- Assumption: there exists a linear relationship between input features and the target variable
- Prediction:
  - ŷ = θᵀx
- Learning means finding the parameter vector θ that best fits the data

Vector notation and bias trick
- Introduce a constant feature x₀ = 1
- Bias term becomes part of the parameter vector
- Simplifies notation and implementation

Logistic regression
- Used for binary classification
- Produces real-valued outputs interpreted as probabilities
- Uses the logistic (sigmoid) function:
  - σ(z) = 1 / (1 + e^(−z))
- Model:
  - P(y = 1 | x, θ) = σ(θᵀx)
  - P(y = 0 | x, θ) = 1 − σ(θᵀx)

Probabilistic interpretation
- Output is the estimated probability of the positive class
- Decision rule:
  - Predict class 1 if P(y = 1 | x, θ) ≥ 0.5, else class 0

Learning logistic regression parameters
- Two key questions:
  - How to measure how good a parameter set θ is
  - How to find the best θ values
- Answers:
  - Use a loss function (cost/error function), typically cross-entropy loss
  - Use an optimization method, typically gradient descent

Logistic regression loss function intuition
- A parameter vector θ is good if:
  - the true label y (0 or 1 from the dataset)
  - the model’s estimated probability ŷ
  match as closely as possible for many training examples
- Goal: minimize the difference between y and ŷ
- Equivalently: maximize the probability assigned to the correct label

Probabilistic view
- Logistic regression models P(y | x; θ)
- y follows a Bernoulli distribution with two outcomes {0, 1}
- Model prediction:
  - ŷ = P(y = 1 | x; θ) = σ(θᵀx)
  - P(y = 0 | x; θ) = 1 − ŷ

Likelihood of a single training example
- Combined likelihood for both y = 0 and y = 1 cases:
  - P(y | x; θ) = ŷ^y (1 − ŷ)^(1 − y)
- This single formula covers both class labels

From likelihood to loss
- Objective: maximize the likelihood over θ
- Equivalent objective: minimize the negative log-likelihood
- Loss for a single training example (cross-entropy loss):
  - L(y, ŷ) = −[ y log(ŷ) + (1 − y) log(1 − ŷ) ]

Cross-entropy loss properties
- Loss is:
  - Small when the predicted probability for the correct class is high
  - Large when the predicted probability for the correct class is low
- If a sample is classified correctly with high confidence:
  - Loss is small (not zero unless probability is exactly 1)

Total loss over the dataset
- For m training samples:
  - L(θ) = (1 / m) ∑ᵢ [ −yᵢ log(ŷᵢ) − (1 − yᵢ) log(1 − ŷᵢ) ]
- Training objective:
  - Find θ that minimizes L(θ)

Convexity and optimization
- For logistic regression, the cross-entropy loss is convex
- Convex loss implies:
  - Exactly one global minimum
  - No local minima to get stuck in

Minimizing the loss
- In theory:
  - Take partial derivatives of L with respect to each θᵢ
  - Set them to zero
  - Solve the resulting system of equations
- In practice:
  - No closed-form solution for θ exists

Gradient descent
- Numerical optimization method to minimize the loss
- Basic idea:
  - Start with a random (or zero) initialization of θ
  - Iteratively update θ to reduce the loss

Gradient refresher
- Gradient:
  - Vector of partial derivatives with respect to θ₀, θ₁, …, θₙ
- Interpretation:
  - Gradient points in the direction of steepest increase of the loss
  - To decrease the loss, move in the opposite direction
- Sign interpretation:
  - Positive gradient component: decreasing θᵢ decreases loss
  - Negative gradient component: increasing θᵢ decreases loss
- Magnitude:
  - Larger absolute value means the loss is more sensitive to that parameter

Gradient descent update rule
- Update equation:
  - θ := θ − η ∇L(θ)
- η (learning rate):
  - Controls step size of updates
  - Typical range: 0.01 to 0.0001
- Training stops when:
  - θ converges, or
  - maximum number of iterations is reached

Effect of learning rate
- Too large:
  - Overshoots minimum
  - May diverge
- Too small:
  - Very slow convergence
- Proper value:
  - Leads to stable and efficient convergence

Gradient descent variants
- Batch (basic) gradient descent:
  - Gradient computed using the full dataset
  - Smooth but slow for large datasets
- Stochastic gradient descent (SGD):
  - Gradient computed using one data point at a time
  - Noisy (choppy) updates but faster
- Mini-batch gradient descent:
  - Gradient computed using a small batch (e.g., 64 samples)
  - Trade-off between stability and speed
  - Often referred to as SGD in practice

Overfitting intuition
- Overfitting occurs when the model:
  - Fits training data too closely
  - Fails to generalize to unseen data
- Visual analogy (curve fitting):
  - Low-degree polynomial: underfitting
  - Medium-degree polynomial: good fit
  - High-degree polynomial: overfitting

Overfitting in logistic regression
- Scenario with few training examples and many features
- Model may assign very large weights to certain features
- Large θ values indicate:
  - Model relies too heavily on specific patterns
- Consequence:
  - Good training performance
  - Poor performance on unseen data

Regularization
- Observation:
  - Overly complex models often have large θ values
- Idea:
  - Penalize large parameter values
- Approach:
  - Add a regularization term to the loss function
- Regularization strength:
  - Controlled by parameter λ

L2 regularization (Ridge Regression)
- Penalty term:
  - λ ∑ᵢ θᵢ²
- Encourages:
  - Small, evenly distributed weights
- Effect:
  - Shrinks parameters but rarely sets them exactly to zero

L1 regularization (Lasso Regression)
- Penalty term:
  - λ ∑ᵢ |θᵢ|
- Encourages:
  - Sparsity in θ
- Effect:
  - Some weights become exactly zero (feature selection)

Regularization and optimization
- Adding regularization changes:
  - The loss function
  - The gradient
- Gradient descent algorithm itself remains unchanged
- Regularization generally:
  - Increases training loss
  - Improves generalization performance

Key takeaways
- Logistic regression uses cross-entropy loss derived from Bernoulli likelihood
- Loss minimization is a convex optimization problem
- Gradient descent is used due to lack of closed-form solution
- Overfitting arises from excessive model capacity and large θ values
- Regularization penalizes large weights and improves generalization

Multiclass logistic regression motivation
- Binary logistic regression handles only 2 classes
- Many real-world tasks require classification among more than 2 classes
- Multiclass logistic regression extends logistic regression to C classes
- Classes indexed as c = 1, …, C
- Each class has its own parameter vector θ_c
- Model outputs C scores and C probabilities (one per class)

From binary to multiclass
- Binary logistic regression:
  - Single weight vector θ
  - Single probability output P(y = 1 | x)
- Multiclass logistic regression:
  - Separate weight vectors θ_1, θ_2, …, θ_C
  - Produces C output scores
- Requirement:
  - Output probabilities must sum to 1

Softmax function
- Used to convert raw scores into valid probabilities
- Input:
  - Vector of real-valued scores (logits), one per class
- Output:
  - Probability distribution over classes
- Softmax definition:
  - P(y = c | x) = exp(z_c) / ∑_{k=1}^C exp(z_k)
  - where z_c = θ_cᵀ x
- Properties:
  - All probabilities are in (0, 1)
  - Sum of probabilities equals 1

Multiclass example (conceptual)
- Input features: d features
- Weight matrix:
  - One row (or column, depending on convention) per class
- Linear scores:
  - z = W x
- Softmax applied to z to obtain class probabilities
- Training requires a new gradient expression (details omitted in lecture)

Cross-entropy loss for multiclass logistic regression
- Binary cross-entropy loss:
  - L = −[ y log(ŷ) + (1 − y) log(1 − ŷ) ]
- Multiclass generalization:
  - Uses one-hot encoded labels
  - y_c = 1 for the correct class, 0 otherwise
- Multiclass cross-entropy loss:
  - L = − ∑_{c=1}^C y_c log(p_c)
  - where p_c is the softmax probability for class c
- Training objective:
  - Minimize average cross-entropy loss over all samples

Biological inspiration
- Artificial neuron inspired by biological neuron
- Inputs correspond to dendrites
- Weighted sum corresponds to cell body aggregation
- Activation corresponds to axon hillock firing
- Logistic regression can be seen as a crude artificial neuron

Logistic regression as a neural network
- Inputs x_0, x_1, …, x_d
- Weighted sum followed by sigmoid activation
- Output is a probability
- This forms a single-neuron neural network

Limitations of logistic regression
- Logistic regression is a linear model
- Can only model linear decision boundaries
- Cannot represent non-linear relationships between features
- Non-linearly separable problems cannot be solved

Motivation for neural networks
- Idea: stack multiple logistic regression units
- Outputs of some units become inputs to others
- Introduces non-linear representations
- Leads to neural networks

XOR problem
- XOR truth table:
  - Output is 1 if inputs differ, 0 otherwise
- XOR is not linearly separable
- Cannot be solved by a single logistic regression unit
- OR, AND, and NAND are linearly separable
- XOR can be constructed by combining OR, AND, NAND

Stacking units to solve XOR
- First layer computes OR and NAND
- Second layer combines them to compute XOR
- Demonstrates power of stacked linear units with non-linear activations
- This stacked structure is a feedforward neural network

Feedforward neural networks
- Network structure:
  - Input layer
  - One or more hidden layers
  - Output layer
- Feedforward:
  - No cycles or loops in the network
- Network capacity:
  - Depth: number of layers
  - Width: number of neurons per layer
- Too many neurons:
  - Increases risk of overfitting

Neural network notation
- Layers indexed by l
- Neurons indexed within each layer
- Weight matrices connect layer l−1 to layer l
- Each layer has its own weight matrix and bias vector

Neural network activations
- Layer-wise computation:
  - a^(0) = input x
  - z^(l) = W^(l) a^(l−1) + b^(l)
  - a^(l) = g(z^(l))
- Final output:
  - a^(L)
- Computation is vectorized using matrix operations
- Efficiently implemented on GPUs

Activation functions
- Hidden layer activation functions:
  - Must be non-linear
  - No need for probabilistic interpretation
  - Examples:
    - Sigmoid
    - Tanh
    - ReLU
    - Leaky ReLU
- ReLU:
  - Rectified Linear Unit
  - g(x) = max(0, x)

Output layer activation functions
- Choice depends on task:
  - Regression:
    - Linear activation
  - Binary classification:
    - Sigmoid
  - Multiclass classification:
    - Softmax
- Linear activation is unsuitable for hidden layers because:
  - Stacking linear layers remains linear
  - No increase in representational power

Neural networks in practice
- Implemented using frameworks such as PyTorch
- Training follows same core steps as logistic regression:
  - Define model
  - Define loss function
  - Optimize using gradient descent

From logistic regression to deep neural networks
- Fundamentally:
  - Neural networks are functions
  - Define a loss function
  - Minimize loss using gradient-based optimization
- Key differences:
  - Functions are much more complex
  - Gradients computed via backpropagation
  - Loss function is non-convex
  - Multiple local minima possible
  - Training is more challenging
  - Overfitting risk is higher
  - Regularization and other techniques are crucial

Lecture summary
- Naive Bayes:
  - Simple probabilistic classifier
  - Strong baseline for text classification
- Logistic regression:
  - Important discriminative probabilistic classifier
  - Linear decision boundaries
  - Core building block of neural networks
- Neural networks:
  - Built by stacking logistic regression–like units
  - Can model complex non-linear relationships
  - Non-convex optimization and overfitting are major challenges

High-Dimensional Data  

Key Concepts  
- High-dimensional data: Large number of features (dimensions) per data point.  
- Variables:  
  - m ("mass") — number of data points.  
  - V ("volume") — data space described by the dimensions.  

Effects of High Dimensions & Data Sparsity  
- Computational cost increases with the number of features.  
- Statistical significance becomes harder; higher risk of overfitting.  
  - "Good" data points become less distinguishable from noise/outliers.  
- Similarities between points are obscured.  
  - Points that are close in low dimensions may appear far apart in high dimensions.  
- High-dimensional datasets quickly become very sparse.  

Example: Document Vectors (677 Straits Times articles)  
- Sparsity = 98.64% (most entries are 0).  

Curse of Dimensionality  
- Phenomenon caused by increasing feature space dimensions.  
- Effects:  
  - Data points rarely appear close together.  
  - Average distance between points converges, reducing usefulness of distance-based methods.  

Intuition Example  
- N data points uniformly distributed in a unit cube with d dimensions.  
- Let L = length of the smallest cube containing k-nearest neighbors (k-NN).  
- Observation: For high d, the cube containing k-NN is almost the entire space.  

Distance Distribution  
- As dimensions increase, pairwise distances between points become similar, further reducing contrast in similarity metrics.  

Vector Space Models (VSM) — Dimensionality Reduction  
- Goal: Reduce number of dimensions while retaining meaningful information.  
- Strategies:  
  - Remove n-grams that are not useful.  
  - Keep only top-k most frequent n-grams (e.g., k=20,000).  
  - Remove n-grams with low document frequency.  

Example  
- Without filtering: ~280,000 n-grams.  
- Applying frequency-based filtering significantly reduces dimensionality and sparsity.  

Cluster Evaluation  

Problem 1: Visual Assessment is Hard  
- High-dimensional data (≥ 3 dimensions) is difficult/impossible to visualize.  
- Cannot easily assess cluster properties a-priori (shape, size, density).  
- Noise and outliers further complicate assessment.  

Problem 2: Algorithms Always Produce Clusters  
- Example: K-Means and AGNES will find clusters even in random data.  

Purpose of Cluster Evaluation  
- Compare results from different clustering algorithms.  
- Compare results of the same algorithm with different parameters.  
- Minimize impact of noise/outliers.  

Two Main Approaches  
1. External Quality Measures: Compare clustering against ground truth (if available).  
2. Internal Quality Measures: Evaluate clustering based only on data characteristics.  

External Quality Measures  

1. Cluster Purity  
- Measures how much each cluster contains a single class.  
- Formula: For cluster c, purity = (#points with most common label in c) / (total points in c).  
- Limitations: Purity can be artificially high if many clusters contain very few points.  

2. Information Retrieval Metrics  
- Based on True Positives (TP), True Negatives (TN), False Positives (FP), False Negatives (FN).  
- TP: Points in same cluster, same label.  
- TN: Points in different clusters, different labels.  
- FP: Points in same cluster, different labels.  
- FN: Points in different clusters, same label.  
- Metrics derived from these:  
  - Rand Index (RI)  
  - Precision, Recall, F1-Score  

Internal Quality Measures  

1. Sum of Squared Errors (SSE)  
- Measures intra-cluster variance.  
- Used to select number of clusters via "elbow" method.  
- Limitations:  
  - Favors globular clusters.  
  - SSE decreases as number of clusters increases.  
  - Interpretation less intuitive for non-globular clusters.  

2. Silhouette Coefficient (SC)  
- Measures cluster cohesion and separation.  
- For each data point:  
  - Cohesion = average distance to points in same cluster.  
  - Separation = minimum average distance to points in other clusters.  
- Silhouette Coefficient formula:  
  - SC = (Separation - Cohesion) / max(Separation, Cohesion)  
- Interpretation:  
  - SC close to 1 → good clustering (well-separated, cohesive).  
  - SC close to 0 → overlapping clusters.  
  - SC negative → misclassified points.  

Examples & Observations  
- K-Means on random or high-dimensional sparse data (e.g., document vectors) often shows poor internal measure signals.  
- Elbow curve and silhouette scores may not reveal clear cluster structure in text data.  
- For text clustering, internal measures can be less informative due to high dimensionality and sparsity.
Week 6
Text Preprocessing Recap

Text as string represents natural language as written.  
Raw source text needs to be transformed into a "proper" input for text mining methods.  
Text can be represented as sequences of characters or as collections of tokens:  
- set (unique tokens)  
- multiset/bag (tokens with frequency counts)  
- sequence (tokens in order)  
- subwords (parts of words, useful for unknown words or morphology)  
- words (most common tokenization unit)  
- phrases (multi-word expressions capturing more meaning)

Text cleaning is essential to remove noise such as:  
- HTML tags  
- Unicode characters  
- URLs  
- Extra whitespace or line breaks  
Purpose of preprocessing:  
- Reduce redundancy in text  
- Reduce variability to create bounded representations  
- Make text easier for text mining algorithms to identify patterns  

Tokens carry more semantic meaning than individual characters, improving downstream NLP performance.

From Strings to Words and Tokens  

Words belong to grammatical categories (nouns, verbs, adjectives, etc.)  
Flat collections of words ignore sentence or phrase structure  
Goals of preprocessing beyond tokenization:  
- Identify grammatical categories (POS tags)  
- Represent sentence structure (constituency or dependency)  
- Extract dependencies between words for relation analysis

Part-of-Speech (POS) Tagging

Definition: POS tagging assigns a syntactic category to each word in a text.  
Common POS tags in English include: Noun, Verb, Adjective, Adverb, Pronoun, Determiner, Preposition, Conjunction, Interjection.  

Example:  
"Bob walked slowly because of his swollen ankle."  
POS tagging: NNP VBD RB IN IN PRP$ JJ NN .  

Penn Treebank Tag Set (main POS tags):  
- CC: Coordinating conjunction (and, or)  
- CD: Cardinal number (1, 2, three)  
- DT: Determiner (the, a, an)  
- EX: Existential there  
- FW: Foreign word  
- IN: Preposition / subordinating conjunction (in, into, whether, if)  
- JJ: Adjective (base)  
- JJR: Adjective (comparative)  
- JJS: Adjective (superlative)  
- LS: List item marker  
- MD: Modal (can, could, may)  
- NN, NNS: Noun (singular/plural)  
- NNP, NNPS: Proper noun (singular/plural)  
- PDT: Predeterminer (all, both, half)  
- POS: Possessive ending ('s)  
- PRP, PP$: Personal/possessive pronouns (he, she, her, ours)  
- RB, RBR, RBS: Adverbs (base, comparative, superlative)  
- RP: Particle (across, up)  
- SYM: Symbol (=, +, &)  
- TO: "to"  
- UH: Interjection (oops, shucks)  
- VB, VBD, VBG, VBN, VBP, VBZ: Verb forms (base, past, gerund, past participle, non-3rd person, 3rd person singular)  
- WDT, WP, WP$, WRB: wh-determiners, wh-pronouns, wh-adverbs  

Extended tag set includes punctuation and special symbols: #, $, ., :, ,, (, ), ", `, ``

POS Categories:  
- Closed Class Words: small, fixed membership, function words that structure sentences (prepositions, pronouns, determiners, conjunctions).  
- Open Class Words: large, growing set including nouns, verbs, adjectives, adverbs. Continuously evolving with language.

Importance of POS Tagging:  
- Lemmatization: select correct lemma based on POS  
- Word sense disambiguation: distinguish meanings depending on context  
- Named entity recognition: identify entities, often proper nouns  
- Information extraction: verbs indicate relations between entities  
- Parsing: POS tags guide syntactic parsing  
- Speech synthesis/recognition: correct stress placement depends on POS  
- Authorship attribution: relative frequencies of word classes  
- Machine translation: reorder words according to POS for grammatical output  

Challenges in POS Tagging:  
- Ambiguity: words with multiple possible POS, sometimes requiring context  
- Examples:  
  - "Flying planes can be dangerous" (verb or adjective?)  
  - "Fruit flies like a banana" (verb or noun? preposition?)  
  - "light" (noun, verb, adjective)  
- ~85% of word types are unambiguous  
- ~15% are ambiguous but common → 55-65% of tokens are ambiguous  

POS Tagging Algorithms

Baseline Algorithm:  
- Assign most frequent POS tag for each word  
- Unknown words labeled as nouns  
- Accuracy: ~92% (SOTA: 97-98%)  
- Limitations:  
  - Imbalanced errors (common words dominate)  
  - Errors propagate to downstream tasks  

Unsupervised Methods:  
- Use anchor words with unambiguous POS  
- Cluster words by distributional patterns  
- Assign POS tags to clusters  
- Advantages: no annotated corpus needed  
- Limitations: lower accuracy  

Supervised Methods:  
- Require annotated corpora  
- Popular models:  
  - Hidden Markov Models (HMM)  
  - Conditional Random Fields (CRF)  
  - Neural sequence models (RNNs, Transformers)  
  - Large language models (e.g., BERT)  
- Accuracy can match human-level performance in high-resource languages  
- Limitations: low-resource languages, domain-specific vocabulary  

Constituency Parsing

Goal: understand how words form phrases and sentences.  
Definition: Constituent = group of words behaving as a single unit  
- Sentences are hierarchical structures of constituents  

Constituency Tests:  
- Topicalization: move constituent to different position  
- Proform substitution: replace constituent with proform (it, that, them)  
- Fragment answers: constituent can answer a question directly  

Context-Free Grammar (CFG):  
- Captures phrase structure and ordering  
- Components:  
  - Non-terminal symbols: phrases, POS categories, can be replaced  
  - Terminal symbols: words, cannot be replaced further  
  - Start symbol: root of parse tree  
- Derivation: sequence of rules applied to generate sentence  
- Parse tree visualizes derivation  

Structural Ambiguity: multiple valid parses for the same sentence  
- Attachment Ambiguity: e.g., "through Singapore" attaches to noun or verb
  - A particular constituent can be attached to the parse tree at more than one place
- Coordination Ambiguity: e.g., "best meals and entertainment" → "best" applies to both or only one
  - Phrases can be conjoined by conjunction like “and”, “or”, “but”, “because”, “if”, etc.
  - Different types of conjunctions

Constituency Parsing

- Syntactic Parsing
  - Extract all possible parses for a sentence (possible = valid with respect to some grammar)
  - Typically requires a grammar transformation map (“binarization” of grammar to ensure efficient parsing)
- Syntactic Disambiguation
  - Score all parses and return the best parse (for some tasks, all possible parses might be of interest)
  - Scores commonly expressed as probability (requires grammar annotated with probabilities -> learned from a annotated dataset)

Probabilistic CFG (PCFG):  
- Assign probabilities to grammar rules based on corpus frequencies  
- Probability of a parse tree = product of probabilities of rules  
- Use log probabilities to avoid arithmetic underflow  

Applications of Constituency Parsing:  
- Grammar checking  
- Keyphrase extraction  
- Semantic analysis  
- Question answering  
- Text simplification
- Remove sensitive information in a “smooth” way (Remove at constituency level to preserve grammatical correctness of sentence)

Constituency Parsing
- Divides sentence subphrases (i.e., constituents) that belong to a category in the grammar
- Grammar type: Context-Free Grammar (+ annotated data to get most likely parse tree)

Dependency Parsing
- Expresses sentences in terms of dependencies between the tokens
- Grammar type: Dependency Grammar (parsing generally also requires supervised ML methods)

Focuses on relationships between words rather than phrase categories.  
Dependency Parsing Tasks:  
- Identify pairs of related words  
- Assign type/label to each dependency  

Dependency Relationship Characteristics:  
- Directed: head → dependent  
- Head determines syntactic and semantic properties of the construction  
- Dependent specifies additional information, may be optional  
- Linear order and agreement guided by head
- Dependent on linguistic experts

Dependency Types:  
- Head-complement: dependent required  
- Head-modifier: dependent optional  
- Head-specifier: determiner-noun  
- Coordination: parser resolves head in conjoined phrases  

Applications of Dependency Parsing:  
- Rule-based text simplification: remove or split appositions and relative clauses  
  - Example: "Musk, the CEO of Tesla, bought Twitter" → "Musk bought Twitter"  
- Information Extraction: convert unstructured text to structured triples (subject, predicate, object)  
  - Use dependency labels: nsubj, dobj, etc.  
  - Handle active/passive voice, negation, and uncertain statements
  - Dependency-based triple extraction
    - Utilize dependencies between words to identify meaningful subject-predicate-object relationships
    - Challenge: Not obvious what triples to extract
      - How to handle negation?
        - Extract no triple?
        - Extract triple capturing negation?
      - How to handle uncertainty?
        - Extract no triple?
        - Extract multiple triples capturing relationship between statements?
- Knowledge graph construction: relationships between entities  

Summary

Words are not only labels but serve different functions; understanding POS and sentence structure is key.  
Text mining building blocks:  
- POS tagging → word category and disambiguation  
- Constituency parsing → hierarchical phrase structures  
- Dependency parsing → syntactic and semantic relations  

Applications:  
- Keyphrase extraction  
- Question answering  
- Word sense disambiguation  
- Text simplification and summarization  
- Information extraction and knowledge graph construction
Week 7
Feedforward Neural Network (MLP)
- Structure:
  - Input layer → hidden layers → output layer
  - Fully connected layers with nonlinear activations
- Key idea:
  - Learn a mapping from input features to output labels

MLPs for Text Mining
- Common input representation:
  - Document vector (fixed-size numerical representation)
  - Types:
    - Multi-hot vector (binary presence of words)
    - Count vector (bag-of-words frequency)
    - TF-IDF vector (weighted importance of words)
- Typical applications:
  - Text classification:
    - Document categorization (politics, sports, finance, etc.)
    - Sentiment analysis (positive/negative classification)

Limitations of MLPs for Text
- Assumption:
  - Presence of words alone is sufficient to determine meaning/class
- Problem:
  - Ignores word order (treats text as unordered set of words)
- Consequence:
  - Cannot distinguish sentences with same words but different structure

Importance of Word Order
- Critical for tasks such as:
  - Keyphrase extraction
  - Named entity recognition
  - Machine translation
  - Summarization
- Also affects simple tasks like sentiment analysis
  - Example:
    - "I don't hate the movie, I like it."
    - "I don't like the movie, I hate it."
  - Same words, different order → opposite meanings

Motivation for Word Representation
- Need better representations than simple bag-of-words
- Requirements:
  - Fixed-size representation
  - Numerical format (for model input)
- Leads to:
  - Word vectors (dense representations capturing meaning)

Traditional NLP Representation: One-Hot Encoding
- Words treated as discrete symbols
- Vocabulary size = V (number of unique words)
- Each word represented as a vector of length V
  - Value = 1 at index of the word
  - Value = 0 elsewhere

Example:
- Vocabulary:
  - V = {dog, cat, lion, bear, cobra, cow, frog, ...}
- One-hot vector for "cat":
  - [0, 1, 0, 0, 0, 0, 0, ...]

Properties of One-Hot Encoding
- Sparse vectors (mostly zeros)
- No notion of similarity between words
  - "cat" and "dog" are equally distant as "cat" and "cobra"

Document Representation in Vector Space Model (VSM)
- Construct document vectors by aggregating word vectors
- Methods:
  - Sum of word vectors
  - Weighted sum (e.g., TF-IDF)

Key Takeaways
- MLPs require fixed-size numerical inputs
- Bag-of-words representations ignore word order
- Word order is crucial for meaning in many NLP tasks
- One-hot encoding is simple but limited
- Need richer word representations (word vectors) to capture semantics

Symbolic Representation of Words — Limitation
- Words represented as discrete symbols (e.g., one-hot encoding)
- Example:
  - "cat" and "kitty" have similar meaning
  - But their vectors are completely different and orthogonal
- Problem:
  - No notion of similarity between words
  - Words are treated as independent labels
  - Even synonyms (cat ≈ kitty, fast ≈ quick) are unrelated in vector space
- Consequence:
  - Models cannot generalize across similar words
  - Limits performance in NLP tasks

Goal of Better Word Representations
- Desired property:
  - Similar meaning → similar vectors
- Shift:
  - From symbolic representation → semantic representation
- Benefit:
  - Improves most NLP and text mining tasks

Distributional Hypothesis
- Core idea:
  - Words that appear in similar contexts have similar meanings
- Key statements:
  - "The meaning of a word is its use in the language"
  - "You shall know a word by the company it keeps"
- Implication:
  - Meaning can be learned from surrounding words (context)

Example (Understanding Unknown Words)
- Word: "Stollen"
- From context:
  - Appears in sentences about buying, eating, recipes
- Inference:
  - Likely a food item
- Insight:
  - Meaning derived from usage, not explicit definition

Word Vectors from Document-Term Matrix (DTM)
- Approach:
  - Represent each word using its distribution across documents
- Example:
  - Vector for "cat" = (0.22, 0.29, 0, 0, 0.22)
- Assumption:
  - Context = set of documents containing the word
- Problem:
  - Too coarse-grained
  - Does not align well with distributional hypothesis
- Conclusion:
  - Not commonly used in practice

Text Preprocessing Steps
- Normalize text before vectorization:
  - Remove non-words
  - Remove stopwords
  - Convert to lowercase (case-folding)
  - Apply lemmatization

Alternative Sparse Representation: Co-occurrence Vectors
- Idea:
  - Context of a word = nearby words (window-based)
- Build:
  - Term-context matrix
  - Count how often words co-occur
- Limitation:
  - High dimensionality (|V| × |V|)
  - Sparse vectors (mostly zeros)

Sparse vs Dense Word Vectors

Sparse Vectors
- Characteristics:
  - High-dimensional
  - Mostly zeros
- Issues:
  - Poor at capturing similarity
  - Large number of parameters
  - Risk of overfitting

Dense Vectors (Word Embeddings)
- Characteristics:
  - Low-dimensional (typically 100–1000)
  - Mostly non-zero values
- Advantages:
  - Better generalization
  - Capture semantic similarity
  - More efficient for learning: less weights to tune, lower risk of overfitting

Intuition Behind Dense Word Vectors
- Words represented using latent features (dimensions)
- Example dimensions:
  - "furry", "dangerous"
- Example encoding:
  - dog ≈ (0.90, 0.15)
  - cat ≈ (0.85, 0.10)
  - lion ≈ (0.80, 0.95)
- Insight:
  - Similar words have similar vectors
  - Relationships captured geometrically

Challenges with Manual Feature Design
- Questions:
  - What dimensions should we use?
  - How to assign values?
- Problem:
  - Manual design is infeasible and subjective
- Conclusion:
  - Need automated methods to learn embeddings

Similarity Between Word Vectors
- Goal:
  - Quantify how similar two words are
- Example:
  - sim(lion, bear) > sim(lion, cow)
- Common metric:
  - Cosine similarity
- Why cosine similarity:
  - Measures angle between vectors (direction)
  - Ignores magnitude differences
  - Works well for semantic similarity

Key Takeaways
- One-hot and symbolic representations fail to capture meaning
- Distributional hypothesis provides foundation for learning meaning
- Sparse representations are limited and inefficient
- Dense embeddings capture semantic relationships
- Automated learning (e.g., Word2Vec) is necessary for practical use

Basic Approaches to Learning Word Embeddings
- Traditional methods (not covered in detail):
  - Singular Value Decomposition (SVD):
    - Matrix factorization of co-occurrence matrices
  - Brown Clustering:
    - Hierarchical clustering of words based on context
- Neural network-based methods:
  - Learn embeddings through prediction tasks
  - Typically efficient and scalable
  - Focus: Word2Vec

Word2Vec Overview
- Family of models for learning word embeddings
- Two main architectures:
  - Continuous Bag of Words (CBOW)
  - Skip-gram
- Core idea:
  - Learn word representations by predicting words from context or vice versa

CBOW vs Skip-gram
- CBOW (Continuous Bag of Words):
  - Input: surrounding context words
  - Output: predict the center (target) word
- Skip-gram:
  - Input: center word
  - Output: predict surrounding context words
    - Vectors of words with similar contexts will be close 
- Context:
  - Defined using a window of size m around the target word

Word2Vec Model Setup
- Two embedding matrices:
  - Input embedding matrix W_in
  - Output embedding matrix W_out
- Each word w has:
  - Input embedding v_w (from W_in)
  - Output embedding v'_w (from W_out)
- Important:
  - Each word has two representations during training

Prediction Mechanism
- Input:
  - One-hot vector for input word
- Operation:
  - Multiply one-hot vector with embedding matrix
  - Equivalent to selecting the corresponding row (lookup)
- Output:
  - Score for each word in vocabulary
  - Convert scores to probabilities using softmax

Softmax Function
- Converts scores into probability distribution:
  - P(w_o | w_i) = exp(score(w_o)) / sum over all words exp(score(w))

CBOW Architecture
- Input:
  - Multiple context words (within window)
- Process:
  - Retrieve embeddings for each context word
  - Combine using:
    - Sum or average
- Output:
  - Predict center word

Skip-gram Architecture
- Input:
  - Single center word
- Output:
  - Predict each context word within window
- Process:
  - Use center word embedding to predict surrounding words

Training Objective (Loss Function)
- CBOW:
  - Maximize probability of center word given context words
- Skip-gram:
  - Maximize probability of context words given center word
- Assumption:
  - Conditional independence of context words (Bag-of-Words assumption)
- Optimization:
  - Use log-likelihood (log probabilities)
  - Apply gradient descent to minimize loss

Training Intuition
- Goal:
  - Words appearing in similar contexts should have similar embeddings
- Mechanism:
  - Increase dot product between related word vectors
  - Higher dot product → higher similarity → higher predicted probability
- Result:
  - Words with similar contexts cluster together in vector space

Learning Process
- Parameters to learn:
  - W_in (input embeddings)
  - W_out (output embeddings)
- Optimization:
  - Gradient descent or similar methods
- Outcome:
  - Embeddings that capture semantic relationships

Final Word Embeddings
- After training, options include:
  - Use input embeddings (W_in)
  - Use output embeddings (W_out)
  - Use average of both
- Common practice:
  - Often W_in or averaged embeddings are used

Key Takeaways
- Word2Vec learns embeddings through prediction tasks
- CBOW predicts word from context; Skip-gram predicts context from word
- Embeddings are learned via optimization of prediction accuracy
- Similar words end up with similar vector representations
- Learned embeddings capture semantic meaning and relationships

Word2Vec — Real-World Example
- Dataset:
  - ~50k movie reviews (IMDB)
- Preprocessing:
  - Lowercasing
  - Stopword removal
  - Lemmatization
  - Keep top 20k most frequent words
- Data preparation:
  - Treat entire dataset as one continuous sequence
  - Context windows can cross sentence boundaries

Training Sample Construction (window size m = 2)
- Example sentence:
  - "watching funny movie on netflix"

- CBOW:
  - Input (context): {watch, funny, on, netflix}
  - Output (target): movie
  - 1 training sample per center word

- Skip-gram:
  - Input (center): movie
  - Output (context words): watch, funny, on, netflix
  - 2m = 4 training samples per center word

Visualization of Learned Embeddings
- Use T-SNE:
  - Reduce high-dimensional vectors (e.g., 300D) → 2D
  - Allows visualization of word clusters
- Observations:
  - Similar words tend to cluster
- Potential issues:
  - T-SNE may distort distances
  - Small dataset → weak semantic structure
  - Cross-sentence contexts may introduce noise

Word2Vec — Practical Considerations

Preprocessing Choices:
- Tokenization method
- Case-folding (lowercase or not)
- Stemming vs lemmatization
- Stopword removal (include or exclude)
- Whether to allow cross-sentence contexts

Key Hyperparameters:
- Window size (m):
  - Larger window → broader context
  - Smaller window → more local relationships
- Negative sampling:
  - Improves efficiency (especially for Skip-gram)
  - Typically uses multiple negative examples per positive pair

Limitations of Word2Vec

1. No Phrase Representation
- Cannot handle multi-word expressions:
  - "New York", "ice cream", "hot dog"
- Treats each word independently

2. Polysemy Problem
- Same word → single embedding
  - Example:
    - "bank" (river vs financial institution)
- Cannot distinguish meanings based on context

3. Part-of-Speech Ambiguity
- Same word used as noun/verb/adjective shares one vector

4. Limited Semantic Understanding
- Based only on co-occurrence
- Words with opposite meanings may appear similar:
  - e.g., "good" and "bad" (both used in similar contexts)

5. Dataset Dependency
- Learned embeddings depend heavily on training data
  - Different corpora → different embeddings

Word2Vec in Practice

Architecture:
- Skip-gram:
  - Better for rare words
  - Slower
- CBOW:
  - Faster
  - Works well for frequent words

Training Techniques:
- Hierarchical softmax:
  - Better for infrequent words
- Negative sampling:
  - Efficient for frequent words
  - Works well with low-dimensional embeddings

Optimization Tricks:
- Sub-sampling frequent words:
  - Removes very common words (e.g., "the")
  - Improves speed and quality

Hyperparameter Guidelines:
- Embedding dimension:
  - Typically 100–1000
- Window size:
  - Skip-gram: ~10
  - CBOW: ~5

Feedforward Neural Network (Recap)
- Structure:
  - Input → hidden layer(s) → output
- Each layer summarized as a transformation
- No memory of previous inputs

Recurrent Neural Network (RNN) — Core Idea
- Designed for sequential data
- Introduces hidden state:
  - Stores information from previous time steps
- Input becomes a sequence of vectors (e.g., word embeddings)

Basic RNN Computation
- At time step t:
  - Input: x_t
  - Previous hidden state: h_{t-1}
  - Current hidden state: h_t = f(x_t, h_{t-1})
- Hidden state acts as memory

Unrolled Representation
- RNN can be visualized as repeating the same network over time steps
- Each step passes information forward via hidden state

RNN vs Feedforward NN
- Feedforward:
  - Processes inputs independently
- RNN:
  - Maintains temporal dependencies via hidden state

RNN Applications (Sequence Modeling)

1. Many-to-One:
- Input: sequence → Output: single label
- Example:
  - Sentiment analysis

2. One-to-Many:
- Input: single input → Output: sequence
- Example:
  - Image captioning

3. Many-to-Many (aligned):
- Input: sequence → Output: sequence (same length)
- Example:
  - POS tagging, NER

4. Many-to-Many (encoder-decoder):
- Input: sequence → Output: sequence (different length)
- Example:
  - Machine translation, summarization

RNN Training
- Step 1:
  - Compute loss at each relevant time step
- Step 2:
  - Aggregate losses across time steps
- Step 3:
  - Backpropagate through entire sequence
  - Method: Backpropagation Through Time (BPTT)

Limitations of Vanilla RNN
- Struggles with long-range dependencies
  - Difficulty remembering distant information

Improved RNN Variants

1. LSTM (Long Short-Term Memory)
- Introduces gating mechanisms
- Better at capturing long-term dependencies

2. GRU (Gated Recurrent Unit)
- Simpler than LSTM
- Similar performance in many cases

Practical Implementation (PyTorch)
- Cell-level:
  - nn.RNNCell
  - nn.LSTMCell
  - nn.GRUCell
- Layer-level (handles sequences internally):
  - nn.RNN
  - nn.LSTM
  - nn.GRU

RNN Applications in NLP

1. Text Classification
- Input: text sequence
- Output: category label

2. Language Modeling
- Predict next word given previous words

3. Sequence Labeling
- Assign label to each word
  - Example: Named Entity Recognition

4. Machine Translation
- Encoder-Decoder architecture:
  - Encoder: compress input sequence into vector
  - Decoder: vector initialized by encoder is used to generate output sequence

RNN-based Word Embeddings: ELMo
- Contextual embeddings (unlike Word2Vec)
- Key features:
  - Uses LSTM (not vanilla RNN)
  - Bidirectional (Bi-LSTM):
    - Processes sequence forward and backward
  - Multi-layer architecture

- Insight:
  - Word representation depends on context
  - Same word can have different embeddings in different sentences

Key Takeaways
- Word2Vec learns static embeddings (one vector per word)
- RNNs introduce sequence awareness via hidden state
- LSTM/GRU address long-term dependency issues
- Contextual embeddings (e.g., ELMo) overcome Word2Vec limitations

RNN-based Word Embeddings: ELMo (Embeddings from Language Models)
- Key idea:
  - Word meaning depends on context → embeddings should be contextual
- Architecture:
  - Based on LSTM (not vanilla RNN)
  - Uses Bi-LSTM (bidirectional):
    - Forward pass (left → right)
    - Backward pass (right → left)
  - Multiple stacked layers (e.g., 2 Bi-LSTM layers)

- Embedding construction:
  - Start with:
    - Uncontextualized embedding (basic word representation)
  - Combine with:
    - Outputs from all LSTM layers
  - Final embedding:
    - Weighted sum of all layer representations
    - Includes:
      - Learnable weights (importance of each layer)
      - Scaling factor
    - Task-dependent:
      - Different tasks → different optimal combinations

- Key advantage:
  - Same word gets different embeddings depending on context
  - Solves polysemy problem (e.g., "bank")

RNN — Problems with Long Sequences

1. Training Issues
- Vanishing gradients:
  - Gradients become very small → slow/no learning
- Exploding gradients:
  - Gradients become very large → unstable training

2. Information Bottleneck
- Hidden state must store all past information
- Over time:
  - Earlier information gets diluted or lost

3. Performance Limitations
- Sequential processing:
  - Cannot parallelize across time steps
- Slower training:
  - Less efficient on GPUs

- Motivation for improvements:
  - Attention mechanisms
  - Transformer models

Attention — Motivation
- Problem:
  - Encoder compresses entire input sequence into a single vector
  - This creates an information bottleneck
- Insight:
  - Not all parts of input are equally important at each step
- Solution:
  - Allow model to focus on relevant parts dynamically

Attention — Core Idea
- Decoder does not rely only on final encoder state
- Instead:
  - Access all encoder hidden states directly
  - Assign importance (weights) to each part of input
- Analogy:
  - Selectively focusing on relevant information

Attention Mechanism — Step-by-Step

Given:
- Encoder hidden states: h1, h2, ..., hN
- Current decoder hidden state: s_t

Step 1: Attention Scores
- Measure alignment between s_t and each h_i
- Example:
  - score_i = s_t · h_i (dot product)

Step 2: Attention Weights
- Apply softmax to scores:
  - Convert into probability distribution
- Interpretation:
  - Importance of each input position

Step 3: Context Vector
- Compute weighted sum:
  - c_t = sum(attention_weight_i × h_i)
- Result:
  - Focused summary of relevant input parts

Step 4: Final Prediction
- Combine:
  - Context vector c_t
  - Decoder hidden state s_t
- Use as input to generate next output word

Attention — Key Benefits
- Removes single-vector bottleneck
- Allows dynamic focus on input
- Improves performance on long sequences
- More interpretable (via attention weights)

Attention — Summary Formula (Conceptual)
- score(s_t, h_i)
- α_i = softmax(score_i)
- c_t = Σ (α_i × h_i)

Summary of Neural Text Processing

Core Requirements:
- Represent words numerically:
  - Dense embeddings (Word2Vec, ELMo)
- Handle sequences:
  - RNNs, LSTMs, GRUs, Transformers

RNNs
- Strength:
  - Capture sequential dependencies
- Weaknesses:
  - Slow (no parallelization)
  - Struggle with long sequences
  - Information bottleneck

Improvements
- LSTM / GRU:
  - Better handling of long-term dependencies
- Attention:
  - Direct access to all input states
  - Reduces bottleneck

Key Evolution
- Static embeddings:
  - Word2Vec (same vector for each word)
- Contextual embeddings:
  - ELMo (depends on sentence context)

Quick Quiz Insights
- DTM-based embeddings:
  - Valid but not very meaningful semantically
- Dense embeddings:
  - Less interpretable (dimensions lack explicit meaning)
- Similarity metrics:
  - Choice depends on representation (cosine vs Euclidean)
- Limitation of distributional hypothesis:
  - Cannot fully capture meaning
  - Example:
    - Opposite sentiment words may appear similar
Week 8
Sentiment & Sentiment Analysis

Basic Definitions
- Sentiment:
  - A general feeling, attitude, opinion, or judgment about something
- Sentiment Analysis:
  - Automatic detection of sentiment from text
  - Also called:
    - Opinion mining
    - Sentiment mining
    - Subjectivity analysis
    - Opinion extraction

Core Components of Sentiment
- Holder:
  - The person or entity expressing the sentiment
- Target:
  - The entity the sentiment is directed at
  - Can be:
    - General concept (e.g., movie)
    - Specific aspect (e.g., battery life)
- Valence (Sentiment Type/Polarity):
  - Measurement of sentiment strength or category
  - Common forms:
    - Polarity: positive / neutral / negative
    - Emotion labels: love, hate, disgust, desire, etc.
    - Rating scales:
      - 1–10 scores (e.g., IMDb ratings)
      - 1–5 stars

Sentiment Analysis Granularity

Document-Level
- Sentiment of entire document
- Examples:
  - Movie review
  - Social media post

Sentence-Level
- Sentiment of individual sentences
- Useful for fine-grained analysis

Aspect-Level
- Sentiment about specific attributes/aspects
- Example:
  - Phone review:
    - screen: positive
    - battery: negative
    - camera: positive

Applications of Sentiment Analysis
- Brand monitoring:
  - Track opinions about products, companies, services
- Social analysis:
  - Measure public mood or societal concerns
- Policy evaluation:
  - Analyze reactions to laws or government actions
- Detect controversial topics:
  - Identify sensitive discussions in society
- Conversational agents:
  - Improve chatbot empathy and responses
- General insight extraction from large text corpora

Why Sentiment Analysis Seems Easy
- Basic idea:
  - Count positive vs negative words
  - Example:
    - More positive adjectives → positive sentiment
- Works well in simple datasets:
  - e.g., movie reviews with clear ratings

Why Sentiment Analysis is Difficult

1. Linguistic Complexity
- Negation:
  - "not good" ≠ "good"
- Intensifiers:
  - "very good", "extremely bad"
- Downtoners:
  - "slightly good", "barely acceptable"

2. Figurative Language
- Sarcasm:
  - “Great job” (can be negative)
- Humor and exaggeration

3. Modality
- Uncertainty:
  - may, might, could
- Changes certainty and polarity strength

4. Context Dependency
- Same phrase can change meaning based on context
- Words are not inherently positive or negative

5. Mixed Sentiment (Multipolarity)
- One text may contain both positive and negative opinions

6. Variation in Text Type
Tweets
- Short, informal
- Emojis and slang common

Reviews
- Longer texts
- Multiple aspects discussed
- Sentiment mixed with description

Chats / Discussions / Forums
- Multiple speakers and targets
- Complex references and comparisons
- Often hardest to analyze

Nature of Sentiment
- Highly human-centered:
  - Based on emotion, culture, and subjective interpretation
- Related fields:
  - Emotion detection
  - Opinion mining
  - Affect analysis
  - Subjectivity detection

Lexicon-Based Sentiment Analysis

Core Idea
- Use predefined sentiment word lists (lexicons)
- Assumption:
  - Words carry inherent sentiment polarity
  - Sentiment of text = aggregation of word sentiments

Example Feature-Based Representation
- Features extracted from text:
  - Number of positive words
  - Number of negative words
  - Presence of negation words (e.g., "no")
  - Pronoun usage (1st/2nd person)
  - Exclamation marks
  - Text length (log-scaled)

Example:
- Positive words: 3
- Negative words: 2
- Contains "no": yes
- First/second person pronouns: 3
- Exclamation mark: no
- Log word count: ln(66)

Common Sentiment Lexicons

Bing Liu Opinion Lexicon
- ~4,783 negative words
- ~2,006 positive words
- Simple positive/negative word lists

MPQA Subjectivity Lexicon
- ~8,220 entries
- Includes:
  - Polarity (positive/negative)
  - Strength (strong/weak)
  - POS-aware sentiment

SentiWordNet
- ~117,660 entries
- Based on WordNet structure
- Assigns:
  - Positive score
  - Negative score
  - Real-valued sentiment strength

General Inquirer
- ~11,788 words
- Over 180 categories
- Covers:
  - Semantic, syntactic, pragmatic features
- Includes rich positive/negative tags

LIWC (Linguistic Inquiry and Word Count)
- ~4,487 words/stems
- 64 psychological and linguistic categories
- Includes:
  - Emotional processes
  - Cognitive processes
  - Social categories
  - Personal concerns

Lexicon Limitations
- Different lexicons may disagree
- Coverage varies widely
- Context is ignored
- Word meaning can change depending on usage
- Difficult to compare across systems

Key Takeaways
- Sentiment = subjective opinion expressed in text
- Sentiment analysis extracts and classifies these opinions
- Multiple levels: document, sentence, aspect
- Lexicon-based methods are simple but limited
- Real-world sentiment is complex due to language, context, and human expression

Lexicon-Based Sentiment Analysis — Building Sentiment Lexicons

Overview of Construction Approaches
- Goal:
  - Build lists/dictionaries of words with sentiment orientation (positive/negative)
- Main data sources:
  - Human expertise
  - Corpora (text data)
  - Existing lexicons

Approaches to Building Sentiment Lexicons

1. Manual Creation
- Built by experts (e.g., linguists)
- Characteristics:
  - High quality
  - Expensive and slow
  - Limited scalability

2. Crowdsourcing
- Uses non-expert human annotators (e.g., Mechanical Turk)
- Idea:
  - Aggregate many small judgments into a lexicon
- Pros:
  - Faster than manual expert labeling
- Cons:
  - Quality variability

3. Frequency-Based Methods (Corpus-Based)
- Assumption:
  - Positive words co-occur with positive words
  - Negative words co-occur with negative words
- Method:
  - Use word frequency patterns in large corpora
- Example:
  - Words appearing in positive reviews → likely positive

4. Graph-Based Methods
- Represent words as nodes in a graph
- Edges:
  - Semantic relationships (synonyms, antonyms)
- Process:
  - Expand from seed words using graph structure
- Goal:
  - Propagate sentiment through word relationships

5. Translation-Based Methods
- Idea:
  - Transfer sentiment lexicons across languages
- Process:
  - Use existing lexicon (e.g., English)
  - Translate into target language (e.g., German)
- Issue:
  - Word meaning may shift across languages

6. Relationship-Based Methods
- Use linguistic relationships:
  - Synonyms → same sentiment
  - Antonyms → opposite sentiment
- Expand sentiment coverage using WordNet-like structures

7. Merge-Based Methods
- Combine multiple existing lexicons
- Challenge:
  - Different formats, scales, and annotations
- Goal:
  - Improve coverage and robustness

Morphology-Based Sentiment Inference (Hatzivassiloglou & McKeown, 1997)

- a corpus-based method for semantic orientation (sentiment) classification

Key ideas:
- Prefix/suffix signals sentiment:
  - happy → unhappy
  - useful → useless

Conjunction patterns:
- "A and B":
  - A and B usually share same sentiment
- "A but B":
  - A and B often have opposite sentiment

Additional components:
- Classification models
- Graph-based clustering of adjectives

PMI-Based Sentiment Lexicons (Turney & Littman, 2003)

- a corpus-based statistical method using co-occurrence to measure sentiment

Core idea:
- Use seed positive and negative words
- Measure association between words and seed sets

Scoring intuition:
- A word is positive if it is more strongly associated with positive seeds than negative seeds

PMI (Pointwise Mutual Information)
- Measures how often two words co-occur vs expected by chance

Formula intuition:
- PMI(w1, w2) = log( P(w1, w2) / (P(w1) × P(w2)) )

Interpretation:
- PMI > 0:
  - words co-occur more than expected → strong association
- PMI < 0:
  - words co-occur less than expected → weak or negative association
- PMI ≈ 0:
  - independent words

SentiWordNet Construction Idea
- Based on WordNet semantic network
- Start with seed positive/negative words
- Expand using:
  - synonym links
  - antonym links
- Assign sentiment scores to synsets (word senses)

Lexicon-Based Sentiment Analysis — Strengths
- Easy to build (compared to labeled datasets)
- No need for annotated training data (unsupervised)
- Highly interpretable:
  - clear word-level reasoning
- Can incorporate linguistic rules:
  - negation handling
  - intensifiers (very, extremely)
  - downtoners (slightly, barely)

Lexicon-Based Sentiment Analysis — Limitations
- Domain dependence:
  - Same word can change polarity depending on context
    - “unpredictable plot” (positive)
    - “unpredictable CEO” (negative)
- Cannot handle:
  - sarcasm
  - irony
  - humor
  - exaggeration
- Context independence:
  - Words treated individually, not meaningfully contextualized

Rule-Based Example (Negation Handling)
- Rule:
  - Flip sentiment between negation word and punctuation
- Example:
  - "not very good" → becomes negative via rule adjustment
- Limitation:
  - Simplistic; breaks in complex sentence structures

VADER Sentiment Analysis (Example System)
- Rule-based sentiment model for social media
- Features:
  - Handles emojis and emoticons
  - Includes negation rules
- Performance:
  - Sentence-level: better performance
  - Document-level: weaker performance due to aggregation complexity

Traditional Sentiment Analysis as Text Classification

Feature Engineering (Handcrafted Features)
- Examples:
  - Text length (tokens/characters)
  - Number of positive words
  - Number of negative words
  - Emoticon counts
  - Lexicon-derived features

Example:
- Review R1:
  - "The movie was so boring - I hated it!"
  - High negative words, 1 negation/emoticon signal
- Review R2:
  - "Dune is brilliant and beautiful!"
  - Positive word dominance

Vector Space Model (VSM)
- Represent documents as feature vectors
- Features:
  - Unigrams, bigrams, trigrams
  - TF, binary, TF-IDF weighting
- Used for:
  - Classical ML classifiers

Traditional ML Models for Sentiment Classification
- Naive Bayes
- Logistic Regression
- K-Nearest Neighbors

Key considerations:
- Hyperparameters:
  - n-gram size
  - number of neighbors (KNN)
- Data setup:
  - Train/test split
  - Preprocessing (lowercasing, lemmatization, punctuation removal)

Negation Handling in Traditional ML

Use of bigrams, trigrams, etc.
- General problem: sparsity
- N-gram size potentially still too small

Data transformation before vectorization
- Increases vocabulary
- No fool-proof rules

Simple heuristic:
- Prefix words after negation:
  - "not good" → "NOT_good"

Limitations:
- Fails when:
  - long-distance negation occurs
  - multiple clauses exist
  - punctuation is missing or misleading
  - complex sentence structure breaks rule boundaries

Key Takeaways
- Lexicon-based methods rely on word sentiment dictionaries
- Multiple strategies exist to construct lexicons (manual, corpus-based, graph-based, etc.)
- PMI is a key statistical tool for measuring word association
- Lexicon approaches are interpretable but context-limited
- Traditional ML relies heavily on feature engineering and n-grams
- Handling negation and context remains a core challenge

Overview and motivation
- Sentiment analysis is a core NLP/text mining task with real-world applications
- Related tasks:
  - opinion mining
  - emotion detection
  - affect analysis
- Key challenge:
  - sentiment is subjective, subtle, and context-dependent
  - not always well-defined or directly observable

Dataset setup (CNN / RNN models)
- Binary classification task:
  - positive vs negative sentiment
- Dataset:
  - 25k movie reviews (training)
  - 25k movie reviews (testing)
- Preprocessing:
  - case folding
  - lemmatization
  - punctuation removal

CNN-based sentiment model
- Input: word embeddings (typical embedding size = 300)
- Architecture:
  - convolutional layers with kernel sizes: 2, 3, 4
  - 5 output channels per kernel size
  - followed by:
    - linear layer(s)
    - dropout
- Key idea:
  - capture local n-gram features via convolution filters
- Observations:
  - max F1 ≈ 0.75
  - worse than traditional ML in some cases
- Interpretation:
  - overfitting due to limited dataset size
  - CNN captures local patterns but may miss long-range dependencies

RNN / GRU-based sentiment model
- Architecture:
  - GRU (Gated Recurrent Unit)
  - bidirectional
  - stacked (2 layers)
  - embedding size: 300
  - hidden size: 512
  - additional linear layers + dropout
- Key idea:
  - model sequential dependencies in text
- Observations:
  - max F1 ≈ 0.80
  - still below some traditional ML baselines
- Issues:
  - overfitting
  - optimization sensitivity (e.g., learning rate too high near minimum)
  - difficulty handling long sequences effectively

Overfitting (general observation)
- Both CNN and RNN models show overfitting behavior
- Main reason:
  - limited dataset size relative to model capacity
- Result:
  - validation/test performance plateaus below expectation

Model ensembles (general concept)
- Setup:
  - train N independent models:
    - different architectures OR same architecture with different initialization/hyperparameters
  - each model produces output prediction
- Meta-learning approach:
  - use outputs of base models as features
  - train a meta-model on top

Key question:
- If N models each achieve F1 = 0.85, can an ensemble still help?
- Yes, because:
  - models may make different types of errors
  - ensemble reduces variance and exploits complementary strengths

Ensemble learning types
1. stacking (meta-model approach)
   - base model outputs → new training data → meta-model

2. end-to-end ensemble training
   - combine intermediate outputs of multiple models
   - continue joint training

Recurrent Convolutional Neural Networks (RCNNs)
- Hybrid model combining CNN + RNN:
  - CNN:
    - captures word + local context (convolution over context window)
  - RNN:
    - processes sequence of contextualized word representations
- Goal:
  - combine local feature extraction + sequential modeling

Word embeddings and sentiment limitation
- Word2Vec / distributional embeddings:
  - capture semantic similarity
  - NOT sentiment-aware by default
- Problem:
  - semantically similar words may differ in sentiment

Sentiment-aware embedding refinement
- Start with pretrained embeddings (e.g., Word2Vec)
- Use sentiment lexicons to adjust embeddings
- Idea:
  - incorporate sentiment ranking information into vector space
- Process:
  - compute similarity ranking via cosine similarity
  - compare with sentiment score ranking
  - iteratively adjust embeddings to align both rankings

Aspect-Based Sentiment Analysis (ABSA)
- Motivation:
  - sentiment is often aspect-specific, not document-wide
- Example:
  - “The burgers were great, but waiting time was long”
    - burgers → positive sentiment
    - waiting time → negative sentiment

ABSA sub-tasks
1. Opinion Target Extraction (OTE)
2. Aspect Category Detection (ACD)
3. Sentiment Polarity (SP)

Opinion Target Extraction (OTE)
Unsupervised methods:
- dictionary-based lookup (domain-specific terms)
- common baseline: frequent noun / noun phrase extraction
- pruning noisy candidates (e.g., keep “battery life”, drop “life”)
Pros:
- no labeled data required
- domain adaptability
Cons:
- requires explicit mention of target
- misses implicit aspects

Supervised methods:
- sequence labeling formulation (BIO tagging)
- example:
  - input: “The waiting time was long”
  - output: O B-SERV I-SERV O

Aspect Category Detection (ACD)
Unsupervised methods:
- clustering of opinion terms (requires good similarity metric)
- WordNet-based semantic relations (hypernyms/hyponyms)

Supervised methods:
- classification or joint learning with OTE
- maps extracted targets to predefined categories:
  - SERVICE#GENERAL
  - FOOD#QUALITY, etc.

Sentiment Polarity (aspect-level)
- Task:
  - determine sentiment toward specific aspect or target
- Challenges:
  - identifying relevant context for each aspect
- Traditional approach:
  - dependency parsing to link opinion words to targets
- Modern approach:
  - neural attention-based models

Neural approaches for ABSA
- attention mechanisms:
  - focus on relevant words for a given aspect
- co-attention models:
  - jointly model aspect and context interactions
- result:
  - improved aspect-level sentiment classification

End-to-end ABSA models
- joint learning of:
  - OTE + ACD + SP
- architectures:
  - BiLSTM + CNN hybrids
  - multitask learning frameworks
- benefit:
  - shared representations improve overall performance

Key summary points
- Sentiment analysis operates at multiple levels:
  - word-level (lexicons)
  - sentence/document-level (ML classifiers, CNN, RNN)
  - aspect-level (ABSA systems)
- Neural models (CNN, RNN, GRU):
  - improve representation learning but are data-hungry
  - prone to overfitting in small datasets
- Ensembles improve robustness by combining complementary models
- Word embeddings are not inherently sentiment-aware
- ABSA addresses fine-grained sentiment tied to specific targets
- Modern systems increasingly rely on attention and multitask learning
Week 9
CS5246 Week 9

CS5246 Text Mining — Lecture 9 (Named Entity Recognition)

Motivation and overview
- Named Entity Recognition (NER):
  - Identify and extract real-world entities from unstructured text
- Named entities refer to:
  - persons, organizations, locations, dates, products, etc.
- No universal schema:
  - entity types vary across systems and applications
- Entities are typically nouns, but can include other POS categories

Named entity definition
- Named entity:
  - a word or phrase referring to a specific real-world object
- Examples:
  - Person: "Barack Obama"
  - Organization: "Google"
  - Location: "Singapore"
  - Date: "2026-03-26"

Named entity types (spaCy-style taxonomy)
- PERSON: individuals (including fictional characters)
- NORP: nationalities, religious or political groups
- FAC: facilities (buildings, airports, highways, etc.)
- ORG: organizations, companies, institutions
- GPE: geopolitical entities (countries, cities, states)
- LOC: non-GPE locations (mountains, bodies of water)
- PRODUCT: physical objects (not services)
- EVENT: named events (wars, sports events, hurricanes)
- WORK_OF_ART: creative works (books, songs, etc.)
- LAW: legal documents
- LANGUAGE: named languages
- DATE: absolute or relative dates
- TIME: time expressions under a day
- PERCENT: percentages
- MONEY: monetary values
- QUANTITY: measurable quantities (weight, distance, etc.)
- CARDINAL: numbers not otherwise classified
- ORDINAL: ranked numbers (first, second, etc.)

Key idea:
- 18 entity types commonly supported in spaCy-based systems

Applications of NER
- Information retrieval:
  - improve search, indexing, and entity linking
- Sentiment analysis:
  - identify sentiment targets (aspects/entities)
- Text classification:
  - disambiguate meaning (e.g., “Apple” company vs fruit)
- Machine translation:
  - preserve named entities across languages
- Question answering:
  - answers often are entities

NER in machine translation
- Problem:
  - named entities should often not be translated
- Solution:
  1. replace entities with placeholders (NE1, NE2, ...)
  2. translate sentence without altering entities
  3. restore original entities after translation
- Benefit:
  - avoids incorrect translation of entity names while preserving meaning

Naive NER approach: gazetteer lookup
- Gazetteer:
  - predefined list of known entities
    - e.g., countries, cities, organisations, days of the week, etc.)
- Method:
  - match text against entity lists

What to match:
- n-grams up to a fixed length
- noun phrases / compound nouns

Matching strategies:
- exact string match
- approximate match:
  - prefix overlap
  - n-gram overlap
  - string similarity

Pros:
- simple and fast
- easy to build from external sources (Wikipedia, lists, etc.)

Cons:
- limited recall (only known entities)
- precision issues (ambiguity, duplicates)
- cannot resolve entity type ambiguity
- poor generalization to unseen entities

Entity type ambiguity
- Same surface form may belong to different entity types
- Cannot be resolved via lookup alone
- Context is required for disambiguation

NER as sequence labeling task
- Reformulation:
  - assign a label to each token in a sentence
- Requires:
  - annotated datasets (supervised learning)

Common annotation schemes:
- IO:
  - I = inside entity
  - O = outside entity
- IOB:
  - B = beginning of entity
  - I = inside entity
  - O = outside
- IOBES:
  - B = beginning
  - I = inside
  - O = outside
  - E = end
  - S = single-token entity

Key note:
- “Outside” tokens are explicitly labeled as O (not removed)
- Alternative schemes extend tagging precision for boundaries

NER evaluation

Metrics:
- precision:
  - correct predicted entities / total predicted entities
- recall:
  - correct predicted entities / total true entities
- F1-score:
  - harmonic mean of precision and recall

Key challenge:
- partial matches complicate evaluation

Error types:
- missed entities
- wrong entity type
- wrong boundaries
- both boundary + type incorrect

Evaluation strategies:
1. Exact match:
   - entity is correct only if both span and type match exactly
2. Relaxed match:
   - partial credit for overlapping spans

Key difficulty:
- not all errors are equally severe (hard to weight fairly)

Traditional ML NER 2 steps pipeline (overview)
- Requires feature engineering:
  - lexical features
  - POS tags
  - capitalization
  - context windows
  - gazetteer features

Model types:
- non-sequence models:
  - classify each token independently (limited performance)
- sequence models:
  - model dependencies between tokens (better performance)

Sequence labeling intuition:
- prediction depends on neighboring labels
- avoids inconsistent tag sequences

NER limitations of naive approaches
- lookup-based systems:
  - high precision, low recall
- independent classification:
  - ignores context and structure
- need for sequence-aware modeling

Transition to neural NER models
- motivation:
  - reduce manual feature engineering
  - capture context automatically
- approach:
  - neural sequence models

Basic RNN-based NER architecture
- input:
  - word embeddings per token
- encoder:
  - RNN / LSTM / GRU processes sequence
- output:
  - tag prediction per token (softmax layer)

Key idea:
- hidden state encodes contextual information across sequence

Extended neural concepts (NER direction)
- bidirectional RNNs:
  - use both past and future context
- stacked RNN layers:
  - deeper representation learning
- improved sequence modeling:
  - better boundary detection and entity classification

Core takeaway
- NER evolves through three levels:
  1. lookup-based (gazetteers)
  2. traditional ML with feature engineering
  3. neural sequence models (RNN-based and beyond)

- Main challenges:
  - ambiguity of entity types
  - unseen entities
  - boundary detection
  - evaluation complexity

Traditional ML pipeline for NER
- Two main steps:
  1. Feature extraction from words/phrases
  2. Train a classifier using extracted features
- Two modeling styles:
  - non-sequence models (independent predictions)
  - sequence models (structured prediction over labels)

Key idea:
- NER is reframed as classification using engineered features

Feature extraction types (feature value dimensions)

1. Boolean features
- True/False indicators
- Example:
  - word is capitalized
  - word appears in gazetteer

2. Numeric features
- Continuous or integer values
- Example:
  - word length
  - frequency counts

3. Nominal features
- Categorical values
- Example:
  - stemmed form of word
  - POS tag category

Feature sources (feature categories)

1. Word-level features
- case (uppercase/lowercase)
- POS tags
- morphology:
  - prefixes, suffixes
- word shape:
  - Xxxx, xx, dddd patterns

2. List / gazetteer features
- entity dictionaries:
  - cities, organizations, dates, etc.
- stopword lists
- abbreviation lists
- binary match features (in list or not)

3. Corpus / document-level features
- context words (previous / next tokens)
- position in sentence
- word frequency

Feature engineering example (token-level view)
- Each token is enriched with:
  - word identity
  - POS tag (current, previous, next)
  - shape pattern
  - length
  - gazetteer match
  - stopword flag

Example intuition:
- “Musk bought Twitter”
  - Musk → capitalized, NNP-like, possible PERSON
  - bought → verb context
  - Twitter → capitalized, ORG candidate

Traditional ML — Non-sequence models (Setup 1)

Core idea:
- First identify entity candidates (phrases or n-grams)
- Extract all relevant features for each named entity
  - Often multiterm named entities to phrase features instead word features
- Then classify each candidate independently

Pipeline:
1. Extract candidate spans:
   - n-grams
   - noun phrases
   - gazetteer matches
2. Extract features for each candidate
3. Train multiclass classifier:
   - labels = entity types (PERSON, ORG, GPE, etc.)

Example:
- “Bill Gates” → PERSON
- “San Francisco” → GPE
- “$44 Billion” → MONEY

Notes:
- Outside (O) is implicitly assumed for non-entities

Pros:
- simple and fast
- good when only specific entity types are needed
- gazetteer improves precision for known entities
- Candidate identification step determines performance

Cons:
- poor recall for unseen entities
- Potentially slow for full-fledged NER (all entities & all types)
- cannot model label dependencies
- sensitive to candidate generation quality

Limitations example:
- ambiguity in entity types cannot be resolved:
  - same phrase may map to different entity types depending on context

Traditional ML — Non-sequence models (Setup 2)

Core idea:
- classify each token individually in sequence order

Pipeline:
1. iterate through each word in sentence
2. extract features per word + context
3. predict entity label for each token

Feature set:
- word features
- POS tags
- shape
- length
- stopword indicator
- previous word / next word
- previous predicted label (sometimes included)

Example:
- “Twitter headquartered in San Francisco”
  - token-by-token labeling

Pros:
- no need for candidate extraction step
- can incorporate local context and previous labels

Cons:
- limited dependency modeling
- prediction errors propagate
- cannot revise earlier decisions

Key issue:
- local decisions can violate global consistency
  - e.g., invalid transitions like B-LOC → I-PER

Why sequence modeling is needed
- correct NER requires structured prediction:
  - label sequences must be globally consistent
- local classifiers cannot enforce valid transitions

Example constraint:
- after B-LOC, likely:
  - I-LOC or O
- unlikely or invalid:
  - I-PER, B-ORG (depending on schema rules)

Traditional ML — Sequence Models

Goal:
- find the most likely sequence of labels over the entire sentence

Core models:
- Hidden Markov Models (HMM)
- Conditional Random Fields (CRF), especially Linear-Chain CRF

Key idea:
- model dependencies between labels explicitly
- perform global optimization over label sequence

Why they are still “traditional ML”
- still rely on feature engineering
- no automatic representation learning

HMM intuition
- generative model:
  - models joint probability P(words, labels)
- assumptions:
  - Markov property on labels
  - emission probability: word given label

CRF intuition
- discriminative model:
  - models P(labels | words)
- allows:
  - richer feature sets
  - direct sequence-level optimization

Comparison summary

Non-sequence models:
- classify independently per word or span
- weak structure modeling
- simpler but less accurate

Sequence models:
- predict entire label sequence jointly
- enforce label consistency
- better performance in structured tasks like NER

Core takeaway
- Traditional NER evolves from:
  1. lookup/gazetteer methods
  2. feature-based classification (non-sequence ML)
  3. structured prediction (HMM / CRF)

- Main bottleneck:
  - performance depends heavily on feature engineering
  - sequence dependencies are crucial for correctness

HMM Intuition — From Naive Bayes to HMM

Core idea: from independent classification to sequence modeling

Naive Bayes (baseline intuition)
- Treat each observation independently
- Each word is classified separately
- Assumption:
  - no dependency between labels
  - no dependency across time steps

HMM (1st order Hidden Markov Model)
- Extend Naive Bayes into a sequence model
- “Connect all Mini Naive Bayes models into a chain”

Key change:
- labels are no longer independent
- each label depends only on:
  - previous label (first-order Markov assumption)

HMM structure:
- hidden states: labels (e.g., B-LOC, I-LOC, O)
- observations: words in sentence
- dependencies:
  - P(y_t | y_{t-1})
  - P(x_t | y_t)

Special component:
- initial state distribution (start label probability)

HMM intuition:
- sequence of local classifiers linked through label transitions

HMM — Decoding (NER task)

Goal:
- Given words x_1...x_T
- find best label sequence y_1...y_T

Objective:
- maximize joint probability of labels given observations indirectly via model:
  - argmax_y P(x, y)

Result:
- most likely path through label space

Example (location phrase):
- words like “San Francisco flying to Alaska”
- candidate label sequences:
  - all B-LOC
  - all I-LOC
  - all O
- best path = globally highest probability sequence

Decoding method:
- dynamic programming
- Viterbi Algorithm

Key idea:
- avoid brute-force enumeration of all label sequences
- efficiently compute optimal path

HMM shortcomings

Limitation 1: restricted observation modeling
- each state only depends on corresponding word
- cannot use rich features (context, shape, POS, etc.)

Limitation 2: generative modeling constraint
- models joint probability:
  - P(x, y)
- requires Bayes’ rule to compute:
  - P(y | x)

Limitation 3: feature limitations
- cannot naturally include:
  - sentence layout
  - document structure
  - domain-specific signals
  - non-local features

Key question raised:
- can we directly model P(y | x)?

→ leads to Conditional Random Fields (CRFs)

Transition to CRFs

Motivation:
- want a model that:
  - directly learns conditional probability P(y | x)
  - supports arbitrary, rich features
  - still models sequence structure

Comparison of paradigms:

Multiclass Logistic Regression
- discriminative model
- learns P(y | x)
- supports arbitrary features
- does NOT model sequences

HMM
- generative model
- models P(x, y)
- sequence-aware
- limited features

CRF idea:
- combines advantages:
  - sequence modeling like HMM
  - discriminative learning like logistic regression

CRF intuition:
- “HMM going conditional”

CRF = log-linear model for sequences

Log-linear model (core idea)
- probability defined using:
  - weighted sum of feature functions
- then normalized via exponential form

General form:
- uses feature functions f(y, x)
- computes scores via dot product with weights
- converts scores into probabilities

Key components:
- feature function f
- weight vector w
- exponential normalization (partition function)

CRF interpretation:
- generalization of logistic regression
- extended from single label → label sequences

Linear-chain CRF

Definition:
- structured prediction model over sequences

Key properties:
- feature functions can depend on:
  - current state (label)
  - previous state (label transition)
- same feature functions reused across all time steps

Restriction:
- only local dependencies allowed in feature design:
  - y_t and y_{t-1}
- but rich feature engineering allowed on observations x

Comparison:
- Logistic regression → single label
- Linear-chain CRF → sequence of labels

“HMM-like CRF”

Further restriction:
- feature functions only depend on:
  - current word (observation)
  - current label

Removed:
- previous label dependency in feature functions (simplified case)

Effect:
- easier training
- reduced expressive power compared to full CRF

Feature functions in CRFs

General characteristics:
- can be binary or real-valued
- weighted by learned parameters

Examples of valid feature functions:
- word identity features
- capitalization indicators
- POS tags
- word shape patterns
- gazetteer membership
- suffix/prefix patterns
- word length

Invalid (for HMM-like CRF):
- previous/next word context
- previous label dependency
- global document features

Core takeaway

HMM:
- generative sequence model
- limited feature expressiveness
- requires Viterbi decoding for best label sequence

CRF:
- discriminative sequence model
- flexible feature design
- directly models P(y | x)
- generalizes logistic regression to sequences

Big picture evolution:
Naive Bayes → HMM → CRF
(independent → sequence generative → sequence discriminative)

CRF — Training

Core idea:
- CRF is a log-linear model (similar to Logistic Regression but for sequences)

Objective:
- maximize conditional likelihood:
  - P(y | x)

Optimization:
- requires computing gradients of parameters (weights)

Gradient structure:
- gradient = empirical feature counts − expected feature counts

Components of gradient:
1. Empirical feature counts
- sum of feature values observed in training data
- “what actually happened”

2. Expected feature counts
- sum of feature values over all possible label sequences
- weighted by model probability
- “what the model thinks could happen”

Training procedure:
- compute gradients for all parameters
- update using Gradient Descent (or variants like L-BFGS, SGD)

Key intuition:
- CRF learns by matching:
  - observed feature statistics
  - vs. model’s predicted distribution over sequences

CRF — Inference / Decoding

Goal:
- find best label sequence y for given input x

Objective:
- argmax_y P(y | x)

Challenge:
- number of possible label sequences grows exponentially with sentence length

Solution:
- dynamic programming

Algorithm:
- Viterbi Algorithm (same style as HMM decoding)

Key idea:
- efficiently compute globally optimal label sequence
- avoid enumerating all possible paths

CRF decoding intuition:
- similar structure to HMM decoding
- but scores come from conditional model with features

NER with Neural Networks (Transition)

Motivation:
- HMM/CRF rely heavily on feature engineering
- CRF improves modeling but still feature-based

Goal:
- learn features automatically from data

Solution:
- neural sequence models:
  - RNNs (especially LSTM / Bi-LSTM)
  - Transformers (advanced extension)

RNN for Sequence Labeling (NER)

Task:
- input: sentence (sequence of words)
- output: sequence of labels (NER tags)

Example:
- Bob flew to New York
- labels:
  - B-PER, O, O, B-LOC, I-LOC

Basic RNN / Bi-LSTM architecture

Structure:
- Bi-directional LSTM processes sequence:
  - forward direction (left → right)
  - backward direction (right → left)

At each time step:
- hidden state captures context from both sides
- softmax layer predicts label per token

Key property:
- uses contextual embeddings rather than isolated word features

RNN for NER — POS Features

Limitation of basic Bi-LSTM:
- only uses word embeddings as input
- misses useful linguistic features

Extension:
- add POS tag embeddings

Input representation:
- for each token:
  - concatenate:
    - word embedding
    - POS embedding

Benefit:
- richer input representation
- faster convergence observed in practice (not always a rigorous improvement metric)

Important caveat:
- faster loss decrease ≠ guaranteed better model performance
- proper evaluation required (precision/recall/F1 on validation set)

RNN for NER — Label Dependencies

Problem:
- Bi-LSTM predicts labels independently at each time step (via softmax)

Issue:
- does not explicitly enforce valid label transitions
  - e.g., B-LOC → I-LOC is valid
  - B-LOC → I-PER is invalid

Solution:
- add CRF layer on top of Bi-LSTM

BiLSTM-CRF model:
- Bi-LSTM:
  - learns contextual word representations
- CRF layer:
  - models dependencies between output labels
  - enforces globally consistent sequences

Result:
- combines:
  - neural feature learning
  - structured prediction

RNN for NER — Character-Level Features

Motivation:
- word-level embeddings miss morphological signals
  - suffixes, prefixes
  - spelling patterns
  - handling unseen words

Solution:
- character-level Bi-LSTM

Architecture:
1. each word is decomposed into characters
2. character embeddings are processed by Bi-LSTM
3. final character representation is produced per word
4. concatenated with word embedding

Final token representation:
- word embedding + POS embedding + character-level embedding (optional)

Benefit:
- improves handling of:
  - rare words
  - misspellings
  - domain-specific tokens

Overall NER Evolution Summary

Traditional ML:
- HMM:
  - generative sequence model
  - limited features
- CRF:
  - discriminative sequence model
  - rich engineered features

Neural ML:
- Bi-LSTM:
  - automatic feature learning
  - contextual embeddings
- Bi-LSTM + CRF:
  - best of both worlds:
    - learned representations
    - structured decoding
- Character-level + POS features:
  - improves robustness and linguistic awareness

Core takeaway:
- NER has evolved from:
  feature engineering → probabilistic sequence models → neural representation learning with structured decoding
Week 10
- Repetition in language: referring to the same entity or concept multiple times is very common in natural language
- Humans avoid naive repetition by using pronouns and alternative expressions instead of repeating full names
- Example contrast:
  - Repeated form: "Neil Armstrong said Neil Armstrong jumped..."
  - Natural form: "Neil Armstrong said ... He jumped..."
- When naive repetition may be preferred: contexts requiring extreme clarity, low ambiguity, or machine readability where pronouns may cause confusion

- Entity resolution: task of resolving multiple mentions that refer to the same entity in text
- Main types:
  - Anaphora resolution: identifying what an anaphor (e.g., pronoun) refers to
  - Coreference resolution: identifying all mentions referring to the same real-world entity
- Importance of entity resolution:
  - Keyword extraction
  - Entity linking
  - Relation extraction
  - Text summarization
  - Machine translation
  - Question answering

- Anaphora vs coreference:
  - Anaphora: a mention (anaphor) refers to a previous mention (antecedent)
  - Coreference: two or more mentions refer to the same real-world entity
  - Not identical concepts in theory, but often used interchangeably in practice
  - Not all coreference is anaphoric (can be non-directional reference)
  - Not all anaphora are strictly coreferential depending on interpretation (e.g., bridging cases)
- Example distinctions:
  - "He" referring to "Neil Armstrong" is anaphora
  - "The CEO of Tesla, Elon Musk" and "Elon Musk" are coreferential but not anaphoric

- Types and phenomena in reference resolution:
  - Bridging anaphora: indirect relation (e.g., mall → food court)
  - Zero anaphora: omitted pronoun inferred from context
  - Cataphora: reference appears before its antecedent
  - Split anaphora: one reference refers to multiple entities
  - Indefinite pronominal anaphora: ambiguous or generic pronoun use (e.g., "one")
  - "one" anaphora: substitution using "one"
  - Number, gender, and agreement constraints affect validity of links
  - Not all pronouns are anaphoric (e.g., expletive "it" in "It was raining")

- Challenges in entity resolution:
  - High linguistic variability in reference forms
  - Long-distance dependencies across sentences
  - Ambiguity in pronoun resolution
  - Requirement of world knowledge and semantic understanding
  - Syntax and agreement constraints are helpful but not sufficient

- Constraints used in resolution:
  - Gender agreement between mention and pronoun
  - Number agreement (singular/plural consistency)
  - Recency preference (closer mentions are more likely antecedents)
  - Syntactic constraints (role such as subject/object/appositive)
  - Semantic constraints (animacy, plausibility)
  - Verb and structural agreement constraints
  - World knowledge constraints (real-world plausibility)
  - Constraints are useful for rule-based systems and as ML features but are not always reliable
  - Fundamental for purely syntactic / rule-based resolution methods
  - Features or ranking criteria for statistical or ML-based methods
  - Not always 100% fool-proof

- Rule-based approach: Hobbs’ algorithm (1978)
  - Operates on syntactic parse trees
  - Goal: find antecedent for pronoun
  - Procedure:
    - Locate NP dominating the pronoun
    - Move up to nearest NP or S node (call X)
    - Perform left-to-right breadth-first search under X for candidate noun phrases
    - Test agreement constraints for each candidate
    - If none match, move to higher NP or S (including previous sentence structure)
    - Repeat search until antecedent is found
  - Key idea: structured tree traversal + constraint filtering + first valid match selection

- Traditional machine learning approaches:
  - Mention-pair model:
    - Generate all pairs of mentions (noun phrases, including pronouns)
    - Train binary classifier to predict if two mentions are coreferent
  - Feature engineering is crucial:
    - Distance features (how far apart mentions are)
    - String match features (exact or partial overlap)
    - Grammatical features (NP type, gender, number)
    - Syntactic features (subject/object roles, appositions)
    - Semantic features (animacy, plausibility)
    - Distributional features (word embeddings)
    - Word embeddings
  - Learning objective often framed with cross-entropy loss

- Datasets for entity resolution:
  - Definite Pronoun Resolution dataset
  - GAP Coreference dataset
  - Used for training and evaluating pronoun/coreference models

- Deep learning approaches:
  - Learn distributed representations for mentions/entities
  - Model global context rather than only pairwise features
  - End-to-end neural coreference models jointly learn mention detection and linking
  - Typically outperform feature-based methods by capturing richer semantic and contextual cues

- Overall summary:
  - Entity resolution is essential preprocessing for many NLP tasks
  - Core difficulty comes from ambiguity, linguistic variety, and need for contextual/world knowledge
  - Methods evolved from rule-based systems → feature-based ML → deep learning models with learned representations

- Named Entity Linking (NEL):
  - Task: link named entities mentioned in text to entries in a knowledge base or knowledge graph
  - Each entity is uniquely identified (e.g., URI such as http://dbpedia.org/resource/Neil_Armstrong)
  - Goal: map surface forms (words/phrases) to canonical entities
  - Uses contextual similarity between mention and candidate entity descriptions for disambiguation

- Example intuition:
  - Text: “Neil Armstrong stepped on the moon … Armstrong jumped …”
  - Challenge: determine whether “Armstrong” refers to Neil Armstrong or another entity
  - Core issue: linking ambiguous surface forms to correct KB entity

- Applications of Named Entity Linking:
  - Information retrieval (improving search relevance via entity-level indexing)
  - Question answering (mapping questions to correct entities)
  - Machine translation (preserving entity identity across languages)
  - Relation extraction (connecting entities via structured relations)
  - Conversational agents (grounding references in external knowledge bases)

- Key challenges in NEL:
  - Ambiguity: same name refers to multiple entities (e.g., “Washington” → person, state, city)
  - Variability: many surface forms (abbreviations, nicknames, spelling variants like “SG”, “S’pore”, “Singapore”)
  - Missing entities (NIL problem): entity not present in knowledge base, must detect and abstain
  - Knowledge base incompleteness and evolution over time (entities added/updated continuously)
  - Context sensitivity: meaning depends heavily on surrounding text

- Named Entity Linking pipeline (main components):

  - Candidate generation:
    - Retrieve possible entities for a given mention
    - Typically produces a large set of candidates (high recall, low precision)
    - Common methods:
      - String matching and lexical similarity
      - Wikipedia disambiguation pages
      - Search APIs (e.g., Wikidata search)
    - Goal: do not miss correct entity, even if many false candidates are included

  - Candidate ranking:
    - Score and rank candidate entities to select best match
    - Two main feature types:

    - Context-independent features:
      - String similarity (exact match, prefix/suffix overlap, partial match)
      - Entity popularity (Wikipedia page views, link counts, prior frequency)
      - Entity type consistency (requires NER labels like PER/ORG/LOC)

    - Context-dependent features:
      - Local text context (bag-of-words, keyphrases around mention)
      - Anchor text statistics from Wikipedia
      - Coherence between entities in same document (global consistency)
      - Overlap between linked entity contexts

  - NIL prediction:
    - Decide when no candidate is correct
    - Important because KBs are incomplete
    - Requires thresholding or explicit NIL class modeling
    - Often difficult in practice due to borderline cases

- Supervised learning formulation for ranking:
  - Input: (mention, candidate entity) pairs
  - Output: probability that candidate is correct link
  - Training objective: classification (often cross-entropy loss)
  - Final decision: rank candidates by probability score

- Common machine learning approaches:
  - Traditional ML:
    - Logistic regression, Naive Bayes, other probabilistic classifiers
    - Heavily feature-engineered pipelines
  - Deep learning:
    - Encoder-based architectures (CNN, RNN, Transformers)
    - Use learned representations for mention and entity context
    - Often include attention mechanisms for alignment between text and entity description
    - Can model richer semantic similarity than manual features

- Deep learning model dimensions in NEL:
  - Choice of encoder architecture (CNN / RNN / Transformer)
  - Local vs global disambiguation strategies
  - Handling NIL cases explicitly or implicitly
  - Candidate generation strategy integration
  - Entity coherence modeling across documents

- Overall summary:
  - Named Entity Linking connects text mentions to structured knowledge base entities
  - Core pipeline: candidate generation → candidate ranking → NIL detection
  - Major difficulty comes from ambiguity, variability, missing knowledge, and context dependence
  - Evolution of methods: rule-based/lexical → feature-based ML → neural representation learning approaches

- Relation Extraction (RE):
  - Goal: convert unstructured text into structured knowledge representations
  - Typical output: knowledge graph composed of (subject, predicate, object) triples
  - Example entities:
    - (Euler, born-in, Basel)
    - (Euler, works-as, mathematician)
    - (Basel, located-in, Switzerland)

- Knowledge graphs:
  - Represent entities and relations as structured triples
  - Enable machine-readable semantic structure over text
  - Example structure:
    - Entity types: Person, City, Mathematician
    - Relations: born-in, located-in, is-a, works-as, advisor-of, education
  - Support reasoning over connected facts

- Tacit knowledge (quick idea):
  - Information that is implied rather than explicitly stated in text
  - Hard to extract automatically because it is not directly expressed

- Benefits of relation extraction:
  - Improves search and information retrieval
  - Enables question answering over structured facts
  - Supports natural language understanding
  - Helps data integration across sources (especially with entity linking)
  - Improves semantic interoperability (machine understanding of text)
  - Enhances recommendation systems
  - Overall: transforms text into structured, queryable knowledge

- What counts as a meaningful relation:
  - Not all extracted triples are equally useful
  - Example sentence:
    - “Euler was born in Basel where he enjoyed his childhood.”
    - Possible triples:
      - (Euler, born-in, Basel)
      - (Euler, enjoyed, childhood)
  - Most systems focus on relations between named entities
  - Useful relations depend heavily on the downstream application

- Handling linguistic complexity in relations:
  - Negation:
    - “Euler was not born in St. Petersburg.”
    - Requires representation like (Euler, not-born-in, St. Petersburg)
    - Often difficult to represent in standard knowledge graphs
  - Uncertainty:
    - “They say Euler was born in Basel.”
    - Represents belief or attribution rather than fact
    - Requires meta-level representation (statement about statement)

- Relation equivalence and paraphrasing:
  - Same fact can be expressed in multiple ways:
    - “Euler was born in Basel.”
    - “Basel was the birthplace of Euler.”
  - Different triples but semantically equivalent:
    - (Euler, born-in, Basel)
    - (Basel, birthplace-of, Euler)
  - Requires normalization or shared vocabulary for consistency

- Vocabulary and standardization:
  - Ontology or controlled vocabulary defines allowed entities and relations
  - Enables consistent querying across datasets
  - Example query:
    - (?person, born_in, Basel)
  - Without standardization, integration becomes difficult

- Closed-world vs open-world assumption (conceptual distinction):
  - Closed-world assumption:
    - What is not known to be true is assumed false
    - Useful in databases and rule-based systems
  - Open-world assumption:
    - Absence of information does not imply falsehood
    - Common in knowledge graphs and web-scale data
  - Key implication: affects how missing facts are interpreted

- Relation vocabularies and ontologies:
  - ACE (Automatic Content Extraction):
    - Defines structured relation types such as:
      - Physical (located, near)
      - Part-whole (geographical, subsidiary, artifact)
      - Personal-social (family, business, etc.)
      - Org-affiliation (employment, membership, ownership)
      - Agent-artifact (manufacturer, inventor, user)
  - UMLS (Unified Medical Language System):
    - ~127 semantic types
    - ~54 semantic relationships
    - Includes non-factual or probabilistic relations (e.g., may-cause)
  - Ontologies:
    - Formal representation of entities, classes, properties, and relationships
    - Components:
      - Individuals: specific entities (Euler, Basel)
      - Classes: categories (Person, City)
      - Properties: attributes or values (birth date)
      - Relationships: links between individuals (born-in)
      - Axioms: logical constraints
  - Schema.org:
    - Industry ontology created by major tech companies
    - Used in Google Knowledge Graph

- Rule-based relation extraction:
  - Hearst patterns (for IS-A / hyponym relations):
    - “Y such as X” → X is-a Y
    - “such Y as X”
    - “X or other Y”
    - “Y including X”
    - “Y especially X”
    - Example:
      - (Euler, is-a, mathematician)
  - Extension beyond IS-A:
    - Pattern-based extraction for domain-specific relations
    - Example templates:
      - PERSON joined ORG as OCCUPATION
      - PERSON works as OCCUPATION at ORG
    - Example:
      - “Chris works as a lecturer at NUS”
      - (Chris, works-as, lecturer)
      - (Chris, works-at, NUS)

- Rule-based approaches: strengths and weaknesses
  - Pros:
    - No labeled dataset required
    - High precision (rules are explicit)
    - Easy to customize for specific domains or languages
  - Cons:
    - Low recall due to linguistic variability
    - Hard to scale to many relation types
    - Time-consuming rule creation
    - Limited generalization to unseen expressions

- Bootstrapping approach:
  - Start with seed entity pairs with known relations
  - Extract sentences containing both entities
  - Learn patterns from contexts
  - Use patterns to discover new relations
  - Iterate to expand dataset and pattern set
  - Risk: error propagation if early patterns are incorrect

- Dependency-based relation extraction:
  - Uses syntactic dependency trees instead of raw text
  - Extract relations based on grammatical structure
  - Example structure:
    - subject (nsubj)
    - verb
    - object (dobj)
  - Advantage:
    - More structured and robust than surface patterns

- Overall summary:
  - Relation extraction builds structured knowledge graphs from text
  - Key difficulty: linguistic variation, ambiguity, negation, and uncertainty
  - Approaches:
    - Rule-based (high precision, low recall)
    - Bootstrapping (semi-automatic pattern learning)
    - Dependency-based methods (syntactic structure-aware)
    - (Later extensions include ML and deep learning methods)

- Relation extraction (traditional ML approaches):
  - Task setup:
    - Input: pair of entities extracted from text
    - Output (binary): whether a relation exists or not
    - Output (multiclass): type of relation from a fixed set (e.g., born-in, works-for)
  - Two main formulations:
    - Binary classification: relation vs no relation
    - Multiclass classification: classify relation type directly
  - Optional pipeline design:
    - Step 1: detect entities (NER, noun phrase extraction, or lookup lists)
    - Step 2: generate all candidate entity pairs
    - Step 3:
      - extract features
      - predict relation existence
      - optionally predict relation type (often after filtering non-relations)

- Feature engineering for relation extraction:

  - Word-based features:
    - Entity headwords and combinations:
      - e.g., “Euler”, “Basel”, “Euler–Basel”
    - Words inside or near entities:
      - e.g., “Leonhard Euler”, “Basel”, “Switzerland”
    - Words and bigrams between entities:
      - e.g., “was”, “born”, “on”, “in”, “15 April 1707”
    - Positional features:
      - words immediately before/after entities
    - Bag-of-words style features in the sentence context

  - Named Entity Recognition (NER) features:
    - Entity types (PERSON, LOCATION, ORGANIZATION, etc.)
    - Concatenation of entity types (e.g., PERSON–LOCATION)
    - Number of intervening entities between pair
    - Helps constrain plausible relations

  - Syntactic structure features:
    - Constituent parse paths:
      - Tree path between two entities in constituency parse
      - Example pattern: NP ↑ S ↓ VP ↓ PP ↓ NP
    - Dependency parse features:
      - Dependency paths between entities
      - Example:
        Euler ←nsubjpass← born →prep → in →pobj → Basel
    - Captures grammatical relation structure beyond surface text

- Key idea behind feature-based ML:
  - Convert text into structured feature vectors
  - Apply standard classifiers:
    - Naive Bayes
    - Logistic Regression
    - SVM
  - Output prediction probabilities for relations

- Evaluation of traditional ML relation extraction:
  - Standard metrics:
    - Precision
    - Recall
    - F1-score
  - Performance depends heavily on feature quality and labeled data

- Strengths of traditional ML approaches:
  - Can achieve strong performance with good feature engineering
  - Interpretable compared to deep models
  - Works well in constrained domains

- Weaknesses:
  - Requires large amounts of annotated training data (expensive)
  - Poor generalization across domains (domain sensitivity)
  - Heavy reliance on manual feature engineering

- Common practical solution:
  - Semi-supervised or hybrid systems:
    - Combine rule-based signals + ML models
    - Reduce reliance on full supervision

- Deep learning approaches to relation extraction:

  - General idea:
    - Replace manual feature engineering with learned representations
    - Model learns features directly from text

  - Key architectures:
    - CNN-based models:
      - Capture local n-gram patterns
      - Often used with piecewise convolution for entity pairs
    - RNN / LSTM-based models:
      - Capture sequential dependencies in text
      - Can be extended to tree-LSTMs for syntax-aware modeling
    - Encoder-decoder architectures:
      - Jointly learn entity and relation extraction tasks
    - Attention-based models:
      - Focus on important words contributing to relation
      - Improve handling of long sentences and noise

  - Key modeling ideas:
    - Piecewise pooling (divide sentence around entities)
    - Word embeddings as input representations
    - Knowledge-based attention (leveraging external KBs)
    - Joint modeling of entities + relations (end-to-end systems)

  - Distant supervision:
    - Automatically label training data using knowledge bases
    - Assumption: if KB contains relation (A, r, B), any sentence mentioning A and B expresses r
    - Pros: scalable data generation
    - Cons: noisy labels (not every sentence reflects the relation)

- Comparison of approaches:
  - Rule-based:
    - High precision, low recall
    - No training data required
  - Traditional ML:
    - Strong balance with good features
    - Requires labeled data and feature engineering
  - Deep learning:
    - Learns features automatically
    - Better generalization potential
    - Requires large (often noisy) datasets

- Overall summary:
  - Relation extraction transforms text into structured knowledge graphs
  - Traditional ML relies on engineered lexical, syntactic, and semantic features
  - Deep learning replaces manual features with learned representations
  - Core challenge remains linguistic variability and limited supervision
Week 11
RNN — Limitations with Long Sequences

Training Issues
- Vanishing gradients
  - Gradients shrink during backpropagation → earlier tokens have little influence
- Exploding gradients
  - Gradients grow uncontrollably → unstable training

Information Bottleneck
- Hidden state must encode entire sequence history
- Earlier information fades over time
- Difficult to capture long-range dependencies

Performance Constraints
- Sequential processing (step-by-step)
- Cannot parallelize across time steps
- Limits GPU efficiency

Key Motivation
- Need models that:
  - Capture long-range dependencies
  - Avoid sequential bottlenecks
  - Enable parallel computation

Solution Direction
- Attention mechanism
- Transformer architecture

Transformer — Core Idea

Architecture
- Encoder-decoder structure without recurrence
- No sequential dependency → parallelizable
- No single hidden state bottleneck

Key Components
- Attention mechanism (core)
  - Alignment scores between all word pairs
- Positional encodings (to preserve order)

Important Note
- Transformers are parallelizable but not necessarily faster/easier to train

Positional Encodings

Problem
- Transformers process all tokens simultaneously
- No inherent notion of:
  - Word order
  - Distance between words

Goal
- Inject positional information into embeddings

Basic Approach
- Add positional encoding vector to word embedding

Requirements for Good Encodings
- Unique for each position
- Independent of sequence length
- Values should not dominate embeddings
- Capture relative positions

Naive Approach 1
- Use position index directly
- Problem:
  - Large values dominate embeddings
  - Depends on sequence length

Naive Approach 2
- Normalize positions (e.g., 0 to 1)
- Problem:
  - Same position has different encoding across sequences

Proposed Approach (Sinusoidal Encoding)
- Use sine and cosine functions with different frequencies

Properties
- Values bounded in [-1, 1]
- Unique representation per position
- Independent of sequence length
- Encodes relative distances naturally

Contextual Word Embeddings

Problem with Word2Vec / GloVe
- (almost) Context-independent embeddings
- Same word → same vector regardless of meaning
- Ignores:
  - Word order
  - Full sentence context

Goal
- Contextual embeddings:
  - Representation depends on surrounding words
  - Same word → different meanings in different contexts

Solution
- Attention-based models (Transformers)

Attention — Concept

Core Idea
- Words attend to other words in the sequence

Two Steps
1. Compute similarity between all word pairs
2. Update embeddings based on similarities

Result
- Each word representation becomes context-aware

Self-Attention

Definition
- Attention applied within the same sequence

Steps
1. Transform embeddings into:
   - Queries (Q)
   - Keys (K)
   - Values (V)
2. Compute similarity scores:
   - Dot product between Q and K
3. Normalize scores (Softmax)
4. Compute weighted sum of V

Outcome
- Each word embedding incorporates information from all other words

Generalized Attention — Scaled Dot-Product

Formula
- Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V

Components
- Q: query matrix
- K: key matrix
- V: value matrix
- d_k: dimension of key vectors

Purpose of Scaling
- Prevent large dot-product values
- Stabilize gradients during training

Attention Types

Self-Attention
- Same sequence (encoder + decoder)

Cross-Attention
- Different sequences
- Decoder attends to encoder outputs

Attention Head

Definition
- Single attention computation with its own parameters

Function
- Learns one type of relationship between words

Multi-Head Attention (MHA)

Motivation
- A word can have multiple relationships simultaneously

Mechanism
- Use multiple attention heads in parallel
- Each head learns different patterns

Steps
1. Project inputs into multiple Q, K, V spaces
2. Compute attention per head
3. Concatenate outputs
4. Apply linear transformation

Benefits
- Captures diverse relationships
- Improves representation power

Parameter
- Number of heads (h)

Feed Forward Layer

Structure
- Fully connected network applied independently to each position

Typical Form
- FFN(x) = max(0, xW1 + b1)W2 + b2

Purpose
- Increase model capacity
- Introduce non-linearity
- Acts like feature transformation

Encoder Layer

Components
1. Multi-Head Self-Attention
2. Feed Forward Network

Additional Mechanisms
- Residual connections
  - Helps gradient flow
- Layer normalization
  - Stabilizes training
- Dropout
  - Prevents overfitting

Stacking
- Multiple encoder layers stacked
- Output of one is input to next

Intuition
- Iteratively refine representations

Decoder Layer

Components
1. Masked Multi-Head Self-Attention
2. Cross-Attention (encoder-decoder attention)
3. Feed Forward Network

Key Difference from Encoder
- Uses two attention blocks:
  - Self-attention (with masking)
  - Cross-attention (attends to encoder output)

Masking

Purpose
- Prevent attention to invalid or unwanted positions

Types

Padding Mask
- Ignore padded tokens in batch

Masked Language Modeling (e.g., BERT)
- Randomly mask tokens
- Model predicts masked tokens

Causal Masking (e.g., GPT)
- Prevent access to future tokens
- Ensures autoregressive behavior

Masking in Transformer architecture
- Ignore alignments between selected word embedding pairs
- GPT Decoder: ignore alignments between output word w and input words preceding w
(also called "causal mask" or "do-not-look-ahead-mask")

Effect
- Masked positions get zero attention weight after softmax

Training Tasks

Classification
- Use encoder output
- Methods:
  - Average embeddings → FC layer (FCNN)
  - Use RNN/CNN on top
    - Feed encoder outputs into RNN (Convolutional Neural Network), pass last hidden state to fully connected neural network (FCNN)
    - Feed encoder outputs into CNN (Convolutional Neural Network), Flatten final outputs of last CNN layer, Pass flattened output to fully connected neural network (FCNN)
  - Use special token (e.g., CLS)

Sequence Labeling
- Predict label per token
- Pass outputs of encoder to fully connected neural network (FCNN)
- More complex setups possible
- Examples:
  - POS tagging
  - Named Entity Recognition

Training Transformers

Transformers are not easy to train
- Complex architecture in terms of number of trainable parameters/weights
- Typically require large datasets
- Typically require large computing infrastructure

Use pretrained encoder
- Common: transformer-based LLM (e.g., BERT, RoBERTa)
- Two training strategies
  - Freeze BERT encoder (i.e., do not update its weights)
  - Update BERT encoder weights as part of training

Text Generation

Encoder-Decoder
- Sequence-to-sequence tasks
- Examples:
  - Machine translation
  - Summarization

Decoder-Only
- Autoregressive generation
- Predict next token given previous tokens
- Used in modern LLMs

Attention — Computational Cost

Attentions is all you need…but it doesn't come for free
- Pro: no sequential processing required
  - easy parallelize
- Cons: number of operations for attention: N^2 (N = sequence length)

Problem
- Attention computes pairwise interactions
- Complexity: O(N^2), where N = sequence length

Implication
- Expensive for long sequences

Optimization Techniques

Restricted Attention
- Compute attention only for subset of tokens
- Main goal: make number of operations to be in O(N)

Sparse Attention
- Only selected connections of all N^2 attentions
- Examples: Longformer, BigBird

Linear Attention
- Approximate attention with lower–rank representation
- Examples: Linformer, Performer

Flash Attention
- Memory-efficient implementation
- Implementation optimization to avoid redundant computations
- Used in, e.g., GPT-4 and LLaMA-2

Selective Routing
- Attention only over most relevant tokens
- Examples: Reformer, Routing Transformer

Transformer Variants

Encoder-Only
- Tasks:
  - Classification
  - NER
  - Masked language modeling
- Examples:
  - BERT
  - RoBERTa

Encoder-Decoder
- Tasks:
  - Translation
  - Summarization
- Examples:
  - T5
  - BART

Decoder-Only
- Tasks:
  - Text generation
  - Language modeling
- Examples:
  - GPT series
  - LLaMA

Training Considerations

Challenges
- Large number of parameters
- Requires large datasets
- High computational cost

Solution
- Pretraining + fine-tuning

Strategies
- Freeze pretrained encoder
- Fine-tune entire model

Text Generation with Transformers
- Sequence-to-sequence tasks
  - Require complete encoder-decoder architecture
  - Examples: machine translation, text summarization, question answering, etc.

- Causal Language Modeling
  - Auto-regressive: next-word prediction task using decoder-only architecture
  - Self-supervised training: labels directly derived from data
  - Requires "do-not-look-ahead" masking
  - Basically all modern LLMs

Key Takeaways

- RNNs struggle with long sequences due to:
  - Gradient issues
  - Information bottleneck
  - Sequential computation

- Transformers solve this using:
  - Attention mechanism
  - Parallel processing
  - Positional encodings

- Attention enables:
  - Context-aware representations
  - Modeling long-range dependencies

- Transformer architecture is the foundation of:
  - Modern NLP systems
  - Large Language Models (LLMs)
Week 12
Transformer architecture — core ideas

- Encoder–decoder without recurrence or convolution  
- No sequential processing → enables parallel computation  
- No fixed bottleneck → better handling of long-range dependencies  

- Core mechanism: attention  
  - Alignment scores between all token pairs  
  - Representations updated via weighted combinations  

- Attention formula  
"""
attention(q, k, v) = softmax(qk^T / sqrt(d_k)) * v
"""

- Interpretation  
  - Q (query): what a token is looking for  
  - K (key): what each token offers  
  - V (value): actual information content  

- Process  
  - Compare q with all k → similarity scores  
  - Apply softmax → attention weights  
  - Compute weighted sum of v → contextual output  

- Key insight  
  - Attention = soft lookup over all tokens  

Important components

- Positional embeddings  
  - Preserve token order (attention is order-agnostic)  

- Masking  
  - Controls which tokens can attend  
  - Causal masking blocks access to future tokens  

LLM architecture types

- Encoder-only (BERT-like)  
  - Strength: bidirectional understanding  
  - Limitation: not generative  
  - Use: classification, tagging, extraction  

- Decoder-only (GPT-like)  
  - Strength: natural text generation  
  - Limitation: no full bidirectional context  
  - Use: chat, coding, generation  

- Encoder–decoder (T5, BART)  
  - Strength: input → output transformation  
  - Use: translation, summarization  

Observation: Decoder-only dominates!
- Simpler architecture & setup
- More cheaply to train (relatively)
- More suitable for text generation
- Good zero-shot generalization

BERT (Bidirectional Encoder Representations from Transformers)

- Encoder-only transformer  
- Self-supervised training  

- Objectives  
  - Masked language modeling (MLM): predict masked tokens  
  - Next sentence prediction (NSP): predict sentence order  

- Input format  
  - [CLS] sentence A [SEP] sentence B [SEP]  

- Input is encoded bidirectionally (not suitable for text generation)

RoBERTa (A Robustly Optimized Bidirectional Encoder Representations from Transformers)

- Scaled-up BERT
- Same architecture, similar training setup (MLM only)
- Removes NSP
- Uses dynamic masking (during training)
- Trained longer on more data

- Variants  
  - DistilBERT  
  - ALBERT  

T5 (Text-to-Text Transfer Transformer)

- Encoder–decoder architecture
- Multi-task learning: model training on multiple tasks simultaneously
- All tasks framed as text-to-text to match the encoder–decoder architecture

- Key idea
  - Unify all tasks into a single format  

- Evaluation
  - The authors evaluated multi-task learning approach for different architectures
  - Best results: encoder–decoder architecture

BART (Bidirectional and Auto-Regressive Transformers)

- Basic encoder–decoder Transformer architecture with denoising objective  

- Training (Denoising)
  - Corrupt input text  
  - Reconstruct original text
- Various transformation techniques to corrupt input documents

- Arbitrary noise transformation (not just BERT-like masking)
- Bidirectional encoding + auto-regression word prediction

- Combines  
  - BERT (encoding)  
  - GPT (decoding)  

BART ≈ BERT + GPT

GPT

- Decoder-only transformer  
- Self-supervised training
- Trained with causal language modeling  
- Auto-regressively word prediction (suitable for text generation)
- Words can only condition on leftward context (cannot learn bidirectional interactions)

(Very) oversimplified history of GPT
- GPT-1/2/3: text only, “just” making it larger; GPT-4: multimodal
- GPT-3+: reinforcement learning from human feedback (RLHF)

- Objective  

"""
p(x1, ..., xn) = product p(xt | x1...xt-1)
"""

- Training vs inference  
  - Training: parallel with masking  
  - Inference: sequential generation  

- Key insight  
  - Masking is a training trick, not needed during inference  

RLHF (reinforcement learning from human feedback)

- Methods
  - Fine-tune on human responses  
  - Generate multiple response for same prompt; human ranks response; use ranking for fine-tuning  

- Improves  
  - Helpfulness  
  - Alignment  

- Does not fully fix  
  - Hallucinations  
  - Reasoning  

- Insight  
  - Shapes behavior more than knowledge  

LLaMA design choices

Decoder-only architecture (very similar to GPT)

- Pre-normalization
  - Layer normalization is put inside the residual blocks
  - Stabilizes gradients
  - Enables faster training

- Pre-normalization vs Post-normalization
  - Post: layer normalization between residual blocks (original transformer)
  - Pre: layer normalization inside residual blocks (LLaMA, etc.)
  - Observed benefit of pre-normalization:
    - Well-behaved gradients at initialization
    - Significantly faster training

- SwiGLU activation
  - GLU – Gated Linear Unit (paper)
    - Gating proposed in LSTM paper (1997!)
    - Parameterized activation function
    - Many other variants proposed
  - Swish
    - Simple parameterized activation function
    - Approach: "try and see what works best"

  - More expressive than ReLU
  - Non-monotonic, parameterized activation function

- RoPE (rotary positional embeddings)  
  - Encode word positions by rotating word embedding vectors
  - Better handling of long context

Open LLM
- Trained exclusively on publicly available data

Why transformers scale

- Parallelism  
  - All tokens processed simultaneously  

- Global context  
  - Every token attends to every other token  

- Scaling laws  
  - Performance improves with  
    - More data  
    - Larger models  
    - More compute  

- Limitation  
  - Diminishing returns and high cost  

Data challenges

- Noisy data  
  - Irrelevant data
    - Common source for training data: web content
    - Web content = useful content + irrelevant data (e.g., HTML markup, header, footer, navigation, ads)
  - Low-quality data  
    - Lack of quality control  
    - GPT-2 approach: crowdsourcing of quality control

- Duplicate data  
  - Common occurrences when using Web crawls for training (e.g., online newspapers using the same content provided by news agencies)
  - Slower training  
  - Risk of memorization  

- Data deduplication  
  - Not obvious what a duplicate is and resource-intensive  

- Common evaluation setup:
  - Hyperparameter tuning based on training data and validation data
- Evaluation with separate test data

- Data contamination
  - Overlap between training and test data
    - Often not clear with which data a non-public LLM was trained on
  - No guarantees that a test dataset was not part of the initial training data
  - GPT-2 approach: Remove Wikipedia documents from training data (assumption: Wikipedia documents are often used for evaluation)

- Toxicity and bias
  - Problem: “improper” content
    - Misinformation, disinformation, fake news
    - Biased reporting, hate speech, propaganda
    - Racism, sexism, classism, ageism, etc.
  - How to identify toxicity and biases?
    - Rely on content from trusted sources (e.g., popular news sites, professional institutions)
    - Crowdsource quality control (e.g., Reddit post with minimum Karma)

- PII Control (Personally Identifiable Information Control)
  - Problem: sensitive information in training data
    - PII: Personally Identifiable Information (name, address, phone number, social security numbers, etc.)
    - Other privacy-sensitive information (health, location, sexual orientation, political leaning, etc.
  - Privacy risks

Training an LLM — Goals & Scope

- Training of a "toy LLM"
  - Small datasets from a single domain (100,000 movie reviews)
  - Small model: reduced number of heads, layers, and model size
- Advantages
  - Easy to run even on a CPU for education purposes
  - If GPU available, a decent consumer GPU sufficient (should also run fairly well on Google Colab, etc.)
  - Whole datasets fits into memory (no complex strategies needed, no need for parallelization, etc.)
- Disadvantage: no rival to ChatGPT, LLaMA, Gemini, Mistral, etc…duh! :)

Data Preparation Pipeline

- Generation of Document Stream  
  - Common setup to train LLMs
  - Training data treated as in single very long string of tokens (documents a separated by special marker token)
    - doc_1 + [EOS] + doc_2 + [EOS] + doc_3 + [EOS] + …
- Implementation
  - Loop over all movie review
  - Tokenize review (here: using pretrained tokenizer)
  - Append special separator token
  - Concatenate review to document stream

- Sliding window approach with overlap – 2 parameters
  - Context / window size
  - Overlap between contexts

- Overlap  
  - Preserves continuity  
  - Increases computation  

Implementation
- Use Dataset and DataLoader class of PyTorch
- Dataset class also computes targets sequences (recall: same as input sequences just shited 1 token to the left)
- Smooth integration into training process (simplifies batching, shuffling, parallelization)

Training an LLM — Model Definition
- Positional Encoding
  - Absolute positional encoding using sinusoidal functions (mimicking the original Transformer paper)
  - Implementation from scratch using PyTorch
- Transformer Decoder
  - Implementation using only PyTorch classes
  - Setup: encoder + causal masking (the decoder class expects encoder output as input!)
  - Integration of Positional Encoding
  - forward() method for training
  - generate() method for inference

Cloud-Based APIs
- API (Application Programming Interface)
  - Set of rules & protocols that allows software applications to communicate and interact with each other
  - Here: Let your code talk to an LLM via an API
  - Common: Wrapper libraries to ease API use ➜ API calls just look like function calls
- Cloud-based APIs
  - API for communicating and interacting with cloud services
  - Popular LLM APIs: OpenAI, Google, Anthropic, Deepseek, etc.
  - Common requirement: access credentials for billing, rate limitation, personalization

Cloud-Based APIs
- Minimal working example
  - Python code
  - OpenAI API
  - OpenAI Python library
- Advantages
  - Immediate access to state-of-the-art models
  - Ease of use and integration
  - High performance and optimization (no need for own high-end hardware, e.g., GPU clusters)
  - Security, compliance, and reliability
  - Extensive ecosystem and tooling
  - Ethical and Policy Constraints
  - Lower barrier to entry
- Limitations & challenges
  - Limited customization and control
  - Data privacy and security
  - Cost and Scalability
  - Network latency and rate limits
  - Dependence on service provider
  - Ethical and Policy Constraints

Running LLMs Locally
- (Public) pretrained LLMs
  - LLMs trained by companies or organizations and made (freely) available for download
  - Training of models typically beyond the resources of individual or small organizations or teams (but anyone can share models)
  - Standardized interfaces for downloading and running models on local hardware
  - Models is various sizes and capacities (or customized for special tasks)
- Advantages
  - Data privacy and security
  - Full control and customization
  - Predictable costs (potentially lower in the long term)
  - Low latency and offline capability
  - Integration and infrastructure flexibility
- Limitations & challenges
  - High hardware and setup costs
  - Limited access to frontier models
  - Complex setup and maintenance
  - Performance and memory constraints

Training vs inference

- Training requires  
  - Activations  
  - Gradients  
  - Optimizer states  

- Inference  
  - Forward pass only  

- Rule of thumb  
  - Training uses significantly more memory  

Prompt engineering

- Definition: Prompt
  - Natural language text describing the task that an AI (model) should perform
  - More commonly: input/instruction to an LLM
- Prompt = natural language instruction  

Definition: Prompt Engineering
- The practice of designing / refining / structuring prompts to elicit specific responses from an LLM (or other AI models)
- Does not affect the LLM in terms of changing any pretrained weights
- Reflects: “garbage in, garbage out”

- Goals  
  - Reduce ambiguity  
  - Constrain output space  
  - Guide behavior  

- Best practices  
  - Use the latest model
  - Put instructions at the beginning of the prompt and clearly separate instructions and prompt
  - Be specific, descriptive and as detailed as possible (about the desired context, outcome, length, format, style, etc.)
  - Articulate the desired output format through examples
  - Start with zero-shot, then few-shot (if all fails: fine-tune)
  - Reduce “fluffy” and imprecise descriptions
  - Instead of saying what not to do, say what to do instead
  - Code Generation Specific – use “leading words” to nudge the model toward a particular pattern

Prompt Engineering
- Wide range of approaches
  - Common goal: systematic design of prompts to ensure (or avoid!) certain behavior of LLM
- Different goals
  - “Enforce” reasoning
  - Reduce hallucinations
  - Ensure consistent output format
  - Self-Reflection / Self-Monitoring

Prompt Engineering — X-Shot Prompts
- Zero-shot prompts
  - Prompt without task-specific examples
  - Sufficient if task is “self-explanatory”
- One-shot prompts
  - Prompt contains single task-specific example
  - For tasks requiring a specific format or context (e.g., return output in predefined HTML/JSON/etc.)
- Few-shot prompts ➜ In-Context Learning
  - Prompt contains multiple, task-specific examples
  - Required for more complex task to provide sufficient content and guidance to the LLM

In-context learning (ICL)

Basic few-shot setup
  - No training of LLM ➜ emergent abilities! (capabilities to perform task LLM was not explicitly trained for)
    - No parameter updates  
  - Perform a new task via inference alone (e.g., task on the right: sentiment analysis)
  - Conditioning on a few demonstrations (i.e., input–label pairs)
  - Making predictions for new inputs

Why does ICL work?
- No parameter update ➜ no “real” learning
- Intuition: demonstrations help to “locate” latent concepts acquired during pre-training
- Hypothesis
  - Examples activate latent knowledge  

- Observations  
  - Correctness of demo labels sometimes less important  
    - Demonstrations with incorrect labels better than no demonstrations!
  - More demos help except beyond some threshold
  - Relevance matters most  
    - Experiment setup: replace inputs of demonstrations with random sentences of the training data
  - Label space matter
    - Experiment setup: replace label of demonstrations with random words  
  - Order of demos + distribution of labels matters
    - Experiment setup: vary order of demonstration + balanced (i.e., equal number of positive and negative labels) vs imbalanced demonstrations
    - Result below: recency bias + majority labels more likely to win

- In-Context Learning Insight  
  - Cost-effective way to improve outputs of LLMs (no training!)
  - Relies on emergent capabilities of LLMs ➜ not well understood
  - Experimental results dependent on many factors and even conflicting

The Future of Large Language Models — Opportunities
- Language models are an old idea — What changed?
  - New architectures (here: Transformers)
  - More computing power
  - More and diverse data
  - More resources (i.e., money, manpower)
  ➜ Exploding size/scale of models

Size of models has crossed some kind of threshold ➜ LLMs show Emergent Abilities
- Abilities that were not explicitly programmed into the model but emerge from the training process

The Future of Large Language Models — Opportunities
- Emergent abilities
  - Language Generation (coherent and fluent text in a variety of styles and genres, from news articles to poetry)
  - Question Answering (answering complex questions by extracting information from large amounts of text data)
  - Translation (translating text between different languages with high accuracy)
  - Summarization (generate concise summaries of long documents, allowing for efficient information extraction and consumption)
  - Dialogue Generation (engage in natural and coherent conversations with humans)
  - Common Sense Reasoning (basic degree of common sense reasoning; predicting outcome of simple scenarios)
  ➜ Question: Can a language model really do these tasks? Why does this all seem to work?

Training LLMs
- Training an LLM from scratch – requirements
  - Huge amounts of good/clean/etc. training data
  - Huge amounts of computing resources (includes infrastructure as well as energy consumption)
    - Prohibitively expensive for individuals / small teams
    - Limited to large companies / organizations

Running LLMs
- Inferencing: generating responses
  - Full model used for each inference
  - Main factor: number of tokens generated
  - Other factors: models size and model type (model type: encoder-only, encoder–decoder, decoder-only)
  - Comparison: ~0.0003 kWh per Google Search (150x cheaper than text generation using LLMs)

Prompt sensitivity

- Small changes → large output differences  

- Causes  
  - Ambiguity  
  - Recency bias  
  - Distributional shifts  

- Implication  
  - Models are context-sensitive  

Hallucinations

- Cause  
  - Optimized for likelihood, not truth  

- Factors  
  - No fact-checking  
  - Overgeneralization  

- Insight  
  - Natural consequence of training objective  

Alignment

- Goal  
  - Helpful, safe, honest outputs  

- Trade-offs  
  - Helpful vs safe  
  - Truthful vs polite  
  - Accurate vs harmless  

- Insight  
  - Alignment is a balancing act  

Misinformation, Disinformation, Fake News
- Fake news “for free”
  - Text that reads like genuine news
  - “Better” spam emails
  - Convincing social media bots

Jailbreaking

- Prompt-based Jailbreaking
  - Most LLM companies perform some form of content moderation do not produce controversial responses (violent, sexual, illegal, etc. content)
  - Find prompts to bypass safeguards
  - Common approach: pretending (e.g., functional or hypothetical questions)

Cost considerations

- Training  
  - High one-time cost  

- Inference  
  - Recurring cost  

- Key driver  
  - Number of tokens generated  

Core intuition

- LLMs do not truly understand language  
- They learn statistical patterns over tokens  

- Mental model  
  - Next-token predictor conditioned on context  

- Strengths  
  - Fluency  
  - Generalization  

- Weaknesses  
  - Hallucinations  
  - Brittleness  

Final perspective

- LLMs are  
  - Powerful (scale + data)  
  - Fragile (probabilistic nature)  
  - Expensive (compute demands)  

- Practical mindset  
  - Treat as a capable assistant  
    - Broad exposure  
    - No guaranteed correctness  
    - High sensitivity to prompts  

  - Good use → amplifies you  
  - Blind use → produces errors  
