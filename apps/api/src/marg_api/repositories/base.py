"""Base abstract repository."""

from typing import Any, Generic, TypeVar

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Base abstract repository class."""

    def __init__(self, session: Any) -> None:
        """
        Initialize the repository with a database session or client.
        The session type is Any here, but should be typed strictly in concrete repositories.
        """
        self.session = session
