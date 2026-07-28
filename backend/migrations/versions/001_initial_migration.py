"""Initial database migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-07-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_login_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'password_resets',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False, index=True),
        sa.Column('token_hash', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'login_attempts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('ip_address', sa.String(45), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('attempted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'organizations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('owner_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('plan', sa.String(50), server_default='starter'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'organization_members',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('organization_id', sa.String(36), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='member'),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'businesses',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('organization_id', sa.String(36), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('industry', sa.String(100), nullable=False),
        sa.Column('description', sa.String(5000), nullable=True),
        sa.Column('website_url', sa.String(500), nullable=True),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('products', sa.JSON(), nullable=True),
        sa.Column('target_audience', sa.String(2000), nullable=True),
        sa.Column('marketing_goals', sa.JSON(), nullable=True),
        sa.Column('budget_range', sa.String(50), nullable=True),
        sa.Column('social_links', sa.JSON(), nullable=True),
        sa.Column('brand_voice', sa.String(100), nullable=True),
        sa.Column('business_analysis', sa.JSON(), nullable=True),
        sa.Column('marketing_score', sa.Integer(), server_default='0'),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'personas',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('age_range', sa.String(50), nullable=True),
        sa.Column('job_title', sa.String(255), nullable=True),
        sa.Column('income_range', sa.String(100), nullable=True),
        sa.Column('demographics', sa.JSON(), nullable=True),
        sa.Column('pain_points', sa.JSON(), nullable=True),
        sa.Column('goals', sa.JSON(), nullable=True),
        sa.Column('preferred_channels', sa.JSON(), nullable=True),
        sa.Column('buying_behavior', sa.Text(), nullable=True),
        sa.Column('content_preferences', sa.JSON(), nullable=True),
        sa.Column('objections', sa.JSON(), nullable=True),
        sa.Column('customer_journey', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'campaigns',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('objective', sa.String(100), nullable=False),
        sa.Column('status', sa.String(50), server_default='draft'),
        sa.Column('target_audience', sa.JSON(), nullable=True),
        sa.Column('platforms', sa.JSON(), nullable=True),
        sa.Column('budget_total', sa.Float(), nullable=True),
        sa.Column('budget_allocation', sa.JSON(), nullable=True),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('content_calendar', sa.JSON(), nullable=True),
        sa.Column('tasks', sa.JSON(), nullable=True),
        sa.Column('kpis', sa.JSON(), nullable=True),
        sa.Column('performance_data', sa.JSON(), nullable=True),
        sa.Column('ai_strategy', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'marketing_assets',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('campaign_id', sa.String(36), sa.ForeignKey('campaigns.id'), nullable=True),
        sa.Column('asset_type', sa.String(100), nullable=False),
        sa.Column('platform', sa.String(100), nullable=True),
        sa.Column('title', sa.String(500), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('meta_data', sa.JSON(), nullable=True),
        sa.Column('seo_data', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(50), server_default='draft'),
        sa.Column('performance_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'seo_reports',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('report_type', sa.String(100), nullable=False),
        sa.Column('score', sa.Integer(), nullable=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('issues', sa.JSON(), nullable=True),
        sa.Column('recommendations', sa.JSON(), nullable=True),
        sa.Column('meta_tags', sa.JSON(), nullable=True),
        sa.Column('schema_suggestions', sa.JSON(), nullable=True),
        sa.Column('topic_clusters', sa.JSON(), nullable=True),
        sa.Column('full_report', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'ad_campaigns',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('campaign_id', sa.String(36), sa.ForeignKey('campaigns.id'), nullable=True),
        sa.Column('platform', sa.String(100), nullable=False),
        sa.Column('ad_type', sa.String(100), nullable=False),
        sa.Column('headlines', sa.JSON(), nullable=True),
        sa.Column('descriptions', sa.JSON(), nullable=True),
        sa.Column('target_audience', sa.JSON(), nullable=True),
        sa.Column('budget_recommendation', sa.Float(), nullable=True),
        sa.Column('bidding_strategy', sa.String(100), nullable=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('predicted_ctr', sa.Float(), nullable=True),
        sa.Column('predicted_cpc', sa.Float(), nullable=True),
        sa.Column('ab_variations', sa.JSON(), nullable=True),
        sa.Column('performance_data', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(50), server_default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'competitors',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('website_url', sa.String(500), nullable=True),
        sa.Column('analysis', sa.JSON(), nullable=True),
        sa.Column('strengths', sa.JSON(), nullable=True),
        sa.Column('weaknesses', sa.JSON(), nullable=True),
        sa.Column('marketing_gaps', sa.JSON(), nullable=True),
        sa.Column('content_gaps', sa.JSON(), nullable=True),
        sa.Column('recommendations', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'automation_workflows',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('workflow_type', sa.String(100), nullable=False),
        sa.Column('nodes', sa.JSON(), nullable=True),
        sa.Column('edges', sa.JSON(), nullable=True),
        sa.Column('triggers', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='0'),
        sa.Column('execution_count', sa.Integer(), server_default='0'),
        sa.Column('last_executed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'chats',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('business_id', sa.String(36), sa.ForeignKey('businesses.id'), nullable=False),
        sa.Column('messages', sa.JSON(), nullable=True),
        sa.Column('context', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'ai_usage',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('organization_id', sa.String(36), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('operation_type', sa.String(100), nullable=False),
        sa.Column('model_used', sa.String(100), nullable=False),
        sa.Column('tokens_input', sa.Integer(), server_default='0'),
        sa.Column('tokens_output', sa.Integer(), server_default='0'),
        sa.Column('estimated_cost', sa.Float(), server_default='0'),
        sa.Column('duration_ms', sa.Integer(), server_default='0'),
        sa.Column('status', sa.String(50), server_default='success'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(50), server_default='info'),
        sa.Column('is_read', sa.Boolean(), server_default='0'),
        sa.Column('link', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index('ix_marketing_assets_business_id', 'marketing_assets', ['business_id'])
    op.create_index('ix_seo_reports_business_id', 'seo_reports', ['business_id'])
    op.create_index('ix_ad_campaigns_business_id', 'ad_campaigns', ['business_id'])
    op.create_index('ix_competitors_business_id', 'competitors', ['business_id'])
    op.create_index('ix_automation_workflows_business_id', 'automation_workflows', ['business_id'])
    op.create_index('ix_chats_user_business', 'chats', ['user_id', 'business_id'])
    op.create_index('ix_ai_usage_user_id', 'ai_usage', ['user_id'])
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_personas_business_id', 'personas', ['business_id'])
    op.create_index('ix_campaigns_business_id', 'campaigns', ['business_id'])


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('ai_usage')
    op.drop_table('chats')
    op.drop_table('automation_workflows')
    op.drop_table('competitors')
    op.drop_table('ad_campaigns')
    op.drop_table('seo_reports')
    op.drop_table('marketing_assets')
    op.drop_table('campaigns')
    op.drop_table('personas')
    op.drop_table('businesses')
    op.drop_table('organization_members')
    op.drop_table('organizations')
    op.drop_table('login_attempts')
    op.drop_table('password_resets')
    op.drop_table('users')
