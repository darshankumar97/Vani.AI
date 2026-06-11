import hashlib
import os
import shutil
from typing import Optional, Tuple
from .config import settings
from .logger import logger

class AudioCacheManager:
    """Manages files cache to avoid redundant neural synthesis latency for duplicated texts."""

    def __init__(self, cache_dir: str = settings.CACHE_DIR, max_size_mb: int = settings.MAX_CACHE_SIZE_MB):
        self.cache_dir = cache_dir
        self.max_size_mb = max_size_mb
        # Ultra fast RAM-based Hot Caching tier
        self._memory_cache = {}  # dict of {cache_key_with_format: bytes}
        os.makedirs(self.cache_dir, exist_ok=True)
        logger.info(f"Initialized local audio disk storage cache in: {self.cache_dir} (Limit: {self.max_size_mb}MB)")

    def generate_cache_key(self, text: str, language: str, speaker_id_or_name: str, speed: float, pitch: float, format: str) -> str:
        """Creates a unique hash representing exact synthesis properties to serve as a filename lookup."""
        normalized_text = "".join(text.strip().lower().split())
        payload = f"{normalized_text}_{language}_{speaker_id_or_name}_{speed:.2f}_{pitch:.2f}_{format}"
        hash_value = hashlib.md5(payload.encode("utf-8")).hexdigest()
        return hash_value

    def get_cached_bytes(self, cache_key: str, format: str) -> Optional[bytes]:
        """Looks up memory cache first, then falls back to disk rendering. Returns audio bytes directly."""
        mem_key = f"{cache_key}.{format}"
        if mem_key in self._memory_cache:
            logger.info(f"HOT Memory Cache HIT for key: {mem_key}")
            return self._memory_cache[mem_key]
        
        # Fall back to disk
        file_path = os.path.join(self.cache_dir, mem_key)
        if os.path.exists(file_path):
            try:
                with open(file_path, "rb") as f:
                    data = f.read()
                # Promote to memory cache
                if len(self._memory_cache) < settings.MEM_CACHE_MAX_ITEMS:
                    self._memory_cache[mem_key] = data
                logger.info(f"Disk Cache HIT for key: {cache_key} (Type: {format}). Promoted to memory cache.")
                return data
            except Exception as e:
                logger.error(f"Error reading from disk cache path: {e}")
        return None

    def get_cached_file(self, cache_key: str, format: str) -> Optional[str]:
        """Looks up the cache file. Returns its path if valid, otherwise None."""
        file_path = os.path.join(self.cache_dir, f"{cache_key}.{format}")
        if os.path.exists(file_path):
            logger.info(f"Cache HIT for key: {cache_key} (Type: {format})")
            return file_path
        return None

    def save_to_cache(self, cache_key: str, audio_bytes: bytes, format: str) -> str:
        """Stores a newly synthesized audio stream block directly onto offline disk space and memory cache."""
        self._enforce_size_limit()
        mem_key = f"{cache_key}.{format}"
        
        # Memory caching logic
        if len(self._memory_cache) >= settings.MEM_CACHE_MAX_ITEMS:
            # Evict first element (simulated FIFO queue)
            oldest_key = next(iter(self._memory_cache))
            self._memory_cache.pop(oldest_key, None)
            logger.info(f"Memory cache full. Evicted oldest cache element: {oldest_key}")
            
        self._memory_cache[mem_key] = audio_bytes
        
        file_path = os.path.join(self.cache_dir, mem_key)
        try:
            with open(file_path, "wb") as f:
                f.write(audio_bytes)
            logger.info(f"Saved generated audio frame to local disk & memory cache. Key: {cache_key}")
            return file_path
        except Exception as e:
            logger.error(f"Failed writing payload bytes to cache dir file: {str(e)}")
            raise OSError(f"Cache persistence failure: {str(e)}")

    def get_cache_metrics(self) -> Tuple[int, float]:
        """Calculates current cache folder details: count of items and aggregate size in MB."""
        total_files = 0
        total_size_bytes = 0
        for entry in os.scandir(self.cache_dir):
            if entry.is_file():
                total_files += 1
                total_size_bytes += entry.stat().st_size
        size_mb = total_size_bytes / (1024 * 1024)
        return total_files, round(size_mb, 2)

    def clear_cache(self) -> None:
        """Removes all cached files from disk storage and RAM safely."""
        self._memory_cache.clear()
        for filename in os.listdir(self.cache_dir):
            file_path = os.path.join(self.cache_dir, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                logger.error(f"Failed deleting cache asset {file_path}. Details: {e}")
        logger.warning("Local audio caching folder and memory cache completely purged.")

    def _enforce_size_limit(self) -> None:
        """Deletes oldest scanned cache files if overall directory size crosses standard threshold constraints."""
        _, current_size_mb = self.get_cache_metrics()
        if current_size_mb < self.max_size_mb:
            return

        logger.warning(f"Cache limit exceeded ({current_size_mb}MB / {self.max_size_mb}MB). Removing LRU assets.")
        
        # Gather all cache files with modification times
        files = []
        for entry in os.scandir(self.cache_dir):
            if entry.is_file():
                files.append((entry.path, entry.stat().st_mtime))
        
        # Sort files ascending by modification time (oldest first)
        files.sort(key=lambda x: x[1])
        
        # Delete oldest files until size is under 80% of max limit
        target_size_bytes = self.max_size_mb * 0.8 * 1024 * 1024
        current_size_bytes = sum(os.path.getsize(f[0]) for f in files)
        
        for file_path, _ in files:
            if current_size_bytes <= target_size_bytes:
                break
            try:
                size = os.path.getsize(file_path)
                os.remove(file_path)
                current_size_bytes -= size
                logger.info(f"Evicted aged cache item: {os.path.basename(file_path)}")
            except Exception as e:
                logger.error(f"Failed evicting cached file {file_path}: {e}")

cache_manager = AudioCacheManager()
