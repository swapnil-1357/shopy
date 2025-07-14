// src/components/Navbar.js

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, PlusCircle, LogOut, BarChart2, TimerReset } from 'lucide-react'

const Navbar = ({
    appName = 'Shopy',
    role,
    cart = [],
    cartCount = 0,
    showAddProduct = false,
    disableAddProduct = false,
    onAddSection,
    onAddProduct,
    onCartSubmit,
    onCartUpdate,
    onAnalytics,
    onPendingCart,
    onLogout,
}) => {
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [cartSearch, setCartSearch] = useState('')

    const filteredCart = cart.filter(item =>
        item.name.toLowerCase().includes(cartSearch.toLowerCase())
    )

    return (
        <>
            <nav className="bg-white shadow flex items-center justify-between px-8 py-4 mb-8">
                <div className="text-2xl font-bold text-blue-700">{appName}</div>

                <div className="flex gap-4 items-center">
                    {showAddProduct && (
                        <>
                            <Button
                                variant="outline"
                                onClick={onAddSection}
                                title="Add Section"
                                className="flex gap-2 items-center"
                            >
                                <PlusCircle size={18} />
                                Add Section
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onAddProduct}
                                title="Add Product"
                                className="flex gap-2 items-center"
                                disabled={disableAddProduct}
                            >
                                <PlusCircle size={18} />
                                Add Product
                            </Button>
                        </>
                    )}

                    <Button variant="ghost" onClick={onAnalytics} title="Analytics">
                        <BarChart2 size={32} />
                    </Button>

                    <Button variant="ghost" onClick={onPendingCart} title="Pending Cart">
                        <TimerReset size={32} />
                    </Button>

                    {role === 'employee' && (
                        <button className="relative" onClick={() => setIsCartOpen(true)} title="Cart">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    <Button variant="ghost" onClick={onLogout} title="Logout">
                        <LogOut size={22} />
                    </Button>
                </div>
            </nav>

            {/* Employee Cart Modal */}
            {role === 'employee' && (
                <Dialog open={isCartOpen} onClose={() => setIsCartOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-lg overflow-hidden">
                            <Dialog.Title className="text-lg font-semibold mb-4 flex justify-between">
                                🛒 Your Cart
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-600 hover:text-black">✖</button>
                            </Dialog.Title>

                            <input
                                type="text"
                                placeholder="Search cart items..."
                                value={cartSearch}
                                onChange={e => setCartSearch(e.target.value)}
                                className="border w-full mb-4 p-2 rounded"
                            />

                            {filteredCart.length === 0 ? (
                                <p className="text-muted-foreground">No items in cart</p>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto space-y-4">
                                    {filteredCart.map(item => (
                                        <div key={item._id} className="flex justify-between items-center border rounded p-3">
                                            <div className="flex items-center space-x-4">
                                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <button
                                                            onClick={() => onCartUpdate(item._id, 'decrement')}
                                                            disabled={item.quantity <= 1}
                                                            className="px-2 border rounded"
                                                        >–</button>
                                                        <span>{item.quantity}</span>
                                                        <button
                                                            onClick={() => onCartUpdate(item._id, 'increment')}
                                                            className="px-2 border rounded"
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onCartUpdate(item._id, 'remove')}
                                                className="text-red-500 hover:underline text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Totals */}
                            <div className="mt-6 pt-4 border-t text-right space-y-2">
                                <p className="font-medium">🧾 Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                <p className="font-semibold text-lg">💰 Total: ₹{cart.reduce((sum, item) => sum + item.quantity * item.price, 0)}</p>
                                <Button className="mt-2" onClick={() => {
                                    onCartSubmit()
                                    setIsCartOpen(false)
                                }}>
                                    Submit Sale Request
                                </Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </>
    )
}

export default Navbar
