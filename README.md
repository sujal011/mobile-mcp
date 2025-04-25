## Mobile-Mcp a backend and frontend ui to use mcp tools even in a mobile devices.

### How Tool Calling Works in This Implementation
When a user sends a message through the API, the following process happens:

Initial LLM Processing:

- The user message is stored in the database
- The message along with chat history is sent to the selected model
- The model processes the message and may decide to use tools


Tool Execution:

If the model includes tool calls in its response, the application:

- Identifies each requested tool
- Executes each tool with the provided arguments
- Records the tool execution and results in the database
- Creates tool call messages with the results


Final Response Generation:

- After tool execution, the tool results are fed back to the model
- The model generates a final response that incorporates the tool results
- This final response is stored in the database and returned to the user

Things to implement next : 

- just deploy this backend first and then it will work properly
- or create a expo mobile app with server side option in expo and deploy it to eas
- streaming the messages with sse
- creating all in one script for termux to directly executes all installation steps
- improving overall ui
- Yeah, improve this documentation

# Installation Steps : 
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

## Create a postgres db on neon.tech or supabase and get the database url 
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

## Now to use tavily mcp server you can :

```bash
npm install tavily-mcp@0.1.4
```

create a tavily api key from [here](https://app.tavily.com/home)

edit the .env file
```
TAVILY_API_KEY = <your-tavily-api-key
```

edit your mcponfig.json file 
(Note: you will always need to rerun the backend whenver you change the mcpconfig.json)

```bash
nano mcpconfig.json
```

```json
{
  "mcpServers": {
    "tavily-mcp": {
      "command": "node",
      "args": [
        "node_modules/tavily-mcp/build/index.js"
      ]
}
  }
}
```

Note : the npx command does not work so if you have any mcp server which has npx parameter in it you can simply npm install it and use it with the example like above and if it requires the api key add it to the .env then run thr dev server

```bash
npm run dev
```
(inside the mcp-backend folder)
