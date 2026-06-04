# AI Coding Agent

A simple AI-powered coding agent built using the Gemini API. The agent can interact with files and execute Python scripts through function calling.

## Features

* List files and directories
* Read file contents
* Write or overwrite files
* Execute Python files with optional arguments

## Setup

### 1. Add your Gemini API Key

Create a `.env` file in the project root and add:

```env
GEMINI_API_KEY=your_api_key_here
```

### 2. Configure the Working Directory

The agent is restricted to a specific project folder for safety.

To change the folder the agent can access:

1. Open `root.py`
2. Locate the `root_folder` variable
3. Change it to your desired directory path

Example:

```python
root_folder = "./path/to/your/project"
```

## Demo Project

A sample project is included in the `project/` directory.

You can use this folder to test the agent's capabilities without modifying your own files. The example prompts and agent functionality can be safely explored using the demo project before pointing the agent to another directory.

## Usage

Run the agent with a prompt:

```bash
uv run main.py "read the contents of note.txt"
```

Enable verbose mode:

```bash
uv run main.py "read the contents of note.txt" --verbose
```

## Warning

⚠️ This is a test and learning project.

The agent can read files, write files, and execute Python code within the configured project directory. Incorrect prompts or bugs may lead to unintended file modifications.

Always:

* Review generated changes carefully.
* Use a test directory when experimenting.
* Keep backups of important files.
* Exercise caution before allowing the agent to modify real projects.

This project is intended for educational and experimental purposes and should not be considered production-ready.
