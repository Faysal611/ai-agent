import os
import subprocess

def run_python_file(
working_directory: str, file_path: str, args: list[str] | None = None
) -> str:
    abs_working_dir = os.path.abspath(working_directory)
    abs_file_path = os.path.normpath(os.path.join(abs_working_dir, file_path))
    common_dir = os.path.commonpath([abs_working_dir, abs_file_path])

    if not common_dir == abs_working_dir:
        return f'Error: Cannot execute "{file_path}" as it is outside the permitted working directory'
    if not os.path.isfile(abs_file_path):
        return f'Error: "{file_path}" does not exist or is not a regular file'
    if not file_path.endswith(".py"):
        return f'Error: "{file_path}" is not a Python file'

    try:
        cli_commands = ["python", abs_file_path]
        safe_arg = args if args is not None else []
        cli_commands.extend(safe_arg)
        output = subprocess.run(cli_commands,
                                timeout=40,
                                text=True,
                                capture_output=True,)
        final_result = f"""STDOUT: {output.stdout}
STDERR: {output.stderr}
"""
        if output.returncode != 0:
            final_result += f"Process exited with code {output.returncode}"
        if output.stderr == "" and output.stdout == "":
            final_result += "No output produced"
        
        return final_result
    except Exception as e:
        return f"Error: executing Python file: {e}"
