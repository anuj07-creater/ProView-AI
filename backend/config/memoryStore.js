const bcrypt = require("bcryptjs");

// In-memory data store for resilient local execution without external DB dependencies
let idCounter = 100;
const generateId = () => {
  idCounter += 1;
  return `660000000000000000000${String(idCounter).padStart(3, "0")}`;
};

const users = new Map();
const sessions = new Map();
const questions = new Map();

// Helper to clone document
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Seed demo user and session
const seedInitialData = async () => {
  const demoUserId = "660000000000000000000001";
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  users.set(demoUserId, {
    _id: demoUserId,
    id: demoUserId,
    name: "Demo Candidate",
    email: "demo@proview.ai",
    password: hashedPassword,
    profileImageUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const demoSessionId = "660000000000000000000010";
  const q1Id = "660000000000000000000020";
  const q2Id = "660000000000000000000021";
  const q3Id = "660000000000000000000022";

  questions.set(q1Id, {
    _id: q1Id,
    id: q1Id,
    session: demoSessionId,
    question: "How does React 19 useActionState simplify async transitions and pending states?",
    answer: "React 19 introduces `useActionState` to automatically manage pending states, error handling, and optimistic updates during async transitions. It eliminates the need for manual `isLoading` booleans and try-catch boilerplate in component state.",
    isPinned: true,
    note: "Must highlight automatic form reset behavior in the interview.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  questions.set(q2Id, {
    _id: q2Id,
    id: q2Id,
    session: demoSessionId,
    question: "When should you prefer useTransition over standard state updates in performance-critical UIs?",
    answer: "Use `useTransition` for non-urgent updates (such as filtering large data lists or switching tabs) so that urgent user interactions (typing, button clicks, animations) remain responsive without dropping frames.",
    isPinned: false,
    note: "",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  questions.set(q3Id, {
    _id: q3Id,
    id: q3Id,
    session: demoSessionId,
    question: "How do you avoid unnecessary re-renders in deeply nested component trees without premature memoization?",
    answer: "1. State colocation: push state down to the components that actually consume it.\n2. Component composition: pass static subtrees as `children` or render props so the parent re-renders don't propagate.\n3. Atomic state libraries or scoped contexts instead of monolithic global stores.",
    isPinned: false,
    note: "",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  sessions.set(demoSessionId, {
    _id: demoSessionId,
    id: demoSessionId,
    user: demoUserId,
    token: "demo-session-token",
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    role: "Senior React Developer",
    experience: 4,
    topicsToFocus: ["React 19", "Performance Optimization", "State Architecture", "TypeScript"],
    description: "Deep-dive technical questions covering React concurrency, hooks, and scalable frontend architectures.",
    questions: [q1Id, q2Id, q3Id],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

seedInitialData();

// Model Wrappers that mimic Mongoose Query and Document APIs
const memoryUser = {
  findOne: async (query) => {
    for (const u of users.values()) {
      if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) {
        return wrapUserDoc(clone(u));
      }
    }
    return null;
  },
  create: async (data) => {
    const id = generateId();
    const doc = {
      _id: id,
      id,
      name: data.name,
      email: (data.email || "").trim().toLowerCase(),
      password: data.password,
      profileImageUrl: data.profileImageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.set(id, doc);
    return wrapUserDoc(clone(doc));
  },
  findById: (id) => {
    const doc = users.get(String(id));
    return {
      select: (fields) => {
        if (!doc) return Promise.resolve(null);
        const cloned = clone(doc);
        if (fields.includes("-password")) {
          delete cloned.password;
        }
        return Promise.resolve(wrapUserDoc(cloned));
      },
      then: (resolve, reject) => {
        if (!doc) return resolve(null);
        resolve(wrapUserDoc(clone(doc)));
      },
    };
  },
};

function wrapUserDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id,
    id: doc._id,
    toString: () => doc._id,
  };
}

const memoryQuestion = {
  create: async (data) => {
    const id = generateId();
    const doc = {
      _id: id,
      id,
      session: String(data.session),
      question: data.question,
      answer: data.answer,
      note: data.note || "",
      isPinned: !!data.isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    questions.set(id, doc);
    return wrapQuestionDoc(clone(doc));
  },
  insertMany: async (items) => {
    const created = [];
    for (const item of items) {
      const id = generateId();
      const doc = {
        _id: id,
        id,
        session: String(item.session),
        question: item.question,
        answer: item.answer,
        note: item.note || "",
        isPinned: !!item.isPinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      questions.set(id, doc);
      created.push(wrapQuestionDoc(clone(doc)));
    }
    return created;
  },
  findById: async (id) => {
    const doc = questions.get(String(id));
    if (!doc) return null;
    return wrapQuestionDoc(doc);
  },
  deleteMany: async (query) => {
    let deletedCount = 0;
    if (query.session) {
      const targetSession = String(query.session);
      for (const [k, v] of questions.entries()) {
        if (String(v.session) === targetSession) {
          questions.delete(k);
          deletedCount++;
        }
      }
    }
    return { deletedCount };
  },
};

function wrapQuestionDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id,
    id: doc._id,
    save: async function () {
      doc.updatedAt = new Date().toISOString();
      doc.isPinned = this.isPinned;
      doc.note = this.note;
      questions.set(doc._id, doc);
      return this;
    },
  };
}

const memorySession = {
  create: async (data) => {
    const id = generateId();
    const doc = {
      _id: id,
      id,
      user: String(data.user),
      token: data.token,
      expiresAt: data.expiresAt,
      role: data.role,
      experience: data.experience,
      topicsToFocus: data.topicsToFocus,
      description: data.description,
      questions: data.questions ? data.questions.map(String) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.set(id, doc);
    return wrapSessionDoc(doc);
  },
  find: (query) => {
    return {
      sort: function () {
        return this;
      },
      populate: function () {
        return this;
      },
      then: (resolve) => {
        const targetUser = String(query.user);
        const results = [];
        for (const s of sessions.values()) {
          if (String(s.user) === targetUser) {
            const populated = clone(s);
            populated.questions = (s.questions || [])
              .map((qid) => questions.get(String(qid)))
              .filter(Boolean)
              .map(wrapQuestionDoc);
            results.push(wrapSessionDoc(populated));
          }
        }
        // sort by createdAt desc
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(results);
      },
    };
  },
  findById: (id) => {
    const s = sessions.get(String(id));
    return {
      populate: function (opts) {
        return this;
      },
      exec: async function () {
        if (!s) return null;
        const populated = clone(s);
        const qDocs = (s.questions || [])
          .map((qid) => questions.get(String(qid)))
          .filter(Boolean)
          .map(wrapQuestionDoc);
        // sort pinned first, then createdAt
        qDocs.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        populated.questions = qDocs;
        return wrapSessionDoc(populated, s);
      },
      then: (resolve) => {
        if (!s) return resolve(null);
        resolve(wrapSessionDoc(clone(s), s));
      },
    };
  },
};

function wrapSessionDoc(populated, rawRef) {
  if (!populated) return null;
  const doc = populated;
  const ref = rawRef || sessions.get(String(doc._id));
  return {
    ...doc,
    _id: doc._id,
    id: doc._id,
    save: async function () {
      if (ref) {
        ref.updatedAt = new Date().toISOString();
        if (this.questions) {
          ref.questions = this.questions.map((q) => (typeof q === "object" ? q._id : String(q)));
        }
        sessions.set(ref._id, ref);
      }
      return this;
    },
    deleteOne: async function () {
      if (ref) {
        sessions.delete(ref._id);
      }
      return { acknowledged: true };
    },
  };
}

module.exports = {
  memoryUser,
  memorySession,
  memoryQuestion,
};
