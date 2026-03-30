# ACG-CLI

**The Universal Repo Wrapper.** Drop it in. Get CLI + API + MCP. Done.

```
$ acg init → reads your repo → generates acg.yaml
$ acg run  → start the thing
$ acg test → test the thing
$ acg api start → expose as HTTP API
$ acg mcp start → expose as MCP tools
$ acg ai "explain this repo" → ask AI about it
```

Every repo. Same commands. Same interface.

## Install

```bash
npm install -g acg-cli
```

## Quick Start

```bash
cd my-project
acg init          # auto-detects runtime, creates acg.yaml
acg status        # health check
acg run           # start
acg test          # test
```

## How It Works

ACG-CLI reads a single `acg.yaml` file in your repo root and generates three interfaces:

1. **CLI** — `acg run`, `acg test`, `acg build`, `acg deploy`, plus any custom commands
2. **HTTP API** — auto-generated REST endpoints from your commands
3. **MCP Server** — auto-generated MCP tools for AI assistants

Write the config once. Get all three for free.

## Commands

| Command | Description |
|---------|-------------|
| `acg init` | Scaffold `acg.yaml` (auto-detects runtime) |
| `acg run` | Start the application |
| `acg test` | Run tests |
| `acg build` | Build the project |
| `acg deploy` | Deploy (with confirmation) |
| `acg lint` | Lint source code |
| `acg clean` | Clean build artifacts |
| `acg dev` | Start in dev mode |
| `acg status` | Quick health check |
| `acg doctor` | Full health check |
| `acg api start` | Start HTTP API server |
| `acg mcp start` | Start MCP server (stdio) |
| `acg ai <prompt>` | Ask AI about the project |

## acg.yaml

```yaml
name: my-project
version: 1.0.0
description: "What this repo does"

runtime:
  language: python    # python | node | rust | go | static
  entry: src/main.py
  port: 8080

commands:
  run:
    cmd: "python src/main.py"
    description: "Start the application"
  test:
    cmd: "pytest tests/ -v"
    description: "Run tests"
  build:
    cmd: "python -m build"
    description: "Build"
  deploy:
    cmd: "./scripts/deploy.sh"
    description: "Deploy"
    confirm: true     # requires --yes or interactive confirm

custom:
  crawl:
    cmd: "python spiders/crawl.py"
    description: "Run spiders"

api:
  port: 9000
  cors: true

mcp:
  name: my-project-mcp
  extra_tools:
    - name: search_index
      description: "Search the index"
      params: { query: string }
      cmd: python scripts/search.py --query "{query}"

ai:
  provider: local     # local (ollama) | anthropic | openai
  model: phi3
  context_files:
    - README.md
    - acg.yaml

health:
  - name: "Python version"
    check: "python --version"
    expect: "3.10"
```

## Claude Desktop Integration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-project": {
      "command": "acg",
      "args": ["mcp", "start"],
      "cwd": "/path/to/my-project"
    }
  }
}
```

Claude gets tools: `acg_run`, `acg_test`, `acg_build`, `acg_read_file`, `acg_search`, `acg_git_status`, and any custom tools from your `acg.yaml`.

## Supported Runtimes

- Python
- Node.js
- Rust
- Go
- Static sites

## License

MIT
