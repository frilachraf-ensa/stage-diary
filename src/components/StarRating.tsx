import { Star } from "lucide-react";

export default function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "sm",
}: {
  rating: number;
  onChange?: (r: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const px = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <Star
            className={`${px} ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}
