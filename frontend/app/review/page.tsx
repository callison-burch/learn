'use client';
import { useEffect, useState } from 'react';

interface Question {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  source: string;
  status: string;
  edits: string[];
}

export default function QuestionReviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});

  async function load() {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (difficultyFilter) params.append('difficulty', difficultyFilter);
    if (sourceFilter) params.append('source', sourceFilter);
    const res = await fetch(`/api/questions/review?${params.toString()}`);
    setQuestions(await res.json());
  }

  useEffect(() => { load(); }, [typeFilter, difficultyFilter, sourceFilter]);

  async function approve(id: string) {
    await fetch(`/api/questions/${id}/approve`, { method: 'POST' });
    await load();
  }
  async function reject(id: string) {
    await fetch(`/api/questions/${id}/reject`, { method: 'POST' });
    await load();
  }
  async function saveEdit(id: string) {
    await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing[id])
    });
    setEditing(prev => { const { [id]: _, ...rest } = prev; return rest; });
    await load();
  }
  async function approveAll() {
    const ids = questions.map(q => q.id);
    await fetch('/api/questions/bulk_approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids),
    });
    await load();
  }
  async function rejectAll() {
    const ids = questions.map(q => q.id);
    await fetch('/api/questions/bulk_reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids),
    });
    await load();
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Question Review</h1>
      <div style={{ margin: '1rem 0' }}>
        <label>
          Type:
          <input value={typeFilter} onChange={e => setTypeFilter(e.target.value)} />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Difficulty:
          <input value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Source:
          <input value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} />
        </label>
        <button onClick={approveAll} style={{ marginLeft: '1rem' }}>Approve All</button>
        <button onClick={rejectAll} style={{ marginLeft: '0.5rem' }}>Reject All</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {questions.map(q => (
          <div key={q.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '300px' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{q.type} - {q.difficulty}</div>
            {editing[q.id] !== undefined ? (
              <div>
                <div
                  contentEditable
                  style={{ border: '1px solid #aaa', padding: '0.5rem', minHeight: '4rem' }}
                  onInput={e => setEditing({ ...editing, [q.id]: (e.target as HTMLElement).innerText })}
                >{q.content}</div>
                <button onClick={() => saveEdit(q.id)}>Save</button>
                <button onClick={() => setEditing(prev => { const { [q.id]: _, ...rest } = prev; return rest; })}>Cancel</button>
              </div>
            ) : (
              <div>
                <p>{q.content}</p>
                <button onClick={() => setEditing({ ...editing, [q.id]: q.content })}>Edit</button>
              </div>
            )}
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => approve(q.id)}>Approve</button>
              <button onClick={() => reject(q.id)} style={{ marginLeft: '0.5rem' }}>Reject</button>
            </div>
            {q.edits.length > 0 && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary>Edit History</summary>
                <ul>
                  {q.edits.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
