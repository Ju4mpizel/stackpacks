import { cn } from "@/lib/cn";
import "./pack.css";

/** Reverso de carta con la marca propia y el color de la serie. Decorativo. */
export function CardBack({ series, className }) {
  return (
    <div className={cn("sp-back", className)} style={{ "--series": series.color }} aria-hidden="true">
      <div className="sp-back-inner">
        <div className="sp-back-logo">
          <span className="sp-back-mark">SP</span>
          <span className="sp-back-word">StackPacks</span>
        </div>
        <span className="sp-back-corner" style={{ top: "4cqw", left: "4cqw", rotate: "-4deg" }}>
          {"</>"}
        </span>
        <span className="sp-back-corner" style={{ bottom: "4cqw", right: "4cqw", rotate: "3deg" }}>
          {"{ }"}
        </span>
      </div>
    </div>
  );
}
