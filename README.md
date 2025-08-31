### NODE-TYPESCRIPT-EXPRESS 

This repo is for setting basic structure node typescript express js project

<strong>Some important things</strong>

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
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/morgan": "^1.9.10",
    "@types/node": "^24.3.0",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.2"
  }
```