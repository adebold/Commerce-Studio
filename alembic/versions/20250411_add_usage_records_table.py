"""
Add usage_records table for API usage tracking.

Revision ID: 20250411_add_usage_records
Revises: (use the ID of the most recent migration)
Create Date: 2025-04-11 13:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
import uuid

# revision identifiers, used by Alembic.
revision = '20250411_add_usage_records'
down_revision = None  # Replace with the ID of the most recent migration
branch_labels = None
depends_on = None


def upgrade():
    # Create usage_records table
    op.create_table(
        'usage_records',
        sa.Column('id', sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
        sa.Column('tenant_id', sa.String(36), nullable=False),
        sa.Column('feature', sa.String(255), nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False, default=1),
        sa.Column('metadata', JSONB, nullable=True),
        sa.Column('recorded_at', sa.DateTime, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.Index('ix_usage_records_tenant_id', 'tenant_id'),
        sa.Index('ix_usage_records_feature', 'feature'),
        sa.Index('ix_usage_records_recorded_at', 'recorded_at')
    )
    
    # Add api_name column to plan_features table
    op.add_column(
        'plan_features',
        sa.Column('api_name', sa.String(255), nullable=True)
    )


def downgrade():
    # Drop api_name column from plan_features table
    op.drop_column('plan_features', 'api_name')
    
    # Drop usage_records table
    op.drop_table('usage_records')