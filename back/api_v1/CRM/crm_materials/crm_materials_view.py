from fastapi import APIRouter, status, Depends

from api_v1.CRM.crm_materials.materials_schemas import (
    MaterialCreateSchema,
    MaterialSchema,
    MaterialAppendSchema,
    MaterialFilterSchema,
    MaterialPartialUpdateSchema,
)
from api_v1.CRM.crm_materials.crm_materials_services import (
    create_material_service,
    get_materials_service,
    append_material_service,
    get_material_by_id_service,
    partial_update_service,
    delete_material_service,
)
from core.ResponseModel.response_model import PaginatedResponse
from core.postgres_db import SessionDepPG

router = APIRouter(prefix="/materials")


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=MaterialSchema,
)
async def crm_create_material(
    session: SessionDepPG, create_material_schema: MaterialCreateSchema
) -> MaterialSchema:
    new_material: MaterialSchema = await create_material_service(
        session=session, create_material_schema=create_material_schema
    )
    return new_material


@router.get("/", response_model=PaginatedResponse[MaterialSchema])
async def crm_get_materials(
    session: SessionDepPG, filters: MaterialFilterSchema = Depends()
):
    materials: tuple[list[MaterialSchema], int] = await get_materials_service(
        session=session, filters=filters
    )

    return PaginatedResponse(
        items=materials[0],
        total=materials[-1],
        skip=filters.skip,
        limit=filters.limit,
        has_more=(filters.skip + filters.limit) < materials[-1],
    )


@router.get("/{material_id}", response_model=MaterialSchema)
async def crm_get_material_by_id(
    session: SessionDepPG, material_id: str
) -> MaterialSchema:
    material: MaterialSchema = await get_material_by_id_service(
        session=session, material_id=material_id
    )
    return material


@router.patch("/{material_id}/change_count", response_model=MaterialSchema)
async def crm_material_cnt_change(
    session: SessionDepPG,
    update_data: MaterialAppendSchema,
    material_id: str,
) -> MaterialSchema:
    material: MaterialSchema = await append_material_service(
        session=session, material_id=material_id, update_data=update_data
    )
    return material


@router.patch("/{material_id}", response_model=MaterialSchema)
async def crm_partial_update(
    session: SessionDepPG,
    material_id: str,
    update_data: MaterialPartialUpdateSchema,
) -> MaterialSchema:
    material: MaterialSchema = await partial_update_service(
        session=session, material_id=material_id, update_data=update_data
    )

    return material


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def crm_delete(session: SessionDepPG, material_id: str):
    await delete_material_service(session=session, material_id=material_id)
