import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BarChart2, LogOut, PlusCircle } from 'lucide-react';

const Navbar = ({
    onAnalytics,
    onPendingCart,
    onLogout,
    onAddSection,
    onAddProduct,
    showAddProduct,
    disableAddProduct
}) => {
    return (
        <nav className="bg-white shadow flex items-center justify-between px-8 py-4 mb-8">
            <div className="text-2xl font-bold text-blue-700">Shopy</div>
            <div className="flex gap-4 items-center">
                {/* Show Add Section and Add Product only for owner */}
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
                <Button
                    variant="ghost"
                    onClick={onAnalytics}
                    title="Analytics"
                >
                    <BarChart2 size={22} />
                </Button>
                <Button
                    variant="ghost"
                    onClick={onPendingCart}
                    title="Pending Cart"
                >
                    <ShoppingCart size={22} />
                </Button>
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    title="Logout"
                >
                    <LogOut size={22} />
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;