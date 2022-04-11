---
name: "Hello World"
description: "Says hello to the world"
scopes: ["typescript"]
prefix: "helloWorld"
---

```typescript
export const hello = (str: string): void => {
	console.info("Hello %s", str);
};
```
