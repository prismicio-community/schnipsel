---
name: "Hello World Invalid"
description: "Says hello to the world invalid"
scope: false
prefix: 42
---

```typescript
export const hello = (str: string): void => {
	console.info("Hello %s", str);
};
```
