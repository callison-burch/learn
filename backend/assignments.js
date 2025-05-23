// Simple in-memory store for assignments and templates
let assignments = [];
let templates = [];
let nextId = 1;

function scheduleStatusCheck() {
  setInterval(() => {
    const now = Date.now();
    assignments.forEach(a => {
      if (a.status === 'scheduled' && new Date(a.startDate).getTime() <= now) {
        a.status = 'open';
      }
      if (a.status !== 'completed' && new Date(a.dueDate).getTime() < now) {
        a.status = 'closed';
      }
    });
  }, 60 * 1000);
}

scheduleStatusCheck();

function createAssignment(data) {
  const assignment = { id: nextId++, status: 'draft', ...data };
  if (assignment.startDate && new Date(assignment.startDate).getTime() > Date.now()) {
    assignment.status = 'scheduled';
  } else {
    assignment.status = 'open';
  }
  assignments.push(assignment);
  return assignment;
}

module.exports = {
  assignments,
  templates,
  createAssignment,
};
