from abc import ABC, abstractmethod
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import UserModel


class AuthRepository(ABC):
    @abstractmethod
    async def get_user_by_email(self, email: str) -> Optional[UserModel]:
        pass

    @abstractmethod
    async def create_user(self, user: UserModel) -> UserModel:
        pass


class SQLAlchemyAuthRepository(AuthRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_email(self, email: str) -> Optional[UserModel]:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_user(self, user: UserModel) -> UserModel:
        self.session.add(user)
        await self.session.flush()
        return user
