"""Add opticians catalog tables

Revision ID: 01_add_opticians_catalog
Revises: 
Create Date: 2025-03-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '01_add_opticians_catalog'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create opticians_stores table
    op.create_table(
        'opticians_stores',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('store_name', sa.String(), nullable=False),
        sa.Column('store_description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('primary_color', sa.String(), nullable=True),
        sa.Column('secondary_color', sa.String(), nullable=True),
        sa.Column('contact_email', sa.String(), nullable=True),
        sa.Column('contact_phone', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('custom_domain', sa.String(), nullable=True),
        sa.Column('subdomain', sa.String(), nullable=False),
        sa.Column('theme_template', sa.String(), nullable=True),
        sa.Column('custom_css', sa.Text(), nullable=True),
        sa.Column('custom_header', sa.Text(), nullable=True),
        sa.Column('custom_footer', sa.Text(), nullable=True),
        sa.Column('featured_products', sa.JSON(), nullable=True),
        sa.Column('homepage_sections', sa.JSON(), nullable=True),
        sa.Column('navigation_menu', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('custom_domain'),
        sa.UniqueConstraint('subdomain')
    )
    
    # Create opticians_products table
    op.create_table(
        'opticians_products',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('store_id', sa.String(), nullable=False),
        sa.Column('frame_id', sa.String(), nullable=False),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('stock', sa.Integer(), nullable=True),
        sa.Column('is_featured', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('custom_description', sa.Text(), nullable=True),
        sa.Column('custom_attributes', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['opticians_stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create product_requests table
    op.create_table(
        'product_requests',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('store_id', sa.String(), nullable=False),
        sa.Column('product_id', sa.String(), nullable=False),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('customer_email', sa.String(), nullable=False),
        sa.Column('customer_phone', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('prescription_data', sa.JSON(), nullable=True),
        sa.Column('appointment_preference', sa.String(), nullable=True),
        sa.Column('custom_fields', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['opticians_products.id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['opticians_stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create request_form_templates table
    op.create_table(
        'request_form_templates',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('store_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('fields', sa.JSON(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['opticians_stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create store_page_customizations table
    op.create_table(
        'store_page_customizations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('store_id', sa.String(), nullable=False),
        sa.Column('page_type', sa.String(), nullable=False),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['opticians_stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create catalog_analytics table
    op.create_table(
        'catalog_analytics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('store_id', sa.String(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('page_views', sa.Integer(), nullable=True),
        sa.Column('unique_visitors', sa.Integer(), nullable=True),
        sa.Column('product_views', sa.JSON(), nullable=True),
        sa.Column('search_terms', sa.JSON(), nullable=True),
        sa.Column('requests_submitted', sa.Integer(), nullable=True),
        sa.Column('recommendation_clicks', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['opticians_stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index(op.f('ix_opticians_stores_client_id'), 'opticians_stores', ['client_id'], unique=False)
    op.create_index(op.f('ix_opticians_products_store_id'), 'opticians_products', ['store_id'], unique=False)
    op.create_index(op.f('ix_opticians_products_frame_id'), 'opticians_products', ['frame_id'], unique=False)
    op.create_index(op.f('ix_product_requests_store_id'), 'product_requests', ['store_id'], unique=False)
    op.create_index(op.f('ix_product_requests_product_id'), 'product_requests', ['product_id'], unique=False)
    op.create_index(op.f('ix_product_requests_status'), 'product_requests', ['status'], unique=False)
    op.create_index(op.f('ix_request_form_templates_store_id'), 'request_form_templates', ['store_id'], unique=False)
    op.create_index(op.f('ix_store_page_customizations_store_id'), 'store_page_customizations', ['store_id'], unique=False)
    op.create_index(op.f('ix_store_page_customizations_page_type'), 'store_page_customizations', ['page_type'], unique=False)
    op.create_index(op.f('ix_catalog_analytics_store_id'), 'catalog_analytics', ['store_id'], unique=False)
    op.create_index(op.f('ix_catalog_analytics_date'), 'catalog_analytics', ['date'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order of creation
    op.drop_table('catalog_analytics')
    op.drop_table('store_page_customizations')
    op.drop_table('request_form_templates')
    op.drop_table('product_requests')
    op.drop_table('opticians_products')
    op.drop_table('opticians_stores')
