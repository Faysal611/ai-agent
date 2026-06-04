import os
from google.genai import types

schema_get_files_info = types.FunctionDeclaration(
    name="get_files_info",
    description="Lists files in a specified directory relative to the working directory, providing file size and directory status",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "directory": types.Schema(
                type=types.Type.STRING,
                description="Directory path to list files from, relative to the working directory (default is the working directory itself). Do not put a leading forward or backward slash. For example, use 'assets/images' instead of '/assets/images'.",
            ),
        },
    ),
)

def get_files_info(working_directory: str, directory: str = ".") -> str:
    try:
        working_dir_abs = os.path.abspath(working_directory)
        target_dir = os.path.normpath(os.path.join(working_dir_abs, directory))
        validate_dir = os.path.commonpath([working_dir_abs, target_dir])
    
        if not os.path.isdir(target_dir):
            return f'Error: "{directory}" is not a directory'
        if not validate_dir == working_dir_abs:
            return f'Error: Cannot list "{directory}" as it is outside the permitted working directory'

        files = os.listdir(target_dir)

        output = []
        
        for file in files:
            is_dir = os.path.isdir(os.path.join(target_dir, file))
            if not is_dir:
                output.append(f"- {file}: file_size={os.path.getsize(os.path.join(target_dir, file))}, is_dir={is_dir}")
            else:
                output.append(f"- {file}: folder_size=unknown, is_dir={is_dir}")

        return f"Result for {"current" if directory == "." else directory} directory: \n" + "\n".join(output)

    except Exception as e:
        return f"Error: An unexpected error occured: {str(e)}"

