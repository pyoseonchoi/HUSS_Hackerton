import os
import uuid
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings


class ImageStorageService:
    @staticmethod
    async def save_file(file: UploadFile, subfolder: str = "") -> str:
        """
        Saves uploaded file to settings.UPLOAD_DIR under subfolder,
        generating a unique filename to prevent collisions.
        Returns the relative path from the app root.
        """
        folder_path = os.path.join(settings.UPLOAD_DIR, subfolder)
        os.makedirs(folder_path, exist_ok=True)
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in [".jpg", ".jpeg", ".png", ".csv", ".json"]:
            raise ValueError("허용되지 않는 파일 확장자입니다. (.jpg, .jpeg, .png, .csv, .json만 지원)")
            
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(folder_path, unique_filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Convert path separators to forward slashes for URL consistency
        relative_path = os.path.relpath(file_path, start="app")
        return relative_path.replace("\\", "/")

    @staticmethod
    def get_full_url(relative_path: Optional[str], base_url: str = "http://localhost:8000") -> Optional[str]:
        if not relative_path:
            return None
        # relative_path is like 'static/uploads/...'
        # So URL is base_url + "/" + relative_path
        return f"{base_url.rstrip('/')}/{relative_path.lstrip('/')}"
