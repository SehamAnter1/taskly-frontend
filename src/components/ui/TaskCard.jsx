import { Badge, Calendar, GripVertical, MessageCircle, Paperclip } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TaskCard({ id, task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id :id,  transition: {
  
  }, activationConstraint: {
    distance: 58, // only drag if mouse moves 10px
  }
});

  const style = {
    transform: CSS.Transform.toString(transform),
     transition: isDragging 
    ? 'none' 
    : 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)', 
    easing: isDragging&&'cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
     id={task.id} 
       style={style}
      {...listeners}
      {...attributes}
            onClick={() => console.log("Clicked task", task)}

      className={` ${transform?" !cursor-grabbing":"cursor-move"}  rounded-md border my-2 overflow-hidden grid gap-2 transition-all duration-300 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xs hover:bg-white/70 dark:hover:bg-neutral-700/70`}
    >
      {task.img && (
        <img
          src={task.img}
          alt={task.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="space-y-4 p-4 text-start">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
            {task.title}
          </h4>
          <GripVertical className="w-5 h-5 text-neutral-500 dark:text-neutral-400 cursor-move" />
        </div>

        {task.description && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {task.description}
          </p>
        )}

        {task.tags && (
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                className="text-xs bg-neutral-100/60 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border-neutral-200/50 dark:border-neutral-600/50 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/30 dark:border-neutral-700/30">
          <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Jan 15</span>
              </div>
            )}
            {task.comments && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{task.comments}</span>
              </div>
            )}
            {task.attachments && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-4 h-4" />
                <span className="text-xs font-medium">{task.attachments}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
