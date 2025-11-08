import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import DroppableColumn from "./DroppableColumn";
import TaskCard from "../ui/TaskCard";

export default function BoardUI({ columns, activeId, getTaskContentById,  }) {
  return (
    <>   
      <div className="flex  gap-4 p-4 ">
        {/* render columns */}
        {columns?.map((col) => (
          <DroppableColumn
          key={col.id}
          columnId={col.id}
          title={col.name}
          tasks={col.tasks.sort((a, b) => a.order - b.order)} // pass tasks
          />
        ))}
      </div>
      
      {/* DragOverlay: shows the item being dragged */}
      <DragOverlay>
        {activeId ? (
          <div className=" -rotate-z-3 transition -all duration- 750">

            <TaskCard key={activeId} id={activeId} task={getTaskContentById(columns, activeId)} />
          </div>) : null}
      </DragOverlay>
        </>
  );
}
