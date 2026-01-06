import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import OrderPage from "./pages/OrderPage";
import ProductPage from "./pages/ProductPage.jsx";
import MaterialPage from "./pages/MaterialPage.jsx";
import ExpensesPage from "./pages/ExpensesPage";
import StatisticsPage from './pages/StatisticsPage.jsx';

function App() {
    return (
        <Router>
            <div className="flex min-h-screen bg-blue-50">
                {/* Боковая навигация */}
                <Sidebar />

                {/* Основной контент */}
                <main className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="/orders" element={<OrderPage />} />
                        <Route path="/products" element={<ProductPage />} />
                        <Route path="/materials" element={<MaterialPage />} />
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/statistics" element={<StatisticsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}

export default App