import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition
} from '@headlessui/react'
import { TrashIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'

export default function SectionDropdown({
  sections,
  selectedSection,
  setSelectedSection,
  onDeleteSection
}) {
  return (
    <div className="w-64">
      <Listbox value={selectedSection} onChange={setSelectedSection}>
        <div className="relative">
          <ListboxButton className="w-full border-2 border-blue-700 rounded-lg px-4 py-2 text-left bg-white font-semibold text-blue-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span>{selectedSection || "All Sections"}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronUpDownIcon className="h-5 w-5 text-blue-700" />
            </span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black/5 max-h-60 overflow-auto focus:outline-none">
              <ListboxOption value="">
                {({ selected, active }) => (
                  <div className={`flex justify-between px-4 py-2 ${active ? 'bg-blue-100' : ''}`}>
                    <span className="truncate">All Sections</span>
                    {selected && <CheckIcon className="w-4 h-4 text-blue-700" />}
                  </div>
                )}
              </ListboxOption>

              {sections.map(section => (
                <ListboxOption key={section} value={section}>
                  {({ selected, active }) => (
                    <div className={`flex justify-between items-center px-4 py-2 ${active ? 'bg-blue-100' : ''}`}>
                      <span className="truncate">
                        {section}
                        {selected && <CheckIcon className="w-4 h-4 text-blue-700 inline ml-1" />}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          console.log("Deleting section:", section); // 🧪 debug log
                          onDeleteSection(section)
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete section"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
