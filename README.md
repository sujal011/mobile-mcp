install termux from here : [Termux](https://github.com/termux/termux-app/releases/download/v0.119.0-beta.2/termux-app_v0.119.0-beta.2+apt-android-7-github-debug_universal.apk)

In termux 
```bash
termux-setup-storage
```

```bash
pkg update
```

```bash
pkg install nodejs
```

```bash
pkg install git
```

```
git clone https://github.com/sujal011/mobile-mcp
```

```bash
cd  mcp-backend
```

```bash
npm install
```


#Create a postgres db on neon.tech or supabase and get the database url 
in the .env file update the database url 

```bash
mv .env.example .env
```

enter the api keys if you dont have still write something


```bash
npm db:generate
```

```bash
npm db:push
```

edit your mcponfig.json file 
(Note: you will always need to rerun the backend whenver you change the mcpconfig.json)

```bash
nano mcpconfig.json
```

```bash
npm start
```

open new terminal 

```bash
cd mcp-frontend
```

```bash
npm install
```

```bash
npm run build
```

```bash
npm start
```
