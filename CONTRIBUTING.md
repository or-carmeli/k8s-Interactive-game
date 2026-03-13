# Contributing to KubeQuest

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Adding Quiz Questions](#adding-quiz-questions)
- [Code Style](#code-style)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/KubeQuest.git
   cd KubeQuest
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Development Setup

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account (only needed if you want auth/leaderboard to work locally)

### Install & Run

```bash
npm install
cp .env.example .env   # then fill in your Supabase credentials
npm run dev
```

The app runs at `http://localhost:5173`.
The app works in **guest mode** even without Supabase credentials - most features are available.

---

## Project Structure

```
src/
  App.jsx              # Main application (UI + state)
  topics.js            # All quiz questions, organized by topic and level
  incidents.js         # Incident Mode scenarios
  dailyQuestions.js    # Daily Challenge question pool
  components/
    RoadmapView.jsx    # Roadmap screen
    WeakAreaCard.jsx   # Weak area highlight card
  utils/
    quizPersistence.js # localStorage helpers for quiz resume
```

---

## How to Contribute

### Good first issues

- Fix a typo or improve an explanation in `topics.js`
- Add a new quiz question to an existing topic
- Improve mobile layout for a specific screen
- Fix an RTL/LTR rendering bug

### Larger contributions

Please **open an issue first** to discuss your idea before writing code. This avoids duplicate work and ensures the change fits the project direction.

---

## Adding Quiz Questions

Questions live in `src/topics.js`. Each question follows this structure:

```js
{
  question: "What does X do?",        // English question
  questionHe: "מה עושה X?",           // Hebrew question
  options: ["A", "B", "C", "D"],      // English options (4 total)
  optionsHe: ["א", "ב", "ג", "ד"],   // Hebrew options (same order)
  answer: 2,                           // Index of correct answer (0-based)
  explanation: "X does ... because ...",       // English explanation
  explanationHe: "X עושה ... כי ...",         // Hebrew explanation
}
```

Rules:
- Correct answer must be factually accurate - double-check against official Kubernetes docs
- Wrong answers should be plausible (common misconceptions, not obviously wrong)
- Explanations should be beginner-friendly - define any term you use inline

---

## Code Style

- The project currently uses inline React styles - follow that pattern when editing existing components
- Keep components focused; avoid adding unrelated logic to a component
- No new dependencies without discussion

---

## Submitting a Pull Request

1. Make sure `npm run build` passes with no errors
2. Keep PRs focused - one feature or fix per PR
3. Fill out the PR template
4. Link any related issue in the PR description (`Closes #123`)

All PRs are reviewed before merging. Thank you for contributing!
