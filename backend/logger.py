import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logger(name: str = "tts_backend") -> logging.Logger:
    """Configures structured logs printing to stdout + log file with backup rotations."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Avoid duplicate handlers in case of framework reloaders
    if logger.handlers:
        return logger

    # Log pattern formatting
    log_format = logging.Formatter(
        "[%(asctime)s] %(levelname)s [%(name)s:%(filename)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console stream handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    # Local rotatory file handler to cache server operations log
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)

    return logger

logger = setup_logger()
