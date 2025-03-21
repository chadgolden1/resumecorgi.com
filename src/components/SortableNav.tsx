import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavSection } from '../types';

interface SortableNavItemProps {
  id: string;
  section: NavSection;
  onSelected: (sectionId: string) => void;
  onRemoved: (sectionId: string) => void;
}

interface SortableNavProps {
  sections: NavSection[];
  handleMoveTo: (oldIndex: number, newIndex: number) => void;
  handleSelected: (sectionId: string, checked: boolean) => void;
  handleRemoved: (sectionId: string) => void;
}

const SortableNavItem: React.FC<SortableNavItemProps> = ({ id, section, onSelected, onRemoved }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const anchorCss = `w-full py-1 hover:underline`;

  if (!section.sortable) {
    return (
      <div ref={setNodeRef} className={`relative block group/sections mb-[0.5rem]`}>
        <span className="
          absolute top-0 left-0 
          w-full h-full 
          mt-[0.2rem] ms-[0.2rem]
          bg-black
          rounded-lg
          group-hover/sections:translate-x-[3px] group-hover/sections:translate-y-[1px]
          transition
          duration-150
        "></span>
        <div
          className={`
            bg-white dark:bg-zinc-700
            group-active/sections:bg-gray-100 dark:group-active/sections:bg-zinc-600
            relative w-full
            ps-3 pe-1.5 py-1
            font-bold text-black dark:text-white
            border-1 border-black rounded-[0.45rem]
          `}>
          <div className="flex justify-between items-center w-full">
            <a href={section.href} className={`${anchorCss}`}>{section.displayName || "Section"}</a>
            <div className="p-2 rounded-full invisible">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative block group/sections mb-[0.5rem]`}
    >
      <span className="
        absolute top-0 left-0 
        w-full h-full 
        mt-[0.2rem] ms-[0.2rem]
        bg-black
        rounded-lg
        group-hover/sections:translate-x-[3px] group-hover/sections:translate-y-[1px]
        transition
        duration-150
      "></span>
      <div
        className={`
          bg-white dark:bg-zinc-700
          group-active/sections:bg-gray-100 dark:group-active/sections:bg-zinc-600
          relative w-full
          ps-3 pe-1.5 py-1
          font-bold text-black dark:text-white
          border-1 border-black rounded-[0.45rem]
        `}
      >
        <div className="flex justify-between items-center w-full">
          <a href={section.href} className={`${anchorCss}`}>{section.displayName || "Section Title"}</a>
          
          {section.removeable && (
            <div
              className="p-2 rounded-full hover:cursor-pointer"
              onClick={() => onRemoved(id)}
              tabIndex={0}
              title={`Remove ${section.displayName}`}
            >

              <span className="sr-only">{`Remove ${section.displayName}`}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-eye size-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
          )}

          {!section.required && (
            <div 
              className="p-2 rounded-full hover:cursor-pointer"
              onClick={() => onSelected(id)}
              tabIndex={0}
              title={section.selected ? `Hide ${section.displayName}` : `Show ${section.displayName}`}
            >

              <span className="sr-only">
                {section.selected ? `Hide ${section.displayName}` : `Show ${section.displayName}`}
              </span>
              {section.selected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye size-4"
                  >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
              )}

              {!section.selected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye-off size-4"
                  >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                  <path d="m2 2 20 20"/>
                </svg>
              )}
            </div>
          )}

          {section.sortable && (
            <div 
              className="p-2 rounded-full hover:cursor-grab"
              title={`Reorder ${section.displayName}`}
              {...listeners}
              {...attributes}
            >
              <span className="sr-only">{`Reorder ${section.displayName}`}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="size-4"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" 
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SortableNav: React.FC<SortableNavProps> = ({ sections, handleMoveTo, handleSelected, handleRemoved }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);

      if (!sections[newIndex].sortable) return;

      handleMoveTo(oldIndex, newIndex);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sections.map(section => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {sections.map((section) => (
            <SortableNavItem 
              key={section.id} 
              id={section.id} 
              section={section}
              onSelected={() => handleSelected(section.id, !section.selected)}
              onRemoved={() => handleRemoved(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableNav;