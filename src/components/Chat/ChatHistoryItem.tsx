// components/chat/ChatHistoryItem.tsx
import { MessageSquare, MoreVertical } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHistoryItemProps {
  title: string;
  date: string;
  active?: boolean;
}

export function ChatHistoryItem({ title, date, active = false }: ChatHistoryItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md px-2 py-2 mb-1 group",
        active ? "bg-accent" : "hover:bg-muted"
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <MessageSquare className="h-4 w-4 shrink-0" />
        <div className="truncate">
          <p className="truncate text-sm">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{date}</p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>تعديل</DropdownMenuItem>
          <DropdownMenuItem>أرشفة</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}