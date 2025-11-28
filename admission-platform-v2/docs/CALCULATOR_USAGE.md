# Calculator System Documentation

## Overview

The platform supports three types of calculators for use during tests:

1. **Regular** - GMAT-style basic calculator
2. **Graphing** - Desmos graphing calculator
3. **Scientific** - Desmos scientific calculator (complete/SAT mode)

## Calculator Types

### Regular Calculator (GMAT-style)

- **Use case**: GMAT Data Insights section, basic arithmetic tests
- **Features**:
  - Basic arithmetic operations (+, -, ×, ÷)
  - Memory functions (MC, MR, MS, M+)
  - Square root and reciprocal functions
  - Percentage calculations
  - 8-digit display with error handling
  - Draggable interface

### Graphing Calculator (Desmos)

- **Use case**: Advanced math tests requiring graphs and functions
- **Features**:
  - Full graphing capabilities
  - Function plotting
  - Zoom and pan controls
  - Points of interest
  - Trace functionality
  - Expression list
  - Powered by Desmos API

### Scientific Calculator (Desmos)

- **Use case**: SAT tests, advanced scientific calculations
- **Features**:
  - Scientific functions (sin, cos, tan, log, etc.)
  - Exponents and roots
  - Statistical functions
  - Expression evaluation
  - Powered by Desmos API
  - Optimized for SAT test requirements

## Configuration

### Database Configuration

Calculator type is configured in the `2V_test_track_config` table:

```sql
-- Set calculator type for a test configuration
UPDATE "2V_test_track_config"
SET calculator_type = 'scientific'  -- Options: 'none', 'regular', 'graphing', 'scientific'
WHERE test_type = 'SAT' AND track_type = 'full_test';
```

### Default Settings

- **GMAT tests**: `regular` calculator
- **SAT tests**: `scientific` calculator
- **Other tests**: `none` (no calculator) unless specified

## Usage in Code

### Import Calculator Components

```typescript
import { Calculator, CalculatorButton, CalculatorType } from '../components/Calculator';
```

### Using the Calculator Component

```typescript
const [showCalculator, setShowCalculator] = useState(false);
const calculatorType: CalculatorType = testConfig.calculator_type || 'none';

<Calculator
  isOpen={showCalculator}
  onClose={() => setShowCalculator(false)}
  calculatorType={calculatorType}
  draggable={true}
/>
```

### Using the Calculator Button

```typescript
<CalculatorButton
  onClick={() => setShowCalculator(!showCalculator)}
  calculatorType={calculatorType}
/>
```

## Integration with Test System

### TestConfig Interface

The calculator type is part of the test configuration:

```typescript
interface TestConfig {
  // ... other fields
  calculator_type?: 'none' | 'regular' | 'graphing' | 'scientific';
}
```

### Loading Configuration

The test-taking page automatically loads the calculator type from the database:

```typescript
const { data: config } = await supabase
  .from('2V_test_track_config')
  .select('*')
  .eq('test_type', testType)
  .eq('track_type', trackType)
  .single();

// Use config.calculator_type
```

## Migration

To add calculator support to your database, run the migration:

```bash
npx supabase db push
```

The migration file `027_add_calculator_type.sql` will:
- Add `calculator_type` column to `2V_test_track_config`
- Set default values for existing test configurations
- Add validation constraints

## Examples

### Example 1: SAT Test with Scientific Calculator

```sql
INSERT INTO "2V_test_track_config" (
  test_type,
  track_type,
  calculator_type,
  section_order_mode,
  navigation_mode
)
VALUES (
  'SAT',
  'full_test',
  'scientific',
  'mandatory',
  'forward_only'
)
ON CONFLICT (test_type, track_type)
DO UPDATE SET calculator_type = EXCLUDED.calculator_type;
```

### Example 2: GMAT Test with Regular Calculator

```sql
INSERT INTO "2V_test_track_config" (
  test_type,
  track_type,
  calculator_type,
  section_order_mode,
  navigation_mode
)
VALUES (
  'GMAT',
  'diagnostic',
  'regular',
  'mandatory',
  'forward_only'
)
ON CONFLICT (test_type, track_type)
DO UPDATE SET calculator_type = EXCLUDED.calculator_type;
```

### Example 3: Math Test with Graphing Calculator

```sql
INSERT INTO "2V_test_track_config" (
  test_type,
  track_type,
  calculator_type,
  section_order_mode,
  navigation_mode
)
VALUES (
  'CUSTOM',
  'math_advanced',
  'graphing',
  'user_choice',
  'back_forward'
)
ON CONFLICT (test_type, track_type)
DO UPDATE SET calculator_type = EXCLUDED.calculator_type;
```

## Technical Details

### Components

- **`Calculator.tsx`** - Main wrapper component that switches between calculator types
- **`GMATCalculator.tsx`** - GMAT-style regular calculator implementation
- **`DesmosCalculator.tsx`** - Desmos graphing/scientific calculator wrapper

### Desmos API

The Desmos API is loaded in `index.html`:

```html
<script src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
```

### Features

- **Draggable**: All calculators can be dragged around the screen
- **Responsive**: Calculator button text adjusts for mobile devices
- **Type-safe**: Full TypeScript support with proper typing
- **Performance**: Desmos calculators are destroyed when closed to free memory

## Troubleshooting

### Calculator not appearing

1. Check that `calculator_type` is set in the test configuration
2. Verify Desmos API script is loaded in `index.html`
3. Check browser console for errors

### Desmos not working

1. Ensure internet connection (Desmos requires CDN access)
2. Verify API key is valid
3. Check browser compatibility (modern browsers only)

### Type errors

1. Import `CalculatorType` from `Calculator.tsx`
2. Ensure test configuration includes `calculator_type` field
3. Update TypeScript definitions if needed

## Future Enhancements

Potential improvements:

- Calculator per section (different calculators for different test sections)
- Custom calculator configurations
- Save/load calculator state during test
- Additional calculator types (CAS, statistical, etc.)
- Offline support for Desmos calculators
