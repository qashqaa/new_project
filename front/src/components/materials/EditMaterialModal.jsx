import React, { useState, useEffect } from 'react'
import { materialsApi } from '../../api/client.js'

const EditMaterialModal = ({ isOpen, onClose, material, onMaterialUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        material_type: '',
        detail: '',
        description: '',
        count_in_one_pack: '',
        pack_price: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (material) {
            setFormData({
                name: material.name || '',
                material_type: material.material_type || '',
                detail: material.detail || '',
                description: material.description || '',
                count_in_one_pack: material.count_in_one_pack?.toString() || '',
                pack_price: material.pack_price?.toString() || '',
            })
        }
    }, [material])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!material) return

        setLoading(true)
        try {
            const submitData = {}

            // Только измененные поля
            if (formData.name !== material.name) submitData.name = formData.name
            if (formData.material_type !== material.material_type) submitData.material_type = formData.material_type
            if (parseInt(formData.count_in_one_pack) !== material.count_in_one_pack)
                submitData.count_in_one_pack = parseInt(formData.count_in_one_pack)
            if (parseFloat(formData.pack_price) !== material.pack_price)
                submitData.pack_price = parseFloat(formData.pack_price)

            // Для detail и description - только если не пустые и изменились
            if (formData.detail !== (material.detail || '')) {
                submitData.detail = formData.detail.trim() === '' ? null : formData.detail
            }
            if (formData.description !== (material.description || '')) {
                submitData.description = formData.description.trim() === '' ? null : formData.description
            }

            console.log('📤 Отправляемые данные:', JSON.stringify(submitData, null, 2))

            // Если ничего не изменилось
            if (Object.keys(submitData).length === 0) {
                onClose()
                return
            }

            const response = await materialsApi.updateMaterial(material.id, submitData)
            onMaterialUpdated(response.data)
        } catch (error) {
            console.error('❌ Ошибка:', error.response?.data || error)
            alert(`Ошибка: ${JSON.stringify(error.response?.data?.detail || error.message)}`)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (!isOpen || !material) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Редактировать материал</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Тип материала */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Тип материала *
                        </label>
                        <select
                            name="material_type"
                            value={formData.material_type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Выберите тип</option>
                            <option value="бумага">Бумага</option>
                            <option value="дизайнерская бумага">Дизайнерская бумага</option>
                            <option value="ленты">Ленты</option>
                            <option value="биркодержатели">Биркодержатели</option>
                            <option value="риббон">Риббон</option>
                            <option value="структурная бумага">Структурная бумага</option>
                            <option value="другое">Другое</option>
                        </select>
                    </div>

                    {/* Детали */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Детали
                        </label>
                        <input
                            type="text"
                            name="detail"
                            value={formData.detail}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Дополнительная информация"
                        />
                    </div>

                    {/* Описание */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Описание
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Описание материала"
                        />
                    </div>

                    {/* Количество в упаковке и цена */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                В упаковке *
                            </label>
                            <input
                                type="number"
                                name="count_in_one_pack"
                                value={formData.count_in_one_pack}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Цена упаковки (UZS) *
                            </label>
                            <input
                                type="number"
                                name="pack_price"
                                value={formData.pack_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    {/* Статус (если есть в API) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Статус
                        </label>
                        <select
                            name="status"
                            value={formData.status || material.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={1}>Активен</option>
                            <option value={0}>Неактивен</option>

                        </select>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditMaterialModal