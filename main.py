from google import genai
import os
import sys

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

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    if verbose:
        print(response.text)
        print(f"User Prompt: {prompt}")
        print(f"Prompt token: {response.usage_metadata.prompt_token_count}")
        print(f"Response token: {response.usage_metadata.candidates_token_count}")
    else:
        print(response.text)
main()
