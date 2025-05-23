# Learn With Martian - Technical Specification (2025)

This project is based on a research paper titled ["Learn With Martian: A Tool For Creating Assignments That Can Write And Re-Write Themselves"](https://aclanthology.org/2023.eacl-demo.30.pdf) presented at the 17th Conference of the European Chapter of the Association for Computational Linguistics (EACL 2023).

The paper describes **Learn**, an educational technology platform that uses natural language processing and AI to automatically generate and improve educational questions and assignments. Key features include:

**Main Capabilities:**
- Automatically generates questions from course materials (textbooks, PDFs, videos, etc.)
- Uses large language models like GPT-3, Codex, and T5 for question generation
- Implements spaced repetition to optimize student learning
- Provides analytics on question effectiveness using Item Response Theory
- Can create rich, interactive questions with code, animations, and games
- Allows questions to be automatically re-written and improved based on student performance data

**Results from Case Study:**
- Tested at University of Pennsylvania with over 1,000 students
- Students using Learn scored 0.29 standard deviations higher on exams
- 83% of students preferred Learn over traditional reading quizzes
- Every 15 minutes of additional studying with Learn led to 0.08σ improvement in exam scores

The tool aims to reduce the workload for instructors while improving educational outcomes through AI-powered question generation and adaptive learning techniques. 

Here we are aiming to recreate the project.

## Project Overview
Build a web-based educational platform that automatically generates, displays, and improves questions/assignments using NLP and machine learning techniques.

## Core Architecture

### Recommended Tech Stack (2025)

#### Frontend:
- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or TanStack Query
- **Rich Text Editor**: Lexical or TipTap
- **Code Editor**: Monaco Editor (VS Code editor)
- **Math Rendering**: KaTeX
- **Charts/Analytics**: Recharts or Tremor

#### Backend:
- **Framework**: FastAPI (Python) or Node.js with Hono/Bun
- **API Layer**: GraphQL with Apollo Server or tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Vector Database**: Pinecone or Weaviate (for embeddings)
- **Queue System**: BullMQ (Redis-based) or Temporal
- **File Storage**: S3-compatible (AWS S3, Cloudflare R2)
- **Caching**: Redis with Upstash for serverless

#### Infrastructure:
- **Deployment**: Vercel (frontend) + Railway/Fly.io (backend)
- **Container Orchestration**: Docker + Kubernetes or Cloud Run
- **Monitoring**: Sentry + Datadog/New Relic
- **Analytics**: PostHog or Mixpanel

### ML Infrastructure Updates

#### LLM Integrations:
```python
class LLMClients:
    def __init__(self):
        # Current frontier models (2025)
        self.claude_client = Anthropic(api_key=CLAUDE_KEY)  # Claude 3 Opus/Sonnet
        self.openai_client = OpenAI(api_key=OPENAI_KEY)    # GPT-4o, GPT-4 Turbo
        self.google_client = GoogleAI(api_key=GOOGLE_KEY)   # Gemini Pro 1.5
        self.cohere_client = Cohere(api_key=COHERE_KEY)     # Command R+
        
        # Open source alternatives
        self.llama_client = Together(api_key=TOGETHER_KEY)  # Llama 3 70B
        self.mistral_client = Mistral(api_key=MISTRAL_KEY)  # Mixtral 8x7B
        
        # Specialized models
        self.embedding_model = OpenAIEmbeddings()  # text-embedding-3-large
        self.code_model = OpenAI()  # GPT-4 with code interpreter
```

## Updated Feature Specifications

### 1. Material Upload System

#### Modern Implementation:
```typescript
// Frontend upload component with Next.js
interface MaterialUploader {
  uploadFile: (file: File) => Promise<ProcessedMaterial>
  scrapeWebsite: (url: string) => Promise<ScrapedContent>
  processDocument: (doc: Document) => Promise<ExtractedText>
}

// Backend processing with FastAPI
from fastapi import FastAPI, UploadFile
from langchain.document_loaders import PyPDFLoader, UnstructuredAPIFileIOLoader
from whisper import load_model  # For audio transcription

class DocumentProcessor:
    async def process_upload(self, file: UploadFile):
        # Modern document processing pipeline
        if file.content_type == 'application/pdf':
            loader = PyPDFLoader(file)
        elif file.content_type in ['audio/mpeg', 'video/mp4']:
            # Use Whisper or Assembly AI
            transcriber = WhisperModel('large-v3')
        # Process and chunk for LLM consumption
```

### 2. Question Generation System

#### Updated Pipeline:
```python
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate
import instructor  # For structured outputs

class ModernQuestionGenerator:
    def __init__(self):
        # Initialize with multiple models for redundancy/comparison
        self.primary_llm = Claude3Opus()
        self.secondary_llm = GPT4Turbo()
        self.code_llm = GPT4CodeInterpreter()
        
        # Use instructor for structured outputs
        self.instructor_client = instructor.from_anthropic(
            Anthropic()
        )
    
    async def generate_questions(
        self, 
        material: str, 
        question_type: QuestionType,
        bloom_level: BloomLevel,
        style_examples: List[Question] = None
    ) -> List[Question]:
        # Use structured generation with Pydantic models
        class QuestionOutput(BaseModel):
            question: str
            answer: str
            explanation: str
            difficulty: int
            concepts: List[str]
            
        # Generate with automatic retry and validation
        questions = await self.instructor_client.create(
            model="claude-3-opus-20240229",
            response_model=List[QuestionOutput],
            messages=[
                {"role": "system", "content": self.get_system_prompt()},
                {"role": "user", "content": material}
            ],
            max_retries=3
        )
        return questions
```

### 3. Enhanced Student Interface

#### Modern React Component:
```typescript
// Using Next.js 14 with Server Components
export default async function QuestionDisplay({ 
  questionId 
}: { 
  questionId: string 
}) {
  // Server-side data fetching
  const question = await getQuestion(questionId)
  
  return (
    <Card>
      <CardContent>
        <QuestionRenderer 
          content={question.content}
          type={question.type}
        />
        {question.type === 'code' && (
          <MonacoEditor
            language={question.language}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        )}
        {question.hasMath && (
          <KaTeXRenderer content={question.mathContent} />
        )}
      </CardContent>
    </Card>
  )
}
```

### 4. Advanced Analytics with AI

#### Modern Analytics Implementation:
```python
class AIAnalytics:
    def __init__(self):
        self.llm = Claude3Sonnet()  # Fast model for analysis
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = Pinecone()
    
    async def analyze_student_responses(
        self, 
        responses: List[StudentResponse]
    ) -> AnalysisReport:
        # Use embeddings for semantic similarity
        response_embeddings = await self.embeddings.embed_documents(
            [r.answer for r in responses]
        )
        
        # Cluster similar responses
        clusters = self.cluster_responses(response_embeddings)
        
        # Generate insights using LLM
        insights = await self.llm.analyze({
            "task": "analyze_student_misconceptions",
            "data": clusters,
            "context": "educational_assessment"
        })
        
        return AnalysisReport(
            common_errors=insights.errors,
            suggestions=insights.improvements,
            concept_gaps=insights.gaps
        )
```

### 5. Real-time Collaboration Features

#### WebSocket Integration:
```typescript
// Real-time updates using Socket.io or native WebSockets
export function useRealtimeQuestions(assignmentId: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.learnwithmartian.com/ws/${assignmentId}`)
    
    ws.on('question:updated', (data) => {
      setQuestions(prev => updateQuestion(prev, data))
    })
    
    ws.on('analytics:live', (data) => {
      // Update live analytics dashboard
    })
    
    return () => ws.close()
  }, [assignmentId])
  
  return questions
}
```

### 6. Multimodal Question Generation

#### Support for Modern Multimodal Models:
```python
class MultimodalQuestionGenerator:
    def __init__(self):
        self.vision_llm = GPT4Vision()
        self.audio_llm = Gemini15Pro()
        
    async def generate_from_image(
        self, 
        image: bytes, 
        context: str
    ) -> List[Question]:
        # Generate questions about diagrams, charts, etc.
        return await self.vision_llm.analyze_image(
            image=image,
            prompt="Generate educational questions about this image",
            context=context
        )
    
    async def generate_from_video(
        self, 
        video_url: str
    ) -> List[Question]:
        # Extract frames and audio, generate comprehensive questions
        frames = await self.extract_key_frames(video_url)
        transcript = await self.transcribe_audio(video_url)
        
        return await self.audio_llm.generate_multimodal_questions(
            frames=frames,
            transcript=transcript
        )
```

### 7. Advanced Personalization

#### Using Modern ML Techniques:
```python
class PersonalizationEngine:
    def __init__(self):
        self.recommendation_model = TensorFlowRecommender()
        self.difficulty_adjuster = DifficultyAdjustmentModel()
        self.learning_style_detector = LearningStyleClassifier()
    
    async def personalize_questions(
        self, 
        student: Student
    ) -> List[Question]:
        # Get student's learning profile
        profile = await self.analyze_student_profile(student)
        
        # Adjust question selection and difficulty
        questions = await self.select_questions(
            difficulty=profile.optimal_difficulty,
            learning_style=profile.style,
            weak_concepts=profile.concepts_to_improve
        )
        
        # Rewrite questions to match student's level
        personalized = await self.llm.rewrite_for_student(
            questions=questions,
            student_level=profile.knowledge_level,
            preferred_style=profile.communication_style
        )
        
        return personalized
```

## Modern Security & Compliance

### Updated Security Stack:
- **Authentication**: Clerk, Auth.js, or Supabase Auth
- **API Security**: Rate limiting with Upstash, API key rotation
- **Data Privacy**: GDPR/CCPA compliance tools
- **Encryption**: End-to-end encryption for sensitive data
- **Audit Logging**: Comprehensive activity tracking

### LLM Safety:
```python
class LLMSafetyWrapper:
    def __init__(self):
        self.moderation = OpenAIModerationAPI()
        self.prompt_guard = PromptInjectionDetector()
        
    async def safe_generate(self, prompt: str) -> str:
        # Check for prompt injection
        if await self.prompt_guard.is_malicious(prompt):
            raise SecurityException("Potential prompt injection detected")
            
        # Generate with safety constraints
        response = await self.llm.generate(
            prompt=prompt,
            safety_settings={
                "block_harmful": True,
                "academic_only": True
            }
        )
        
        # Post-generation moderation
        if not await self.moderation.is_safe(response):
            return await self.regenerate_safely(prompt)
            
        return response
```

## Performance Optimizations

### Modern Caching Strategy:
```typescript
// Edge caching with Vercel KV or Upstash
export const questionCache = {
  async get(key: string) {
    return await kv.get(key)
  },
  
  async set(key: string, value: any, ttl: number = 3600) {
    await kv.set(key, value, { ex: ttl })
  }
}

// React Server Components with streaming
export default async function QuestionList() {
  const questions = await questionCache.get('questions')
  
  if (!questions) {
    // Stream questions as they're generated
    return (
      <Suspense fallback={<QuestionSkeleton />}>
        <StreamingQuestions />
      </Suspense>
    )
  }
  
  return <Questions data={questions} />
}
```

## Deployment Architecture

### Modern Cloud-Native Setup:
```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    ports:
      - "3000:3000"
      
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    ports:
      - "8000:8000"
      
  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    
  vector_db:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
```

### Upload API Endpoints
- `POST /api/materials/upload` – upload a file for a course
- `GET /api/materials/{course_id}` – list materials for a course
- `DELETE /api/materials/{material_id}` – remove a material


## Local Development for Upload System

Run the FastAPI backend:
```bash
uvicorn backend.main:app --reload
```

Open `frontend/index.html` in your browser to upload files or `frontend/materials.html` to manage uploads.

