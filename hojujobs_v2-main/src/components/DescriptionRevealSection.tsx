import { Eye } from "lucide-react";
import { splitDescriptionPreview, useListingReveal } from "@/hooks/useListingReveal";
import { cn } from "@/lib/utils";

type DescriptionRevealSectionProps = {
  description: string;
  className?: string;
  headingClassName?: string;
  bodyClassName?: string;
};

function RevealOverlay() {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-lg",
        "bg-card/60 backdrop-blur-[2px]",
        "transition-opacity duration-300 ease-out opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-2.5 px-6 py-4 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Eye className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-foreground">연락처 확인하기</span>
      </div>
    </div>
  );
}

export function DescriptionRevealSection({
  description,
  className,
  headingClassName,
  bodyClassName,
}: DescriptionRevealSectionProps) {
  const { revealed, interactiveProps } = useListingReveal();
  const { preview, remainder } = splitDescriptionPreview(description);

  if (!description.trim()) return null;

  return (
    <div
      {...interactiveProps}
      className={cn(className, interactiveProps.className)}
    >
      <h2 className={headingClassName}>상세 내용</h2>
      {revealed ? (
        <div className={bodyClassName}>{description}</div>
      ) : (
        <div className={bodyClassName}>
          <div className="whitespace-pre-line break-words [overflow-wrap:anywhere]">{preview}</div>
          {remainder && (
            <div className="relative min-h-[5rem]">
              <div className="blur-md select-none pointer-events-none whitespace-pre-line break-words [overflow-wrap:anywhere]">
                {remainder}
              </div>
              <RevealOverlay />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
