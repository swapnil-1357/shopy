// src/components/Modal.jsx
import React, { useEffect } from 'react'

const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded p-6 max-w-4xl max-h-[90vh] overflow-auto relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-red-600 font-bold text-2xl"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    )
}

export default Modal
