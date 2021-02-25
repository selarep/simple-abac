# This project is not beeing mantained at this time. 
# Please be careful if you use it. Do on your own responsibility.

# simple-abac
Node.js package that makes attribute based access control (ABAC) simple.

## Usage  
### Installation:
`npm i simple-abac -S`

### Import in your project:  
+ Typescript/ES6:
```typescript
  import { SimpleAbac } from 'simple-abac';
  const abac = new SimpleAbac();
```
+ Javascript(ES5):
```javascript
  let SimpleAbac = require('simple-abac').SimpleAbac;
  let abac = new SimpleAbac();
```

### Defining permissions:  
Allow editor to read all attributes of posts except authorId:
```typescript
  abac.allow({
    role: 'editor',
    actions: 'read',
    targets: 'post',
    attributes: { mode: 'all', except: ['authorId']},
  });
```

Allow admin to read all attributes of posts:
```typescript
  abac.allow({
    role: 'admin',
    actions: 'read',
    targets: 'post',
    attributes: { mode: 'all' },
  });
```

Allow any to read only content and title of posts:
```typescript
  abac.allow({
    role: 'any',
    actions: 'read',
    targets: 'post',
    attributes: { mode: 'nothing', except: ['content', 'title'] },
  });
```

Allow editor to delete only posts created by him:
```typescript
  abac.allow({
    role: 'editor',
    actions: 'delete',
    targets: 'post',
    condition: (userId, targetOptions) => {
      return userId === targetOptions.authorId;
    }
  });
```

### Asking permissions:  
Asking if editor with id: 1 can read post:
```typescript
  const permission = await abac.can({ id: 1, role: 'editor' }, 'read', 'post', {});
  /* 
  {
    granted: true,
    attributes: {
      mode: 'all',
      except: ['authorId']
    }
  } 
  */
```

Asking if any can read post:
```typescript
  const permission = await abac.can(undefined, 'read', 'post', {});
  /* 
  {
    granted: true,
    attributes: {
      mode: 'nothing',
      except: ['content', 'title']
    }
  } 
  */
```

Asking if editor with id: 1 can delete a post written by editor with id: 3:
```typescript
  const permission = await abac.can({ id: 1, role: 'editor' }, 'delete', 'post', {authorId: 3, ...});
  /* 
  {
    granted: false,
    attributes: {
      mode: 'nothing'
    }
  }
  */
```

Asking if editor with id: 3 can delete a post written by editor with id: 3:
```typescript
  const permission = await abac.can({ id: 3, role: 'editor' }, 'delete', 'post', {authorId: 3, ...});
  /* 
  {
    granted: true,
    attributes: {
      mode: 'all'
    }
  }
  */
```
