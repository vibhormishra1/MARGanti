from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    """Base Pydantic schema for all API models."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)


class ErrorResponse(BaseSchema):
    detail: str
