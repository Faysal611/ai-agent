from google import genai
import os
import sys
from google.genai import types
from available_function import available_functions

def main():
    if len(sys.argv) < 2:
        print("You need to provide a prompt!")
        sys.exit(1)

    verbose = False
    if len(sys.argv) == 3 and sys.argv[2] == "--verbose":
        verbose = True

    prompt = sys.argv[1]
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    sys_prompt = """
You are a helpful AI coding agent.

When a user asks a question or makes a request, make a function call plan. You can perform the following operations:

- List files and directories

All paths you provide should be relative to the working directory. You do not need to specify the working directory in your function calls as it is automatically injected for security reasons.
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[available_functions],
            system_instruction=sys_prompt
            )
    )
    
    if verbose:
        print(response.text)
        print(f"User Prompt: {prompt}")
        print(f"Prompt token: {response.usage_metadata.prompt_token_count}")
        print(f"Response token: {response.usage_metadata.candidates_token_count}")


    if response.function_calls:
        for function_call in response.function_calls:
            print(f"Calling function: {function_call.name}({function_call.args})")
    else:
        print(response.text)
        
main()
