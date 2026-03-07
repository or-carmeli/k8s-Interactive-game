# Content Setup

The proprietary quiz content is not included in this repository.

To run KubeQuest locally, create `src/content/` with the following files:

```
src/content/
  topics.js            # Full topic question banks
  dailyQuestions.js     # Daily challenge question pool
  incidents.js          # Incident scenario workflows
```

Each file in `src/content.example/` demonstrates the expected data shape.
Copy and populate them:

```bash
cp src/content.example/topics.example.js        src/content/topics.js
cp src/content.example/dailyQuestions.example.js src/content/dailyQuestions.js
cp src/content.example/incidents.example.js      src/content/incidents.js
```

Then provide your Supabase credentials via environment variables:

```bash
cp .env.example .env
# Edit .env with your Supabase project URL and anon key
```

Run with `npm run dev`.
