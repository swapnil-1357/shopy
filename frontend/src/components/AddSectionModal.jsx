// filepath: shopy-frontend/src/components/AddSectionModal.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AddSectionModal = ({ isOpen, onClose, onAddSection }) => {
    const [sectionName, setSectionName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (sectionName.trim()) {
            onAddSection(sectionName.trim());
            setSectionName('');
            onClose();
        } else {
            alert('Section name cannot be empty');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <h2 className="text-2xl font-semibold mb-4">Add New Section</h2>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-xl font-bold hover:text-red-500"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sectionName">
                            Section Name
                        </label>
                        <Input
                            id="sectionName"
                            type="text"
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                            className="border px-3 py-2 rounded w-full"
                            placeholder="Enter section name"
                            autoFocus
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Add Section
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddSectionModal;