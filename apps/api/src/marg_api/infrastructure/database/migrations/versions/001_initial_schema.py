"""initial_schema

Revision ID: 001
Revises:
Create Date: 2026-08-09 17:30:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "incidents",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("address", sa.String(length=512), nullable=True),
        sa.Column("grid_cell", sa.String(length=64), nullable=True),
        sa.Column("priority", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("reporter_id", sa.String(length=64), nullable=False),
        sa.Column("reported_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_incident_lat_lng", "incidents", ["latitude", "longitude"])
    op.create_index("idx_incident_status_priority", "incidents", ["status", "priority"])
    op.create_index(op.f("ix_incidents_priority"), "incidents", ["priority"])
    op.create_index(op.f("ix_incidents_status"), "incidents", ["status"])

    op.create_table(
        "inventory_items",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("catalog_id", sa.String(length=64), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("total_quantity", sa.JSON(), nullable=False),
        sa.Column("available_quantity", sa.JSON(), nullable=False),
        sa.Column("maintenance_status", sa.String(length=32), nullable=False),
        sa.Column("reservations", sa.JSON(), nullable=True),
        sa.Column("maintenance_records", sa.JSON(), nullable=True),
        sa.Column("last_updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_inventory_items_category"), "inventory_items", ["category"])

    op.create_table(
        "missions",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("incident_id", sa.String(length=64), nullable=False),
        sa.Column("commander_id", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.String(length=32), nullable=False),
        sa.Column("objective", sa.JSON(), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("tasks", sa.JSON(), nullable=True),
        sa.Column("task_dependencies", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_missions_incident_id"), "missions", ["incident_id"])
    op.create_index(op.f("ix_missions_status"), "missions", ["status"])

    op.create_table(
        "organizations",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("departments", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "resource_allocations",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("incident_id", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("assigned_to", sa.String(length=64), nullable=False),
        sa.Column("allocations", sa.JSON(), nullable=True),
        sa.Column("dispatched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("timeline", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_resource_allocations_incident_id"), "resource_allocations", ["incident_id"])
    op.create_index(op.f("ix_resource_allocations_status"), "resource_allocations", ["status"])

    op.create_table(
        "responders",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("organization_id", sa.String(length=64), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
        sa.Column("contact_info", sa.JSON(), nullable=False),
        sa.Column("skills", sa.JSON(), nullable=True),
        sa.Column("certifications", sa.JSON(), nullable=True),
        sa.Column("availability", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("current_latitude", sa.Float(), nullable=True),
        sa.Column("current_longitude", sa.Float(), nullable=True),
        sa.Column("shifts", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_responders_organization_id"), "responders", ["organization_id"])
    op.create_index(op.f("ix_responders_status"), "responders", ["status"])

    op.create_table(
        "teams",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("organization_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("team_leader_id", sa.String(length=64), nullable=False),
        sa.Column("members", sa.JSON(), nullable=True),
        sa.Column("current_incident_id", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_teams_organization_id"), "teams", ["organization_id"])
    op.create_index(op.f("ix_teams_status"), "teams", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_teams_status"), table_name="teams")
    op.drop_index(op.f("ix_teams_organization_id"), table_name="teams")
    op.drop_table("teams")
    op.drop_index(op.f("ix_responders_status"), table_name="responders")
    op.drop_index(op.f("ix_responders_organization_id"), table_name="responders")
    op.drop_table("responders")
    op.drop_index(op.f("ix_resource_allocations_status"), table_name="resource_allocations")
    op.drop_index(op.f("ix_resource_allocations_incident_id"), table_name="resource_allocations")
    op.drop_table("resource_allocations")
    op.drop_table("organizations")
    op.drop_index(op.f("ix_missions_status"), table_name="missions")
    op.drop_index(op.f("ix_missions_incident_id"), table_name="missions")
    op.drop_table("missions")
    op.drop_index(op.f("ix_inventory_items_category"), table_name="inventory_items")
    op.drop_table("inventory_items")
    op.drop_index(op.f("ix_incidents_status"), table_name="incidents")
    op.drop_index(op.f("ix_incidents_priority"), table_name="incidents")
    op.drop_index("idx_incident_status_priority", table_name="incidents")
    op.drop_index("idx_incident_lat_lng", table_name="incidents")
    op.drop_table("incidents")
