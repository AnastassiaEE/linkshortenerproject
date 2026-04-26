# UI Components - shadcn/ui Standards

## Overview

This application uses **shadcn/ui** exclusively for all UI components. All UI elements must be built using shadcn/ui components, styled with Tailwind CSS.

## Core Rules

### ✅ Required Patterns

1. **shadcn/ui Only**: All UI components must come from shadcn/ui
2. **No Custom Components**: Never create custom base components from scratch
3. **Tailwind Styling**: Use Tailwind CSS utilities for all styling
4. **Component Composition**: Build complex UIs by composing shadcn/ui components
5. **Use Existing Components**: Check available shadcn/ui components before building

### ❌ Never Do

- ❌ Create custom button, input, dialog, or other base UI components
- ❌ Use other UI libraries (Material-UI, Chakra, Ant Design, etc.)
- ❌ Write custom CSS files for component styling
- ❌ Use inline styles or styled-components
- ❌ Reinvent components that exist in shadcn/ui

---

## Available Components

shadcn/ui provides a comprehensive set of components. Always check the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) before creating any UI element.

### Common Components

- **Button**: Primary UI interaction element
- **Input**: Text inputs, textareas
- **Dialog**: Modals and dialogs
- **Card**: Content containers
- **Form**: Form components with validation
- **Dropdown Menu**: Menus and dropdowns
- **Toast**: Notifications
- **Table**: Data tables
- **Tabs**: Tab navigation
- **Badge**: Status indicators
- **Avatar**: User avatars
- **Select**: Dropdown selections
- **Checkbox**: Boolean inputs
- **Radio Group**: Single selection from multiple options
- **Switch**: Toggle controls
- **Label**: Form labels
- **Alert**: Alert messages
- **Sheet**: Side panels
- **Popover**: Floating content
- **Tooltip**: Contextual hints

---

## Usage Patterns

### Button Example

```tsx
// ✅ Correct: Use shadcn/ui Button
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <Button variant="default" size="lg">
      Click Me
    </Button>
  );
}
```

```tsx
// ❌ Wrong: Custom button component
export function MyComponent() {
  return <button className="custom-button">Click Me</button>;
}
```

### Form Example

```tsx
// ✅ Correct: Use shadcn/ui Form components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MyForm() {
  return (
    <form>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
```

### Dialog Example

```tsx
// ✅ Correct: Use shadcn/ui Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description goes here.</DialogDescription>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Customization Guidelines

### Tailwind Variants

Customize shadcn/ui components using Tailwind CSS utilities:

```tsx
// ✅ Correct: Tailwind utilities for customization
<Button className="w-full bg-primary hover:bg-primary/90">Full Width Button</Button>
```

```tsx
// ❌ Wrong: Inline styles
<Button style={{ width: '100%', backgroundColor: 'blue' }}>Full Width Button</Button>
```

### Component Composition

Build complex components by composing shadcn/ui primitives:

```tsx
// ✅ Correct: Compose shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function LinkCard({ title, url, clicks }: LinkCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge>{clicks} clicks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{url}</p>
        <Button className="mt-4" variant="outline">
          Copy Link
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Adding New shadcn/ui Components

When you need a component that doesn't exist yet in the project:

1. Install via the shadcn/ui CLI:

   ```bash
   npx shadcn@latest add [component-name]
   ```

2. Import and use the component:

   ```tsx
   import { ComponentName } from '@/components/ui/component-name';
   ```

3. **Never create it manually** - always use the CLI to ensure consistency

---

## Common Pitfalls

### ⚠️ Don't Recreate Existing Components

```tsx
// ❌ Wrong: Creating custom card component
export function CustomCard({ children }: { children: React.ReactNode }) {
  return <div className="border rounded-lg p-4">{children}</div>;
}
```

```tsx
// ✅ Correct: Use shadcn/ui Card
import { Card, CardContent } from '@/components/ui/card';

export function MyCard({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
```

### ⚠️ Don't Mix UI Libraries

```tsx
// ❌ Wrong: Mixing UI libraries
import { Button } from '@/components/ui/button'; // shadcn/ui
import { TextField } from '@mui/material'; // Material-UI - NEVER DO THIS

export function MyForm() {
  return (
    <>
      <TextField label="Email" />
      <Button>Submit</Button>
    </>
  );
}
```

```tsx
// ✅ Correct: Use only shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MyForm() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
      <Button>Submit</Button>
    </div>
  );
}
```

---

## Best Practices

1. **Check Documentation First**: Before building any UI element, check if shadcn/ui has a component for it
2. **Use Semantic Variants**: Use predefined variants (`default`, `secondary`, `outline`, `ghost`, `destructive`) instead of custom styling
3. **Compose Don't Create**: Build complex UIs by composing simple shadcn/ui components
4. **Consistent Spacing**: Use Tailwind spacing utilities (`space-y-4`, `gap-4`, etc.) for consistent layout
5. **Accessibility**: shadcn/ui components are accessible by default - don't remove accessibility features

---

## Quick Reference

| Need                | Use This Component             |
| ------------------- | ------------------------------ |
| Button, link action | `Button`                       |
| Text input          | `Input`                        |
| Dropdown            | `Select` or `DropdownMenu`     |
| Modal/dialog        | `Dialog`                       |
| Notification        | `Toast`                        |
| Content card        | `Card`                         |
| Form                | `Form`, `Input`, `Label`       |
| Navigation          | `Tabs` or custom with `Button` |
| Status indicator    | `Badge`                        |
| User avatar         | `Avatar`                       |
| Side panel          | `Sheet`                        |
| Tooltip             | `Tooltip`                      |
| Alert               | `Alert`                        |

---

## Summary

- **Always use shadcn/ui components** - never create custom base UI components
- **Style with Tailwind CSS** - no custom CSS files or inline styles
- **Compose for complexity** - build complex UIs from simple shadcn/ui primitives
- **Add via CLI** - use `npx shadcn@latest add [component]` for new components
- **Check documentation** - visit https://ui.shadcn.com before building any UI
