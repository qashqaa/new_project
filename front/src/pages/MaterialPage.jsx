import React, { useState, useEffect } from 'react';
import { materialsApi } from '../api/client';
import MaterialFilters from '../components/materials/MaterialFilters.jsx';
import MaterialCard from '../components/materials/MaterialCard.jsx';
import MaterialPagination from '../components/materials/MaterialPagination.jsx';
import CreateMaterialModal from '../components/materials/CreateMaterialModal.jsx';
import EditMaterialModal from '../components/materials/EditMaterialModal.jsx';

const MaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 50,
    material_type: '',
    search: '',
    sort_by: 'count_left',
    sort_order: 'asc',
  });
  const [quantityInputs, setQuantityInputs] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialsApi.getMaterials(filters);
      setMaterials(response.data.items || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      alert('Ошибка при загрузке материалов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [filters]);

  // Обработчики фильтров и сортировки
  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSortByName = () => {
    setFilters((prev) => ({
      ...prev,
      sort_by: 'name',
      sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSortByCount = () => {
    setFilters((prev) => ({
      ...prev,
      sort_by: 'count_left',
      sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Обработчики количества
  const handleQuantityChange = (materialId, value) => {
    setQuantityInputs((prev) => ({
      ...prev,
      [materialId]: parseInt(value) || 0,
    }));
  };

  const handleAddQuantity = async (materialId) => {
    const quantity = quantityInputs[materialId] || 0;
    if (quantity <= 0) {
      alert('Введите количество больше 0');
      return;
    }

    setUpdatingId(materialId);
    try {
      await materialsApi.changeMaterialCount(materialId, { delta: quantity });
      await loadMaterials();
      setQuantityInputs((prev) => ({ ...prev, [materialId]: 0 }));
    } catch (error) {
      console.error('Ошибка при добавлении:', error);
      alert('Ошибка при добавлении количества');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveQuantity = async (materialId) => {
    const quantity = quantityInputs[materialId] || 0;
    if (quantity <= 0) {
      alert('Введите количество больше 0');
      return;
    }

    setUpdatingId(materialId);
    try {
      await materialsApi.changeMaterialCount(materialId, { delta: -quantity });
      await loadMaterials();
      setQuantityInputs((prev) => ({ ...prev, [materialId]: 0 }));
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Ошибка при удалении количества');
    } finally {
      setUpdatingId(null);
    }
  };

  // Обработчики создания материала
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleMaterialCreated = (newMaterial) => {
    setMaterials((prev) => [newMaterial, ...prev]);
    handleCloseCreateModal();
  };

  // Обработчики редактирования материала
  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMaterial(null);
  };

  const handleMaterialUpdated = (updatedMaterial) => {
    setMaterials((prev) =>
      prev.map((material) =>
        material.id === updatedMaterial.id ? updatedMaterial : material
      )
    );
    handleCloseEditModal();
  };

  // Обработчик удаления материала
  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      return;
    }

    try {
      await materialsApi.deleteMaterial(materialId);
      setMaterials((prev) =>
        prev.filter((material) => material.id !== materialId)
      );
    } catch (error) {
      console.error('Ошибка при удалении материала:', error);
      alert('Ошибка при удалении материала');
    }
  };

  // Вспомогательные функции
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' UZS';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: 'Неактивен', color: 'bg-gray-100 text-gray-800' },
      1: { label: 'Активен', color: 'bg-green-100 text-green-800' },
    };
    const config = statusConfig[status] || statusConfig[0];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (filters.sort_by !== field) return '↕️';
    return filters.sort_order === 'asc' ? '⬆️' : '⬇️';
  };

  return (
    <div className="p-6">
      {/* Фильтры и кнопки */}
      <MaterialFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReload={loadMaterials}
        getSortIcon={getSortIcon}
        onSortByName={handleSortByName}
        onSortByCount={handleSortByCount}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Список материалов */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Загрузка материалов...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">Материалы не найдены</p>
              <p className="text-gray-400">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            materials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                quantityInputs={quantityInputs}
                updatingId={updatingId}
                onQuantityChange={handleQuantityChange}
                onAddQuantity={handleAddQuantity}
                onRemoveQuantity={handleRemoveQuantity}
                onEditMaterial={handleEditMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                formatPrice={formatPrice}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </div>
      )}

      {/* Пагинация */}
      {materials.length > 0 && (
        <MaterialPagination
          filters={filters}
          materials={materials}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {/* Модальные окна */}
      <CreateMaterialModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onMaterialCreated={handleMaterialCreated}
      />

      <EditMaterialModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        material={editingMaterial}
        onMaterialUpdated={handleMaterialUpdated}
      />
    </div>
  );
};

export default MaterialPage;
