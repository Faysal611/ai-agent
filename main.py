from google import genai
import os
import sys
from google.genai import types
from available_function import available_functions
from functions.call_function import call_function

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
- Read file contents
- Write or overwrite files
- Execute Python files with optional arguments

All paths you provide should be relative to the working directory. You do not need to specify the working directory in your function calls as it is automatically injected for security reasons.
"""
    response = ""
    messages = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    success = False

    for _ in range(20):
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=messages,
            config=types.GenerateContentConfig(
                tools=[available_functions],
                system_instruction=sys_prompt
                )
        )

        if response.candidates is not None:
            for candidate in response.candidates:
                messages.append(candidate.content)

        if response.function_calls:
            function_call_list = []
            for function_call in response.function_calls:
                final_result: types.Content = call_function(function_call, verbose)

                if final_result.parts is None:
                    raise Exception("Parts is None!")
                if final_result.parts[0].function_response is None:
                    raise Exception("function_response in parts[0] is None!")
                if final_result.parts[0].function_response.response is None:
                    raise Exception("function_response.response in parts[0] is None!")
                # NEW READABLE CODE
                function_call_list.append(final_result.parts[0])

                if verbose:
                    # 1. Extract the raw response dictionary
                    raw_response = final_result.parts[0].function_response.response

                    # 2. Extract the inner result string if it exists
                    result_text = raw_response.get("result", str(raw_response))

                    # 3. Clean up the explicit '\n' text characters into real line breaks
                    formatted_text = result_text.replace("\\n", "\n").replace("\\t", "\t")

                    # 4. Print with clear ANSI styling / boundaries
                    print("\n" + "="*60)
                    print(f"🛠️  EXECUTED: {function_call.name}")
                    print(f"📋 ARGS:     {function_call.args}")
                    print("-"*60)
                    print(formatted_text)
                    print("="*60 + "\n")
            messages.append(types.Content(role="user", parts=function_call_list))
        else:
            success = True
            break

    if success:
        if verbose:
            print(response.text)
            print(f"User Prompt: {prompt}")
            print(f"Prompt token: {response.usage_metadata.prompt_token_count}")
            print(f"Response token: {response.usage_metadata.candidates_token_count}")
        else:
            print(response.text)
    else:
        print(
            "Error: The agent exceeded the maximum number of iterations without finishing."
        )
        sys.exit(1)

if __name__ == "__main__":
    main()
