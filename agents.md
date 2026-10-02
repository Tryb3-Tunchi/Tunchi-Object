# Lumen — AI Engineering Contract

## 1. Project Identity

Lumen is an HNG15 Lesson 2 individual e-commerce project.

The application is a small modern storefront where users can:

- Browse products
- Add products to a cart
- Authenticate using Google
- Complete checkout
- Persist orders in Supabase
- View previous orders
- Receive order confirmation emails

The application is intentionally simple in scope but must be implemented with professional engineering practices.

---

# 2. Technology Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React

Backend / Infrastructure:

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Edge Functions
- Mailgun

Deployment:

- Vercel

Repository:

- Private GitHub repository

---

# 3. HNG15 Requirements

The Lesson 2 individual task requires:

1. Build a website for a shop.
2. Add a checkout page.
3. Persist everything in a database using Supabase or Neon.
4. Send confirmation emails using Mailgun.
5. Implement Google authentication using Google Cloud Console.
6. Complete the task before the stated deadline.

The team Zedu task is outside the scope of this repository.

Do not implement the team Zedu task here unless explicitly requested.

---

# 4. Source of Truth

When instructions conflict, use this order:

1. Explicit HNG requirements
2. Existing project architecture
3. This agents.md file
4. Existing implementation decisions
5. AI suggestions

AI suggestions must never silently override project requirements.

---

# 5. Non-Negotiable Rules

## Never invent requirements

Do not add major functionality simply because it seems useful.

Examples:

- Do not add payment processing unless requested.
- Do not add an AI chatbot unless requested.
- Do not add an admin dashboard unless requested.
- Do not add unnecessary backend infrastructure.
- Do not introduce unnecessary dependencies.

---

## Never expose secrets

Never place:

- Mailgun API keys
- Supabase service-role keys
- private credentials
- OAuth client secrets

inside frontend source code.

Frontend environment variables must only contain values safe for browser exposure.

---

## Never trust client prices

The browser must never be authoritative for product pricing.

The database must:

1. Retrieve the actual product.
2. Verify stock.
3. Retrieve the actual price.
4. Calculate the subtotal.
5. Calculate the order total.
6. Reduce stock.
7. Create the order.

---

## Preserve data integrity

Order creation must be atomic.

If any product is unavailable or an operation fails, the database transaction must not leave a partially-created order.

---

# 6. Architecture

The application follows:

React UI
↓
Contexts / UI state
↓
Supabase client
↓
Supabase Auth / PostgreSQL / Edge Functions
↓
Mailgun

Frontend responsibilities:

- Rendering
- Navigation
- Cart interaction
- Form collection
- Authentication interaction
- Displaying database results

Database responsibilities:

- Persistent product data
- Persistent order data
- Persistent order item data
- Price authority
- Stock validation
- Order transaction
- Access control

Edge Function responsibilities:

- Verify authenticated user
- Retrieve the user's order
- Generate confirmation email
- Communicate with Mailgun

---

# 7. Security

Supabase Row Level Security must remain enabled.

Users must only be able to read their own orders.

Users must only be able to read order items belonging to their own orders.

Products may be publicly readable.

The service role key must never be used in browser code.

---

# 8. Authentication

Authentication uses:

Supabase Auth

- Google OAuth
- Google Cloud Console

Do not implement custom password authentication unless explicitly requested.

After successful authentication, the application should return the user to the appropriate protected page.

---

# 9. Cart

The cart is client-side state.

The current implementation persists the cart using localStorage.

The database remains authoritative when the order is created.

The browser's cart total is for presentation only.

The database recalculates the actual order total.

---

# 10. UI/UX

The interface should feel intentional rather than like a generic AI-generated storefront.

Priorities:

- Clear visual hierarchy
- Responsive layout
- Strong typography
- Accessible controls
- Useful empty states
- Useful loading states
- Useful error states
- Consistent spacing
- Consistent interaction patterns
- Mobile usability

Do not add visual effects purely for decoration.

Every visual decision should support:

- hierarchy
- usability
- brand identity
- product discovery
- readability

---

# 11. Accessibility

Interactive elements must have:

- meaningful labels
- keyboard accessibility
- visible focus states
- sufficient contrast

Images must have useful alt text.

Do not use icons as the only accessible meaning where text is necessary.

---

# 12. Coding Standards

Use:

- TypeScript
- functional React components
- meaningful component names
- small focused components
- semantic HTML
- clear variable names

Avoid:

- `any`
- unnecessary abstraction
- duplicated logic
- huge components
- magic numbers
- dead code
- commented-out old implementations

---

# 13. Dependencies

Do not add a dependency without first answering:

1. What problem does it solve?
2. Can the problem be solved cleanly without it?
3. Is the dependency actively maintained?
4. Does it fit the current architecture?

For a small HNG project, simplicity is preferred over dependency count.

---

# 14. AI Agent Workflow

AI agents are collaborators, not sources of truth.

Recommended roles:

### ChatGPT

Primary architecture and integration reviewer.

Responsibilities:

- Requirements analysis
- Architecture
- Cross-agent reconciliation
- Security review
- Final consistency review

### Claude

Implementation and detailed code review.

Responsibilities:

- Component implementation
- Refactoring
- UX implementation
- Detailed code review

### Gemini

Research and product/UX perspective.

Responsibilities:

- Research
- Alternative implementation approaches
- Accessibility review
- UX ideas

### Kimi

Adversarial reviewer.

Responsibilities:

- Find assumptions
- Identify bugs
- Challenge unnecessary complexity
- Identify security problems
- Test edge cases

---

# 15. AI Handoff Protocol

Before another AI works on the project, provide:

1. Current project requirements
2. Current architecture
3. Relevant files
4. Existing decisions
5. Current task
6. Known issues

The AI must not rebuild working functionality simply because it prefers another implementation.

---

# 16. Change Protocol

Before making a significant change:

1. Explain the problem.
2. Explain the proposed solution.
3. Identify affected files.
4. Identify potential side effects.
5. Implement the smallest appropriate change.
6. Test the change.
7. Report what was verified.

---

# 17. Verification

Never claim that something works unless it has been tested.

At minimum, before a final submission:

```bash
npm run lint
npm run build
```
