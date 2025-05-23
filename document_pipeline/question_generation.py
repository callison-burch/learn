import asyncio
import json
import os
import sqlite3
from dataclasses import dataclass
from typing import List

import openai


@dataclass
class Question:
    chunk_id: int
    question_index: int
    question: str
    choices: List[str]
    answer: str
    status: str = "pending"
    cost: float = 0.0


class QuestionGenerationService:
    """Generate questions from document chunks using OpenAI GPT-4."""

    def __init__(
        self,
        db_path: str = "documents.db",
        model: str = "gpt-4",
        rate_limit_per_minute: int = 3,
        prompt_cost_per_1k_tokens: float = 0.03,
        completion_cost_per_1k_tokens: float = 0.06,
    ) -> None:
        self.db_path = db_path
        self.model = model
        self._semaphore = asyncio.Semaphore(rate_limit_per_minute)
        self._delay = 60 / rate_limit_per_minute
        self.prompt_cost_per_1k_tokens = prompt_cost_per_1k_tokens
        self.completion_cost_per_1k_tokens = completion_cost_per_1k_tokens
        self.total_cost = 0.0
        openai.api_key = os.environ.get("OPENAI_API_KEY", "")

    async def _release_after_delay(self) -> None:
        await asyncio.sleep(self._delay)
        self._semaphore.release()

    async def _call_openai(self, prompt: str) -> openai.types.chat.chat_completion.ChatCompletion:
        await self._semaphore.acquire()
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
            )
        finally:
            asyncio.create_task(self._release_after_delay())
        return response

    async def _generate_questions_from_text(
        self, text: str, question_count: int, question_type: str
    ) -> List[Question]:
        prompt = (
            f"Generate {question_count} {question_type.replace('_', ' ')} questions "
            f"from the following text. Respond in JSON array format where each item "
            f"has 'question', 'choices' and 'answer' fields.\n\n{text}"
        )
        response = await self._call_openai(prompt)
        usage = response.usage or {}
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)
        call_cost = (
            prompt_tokens / 1000 * self.prompt_cost_per_1k_tokens
            + completion_tokens / 1000 * self.completion_cost_per_1k_tokens
        )
        self.total_cost += call_cost
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            data = []
        questions = []
        for idx, item in enumerate(data):
            question = Question(
                chunk_id=-1,  # placeholder, set later
                question_index=idx,
                question=item.get("question", ""),
                choices=item.get("choices", []),
                answer=item.get("answer", ""),
                cost=call_cost / max(len(data), 1),
            )
            questions.append(question)
        return questions

    async def generate_from_material(
        self,
        material_id: str,
        question_count: int = 5,
        question_type: str = "multiple_choice",
    ) -> List[Question]:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute(
            "SELECT id, text FROM chunks WHERE document_id=? ORDER BY chunk_index",
            (material_id,),
        )
        rows = cur.fetchall()
        results: List[Question] = []
        for chunk_id, text in rows:
            q_list = await self._generate_questions_from_text(
                text, question_count, question_type
            )
            for q in q_list:
                q.chunk_id = chunk_id
                cur.execute(
                    "INSERT INTO questions("
                    "chunk_id, question_index, question, choices, answer, status, cost"
                    ") VALUES(?,?,?,?,?,?,?)",
                    (
                        chunk_id,
                        q.question_index,
                        q.question,
                        json.dumps(q.choices),
                        q.answer,
                        q.status,
                        q.cost,
                    ),
                )
                q_id = cur.lastrowid
                results.append(q)
        conn.commit()
        conn.close()
        return results

