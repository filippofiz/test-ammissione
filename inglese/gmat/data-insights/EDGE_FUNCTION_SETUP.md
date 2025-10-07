# 🚀 Edge Function Setup Guide

## Why We Need This

**Problem**: Browser can't call Claude API directly (CORS policy)
**Solution**: Supabase Edge Function acts as a proxy

```
Browser → Edge Function → Claude API → Response back
(No CORS)   (Server-side)  (No CORS)
```

---

## 📋 Setup Steps

### Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/yfbdalhlkykeqcmjdjqe

2. **Navigate to Edge Functions**
   - Left sidebar → Edge Functions
   - Click "Create a new function"

3. **Create Function**
   - Name: `claude-proxy`
   - Copy code from: `supabase/functions/claude-proxy/index.ts`
   - Paste into editor
   - Click "Deploy"

4. **Add Secret (API Key)**
   - Go to Edge Functions → Secrets
   - Click "Add new secret"
   - Name: `ANTHROPIC_API_KEY`
   - Value: `<your-anthropic-api-key-here>`
   - Save

5. **Test It**
   - Refresh your app
   - Try generating a question
   - Should work now! ✅

---

### Method 2: Supabase CLI (Advanced)

**Prerequisites**: Install Supabase CLI
```bash
npm install -g supabase
```

**Steps**:

1. **Login to Supabase**
```bash
supabase login
```

2. **Link Project**
```bash
cd "C:\App UpToTen\admission-test"
supabase link --project-ref yfbdalhlkykeqcmjdjqe
```

3. **Set Secret**
```bash
supabase secrets set ANTHROPIC_API_KEY=<your-anthropic-api-key-here>
```

4. **Deploy Function**
```bash
supabase functions deploy claude-proxy
```

5. **Verify**
```bash
supabase functions list
```

---

## ✅ Verify It's Working

### Test in Browser Console:
```javascript
const response = await fetch('https://yfbdalhlkykeqcmjdjqe.supabase.co/functions/v1/claude-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYmRhbGhsa3lrZXFjbWpkanFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MjQ2NTQsImV4cCI6MjA0NzEwMDY1NH0.WKNfqVzA_BG3c8rwG00_bP5dGAHsZ2GFwOG8sZWXx78'
  },
  body: JSON.stringify({
    prompt: 'Say hello in 5 words',
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100
  })
})
const data = await response.json()
console.log(data.content[0].text)
```

Should return: Claude's response! ✅

---

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY not configured"
→ Add the secret in Supabase Dashboard → Edge Functions → Secrets

### Error: "Function not found"
→ Make sure function is deployed with exact name: `claude-proxy`

### Error: "unauthorized"
→ Check the Authorization header has correct Supabase anon key

### Still CORS errors?
→ Clear browser cache, hard refresh (Ctrl+Shift+R)

---

## 📊 Also Run the Database SQL!

Don't forget to create the training table:

1. Go to Supabase → SQL Editor
2. Copy all content from: `CREATE_AI_TRAINING_TABLE.sql`
3. Click "Run"
4. Should see: "Success. No rows returned"

---

## ✨ After Setup

Once both are done:
1. ✅ Edge Function deployed
2. ✅ Database table created
3. ✅ Refresh your app
4. ✅ Generate a question
5. ✅ Review modal appears
6. ✅ AI learning begins!

🎉 You're ready to go!
