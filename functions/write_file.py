import os

def write_file(working_directory: str, file_path: str, content: str) -> str:
    abs_working_dir = os.path.abspath(working_directory)
    abs_file_dir = os.path.normpath(os.path.join(abs_working_dir, file_path))
    common_dir = os.path.commonpath([abs_working_dir, abs_file_dir])
    print(abs_working_dir)
    print(abs_file_dir)
    print(common_dir)
    if not common_dir == abs_working_dir:
        return f'Error: Cannot write to "{file_path}" as it is outside the permitted working directory'
    if os.path.isdir(abs_file_dir):
        return f'Error: Cannot write to "{file_path}" as it is a directory'
    parent_dir = os.path.dirname(abs_file_dir)
    os.makedirs(parent_dir, exist_ok=True)

    try:
        with open(abs_file_dir, "w") as f:
            num = f.write(content)
            return f'Successfully wrote to "{file_path}" ({num} characters written)'
    except Exception as e:
        return f"Error occured: {str(e)}"

