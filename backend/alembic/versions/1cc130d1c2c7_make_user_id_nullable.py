"""make user_id nullable

Revision ID: 1cc130d1c2c7
Revises: 8e96e7661074
Create Date: 2026-02-25 15:26:03.623092

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1cc130d1c2c7'
down_revision: Union[str, Sequence[str], None] = '8e96e7661074'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1️⃣ Add column as nullable first
    op.add_column(
        'orders',
        sa.Column('user_id', sa.Integer(), nullable=True)
    )

    # 2️⃣ Assign existing orders to buyer (id=1)
    op.execute("UPDATE orders SET user_id = 1 WHERE user_id IS NULL")

    # 3️⃣ Make it NOT NULL
    op.alter_column('orders', 'user_id', nullable=False)

    # 4️⃣ Add foreign key
    op.create_foreign_key(
        'fk_orders_user_id',
        'orders',
        'users',
        ['user_id'],
        ['id']
    )
    
    
def downgrade() -> None:
    op.drop_constraint('fk_orders_user_id', 'orders', type_='foreignkey')
    op.drop_column('orders', 'user_id')