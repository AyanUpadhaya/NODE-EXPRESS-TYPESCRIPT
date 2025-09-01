### NODE-TYPESCRIPT-EXPRESS 

This repo is for setting basic structure node typescript express js project


#### Key Features Added

1. <strong>MongoDB Integration:</strong> Complete database setup with Mongoose models

2. <strong>User Authentication:</strong> JWT-based authentication system with registration and login

3. <strong>User-Specific Tasks:</strong> Tasks are tied to authenticated users

4. <strong>Input Validation:</strong> Comprehensive validation using express-validator

5. <strong>Rate Limiting:</strong> Different rate limits for various endpoints

6. <strong>Enhanced Security:</strong> Helmet, CORS, and proper error handling

7. <strong>Task Statistics:</strong> Endpoint to get task completion stats

8. <strong>Pagination:</strong> Support for paginated task results

9. <strong>Search & Filtering:</strong> Filter tasks by completion status, priority, and search terms

10. <strong>Password Management:</strong> Secure password hashing and change functionality


### Some important things

1. tsconfig.json

``` json

{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

2. package.json script
``` json
{
  "main": "dist/app.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "nodemon --exec ts-node src/app.ts"
  }
}
```

3. Extra nodemon configurations

``` json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node src/app.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

4. Developer dependencies

``` json
"devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/morgan": "^1.9.10",
    "@types/node": "^24.3.0",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.2"
  }
```