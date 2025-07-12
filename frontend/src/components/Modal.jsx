// src/components/Modal.jsx
import React from 'react'

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded p-4 max-w-4xl max-h-[90vh] overflow-auto"
            >
                <button
                    onClick={onClose}
                    className="text-red-600 mb-4 float-right font-bold text-xl"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    )
}

export default Modal
