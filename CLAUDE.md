# D3.js Data Visualization App

Static web application for creating custom data visualizations using D3.js. Built for beautiful, accessible, and performant visualizations across financial, scientific, and population survey data domains.

**Tech Stack:** TypeScript, D3.js, Vite, Vitest, oxlint, Prettier, CSS Modules

**Purpose:** Custom data visualizations with mobile-first design, accessibility by default, and performance optimized for medium datasets (100-10k data points).

---

## Project Structure

### Directory Layout

```
/src/
  /visualizations/     # D3 visualization modules
    /charts/           # Chart types (bar, line, scatter, etc.)
    /maps/             # Geographic visualizations (choropleth, etc.)
    /networks/         # Network diagrams (force-directed, etc.)
    /generative/       # Generative art visualizations
  /lib/                # Shared utilities
    /scales/           # D3 scale helpers and configurations
    /transitions/      # Animation utilities
    /accessibility/    # A11y helpers (ARIA, keyboard nav)
  /data/               # Data processing
    /transforms/       # Data transformation functions
    /loaders/          # Data loading utilities (CSV, JSON, fetch)
  /styles/             # CSS Modules
  /types/              # TypeScript type definitions
  main.ts              # Application entry point
  vite-env.d.ts        # Vite type declarations
/public/               # Static assets
/tests/                # Test files (unit tests for data logic)
vite.config.ts         # Vite configuration
tsconfig.json          # TypeScript configuration
oxlintrc.json          # oxlint configuration
.prettierrc            # Prettier configuration
```

### Key Modules

- **visualizations/** - Each subdirectory contains domain-specific D3 visualizations as isolated modules
- **lib/** - Reusable utilities for scales, transitions, and accessibility patterns
- **data/** - Pure functions for data transformation and loading (separate from rendering)
- **types/** - TypeScript interfaces for data shapes, chart options, and D3 selections

---

## Development Workflow

### Before Coding

1. **ASK clarifying questions** until 95% confident about requirements
2. **Research existing patterns** - check if similar visualization exists
3. **Create plan** and get approval before implementing
4. **Work incrementally** - one visualization at a time

### Recommended Workflow

**Explore → Plan → Code → Test → Commit**

- Use **Plan Mode** (Shift+Tab twice) for complex visualizations, new patterns, multi-file changes
- Search codebase for similar implementations before proposing new patterns
- Propose plan with alternatives when multiple approaches exist
- **Do NOT code until plan is confirmed**

---

## TypeScript Conventions

### Code Style

- **Strict mode:** enabled in tsconfig.json
- **Formatter:** Prettier
- **Linter:** oxlint (Rust-based, fast)
- **Naming:** camelCase for functions/variables, PascalCase for types/interfaces/classes
- **Indentation:** 2 spaces
- **Line length:** 100 characters (enforced by Prettier)

### Linter Errors

**ALWAYS:**
- Attempt to fix linter errors properly
- Research solutions online if unclear how to fix
- Fix root cause, not symptoms

**NEVER:**
- Use skip/disable directives (e.g., `// oxlint-disable`)
- Ignore linter warnings
- Work around linter errors

**If stuck:**
- Try fixing the error
- Research online for proper solution
- If still unclear after research, ASK what to do (don't skip/disable)

### TypeScript + D3 Patterns

**Type everything explicitly:**

```typescript
// Good: Strongly typed data and selections
interface ChartData {
  date: Date;
  value: number;
  category: string;
}

type ScaleX = d3.ScaleTime<number, number>;
type ScaleY = d3.ScaleLinear<number, number>;
type Selection = d3.Selection<SVGGElement, ChartData, SVGSVGElement, unknown>;

// Bad: Using any
const scale: any = d3.scaleLinear();
```

**Prefer const and arrow functions:**

```typescript
// Good
const parseDate = (d: string): Date => new Date(d);
const data = rawData.filter((d) => d.value > 0).map((d) => ({ ...d, parsed: parseDate(d.date) }));

// Bad
let parseDate = function (d: string) {
  return new Date(d);
};
var data = rawData.filter(function (d) {
  return d.value > 0;
});
```

**No `any` type:**
- Use proper D3 generic types
- Use `unknown` if type is truly uncertain
- Create type aliases for complex D3 types

### Error Handling

**Data loading:**

```typescript
async function loadData(url: string): Promise<ChartData[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const raw = await response.json();
    return validateAndTransform(raw);
  } catch (error) {
    console.error('Data loading failed:', error);
    throw error;
  }
}
```

**Graceful degradation:**

```typescript
function createVisualization(container: HTMLElement, data: ChartData[]) {
  if (!data || data.length === 0) {
    container.innerHTML = '<p>No data available</p>';
    return;
  }
  // ... proceed with visualization
}
```

### Testing

- **Framework:** Vitest
- **Focus:** Data transformations, scale calculations, utility functions
- **Don't test:** D3 rendering (visual regression out of scope)
- **Coverage threshold:** 80% for data logic

**Test Pattern:**

```typescript
import { describe, it, expect } from 'vitest';
import { transformData, calculateExtent } from '../data/transforms';

describe('transformData', () => {
  it('filters out invalid entries', () => {
    const input = [
      { date: '2024-01-01', value: 10 },
      { date: 'invalid', value: 20 },
      { date: '2024-01-03', value: -5 },
    ];
    const result = transformData(input);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(10);
  });

  it('handles empty data', () => {
    expect(transformData([])).toEqual([]);
  });

  it('handles malformed data gracefully', () => {
    expect(() => transformData(null as any)).toThrow();
  });
});
```

---

## D3.js Patterns

### Visualization Structure

Each visualization follows this pattern:

```typescript
interface ChartOptions {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  // ... other options
}

export function createChart(
  container: HTMLElement,
  data: ChartData[],
  options: ChartOptions = {}
): () => void {
  // 1. Setup SVG with margin convention
  const margin = options.margin ?? { top: 20, right: 20, bottom: 30, left: 40 };
  const width = (options.width ?? container.clientWidth) - margin.left - margin.right;
  const height = (options.height ?? 400) - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('role', 'img')
    .attr('aria-label', 'Chart description');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // 2. Create scales
  const xScale = d3.scaleTime().domain(d3.extent(data, (d) => d.date)).range([0, width]);

  const yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.value)]).range([height, 0]);

  // 3. Draw elements
  g.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(d.date))
    .attr('cy', (d) => yScale(d.value))
    .attr('r', 4);

  // 4. Add interactions (if needed)
  // ...

  // 5. Return cleanup function
  return () => {
    svg.remove();
  };
}
```

### Anti-Patterns to AVOID

❌ **NEVER:**

- Create generic chart factories or over-abstracted "reusable" charts prematurely
- Write monolithic visualization files >200 lines
- Mutate data in place (use pure functions)
- Chain D3 methods excessively for complex logic (use variables for readability)
- Skip enter/update/exit pattern when data updates
- Hardcode magic numbers (use scales, constants, variables)
- Add visualization frameworks on top of D3 (keep direct D3 code)
- Build custom data fetching library (use native fetch)

### Patterns to FOLLOW

✅ **ALWAYS:**

- One visualization per file (isolated, focused modules)
- Pure data transformation functions (separate from rendering)
- Responsive sizing (container-based, not fixed dimensions)
- Return cleanup functions (remove event listeners, cancel transitions)
- Use margin convention for axes
- Mobile-first scales and interactions
- Direct D3 code over abstractions

### Accessibility

**Include by default:**

```typescript
// SVG with ARIA attributes
svg
  .attr('role', 'img')
  .attr('aria-label', 'Line chart showing temperature over time')
  .attr('aria-describedby', 'chart-description');

// Description element
svg.append('desc').attr('id', 'chart-description').text('Detailed description of data patterns');

// Keyboard navigation for interactive elements
circles
  .attr('tabindex', 0)
  .attr('role', 'button')
  .attr('aria-label', (d) => `Data point: ${d.value}`)
  .on('keydown', (event, d) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick(d);
    }
  });

// Focus indicators (CSS)
circle:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

**Semantic structure:**

```html
<article class="visualization">
  <h2>Chart Title</h2>
  <div class="chart-container" role="region" aria-label="Interactive chart">
    <!-- D3 renders SVG here -->
  </div>
  <table class="sr-only">
    <!-- Data table for screen readers -->
  </table>
</article>
```

### Performance

**Canvas fallback for large datasets:**

```typescript
function createVisualization(container: HTMLElement, data: ChartData[]) {
  if (data.length > 1000) {
    return createCanvasVisualization(container, data);
  }
  return createSVGVisualization(container, data);
}
```

**Debounce resize handlers:**

```typescript
let resizeTimeout: number;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Redraw visualization
  }, 150);
});
```

**Use requestAnimationFrame for smooth updates:**

```typescript
function updateVisualization(newData: ChartData[]) {
  requestAnimationFrame(() => {
    circles.data(newData).attr('cx', (d) => xScale(d.value));
  });
}
```

### Animation

**D3 transitions with accessibility:**

```typescript
// Check for prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = prefersReducedMotion ? 0 : 400;

circles
  .transition()
  .duration(duration)
  .ease(d3.easeCubicInOut)
  .attr('cy', (d) => yScale(d.value));

// Cancel ongoing transitions before new ones
circles.interrupt().transition().duration(duration);
```

**Default preferences:**

- Duration: 300-500ms for smooth feel
- Easing: d3.easeCubicInOut
- Always respect prefers-reduced-motion
- Cancel ongoing transitions before starting new ones

---

## Simplicity Principles

### Anti-Patterns to AVOID

❌ **NEVER:**

- Over-engineer simple bar charts or line charts
- Add unnecessary visualization frameworks on top of D3
- Create "reusable chart" abstractions before you have 3+ use cases
- Design for every possible chart type upfront
- Add complex state management libraries (vanilla JS state sufficient)
- Build abstractions for one-time operations
- Add features beyond what's requested

### Enforcement Rules

✅ **ALWAYS:**

- Each visualization solves ONE specific problem
- Direct D3 code > abstractions
- Duplicate 3-4 lines > premature utility function
- CSS Modules > CSS-in-JS frameworks
- Native browser APIs when sufficient
- Choose simplest practical solution
- Make minimal, surgical changes

### Complexity Check

**Before implementing, ask:**

1. Can this be simpler D3 code?
2. Do I need this abstraction NOW (not future)?
3. Does similar visualization exist to reference?
4. Is this the minimal code to achieve the goal?

**If unsure:** STOP and ask for approval before proceeding.

### Pattern Drift Threats

**Data transforms:**

- Claude tends to add complex functional pipelines
- Keep simple: filter → map → reduce pattern
- Don't create transform utilities until 3+ uses

**Scales:**

- Don't create scale factories
- Define scales inline per visualization
- Extract only when pattern emerges

**Interactions:**

- Start with simple click handlers
- Don't add drag/zoom/brush unless specified
- Add complexity incrementally as needed

---

## Code Generation Rules

### ALWAYS

- Show **complete code** (no placeholders like `// ... rest of code`)
- **Incremental changes** - 20-50 lines at a time
- **Test data transforms** after each step
- **Follow existing patterns** found in codebase
- **Ask questions** before assuming requirements

### NEVER

- Generate entire visualization file at once (>100 lines in single response)
- Make big changes in single step
- Add features beyond what's requested
- Modify unrelated visualizations
- Use placeholders

### Incremental Process for New Visualization

1. Define TypeScript types (data shape, options interface)
2. Create container setup (SVG, margins, dimensions)
3. Implement scales (minimal, inline)
4. Draw core elements (no interactions yet)
5. Add interactions if needed
6. Add accessibility attributes (ARIA, keyboard nav)
7. Test with sample data
8. Iterate

**Each step:** Review, approve, then proceed to next.

---

## Common Commands

### Development

```bash
# Start Vite dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Run oxlint (TypeScript linting)
npm run lint

# Format code with Prettier
npm run format

# Check if code is formatted
npm run format:check
```

### Testing

```bash
# Run Vitest tests
npm run test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Git Conventions

- **Branch naming:** `feat/chart-type` or `fix/issue-description`
- **Commit message format:** `type: description` (conventional commits)
- **Commit signing:** Use `-s -S` flags (GPG signing)

**Example commit:**

```
feat: add choropleth map visualization

Implemented geographic visualization for population survey data
with color scale based on value ranges. Includes mobile-responsive
interactions and ARIA labels for accessibility.
```

---

## Visualization-Specific Context

### Data Domains

**Financial:**

- Time series data (ISO 8601 dates, parse to Date objects)
- Chart types: Line charts, OHLC/candlestick, volume bars, sparklines
- Common patterns: Rolling averages, trend lines, annotations

**Scientific:**

- Numeric datasets with statistical distributions
- Chart types: Scatter plots, histograms, box plots, heatmaps
- Common patterns: Regression lines, confidence intervals, outlier highlighting

**Population Surveys:**

- Hierarchical and geographic data
- Chart types: Choropleth maps, demographic pyramids, bubble charts, tree maps
- Common patterns: GeoJSON rendering, color scales for ranges, drill-down interactions

### Common Data Patterns

**Time-series:**

```typescript
interface TimeSeriesData {
  date: Date; // Always parse to Date object (from ISO 8601 string)
  value: number;
  category?: string;
}

const parseDate = d3.timeParse('%Y-%m-%d');
```

**Geographic:**

```typescript
interface GeoData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: GeoJSON.Geometry;
    properties: Record<string, unknown>;
  }>;
}

// Validate coordinates before rendering
function isValidCoordinate(coord: [number, number]): boolean {
  const [lon, lat] = coord;
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}
```

**Networks:**

```typescript
interface NetworkData {
  nodes: Array<{ id: string; label: string; value?: number }>;
  edges: Array<{ source: string; target: string; weight?: number }>;
}

// Validate relationships exist
function validateNetwork(data: NetworkData): boolean {
  const nodeIds = new Set(data.nodes.map((n) => n.id));
  return data.edges.every((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
}
```

### Performance Considerations

**Mobile:**

- Test on throttled network (Chrome DevTools: Slow 3G)
- Test on low-end devices (6x CPU slowdown simulation)
- Optimize asset loading (lazy load heavy visualizations)
- Use touch events, not just mouse events

**Medium datasets (100-10k points):**

- SVG works well for <1000 points
- Canvas fallback for 1000-10k points
- Virtual scrolling/viewport culling for large datasets
- Web workers for expensive data processing

**Canvas fallback pattern:**

```typescript
if (data.length > 1000) {
  // Use canvas for performance
  const canvas = container.appendChild(document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  // ... render with canvas API
} else {
  // Use SVG for rich interactions and accessibility
  const svg = d3.select(container).append('svg');
  // ... render with D3
}
```

### Known Gotchas

**D3 selections:**

- Selections are immutable (each method returns new selection)
- Store selections in variables if reusing

**TypeScript + D3 generics:**

- D3 generic types can be verbose
- Create type aliases for common patterns: `type Selection = d3.Selection<...>`

**SVG coordinate system:**

- Y axis increases downward (0 at top)
- Use scales to flip: `.range([height, 0])`

**Mobile touch events:**

- Touch events differ from mouse events
- Use `d3.pointer(event)` for unified coordinate handling
- Add touch-action CSS for smooth interactions

**CSS Modules + D3:**

- D3-generated elements need `:global()` for CSS Modules
- Or use inline styles for D3-generated content

```css
/* styles.module.css */
:global(.d3-axis) {
  font-size: 12px;
}

/* Or use inline styles in D3 */
axis.selectAll('text').style('font-size', '12px');
```

### Integration Points

**Data source:** TBD

- Could be: REST API, static JSON/CSV files, real-time WebSocket
- Plan for async loading and error states
- Validate data shape before visualization

**Build output:**

- Static HTML/JS/CSS bundle
- Deployable to any static host (Netlify, Vercel, GitHub Pages, S3, etc.)
- No server-side rendering needed

**Analytics:** TBD

- Plan for event tracking on interactions (click, hover, filter)
- Consider privacy implications

---

## Additional Resources

- **D3 Official Docs:** https://d3js.org/
- **Observable Notebooks:** https://observablehq.com/@d3 (examples and patterns)
- **Awesome D3:** https://github.com/wbkd/awesome-d3 (curated list)
- **TypeScript + D3:** https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d3.html
- **Vite Documentation:** https://vitejs.dev/
- **Vitest Documentation:** https://vitest.dev/
