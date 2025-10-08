# Package Manager
- Always use `pnpm` for package management commands. Never use `npm` or `yarn`.

# Code style
- Use ES modules (`import`/`export`) syntax, not CommonJS (`require`)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you’re done making a series of code changes

# React
- Create components as functions, not classes.
- Use hooks for state and lifecycle methods.
- Create components in their own directories and the main exported component in the `index.tsx` file.
