"""
AI Services for feedback generation, plagiarism detection, and scoring
"""
import os
import re
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import importlib.metadata as stdlib_metadata
except ImportError:
    stdlib_metadata = None

try:
    import importlib_metadata as backport_metadata
except ImportError:
    backport_metadata = None

if (
    stdlib_metadata
    and backport_metadata
    and not hasattr(stdlib_metadata, "packages_distributions")
    and hasattr(backport_metadata, "packages_distributions")
):
    stdlib_metadata.packages_distributions = backport_metadata.packages_distributions

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMER_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMER_AVAILABLE = False

class AIService:
    """Service for AI-powered feedback and analysis"""
    
    # Default template for code / programming submissions
    _FEEDBACK_TEMPLATE = """You are a **STRICT PROFESSIONAL PROGRAMMING PROFESSOR** with 20+ years experience. Your job is to identify EVERY flaw, bug, and weakness in student code. **NO COMPROMISES ON QUALITY.**

{task_section}{files_section}
{content}

**MANDATORY STRICT EVALUATION CRITERIA:**
1. **FUNCTIONAL CORRECTNESS** - Does it work EXACTLY as specified? Test edge cases mentally.
2. **REQUIREMENTS COMPLIANCE** - Every single requirement MUST be implemented correctly.
3. **CODE QUALITY** - Professional standards ONLY. No excuses for poor naming, structure, or style.
4. **EFFICIENCY** - No unnecessary operations, loops, or memory usage.
5. **ERROR HANDLING** - Must handle ALL possible errors gracefully.
6. **TESTABILITY** - Code must be easily unit testable.

**BE BRUTALLY HONEST:**
- **Zero tolerance** for bugs, logic errors, or incorrect implementations
- **Call out** every single missing requirement
- **No credit** for partial solutions
- **Flag** copy-pasted code, anti-patterns, or bad practices
- **Demand** professional naming (no `x`, `temp`, `i` unless absolutely justified)

**Format EXACTLY like this (NO DEVIATIONS):**

**🚨 EXECUTIVE SUMMARY**  
• Overall grade: **A/B/C/D/F** (be honest, no grade inflation)  
• **Critical verdict**: Pass/Fail with justification  
• Primary failure mode or success factor  

**✅ STRENGTHS** (Only if genuinely excellent, max 3)  
• Specific code reference → Why it's excellent  
• Specific code reference → Professional quality  
• Specific code reference → Exceeds requirements  

**🚨 CRITICAL FAILURES** (MANDATORY - list ALL bugs)  
• **LINE XX**: Exact bug description → Expected vs Actual  
• **FUNCTION xyz**: Logic error → Fix required  
• **ALGORITHM**: Wrong approach → Correct algorithm needed  
• **MISSING**: Required feature X not implemented  

**📋 REQUIREMENTS VERIFICATION** (Check EVERY requirement)  
• **REQ1**: [✓ PASS / ✗ FAIL] → Evidence or missing proof  
• **REQ2**: [✓ PASS / ✗ FAIL] → Evidence or missing proof  
• **REQ3**: [✓ PASS / ✗ FAIL] → Evidence or missing proof  
• ... (ALL requirements must be listed)  

**⚠️ CODE QUALITY VIOLATIONS**  
• **Naming**: Unprofessional variable/function names  
• **Structure**: Poor organization/refactoring needed  
• **Style**: Violates PEP8/standards  
• **Security**: Vulnerabilities present  
• **Performance**: Inefficient implementation  

**🔧 IMMEDIATE FIXES REQUIRED** (Prioritized #1-#5)  
1. **CRITICAL**: Fix bug in [exact location] → [exact code replacement]  
2. **CRITICAL**: Implement missing [feature] → [code template]  
3. **HIGH**: Refactor [function] → [better approach]  
4. **MEDIUM**: Fix naming → [professional names]  
5. **LOW**: Add [documentation/tests]  

**📚 NEXT STEPS** (Student must complete ALL)  
• [ ] Fix ALL critical bugs from 🚨 section  
• [ ] Implement ALL missing requirements  
• [ ] Refactor code per 🔧 section  
• [ ] Add comprehensive unit tests  
• [ ] Resubmit for re-grading  

**Final Grade: [A/B/C/D/F] - [Justification]**"""

    # Gentler template for essays / written assignments (no harsh language, no auto-F)
    _FEEDBACK_TEMPLATE_ESSAY = """You are a supportive writing instructor. Give **clear, respectful, and specific** feedback on the student's writing.

{task_section}

**STUDENT WRITING:**  
{content}

Format your response using these sections:

**SUMMARY**  
• 2–3 sentences explaining what the student wrote and the overall impression (no grades, no insults).

**STRENGTHS**  
• Point out specific things that work well (ideas, structure, clarity, examples).  
• Quote short phrases when helpful.

**AREAS TO IMPROVE**  
• Explain clearly what is confusing, missing, or weak.  
• Focus on the writing itself (organization, clarity, evidence, tone), **not** on making fun of the topic.  
• Do **not** assume the assignment is wrong or silly; treat it as a normal school task.

**SUGGESTIONS**  
• Give 3–5 concrete, kind suggestions the student can actually follow (e.g., “add a clear thesis sentence”, “combine shorter sentences”, “add one example”).  
• Where possible, show a short example rewrite instead of just saying “improve this”.

Do **not** use jokes like “fail with extreme prejudice” or insult the student. Be honest but always respectful and encouraging."""

    _TASK_SECTION_TEMPLATE = """**ASSIGNMENT SPECIFICATION** (ALL requirements are MANDATORY):

{task_description}

**FAILURE CONDITIONS** (automatic F grade):
- Missing ANY requirement
- Any runtime errors or crashes
- Incorrect core algorithm/logic
- No error handling
- Hard-coded values instead of parameters

**PASSING REQUIREMENTS** (ALL must be ✓):
- 100% functional correctness
- Professional code quality
- Complete error handling
- Clean, readable, maintainable code
"""

    _FILE_SECTION_TEMPLATE = "\n**MULTIPLE FILES SUBMISSION:**\n{files}\n"
    _SINGLE_FILE_SECTION = "\n**STUDENT SUBMISSION:**\n```python\n"
    
    _BULLET_PATTERNS = [
        (re.compile(r'^-\s+', re.MULTILINE), '• '),
        (re.compile(r'^\*\s+', re.MULTILINE), '• '),
    ]
    _SCORING_PATTERNS = {
        'function': re.compile(r'\b(def|function)\b', re.IGNORECASE),
        'return': re.compile(r'\breturn\b'),
        'import': re.compile(r'\b(import|require)\b', re.IGNORECASE),
        'comments': re.compile(r'[#/]'),
        'spacing': re.compile(r'\n\s*\n'),
        'naming': re.compile(r'[a-z][A-Z]'),
    }
    _PLAGIARISM_PATTERNS = [
        re.compile(r'copy.*paste', re.IGNORECASE),
        re.compile(r'from.*website', re.IGNORECASE),
        re.compile(r'found.*online', re.IGNORECASE),
    ]
    
    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        self.use_gemini = self.gemini_api_key is not None and GEMINI_AVAILABLE
        
        if self.use_gemini:
            try:
                genai.configure(api_key=self.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
            except Exception:
                self.use_gemini = False
        
        self.similarity_model = None
        self._similarity_model_loaded = False
    
    def _generate_fallback_feedback(
        self,
        content: str,
        submission_type: str = 'code',
        task_description: str = '',
        files: Optional[List[Dict]] = None
    ) -> str:
        """Generate intelligent fallback feedback using rule-based analysis"""
        lines = content.split('\n')
        code_length = len(lines)
        word_count = len(content.split())
        
        # Analyze code structure
        has_functions = bool(re.search(r'\b(def|function|class)\b', content, re.IGNORECASE))
        has_comments = bool(re.search(r'[#/]', content))
        has_returns = bool(re.search(r'\breturn\b', content))
        has_imports = bool(re.search(r'\b(import|require|from)\b', content, re.IGNORECASE))
        
        # Generate intelligent feedback
        feedback_parts = []
        
        # Executive Summary
        quality_score = 0.0
        if code_length > 50: quality_score += 0.3
        if has_functions: quality_score += 0.2
        if has_returns: quality_score += 0.2
        if has_imports: quality_score += 0.1
        if has_comments: quality_score += 0.2
        
        grade = 'A' if quality_score >= 0.8 else 'B' if quality_score >= 0.6 else 'C' if quality_score >= 0.4 else 'D'
        
        feedback_parts.append(f"**🚨 EXECUTIVE SUMMARY**")
        feedback_parts.append(f"• Overall grade: **{grade}**")
        feedback_parts.append(f"• **Critical verdict**: {'Pass' if quality_score >= 0.5 else 'Needs Improvement'}")
        feedback_parts.append(f"• Code length: {code_length} lines, {word_count} words")
        feedback_parts.append("")
        
        # Strengths
        if has_functions or code_length > 30:
            feedback_parts.append("**✅ STRENGTHS**")
            if has_functions:
                feedback_parts.append("• Code is organized with functions/classes")
            if code_length > 30:
                feedback_parts.append("• Substantial implementation provided")
            if has_imports:
                feedback_parts.append("• Uses external libraries/modules appropriately")
            feedback_parts.append("")
        
        # Recommendations
        feedback_parts.append("**📋 REQUIREMENTS VERIFICATION**")
        feedback_parts.append("• **Code Structure**: ✓ PASS" if has_functions else "• **Code Structure**: ✗ FAIL - Add functions/classes")
        feedback_parts.append("• **Documentation**: " + ("✓ PASS" if has_comments else "✗ FAIL - Add comments"))
        feedback_parts.append("• **Completeness**: " + ("✓ PASS" if code_length > 20 else "✗ FAIL - Expand implementation"))
        feedback_parts.append("")
        
        feedback_parts.append("**🔧 IMMEDIATE FIXES REQUIRED**")
        if not has_comments:
            feedback_parts.append("1. **HIGH**: Add code comments explaining logic")
        if not has_functions and code_length > 10:
            feedback_parts.append("2. **HIGH**: Refactor into functions for better organization")
        if code_length < 20:
            feedback_parts.append("3. **MEDIUM**: Expand implementation with more details")
        feedback_parts.append("")
        
        feedback_parts.append("**📚 NEXT STEPS**")
        feedback_parts.append("• [ ] Review and add documentation")
        feedback_parts.append("• [ ] Test all functionality thoroughly")
        feedback_parts.append("• [ ] Ensure error handling is present")
        feedback_parts.append("• [ ] Resubmit for re-grading")
        feedback_parts.append("")
        feedback_parts.append(f"**Final Grade: {grade} - Based on code structure and completeness analysis**")
        
        return "\n".join(feedback_parts)
    
    def generate_feedback(
        self, 
        content: str, 
        submission_type: str = 'code', 
        task_description: str = '', 
        files: Optional[List[Dict]] = None
    ) -> str:
        """Generate AI feedback using Gemini API with intelligent fallback"""
        
        # Try Gemini API first if available
        if self.use_gemini:
            try:
                prompt = self._build_feedback_prompt(content, submission_type, task_description, files)
                response = self.model.generate_content(
                    prompt,
                    generation_config={
                        'max_output_tokens': 3000,
                        'temperature': 0.3,
                    }
                )
                feedback = response.text.strip()
                return self._format_feedback(feedback)
            except Exception:
                pass  # Silently use fallback
        
        # Use intelligent fallback
        return self._generate_fallback_feedback(content, submission_type, task_description, files)
    
    def _build_feedback_prompt(
        self, 
        content: str, 
        submission_type: str = 'code',
        task_description: str = '', 
        files: Optional[List[Dict]] = None
    ) -> str:
        """Build optimized prompt for Gemini, adapting to submission type"""
        
        task_section = ""
        if task_description and task_description.strip():
            task_section = self._TASK_SECTION_TEMPLATE.format(task_description=task_description)
        
        if files and len(files) > 0:
            files_list = []
            for idx, f in enumerate(files, 1):
                filename = f.get('filename', f'file_{idx}')
                file_content = f.get('content', '')
                files_list.append(f"**FILE {idx}: {filename}**\n```python\n{file_content}\n```\n")
            files_section = self._FILE_SECTION_TEMPLATE.format(files='\n'.join(files_list))
        else:
            files_section = self._SINGLE_FILE_SECTION + content + "\n```"

        # Choose template based on submission type
        submission_type_normalized = (submission_type or 'code').lower()
        if submission_type_normalized in ('essay', 'report', 'reflection', 'research-paper', 'case-study'):
            template = self._FEEDBACK_TEMPLATE_ESSAY
            return template.format(
                task_section=task_section,
                content=content,
            )
        else:
            return self._FEEDBACK_TEMPLATE.format(
                task_section=task_section,
                files_section=files_section,
                content=content
            )
    
    def _format_feedback(self, feedback: str) -> str:
        """Format feedback to ensure consistent structure using pre-compiled patterns"""
        for pattern, replacement in self._BULLET_PATTERNS:
            feedback = pattern.sub(replacement, feedback)
        return feedback
    
    def score_correctness(self, content: str) -> float:
        """Score correctness/functionality (0.0 to 1.0) using optimized patterns"""
        score = 0.3  # Start lower for strictness
        
        if self._SCORING_PATTERNS['function'].search(content):
            score += 0.25
        if self._SCORING_PATTERNS['return'].search(content):
            score += 0.15
        if self._SCORING_PATTERNS['import'].search(content):
            score += 0.1
        if len(content) > 200:  # Higher threshold
            score += 0.2
        
        return min(1.0, score)
    
    def score_quality(self, content: str) -> float:
        """Score code quality/style (0.0 to 1.0) using optimized patterns"""
        score = 0.3  # Start lower for strictness
        
        if len(re.findall(r'#', content)) > 3:  # More comments required
            score += 0.2
        if len(self._SCORING_PATTERNS['spacing'].findall(content)) > 5:  # Better spacing
            score += 0.15
        
        lines = content.split('\n')
        if len(lines) > 10:
            score += 0.2
        if not self._SCORING_PATTERNS['naming'].search(content):  # No camelCase (good!)
            score += 0.15
        
        return min(1.0, score)
    
    def score_completeness(self, content: str) -> float:
        """Score completeness (0.0 to 1.0) - stricter thresholds"""
        lines = content.split('\n')
        word_count = len(re.findall(r'\b\w+\b', content))
        line_count = len([line for line in lines if line.strip()])
        
        word_score = min(1.0, word_count / 300)  # Stricter
        line_score = min(1.0, line_count / 30)   # Stricter
        
        return (word_score * 0.6 + line_score * 0.4)  # Weight lines more
    
    def check_plagiarism(self, content: str, threshold: float = 0.7) -> Dict:  # Lower threshold = stricter
        """Check for plagiarism using pre-compiled patterns and semantic similarity"""
        found_patterns = [
            pattern for pattern in self._PLAGIARISM_PATTERNS 
            if pattern.search(content)
        ]
        
        # Stricter scoring
        similarity_score = 0.9 if found_patterns else 0.6  # Higher baseline suspicion
        is_plagiarized = similarity_score > threshold
        
        return {
            'is_plagiarized': is_plagiarized,
            'similarity_score': similarity_score,
            'confidence': 0.95 if is_plagiarized else 0.7,
            'message': (
                '**🚨 PLAGIARISM DETECTED** - Automatic F grade. Original work required.'
                if is_plagiarized 
                else '**⚠️  Plagiarism check passed** - but code quality still determines grade.'
            ),
            'suggestions': [
                'ALL work must be 100% original',
                'No copy-paste from ANY source',
                'Explain your solution in your own words',
                'Academic dishonesty = course failure'
            ] if is_plagiarized else []
        }
    
    def _generate_fallback_flashcards(self, topic: str, count: int = 25) -> List[Dict]:
        """Generate enhanced fallback flashcards when AI service is unavailable"""
        import random
        
        # Enhanced templates for better quality fallbacks
        question_templates = [
            f"What is {{concept}} in {topic}?",
            f"How does {{concept}} work in {topic}?",
            f"Explain the importance of {{concept}} in {topic}.",
            f"What are the key characteristics of {{concept}}?",
            f"Describe the relationship between {{concept1}} and {{concept2}}.",
            f"What is the difference between {{concept1}} and {{concept2}}?",
            f"When should you use {{concept}}?",
            f"What are the advantages of {{concept}}?",
            f"What are the limitations of {{concept}}?",
            f"How do you implement {{concept}}?",
        ]
        
        answer_templates = [
            "{concept} is a fundamental concept in {topic} that involves...",
            "{concept} works by...",
            "The importance of {concept} lies in...",
            "Key characteristics include...",
            "The relationship shows that...",
            "The main difference is...",
            "You should use {concept} when...",
            "Advantages include...",
            "Limitations include...",
            "To implement, you need to...",
        ]
        
        # Generate concept variations based on topic
        topic_words = topic.lower().replace(',', ' ').split()
        concepts = topic_words + [word + ' concepts' for word in topic_words[:3]] + ['core principles', 'fundamentals', 'best practices']
        
        flashcards = []
        used_combinations = set()
        
        for i in range(count):
            # Avoid exact duplicates
            attempts = 0
            while attempts < 50:
                if len(concepts) >= 2:
                    concept1 = random.choice(concepts)
                    concept2 = random.choice([c for c in concepts if c != concept1])
                    combo = (concept1, concept2)
                else:
                    concept1 = random.choice(concepts)
                    concept2 = concept1
                    combo = (concept1,)
                
                if combo not in used_combinations:
                    used_combinations.add(combo)
                    break
                attempts += 1
            
            q_template = random.choice(question_templates)
            a_template = random.choice(answer_templates)
            
            try:
                if '{concept1}' in q_template and '{concept2}' in q_template:
                    front = q_template.format(concept1=concept1, concept2=concept2, topic=topic)
                    back = a_template.format(concept1=concept1, concept2=concept2, topic=topic, concept=concept1)
                else:
                    front = q_template.format(concept=concept1, topic=topic)
                    back = a_template.format(concept=concept1, topic=topic)
            except:
                front = f"Question {i+1}: Explain {concept1} in {topic}?"
                back = f"{concept1} is an important aspect of {topic}. It involves key concepts and principles that help understand the topic better."
            
            flashcards.append({
                'front': front,
                'back': back,
                'category': topic.lower()
            })
        
        return flashcards
    
    def generate_flashcards(self, topic: str, count: int = 25) -> List[Dict]:
        """Generate flashcards for a topic using AI with intelligent fallback"""
        if not self.use_gemini:
            return self._generate_fallback_flashcards(topic, count)
        
        try:
            coding_keywords = ['code', 'programming', 'python', 'javascript', 'java', 'c++', 'function', 'algorithm', 'refactor', 'debug', 'syntax', 'variable', 'loop', 'array', 'class', 'object', 'api', 'database', 'sql', 'html', 'css', 'react', 'flask', 'django']
            is_coding_topic = any(keyword in topic.lower() for keyword in coding_keywords)
            
            if is_coding_topic:
                prompt = f"""You are a **STRICT PROFESSOR** creating {count} **exam-level** programming flashcards for "{topic}".

**MANDATORY REQUIREMENTS:**
- **EXACTLY {count} flashcards** - NO MORE, NO LESS
- **Difficulty**: College-level, professional interview standard
- **Format**: JSON array only

**FLASHCARD TYPES REQUIRED** (distribute evenly):
1. **BUG HUNTING** (30%): Show broken code → "Find and fix ALL bugs"
2. **ALGORITHM CHALLENGE** (30%): "Implement [algorithm] correctly"
3. **CODE REVIEW** (20%): Anti-pattern code → "Refactor to professional standard"  
4. **CONCEPT MASTERY** (10%): Tricky theory questions
5. **EDGE CASES** (10%): "What happens when...?"

**STRICT FORMATTING:**
Return ONLY a JSON array with exactly {count} items:
[
  {{
    "front": "🚨 QUESTION: [Clear question with code if applicable]",
    "back": "✅ CORRECT ANSWER: [Complete solution + explanation why other approaches fail]",
    "category": "{topic.lower()}"
  }},
  ...
]

Make sure to include markdown code blocks in both front and back when dealing with code."""
            else:
                prompt = f"""Generate exactly {count} educational flashcards about "{topic}".

IMPORTANT: You must generate exactly {count} flashcards. No more, no less.

Each flashcard should have:
- front: A clear question or prompt
- back: A detailed answer or explanation
- category: "{topic.lower()}"

Return as JSON array with exactly {count} items:
[
  {{"front": "question", "back": "answer", "category": "{topic.lower()}"}},
  ...
]

Make questions diverse and educational. Include both conceptual and practical questions."""
            
            # Use the configured model instance
            if not hasattr(self, 'model') or self.model is None:
                raise Exception("Gemini model not initialized")
            
            response = self.model.generate_content(prompt)
            
            # Parse response
            import json
            import re
            text = response.text.strip()
            # Extract JSON from markdown code blocks if present
            json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            
            flashcards = json.loads(text)
            if not isinstance(flashcards, list):
                flashcards = [flashcards]
            
            # Ensure we have exactly the requested count
            if len(flashcards) < count:
                # If we got fewer, generate more
                remaining = count - len(flashcards)
                additional_prompt = f"""Generate {remaining} more flashcards about "{topic}" to complete a set of {count} flashcards. Return as JSON array."""
                try:
                    additional_response = self.model.generate_content(additional_prompt)
                    additional_text = additional_response.text.strip()
                    json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', additional_text, re.DOTALL)
                    if json_match:
                        additional_text = json_match.group(1)
                    additional_flashcards = json.loads(additional_text)
                    if isinstance(additional_flashcards, list):
                        flashcards.extend(additional_flashcards)
                except Exception:
                    pass
            
            # Return exactly the requested count
            result = flashcards[:count]
            return result
        except Exception:
            # Silently use fallback for any errors
            return self._generate_fallback_flashcards(topic, count)
    
    def _generate_fallback_tutor_response(self, question: str, context: str = '') -> str:
        """Generate intelligent fallback tutor response"""
        question_lower = question.lower()
        
        # Pattern matching for common programming questions
        if any(word in question_lower for word in ['error', 'bug', 'not working', 'wrong', 'problem']):
            return """I can help you debug! Here are some common troubleshooting steps:

1. **Check Error Messages**: Read the full error message - it usually tells you what's wrong
2. **Review Your Code**: Look for typos, missing parentheses, brackets, or quotes
3. **Test Incrementally**: Break your code into small parts and test each part
4. **Use Print Statements**: Add print() or console.log() to see what values your variables have
5. **Check Documentation**: Look up the functions/APIs you're using in official docs

If you can share the specific error message or code snippet, I can provide more targeted help!"""
        
        elif any(word in question_lower for word in ['how', 'explain', 'what is', 'tell me about']):
            return f"""Great question! Let me explain this concept:

Based on your question about "{question[:50]}...", here's what you need to know:

**Key Concepts:**
• Understanding the fundamentals is crucial
• Practice with examples helps reinforce learning
• Break complex topics into smaller, manageable parts

**Learning Steps:**
1. Start with the basics - make sure you understand the foundation
2. Practice with simple examples before moving to complex ones
3. Experiment and try variations to see what happens
4. Ask follow-up questions if anything is unclear

Would you like me to break down a specific part of this topic in more detail?"""
        
        elif any(word in question_lower for word in ['code', 'write', 'implement', 'create', 'make']):
            return """Here's a structured approach to writing code:

**Step-by-Step Process:**
1. **Plan First**: Think about what you want to achieve
2. **Break It Down**: Divide the problem into smaller tasks
3. **Start Simple**: Write the basic structure first
4. **Test Often**: Check if each part works before adding more
5. **Refactor**: Clean up and improve your code

**Best Practices:**
• Use meaningful variable names
• Add comments to explain complex logic
• Follow coding style guidelines
• Handle errors gracefully

Share your specific requirements and I can help you design the solution!"""
        
        else:
            return f"""Thanks for your question! I'm here to help you learn.

**General Learning Tips:**
• Break down complex topics into smaller parts
• Practice regularly with hands-on examples
• Don't hesitate to experiment and learn from mistakes
• Review and revise concepts to reinforce understanding

**For your question about "{question[:50]}..."**, I recommend:
1. Review the relevant concepts from your course materials
2. Look for examples that demonstrate the concept
3. Try practicing with a simple example first
4. Ask specific follow-up questions if you need clarification

Feel free to ask me anything else, and I'll do my best to help!"""
    
    def chat_with_tutor(self, question: str, context: str = '', history: Optional[List[Dict]] = None) -> Dict:
        """Chat with AI tutor with intelligent fallback"""
        question = (question or '').strip()
        if not question:
            return {'response': 'Please provide a question so I can help you.'}
        
        # Try Gemini API first if available
        if self.use_gemini:
            try:
                history = history or []
                history_snippets = []
                # Limit to last 6 exchanges to keep prompt concise
                for msg in history[-12:]:
                    role = 'Student' if msg.get('role') == 'user' else 'Tutor'
                    text = (msg.get('text') or msg.get('content') or '').strip()
                    if text:
                        history_snippets.append(f"{role}: {text}")
                history_text = '\n'.join(history_snippets) if history_snippets else 'No conversation yet.'
                context_text = context.strip() or 'No additional context provided.'
                
                prompt = f"""You are an experienced senior programming tutor. Help the student with clear, friendly explanations and actionable steps.

CONTEXT FROM STUDENT:
{context_text}

CONVERSATION SO FAR:
{history_text}

STUDENT QUESTION:
{question}

INSTRUCTIONS:
- Explain concepts in plain language first, then add technical details.
- Provide short code snippets when relevant (use triple backticks with language).
- Suggest next steps or related topics to explore.
- Encourage best practices and critical thinking.
- Keep the tone supportive and professional.
"""
                response = self.model.generate_content(prompt, generation_config={
                    'temperature': 0.4,
                    'max_output_tokens': 1024,
                })
                answer = response.text.strip()
                return {'response': answer or 'I could not generate a response. Please try again.'}
            except Exception as e:
                pass  # Silently use fallback
        
        # Use intelligent fallback
        fallback_response = self._generate_fallback_tutor_response(question, context)
        return {'response': fallback_response}
    
    def verify_flashcard_answer(self, correct_answer: str, user_answer: str, question: str) -> Dict:
        """Verify user's answer against correct answer using AI"""
        if not self.use_gemini:
            # Simple fallback: check if answers are similar
            similarity = 0.5 if user_answer.lower() in correct_answer.lower() or correct_answer.lower() in user_answer.lower() else 0.2
            return {
                'is_correct': similarity > 0.4,
                'confidence': similarity,
                'similarity_score': similarity,
                'feedback': 'Answer verification available with AI service enabled.'
            }
        
        try:
            # Check if this is a coding question
            is_coding_question = any(keyword in question.lower() or keyword in correct_answer.lower() 
                                    for keyword in ['code', 'function', 'refactor', 'debug', 'implement', '```', 'def ', 'class ', 'function'])
            
            if is_coding_question:
                prompt = f"""You are a strict but fair code reviewer evaluating a student's answer to a programming question.

QUESTION/PROMPT:
{question}

CORRECT ANSWER/SOLUTION:
{correct_answer}

STUDENT'S ANSWER:
{user_answer}

EVALUATION CRITERIA:
1. **Correctness (MOST IMPORTANT)**: Does the student's answer correctly solve the problem? Is the logic/approach correct?
   - For refactoring questions: Does the student identify the correct improvement (e.g., StringBuilder for string concatenation)?
   - For debugging questions: Does the student identify the actual bug?
   - For implementation questions: Does the code work correctly?

2. **Understanding**: Does the answer demonstrate understanding of the concept, even if not perfectly worded?

3. **Completeness**: Does the answer address the main point of the question?

BE STRICT BUT FAIR:
- If the student mentions the correct concept (e.g., "use StringBuilder" or "refactor with StringBuilder"), mark as CORRECT even if grammar/spelling is poor
- If the student gives a vague or incorrect answer, mark as INCORRECT
- Typos and grammar mistakes should NOT affect correctness if the technical answer is right
- Partial answers should get lower confidence scores

EXAMPLES:
- Question: "How to optimize string concatenation in a loop?"
- Correct: "Use StringBuilder"
- Student: "use stringbuilder" → CORRECT (typo doesn't matter)
- Student: "I have to refactor it" → INCORRECT (too vague, doesn't mention StringBuilder)
- Student: "Use StringBuffer or StringBuilder" → CORRECT (both are valid)

Return ONLY valid JSON (no markdown, no explanation):
{{
  "is_correct": true or false,
  "confidence": 0.0 to 1.0,
  "similarity_score": 0.0 to 1.0,
  "feedback": "Clear explanation of why correct/incorrect, what's good, what's missing, and how to improve"
}}"""
            else:
                prompt = f"""You are evaluating a student's answer to a conceptual question.

QUESTION:
{question}

CORRECT ANSWER:
{correct_answer}

STUDENT'S ANSWER:
{user_answer}

EVALUATION:
1. **Correctness**: Is the student's answer factually correct? Does it demonstrate understanding?
   - Be lenient with wording and phrasing if the core concept is correct
   - Typos and grammar should NOT affect correctness
   - Partial answers should get lower confidence scores

2. **Completeness**: Does the answer cover the main points?

3. **Understanding**: Does the answer show the student understands the concept?

BE FAIR:
- If the student's answer captures the essence of the correct answer (even with different wording), mark as CORRECT
- If the answer is vague, incorrect, or shows misunderstanding, mark as INCORRECT
- Provide constructive feedback explaining what's right/wrong

Return ONLY valid JSON (no markdown, no explanation):
{{
  "is_correct": true or false,
  "confidence": 0.0 to 1.0,
  "similarity_score": 0.0 to 1.0,
  "feedback": "Clear, constructive feedback explaining correctness and how to improve"
}}"""
            
            # Use the configured model instance
            if not hasattr(self, 'model') or self.model is None:
                raise Exception("Gemini model not initialized")
            
            response = self.model.generate_content(prompt)
            
            import json
            import re
            text = response.text.strip()
            
            # Extract JSON from markdown code blocks if present
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            else:
                # Try to find JSON object directly
                json_match = re.search(r'\{.*\}', text, re.DOTALL)
                if json_match:
                    text = json_match.group(0)
            
            try:
                result = json.loads(text)
                
                # Validate result
                is_correct = bool(result.get('is_correct', False))
                confidence = float(result.get('confidence', 0.5))
                similarity_score = float(result.get('similarity_score', 0.5))
                feedback = str(result.get('feedback', 'Answer verified.'))
                
                return {
                    'is_correct': is_correct,
                    'confidence': max(0.0, min(1.0, confidence)),  # Clamp between 0 and 1
                    'similarity_score': max(0.0, min(1.0, similarity_score)),  # Clamp between 0 and 1
                    'feedback': feedback
                }
            except json.JSONDecodeError:
                # Try to extract key information from text response
                is_correct_lower = 'correct' in text.lower() and 'incorrect' not in text.lower()
                return {
                    'is_correct': is_correct_lower,
                    'confidence': 0.5,
                    'similarity_score': 0.5,
                    'feedback': f'AI response parsing error. Response: {text[:200]}'
                }
        except Exception:
            # Fallback on error
            similarity = 0.5 if user_answer.lower() in correct_answer.lower() or correct_answer.lower() in user_answer.lower() else 0.2
            return {
                'is_correct': similarity > 0.4,
                'confidence': similarity,
                'similarity_score': similarity,
                'feedback': f'Answer verification failed: {str(e)}'
            }

# Create singleton instance
ai_service = AIService()

# Convenience functions for backward compatibility
def generate_flashcards(topic: str, count: int = 25) -> List[Dict]:
    """Generate flashcards for a topic"""
    return ai_service.generate_flashcards(topic, count)

def verify_flashcard_answer(correct_answer: str, user_answer: str, question: str) -> Dict:
    """Verify user's answer against correct answer"""
    return ai_service.verify_flashcard_answer(correct_answer, user_answer, question)