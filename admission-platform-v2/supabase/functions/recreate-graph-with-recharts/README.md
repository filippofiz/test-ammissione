# Recreate Graph with Recharts

This edge function uses Claude API to analyze graph images and generate interactive Recharts code.

## How It Works

1. **User uploads/extracts a graph image from PDF**
2. **User clicks "Recreate Graph (AI)"**
3. **Function receives the image as base64**
4. **Claude API analyzes the graph:**
   - Identifies chart type (LineChart, BarChart, etc.)
   - Extracts data points accurately
   - Detects axes, labels, and styling
5. **Claude generates complete Recharts component code**
6. **Code is saved to question_data.recharts_code**

## Setup

1. Set your Anthropic API key:
```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

2. Deploy the function:
```bash
npx supabase functions deploy recreate-graph-with-recharts
```

## Usage from Frontend

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/recreate-graph-with-recharts`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64: 'base64_encoded_image',
      width: 800,
      height: 600,
    }),
  }
);

const { rechartsCode } = await response.json();
// rechartsCode contains the complete React/Recharts component
```

## Example Output

Claude will generate code like:

```tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: 0, price: 100 },
  { time: 1, price: 120 },
  // ... extracted data points
];

export default function PriceTimeChart() {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: 'Time (hours)', position: 'bottom' }} />
          <YAxis label={{ value: 'Price (dollars)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## Benefits

- **Interactive graphs** instead of static images
- **Accessible data** for users with screen readers
- **Editable** - can modify data or styling easily
- **Responsive** - scales to any screen size
- **Professional** - crisp vector graphics, not pixelated images
