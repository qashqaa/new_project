from fastapi import APIRouter

from core.authx.custom_verify import crm_verify_dep_R

from api_v1.CRM.crm_materials.crm_materials_view import router as crm_materials_router
from api_v1.CRM.crm_products.products_view import router as crm_products_router
from api_v1.CRM.crm_orders.crm_orders_view import router as crm_order_router
from api_v1.CRM.crm_products.product_rels_view import (
    router as crm_product_material_router,
)
from api_v1.CRM.crm_orders.order_products_view import router as order_product_router
from api_v1.CRM.crm_orders.order_product_material_view import (
    router as order_product_material_router,
)
from api_v1.CRM.crm_orders.order_cost_view import router as order_cost_router
from api_v1.CRM.crm_expenses_and_income.expenses_view import (
    router as crm_expense_router,
)
from api_v1.CRM.statistics.statistics_view import router as crm_statistics_router

router = APIRouter(
    tags=["CRM"],
    prefix="/crm",
    # dependencies=[crm_verify_dep],
)
router.include_router(crm_materials_router)
router.include_router(crm_products_router)
router.include_router(crm_order_router)
router.include_router(crm_product_material_router)
router.include_router(order_product_router)
router.include_router(order_product_material_router)
router.include_router(order_cost_router)
router.include_router(crm_expense_router)
router.include_router(crm_statistics_router)