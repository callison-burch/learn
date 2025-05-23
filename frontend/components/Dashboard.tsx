'use client';
import { useState } from 'react';
import { Calendar } from './Calendar';

interface Course {
  id: string;
  title: string;
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  score?: number;
  feedback?: string;
}

const allCourses: Course[] = [
  { id: 'c1', title: 'Math 101' },
  { id: 'c2', title: 'History 201' },
  { id: 'c3', title: 'Biology 301' },
];

const initialAssignments: Assignment[] = [
  { id: 'a1', courseId: 'c1', title: 'Algebra Homework', dueDate: '2024-07-10', completed: false },
  { id: 'a2', courseId: 'c2', title: 'Essay Outline', dueDate: '2024-07-12', completed: false },
  { id: 'a3', courseId: 'c3', title: 'Lab Report', dueDate: '2024-07-15', completed: false },
];

export default function Dashboard() {
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [scores, setScores] = useState<{ assignmentId: string; score: number; feedback?: string }[]>([]);

  const availableCourses = allCourses.filter(c => !enrolled.find(e => e.id === c.id));
  const upcoming = assignments
    .filter(a => !a.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const enroll = (courseId: string) => {
    const course = allCourses.find(c => c.id === courseId);
    if (course) setEnrolled([...enrolled, course]);
  };

  const toggleComplete = (id: string) => {
    setAssignments(assignments.map(a => (a.id === id ? { ...a, completed: !a.completed } : a)));
    const assignment = assignments.find(a => a.id === id);
    if (assignment && !assignment.completed) {
      setScores([...scores, { assignmentId: id, score: Math.floor(80 + Math.random() * 20), feedback: 'Good work!' }]);
    }
  };

  const progress = (courseId: string) => {
    const courseAssignments = assignments.filter(a => a.courseId === courseId);
    const completed = courseAssignments.filter(a => a.completed).length;
    return courseAssignments.length ? completed / courseAssignments.length : 0;
  };

  const dueDates = assignments.reduce<Record<string, string[]>>((acc, a) => {
    acc[a.dueDate] = acc[a.dueDate] ? [...acc[a.dueDate], a.title] : [a.title];
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold">Enrolled Courses</h2>
        <ul>
          {enrolled.map(course => (
            <li key={course.id} className="mb-2">
              <div>{course.title}</div>
              <progress value={progress(course.id)} max={1} />
            </li>
          ))}
          {!enrolled.length && <li>No courses enrolled.</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
        <ul>
          {upcoming.slice(0, 5).map(a => (
            <li key={a.id}>{a.title} - due {a.dueDate}</li>
          ))}
          {!upcoming.length && <li>No upcoming assignments.</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Assignments</h2>
        <ul>
          {assignments.map(a => (
            <li key={a.id} className="mb-1">
              <label>
                <input type="checkbox" checked={a.completed} onChange={() => toggleComplete(a.id)} /> {a.title} ({a.dueDate})
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Recent Scores</h2>
        <ul>
          {scores.slice(-5).map((s, idx) => {
            const assignment = assignments.find(a => a.id === s.assignmentId);
            return (
              <li key={idx}>
                {assignment?.title}: {s.score}% - {s.feedback}
              </li>
            );
          })}
          {!scores.length && <li>No scores yet.</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Enroll in a Course</h2>
        <div>
          <select id="course-select">
            {availableCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button onClick={() => {
            const select = document.getElementById('course-select') as HTMLSelectElement;
            if (select && select.value) enroll(select.value);
          }}>Enroll</button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Due Date Calendar</h2>
        <Calendar dueDates={dueDates} />
      </section>
    </div>
  );
}
