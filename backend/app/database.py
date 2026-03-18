import logging
import time

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    logger = logging.getLogger(__name__)
    last_error = None

    for attempt in range(1, settings.DB_INIT_MAX_RETRIES + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as exc:
            last_error = exc
            if attempt == settings.DB_INIT_MAX_RETRIES:
                break
            logger.warning(
                "Database initialization failed (attempt %s/%s). Retrying in %s seconds.",
                attempt,
                settings.DB_INIT_MAX_RETRIES,
                settings.DB_INIT_RETRY_DELAY_SECONDS,
            )
            time.sleep(settings.DB_INIT_RETRY_DELAY_SECONDS)

    raise last_error


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
