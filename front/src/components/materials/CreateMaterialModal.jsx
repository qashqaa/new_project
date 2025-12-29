import React, { useState } from 'react'
import { materialsApi } from '../../api/client.js'

const CreateMaterialModal = ({ isOpen, onClose, onMaterialCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        material_type: '',
        detail: '',
        description: '',
        count_in_one_pack: '',
        pack_price: '',  // ← меняем на пустую строку вместо 0
        count_left: ''   // ← и здесь тоже
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Конвертируем строки в числа перед отправкой
            const submitData = {
                ...formData,
                count_in_one_pack: parseInt(formData.count_in_one_pack) || 1,
                pack_price: parseFloat(formData.pack_price) || 0,
                count_left: parseInt(formData.count_left) || 0
            }

            const response = await materialsApi.createMaterial(submitData)
            const newMaterial = response.data
            onMaterialCreated(newMaterial)
            onClose()

            // Сбрасываем форму
            setFormData({
                name: '',
                material_type: '',
                detail: '',
                description: '',
                count_in_one_pack: '',
                pack_price: '',  // ← пустые строки
                count_left: ''
            })
        } catch (error) {
            console.error('Ошибка при создании материала:', error)
            alert('Ошибка при создании материала')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value  // ← сохраняем как строку
        }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Добавить материал</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            placeholder="Введите название материала"
                        />
                    </div>

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
                            <option value="биркодержатели">Биркодержатели</option>
                            <option value="бумага">Бумага</option>
                            <option value="дизайнерская бумага">Дизайнерская бумага</option>
                            <option value="ленты">Ленты</option>
                            <option value="риббон">Риббон</option>
                            <option value="структурная бумага">Структурная бумага</option>
                            <option value="другое">Другое</option>
                        </select>
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Начальный остаток *
                        </label>
                        <input
                            type="number"
                            name="count_left"
                            value={formData.count_left}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

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
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                            {loading ? 'Создание...' : 'Создать материал'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateMaterialModal