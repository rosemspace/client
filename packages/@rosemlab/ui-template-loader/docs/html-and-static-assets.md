# HTML and Static Assets

## Static Assets Handling

### URL Transform Rules

- If the URL is an absolute path (e.g. `/images/foo.png`), it will be preserved as-is.

- If the URL starts with `.`, it's interpreted as a relative module request and resolved based on the folder structure on your file system.

- If the URL starts with `~` or `import:`, anything after it is interpreted as a module request. This means you can even reference assets inside node modules:

    ```html
    <img src="~some-npm-package/foo.png">
    ```

- If the URL starts with @, it's also interpreted as a module request. This is useful for `npm` scoped packages and for `@` aliased to `<projectRoot>/src`.
