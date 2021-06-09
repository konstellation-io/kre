We use prettier for formatting.

### Names
- Use PascalCase for `React components`, `types` and `interfaces`.
- Use UPPERCASE for `enums`.
- user snake_case for files not related with the React application.
- Use whole words in names when possible.

### Directory structure
- Name directories with the same name as the component it represents.
- Try to keep the components at lower levels as possible. For instance, a component only used
  at a particular page should be placed inside the `components` directory of that page, if the component
  is used in other places, shift up to the most appropriate level (up to the main `Components` directory).

### Types
- Do not export `types`, `interfaces` or `functions` unless you need then elsewhere.
- Do not introduce values in the global namespace.

### Style
- Do not use `arrow functions` unless it offers a clear advantage (for instance, when a React component only includes the return statement).
- Do not use `@ts-ignore` or `any` unless strictly necessary.
- Do not add `FIXME` or `TODO` traces to the code. You can add them temporally while working on a task but do not upload
  those traces.

### CSS
- Try not to use pixel units, instead, use `$grid-unit`. You can multiply this unit by any number.
- Do not use colors not included in `colors.scss`.
- Do not use fonts not included in `mixins.scss`.
- When needing to add some particular color to JS code, use SASS [export](https://stackoverflow.com/questions/57536228/export-sass-scss-variables-to-javascript-without-exporting-them-to-css) to evade color declarations from JS files.

> Note: when using $grid-unit, multiply it by reasonable numbers (x2, x2.5, x4...), try to evade using values
> like `1.43 * $grid-unit` as it does not make sense, it is better to use raw pixels than awkward multiplications.
