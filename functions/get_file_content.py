import os
max_char = 10000

def get_file_content(working_directory: str, file_path: str):
    try:
        abs_working_directory = os.path.abspath(working_directory)
        target_directory = os.path.normpath(os.path.join(abs_working_directory, file_path))
        common_dir = os.path.commonpath([abs_working_directory, target_directory])

        if not os.path.isfile(target_directory):
            return f'Error: File not found or is not a regular file: "{file_path}"'
        if common_dir != abs_working_directory:
            return f'Error: Cannot read "{file_path}" as it is outside the permitted working directory'

        with open(target_directory, "r") as f:
            file_content = f.read(max_char)
            if f.read(1):
                file_content += f'....file "{file_path}" truncated at {max_char} characters'
        return file_content
    
    except Exception as e:
        return f"Unexpected error occured: {str(e)}"

print(get_file_content("calculator", "main.py"))
print(get_file_content("calculator", "pkg/calculator.py"))
print(get_file_content("calculator", "/bin/cat"))
print(get_file_content("calculator", "pkg/does_not_exist.py"))
