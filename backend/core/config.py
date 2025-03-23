from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    TITLE: str
    DESCRIPTION: str
    SQLALCHEMY_DATABASE_URI: str


@lru_cache
def get_settings():
    return Settings()
